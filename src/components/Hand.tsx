import React from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/game';

interface HandProps {
  hand: CardType[];
  selectedHand: string[];
  justDrawnCardId: string | null;
  lastSwappedInCardId?: string | null;
  highlightCardIds: Set<string>;
  reactionAddCardIds?: Set<string>;
  reactionSwapCardIds?: Set<string>;
  readyToMeldCardIds?: Set<string>;
  twoCardPairCardIds?: Set<string>;
  isInterruptTurn: boolean;
  isMyInterrupt: boolean;
  onCardClick: (card: CardType) => void;
}

export const Hand: React.FC<HandProps> = ({
  hand,
  selectedHand,
  justDrawnCardId,
  lastSwappedInCardId,
  highlightCardIds,
  reactionAddCardIds,
  reactionSwapCardIds,
  readyToMeldCardIds,
  twoCardPairCardIds,
  isInterruptTurn,
  isMyInterrupt,
  onCardClick
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
    <div className="bg-[#1b1008] border-2 border-[#452816] rounded-xl px-2 py-1.5 shadow-xl shrink-0 z-10">
      {/* 手札カードトレイ（ダークウッド調の凹凸トレイ） */}
      <div className="flex flex-nowrap min-h-[66px] items-center pt-2 pb-1.5 px-1 bg-[#0c0805] rounded-lg border border-[#3f2717] shadow-[inset_0_3px_12px_rgba(0,0,0,0.8)] justify-center overflow-visible">
        {renderCardsList.map((card) => {
          const isJustDrawn = card.id === justDrawnCardId;
          const isSwappedIn = card.id === lastSwappedInCardId;
          const isSwapReaction = reactionSwapCardIds?.has(card.id) && !selectedHand.includes(card.id);
          const isAddReaction = reactionAddCardIds?.has(card.id) && !selectedHand.includes(card.id);
          const isReaction = isAddReaction || isSwapReaction;
          const isReadyToMeld = readyToMeldCardIds?.has(card.id) && !selectedHand.includes(card.id) && !isReaction;
          const isTwoCardPair = twoCardPairCardIds?.has(card.id) && !selectedHand.includes(card.id) && !isReaction && !isReadyToMeld;
          const isSelected = selectedHand.includes(card.id);
          const isHighlighted = highlightCardIds.has(card.id);

          // 割り込み（ポン・チー）時、または手札選択時に繋がらない無関係カードを消灯（トーンダウン）
          const isInterruptDimmed = isInterruptTurn && isMyInterrupt && !isHighlighted && !isSelected;
          const isAssistDimmed = selectedHand.length > 0 && 
            !isSelected && 
            !isReaction && 
            !isReadyToMeld && 
            !isTwoCardPair && 
            !isSwappedIn;

          const isDimmed = isInterruptDimmed || isAssistDimmed;

          return (
            <div 
              key={card.id} 
              className={`shrink-0 ${isJustDrawn ? "ml-2 sm:ml-3.5" : "mx-[1.5px] sm:mx-0.5"} ${
                isSwappedIn 
                  ? "animate-bounce ring-2 ring-cyan-400 rounded-md shadow-md z-20" 
                  : isSwapReaction
                    ? "animate-bounce-slow ring-1.5 ring-cyan-400 rounded-md shadow-xs z-20"
                    : isAddReaction
                      ? "animate-bounce-slow ring-1.5 ring-emerald-400 rounded-md shadow-xs z-20"
                      : isReadyToMeld
                        ? "ring-1.5 ring-amber-300 rounded-md shadow-xs z-15"
                        : isTwoCardPair
                          ? "ring-1 ring-purple-400/80 rounded-md shadow-xs z-10"
                          : ""
              }`}
            >
              <CardComponent
                card={card}
                isSelected={isSelected}
                isHighlighted={isHighlighted && !isSelected}
                isReadyToMeld={isReadyToMeld}
                isTwoCardPair={isTwoCardPair}
                isDimmed={isDimmed}
                onClick={() => onCardClick(card)}
                sizeClass="w-[38px] h-[54px] xs:w-10 xs:h-14 sm:w-12 sm:h-17"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
