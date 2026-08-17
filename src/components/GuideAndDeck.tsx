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
    <div className="flex gap-1.5 sm:gap-2 items-stretch shrink-0 w-full">
      {/* 1. ガイドメッセージコンテナ（左側：flex-1 独立ボックス） */}
      <div className={`flex flex-col justify-between p-2 sm:p-2.5 rounded-xl border-2 transition-all duration-150 flex-1 min-w-0 bg-white ${
        isMyInterrupt
          ? 'border-amber-400 shadow-[0_4px_16px_rgba(251,191,36,0.3)] ring-2 ring-amber-400'
          : isActionActive 
            ? 'border-amber-400 shadow-[0_2px_12px_rgba(251,191,36,0.2)] ring-2 ring-amber-300/60' 
            : 'border-amber-200/80 shadow-xs'
      }`}>
        {/* 上段：直前の履歴アクション（2行になっても枠内に美しく収まる） */}
        {lastActionText ? (
          <div className="bg-amber-50/90 rounded-md px-2 py-0.75 border border-amber-200/80 mb-1 w-full">
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-950 leading-tight break-words">
              {lastActionText}
            </p>
          </div>
        ) : (
          <div className="h-1" />
        )}

        {/* 下段：ガイドメッセージ（自然な句読点と文字組みで改行対応） */}
        <div className="flex items-start gap-1.5 min-w-0">
          <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
            isActionActive ? 'text-amber-600 animate-pulse' : 'text-slate-400'
          }`} />
          <p className="text-[11px] sm:text-xs text-slate-800 font-bold leading-snug break-words flex-1">
            {guideMessage}
          </p>
        </div>
      </div>
      
      {/* 2. 山札 ＆ 捨て札コンテナ（右側：ゴージャスなマホガニー＆真鍮カジノトレイ） */}
      <div className={`flex gap-3 items-center px-3 py-1.5 sm:py-2 rounded-xl border-2 transition-all duration-150 shrink-0 bg-gradient-to-b from-[#22160d] via-[#1a1008] to-[#120a05] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)] ${
        isMyInterrupt
          ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
          : canDraw
            ? 'border-amber-400/90 ring-2 ring-amber-300/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
            : 'border-amber-600/60 shadow-md'
      }`}>
        {/* 山札エリア（立体トランプの山） */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* 重なり合う下層カードたち（立体レイヤーシャドウ） */}
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md sm:rounded-lg border border-slate-700 bg-slate-900 shadow-sm pointer-events-none opacity-70" />
            <div className="absolute inset-0 translate-x-0.75 translate-y-0.75 rounded-md sm:rounded-lg border border-slate-600 bg-slate-800 pointer-events-none opacity-85" />

            {/* 山札最上層カード */}
            <div 
              onClick={() => canDraw && onDraw()}
              className={`relative w-10 h-14 sm:w-12 sm:h-17 rounded-md sm:rounded-lg border-2 border-slate-200 p-0.5 shadow-xl flex items-center justify-center select-none transition-all duration-150 z-10 ${
                canDraw 
                  ? 'ring-3 ring-amber-400 border-amber-300 -translate-y-1 shadow-[0_0_18px_rgba(251,191,36,0.7)] active:scale-95 cursor-pointer animate-pulse' 
                  : 'opacity-95 cursor-default'
              }`}
              title={canDraw ? "タップして山札から1枚引く" : "山札"}
            >
              <div className="w-full h-full rounded-xs border border-slate-600/60 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:4px_4px] bg-slate-800 flex items-center justify-center">
                <Music className={`w-4 h-4 ${canDraw ? 'text-amber-300' : 'text-slate-400 opacity-60'}`} />
              </div>

              {/* 残り枚数バッジ（ゴールドメダル調） */}
              <div className={`absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow-md z-20 ${
                canDraw 
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-amber-100 animate-bounce' 
                  : 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-300'
              }`}>
                {deckCount}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-black text-amber-200/90 mt-1 drop-shadow-xs">山札</span>
        </div>

        {/* センターディバイダー（真鍮ライン） */}
        <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />
        
        {/* 直前の捨て札（立体ディスカードパイル ＆ ポン・チー時強調） */}
        <div className="flex flex-col items-center">
          <div 
            onClick={onOpenDiscardModal} 
            className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="捨て札一覧を表示"
          >
            {lastDiscardItem ? (
              <>
                {/* 捨て札の下層スタック（過去のカードの厚み表現） */}
                <div className="absolute inset-0 -translate-x-1 translate-y-1 -rotate-2 rounded-md sm:rounded-lg border border-slate-600/40 bg-slate-200/20 shadow-xs pointer-events-none opacity-60" />
                <div className="relative z-10">
                  <CardComponent
                    card={lastDiscardItem.card}
                    isSelected={false}
                    sizeClass="w-10 h-14 sm:w-12 sm:h-17"
                    isHidden={lastDiscardItem.isHidden}
                    extraClass={isMyInterrupt ? "ring-3 ring-amber-400 border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.85)] animate-pulse" : "shadow-lg"}
                  />
                </div>
              </>
            ) : (
              <div className="w-10 h-14 sm:w-12 sm:h-17 rounded-md sm:rounded-lg border-2 border-dashed border-amber-500/30 bg-[#0c0704] flex items-center justify-center">
                <span className="text-[9px] text-amber-500/40">-</span>
              </div>
            )}
          </div>
          <span className={`text-[9px] mt-1 ${isMyInterrupt ? 'font-black text-amber-300 animate-pulse' : 'font-black text-amber-200/90'}`}>
            {isMyInterrupt ? '対象牌' : '捨て札'}
          </span>
        </div>
      </div>
    </div>
  );
};
