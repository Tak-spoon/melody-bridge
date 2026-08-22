import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  isPlayerTurn?: boolean;
  isMainPhase?: boolean;
  onCardClick: (card: CardType) => void;
  onDiscard?: (cardId: string) => void;
  onDragOverDiscardChange?: (isOver: boolean) => void;
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
  isPlayerTurn = false,
  isMainPhase = false,
  onCardClick,
  onDiscard,
}) => {
  // 浮遊ゴミ箱ステート管理
  const [trashTarget, setTrashTarget] = useState<{ card: CardType; x: number; y: number } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState<boolean>(false);

  const activeCardRef = useRef<CardType | null>(null);
  const startPointerRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const cardCenterRef = useRef<{ x: number; y: number } | null>(null);
  const isOverTrashRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<any>(null);

  // クリーンアップ
  const cleanupTrash = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    setTrashTarget(null);
    setIsOverTrash(false);
    isOverTrashRef.current = false;
    activeCardRef.current = null;
    startPointerRef.current = null;
    cardCenterRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupTrash();
    };
  }, []);

  // 画面全体でのポインター移動処理
  const handleGlobalPointerMove = (e: PointerEvent) => {
    if (!startPointerRef.current || !activeCardRef.current || !cardCenterRef.current) return;

    const startP = startPointerRef.current;
    const cardC = cardCenterRef.current;
    const trashY = cardC.y - 50;

    // 上方向への移動量
    const deltaY = startP.y - e.clientY;
    const distToTrash = Math.hypot(e.clientX - cardC.x, e.clientY - trashY);

    // 6px以上上に動いた場合、ゴミ箱を即座に表示
    if (deltaY > 6 && !trashTarget && isPlayerTurn && isMainPhase && !isInterruptTurn) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setTrashTarget({ card: activeCardRef.current, x: cardC.x, y: trashY });
    }

    // ゴミ箱の当たり判定（半径34px以内、またはカード中心より20px以上上）
    const over = distToTrash < 34 || (deltaY > 24 && Math.abs(e.clientX - cardC.x) < 32);
    setIsOverTrash(over);
    isOverTrashRef.current = over;
  };

  // 画面全体でのポインターアップ（ドロップまたはクリック完了）
  const handleGlobalPointerUp = (e: PointerEvent) => {
    const card = activeCardRef.current;
    const over = isOverTrashRef.current;
    const wasShownTrash = !!trashTarget;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (card) {
      if (over && onDiscard) {
        // ゴミ箱に重ねて離した場合 ➔ 捨て札確定！
        onDiscard(card.id);
      } else if (!wasShownTrash) {
        // ゴミ箱が表示される前の短いタップ ➔ 通常のカードクリック（選択/解除）
        onCardClick(card);
      }
    }

    cleanupTrash();
  };

  const handleGlobalPointerCancel = () => {
    cleanupTrash();
  };

  // カード押下時
  const handleCardPointerDown = (e: React.PointerEvent, card: CardType) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // カードの画面上の中心位置を取得
    const cardElem = e.currentTarget as HTMLElement;
    const cardRect = cardElem.getBoundingClientRect();
    const cardCenter = {
      x: cardRect.left + cardRect.width / 2,
      y: cardRect.top + cardRect.height / 2
    };

    activeCardRef.current = card;
    startPointerRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    cardCenterRef.current = cardCenter;
    isOverTrashRef.current = false;

    // グローバルリスナー登録
    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);

    // 長押し（140ms）でカードの直上にゴミ箱を出現
    if (isPlayerTurn && isMainPhase && !isInterruptTurn) {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = setTimeout(() => {
        if (activeCardRef.current && cardCenterRef.current) {
          setTrashTarget({ card, x: cardCenterRef.current.x, y: cardCenterRef.current.y - 50 });
        }
      }, 140);
    }
  };

  // ドローしたカードがある場合は右端に独立させる手札リスト
  const regularCards = justDrawnCardId 
    ? hand.filter(c => c.id !== justDrawnCardId)
    : hand;
  const justDrawnCard = justDrawnCardId 
    ? hand.find(c => c.id === justDrawnCardId) 
    : null;

  return (
    <>
      {/* 🌟 長押し時にカードの真上にフワッと出現する浮遊ゴミ箱アイコン（Portal） */}
      {trashTarget && createPortal(
        <div 
          className="fixed pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 select-none flex flex-col items-center animate-in zoom-in-75 duration-100"
          style={{ left: `${trashTarget.x}px`, top: `${trashTarget.y}px` }}
        >
          {/* ゴミ箱バブル本体 */}
          <div className={`relative flex items-center justify-center rounded-full transition-all duration-150 shadow-2xl ${
            isOverTrash 
              ? 'w-12 h-12 bg-rose-600 ring-4 ring-rose-300 scale-125 shadow-[0_0_24px_rgba(244,63,94,1)] animate-bounce' 
              : 'w-10 h-10 bg-gradient-to-b from-rose-700 to-rose-900 border-2 border-rose-400/90 ring-2 ring-rose-400/40 opacity-95'
          }`}>
            <span className="text-xl drop-shadow-sm select-none">🗑️</span>
            
            {/* 上部ガイドバッジ */}
            {isOverTrash && (
              <span className="absolute -top-3.5 px-2 py-0.5 bg-rose-950 text-rose-200 text-[8.5px] font-black rounded-full border border-rose-400 whitespace-nowrap shadow-md">
                捨てる
              </span>
            )}
          </div>
        </div>,
        document.body
      )}

      <div className="bg-[#1b1008] border-2 border-[#452816] rounded-xl px-2 py-1.5 shadow-xl shrink-0 z-10 select-none">
        {/* 手札カードトレイ（ダークウッド調の凹凸トレイ） */}
        <div className="flex flex-nowrap min-h-[66px] items-center pt-2 pb-1.5 px-2 bg-[#0c0805] rounded-lg border border-[#3f2717] shadow-[inset_0_3px_12px_rgba(0,0,0,0.8)] justify-between overflow-visible">
          
          {/* 通常手札カード群（左〜中央揃え） */}
          <div className="flex items-center justify-start flex-nowrap overflow-visible">
            {regularCards.map((card) => {
              const isSwappedIn = card.id === lastSwappedInCardId;
              const isSwapReaction = reactionSwapCardIds?.has(card.id) && !selectedHand.includes(card.id);
              const isAddReaction = reactionAddCardIds?.has(card.id) && !selectedHand.includes(card.id);
              const isBothReaction = isAddReaction && isSwapReaction;
              const isReaction = isAddReaction || isSwapReaction;
              const isReadyToMeld = readyToMeldCardIds?.has(card.id) && !selectedHand.includes(card.id) && !isReaction;
              const isTwoCardPair = twoCardPairCardIds?.has(card.id) && !selectedHand.includes(card.id) && !isReaction && !isReadyToMeld;
              const isSelected = selectedHand.includes(card.id);
              const isHighlighted = highlightCardIds.has(card.id);
              const isCurrentlyTargeted = trashTarget?.card.id === card.id;

              // 割り込み時、または選択時に繋がらないカードを消灯
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
                  onPointerDown={(e) => handleCardPointerDown(e, card)}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className={`shrink-0 mx-[1.5px] sm:mx-0.5 transition-all duration-100 touch-none select-none ${
                    isCurrentlyTargeted ? '-translate-y-2 scale-105 z-40' : ''
                  } ${
                    isSwappedIn 
                      ? "animate-bounce z-20" 
                      : isBothReaction || isSwapReaction || isAddReaction
                        ? "animate-bounce-slow z-20"
                        : isReadyToMeld
                          ? "z-15"
                          : isTwoCardPair
                            ? "z-10"
                            : ""
                  }`}
                >
                  <CardComponent
                    card={card}
                    isSelected={isSelected || isCurrentlyTargeted}
                    isHighlighted={isHighlighted && !isSelected}
                    isBothReaction={isBothReaction}
                    isAddReaction={isAddReaction && !isBothReaction}
                    isSwapReaction={isSwapReaction && !isBothReaction}
                    isReadyToMeld={isReadyToMeld}
                    isTwoCardPair={isTwoCardPair}
                    isDimmed={isDimmed}
                    extraClass={isCurrentlyTargeted ? 'ring-2 ring-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]' : undefined}
                    sizeClass="w-[38px] h-[54px] sm:w-[46px] sm:h-[66px]"
                  />
                </div>
              );
            })}
          </div>

          {/* 🌟 ツモカード（引いたカード：常にトレイ右端・山札の真下に固定配置） */}
          {justDrawnCard && (
            <div 
              onPointerDown={(e) => handleCardPointerDown(e, justDrawnCard)}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className={`ml-auto pl-2 sm:pl-3 border-l border-amber-600/30 shrink-0 animate-draw-fly-in z-25 transition-all duration-100 touch-none select-none ${
                trashTarget?.card.id === justDrawnCard.id ? '-translate-y-2 scale-105 z-40' : ''
              }`}
            >
              <CardComponent
                card={justDrawnCard}
                isSelected={selectedHand.includes(justDrawnCard.id) || trashTarget?.card.id === justDrawnCard.id}
                isHighlighted={highlightCardIds.has(justDrawnCard.id) && !selectedHand.includes(justDrawnCard.id)}
                isAddReaction={reactionAddCardIds?.has(justDrawnCard.id)}
                isSwapReaction={reactionSwapCardIds?.has(justDrawnCard.id)}
                isReadyToMeld={readyToMeldCardIds?.has(justDrawnCard.id)}
                extraClass={trashTarget?.card.id === justDrawnCard.id ? 'ring-2 ring-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]' : undefined}
                sizeClass="w-[38px] h-[54px] sm:w-[46px] sm:h-[66px]"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
