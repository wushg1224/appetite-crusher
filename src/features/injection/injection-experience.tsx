"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { AppShell } from "@/components/app-shell";
import { PixelPen } from "@/components/pixel-pen";
import { readHistory, writeHistory } from "@/features/history/storage";
import { canVibrate } from "@/lib/browser/capabilities";
import {
  DOSES_MG,
  type DoseMg,
  type ExperienceRecord,
  type InjectionSite,
} from "@/types/experience";

import {
  INJECTION_DURATION_MS,
  INJECTION_STAGES,
  INTERRUPTION_MESSAGE,
} from "./constants";
import {
  type MechanicalAudio,
  startMechanicalAudio,
} from "./mechanical-audio";

type FlowState = "idle" | "holding" | "interrupted" | "completed";

interface InjectionSelection {
  dose: DoseMg;
  site: InjectionSite;
}

const SITE_LABELS: Record<InjectionSite, string> = {
  abdomen: "腹部",
  thigh: "大腿",
};

function vibrate(pattern: number | number[]): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Vibration is an optional enhancement and must never block the flow.
  }
}

function getLocationSearch(): string {
  return window.location.search;
}

function parseSelection(search: string): InjectionSelection | null {
  const params = new URLSearchParams(search);
  const doseValue = params.get("dose");
  const siteValue = params.get("site");
  const dose = DOSES_MG.find((item) => String(item) === doseValue);
  const site = siteValue === "abdomen" || siteValue === "thigh" ? siteValue : null;

  return dose && site ? { dose, site } : null;
}

function subscribeToLocation(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createRecord(selection: InjectionSelection): ExperienceRecord {
  const completedAt = new Date();

  return {
    id: typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${completedAt.getTime()}-${Math.random().toString(16).slice(2)}`,
    doseMg: selection.dose,
    site: selection.site,
    completedAt: completedAt.toISOString(),
    localDate: toLocalDate(completedAt),
  };
}

export function InjectionExperience() {
  const router = useRouter();
  const locationSearch = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    () => "",
  );
  const selection = parseSelection(locationSearch);
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<MechanicalAudio | null>(null);
  const completionCommittedRef = useRef(false);

  const progress = Math.min(elapsedMs / INJECTION_DURATION_MS, 1);
  const progressPercent = Math.round(progress * 100);
  const secondsRemaining = Math.max(
    0,
    Math.ceil((INJECTION_DURATION_MS - elapsedMs) / 1000),
  );
  const stageIndex = Math.min(
    INJECTION_STAGES.length - 1,
    Math.floor(progress * INJECTION_STAGES.length),
  );
  const currentStage = flowState === "holding"
    ? INJECTION_STAGES[stageIndex]
    : "这是夸张的像素游戏反馈";

  const stopEnhancements = useCallback(() => {
    audioRef.current?.stop();
    audioRef.current = null;
    vibrate(0);
  }, []);

  const complete = useCallback(() => {
    if (!selection || completionCommittedRef.current) return;
    completionCommittedRef.current = true;
    startedAtRef.current = null;
    setElapsedMs(INJECTION_DURATION_MS);
    setFlowState("completed");
    stopEnhancements();

    try {
      const history = readHistory();
      writeHistory({
        version: 1,
        records: [...history.records, createRecord(selection)],
      });
    } catch {
      setStorageWarning("体验已完成，但本机记录未能保存。");
    }

    vibrate([40, 45, 80]);
    window.setTimeout(() => router.push("/success"), 520);
  }, [router, selection, stopEnhancements]);

  const updateProgress = useCallback(function tick(now: number) {
    if (startedAtRef.current === null) return;
    const nextElapsed = Math.min(now - startedAtRef.current, INJECTION_DURATION_MS);
    setElapsedMs(nextElapsed);

    if (nextElapsed >= INJECTION_DURATION_MS) {
      complete();
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(tick);
  }, [complete]);

  const interrupt = useCallback(() => {
    if (startedAtRef.current === null || completionCommittedRef.current) return;
    startedAtRef.current = null;
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    stopEnhancements();
    setElapsedMs(0);
    setFlowState("interrupted");
  }, [stopEnhancements]);

  const start = useCallback(() => {
    if (!selection || startedAtRef.current !== null || completionCommittedRef.current) return;
    setStorageWarning(null);
    setElapsedMs(0);
    setFlowState("holding");
    startedAtRef.current = performance.now();
    audioRef.current = startMechanicalAudio(isMuted);
    vibrate(35);
    animationFrameRef.current = window.requestAnimationFrame(updateProgress);
  }, [isMuted, selection, updateProgress]);

  useEffect(() => {
    audioRef.current?.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") interrupt();
    };

    window.addEventListener("blur", interrupt);
    window.addEventListener("pagehide", interrupt);
    window.addEventListener("pointerup", interrupt);
    window.addEventListener("pointercancel", interrupt);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", interrupt);
      window.removeEventListener("pagehide", interrupt);
      window.removeEventListener("pointerup", interrupt);
      window.removeEventListener("pointercancel", interrupt);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interrupt]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    stopEnhancements();
  }, [stopEnhancements]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    start();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      start();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      interrupt();
    }
  };

  if (!selection) {
    return (
      <AppShell title="第 3 步 · 长按体验">
        <section className="inject-invalid">
          <p aria-hidden="true">◇</p>
          <h1>还缺一项选择</h1>
          <p>请先选好娱乐剂量和模拟部位，再开始 15 秒长按体验。</p>
          <Link href="/dose">返回选择剂量</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="第 3 步 · 长按体验">
      <section className={`inject-page inject-page--${flowState}`}>
        <div className="inject-heading">
          <p className="inject-kicker">
            <span aria-hidden="true">◆</span> 像素压力舱
          </p>
          <h1>按住 <span>15 秒</span></h1>
          <p>连续长按下方按钮。松手、移出或切换页面都会立即归零。</p>
        </div>

        <div className="inject-selection" aria-label="本次娱乐选择">
          <span><small>娱乐剂量</small><strong>{selection.dose} mg</strong></span>
          <span aria-hidden="true">×</span>
          <span><small>模拟部位</small><strong>{SITE_LABELS[selection.site]}</strong></span>
        </div>

        <div className="inject-stage">
          <div className="inject-stage-grid" aria-hidden="true" />
          <button
            aria-label={`连续按住 15 秒完成模拟注射，当前进度 ${progressPercent}%`}
            className="inject-hold"
            disabled={flowState === "completed"}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onPointerDown={handlePointerDown}
            onPointerLeave={interrupt}
            style={{ "--inject-progress": `${progress * 360}deg` } as CSSProperties}
            type="button"
          >
            <span className="inject-hold-inner">
              <strong>{flowState === "holding" ? secondsRemaining : 15}</strong>
              <small>{flowState === "holding" ? "秒后完成" : "按住不放"}</small>
              <span aria-hidden="true">▼</span>
            </span>
          </button>

          <div className="inject-pen-track" aria-hidden="true">
            <div style={{ transform: `translateX(${progress * 54}%)` }}>
              <PixelPen />
            </div>
          </div>

          <div
            aria-label={`完成进度 ${progressPercent}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercent}
            className="inject-progress"
            role="progressbar"
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="inject-status" aria-live="assertive">
          {flowState === "interrupted" ? (
            <>
              <strong>{INTERRUPTION_MESSAGE}</strong>
              <span>进度已清零，再次按住重新开始。</span>
            </>
          ) : flowState === "completed" ? (
            <>
              <strong>像素体验完成！</strong>
              <span>{storageWarning ?? "正在前往成功页…"}</span>
            </>
          ) : (
            <>
              <strong>{flowState === "holding" ? currentStage : "准备好了吗？"}</strong>
              <span>{flowState === "holding" ? "夸张游戏文案 · 不代表真实生理反应" : currentStage}</span>
            </>
          )}
        </div>

        <div className="inject-controls">
          <button
            aria-pressed={isMuted}
            onClick={() => setIsMuted((value) => !value)}
            type="button"
          >
            <span aria-hidden="true">{isMuted ? "□" : "♫"}</span>
            {isMuted ? "恢复机械声" : "静音"}
          </button>
          <Link href={`/site?dose=${selection.dose}`}>重新选择部位</Link>
        </div>
      </section>
    </AppShell>
  );
}
