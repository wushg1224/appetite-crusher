"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { AppShell } from "@/components/app-shell";
import {
  DOSES_MG,
  type DoseMg,
  type InjectionSite,
} from "@/types/experience";

import { PixelPrincess } from "./pixel-princess";

const SITE_LABELS: Record<InjectionSite, string> = {
  abdomen: "腹部",
  thigh: "大腿",
};

function getDoseFromLocation(): DoseMg | null {
  const value = new URLSearchParams(window.location.search).get("dose");
  return DOSES_MG.find((dose) => String(dose) === value) ?? null;
}

function subscribeToLocation(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

export function SiteSelector() {
  const selectedDose = useSyncExternalStore(
    subscribeToLocation,
    getDoseFromLocation,
    () => null,
  );
  const [selectedSite, setSelectedSite] = useState<InjectionSite | null>(null);

  const nextHref =
    selectedDose && selectedSite
      ? `/inject?dose=${selectedDose}&site=${selectedSite}`
      : null;

  return (
    <AppShell title="第 2 步 · 选择部位">
      <section className="site-page flex flex-1 flex-col pb-2">
        <div className="site-intro">
          <p className="site-kicker">
            <span aria-hidden="true">✦</span> 像素定位
          </p>
          <h1 className="site-title">
            点亮你的
            <span>模拟部位</span>
          </h1>
          <p className="site-copy">
            点击裙装上的发光点。本体验不调用摄像头，也不进行身体识别。
          </p>
        </div>

        <div className="site-dose-row">
          <span>本次娱乐剂量</span>
          {selectedDose ? (
            <strong>{selectedDose} mg</strong>
          ) : (
            <Link href="/dose">先选择剂量</Link>
          )}
        </div>

        <div
          aria-labelledby="site-stage-label"
          className="site-stage"
          role="group"
        >
          <div className="site-stage-grid" aria-hidden="true" />
          <p className="site-stage-label" id="site-stage-label">
            选择一个发光定位点
          </p>
          <span className="site-spark site-spark--one" aria-hidden="true">✦</span>
          <span className="site-spark site-spark--two" aria-hidden="true">◆</span>
          <PixelPrincess />

          {(["abdomen", "thigh"] as const).map((site) => {
            const isSelected = selectedSite === site;

            return (
              <button
                aria-label={`选择${SITE_LABELS[site]}作为模拟部位`}
                aria-pressed={isSelected}
                className={`site-hotspot site-hotspot--${site}`}
                key={site}
                onClick={() => setSelectedSite(site)}
                type="button"
              >
                <span className="site-hotspot-dot" aria-hidden="true">
                  {isSelected ? "✓" : "+"}
                </span>
                <span className="site-hotspot-label">
                  <strong>{SITE_LABELS[site]}</strong>
                  <small>{isSelected ? "已选中" : "点击选择"}</small>
                </span>
              </button>
            );
          })}

          <p className="site-stage-note">完整着装 · 仅作游戏定位</p>
        </div>

        <p className="site-selection-status" aria-live="polite">
          {selectedSite
            ? `已选择：${SITE_LABELS[selectedSite]}`
            : "还没有选择模拟部位"}
        </p>

        <div className="site-actions">
          {nextHref ? (
            <Link className="site-continue" href={nextHref}>
              选好了，开始模拟注射
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button className="site-continue" disabled type="button">
              {selectedDose ? "请先选择一个部位" : "请先返回选择剂量"}
            </button>
          )}
          <Link className="site-back" href="/dose">
            返回选择剂量
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
