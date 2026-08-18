import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "食欲粉碎机",
    template: "%s | 食欲粉碎机",
  },
  description: "一段可爱、缓慢的像素风虚拟注射娱乐体验。",
  applicationName: "食欲粉碎机",
  icons: {
    icon: "/icons/app-icon.svg",
    apple: "/icons/app-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffd8e6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
