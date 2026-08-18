import { FlowPlaceholder } from "@/components/flow-placeholder";

export default function DosePage() {
  return (
    <FlowPlaceholder
      description="这里将只提供 SPEC.md 规定的六档替尔泊肽剂量，选中一项后才能继续；不会显示推荐或医疗暗示。"
      nextHref="/site"
      nextLabel="前往部位选择骨架"
      title="选择剂量"
    />
  );
}
