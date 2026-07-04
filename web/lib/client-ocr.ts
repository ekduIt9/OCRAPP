"use client";

import type { OcrDocument } from "./documents";

type Progress = (percent: number, label: string) => void;

const clean = (value = "") => value.replace(/\s+/g, " ").trim();
const fold = (value = "") => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/gi, "d")
  .replace(/\bhoa\s+pon\b/gi, "hoa don")
  .replace(/\bpon\s+vi\s+ban\b/gi, "don vi ban")
  .replace(/\bs[óo6]\b/gi, "so")
  .toLowerCase();
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
  const written = fold(value).match(/(\d{1,2})\s*thang\s*(\d{1,2})\s*nam\s*(\d{4})/i);
  if (written) return `${written[1].padStart(2, "0")}/${written[2].padStart(2, "0")}/${written[3]}`;
  return clean(value);
};

const allMatches = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map(match => clean(match[1] ?? ""));

function lineValue(text: string, labels: string[]) {
  for (const line of text.split(/\r?\n/)) {
    const normalized = fold(line);
    if (!labels.some(label => normalized.includes(label))) continue;
    const colon = Math.max(line.indexOf(":"), line.indexOf("："));
    if (colon >= 0) return clean(line.slice(colon + 1));
  }
  return "";
}

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
  const normalized = fold(text);
  const type = normalized.includes("phieu giao hang") ? "Phiếu giao hàng"
    : normalized.includes("phieu nhap kho") ? "Phiếu nhập kho"
    : normalized.includes("phieu xuat kho") ? "Phiếu xuất kho"
    : normalized.includes("hoa don ban hang") ? "Hóa đơn bán hàng"
    : normalized.includes("hoa don") ? "Hóa đơn VAT"
    : "Chứng từ khác";
  const taxCodes = allMatches(normalized, /(?:ma so thue|mst|tax code)\s*[:：]?\s*([0-9o][0-9o\-.\s]{8,16})/gi)
    .map(value => value.replace(/[O]/gi, "0").replace(/[\s.]/g, ""));
  const taxCode = taxCodes[0] || "";
  const buyerTaxCode = taxCodes[1] || "";
  const date = normalizeDate(find(normalized, [
    /(?:ngay|date)\s*[:：]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
    /ngay\s+(\d{1,2}\s+thang\s+\d{1,2}\s+nam\s+\d{4})/i,
  ]));
  const number = find(normalized, [
    /^\s*so\s*[:：]\s*([0-9o]{5,20})\s*$/im,
    /(?:so hoa don|invoice\s*no)\s*[:：]?\s*([a-z0-9\-\/]{3,30})/i,
  ]).replace(/O/gi, "0");
  const symbol = find(normalized, [/(?:ky hieu|serial)\s*[:：]?\s*([a-z0-9\-\/]{3,30})/i]).toUpperCase();
  const vendor = lineValue(text, ["don vi ban hang", "don vi ban", "ten nguoi ban", "seller"]);
  const addresses = text.split(/\r?\n/).filter(line => fold(line).includes("dia chi")).map(line => {
    const colon = line.indexOf(":");
    return clean(colon >= 0 ? line.slice(colon + 1) : line);
  });
  const address = addresses[0] || "";
  const buyer = lineValue(text, ["ten don vi", "don vi mua", "ten nguoi mua", "buyer", "ho ten nguoi mua hang"]);
  const totalRaw = find(normalized, [
    /(?:tong tien thanh toan|tong cong tien thanh toan|tong cong thanh toan|tong thanh toan|total payment|grand total)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i,
  ]);
  const taxRaw = find(normalized, [/(?:tien thue gtgt|tien thue vat|vat amount)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i]);
  const subtotalRaw = find(normalized, [/(?:cong tien hang|tong tien truoc thue|subtotal)\s*[:：]?\s*([0-9][0-9.,\s]{2,})/i]);
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

function cropCanvas(source: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * width);
  canvas.height = Math.round(source.height * height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không hỗ trợ Canvas.");
  context.drawImage(
    source,
    source.width * x,
    source.height * y,
    source.width * width,
    source.height * height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas;
}

async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(1, Math.min(2, 1600 / bitmap.width));
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
      const prepared = await prepareImage(file);
      const result = await worker.recognize(prepared);
      text = result.data.text;
      confidences.push(result.data.confidence);

      let parsed = parseInvoice(text, file);
      const needsHeader = parsed.number === "Chưa nhận dạng" || !parsed.symbol;
      const needsTable = !parsed.items?.length || !parsed.amount;
      if (needsHeader || needsTable) {
        await worker.setParameters({
          preserve_interword_spaces: "1",
          tessedit_pageseg_mode: "6",
        });
      }
      if (needsHeader) {
        progress(82, "Đang đọc lại số và ký hiệu hóa đơn...");
        const header = cropCanvas(prepared, .68, .01, .30, .16);
        const headerResult = await worker.recognize(header);
        text += `\n${headerResult.data.text}`;
        confidences.push(headerResult.data.confidence);
      }
      if (needsTable) {
        progress(88, "Đang đọc lại bảng hàng hóa và tổng tiền...");
        const table = cropCanvas(prepared, .02, .45, .96, .24);
        const tableResult = await worker.recognize(table);
        text += `\n${tableResult.data.text}`;
        confidences.push(tableResult.data.confidence);
      }
    }
  } finally {
    await worker.terminate();
  }
  progress(94, "Đang tách dữ liệu hóa đơn...");
  if (!text.trim()) throw new Error("Không đọc được chữ trong chứng từ. Hãy thử ảnh rõ hơn.");
  const result = parseInvoice(text, file);
  result.rawText = text;
  if (confidences.length) {
    result.confidence = Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length);
  }
  progress(100, "Hoàn tất");
  return result;
}
