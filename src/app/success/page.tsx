import type { Metadata } from "next";

import { SuccessExperience } from "@/features/success/success-experience";

export const metadata: Metadata = {
  title: "体验完成",
  description: "完成倒计时，查看连续打卡并在本机生成匿名分享图。",
};

export default function SuccessPage() {
  return <SuccessExperience />;
}
