import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, ArrowRight, Sparkles, X, Play, BookOpen, Lightbulb, HelpCircle, Lock, ArrowRight as ArrowRightIcon, Settings } from 'lucide-react';
import { Card as CardType, Meld, Player, DiscardItem } from '../../types/game';
import { PuzzleStage } from '../../types/puzzle';
import { PUZZLE_CHAPTERS } from '../../constants/puzzles';
import { NOTE_NAMES, NOTE_JP } from '../../constants/music';
import { tryAddCardToMeld, trySwapCardInMeld, getChordInterpretation, getScaleInterpretation, getChordSymbol, analyzeHandConnections, SwapResult } from '../../utils/musicTheory';
import { getValidPonCombs, getValidChiiCombs } from '../../utils/gameLogic';
import { playMelody, playSwapSound, playCardTone, playWinSound, playCutInSound } from '../../utils/audio';
import { GuideAndDeck } from '../GuideAndDeck';
import { Field } from '../Field';
import { ActionBar } from '../ActionBar';
import { Hand } from '../Hand';
import { IndicatorBar, ActionBadge } from '../IndicatorBar';
import { PlayerStatus } from '../PlayerStatus';
import { DiscardModal } from '../Modals/DiscardModal';
import { RuleModal } from '../Modals/RuleModal';
import { WinEffect } from '../WinEffect';
import { CutIn } from '../CutIn';

interface PuzzlePlayProps {
  stage: PuzzleStage;
  onBackToSelect: () => void;
  onSelectStage: (stage: PuzzleStage) => void;
  soundEnabled: boolean;
  assistEnabled: boolean;
  onOpenOptions?: () => void;
}

const CLEARED_STORAGE_KEY = 'mb_puzzle_cleared_stages_v1';

// -------------------------------------------------------------
// パズル専用：視覚的ミニカードコンポーネント
// -------------------------------------------------------------
interface MiniCardProps {
  note: string;
  oct?: number;
  jp: string;
  highlight?: 'gold' | 'blue' | 'green' | 'orange' | 'red';
  compact?: boolean;
}

const MiniCard: React.FC<MiniCardProps> = ({ note, oct = 3, jp, highlight, compact = false }) => {
  let borderClass = 'border-[#6b4724]/70 bg-[#faf7ee] text-[#1a0f07]';
  if (highlight === 'gold') borderClass = 'border-amber-400 bg-amber-100 text-amber-950 ring-1 ring-amber-400 shadow-sm';
  if (highlight === 'blue') borderClass = 'border-sky-400 bg-sky-100 text-sky-950 ring-1 ring-sky-400 shadow-sm';
  if (highlight === 'green') borderClass = 'border-emerald-400 bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400 shadow-sm';
  if (highlight === 'orange') borderClass = 'border-orange-400 bg-orange-100 text-orange-950 ring-1 ring-orange-400 shadow-sm';
  if (highlight === 'red') borderClass = 'border-rose-400 bg-rose-100 text-rose-950 ring-1 ring-rose-400 shadow-sm';

  const sizeClass = compact 
    ? 'w-[20px] h-[28px] rounded-[3px]' 
    : 'w-[24px] h-[34px] sm:w-[28px] sm:h-[38px] rounded-md';

  return (
    <div className={`inline-flex flex-col items-center justify-center border select-none shrink-0 ${sizeClass} ${borderClass}`}>
      <span className={`${compact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'} font-black leading-none flex items-baseline`}>
        {note}
        <span className={`${compact ? 'text-[5.5px]' : 'text-[6px] sm:text-[7px]'} font-bold opacity-75 ml-0.2`}>{oct}</span>
      </span>
      <span className={`${compact ? 'text-[6px]' : 'text-[6.5px] sm:text-[7.5px]'} font-bold opacity-85 leading-none mt-0.5`}>
        {jp}
      </span>
    </div>
  );
};

// -------------------------------------------------------------
// チュートリアル全12問の直感的ステップ図解コンポーネント
// -------------------------------------------------------------
const TutorialVisualGuide: React.FC<{ stageId: string }> = ({ stageId }) => {
  if (stageId === 'tut_1') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#1f130b] p-1.5 rounded-lg border border-amber-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[8.5px]">①山札</span>
            <span className="text-[9px] text-amber-200">タップしてドロー</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-amber-400" />
          <MiniCard note="A" oct={4} jp="ラ" highlight="gold" compact />
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={4} jp="ラ" highlight="red" compact />
            <span className="text-[9px] text-rose-200">➔ 手札0枚に！</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[9px] font-black">
            アガリ（勝利）！
          </span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_2') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#1f130b] p-1.5 rounded-lg border border-amber-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[8.5px]">①役出し</span>
            <div className="flex items-center gap-0.5">
              <MiniCard note="C" oct={3} jp="ド" highlight="gold" compact />
              <MiniCard note="E" oct={3} jp="ミ" highlight="gold" compact />
              <MiniCard note="G" oct={3} jp="ソ" highlight="gold" compact />
            </div>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] text-amber-300 font-bold">Cコード場出し</span>
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={4} jp="ラ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-emerald-300 font-bold">手札0枚アガリ！</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_3') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#0f1722] p-1.5 rounded-lg border border-sky-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold text-[8.5px]">①役出し</span>
            <div className="flex items-center gap-0.5">
              <MiniCard note="D" oct={3} jp="レ" highlight="blue" compact />
              <MiniCard note="E" oct={3} jp="ミ" highlight="blue" compact />
              <MiniCard note="F" oct={3} jp="ファ" highlight="blue" compact />
            </div>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-sky-400" />
          <span className="text-[9px] text-sky-300 font-bold">スケール場出し</span>
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={4} jp="ラ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-emerald-300 font-bold">手札0枚アガリ！</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_4') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#1f130b] p-1.5 rounded-lg border border-amber-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[8.5px]">①役出し</span>
            <div className="flex items-center gap-0.5">
              <MiniCard note="C" oct={3} jp="ド" highlight="gold" compact />
              <MiniCard note="E" oct={3} jp="ミ" highlight="gold" compact />
              <MiniCard note="G" oct={3} jp="ソ" highlight="gold" compact />
            </div>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] text-amber-300 font-bold">Cコード場出し</span>
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={4} jp="ラ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-emerald-300 font-bold">手札0枚アガリ！</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_5') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#1f130b] p-1.5 rounded-lg border border-amber-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[8.5px]">①ポン！</span>
            <MiniCard note="C" oct={3} jp="ド" highlight="gold" compact />
            <MiniCard note="E" oct={3} jp="ミ" highlight="gold" compact />
            <span className="text-[8px] text-amber-200">＋相手の</span>
            <MiniCard note="G" oct={3} jp="ソ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] text-amber-300 font-bold">Cコード完成！</span>
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={4} jp="ラ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-emerald-300 font-bold">手札0枚アガリ！</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_6') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#0f1722] p-1.5 rounded-lg border border-sky-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold text-[8.5px]">①チー！</span>
            <MiniCard note="D" oct={3} jp="レ" highlight="blue" compact />
            <MiniCard note="E" oct={3} jp="ミ" highlight="blue" compact />
            <span className="text-[8px] text-sky-200">＋上家の</span>
            <MiniCard note="F" oct={3} jp="ファ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-sky-400" />
          <span className="text-[9px] text-sky-300 font-bold">スケール完成！</span>
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={4} jp="ラ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-emerald-300 font-bold">手札0枚アガリ！</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_7') {
    return (
      <div className="bg-[#120a05] p-3 rounded-xl border border-[#4a2e18] space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <MiniCard note="F" oct={3} jp="ファ" highlight="green" />
            <span className="text-[10px] text-emerald-300 font-bold">手札</span>
          </div>
          <span className="text-xs text-emerald-400">＋</span>
          <div className="flex items-center gap-1 bg-[#1a2c1f] p-1 rounded-md border border-emerald-700/50">
            <MiniCard note="C" oct={3} jp="ド" compact />
            <MiniCard note="D" oct={3} jp="レ" compact />
            <MiniCard note="E" oct={3} jp="ミ" compact />
            <span className="text-[9px] text-emerald-300 ml-0.5">場の音階</span>
          </div>
          <ArrowRightIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="px-1.5 py-0.5 rounded bg-emerald-900 border border-emerald-400 text-emerald-200 text-[9.5px] font-bold">
            付け札
          </span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_8') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between gap-1 bg-[#0f1722] p-1.5 rounded-lg border border-sky-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold text-[8.5px]">①付け札</span>
            <MiniCard note="C" oct={3} jp="ド" highlight="blue" compact />
            <span className="text-[8.5px] text-sky-200">➔ [D・E・F]先頭</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-sky-400" />
          <span className="text-[9px] text-sky-300 font-bold">[C・D・E・F] に伸長</span>
        </div>
        <div className="flex items-center justify-between gap-1 bg-[#1a0f0a] p-1.5 rounded-lg border border-rose-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold text-[8.5px]">②捨てる</span>
            <MiniCard note="A" oct={2} jp="ラ" highlight="red" compact />
          </div>
          <ArrowRightIcon className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-emerald-300 font-bold">手札0枚アガリ！</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_9') {
    return (
      <div className="bg-[#120a05] p-3 rounded-xl border border-[#4a2e18] space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <MiniCard note="B" oct={3} jp="シ" highlight="gold" />
            <span className="text-[10px] text-amber-300 font-bold">手札</span>
          </div>
          <span className="text-xs text-amber-400">＋</span>
          <div className="flex items-center gap-1 bg-[#291c12] p-1 rounded-md border border-amber-700/50">
            <MiniCard note="C" oct={3} jp="ド" compact />
            <MiniCard note="E" oct={3} jp="ミ" compact />
            <MiniCard note="G" oct={3} jp="ソ" compact />
            <span className="text-[9px] text-amber-300 ml-0.5">Cコード</span>
          </div>
          <ArrowRightIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-400 text-amber-200 text-[9.5px] font-bold">
            CM7 (4和音)
          </span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_10') {
    return (
      <div className="bg-[#120a05] p-3 rounded-xl border border-[#4a2e18] space-y-2 text-[10.5px]">
        {/* Step 1 */}
        <div className="flex items-center justify-between gap-1.5 bg-[#1f130b] p-1.5 rounded-lg border border-orange-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-orange-500/20 text-orange-400 font-black text-[9px]">①入替</span>
            <MiniCard note="E" oct={4} jp="ミ" highlight="orange" compact />
            <span className="text-[9.5px] text-orange-200">➔ G7</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-orange-400" />
          <div className="flex items-center gap-1">
            <span className="text-[9.5px] text-orange-300 font-bold">Em7に変化</span>
            <span className="text-[8px] text-emerald-300 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-600">
              [F4]回収!
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center justify-between gap-1.5 bg-[#112217] p-1.5 rounded-lg border border-emerald-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-black text-[9px]">②付け札</span>
            <MiniCard note="F" oct={4} jp="ファ" highlight="green" compact />
            <span className="text-[9.5px] text-emerald-200">➔ [C・D・E]末尾</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-emerald-400" />
          <span className="text-[9.5px] text-emerald-300 font-bold">[C・D・E・F] 完成</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_11') {
    return (
      <div className="bg-[#120a05] p-3 rounded-xl border border-[#4a2e18] space-y-2 text-[10.5px]">
        {/* Step 1 */}
        <div className="flex items-center justify-between gap-1.5 bg-[#1f130b] p-1.5 rounded-lg border border-orange-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-orange-500/20 text-orange-400 font-black text-[9px]">①入替</span>
            <MiniCard note="B" oct={3} jp="シ" highlight="orange" compact />
            <span className="text-[9.5px] text-orange-200">➔ Am7</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-orange-400" />
          <div className="flex items-center gap-1">
            <span className="text-[9.5px] text-orange-300 font-bold">CM7に変化</span>
            <span className="text-[8px] text-emerald-300 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-600">
              [A3]回収!
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center justify-between gap-1.5 bg-[#112217] p-1.5 rounded-lg border border-emerald-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-black text-[9px]">②付け札</span>
            <MiniCard note="A" oct={3} jp="ラ" highlight="green" compact />
            <span className="text-[9.5px] text-emerald-200">➔ [E・F・G]末尾</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-emerald-400" />
          <span className="text-[9.5px] text-emerald-300 font-bold">[E・F・G・A] 完成</span>
        </div>
      </div>
    );
  }

  if (stageId === 'tut_12') {
    return (
      <div className="bg-[#120a05] p-2.5 rounded-xl border border-[#4a2e18] space-y-1 text-[10px]">
        {/* Step 1 */}
        <div className="flex items-center justify-between gap-1 bg-[#1f130b] p-1.5 rounded-lg border border-orange-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold text-[8.5px]">①入替</span>
            <MiniCard note="E" oct={4} jp="ミ" highlight="orange" compact />
            <span className="text-[8.5px] text-orange-200">➔ G7</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-orange-400" />
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-orange-300 font-bold">Em7に変化</span>
            <span className="text-[8px] text-emerald-300 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-600 font-bold">
              [F4]回収!
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center justify-between gap-1 bg-[#112217] p-1.5 rounded-lg border border-emerald-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[8.5px]">②音階</span>
            <MiniCard note="F" oct={4} jp="ファ" highlight="green" compact />
            <span className="text-[8.5px] text-emerald-200">➔ [C・D・E]末尾</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] text-emerald-300 font-bold">[C-D-E-F] 伸長</span>
        </div>

        {/* Step 3 */}
        <div className="flex items-center justify-between gap-1 bg-[#1a2c1f] p-1.5 rounded-lg border border-emerald-900/60">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[8.5px]">③進化</span>
            <MiniCard note="C" oct={4} jp="ド" highlight="green" compact />
            <span className="text-[8.5px] text-emerald-200">➔ Dmコード</span>
          </div>
          <ArrowRightIcon className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] text-emerald-300 font-bold">Dm7 4和音完成！</span>
        </div>
      </div>
    );
  }

  return null;
};

// ヒント文から「1手ずつのステップ配列」を抽出するヘルパー
function parseHintSteps(hintText: string): string[] {
  const lines = hintText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const numberedSteps = lines.filter(l => /^[①②③④⑤1-9]/.test(l));
  if (numberedSteps.length > 0) {
    return numberedSteps;
  }
  if (lines.length > 1) {
    return lines;
  }
  return [hintText];
}

export const PuzzlePlay: React.FC<PuzzlePlayProps> = ({
  stage,
  onBackToSelect,
  onSelectStage,
  soundEnabled,
  assistEnabled,
  onOpenOptions,
}) => {
  // ステージ初期設定（通常ドローかポン・チー割り込み開始か）
  const hasInterrupt = !!stage.initialInterrupt;
  const initialCards = stage.initialHand.map(c => ({ ...c }));
  
  // 通常パズル時は末尾1枚をドローしたカードとし、ポン・チー時は初期手札そのまま＋捨て札セット
  const initialDeckCard = !hasInterrupt && initialCards.length > 0 ? initialCards[initialCards.length - 1] : null;
  const initialBaseHand = !hasInterrupt && initialCards.length > 0 ? initialCards.slice(0, initialCards.length - 1) : initialCards;

  // フェーズステート ('draw' | 'interrupt' | 'main')
  const [phase, setPhase] = useState<'draw' | 'interrupt' | 'main'>(hasInterrupt ? 'interrupt' : 'draw');
  const [deckCard, setDeckCard] = useState<CardType | null>(initialDeckCard);
  const [hand, setHand] = useState<CardType[]>(initialBaseHand);
  const [justDrawnCardId, setJustDrawnCardId] = useState<string | null>(null);
  const [lastSwappedInCardId, setLastSwappedInCardId] = useState<string | null>(null);
  const [lastActionText, setLastActionText] = useState<string>(
    hasInterrupt ? `${stage.initialInterrupt?.type === 'pon' ? 'CPU 2' : 'CPU 3'} が捨てました！` : 'ステージ開始：山札を引いてください'
  );
  
  // 捨て札ステート
  const [discardPile, setDiscardPile] = useState<DiscardItem[]>(() => {
    if (stage.initialInterrupt) {
      return [{ card: stage.initialInterrupt.discardedCard, discarderId: stage.initialInterrupt.discarderId, isHidden: false }];
    }
    return [];
  });
  const [lastDiscardItem, setLastDiscardItem] = useState<DiscardItem | undefined>(() => {
    if (stage.initialInterrupt) {
      return { card: stage.initialInterrupt.discardedCard, discarderId: stage.initialInterrupt.discarderId, isHidden: false };
    }
    return undefined;
  });

  // 場のステート
  const [field, setField] = useState<Meld[]>(() => stage.initialField.map(m => ({ ...m, cards: [...m.cards] })));
  const [hasSwapped, setHasSwapped] = useState(false);
  const [selectedHand, setSelectedHand] = useState<string[]>([]);
  const [selectedMeld, setSelectedMeld] = useState<string | null>(null);
  const [lastAddedCardId, setLastAddedCardId] = useState<string | null>(null);

  // 演出・ポップアップステート（チュートリアルのみ開始時にお題モーダルを表示）
  const isTutorial = stage.id.startsWith('tut_');
  const [isCleared, setIsCleared] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [winEffectName, setWinEffectName] = useState<string | null>(null);
  const [cutInInfo, setCutInInfo] = useState<{ type: 'pon' | 'chii'; playerName: string } | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(isTutorial);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [unlockedStepCount, setUnlockedStepCount] = useState<number>(1);
  const [lastSwappedMeldId, setLastSwappedMeldId] = useState<string | null>(null);
  const [swappedInCardId, setSwappedInCardId] = useState<string | null>(null);
  const [ejectedCardInfo, setEjectCardInfo] = useState<{ meldId: string; card: CardType } | null>(null);

  // ヒントステップのパース
  const hintSteps = parseHintSteps(stage.hint);

  // ステージ切り替え時のリセット
  const resetStage = useCallback(() => {
    const isInt = !!stage.initialInterrupt;
    const freshCards = stage.initialHand.map(c => ({ ...c }));
    const freshDeckCard = !isInt && freshCards.length > 0 ? freshCards[freshCards.length - 1] : null;
    const freshBaseHand = !isInt && freshCards.length > 0 ? freshCards.slice(0, freshCards.length - 1) : freshCards;

    setPhase(isInt ? 'interrupt' : 'draw');
    setDeckCard(freshDeckCard);
    setHand(freshBaseHand);
    setJustDrawnCardId(null);
    setLastSwappedInCardId(null);
    setLastActionText(isInt ? `${stage.initialInterrupt?.type === 'pon' ? 'CPU 2' : 'CPU 3'} が捨てました！` : 'ステージ開始：山札を引いてください');
    
    const initialDiscards = stage.initialInterrupt 
      ? [{ card: stage.initialInterrupt.discardedCard, discarderId: stage.initialInterrupt.discarderId, isHidden: false }] 
      : [];
    setDiscardPile(initialDiscards);
    setLastDiscardItem(initialDiscards[0]);

    setField(stage.initialField.map(m => ({ ...m, cards: [...m.cards] })));
    setHasSwapped(false);
    setSelectedHand([]);
    setSelectedMeld(null);
    setLastAddedCardId(null);
    setIsCleared(false);
    setIsFailed(false);
    setWinEffectName(null);
    setCutInInfo(null);
    setShowIntroModal(false);
    setShowHintModal(false);
    setShowRuleModal(false);
    setShowDiscardModal(false);
    setUnlockedStepCount(1);
    setLastSwappedMeldId(null);
    setSwappedInCardId(null);
    setEjectCardInfo(null);
  }, [stage]);

  useEffect(() => {
    const isInt = !!stage.initialInterrupt;
    const freshCards = stage.initialHand.map(c => ({ ...c }));
    const freshDeckCard = !isInt && freshCards.length > 0 ? freshCards[freshCards.length - 1] : null;
    const freshBaseHand = !isInt && freshCards.length > 0 ? freshCards.slice(0, freshCards.length - 1) : freshCards;

    setPhase(isInt ? 'interrupt' : 'draw');
    setDeckCard(freshDeckCard);
    setHand(freshBaseHand);
    setJustDrawnCardId(null);
    setLastSwappedInCardId(null);
    setLastActionText(isInt ? `${stage.initialInterrupt?.type === 'pon' ? 'CPU 2' : 'CPU 3'} が捨てました！` : 'ステージ開始：山札を引いてください');
    
    const initialDiscards = stage.initialInterrupt 
      ? [{ card: stage.initialInterrupt.discardedCard, discarderId: stage.initialInterrupt.discarderId, isHidden: false }] 
      : [];
    setDiscardPile(initialDiscards);
    setLastDiscardItem(initialDiscards[0]);

    setField(stage.initialField.map(m => ({ ...m, cards: [...m.cards] })));
    setHasSwapped(false);
    setSelectedHand([]);
    setSelectedMeld(null);
    setLastAddedCardId(null);
    setIsCleared(false);
    setWinEffectName(null);
    setCutInInfo(null);
    setShowIntroModal(stage.id.startsWith('tut_'));
    setShowHintModal(false);
    setShowRuleModal(false);
    setShowDiscardModal(false);
    setUnlockedStepCount(1);
    setLastSwappedMeldId(null);
    setSwappedInCardId(null);
    setEjectCardInfo(null);
  }, [stage]);

  // 🎴 ドロー（ツモ）アクション
  const handleDraw = () => {
    if (phase !== 'draw' || !deckCard) return;

    if (soundEnabled) {
      playCardTone(deckCard.absVal);
    }

    const noteName = NOTE_NAMES[deckCard.absVal % 7];
    const oct = Math.floor(deckCard.absVal / 7) + 2;

    setHand(prev => [...prev, deckCard]);
    setJustDrawnCardId(deckCard.id);
    setDeckCard(null);
    setPhase('main');
    setLastActionText(`山札から [${noteName}${oct}] を引きました`);
  };

  // アガリ判定（手札が0枚になった瞬間：WinEffect演出 ➔ クリアモーダル）
  useEffect(() => {
    if (phase === 'main' && hand.length === 0 && !isCleared) {
      if (soundEnabled) playWinSound();
      
      // 対戦モード同様にアガリ中央ズーム演出を表示（テンポ良く850msでクリアモーダルへ）
      setWinEffectName('あなた');
      const timer = setTimeout(() => {
        setWinEffectName(null);
        setIsCleared(true);
      }, 850);

      // クリア状況をlocalStorageに保存
      try {
        const raw = localStorage.getItem(CLEARED_STORAGE_KEY);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(stage.id)) {
          list.push(stage.id);
          localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify(list));
        }
      } catch (e) {
        console.error('Failed to save clear state:', e);
      }

      return () => clearTimeout(timer);
    }
  }, [hand, phase, isCleared, stage.id, soundEnabled]);

  // 次のステージを取得
  const allStages = PUZZLE_CHAPTERS.flatMap(ch => ch.stages);
  const currentIdx = allStages.findIndex(s => s.id === stage.id);
  const nextStage = currentIdx !== -1 && currentIdx < allStages.length - 1 ? allStages[currentIdx + 1] : null;

  // 手札選択ハンドラ
  const handleCardClick = (card: CardType) => {
    if (phase === 'draw') return;

    const cardId = card.id;
    if (soundEnabled) {
      playCardTone(card.absVal);
    }

    if (phase === 'interrupt') {
      setSelectedHand(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId) 
          : prev.length < 2 ? [...prev, cardId] : [prev[1], cardId]
      );
      return;
    }

    if (selectedMeld !== null) {
      setSelectedHand(prev => prev.includes(cardId) ? [] : [cardId]);
      return;
    }

    setSelectedHand(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
    );
  };

  // 場のセット選択ハンドラ
  const handleSelectMeld = (meldId: string) => {
    if (phase !== 'main') return;

    setSelectedMeld(prev => {
      const next = prev === meldId ? null : meldId;
      if (next !== null && selectedHand.length > 1) {
        setSelectedHand([]);
      }
      return next;
    });
  };

  // 役出しアクション
  const handleMeld = (type: 'chord' | 'scale') => {
    const selectedObjs = hand.filter(c => selectedHand.includes(c.id));
    const seq = type === 'chord' ? getChordInterpretation(selectedObjs) : getScaleInterpretation(selectedObjs);
    if (!seq) return;

    if (soundEnabled) playMelody(seq.map(c => c.absVal));

    const newMeld: Meld = {
      id: `p_m_${Date.now()}`,
      ownerId: 0,
      type,
      cards: seq
    };

    const meldName = type === 'chord' ? getChordSymbol(seq) : 'スケール';
    setLastActionText(`${meldName} を場に出しました`);

    setField(prev => [...prev, newMeld]);
    setHand(prev => prev.filter(c => !selectedHand.includes(c.id)));
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  // 付け札アクション
  const handleAdd = () => {
    if (selectedHand.length !== 1 || !selectedMeld) return;
    const card = hand.find(c => c.id === selectedHand[0]);
    const meld = field.find(m => m.id === selectedMeld);
    if (!card || !meld) return;

    const newSeq = tryAddCardToMeld(card, meld);
    if (!newSeq) return;

    if (soundEnabled) playMelody(newSeq.map(c => c.absVal));

    const noteName = NOTE_NAMES[card.absVal % 7];
    const targetName = meld.type === 'chord' ? getChordSymbol(meld.cards) : 'スケール';
    setLastActionText(`[${noteName}] を ${targetName} に付け札しました`);

    setLastAddedCardId(card.id);
    setTimeout(() => setLastAddedCardId(null), 1000);

    setField(prev => prev.map(m => m.id === meld.id ? { ...m, cards: newSeq } : m));
    setHand(prev => prev.filter(c => c.id !== card.id));
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  // スワップアクション
  const handleSwap = () => {
    if (hasSwapped || selectedHand.length !== 1 || !selectedMeld) return;
    const card = hand.find(c => c.id === selectedHand[0]);
    const meld = field.find(m => m.id === selectedMeld);
    if (!card || !meld || meld.type !== 'chord') return;

    const swapRes = trySwapCardInMeld(card, meld);
    if (!swapRes) return;

    if (soundEnabled) {
      playSwapSound();
      setTimeout(() => playMelody(swapRes.newSequence.map(c => c.absVal)), 120);
    }

    setLastSwappedMeldId(meld.id);
    setSwappedInCardId(card.id);
    setEjectCardInfo({ meldId: meld.id, card: swapRes.replacedCard });
    setTimeout(() => {
      setLastSwappedMeldId(null);
      setSwappedInCardId(null);
      setEjectCardInfo(null);
    }, 550);

    const oldName = getChordSymbol(meld.cards);
    setLastActionText(`${oldName} ➔ ${swapRes.newSymbol} にスワップ（入替）しました`);

    setField(prev => prev.map(m => m.id === meld.id ? { ...m, cards: swapRes.newSequence } : m));
    setHand(prev => {
      const idx = prev.findIndex(c => c.id === card.id);
      const next = [...prev];
      next.splice(idx, 1, swapRes.replacedCard);
      return next;
    });

    setLastSwappedInCardId(swapRes.replacedCard.id);
    setTimeout(() => setLastSwappedInCardId(null), 1200);

    setHasSwapped(true);
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  // ポン・チー割り込みアクション
  const handleInterruptAction = (type: 'pon' | 'chii') => {
    if (phase !== 'interrupt' || !lastDiscardItem || selectedHand.length !== 2) return;

    const discardedCard = lastDiscardItem.card;
    const selectedCards = hand.filter(c => selectedHand.includes(c.id));
    const testCards = [discardedCard, ...selectedCards];

    const seq = type === 'pon' ? getChordInterpretation(testCards) : getScaleInterpretation(testCards);
    if (!seq) return;

    if (soundEnabled) {
      playCutInSound(type);
    }

    setCutInInfo({ type, playerName: 'あなた' });
    setTimeout(() => {
      setCutInInfo(null);
    }, 900);

    const newMeld: Meld = {
      id: `p_m_int_${Date.now()}`,
      ownerId: 0,
      type: type === 'pon' ? 'chord' : 'scale',
      cards: seq
    };

    setTimeout(() => {
      if (soundEnabled) playMelody(seq.map(c => c.absVal));
    }, 250);

    const meldName = type === 'pon' ? getChordSymbol(seq) : 'スケール';
    setLastActionText(`${meldName} を${type === 'pon' ? 'ポン' : 'チー'}で場に出しました！不要なカードを1枚捨ててください`);

    setField(prev => [...prev, newMeld]);
    setHand(prev => prev.filter(c => !selectedHand.includes(c.id)));
    setDiscardPile(prev => prev.slice(0, prev.length - 1)); // 捨て札から回収
    setPhase('main'); // 鳴いた後はメイン手番へ移行
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  // 捨て札アクション
  const handleDiscard = (cardId: string) => {
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    if (soundEnabled) {
      playCardTone(card.absVal);
    }

    const remainingHand = hand.filter(c => c.id !== cardId);
    const noteName = NOTE_NAMES[card.absVal % 7];
    const oct = Math.floor(card.absVal / 7) + 2;

    const discardItem: DiscardItem = { card, discarderId: 0, isHidden: false };
    setLastDiscardItem(discardItem);
    setDiscardPile(prev => [...prev, discardItem]);
    setHand(remainingHand);
    setSelectedHand([]);
    setSelectedMeld(null);

    if (remainingHand.length === 0) {
      // 成功：手札0枚アガリ！
      setLastActionText(`[${noteName}${oct}] を捨てて手札0枚アガリ！`);
    } else {
      // 失敗：手札がまだ残っている状態で捨ててしまった！
      setLastActionText(`[${noteName}${oct}] を捨てましたが、手札が残っています（手詰まり）`);
      setTimeout(() => {
        setIsFailed(true);
      }, 400);
    }
  };

  // 割り込み（ポン・チー）判定
  const discardedCard = lastDiscardItem?.card;
  const isInterruptTurn = phase === 'interrupt';
  let canPon = false;
  let canChii = false;

  const highlightCardIds = new Set<string>();
  const allValidCombs: { type: 'pon' | 'chii'; cardIds: string[] }[] = [];

  if (isInterruptTurn && discardedCard) {
    // ポン候補
    const ponCombs = getValidPonCombs(hand, discardedCard);
    ponCombs.forEach(comb => {
      allValidCombs.push({ type: 'pon', cardIds: comb });
      if (assistEnabled) comb.forEach(id => highlightCardIds.add(id));
    });

    // チー候補（直前のプレイヤー/CPU 3の捨て札から）
    if (stage.initialInterrupt?.discarderId === 3) {
      const chiiCombs = getValidChiiCombs(hand, discardedCard);
      chiiCombs.forEach(comb => {
        allValidCombs.push({ type: 'chii', cardIds: comb });
        if (assistEnabled) comb.forEach(id => highlightCardIds.add(id));
      });
    }

    if (selectedHand.length === 2) {
      const selectedCards = hand.filter(c => selectedHand.includes(c.id));
      const testCards = [discardedCard, ...selectedCards];
      if (getChordInterpretation(testCards) !== null) canPon = true;
      if (getScaleInterpretation(testCards) !== null) canChii = true;
    }
  }

  // 割り込み発生時の自動初期選択アシスト
  useEffect(() => {
    if (isInterruptTurn && allValidCombs.length > 0 && selectedHand.length === 0) {
      setSelectedHand(allValidCombs[0].cardIds);
    }
  }, [isInterruptTurn]);

  // 手札・場の選択判定
  const selectedObjs = hand.filter(c => selectedHand.includes(c.id));
  const isValidChordSelection = selectedObjs.length === 3 && getChordInterpretation(selectedObjs) !== null;
  const isValidScaleSelection = selectedObjs.length >= 3 && getScaleInterpretation(selectedObjs) !== null;

  let isValidAddSelection = false;
  let isValidSwapSelection = false;
  let currentSwapResult: SwapResult | null = null;

  if (selectedHand.length === 1 && selectedMeld !== null) {
    const card = hand.find(c => c.id === selectedHand[0]);
    const meld = field.find(m => m.id === selectedMeld);
    if (card && meld) {
      if (tryAddCardToMeld(card, meld) !== null) isValidAddSelection = true;
      if (!hasSwapped && meld.type === 'chord') {
        currentSwapResult = trySwapCardInMeld(card, meld);
        if (currentSwapResult !== null) isValidSwapSelection = true;
      }
    }
  }

  // 🌟 初心者アシストナビ計算（対戦モードと100%完全同一ロジック）
  const actionableMeldIds = new Set<string>();
  const reactionAddCardIds = new Set<string>();
  const reactionSwapCardIds = new Set<string>();
  let readyToMeldCardIds = new Set<string>();
  let twoCardPairCardIds = new Set<string>();

  if (assistEnabled && phase === 'main') {
    // 1. 場のセットへの付け札・スワップ可能性
    field.forEach(meld => {
      let meldActionable = false;
      hand.forEach(card => {
        const canAdd = tryAddCardToMeld(card, meld) !== null;
        const canSwap = !hasSwapped && meld.type === 'chord' && trySwapCardInMeld(card, meld) !== null;
        if (canAdd || canSwap) {
          meldActionable = true;
          if (selectedMeld === meld.id) {
            if (canAdd) reactionAddCardIds.add(card.id);
            if (canSwap) reactionSwapCardIds.add(card.id);
          }
        }
      });
      if (selectedHand.length === 1) {
        const selCard = hand.find(c => c.id === selectedHand[0]);
        if (selCard) {
          const canAdd = tryAddCardToMeld(selCard, meld) !== null;
          const canSwap = !hasSwapped && meld.type === 'chord' && trySwapCardInMeld(selCard, meld) !== null;
          if (canAdd || canSwap) actionableMeldIds.add(meld.id);
        }
      } else if (meldActionable) {
        actionableMeldIds.add(meld.id);
      }
    });

    // 2. 手札カード選択時の「連結可能性（2段階アシスト）」判定（手札1〜2枚選択時）
    if (selectedMeld === null && (selectedHand.length === 1 || selectedHand.length === 2)) {
      const selectedObjs = hand.filter(c => selectedHand.includes(c.id));
      const unselectedObjs = hand.filter(c => !selectedHand.includes(c.id));
      const result = analyzeHandConnections(selectedObjs, unselectedObjs);
      readyToMeldCardIds = result.readyToMeldIds;
      twoCardPairCardIds = result.twoCardPairIds;
    }
  }

  // アクションバッジ生成
  const actionBadges: ActionBadge[] = [];
  if (isInterruptTurn) {
    if (canPon) actionBadges.push({ text: 'ポン可能！', type: 'chord' });
    if (canChii) actionBadges.push({ text: 'チー可能！', type: 'scale' });
  } else {
    if (isValidScaleSelection) {
      actionBadges.push({ text: 'スケール', type: 'scale' });
    }
    if (isValidChordSelection) {
      const sym = getChordSymbol(selectedObjs);
      actionBadges.push({ text: `コード (${sym})`, type: 'chord' });
    }
    if (isValidAddSelection) {
      actionBadges.push({ text: '付け札', type: 'add' });
    }
    if (isValidSwapSelection && currentSwapResult) {
      actionBadges.push({ text: `入替 (${currentSwapResult.newSymbol})`, type: 'swap' });
    }
  }

  // プレイヤーモック情報（4人対戦モードと100%同一構造）
  const dummyPlayers: Player[] = [
    {
      id: 0,
      name: 'あなた',
      hand: hand,
      isCPU: false,
      hasMelded: false,
      justDrawnCardId: justDrawnCardId || null,
      actions: { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }
    },
    {
      id: 1,
      name: 'CPU 1',
      hand: [
        { id: 'cpu1_1', val: 0, oct: 3, absVal: 7 },
        { id: 'cpu1_2', val: 2, oct: 3, absVal: 9 }
      ],
      isCPU: true,
      hasMelded: true,
      justDrawnCardId: null,
      actions: { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }
    },
    {
      id: 2,
      name: 'CPU 2',
      hand: [
        { id: 'cpu2_1', val: 1, oct: 3, absVal: 8 },
        { id: 'cpu2_2', val: 3, oct: 3, absVal: 10 }
      ],
      isCPU: true,
      hasMelded: true,
      justDrawnCardId: null,
      actions: { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }
    },
    {
      id: 3,
      name: 'CPU 3',
      hand: [
        { id: 'cpu3_1', val: 4, oct: 3, absVal: 11 },
        { id: 'cpu3_2', val: 6, oct: 3, absVal: 13 }
      ],
      isCPU: true,
      hasMelded: true,
      justDrawnCardId: null,
      actions: { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }
    }
  ];

  const guideMessage = isInterruptTurn
    ? `相手が捨てたカードに対して「ポン」または「チー」で割り込めます（手札2枚を選択）`
    : phase === 'draw'
      ? '山札をタップしてカードを引いてください'
      : selectedHand.length === 0
        ? '手札のカードを選んでアクションを行ってください'
        : selectedHand.length === 1 && selectedMeld !== null
          ? '場のセットに対して「付け札」や「入替」が可能です'
          : '手札から「コード」「スケール」で役を出すか、1枚選んで「捨てる」ことができます';

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#140b06] text-[#e8d5b5] select-none overflow-hidden">
      
      {/* 1. パズルヘッダー（対戦モードHeader完全統一・洗練デザイン） */}
      <header className="bg-[#23160e] px-3 py-2 shadow-md flex justify-between items-center shrink-0 z-20 border-b border-[#3f2719]">
        {/* 左側: 一覧へ戻る ＆ ステージタイトル */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBackToSelect}
            className="flex items-center gap-1 px-2 py-1 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 text-xs font-bold rounded-lg border border-amber-700/50 transition active:scale-95 shadow-xs shrink-0"
            title="ステージ一覧へ戻る"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">一覧</span>
          </button>
          
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xs shrink-0 font-bold text-[11px]">
              ♪
            </div>
            <h2 className="text-xs sm:text-sm font-black text-amber-100 tracking-tight truncate font-serif">
              {stage.title}
            </h2>
          </div>
        </div>

        {/* 右側: 整理されたボタングループ */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* お題確認ボタン */}
          <button
            onClick={() => setShowIntroModal(true)}
            className="flex items-center gap-1 px-2 py-1 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 text-xs font-bold rounded-lg border border-amber-700/50 transition active:scale-95 shadow-xs"
            title="お題を再確認"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>お題</span>
          </button>

          {/* ヒントボタン（目立つゴールドピル） */}
          <button
            onClick={() => {
              setUnlockedStepCount(1);
              setShowHintModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-b from-amber-900/60 to-amber-950 hover:from-amber-800/80 hover:to-amber-900 text-amber-200 text-xs font-black rounded-lg border border-amber-500/70 transition active:scale-95 shadow-xs"
            title="ヒントを見る"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            <span className="text-amber-100">ヒント</span>
          </button>

          {/* リセットボタン */}
          <button
            onClick={resetStage}
            className="p-1.5 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 rounded-lg border border-amber-700/50 flex items-center justify-center transition active:scale-95 shadow-xs"
            title="最初からやり直す"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* 区切り線 */}
          <div className="w-[1px] h-4 bg-amber-900/40 mx-0.5" />

          {/* 遊び方ボタン */}
          <button
            onClick={() => setShowRuleModal(true)}
            className="p-1.5 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 rounded-lg border border-amber-700/50 flex items-center justify-center transition active:scale-95 shadow-xs"
            title="遊び方・ルールマニュアル"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* 設定ボタン */}
          {onOpenOptions && (
            <button
              onClick={onOpenOptions}
              className="p-1.5 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 rounded-lg border border-amber-700/50 flex items-center justify-center transition active:scale-95 shadow-xs"
              title="設定（アシスト・サウンド）"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </header>

      {/* 2. プレイヤー情報（4人ステータス：対戦モードと100%完全同一位置・同一構造） */}
      <PlayerStatus
        players={dummyPlayers}
        turn={isInterruptTurn ? (stage.initialInterrupt?.discarderId ?? 0) : 0}
        roundOver={isCleared}
      />

      {/* 3. メインゲーム画面（対戦モードと100%同一構造） */}
      <main className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden w-full min-h-0">
        
        {/* ガイドメッセージ ＆ 山札・捨て札 */}
        <GuideAndDeck
          guideMessage={guideMessage}
          lastActionText={lastActionText}
          isPlayerTurn={!isInterruptTurn}
          isDrawPhase={phase === 'draw'}
          isMyInterrupt={isInterruptTurn}
          roundOver={isCleared}
          deckCount={phase === 'draw' ? 1 : 0}
          lastDiscardItem={lastDiscardItem}
          onDraw={handleDraw}
          onOpenDiscardModal={() => setShowDiscardModal(true)}
        />

        {/* ゲームフィールド（場） */}
        <Field
          field={field}
          players={dummyPlayers}
          selectedMeldId={selectedMeld}
          lastAddedCardId={lastAddedCardId}
          lastSwappedMeldId={lastSwappedMeldId}
          swappedInCardId={swappedInCardId}
          ejectedCardInfo={ejectedCardInfo}
          actionableMeldIds={actionableMeldIds}
          isPlayerTurn={!isInterruptTurn}
          isMainPhase={phase === 'main'}
          onSelectMeld={handleSelectMeld}
        />
      </main>

      {/* 4. インジケーター表示コンテナ（横1行） */}
      <div className="px-2 pb-1 shrink-0">
        <IndicatorBar
          selectedCount={selectedHand.length}
          selectedCards={hand.filter(c => selectedHand.includes(c.id))}
          formedMeldName={isValidChordSelection ? getChordSymbol(selectedObjs) : undefined}
          actionBadges={actionBadges}
          isPlayerTurn={!isInterruptTurn}
          isMainPhase={phase === 'main'}
          isInterruptTurn={isInterruptTurn}
          isMyInterrupt={isInterruptTurn}
          selectedMeldId={selectedMeld}
          hasSwappedThisTurn={hasSwapped}
        />
      </div>

      {/* 5. アクション操作コンテナ（横1行） */}
      <div className="px-2 pb-1 shrink-0">
        <ActionBar
          selectedCount={selectedHand.length}
          isPlayerTurn={!isInterruptTurn}
          isMainPhase={phase === 'main'}
          isInterruptTurn={isInterruptTurn}
          isMyInterrupt={isInterruptTurn}
          canPon={canPon}
          canChii={canChii}
          isValidScaleSelection={isValidScaleSelection}
          isValidChordSelection={isValidChordSelection}
          isValidAddSelection={isValidAddSelection}
          isValidSwapSelection={isValidSwapSelection}
          onMeld={(type) => handleMeld(type)}
          onAdd={handleAdd}
          onSwap={handleSwap}
          onDiscard={handleDiscard}
          onPassInterrupt={() => {}}
          onInterruptAction={(type) => handleInterruptAction(type)}
          firstSelectedCardId={selectedHand.length === 1 ? selectedHand[0] : undefined}
        />
      </div>

      {/* 6. プレイヤー手札コンテナ（全アシストナビ完全稼働） */}
      <div className="px-2 pb-2 shrink-0">
        <Hand
          hand={hand}
          selectedHand={selectedHand}
          justDrawnCardId={justDrawnCardId || undefined}
          lastSwappedInCardId={lastSwappedInCardId}
          highlightCardIds={highlightCardIds}
          reactionAddCardIds={reactionAddCardIds}
          reactionSwapCardIds={reactionSwapCardIds}
          readyToMeldCardIds={readyToMeldCardIds}
          twoCardPairCardIds={twoCardPairCardIds}
          isInterruptTurn={isInterruptTurn}
          isMyInterrupt={isInterruptTurn}
          onCardClick={handleCardClick}
        />
      </div>

      {/* 🌟 お題導入モーダル */}
      {showIntroModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[90] p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#1f120a] rounded-2xl p-4 sm:p-5 max-w-sm w-full border border-[#8a6538] shadow-2xl space-y-3 animate-in zoom-in-95 my-auto">
            
            <div className="flex items-center justify-between border-b border-[#4a2e18] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#140b06] border border-[#6b4724] flex items-center justify-center text-[#d4af37]">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-[#a88956] tracking-wider uppercase block">
                    Stage Mission
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#f4ebd9] font-serif">
                    {stage.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowIntroModal(false)} 
                className="text-[#a88956] hover:text-white p-1 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* お題の文章 */}
            <div className="bg-[#150c07] p-3 rounded-xl border border-[#4a2e18] space-y-1.5 shadow-inner">
              <span className="text-[10.5px] font-bold text-[#d4af37] block">
                【 お題 】
              </span>
              <p className="text-xs text-[#e8d5b5] leading-relaxed font-medium whitespace-pre-line">
                {stage.description}
              </p>
            </div>

            {/* 🌟 T-1 専用：ゲームフロー＆アガリの基本解説パネル */}
            {stage.id === 'tut_1' && (
              <div className="bg-[#120a05] p-2.5 rounded-xl border border-amber-500/40 space-y-2">
                <span className="text-[10px] font-bold text-amber-300 block text-center">
                  🔄 1ターンの基本手番サイクル
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-[#1f130b] p-1.5 rounded-lg border border-amber-900/60 flex flex-col items-center">
                    <span className="text-[8.5px] text-amber-400 font-bold">① 引く</span>
                    <span className="text-[8px] text-[#cfbe99] mt-0.5">山札からドロー</span>
                  </div>
                  <div className="bg-[#112217] p-1.5 rounded-lg border border-emerald-900/60 flex flex-col items-center">
                    <span className="text-[8.5px] text-emerald-400 font-bold">② 減らす</span>
                    <span className="text-[8px] text-[#cfbe99] mt-0.5">役出し / 付け札</span>
                  </div>
                  <div className="bg-[#220d0f] p-1.5 rounded-lg border border-rose-900/60 flex flex-col items-center">
                    <span className="text-[8.5px] text-rose-400 font-bold">③ 捨てる</span>
                    <span className="text-[8px] text-[#cfbe99] mt-0.5">不要な1枚</span>
                  </div>
                </div>
                <div className="bg-emerald-950/80 p-1.5 rounded-lg border border-emerald-500/60 text-center">
                  <span className="text-[9.5px] text-emerald-300 font-black">
                    🎉 最後の1枚を捨てて「手札0枚」でアガリ（勝利）！
                  </span>
                </div>
              </div>
            )}

            {/* スタートボタン */}
            <button
              onClick={() => setShowIntroModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-[#8a6538] via-[#a88049] to-[#8a6538] hover:from-[#9c7442] hover:via-[#b88e54] hover:to-[#9c7442] text-[#140b06] font-black rounded-xl text-xs tracking-wider transition active:scale-98 shadow-md flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>挑戦する</span>
            </button>
          </div>
        </div>
      )}

      {/* 💡 ステップ式ヒントモーダル */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[90] p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#1f120a] rounded-2xl p-4 sm:p-5 max-w-sm w-full border border-[#8a6538] shadow-2xl space-y-3 animate-in zoom-in-95 my-auto">
            
            <div className="flex items-center justify-between border-b border-[#4a2e18] pb-2">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#f0ba4a]" />
                <h3 className="text-xs font-bold text-[#f4ebd9] font-serif">
                  ステップヒント ({Math.min(unlockedStepCount, hintSteps.length)} / {hintSteps.length})
                </h3>
              </div>
              <button 
                onClick={() => setShowHintModal(false)} 
                className="text-[#a88956] hover:text-white p-1 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {hintSteps.map((stepText, idx) => {
                const isUnlocked = idx < unlockedStepCount;

                if (isUnlocked) {
                  return (
                    <div 
                      key={idx}
                      className="bg-[#150c07] p-2.5 rounded-xl border border-amber-500/60 shadow-inner flex items-start gap-2 animate-in fade-in duration-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#cfbe99] leading-relaxed font-medium">
                        {stepText}
                      </p>
                    </div>
                  );
                }

                if (idx === unlockedStepCount) {
                  return (
                    <button
                      key={idx}
                      onClick={() => setUnlockedStepCount(prev => prev + 1)}
                      className="w-full py-2 px-3 bg-[#26160c] hover:bg-[#382112] text-[#d4af37] font-bold rounded-xl text-xs border border-dashed border-[#8a6538]/80 transition active:scale-98 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#8a6538]" />
                        <span>次のステップ ({idx + 1}) を見る</span>
                      </div>
                      <span className="text-[10px] text-[#9c7849] font-normal">タップして開く</span>
                    </button>
                  );
                }

                return null;
              })}
            </div>

            {unlockedStepCount >= hintSteps.length && (
              <div className="pt-1 animate-in fade-in duration-300">
                <TutorialVisualGuide stageId={stage.id} />
              </div>
            )}

            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 bg-[#1b1008] hover:bg-[#29180c] text-[#a88956] hover:text-[#f4ebd9] font-bold rounded-xl text-xs border border-[#422918] transition mt-1"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 📖 遊び方モーダル（対戦モード共通） */}
      <RuleModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
      />

      {/* 🗃️ 捨て札一覧モーダル（対戦モード共通） */}
      <DiscardModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        discardPile={discardPile}
        players={dummyPlayers}
      />

      {/* ⚡ ポン・チー カットイン演出（対戦モード共通：横スライド） */}
      {cutInInfo && (
        <CutIn type={cutInInfo.type} playerName={cutInInfo.playerName} />
      )}

      {/* 🏆 アガリ専用演出（対戦モード共通：中央ズームインパクト） */}
      {winEffectName && (
        <WinEffect winnerName={winEffectName} />
      )}

      {/* 🏆 クリアおめでとうモーダル */}
      {isCleared && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-gradient-to-b from-[#142319] via-[#1a2c20] to-[#121c15] rounded-2xl p-4 sm:p-5 max-w-sm w-full border border-[#40684f] shadow-2xl text-center space-y-3 animate-in zoom-in-95 my-auto">
            
            <div className="w-11 h-11 mx-auto rounded-full bg-[#1e3826] border border-[#68a880] text-[#a8e0be] flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#7eb894] tracking-widest uppercase block">
                Stage Clear
              </span>
              <h3 className="text-base font-bold text-[#e5f2ea] font-serif">
                お見事！クリア達成！
              </h3>
            </div>

            {/* 音楽理論のポイント解説 */}
            <div className="bg-[#0e1711] p-3 rounded-xl border border-[#2b4736] text-left space-y-1 shadow-inner">
              <span className="text-[10px] font-bold text-[#68a880] flex items-center gap-1 block">
                <Sparkles className="w-3 h-3 text-[#d4af37]" />
                <span>ポイント解説</span>
              </span>
              <p className="text-[11.5px] text-[#b8d4c3] leading-relaxed whitespace-pre-line font-medium">
                {stage.explanation}
              </p>
            </div>

            {/* 視覚的ステップ図解（振り返り） */}
            <TutorialVisualGuide stageId={stage.id} />

            {/* ボタン群 */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={resetStage}
                className="py-2 px-3 bg-[#182a1e] hover:bg-[#223b2b] text-[#a8e0be] text-xs font-bold rounded-xl border border-[#375a43] transition active:scale-95 flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>もう一度</span>
              </button>

              {nextStage ? (
                <button
                  onClick={() => onSelectStage(nextStage)}
                  className="py-2 px-3 bg-[#2d523a] hover:bg-[#386648] text-[#f0faf4] text-xs font-bold rounded-xl shadow-md border border-[#528a64] transition active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>次の問題へ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onBackToSelect}
                  className="py-2 px-3 bg-[#3d2714] hover:bg-[#4d321b] text-[#f4ebd9] text-xs font-bold rounded-xl shadow-md border border-[#8a6538] transition active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>ステージ一覧へ</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ❌ 失敗モーダル（シンプル・ミニマル） */}
      {isFailed && !isCleared && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-[#1c1009] rounded-2xl p-4 sm:p-5 max-w-xs w-full border-2 border-rose-600/70 shadow-[0_10px_35px_rgba(0,0,0,0.9)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400 mb-2 shadow-md">
              <RotateCcw className="w-4 h-4" />
            </div>

            <h3 className="text-base font-black text-rose-200 mb-3">
              残念・・・
            </h3>

            <div className="w-full space-y-2">
              <button
                onClick={resetStage}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md border border-amber-300 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>もう一度やり直す</span>
              </button>

              <button
                onClick={onBackToSelect}
                className="w-full py-1 text-amber-400/70 hover:text-amber-200 text-xs font-bold transition"
              >
                ステージ一覧に戻る
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
