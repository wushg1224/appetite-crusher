import type { Metadata } from "next";

import { SiteSelector } from "@/features/site/site-selector";

export const metadata: Metadata = {
  title: "选择模拟部位",
  description: "在完整着装的像素人物上选择腹部或大腿模拟定位点。",
};

export default function SitePage() {
  return <SiteSelector />;
}
