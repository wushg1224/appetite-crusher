import type { Metadata } from "next";

import { InjectionExperience } from "@/features/injection/injection-experience";

export const metadata: Metadata = {
  title: "长按模拟注射",
  description: "连续长按 15 秒，完成像素风虚拟注射娱乐体验。",
};

export default function InjectPage() {
  return <InjectionExperience />;
}
