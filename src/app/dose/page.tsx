import type { Metadata } from "next";

import { DoseSelector } from "@/features/dose/dose-selector";

export const metadata: Metadata = {
  title: "选择剂量",
  description: "从六档固定剂量中选择本次虚拟娱乐体验的界面剂量。",
};

export default function DosePage() {
  return <DoseSelector />;
}
