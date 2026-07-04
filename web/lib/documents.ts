export type DocumentStatus = "APPROVED" | "WAITING_REVIEW" | "NEED_CORRECTION" | "PROCESSING";

export type OcrDocument = {
  id: number;
  file: string;
  type: string;
  number: string;
  vendor: string;
  taxCode: string;
  date: string;
  amount: number;
  status: DocumentStatus;
  confidence: number;
  symbol?: string;
  address?: string;
  buyer?: string;
  buyerTaxCode?: string;
  subtotal?: number;
  taxAmount?: number;
  currency?: string;
  sourceUrl?: string;
  fileType?: string;
  warnings?: string[];
  items?: Array<{name: string; unit?: string; quantity: number; unitPrice: number; amount: number; taxRate?: number}>;
};

export const documents: OcrDocument[] = [
  {id: 1, file: "HD_000128.pdf", type: "Hóa đơn VAT", number: "00000128", vendor: "Công ty TNHH An Phát", taxCode: "0315478921", date: "04/07/2026", amount: 18755000, status: "APPROVED", confidence: 96},
  {id: 2, file: "PGH_HN2048.jpg", type: "Phiếu giao hàng", number: "GH-2048", vendor: "Công ty CP Minh Long", taxCode: "0106248379", date: "04/07/2026", amount: 8420000, status: "WAITING_REVIEW", confidence: 84},
  {id: 3, file: "invoice_8732.png", type: "Hóa đơn VAT", number: "00008732", vendor: "Văn phòng phẩm Hồng Hà", taxCode: "0100364756", date: "03/07/2026", amount: 3256800, status: "NEED_CORRECTION", confidence: 68},
  {id: 4, file: "PNK_0726.pdf", type: "Phiếu nhập kho", number: "NK-0726", vendor: "Công ty TNHH Đông Nam", taxCode: "0309982764", date: "03/07/2026", amount: 45200000, status: "APPROVED", confidence: 93},
  {id: 5, file: "HD_FPT_3291.pdf", type: "Hóa đơn VAT", number: "00003291", vendor: "FPT Telecom", taxCode: "0101778163", date: "02/07/2026", amount: 1298000, status: "APPROVED", confidence: 98},
  {id: 6, file: "delivery_018.jpg", type: "Phiếu giao hàng", number: "GH-018", vendor: "Giao Hàng Nhanh", taxCode: "0311907295", date: "02/07/2026", amount: 2250000, status: "PROCESSING", confidence: 0}
];

export const statusLabel: Record<DocumentStatus, string> = {
  APPROVED: "Đã duyệt",
  WAITING_REVIEW: "Chờ kiểm tra",
  NEED_CORRECTION: "Cần chỉnh sửa",
  PROCESSING: "Đang xử lý"
};
