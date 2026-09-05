"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { AppShell } from "@/components/app-shell";
import {
  calculateCurrentStreak,
  clearHistory,
  getHistorySnapshot,
  parseHistorySnapshot,
  subscribeToHistory,
} from "@/features/history/storage";
import type { ExperienceRecord } from "@/types/experience";

const SITE_LABELS: Record<ExperienceRecord["site"], string> = {
  abdomen: "腹部",
  thigh: "大腿",
};

interface HistoryDayGroup {
  date: string;
  records: ExperienceRecord[];
}

function formatDateLabel(localDate: string): string {
  const [year, month, day] = localDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function formatTimeLabel(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function sortByCompletedAtDesc(records: ExperienceRecord[]): ExperienceRecord[] {
  return [...records].sort(
    (left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
  );
}

function groupRecords(records: ExperienceRecord[]): HistoryDayGroup[] {
  const groups = new Map<string, ExperienceRecord[]>();

  for (const record of sortByCompletedAtDesc(records)) {
    const group = groups.get(record.localDate);
    if (group) {
      group.push(record);
    } else {
      groups.set(record.localDate, [record]);
    }
  }

  return [...groups.entries()]
    .map(([date, dayRecords]) => ({ date, records: dayRecords }))
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function HistoryExperience() {
  const snapshot = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    () => null,
  );
  const history = useMemo(() => parseHistorySnapshot(snapshot), [snapshot]);
  const groups = useMemo(() => groupRecords(history.records), [history.records]);
  const streakDays = useMemo(
    () => calculateCurrentStreak(history.records),
    [history.records],
  );
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [clearStatus, setClearStatus] = useState("");
  const [clearError, setClearError] = useState("");
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const recordCount = history.records.length;
  const shouldShowClearConfirm = isConfirmingClear && recordCount > 0;

  useEffect(() => {
    if (shouldShowClearConfirm) {
      cancelButtonRef.current?.focus();
    }
  }, [shouldShowClearConfirm]);

  const handleStartClear = () => {
    setClearStatus("");
    setClearError("");
    setIsConfirmingClear(true);
  };

  const handleCancelClear = () => {
    setIsConfirmingClear(false);
    setClearError("");
    setClearStatus("已取消，记录仍保留在当前浏览器。");
    window.setTimeout(() => clearButtonRef.current?.focus(), 0);
  };

  const handleConfirmClear = () => {
    try {
      clearHistory();
      setClearStatus("已清空全部本机历史记录。");
      setClearError("");
      setIsConfirmingClear(false);
    } catch {
      setClearError("清空失败：当前浏览器暂时无法访问本机存储。");
    }
  };

  return (
    <AppShell title="本机记录">
      <section className="history-page" aria-labelledby="history-title">
        <header className="history-hero">
          <div>
            <p className="history-kicker">
              <span aria-hidden="true">▣</span> 流程页面
            </p>
            <h1 id="history-title">历史记录</h1>
            <p>所有记录只保存在当前浏览器，用来回看这段像素娱乐体验。</p>
          </div>
          <div className="history-streak-card" aria-live="polite">
            <span>当前连续</span>
            <strong>{streakDays}</strong>
            <span>天</span>
          </div>
        </header>

        {recordCount === 0 ? (
          <div className="history-empty">
            <div className="history-empty-calendar" aria-hidden="true">
              <span />
              <strong>0</strong>
              <small>DAY</small>
            </div>
            <h2>还没有成功记录</h2>
            <p>完成一次 15 秒虚拟体验后，这里会按本地日期自动整理。</p>
            <Link className="history-primary-link" href="/dose">
              开始第一次体验
            </Link>
            {clearStatus ? (
              <p className="history-empty-status" role="status">
                {clearStatus}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="history-summary" aria-label="历史记录概览">
              <div>
                <span>总记录</span>
                <strong>{recordCount}</strong>
              </div>
              <div>
                <span>记录天数</span>
                <strong>{groups.length}</strong>
              </div>
            </div>

            <ol className="history-timeline" aria-label="按本地日期分组的历史记录">
              {groups.map((group) => (
                <li className="history-day" key={group.date}>
                  <div className="history-day-marker" aria-hidden="true">
                    <span>{group.records.length}</span>
                  </div>
                  <section className="history-day-body" aria-labelledby={`history-day-${group.date}`}>
                    <h2 id={`history-day-${group.date}`}>{formatDateLabel(group.date)}</h2>
                    <ul className="history-records">
                      {group.records.map((record) => (
                        <li className="history-record" key={record.id}>
                          <div>
                            <strong>{record.doseMg} mg</strong>
                            <span>{SITE_LABELS[record.site]}</span>
                          </div>
                          <time dateTime={record.completedAt}>
                            {formatTimeLabel(record.completedAt)}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </section>
                </li>
              ))}
            </ol>

            <section className="history-clear-zone" aria-labelledby="history-clear-title">
              <div>
                <h2 id="history-clear-title">清空全部记录</h2>
                <p>只删除当前浏览器里的历史记录，不影响其他数据。</p>
              </div>
              <button
                className="history-clear-button"
                onClick={handleStartClear}
                ref={clearButtonRef}
                type="button"
              >
                清空全部记录
              </button>

              {shouldShowClearConfirm ? (
                <div
                  aria-labelledby="history-clear-confirm-title"
                  className="history-clear-confirm"
                  role="alertdialog"
                >
                  <h3 id="history-clear-confirm-title">确认清空 {recordCount} 条记录？</h3>
                  <p>此操作只影响当前浏览器，但删除后不可恢复。</p>
                  <div className="history-clear-actions">
                    <button
                      className="history-cancel-button"
                      onClick={handleCancelClear}
                      ref={cancelButtonRef}
                      type="button"
                    >
                      取消
                    </button>
                    <button
                      className="history-confirm-button"
                      onClick={handleConfirmClear}
                      type="button"
                    >
                      确认清空
                    </button>
                  </div>
                </div>
              ) : null}

              <p className="history-clear-status" role="status">
                {clearError || clearStatus}
              </p>
            </section>
          </>
        )}
      </section>
    </AppShell>
  );
}
