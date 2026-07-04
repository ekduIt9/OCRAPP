"use client";

import { Fragment } from "react";
import { BarChart3, FileText, LayoutDashboard, Settings, Upload, Users, Warehouse } from "lucide-react";

type Props = { active: string; onNavigate: (view: string) => void; onUpload: () => void };
const items = [
  ["dashboard", "Tổng quan", LayoutDashboard],
  ["documents", "Chứng từ", FileText],
  ["upload", "Tải lên", Upload],
  ["vendors", "Nhà cung cấp", Warehouse],
  ["team", "Thành viên", Users],
  ["reports", "Báo cáo", BarChart3],
  ["settings", "Cài đặt", Settings]
] as const;

export function Sidebar({active, onNavigate, onUpload}: Props) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => onNavigate("dashboard")}><span className="logo">⌗</span> ScanBiz</button>
    <nav>{items.map(([id, label, Icon], index) => <Fragment key={id}>
      {index === 3 && <p className="navLabel">QUẢN LÝ</p>}
      <button className={active === id ? "navItem active" : "navItem"} onClick={() => id === "upload" ? onUpload() : onNavigate(id)}>
        <Icon size={18}/><span>{label}</span>{id === "documents" && <b>6</b>}
      </button>
    </Fragment>)}</nav>
    <div className="quota"><div><span>Lượt OCR tháng 7</span><strong>68%</strong></div><i><b/></i><small>204 / 300 chứng từ</small><button>Nâng cấp gói</button></div>
    <div className="user"><span>AN</span><div><strong>An Nguyễn</strong><small>Kế toán viên</small></div><b>⋮</b></div>
  </aside>;
}
