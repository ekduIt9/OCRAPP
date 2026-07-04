"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onProcess: (files: File[], report: (percent: number, label: string) => void) => Promise<void>;
};

export function UploadModal({open, onClose, onProcess}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const input = useRef<HTMLInputElement>(null);
  if (!open) return null;

  const add = (list: FileList | null) => {
    if (!list) return;
    const valid = Array.from(list).filter(file =>
      /\.(jpe?g|png|pdf)$/i.test(file.name) && file.size <= 20 * 1024 * 1024,
    );
    setFiles(current => [...current, ...valid]);
    if (valid.length !== list.length) setError("Một số file không hợp lệ hoặc lớn hơn 20 MB.");
  };
  const process = async () => {
    setProcessing(true);
    setError("");
    try {
      await onProcess(files, (percent, label) => {setProgress(percent); setProgressLabel(label)});
      setFiles([]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể đọc chứng từ.");
    } finally {
      setProcessing(false);
    }
  };

  return <div className="backdrop" onMouseDown={event => event.target === event.currentTarget && !processing && onClose()}>
    <section className="modal">
      <header><div><h2>Tải chứng từ lên</h2><p>AI sẽ đọc và trích xuất dữ liệu thật từ file.</p></div><button disabled={processing} onClick={onClose}><X/></button></header>
      <div className="dropzone" onDragOver={event => event.preventDefault()} onDrop={event => {event.preventDefault(); add(event.dataTransfer.files)}}>
        <span><Upload/></span><h3>Kéo và thả file vào đây</h3><p>hoặc <button onClick={() => input.current?.click()}>chọn file từ máy tính</button></p><small>JPG, PNG hoặc PDF · Tối đa 20 MB/file</small>
        <input ref={input} hidden type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={event => add(event.target.files)}/>
      </div>
      <div className="uploadList">{files.map((file, index) => <div key={`${file.name}-${index}`}><FileText size={20}/><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span><button disabled={processing} onClick={() => setFiles(files.filter((_, i) => i !== index))}><X size={16}/></button></div>)}</div>
      {error && <p className="uploadError">{error}</p>}
      {processing && <div className="ocrProgress"><div><span>{progressLabel}</span><strong>{progress}%</strong></div><i><b style={{width: `${progress}%`}}/></div>}
      <footer><button className="secondary" disabled={processing} onClick={onClose}>Hủy</button><button className="primary" disabled={!files.length || processing} onClick={process}>{processing ? <><i className="spinner"/> Đang OCR...</> : "Đọc chứng từ"}</button></footer>
    </section>
  </div>;
}
