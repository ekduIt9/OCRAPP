"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

export function UploadModal({open, onClose, onProcess}: {open: boolean; onClose: () => void; onProcess: (files: File[]) => void}) {
  const [files, setFiles] = useState<File[]>([]);
  const input = useRef<HTMLInputElement>(null);
  if (!open) return null;
  const add = (list: FileList | null) => {
    if (!list) return;
    setFiles(current => [...current, ...Array.from(list).filter(f => /\.(jpe?g|png|pdf)$/i.test(f.name) && f.size <= 20 * 1024 * 1024)]);
  };
  return <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal">
      <header><div><h2>Tải chứng từ lên</h2><p>Hệ thống tự động nhận dạng và trích xuất dữ liệu.</p></div><button onClick={onClose}><X/></button></header>
      <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); add(e.dataTransfer.files)}}>
        <span><Upload/></span><h3>Kéo và thả file vào đây</h3><p>hoặc <button onClick={() => input.current?.click()}>chọn file từ máy tính</button></p><small>JPG, PNG hoặc PDF · Tối đa 20 MB/file</small>
        <input ref={input} hidden type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={e => add(e.target.files)}/>
      </div>
      <div className="uploadList">{files.map((file, index) => <div key={`${file.name}-${index}`}><FileText size={20}/><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span><button onClick={() => setFiles(files.filter((_, i) => i !== index))}><X size={16}/></button></div>)}</div>
      <footer><button className="secondary" onClick={onClose}>Hủy</button><button className="primary" disabled={!files.length} onClick={() => onProcess(files)}>Đọc chứng từ</button></footer>
    </section>
  </div>;
}
