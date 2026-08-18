import { FlowPlaceholder } from "@/components/flow-placeholder";

export default function SuccessPage() {
  return (
    <FlowPlaceholder
      description="这里将显示 5 到 1 的倒计时，并保留生成分享图、查看历史记录与再来一针三个明确操作。"
      nextHref="/history"
      nextLabel="前往历史页骨架"
      title="体验完成"
    />
  );
}
