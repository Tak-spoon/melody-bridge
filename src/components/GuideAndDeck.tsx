import React from 'react';
import { Info, Music } from 'lucide-react';
import { Card as CardComponent } from './Card';
import { Card as CardType, DiscardItem } from '../types/game';

interface GuideAndDeckProps {
  guideMessage: string;
  isPlayerTurn: boolean;
  isDrawPhase: boolean;
  roundOver: boolean;
  deckCount: number;
  lastDiscardItem: DiscardItem | undefined;
  onDraw: () => void;
  onOpenDiscardModal: () => void;
}

export const GuideAndDeck: React.FC<GuideAndDeckProps> = ({
  guideMessage,
  isPlayerTurn,
  isDrawPhase,
  roundOver,
  deckCount,
  lastDiscardItem,
  onDraw,
  onOpenDiscardModal
}) => {
  const canDraw = isPlayerTurn && isDrawPhase && !roundOver;

  return (
    <div className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all duration-300 shrink-0 ${
      isPlayerTurn && !roundOver 
        ? 'bg-blue-50/90 border-blue-300 shadow-sm' 
        : 'bg-white border-slate-200 shadow-2xs'
    }`}>
      {/* ガイドメッセージ */}
      <div className="flex items-start gap-2 text-slate-800 font-bold text-xs pr-2 flex-1 min-w-0">
        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${
          isPlayerTurn && !roundOver ? 'text-blue-600 animate-pulse' : 'text-slate-400'
        }`} />
        <span className="leading-snug break-words">{guideMessage}</span>
      </div>
      
      {/* 山札 ＆ 捨て札 */}
      <div className="flex gap-2.5 items-center shrink-0 pl-2.5 border-l border-slate-200">
        {/* 山札 */}
        <div className="flex flex-col items-center">
          <div 
            onClick={() => canDraw && onDraw()}
            className={`relative w-10 h-14 sm:w-12 sm:h-17 rounded-lg border-2 flex items-center justify-center transition-all duration-300 select-none ${
              canDraw 
                ? 'bg-blue-600 border-blue-300 ring-4 ring-blue-200 shadow-lg cursor-pointer scale-105 animate-pulse active:scale-95' 
                : 'bg-slate-700 border-slate-600 opacity-90 cursor-default'
            }`}
            title={canDraw ? "タップして山札から1枚引く" : "山札"}
          >
            <Music className={`w-5 h-5 ${canDraw ? 'text-white' : 'text-slate-400 opacity-50'}`} />
            <div className={`absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs ${
              canDraw ? 'bg-rose-500 text-white animate-bounce' : 'bg-blue-600 text-white'
            }`}>
              {deckCount}
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-0.5">山札</span>
        </div>
        
        {/* 直前の捨て札 */}
        <div className="flex flex-col items-center">
          <div 
            onClick={onOpenDiscardModal} 
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="捨て札一覧を表示"
          >
            {lastDiscardItem ? (
              <CardComponent
                card={lastDiscardItem.card}
                isSelected={false}
                sizeClass="w-10 h-14 sm:w-12 sm:h-17"
                isHidden={lastDiscardItem.isHidden}
              />
            ) : (
              <div className="w-10 h-14 sm:w-12 sm:h-17 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                <span className="text-[9px] text-slate-400">-</span>
              </div>
            )}
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-0.5">捨て札</span>
        </div>
      </div>
    </div>
  );
};
