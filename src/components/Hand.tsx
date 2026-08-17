import React from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';

interface HandProps {
  hand: CardType[];
  selectedHand: string[];
  justDrawnCardId: string | null;
  highlightCardIds: Set<string>;
  formedMeldName?: string | null;
  formedMeldType?: 'chord' | 'scale' | 'add' | null;
  isPlayerTurn: boolean;
  isMainPhase: boolean;
  isInterruptTurn: boolean;
  isMyInterrupt: boolean;
  canPon: boolean;
  canChii: boolean;
  isValidScaleSelection: boolean;
  isValidChordSelection: boolean;
  isValidAddSelection: boolean;
  onCardClick: (card: CardType) => void;
  onMeld: (type: 'scale' | 'chord') => void;
  onAdd: () => void;
  onDiscard: (cardId: string) => void;
  onPassInterrupt: () => void;
  onInterruptAction: (type: 'pon' | 'chii') => void;
}

export const Hand: React.FC<HandProps> = ({
  hand,
  selectedHand,
  justDrawnCardId,
  highlightCardIds,
  formedMeldName,
  formedMeldType,
  isPlayerTurn,
  isMainPhase,
  isInterruptTurn,
  isMyInterrupt,
  canPon,
  canChii,
  isValidScaleSelection,
  isValidChordSelection,
  isValidAddSelection,
  onCardClick,
  onMeld,
  onAdd,
  onDiscard,
  onPassInterrupt,
  onInterruptAction
}) => {
  // ツモ牌がある場合は右端に独立させる手札リスト
  const regularCards = justDrawnCardId 
    ? hand.filter(c => c.id !== justDrawnCardId)
    : hand;
  const justDrawnCard = justDrawnCardId 
    ? hand.find(c => c.id === justDrawnCardId) 
    : null;
  
  const renderCardsList = justDrawnCard 
    ? [...regularCards, justDrawnCard] 
    : regularCards;

  return (
    <footer className="bg-[#1f130b] border-t border-[#3f2717] p-2 shadow-2xl shrink-0 z-10">
      <div className="max-w-md mx-auto flex flex-col gap-1.5">
        {/* 操作ボタン & 手札枚数情報 & 成立役バッジ */}
        <div className="flex justify-between items-center min-h-[28px]">
          <div className="flex items-center gap-2 shrink-0">
            <h2 className="text-[11px] font-black text-amber-100 shrink-0">
              手札 <span className="text-amber-300/60 font-normal">({selectedHand.length}枚選択)</span>
            </h2>
          </div>

          {/* 成立役名表示（シンプル＆スマート） */}
          {formedMeldName && (
            <div className="flex-1 flex justify-center px-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider bg-[#2a1a0f] border border-amber-400/80 text-amber-200 shadow-inner animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
                {formedMeldName}
              </span>
            </div>
          )}
          
          <div className="flex gap-1 flex-nowrap items-center justify-end shrink-0">
            {isInterruptTurn && isMyInterrupt ? (
              <>
                <button 
                  onClick={onPassInterrupt} 
                  className="px-2.5 py-1 bg-slate-600 hover:bg-slate-500 border border-slate-400 active:scale-95 text-white text-[11px] font-black rounded shadow-xs transition"
                >
                  パス
                </button>
                <button 
                  onClick={() => onInterruptAction('chii')} 
                  disabled={!canChii || selectedHand.length !== 2} 
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 disabled:bg-[#1a1109] disabled:border-[#382215] disabled:text-amber-900 disabled:opacity-40 active:scale-95 text-white text-[11px] font-black rounded shadow-xs transition"
                >
                  チー
                </button>
                <button 
                  onClick={() => onInterruptAction('pon')} 
                  disabled={!canPon || selectedHand.length !== 2} 
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 border border-rose-400 disabled:bg-[#1a1109] disabled:border-[#382215] disabled:text-amber-900 disabled:opacity-40 active:scale-95 text-white text-[11px] font-black rounded shadow-xs transition"
                >
                  ポン
                </button>
              </>
            ) : isInterruptTurn ? (
              <div className="text-[10px] text-amber-300 font-bold animate-pulse px-2 py-0.5 bg-amber-950/80 rounded border border-amber-500/50">
                割り込み確認中
              </div>
            ) : (
              <>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || !isValidScaleSelection} 
                  onClick={() => onMeld('scale')} 
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/60 active:scale-95 text-white text-[10px] font-black rounded shadow-xs transition"
                  title="音階（3音以上）を場に出す"
                >
                  スケール
                </button>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || !isValidChordSelection} 
                  onClick={() => onMeld('chord')} 
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 border border-rose-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/60 active:scale-95 text-white text-[10px] font-black rounded shadow-xs transition"
                  title="和音（3音）を場に出す"
                >
                  コード
                </button>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || !isValidAddSelection} 
                  onClick={onAdd} 
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/60 active:scale-95 text-white text-[10px] font-black rounded shadow-xs transition"
                  title="選択した1枚を場のセットに付ける"
                >
                  付け札
                </button>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || selectedHand.length !== 1} 
                  onClick={() => selectedHand.length === 1 && onDiscard(selectedHand[0])} 
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 border border-amber-500 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/60 active:scale-95 text-white text-[10px] font-black rounded shadow-xs transition"
                  title="選択した1枚を手札から捨てる"
                >
                  捨てる
                </button>
              </>
            )}
          </div>
        </div>

        {/* 手札カードトレイ（ダークウッド調の凹凸トレイ） */}
        <div className="flex flex-nowrap min-h-[66px] items-center pt-2 pb-1.5 px-1 bg-[#0c0805] rounded-xl border border-[#3f2717] shadow-[inset_0_3px_12px_rgba(0,0,0,0.8)] justify-center overflow-visible">
          {renderCardsList.map((card) => {
            const isJustDrawn = card.id === justDrawnCardId;
            const isSelected = selectedHand.includes(card.id);
            const isHighlighted = highlightCardIds.has(card.id);
            // 割り込み（ポン・チー）時、候補でないカードを暗くトーンダウン
            const isDimmed = isInterruptTurn && isMyInterrupt && !isHighlighted && !isSelected;

            return (
              <div 
                key={card.id} 
                className={`shrink-0 ${isJustDrawn ? "ml-2 sm:ml-3.5" : "mx-[1.5px] sm:mx-0.5"}`}
              >
                <CardComponent
                  card={card}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted && !isSelected}
                  isDimmed={isDimmed}
                  onClick={() => onCardClick(card)}
                  sizeClass="w-[38px] h-[54px] xs:w-10 xs:h-14 sm:w-12 sm:h-17"
                />
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
