import React from 'react';
import { Music } from 'lucide-react';
import { Card as CardType } from '../types/game';
import { NOTE_NAMES, NOTE_JP } from '../constants/music';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  interpretedAbsVal?: number | null;
  sizeClass?: string;
  isHighlighted?: boolean;
  isAddReaction?: boolean;
  isSwapReaction?: boolean;
  isBothReaction?: boolean;
  isReadyToMeld?: boolean;
  isTwoCardPair?: boolean;
  isDimmed?: boolean;
  isHidden?: boolean;
  extraClass?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  onClick,
  interpretedAbsVal = null,
  sizeClass = "w-[44px] h-[64px] sm:w-[54px] sm:h-[76px]",
  isHighlighted = false,
  isAddReaction = false,
  isSwapReaction = false,
  isBothReaction = false,
  isReadyToMeld = false,
  isTwoCardPair = false,
  isDimmed = false,
  isHidden = false,
  extraClass = ""
}) => {
  // トランプの裏面（山札のカードバック）
  if (isHidden) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${sizeClass} rounded-md sm:rounded-lg border-2 border-white bg-slate-800 p-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-default select-none overflow-hidden ${extraClass}`}
      >
        <div className="w-full h-full rounded-xs border border-slate-600/50 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:5px_5px] bg-slate-800 flex items-center justify-center">
          <Music className="w-3.5 h-3.5 text-slate-400 opacity-60" />
        </div>
      </div>
    );
  }

  const absValToUse = interpretedAbsVal !== null && interpretedAbsVal !== undefined ? interpretedAbsVal : card.absVal;
  
  const oct = Math.floor(absValToUse / 7) + 2;
  const noteIndex = absValToUse % 7;

  return (
    <div 
      onClick={onClick}
      className={`relative ${sizeClass} rounded-md sm:rounded-lg border-2 flex flex-col items-center justify-center select-none
        transition-transform duration-150 ease-out
        ${isSelected 
          ? '-translate-y-4 border-amber-800 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0] text-amber-950 shadow-[0_12px_24px_rgba(0,0,0,0.5)] z-20 cursor-pointer' 
          : (isBothReaction || isSwapReaction || isAddReaction)
            ? 'border-amber-700/50 text-amber-900 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer z-15'
          : isReadyToMeld
            ? 'border-amber-300 text-amber-950 bg-gradient-to-b from-[#ffffff] via-[#fffdf0] to-[#fef3c7] shadow-[0_0_12px_rgba(245,158,11,0.7),inset_0_0_6px_rgba(251,191,36,0.35)] cursor-pointer ring-1.5 ring-amber-400 z-15 overflow-hidden'
          : isTwoCardPair
            ? 'border-purple-300 text-purple-950 bg-gradient-to-b from-[#ffffff] via-[#faf5ff] to-[#f3e8ff] shadow-[0_0_6px_rgba(192,132,252,0.5)] cursor-pointer ring-1 ring-purple-400/80 z-10'
          : isDimmed
            ? 'border-amber-900/30 text-amber-900/70 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0] opacity-65 brightness-90 shadow-none cursor-pointer'
            : 'border-amber-700/50 text-amber-900 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer'
        }
        ${extraClass}`}
    >
      {/* 🌟 完成形カード（3枚役即完成）の斜め光彩シマーエフェクト（キラリと光が走る！） */}
      {isReadyToMeld && !isSelected && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="w-8 h-[200%] bg-gradient-to-r from-transparent via-white/85 to-transparent -top-1/2 absolute animate-gold-shimmer shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
        </div>
      )}

      {/* 🟢 🟧 シークエンス選択時の判別カラー丸バッジ（○） */}
      {!isSelected && !isReadyToMeld && (
        <>
          {/* ✨ 付け札＆アレンジ両方可能：緑（付け札）とオレンジ（アレンジ）の丸が横並び！ */}
          {isBothReaction && (
            <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-30 pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-[0_0_4px_#10b981]" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white shadow-[0_0_4px_#f97316]" />
            </div>
          )}

          {/* 🌿 付け札のみ可能：緑の丸（○） */}
          {isAddReaction && !isBothReaction && (
            <div className="absolute -top-1.5 -right-1.5 z-30 pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-[0_0_4px_#10b981]" />
            </div>
          )}

          {/* 🔄 アレンジのみ可能：オレンジの丸（○） */}
          {isSwapReaction && !isBothReaction && (
            <div className="absolute -top-1.5 -right-1.5 z-30 pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white shadow-[0_0_4px_#f97316]" />
            </div>
          )}
        </>
      )}

      <div className="flex flex-col items-center pointer-events-none">
        <span className={`text-sm sm:text-base font-black flex items-baseline leading-none tracking-tight ${
          isReadyToMeld && !isSelected ? 'text-amber-950 font-black' : isTwoCardPair && !isSelected ? 'text-purple-900' : ''
        }`}>
          {NOTE_NAMES[noteIndex]}
          <span className="text-[9px] font-bold ml-0.5 opacity-75">{oct}</span>
        </span>
        <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 leading-none ${
          isReadyToMeld && !isSelected ? 'text-amber-900 font-black' : isTwoCardPair && !isSelected ? 'text-purple-700 font-black' : 'opacity-85'
        }`}>
          {NOTE_JP[noteIndex]}
        </span>
      </div>
    </div>
  );
};
