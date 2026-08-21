import React from 'react';
import { Music } from 'lucide-react';
import { Card as CardComponent } from './Card';
import { Card as CardType, DiscardItem } from '../types/game';
import { NOTE_NAMES, NOTE_JP } from '../constants/music';
import { ActionBadge } from './IndicatorBar';
import { TickerText } from './TickerText';

interface ActionBarProps {
  selectedCount: number;
  selectedCards?: CardType[];
  formedMeldName?: string | null;
  actionBadges?: ActionBadge[];
  isPlayerTurn: boolean;
  isDrawPhase?: boolean;
  isMainPhase: boolean;
  isInterruptTurn: boolean;
  isMyInterrupt: boolean;
  canPon: boolean;
  canChii: boolean;
  isValidScaleSelection: boolean;
  isValidChordSelection: boolean;
  isValidAddSelection: boolean;
  isValidSwapSelection?: boolean;
  guideMessage?: string;
  lastActionText?: string;
  deckCount?: number;
  lastDiscardItem?: DiscardItem;
  roundOver?: boolean;
  isDragOverDiscard?: boolean;
  onDraw?: () => void;
  onOpenDiscardModal?: () => void;
  onOpenLogs?: () => void;
  onMeld: (type: 'scale' | 'chord') => void;
  onAdd: () => void;
  onSwap?: () => void;
  onDiscard: (cardId: string) => void;
  onPassInterrupt: () => void;
  onInterruptAction: (type: 'pon' | 'chii') => void;
  firstSelectedCardId?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  selectedCards = [],
  isPlayerTurn,
  isDrawPhase,
  isMainPhase,
  isInterruptTurn,
  isMyInterrupt,
  canPon,
  canChii,
  isValidScaleSelection,
  isValidChordSelection,
  isValidAddSelection,
  isValidSwapSelection,
  guideMessage,
  lastActionText,
  deckCount,
  lastDiscardItem,
  roundOver = false,
  isDragOverDiscard = false,
  onDraw,
  onOpenDiscardModal,
  onOpenLogs,
  onMeld,
  onAdd,
  onSwap,
  onDiscard,
  onPassInterrupt,
  onInterruptAction,
  firstSelectedCardId
}) => {
  const canDraw = isPlayerTurn && isDrawPhase && !roundOver;

  return (
    <div className="bg-[#21130a] border-2 border-[#54331d] rounded-xl p-1.5 sm:p-2 shadow-md flex items-center justify-between gap-2 shrink-0 z-20">
      {/* 🌟 左側カラム：上段（履歴ログ・タップで全履歴） ＋ 中段（ナビ / 手札インジケーター） ＋ 下段（コマンドボタン） */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        
        {/* ── 1段目：履歴ログ（ニューステロップスクロール ＆ タップで対戦履歴モーダル） ── */}
        <div 
          onClick={() => onOpenLogs && onOpenLogs()}
          className="flex items-center justify-between gap-1.5 px-2 py-0.5 rounded bg-[#140b05] hover:bg-[#28160b] border border-amber-900/60 hover:border-amber-600/70 min-h-[20px] overflow-hidden cursor-pointer transition active:scale-[0.99] group select-none shadow-xs"
          title="タップして全対戦履歴を表示"
        >
          <TickerText
            text={lastActionText || 'ゲーム開始'}
            className="text-[9px] sm:text-[9.5px] font-black text-amber-200 group-hover:text-amber-100"
            speed={18}
          />
          <span className="text-[7.5px] sm:text-[8px] font-bold px-1 py-0.2 rounded bg-amber-950/80 text-amber-300/80 border border-amber-800/40 group-hover:border-amber-500/70 shrink-0">
            📜 履歴
          </span>
        </div>

        {/* ── 2段目：操作ガイド ＆ 手札選択インジケーター ── */}
        <div className="bg-[#1b1008] border border-[#452715] rounded-lg px-2 py-0.5 min-h-[23px] flex items-center justify-between gap-1.5 overflow-hidden shadow-inner">
          {selectedCards.length > 0 ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              <span className="text-[10px] font-black text-amber-100 shrink-0">
                手札 <span className="text-amber-300/70 font-normal">({selectedCount}枚):</span>
              </span>
              <div className="flex items-center gap-1 overflow-x-auto py-0.2 h-full">
                {selectedCards.map((c) => {
                  const oct = Math.floor(c.absVal / 7) + 2;
                  const noteIndex = c.absVal % 7;
                  return (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-[#2d190d] border border-amber-500/60 rounded text-[9.5px] font-black text-amber-200 shadow-xs shrink-0"
                    >
                      <span className="text-amber-100">
                        {NOTE_NAMES[noteIndex]}<span className="text-[7.5px] opacity-75">{oct}</span>
                      </span>
                      <span className="text-[8px] text-amber-300/80 font-bold">
                        ({NOTE_JP[noteIndex]})
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center min-w-0 flex-1">
              <p className="text-[9.5px] sm:text-[10px] font-bold text-emerald-100 truncate">
                {guideMessage || '手札からカードを選択してください。'}
              </p>
            </div>
          )}
        </div>

        {/* ── 下段：コマンドボタン群（元の長方形ボタンデザイン） ── */}
        <div className="flex gap-1 items-center justify-between">
          {isInterruptTurn && isMyInterrupt ? (
            <>
              <button 
                onClick={onPassInterrupt} 
                className="flex-1 py-1.5 bg-slate-600 hover:bg-slate-500 border border-slate-400 active:scale-95 text-white text-[11px] font-black rounded-lg shadow-xs transition"
              >
                パス
              </button>
              <button 
                onClick={() => onInterruptAction('chii')} 
                disabled={!canChii || selectedCount !== 2} 
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 disabled:bg-[#1a1109] disabled:border-[#382215] disabled:text-amber-900/40 active:scale-95 text-white text-[11px] font-black rounded-lg shadow-xs transition"
              >
                チー
              </button>
              <button 
                onClick={() => onInterruptAction('pon')} 
                disabled={!canPon || selectedCount !== 2} 
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 border border-rose-400 disabled:bg-[#1a1109] disabled:border-[#382215] disabled:text-amber-900/40 active:scale-95 text-white text-[11px] font-black rounded-lg shadow-xs transition"
              >
                ポン
              </button>
            </>
          ) : isInterruptTurn ? (
            <div className="w-full text-center text-[10.5px] text-amber-300 font-bold animate-pulse py-1 bg-amber-950/80 rounded-lg border border-amber-500/50">
              他プレイヤーの割り込み確認中...
            </div>
          ) : (
            <>
              <button 
                disabled={!isPlayerTurn || !isMainPhase || !isValidScaleSelection} 
                onClick={() => onMeld('scale')} 
                className="flex-1 py-1.5 sm:py-1 bg-sky-600 hover:bg-sky-500 border border-sky-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
                title="音階（3音以上）を場に出す"
              >
                スケール
              </button>
              <button 
                disabled={!isPlayerTurn || !isMainPhase || !isValidChordSelection} 
                onClick={() => onMeld('chord')} 
                className="flex-1 py-1.5 sm:py-1 bg-amber-600 hover:bg-amber-500 border border-amber-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
                title="和音（3音）を場に出す"
              >
                コード
              </button>
              <button 
                disabled={!isPlayerTurn || !isMainPhase || !isValidAddSelection} 
                onClick={onAdd} 
                className="flex-1 py-1.5 sm:py-1 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
                title="選択した1枚を場のセットに付ける"
              >
                付け札
              </button>
              <button 
                disabled={!isPlayerTurn || !isMainPhase || !isValidSwapSelection} 
                onClick={onSwap} 
                className="flex-1 py-1.5 sm:py-1 bg-orange-600 hover:bg-orange-500 border border-orange-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
                title="手札の1枚と場の1枚を入れ替えて手札に回収する"
              >
                入れ替え
              </button>
              <button 
                disabled={!isPlayerTurn || !isMainPhase || selectedCount !== 1 || !firstSelectedCardId} 
                onClick={() => firstSelectedCardId && onDiscard(firstSelectedCardId)} 
                className="flex-1 py-1.5 sm:py-1 bg-rose-700 hover:bg-rose-600 border border-rose-500 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
                title="選択した1枚を手札から捨てる"
              >
                捨てる
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🌟 右側カラム：山札 ＆ 捨て札コンテナ（元の青い山札トレイデザイン） */}
      <div className={`flex gap-2 items-center px-2 py-1.5 rounded-xl border-2 transition-all duration-150 shrink-0 bg-gradient-to-b from-[#22160d] via-[#1a1008] to-[#120a05] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)] ${
        isMyInterrupt
          ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
          : canDraw
            ? 'border-amber-400/90 ring-2 ring-amber-300/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
            : 'border-amber-600/60 shadow-md'
      }`}>
        {/* 山札エリア */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-md border border-slate-700 bg-slate-900 shadow-sm pointer-events-none opacity-70" />
            <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-md border border-slate-600 bg-slate-800 pointer-events-none opacity-85" />

            <div 
              onClick={() => canDraw && onDraw && onDraw()}
              className={`relative w-[38px] h-[54px] sm:w-[44px] sm:h-[62px] rounded-md border-2 border-slate-200 p-0.5 shadow-xl flex items-center justify-center select-none transition-all duration-150 z-10 ${
                canDraw 
                  ? 'ring-2 ring-amber-400 border-amber-300 -translate-y-0.5 shadow-[0_0_14px_rgba(251,191,36,0.7)] active:scale-95 cursor-pointer animate-pulse' 
                  : 'opacity-95 cursor-default'
              }`}
              title={canDraw ? "タップして山札から1枚引く" : "山札"}
            >
              <div className="w-full h-full rounded-xs border border-slate-600/60 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:4px_4px] bg-slate-800 flex items-center justify-center">
                <Music className={`w-3.5 h-3.5 ${canDraw ? 'text-amber-300' : 'text-slate-400 opacity-60'}`} />
              </div>

              {/* 残り枚数バッジ */}
              {deckCount !== undefined && (
                <div className={`absolute -top-1.5 -right-1.5 text-[8.5px] font-black px-1.5 py-0.2 rounded-full border shadow-md z-20 ${
                  canDraw 
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-amber-100 animate-bounce' 
                    : 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-300'
                }`}>
                  {deckCount}
                </div>
              )}
            </div>
          </div>
          <span className="text-[8.5px] font-black text-amber-200/90 mt-0.5 drop-shadow-xs">山札</span>
        </div>

        {/* センターディバイダー */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />
        
        {/* 直前の捨て札 */}
        <div className="flex flex-col items-center">
          <div 
            onClick={() => onOpenDiscardModal && onOpenDiscardModal()} 
            className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="捨て札一覧を表示"
          >
            {lastDiscardItem ? (
              <>
                <div className="absolute inset-0 -translate-x-0.5 translate-y-0.5 -rotate-2 rounded-md border border-slate-600/40 bg-slate-200/20 shadow-xs pointer-events-none opacity-60" />
                <div className="relative z-10">
                  <CardComponent
                    card={lastDiscardItem.card}
                    isSelected={false}
                    sizeClass="w-[38px] h-[54px] sm:w-[44px] sm:h-[62px]"
                    isHidden={lastDiscardItem.isHidden}
                    extraClass={
                      isMyInterrupt 
                        ? "ring-2 ring-amber-400 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.85)] animate-pulse" 
                        : "shadow-md"
                    }
                  />
                </div>
              </>
            ) : (
              <div className="w-[38px] h-[54px] sm:w-[44px] sm:h-[62px] rounded-md border-2 border-dashed border-amber-500/30 bg-[#0c0704] flex items-center justify-center">
                <span className="text-[8.5px] text-amber-500/40">-</span>
              </div>
            )}
          </div>
          <span className={`text-[8.5px] mt-0.5 font-black ${
            isMyInterrupt ? 'text-amber-300 animate-pulse' : 'text-amber-200/90'
          }`}>
            {isMyInterrupt ? '対象カード' : '捨て札'}
          </span>
        </div>
      </div>
    </div>
  );
};
