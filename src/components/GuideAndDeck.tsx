import React from 'react';
import { Info, Music } from 'lucide-react';
import { Card as CardComponent } from './Card';
import { DiscardItem } from '../types/game';

interface GuideAndDeckProps {
  guideMessage: string;
  lastActionText?: string;
  isPlayerTurn: boolean;
  isDrawPhase: boolean;
  isMyInterrupt?: boolean;
  roundOver: boolean;
  deckCount: number;
  lastDiscardItem: DiscardItem | undefined;
  onDraw: () => void;
  onOpenDiscardModal: () => void;
}

export const GuideAndDeck: React.FC<GuideAndDeckProps> = ({
  guideMessage,
  lastActionText,
  isPlayerTurn,
  isDrawPhase,
  isMyInterrupt = false,
  roundOver,
  deckCount,
  lastDiscardItem,
  onDraw,
  onOpenDiscardModal
}) => {
  const canDraw = isPlayerTurn && isDrawPhase && !roundOver;
  const isActionActive = (isPlayerTurn || isMyInterrupt) && !roundOver;

  return (
    <div className={`flex justify-between items-center px-3 py-1.5 sm:py-2 rounded-xl border-2 transition-[border-color,box-shadow] duration-150 shrink-0 bg-white ${
      isMyInterrupt
        ? 'border-amber-400 shadow-[0_4px_20px_rgba(251,191,36,0.35)] ring-2 ring-amber-400'
        : isActionActive 
          ? 'border-amber-400 shadow-[0_4px_16px_rgba(251,191,36,0.2)] ring-2 ring-amber-300/60' 
          : 'border-amber-200/80 shadow-xs'
    }`}>
      {/* ガイドメッセージ ＆ 直前のアクション */}
      <div className="flex items-start gap-2 text-slate-800 font-bold text-xs pr-2 flex-1 min-w-0">
        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${
          isActionActive ? 'text-amber-600 animate-pulse' : 'text-slate-400'
        }`} />
        <div className="flex flex-col leading-tight min-w-0">
          {lastActionText && (
            <span className="text-[10px] text-amber-700 font-bold truncate mb-0.5">
              {lastActionText}
            </span>
          )}
          <span className="break-words text-xs text-slate-800 font-black">{guideMessage}</span>
        </div>
      </div>
      
      {/* 山札 ＆ 捨て札 */}
      <div className="flex gap-2.5 items-center shrink-0 pl-2.5 border-l border-slate-200">
        {/* 山札 */}
        <div className="flex flex-col items-center">
          <div 
            onClick={() => canDraw && onDraw()}
            className={`relative w-10 h-14 sm:w-12 sm:h-17 rounded-md sm:rounded-lg border-2 border-white p-0.5 shadow-md flex items-center justify-center select-none transition-transform ${
              canDraw 
                ? 'ring-4 ring-amber-400 shadow-[0_4px_16px_rgba(251,191,36,0.45)] scale-105 animate-pulse active:scale-95 cursor-pointer' 
                : 'opacity-90 cursor-default'
            }`}
            title={canDraw ? "タップして山札から1枚引く" : "山札"}
          >
            <div className="w-full h-full rounded-xs border border-slate-600/50 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:5px_5px] bg-slate-800 flex items-center justify-center">
              <Music className={`w-4 h-4 ${canDraw ? 'text-white' : 'text-slate-400 opacity-60'}`} />
            </div>
            <div className={`absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs ${
              canDraw ? 'bg-amber-500 text-slate-950 animate-bounce font-black' : 'bg-blue-600 text-white'
            }`}>
              {deckCount}
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-0.5">山札</span>
        </div>
        
        {/* 直前の捨て札（ポン・チー時はハイライト強調） */}
        <div className="flex flex-col items-center">
          <div 
            onClick={onOpenDiscardModal} 
            className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
              isMyInterrupt ? 'scale-105' : ''
            }`}
            title="捨て札一覧を表示"
          >
            {lastDiscardItem ? (
              <CardComponent
                card={lastDiscardItem.card}
                isSelected={false}
                sizeClass="w-10 h-14 sm:w-12 sm:h-17"
                isHidden={lastDiscardItem.isHidden}
                extraClass={isMyInterrupt ? "ring-2 ring-amber-400 shadow-lg animate-pulse" : ""}
              />
            ) : (
              <div className="w-10 h-14 sm:w-12 sm:h-17 rounded-md sm:rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                <span className="text-[9px] text-slate-400">-</span>
              </div>
            )}
          </div>
          <span className={`text-[9px] mt-0.5 ${isMyInterrupt ? 'font-black text-amber-700' : 'font-bold text-slate-500'}`}>
            {isMyInterrupt ? '対象牌' : '捨て札'}
          </span>
        </div>
      </div>
    </div>
  );
};
