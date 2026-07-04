"use client";

import { useState } from "react";
import { Bell, Menu, Search, Upload } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { Documents } from "@/components/Documents";
import { Review } from "@/components/Review";
import { Sidebar } from "@/components/Sidebar";
import { UploadModal } from "@/components/UploadModal";
import { documents as initialDocuments, OcrDocument } from "@/lib/documents";
import { recognizeDocument } from "@/lib/client-ocr";

export default function Home() {
  const [view, setView] = useState("dashboard");
  const [upload, setUpload] = useState(false);
  const [active, setActive] = useState<OcrDocument | null>(null);
  const [documents, setDocuments] = useState<OcrDocument[]>(initialDocuments);
  const navigate = (next: string) => {setView(next); setActive(null)};

  const runOcr = async (files: File[], report: (percent: number, label: string) => void) => {
    const file = files[0];
    const result = await recognizeDocument(file, report);
    const parsed: OcrDocument = {
      id: Date.now(),
      sourceUrl: URL.createObjectURL(file),
      ...result,
    };
    setDocuments(current => [parsed, ...current]);
    setUpload(false);
    setActive(parsed);
    setView("documents");
  };

  return <div className="appShell">
    <Sidebar active={active ? "documents" : view} onNavigate={navigate} onUpload={() => setUpload(true)}/>
    <main>
      <header className="topbar">
        <button className="menu"><Menu/></button>
        <label><Search size={20}/><input placeholder="Tìm số hóa đơn, MST, nhà cung cấp..."/><kbd>⌘ K</kbd></label>
        <button className="bell"><Bell size={19}/><i/></button>
        <button className="primary" onClick={() => setUpload(true)}><Upload size={16}/> Tải chứng từ</button>
      </header>
      {active ? <Review document={active} onBack={() => setActive(null)}/>
        : view === "dashboard" ? <Dashboard onDocuments={() => setView("documents")}/>
        : view === "documents" ? <Documents documents={documents} onReview={setActive} onUpload={() => setUpload(true)}/>
        : <div className="placeholder"><h1>{view === "vendors" ? "Nhà cung cấp" : view === "team" ? "Thành viên" : view === "reports" ? "Báo cáo" : "Cài đặt"}</h1><p>Module đã sẵn sàng để kết nối API backend.</p><button className="primary" onClick={() => setView("documents")}>Xem chứng từ</button></div>}
    </main>
    <UploadModal open={upload} onClose={() => setUpload(false)} onProcess={runOcr}/>
  </div>;
}
