import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScanBiz — Document OCR",
  description: "Quản lý và số hóa chứng từ doanh nghiệp"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
