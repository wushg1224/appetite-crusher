import type { Metadata } from "next";

import { HistoryExperience } from "@/features/history/history-experience";

export const metadata: Metadata = {
  title: "历史记录",
  description: "查看当前浏览器中保存的虚拟体验记录和连续打卡天数。",
};

export default function HistoryPage() {
  return <HistoryExperience />;
}
