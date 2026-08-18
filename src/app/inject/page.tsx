import { FlowPlaceholder } from "@/components/flow-placeholder";

export default function InjectPage() {
  return (
    <FlowPlaceholder
      description="这里将实现完整 15 秒连续长按、阶段文案、机械声、静音、可选震动与中断归零。当前仅建立页面边界。"
      nextHref="/success"
      nextLabel="查看成功页骨架"
      title="长按模拟注射"
    />
  );
}
