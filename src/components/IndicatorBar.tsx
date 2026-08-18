import React from 'react';
import { Card as CardType } from '../types/game';
import { NOTE_NAMES, NOTE_JP } from '../constants/music';

export interface ActionBadge {
  text: string;
  type: 'chord' | 'scale' | 'add' | 'swap';
}

interface IndicatorBarProps {
  selectedCount: number;
  selectedCards?: CardType[];
  formedMeldName?: string | null;
  actionBadges?: ActionBadge[];
  isPlayerTurn?: boolean;
  isMainPhase?: boolean;
  isInterruptTurn?: boolean;
  isMyInterrupt?: boolean;
  selectedMeldId?: string | null;
  hasSwappedThisTurn?: boolean;
}

export const IndicatorBar: React.FC<IndicatorBarProps> = ({
  selectedCount,
  selectedCards = [],
  formedMeldName,
  actionBadges = []
}) => {
  return (
    <div className="bg-[#1b1008] border-2 border-[#452715] rounded-xl px-3 py-1.5 shadow-md flex items-center justify-between min-h-[34px] gap-2">
      {/* 左側：手札選択情報 & 選択中のカード一覧（ミニバッジ表示） */}
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <span className="text-[11px] font-black text-amber-100 shrink-0">
          手札 <span className="text-amber-300/70 font-normal">({selectedCount}枚)</span>:
        </span>

        {selectedCards.length > 0 ? (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {selectedCards.map((c) => {
              const oct = Math.floor(c.absVal / 7) + 2;
              const noteIndex = c.absVal % 7;
              return (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#2d190d] border border-amber-500/60 rounded text-[10.5px] font-black text-amber-200 shadow-xs shrink-0"
                >
                  <span className="text-amber-100">
                    {NOTE_NAMES[noteIndex]}<span className="text-[8px] opacity-75">{oct}</span>
                  </span>
                  <span className="text-[9px] text-amber-300/80 font-bold">
                    ({NOTE_JP[noteIndex]})
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-[10px] text-amber-200/40">未選択</span>
        )}
      </div>

      {/* 右側：成立役・アクションバッジ一覧（付け札・アレンジの同時表示対応） */}
      {actionBadges.length > 0 ? (
        <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto">
          {actionBadges.map((badge, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-black tracking-wide shadow-xs whitespace-nowrap inline-flex items-center ${
                badge.type === 'swap'
                  ? 'bg-orange-950/90 border border-orange-400 text-orange-200 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                  : badge.type === 'scale'
                    ? 'bg-sky-950/90 border border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.35)]'
                    : badge.type === 'add'
                      ? 'bg-emerald-950/90 border border-emerald-400 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                      : 'bg-[#2a1a0f] border border-amber-400/80 text-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.25)]'
              }`}
            >
              {badge.text}
            </span>
          ))}
        </div>
      ) : formedMeldName ? (
        <div className="shrink-0">
          <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-black tracking-wide shadow-xs whitespace-nowrap inline-flex items-center ${
            formedMeldName.startsWith('🔄')
              ? 'bg-orange-950/90 border border-orange-400 text-orange-200 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
              : formedMeldName.startsWith('付け札')
                ? 'bg-emerald-950/90 border border-emerald-400 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                : 'bg-[#2a1a0f] border border-amber-400/80 text-amber-200'
          }`}>
            {formedMeldName}
          </span>
        </div>
      ) : null}
    </div>
  );
};
