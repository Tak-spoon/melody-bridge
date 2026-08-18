import React from 'react';
import { Card as CardType } from '../types/game';
import { NOTE_NAMES, NOTE_JP } from '../constants/music';

interface IndicatorBarProps {
  selectedCount: number;
  selectedCards?: CardType[];
  formedMeldName?: string | null;
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
  formedMeldName
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

      {/* 右側：成立役名表示（シンプル＆スマートなバッジ表示） */}
      {formedMeldName && (
        <div className="shrink-0">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider shadow-inner animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap inline-flex items-center ${
            formedMeldName.startsWith('🔄')
              ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              : formedMeldName.startsWith('付け札')
                ? 'bg-emerald-950 border border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-[#2a1a0f] border border-amber-400/80 text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
          }`}>
            {formedMeldName}
          </span>
        </div>
      )}
    </div>
  );
};
