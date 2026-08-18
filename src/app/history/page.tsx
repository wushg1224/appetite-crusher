import { FlowPlaceholder } from "@/components/flow-placeholder";

export default function HistoryPage() {
  return (
    <FlowPlaceholder
      description="这里将从当前浏览器的 localStorage 读取成功记录、计算自然日连续打卡，并提供二次确认后清空全部记录。"
      title="历史记录"
    />
  );
}
