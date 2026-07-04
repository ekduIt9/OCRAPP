"use client";

import { useState } from "react";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { OcrDocument } from "@/lib/documents";

export function Review({document: doc, onBack}: {document: OcrDocument; onBack: () => void}) {
  const format = (value = 0) => new Intl.NumberFormat("vi-VN").format(value);
  const [lines, setLines] = useState(
    doc.items?.map(item => ({name: item.name, qty: String(item.quantity), price: format(item.unitPrice), amount: format(item.amount)}))
    ?? [],
  );
  const fields = [
    ["Loại chứng từ", doc.type],
    ["Số hóa đơn", doc.number],
    ["Ngày hóa đơn", doc.date],
    ["Ký hiệu", doc.symbol || ""],
    ["Tên người bán", doc.vendor],
    ["Mã số thuế", doc.taxCode],
    ["Tổng trước thuế", format(doc.subtotal)],
    ["Tiền thuế VAT", format(doc.taxAmount)],
    ["Tổng thanh toán", format(doc.amount)],
  ];

  return <div className="page">
    <button className="back" onClick={onBack}><ArrowLeft size={16}/> Quay lại danh sách</button>
    <div className="pageHead"><div><h1>Kiểm tra chứng từ</h1><p>{doc.file} · Kết quả OCR cần được đối chiếu trước khi duyệt</p></div><span className="badge waiting_review">Chờ kiểm tra</span></div>
    <div className="reviewGrid">
      <section className="preview">
        <header><h2>Bản gốc</h2><span>− &nbsp; 100% &nbsp; ＋</span></header>
        <div className="paperArea">
          {doc.sourceUrl
            ? doc.fileType === "application/pdf"
              ? <embed className="sourceDocument" src={doc.sourceUrl} type="application/pdf"/>
              : <img className="sourceDocument" src={doc.sourceUrl} alt={`Chứng từ ${doc.file}`}/>
            : <article className="paper">
                <div><b>{doc.vendor.toUpperCase()}</b><h2>{doc.type.toUpperCase()}</h2><small>Ngày {doc.date} · Số: {doc.number}</small></div>
                <p><b>Đơn vị bán hàng:</b> {doc.vendor}<br/><b>Mã số thuế:</b> {doc.taxCode}<br/><b>Địa chỉ:</b> {doc.address || "—"}</p>
                <table><thead><tr><th>STT</th><th>Tên hàng hóa</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{lines.map((line, index) => <tr key={index}><td>{index + 1}</td><td>{line.name}</td><td>{line.qty}</td><td>{line.price}</td><td>{line.amount}</td></tr>)}</tbody></table>
                <aside><p>Cộng tiền hàng: <b>{format(doc.subtotal)}</b></p><p>Tiền thuế GTGT: <b>{format(doc.taxAmount)}</b></p><p>Tổng thanh toán: <b>{format(doc.amount)}</b></p></aside>
              </article>}
        </div>
      </section>
      <section className="reviewForm">
        <header><h2>Dữ liệu trích xuất</h2><button className="secondary"><Save size={14}/> Lưu nháp</button></header>
        <div className="formBody">
          <div className="confidence">✦ Độ tin cậy OCR tổng thể <strong>{doc.confidence}%</strong></div>
          {doc.warnings?.map(warning => <div className="ocrWarning" key={warning}>⚠ {warning}</div>)}
          {doc.rawText && <details className="rawOcr"><summary>Xem văn bản OCR gốc</summary><pre>{doc.rawText}</pre></details>}
          <div className="formGrid">{fields.map(([label, value], index) => <label className={index === 4 ? "wide" : ""} key={label}><span>{label}</span><input defaultValue={value}/></label>)}</div>
          <div className="lineHead"><b>Hàng hóa, dịch vụ</b><button onClick={() => setLines([...lines, {name:"", qty:"1", price:"0", amount:"0"}])}><Plus size={14}/> Thêm dòng</button></div>
          {lines.length === 0 && <div className="ocrWarning">Không nhận dạng được dòng hàng. Bạn có thể thêm thủ công.</div>}
          {lines.map((line, index) => <div className="lineItem" key={index}><input defaultValue={line.name}/><input defaultValue={line.qty}/><input defaultValue={line.amount}/><button onClick={() => setLines(lines.filter((_, i) => i !== index))}><Trash2 size={15}/></button></div>)}
          <footer><button className="secondary">Từ chối</button><button className="primary" onClick={onBack}><Check size={16}/> Duyệt chứng từ</button></footer>
        </div>
      </section>
    </div>
  </div>;
}
