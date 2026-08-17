import React from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';

interface HandProps {
  hand: CardType[];
  selectedHand: string[];
  justDrawnCardId: string | null;
  highlightCardIds: Set<string>;
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
  return (
    <footer className="bg-white border-t border-slate-200 p-2 shadow-lg shrink-0 z-10">
      <div className="max-w-md mx-auto flex flex-col gap-1.5">
        {/* 操作ボタン & 手札枚数情報 */}
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-bold text-slate-800 shrink-0">
            手札 <span className="text-slate-400 font-normal">({selectedHand.length}枚)</span>
          </h2>
          
          <div className="flex gap-1 flex-nowrap items-center justify-end shrink-0">
            {isInterruptTurn && isMyInterrupt ? (
              <>
                <button 
                  onClick={onPassInterrupt} 
                  className="px-2.5 py-1 bg-slate-500 hover:bg-slate-600 active:scale-95 text-white text-[11px] font-bold rounded shadow-2xs transition"
                >
                  パス
                </button>
                <button 
                  onClick={() => onInterruptAction('chii')} 
                  disabled={!canChii || selectedHand.length !== 2} 
                  className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-200 disabled:opacity-50 active:scale-95 text-white text-[11px] font-bold rounded shadow-2xs transition"
                >
                  チー
                </button>
                <button 
                  onClick={() => onInterruptAction('pon')} 
                  disabled={!canPon || selectedHand.length !== 2} 
                  className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 disabled:opacity-50 active:scale-95 text-white text-[11px] font-bold rounded shadow-2xs transition"
                >
                  ポン
                </button>
              </>
            ) : isInterruptTurn ? (
              <div className="text-[10px] text-amber-600 font-bold animate-pulse px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                割り込み確認中
              </div>
            ) : (
              <>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || !isValidScaleSelection} 
                  onClick={() => onMeld('scale')} 
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white text-[10px] font-bold rounded shadow-2xs transition"
                  title="音階（3音以上）を場に出す"
                >
                  スケール
                </button>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || !isValidChordSelection} 
                  onClick={() => onMeld('chord')} 
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white text-[10px] font-bold rounded shadow-2xs transition"
                  title="和音（3音）を場に出す"
                >
                  コード
                </button>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || !isValidAddSelection} 
                  onClick={onAdd} 
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white text-[10px] font-bold rounded shadow-2xs transition"
                  title="選択した1枚を場のセットに付ける"
                >
                  付け札
                </button>
                <button 
                  disabled={!isPlayerTurn || !isMainPhase || selectedHand.length !== 1} 
                  onClick={() => selectedHand.length === 1 && onDiscard(selectedHand[0])} 
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white text-[10px] font-bold rounded shadow-2xs transition"
                  title="選択した1枚を手札から捨てる"
                >
                  捨てる
                </button>
              </>
            )}
          </div>
        </div>

        {/* 手札カード一覧（8枚でも確実に1列に収まり、持ち上がり時も見切れないトレイ設計） */}
        <div className="flex flex-nowrap min-h-[66px] items-center pt-2 pb-1.5 px-1 bg-slate-100 rounded-xl border border-slate-200 justify-center overflow-visible">
          {(() => {
            // ツモ牌がある場合は右端に独立させる
            const regularCards = justDrawnCardId 
              ? hand.filter(c => c.id !== justDrawnCardId)
              : hand;
            const justDrawnCard = justDrawnCardId 
              ? hand.find(c => c.id === justDrawnCardId) 
              : null;
            
            const renderCardsList = justDrawnCard 
              ? [...regularCards, justDrawnCard] 
              : regularCards;

            return renderCardsList.map((card) => {
              const isJustDrawn = card.id === justDrawnCardId;
              const isSelected = selectedHand.includes(card.id);
              const isHighlighted = highlightCardIds.has(card.id);

              return (
                <div 
                  key={card.id} 
                  className={`shrink-0 ${isJustDrawn ? "ml-2 sm:ml-3.5" : "mx-[1.5px] sm:mx-0.5"}`}
                >
                  <CardComponent
                    card={card}
                    isSelected={isSelected}
                    onClick={() => onCardClick(card)}
                    sizeClass="w-[38px] h-[54px] xs:w-10 xs:h-14 sm:w-12 sm:h-17"
                    isHighlighted={isHighlighted}
                    extraClass={isJustDrawn ? "ring-2 ring-emerald-400 shadow-md" : ""}
                  />
                </div>
              );
            });
          })()}
        </div>
      </div>
    </footer>
  );
};
