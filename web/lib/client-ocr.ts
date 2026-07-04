"use client";

import type { OcrDocument } from "./documents";

type Progress = (percent: number, label: string) => void;

const clean = (value = "") => value.replace(/\s+/g, " ").trim();
const numberValue = (value = "") => {
  const normalized = value.replace(/[^\d.,-]/g, "");
  if (!normalized) return 0;
  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);
  const hasDecimal = decimalIndex >= 0 && normalized.length - decimalIndex - 1 <= 2;
  const integer = hasDecimal ? normalized.slice(0, decimalIndex) : normalized;
  const decimal = hasDecimal ? normalized.slice(decimalIndex + 1) : "";
  return Number(`${integer.replace(/[.,]/g, "")}${decimal ? `.${decimal}` : ""}`) || 0;
};
const find = (text: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return clean(match[1]);
  }
  return "";
};

function parseInvoice(text: string, file: File): Omit<OcrDocument, "id" | "sourceUrl"> {
  const upper = text.toUpperCase();
  const type = upper.includes("PHIẾU GIAO HÀNG") ? "Phiếu giao hàng"
    : upper.includes("PHIẾU NHẬP KHO") ? "Phiếu nhập kho"
    : upper.includes("PHIẾU XUẤT KHO") ? "Phiếu xuất kho"
    : upper.includes("HÓA ĐƠN") || upper.includes("HOA DON") ? "Hóa đơn VAT"
    : "Chứng từ khác";
  const taxCode = find(text, [
    /(?:mã số thuế|mst|tax code)\s*[:：]?\s*([0-9O][0-9O\-.\s]{8,16})/i,
  ]).replace(/[O]/gi, "0").replace(/[\s.]/g, "");
  const date = find(text, [
    /(?:ngày|date)\s*[:：]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
    /(ngày\s+\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{4})/i,
  ]).replace(/^ngày\s+/i, "");
  const number = find(text, [
    /(?:số hóa đơn|invoice\s*no|số|no)\s*[:：]?\s*([A-Z0-9\-\/]{3,30})/i,
  ]);
  const symbol = find(text, [/(?:ký hiệu|serial)\s*[:：]?\s*([A-Z0-9\-\/]{3,30})/i]);
  const vendor = find(text, [
    /(?:đơn vị bán hàng|tên người bán|seller)\s*[:：]?\s*([^\n]{3,120})/i,
    /((?:CÔNG TY|CTY|HỘ KINH DOANH)[^\n]{3,120})/i,
  ]);
  const address = find(text, [/(?:địa chỉ|address)\s*[:：]?\s*([^\n]{5,180})/i]);
  const totalRaw = find(text, [
    /(?:tổng tiền thanh toán|tổng cộng thanh toán|tổng thanh toán|total payment|grand total)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i,
  ]);
  const taxRaw = find(text, [/(?:tiền thuế gtgt|tiền thuế vat|vat amount)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i]);
  const subtotalRaw = find(text, [/(?:cộng tiền hàng|tổng tiền trước thuế|subtotal)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i]);
  const subtotal = numberValue(subtotalRaw);
  const taxAmount = numberValue(taxRaw);
  const amount = numberValue(totalRaw) || subtotal + taxAmount;
  const warnings: string[] = [];
  if (!number) warnings.push("Không nhận dạng chắc chắn số chứng từ.");
  if (!taxCode) warnings.push("Không tìm thấy mã số thuế người bán.");
  if (!amount) warnings.push("Không nhận dạng được tổng tiền thanh toán.");
  if (subtotal && taxAmount && amount && Math.abs(subtotal + taxAmount - amount) > 10) warnings.push("Tổng trước thuế + tiền thuế không khớp tổng thanh toán.");

  return {
    file: file.name,
    fileType: file.type,
    type,
    number: number || "Chưa nhận dạng",
    vendor: vendor || "Chưa nhận dạng",
    taxCode,
    date,
    amount,
    status: warnings.length > 2 ? "NEED_CORRECTION" : "WAITING_REVIEW",
    confidence: Math.max(35, 95 - warnings.length * 15),
    symbol,
    address,
    subtotal,
    taxAmount,
    currency: "VND",
    warnings,
    items: [],
  };
}

export async function recognizeDocument(file: File, progress: Progress): Promise<Omit<OcrDocument, "id" | "sourceUrl">> {
  progress(2, "Đang nạp OCR mã nguồn mở...");
  const {createWorker} = await import("tesseract.js");
  const worker = await createWorker("vie+eng", 1, {
    logger: message => {
      if (message.status === "recognizing text") progress(Math.round(10 + message.progress * 80), "Đang nhận dạng chữ...");
    },
  });
  let text = "";
  try {
    if (file.type === "application/pdf") {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const pdf = await pdfjs.getDocument({data: new Uint8Array(await file.arrayBuffer())}).promise;
      const pages = Math.min(pdf.numPages, 10);
      for (let index = 1; index <= pages; index++) {
        progress(Math.round((index - 1) / pages * 80), `Đang đọc trang ${index}/${pages}...`);
        const page = await pdf.getPage(index);
        const content = await page.getTextContent();
        const nativeText = content.items.map(item => "str" in item ? item.str : "").join(" ");
        if (nativeText.trim().length > 80) {
          text += `\n${nativeText}`;
          continue;
        }
        const viewport = page.getViewport({scale: 2});
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Trình duyệt không hỗ trợ Canvas.");
        await page.render({canvasContext: context, viewport}).promise;
        const result = await worker.recognize(canvas);
        text += `\n${result.data.text}`;
      }
    } else {
      const result = await worker.recognize(file);
      text = result.data.text;
    }
  } finally {
    await worker.terminate();
  }
  progress(94, "Đang tách dữ liệu hóa đơn...");
  if (!text.trim()) throw new Error("Không đọc được chữ trong chứng từ. Hãy thử ảnh rõ hơn.");
  const result = parseInvoice(text, file);
  progress(100, "Hoàn tất");
  return result;
}
