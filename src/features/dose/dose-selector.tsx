"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DOSES_MG, type DoseMg } from "@/types/experience";

import { DosePen } from "./dose-pen";

function formatDose(dose: DoseMg) {
  return `${dose} mg`;
}

export function DoseSelector() {
  const [selectedDose, setSelectedDose] = useState<DoseMg>(2.5);

  return (
    <AppShell title="第 1 步 · 选择剂量">
      <section className="dose-page flex flex-1 flex-col pb-2">
        <div className="dose-intro">
          <p className="dose-kicker">
            <span aria-hidden="true">◆</span> 虚拟娱乐体验
          </p>
          <h1 className="dose-title">
            选一档
            <span>食欲粉碎剂量</span>
          </h1>
          <p className="dose-copy">
            剂量只改变界面显示与本机记录，
            <strong>不会改变 15 秒体验时长。</strong>
          </p>
        </div>

        <div className="dose-hero" aria-live="polite">
          <div className="dose-hero-grid" aria-hidden="true" />
          <div className="dose-selected-stamp">
            <span>本次已选</span>
            <strong>{formatDose(selectedDose)}</strong>
          </div>
          <DosePen dose={selectedDose} />
          <p>纯属游戏道具 · 不代表真实药效</p>
        </div>

        <fieldset aria-labelledby="dose-panel-title" className="dose-panel">
          <div className="dose-panel-heading">
            <p id="dose-panel-title">体验剂量</p>
            <span>固定六档 · 单位 mg</span>
          </div>
          <div className="dose-grid">
            {DOSES_MG.map((dose) => {
              const isSelected = dose === selectedDose;

              return (
                <button
                  aria-pressed={isSelected}
                  className="dose-option"
                  key={dose}
                  onClick={() => setSelectedDose(dose)}
                  type="button"
                >
                  <span>{dose}</span>
                  <span className="dose-option-unit">mg</span>
                  {isSelected ? (
                    <span className="dose-option-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="dose-actions">
          <Link className="dose-continue" href={`/site?dose=${selectedDose}`}>
            选好了，去选模拟部位
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="dose-back" href="/">
            返回欢迎页
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
