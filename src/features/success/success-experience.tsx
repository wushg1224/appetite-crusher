"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { AppShell } from "@/components/app-shell";
import {
  calculateCurrentStreak,
  readHistory,
} from "@/features/history/storage";
import { createShareCardBlob } from "@/features/share/share-card";
import { canShare } from "@/lib/browser/capabilities";

const COUNTDOWN_STEPS = [5, 4, 3, 2, 1] as const;

type ShareState = "idle" | "generating" | "ready" | "shared" | "error";

function getCurrentStreak(): number {
  try {
    return calculateCurrentStreak(readHistory().records);
  } catch {
    return 0;
  }
}

function subscribeToHistory(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function SuccessExperience() {
  const [countdown, setCountdown] = useState(5);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const streakDays = useSyncExternalStore(
    subscribeToHistory,
    getCurrentStreak,
    () => 0,
  );
  const countdownComplete = countdown === 0;

  useEffect(() => {
    let nextValue = 5;
    const timer = window.setInterval(() => {
      nextValue -= 1;
      setCountdown(nextValue);
      if (nextValue === 0) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (shareImageUrl) URL.revokeObjectURL(shareImageUrl);
  }, [shareImageUrl]);

  const handleShare = async () => {
    setShareState("generating");

    try {
      const blob = await createShareCardBlob(streakDays);
      const file = new File([blob], "appetite-crusher-streak.png", {
        type: "image/png",
      });
      const nextImageUrl = URL.createObjectURL(blob);

      setShareImageUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextImageUrl;
      });

      if (
        canShare()
        && typeof navigator.canShare === "function"
        && navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file] });
          setShareState("shared");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            setShareState("ready");
            return;
          }
        }
      }

      setShareState("ready");
    } catch {
      setShareState("error");
    }
  };

  const shareStatus = shareState === "generating"
    ? "正在本机生成分享图…"
    : shareState === "shared"
      ? "分享面板已打开，图片也保留在下方。"
      : shareState === "ready"
        ? "分享图已生成，可保存图片后分享。"
        : shareState === "error"
          ? "生成失败，请重试。你的记录没有上传。"
          : "分享图只包含产品名和连续天数，不包含剂量或部位。";

  return (
    <AppShell title="第 4 步 · 体验完成">
      <section className="success-page">
        <div className="success-heading">
          <p className="success-kicker">
            <span aria-hidden="true">◆</span> 像素任务完成
          </p>
          <h1>你成功了<span aria-hidden="true">！</span></h1>
          <p>这是一段夸张的游戏反馈，不代表真实药效或生理变化。</p>
        </div>

        <div className={`success-countdown${countdownComplete ? " success-countdown--complete" : ""}`}>
          <div className="success-confetti" aria-hidden="true">
            <span>◆</span><span>■</span><span>◆</span><span>■</span>
          </div>
          <div aria-live="polite" className="success-countdown-number">
            {countdownComplete ? <span aria-hidden="true">✓</span> : countdown}
          </div>
          <p>
            {countdownComplete
              ? "离开饭桌，开始你的一天"
              : "像素食欲正在退场…"}
          </p>
          <div aria-label={countdownComplete ? "倒计时已完成" : `倒计时 ${countdown} 秒`} className="success-countdown-steps">
            {COUNTDOWN_STEPS.map((step) => (
              <span
                aria-hidden="true"
                className={countdown !== 0 && step === countdown ? "is-current" : step > countdown ? "is-done" : ""}
                key={step}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <div className="success-streak" aria-live="polite">
          <span aria-hidden="true">◈</span>
          <p>
            <small>当前连续打卡</small>
            <strong>{streakDays} 天</strong>
          </p>
          <span aria-hidden="true">◈</span>
        </div>

        <div
          aria-hidden={!countdownComplete}
          className={`success-actions${countdownComplete ? " is-ready" : ""}`}
        >
          <button
            className="success-share"
            disabled={!countdownComplete || shareState === "generating"}
            onClick={handleShare}
            type="button"
          >
            <span aria-hidden="true">▣</span>
            {shareState === "generating" ? "正在生成…" : "生成分享图"}
          </button>
          <Link className="success-history" href="/history" tabIndex={countdownComplete ? undefined : -1}>
            查看历史记录
          </Link>
          <Link className="success-retry" href="/dose" tabIndex={countdownComplete ? undefined : -1}>
            再来一针 <span aria-hidden="true">→</span>
          </Link>
        </div>

        <p className={`success-share-status success-share-status--${shareState}`} role="status">
          {shareStatus}
        </p>

        {shareImageUrl ? (
          <div className="success-share-preview">
            {/* The generated data stays in this browser tab and is never uploaded. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={`食欲粉碎机连续 ${streakDays} 天分享图`} src={shareImageUrl} />
            <a download="appetite-crusher-streak.png" href={shareImageUrl}>
              保存分享图
            </a>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
