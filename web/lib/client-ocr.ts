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

const normalizeDate = (value: string) => {
  const numeric = value.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
  if (numeric) return `${numeric[1].padStart(2, "0")}/${numeric[2].padStart(2, "0")}/${numeric[3]}`;
  const written = value.match(/(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
  if (written) return `${written[1].padStart(2, "0")}/${written[2].padStart(2, "0")}/${written[3]}`;
  return clean(value);
};

const allMatches = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map(match => clean(match[1] ?? ""));

function parseItems(text: string) {
  const units = "chiếc|cái|bộ|hộp|thùng|kg|gói|chai|dịch vụ|lần|tháng|cây|quyển|tờ";
  const itemPattern = new RegExp(
    `^\\s*\\d+\\s+(.+?)\\s+(${units})\\s+([\\d.,]+)\\s+([\\d.,]+)\\s+([\\d.,]+)\\s*$`,
    "i",
  );
  return text.split(/\r?\n/).flatMap(line => {
    const match = clean(line).match(itemPattern);
    if (!match) return [];
    return [{
      name: clean(match[1]),
      unit: clean(match[2]),
      quantity: numberValue(match[3]),
      unitPrice: numberValue(match[4]),
      amount: numberValue(match[5]),
      taxRate: 0,
    }];
  });
}

function parseInvoice(text: string, file: File): Omit<OcrDocument, "id" | "sourceUrl"> {
  const upper = text.toUpperCase();
  const type = upper.includes("PHIẾU GIAO HÀNG") ? "Phiếu giao hàng"
    : upper.includes("PHIẾU NHẬP KHO") ? "Phiếu nhập kho"
    : upper.includes("PHIẾU XUẤT KHO") ? "Phiếu xuất kho"
    : upper.includes("HÓA ĐƠN BÁN HÀNG") || upper.includes("HOA DON BAN HANG") ? "Hóa đơn bán hàng"
    : upper.includes("HÓA ĐƠN") || upper.includes("HOA DON") ? "Hóa đơn VAT"
    : "Chứng từ khác";
  const taxCodes = allMatches(text, /(?:mã số thuế|mst|tax code)\s*[:：]?\s*([0-9O][0-9O\-.\s]{8,16})/gi)
    .map(value => value.replace(/[O]/gi, "0").replace(/[\s.]/g, ""));
  const taxCode = taxCodes[0] || "";
  const buyerTaxCode = taxCodes[1] || "";
  const date = normalizeDate(find(text, [
    /(?:ngày|date)\s*[:：]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
    /ngày\s+(\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{4})/i,
  ]));
  const number = find(text, [
    /^\s*số\s*[:：]\s*([0-9O]{5,20})\s*$/im,
    /(?:số hóa đơn|invoice\s*no)\s*[:：]?\s*([A-Z0-9\-\/]{3,30})/i,
  ]).replace(/O/gi, "0");
  const symbol = find(text, [/(?:ký hiệu|serial)\s*[:：]?\s*([A-Z0-9\-\/]{3,30})/i]);
  const vendor = find(text, [
    /(?:đơn vị bán hàng|đơn vị bán|tên người bán|seller)\s*[:：]?\s*([^\n]{3,120})/i,
    /((?:CÔNG TY|CTY|HỘ KINH DOANH)[^\n]{3,120})/i,
  ]);
  const addresses = allMatches(text, /(?:địa chỉ|address)\s*[:：]?\s*([^\n]{5,180})/gi);
  const address = addresses[0] || "";
  const buyer = find(text, [
    /(?:tên đơn vị|đơn vị mua|tên người mua|buyer)\s*[:：]?\s*([^\n]{3,120})/i,
    /họ tên người mua hàng\s*[:：]?\s*([^\n]{3,120})/i,
  ]);
  const totalRaw = find(text, [
    /(?:tổng tiền thanh toán|tổng cộng thanh toán|tổng thanh toán|total payment|grand total)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i,
  ]);
  const taxRaw = find(text, [/(?:tiền thuế gtgt|tiền thuế vat|vat amount)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i]);
  const subtotalRaw = find(text, [/(?:cộng tiền hàng|tổng tiền trước thuế|subtotal)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i]);
  const subtotal = numberValue(subtotalRaw);
  const taxAmount = numberValue(taxRaw);
  const amount = numberValue(totalRaw) || subtotal + taxAmount;
  const items = parseItems(text);
  const warnings: string[] = [];
  if (!number) warnings.push("Không nhận dạng chắc chắn số chứng từ.");
  if (!taxCode) warnings.push("Không tìm thấy mã số thuế người bán.");
  if (!amount) warnings.push("Không nhận dạng được tổng tiền thanh toán.");
  if (!items.length) warnings.push("Chưa tách được bảng hàng hóa; vui lòng kiểm tra và thêm dòng nếu cần.");
  if (subtotal && taxAmount && amount && Math.abs(subtotal + taxAmount - amount) > 10) warnings.push("Tổng trước thuế + tiền thuế không khớp tổng thanh toán.");
  const itemTotal = items.reduce((sum, item) => sum + item.amount, 0);
  if (itemTotal && amount && Math.abs(itemTotal - amount) > 10) warnings.push("Tổng các dòng hàng không khớp tổng thanh toán.");

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
    buyer,
    buyerTaxCode,
    subtotal,
    taxAmount,
    currency: "VND",
    warnings,
    items,
  };
}

function enhanceCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", {willReadFrequently: true});
  if (!context) return canvas;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = image.data[index] * .299 + image.data[index + 1] * .587 + image.data[index + 2] * .114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.45 + 145));
    image.data[index] = contrasted;
    image.data[index + 1] = contrasted;
    image.data[index + 2] = contrasted;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(1, Math.min(2.5, 2000 / bitmap.width));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không hỗ trợ Canvas.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return enhanceCanvas(canvas);
}

export async function recognizeDocument(file: File, progress: Progress): Promise<Omit<OcrDocument, "id" | "sourceUrl">> {
  progress(2, "Đang nạp OCR mã nguồn mở...");
  const {createWorker} = await import("tesseract.js");
  const worker = await createWorker("vie+eng", 1, {
    logger: message => {
      if (message.status === "recognizing text") progress(Math.round(10 + message.progress * 80), "Đang nhận dạng chữ...");
    },
  });
  await worker.setParameters({preserve_interword_spaces: "1"});
  let text = "";
  const confidences: number[] = [];
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
        const result = await worker.recognize(enhanceCanvas(canvas));
        text += `\n${result.data.text}`;
        confidences.push(result.data.confidence);
      }
    } else {
      const result = await worker.recognize(await prepareImage(file));
      text = result.data.text;
      confidences.push(result.data.confidence);
    }
  } finally {
    await worker.terminate();
  }
  progress(94, "Đang tách dữ liệu hóa đơn...");
  if (!text.trim()) throw new Error("Không đọc được chữ trong chứng từ. Hãy thử ảnh rõ hơn.");
  const result = parseInvoice(text, file);
  if (confidences.length) {
    result.confidence = Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length);
  }
  progress(100, "Hoàn tất");
  return result;
}
