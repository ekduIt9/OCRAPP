"use client";

import { useMemo, useState } from "react";
import { Download, Search, Upload } from "lucide-react";
import { documents, OcrDocument, statusLabel } from "@/lib/documents";

export function Documents({onReview, onUpload}: {onReview: (doc: OcrDocument) => void; onUpload: () => void}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filtered = useMemo(() => documents.filter(d => (!status || d.status === status) && Object.values(d).join(" ").toLowerCase().includes(query.toLowerCase())), [query, status]);
  const exportCsv = () => {
    const rows = [["Số chứng từ","Loại","Nhà cung cấp","MST","Ngày","Tổng tiền"], ...documents.map(d => [d.number,d.type,d.vendor,d.taxCode,d.date,d.amount])];
    const blob = new Blob(["\ufeff" + rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")], {type: "text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "scanbiz-chung-tu.csv"; a.click();
  };
  return <div className="page"><div className="pageHead"><div><h1>Chứng từ</h1><p>Quản lý, kiểm tra và theo dõi toàn bộ chứng từ.</p></div><button className="primary" onClick={onUpload}><Upload size={16}/> Tải chứng từ</button></div>
    <div className="toolbar"><label><Search size={17}/><input placeholder="Tìm trong chứng từ..." value={query} onChange={e => setQuery(e.target.value)}/></label><select value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option><option value="APPROVED">Đã duyệt</option><option value="WAITING_REVIEW">Chờ kiểm tra</option><option value="NEED_CORRECTION">Cần chỉnh sửa</option></select><button className="secondary export" onClick={exportCsv}><Download size={16}/> Xuất Excel</button></div>
    <section className="card tableWrap"><table><thead><tr><th>Chứng từ</th><th>Số chứng từ</th><th>Nhà cung cấp</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>{filtered.map(d => <tr key={d.id} onClick={() => onReview(d)}><td><div className="docCell"><span>{d.file.endsWith(".pdf") ? "PDF" : "IMG"}</span><div><strong>{d.file}</strong><small>{d.type} · OCR {d.confidence || "..."}%</small></div></div></td><td>{d.number}</td><td>{d.vendor}</td><td>{d.date}</td><td><strong>{new Intl.NumberFormat("vi-VN").format(d.amount)} ₫</strong></td><td><em className={`badge ${d.status.toLowerCase()}`}>{statusLabel[d.status]}</em></td></tr>)}</tbody></table></section>
  </div>;
}
