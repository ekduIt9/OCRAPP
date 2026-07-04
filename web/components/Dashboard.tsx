import { AlertTriangle, CheckCircle2, Clock3, FileText, TrendingUp } from "lucide-react";
import { documents } from "@/lib/documents";

export function Dashboard({onDocuments}: {onDocuments: () => void}) {
  const stats = [
    ["TỔNG CHỨNG TỪ", documents.length, FileText, "green"],
    ["CHỜ KIỂM TRA", documents.filter(d => d.status === "WAITING_REVIEW").length, Clock3, "orange"],
    ["ĐÃ DUYỆT", documents.filter(d => d.status === "APPROVED").length, CheckCircle2, "blue"],
    ["CẦN CHỈNH SỬA", documents.filter(d => d.status === "NEED_CORRECTION").length, AlertTriangle, "red"]
  ] as const;
  return <div className="page">
    <div className="pageHead"><div><h1>Chào buổi sáng, An 👋</h1><p>Đây là tình hình xử lý chứng từ của bạn hôm nay.</p></div><button className="secondary">01/07/2026 — 04/07/2026</button></div>
    <div className="stats">{stats.map(([label, value, Icon, color]) => <article className="stat" key={label}><span className={color}><Icon/></span><div><small>{label}</small><strong>{value}</strong><em><TrendingUp size={12}/> 12.5%</em></div></article>)}</div>
    <div className="dashboardGrid"><section className="card"><header><h2>Lượng chứng từ xử lý</h2><button onClick={onDocuments}>Xem chi tiết →</button></header><div className="chart">{[46,60,42,78,54,88,64,72,91,60,84,70].map((h,i) => <span key={i}><i style={{height: `${h}%`}}/><b style={{height: `${Math.max(12,h-35)}%`}}/></span>)}</div><div className="chartLabels"><span>01/07</span><span>02/07</span><span>03/07</span><span>04/07</span></div></section>
    <section className="card"><header><h2>Hoạt động gần đây</h2></header><div className="activity">{["HD_000128.pdf đã được duyệt","PGH_HN2048.jpg vừa tải lên","invoice_8732.png cần chỉnh sửa","Báo cáo tháng 6 đã xuất Excel"].map((x,i) => <div key={x}><span>{i === 2 ? "!" : "✓"}</span><p>{x}<small>{i * 17 + 2} phút trước · An Nguyễn</small></p></div>)}</div></section></div>
  </div>;
}
