import React from 'react';
import { Card as CardComponent } from './Card';
import { Card, Meld, Player } from '../types/game';
import { getChordSymbol } from '../utils/musicTheory';

interface FieldProps {
  field: Meld[];
  players: Player[];
  selectedMeldId: string | null;
  lastAddedCardId?: string | null;
  lastSwappedMeldId?: string | null;
  swappedInCardId?: string | null;
  ejectedCardInfo?: { card: Card; meldId: string } | null;
  actionableMeldIds?: Set<string>;
  isPlayerTurn: boolean;
  isMainPhase: boolean;
  onSelectMeld: (meldId: string | null) => void;
}

export const Field: React.FC<FieldProps> = ({
  field,
  players,
  selectedMeldId,
  lastAddedCardId,
  lastSwappedMeldId,
  swappedInCardId,
  ejectedCardInfo,
  actionableMeldIds,
  isPlayerTurn,
  isMainPhase,
  onSelectMeld
}) => {
  const canSelectMeld = isPlayerTurn && isMainPhase;

  // 空いた空間（セット以外の背景）をタップした時に選択を解除
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (selectedMeldId !== null) {
      onSelectMeld(null);
    }
  };

  return (
    <div 
      onClick={handleBackgroundClick}
      className="flex-1 bg-[#0e3b26] rounded-xl border-2 border-[#185c3d] p-1.5 sm:p-2 overflow-hidden flex flex-col justify-between shadow-[inset_0_4px_24px_rgba(0,0,0,0.55)] cursor-default select-none"
    >
      {/* 場のセット一覧（フラット配置・スクロールゼロ） */}
      <div className="flex-1 overflow-hidden flex flex-col justify-start">
        {field.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-emerald-300/60 py-4">
            <p className="text-xs font-bold text-emerald-200/70">場に公開されたセットはありません</p>
            <p className="text-[10px] text-emerald-300/50 mt-0.5">手札から3枚以上のコードやスケールを出せます</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 items-start content-start overflow-hidden">
            {field.map((meld) => {
              const isChord = meld.type === 'chord';
              const chordSymbol = isChord ? getChordSymbol(meld.cards) : null;
              const isCompleted = isChord && meld.cards.length === 4;
              const isSelected = selectedMeldId === meld.id;
              const isSwapped = lastSwappedMeldId === meld.id;
              const isEjecting = ejectedCardInfo?.meldId === meld.id;
              const isActionable = !isSelected && actionableMeldIds?.has(meld.id);
              const ownerName = players[meld.ownerId]?.name || '誰か';

              const badgeColorClass = isChord
                ? (isCompleted ? 'bg-slate-700 text-white' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white')
                : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white';

              return (
                <div 
                  key={meld.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canSelectMeld) onSelectMeld(meld.id);
                  }}
                  className={`relative p-1 sm:p-1.5 rounded-lg sm:rounded-xl border-2 transition-all overflow-visible shrink-0 ${
                    isSwapped
                      ? 'bg-[#082417]/95 border-orange-400 shadow-[0_0_16px_rgba(249,115,22,0.95)] z-30'
                      : isSelected 
                        ? 'border-amber-400 bg-[#164d33] shadow-[0_0_14px_rgba(251,191,36,0.7)] cursor-pointer z-20' 
                        : isActionable
                          ? 'animate-pulse-slow border-emerald-400/90 bg-[#103d27] cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:border-amber-400'
                          : canSelectMeld
                            ? 'bg-[#082417]/95 border-emerald-600/70 hover:border-amber-400/80 cursor-pointer shadow-xs'
                            : 'bg-[#082417]/90 border-emerald-700/60 cursor-default'
                  }`}
                >
                  {/* 押し出された古いカードのイジェクト（上へ跳ね上がる）アニメーション */}
                  {isEjecting && ejectedCardInfo && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-card-eject z-50 pointer-events-none">
                      <div className="relative">
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-orange-600 text-white text-[8px] font-black rounded-full shadow-[0_0_8px_rgba(249,115,22,1)] whitespace-nowrap border border-orange-200">
                          💨 押し出し！
                        </span>
                        <CardComponent 
                          card={ejectedCardInfo.card} 
                          isSelected={false} 
                          sizeClass="w-[30px] h-[42px] sm:w-[36px] sm:h-[50px]" 
                        />
                      </div>
                    </div>
                  )}

                  {/* スワップ・リハーモナイズ専用フローティングバッジ */}
                  {isSwapped && (
                    <div className="absolute -bottom-3 inset-x-0 flex justify-center pointer-events-none z-40">
                      <div className="px-2.5 py-0.2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black tracking-wider rounded-full shadow-[0_0_12px_rgba(249,115,22,1)] whitespace-nowrap animate-reharmonize-fade border border-orange-200">
                        🔄 REHARMONIZE!
                      </div>
                    </div>
                  )}

                  {/* セットヘッダー（役名 ＆ プレイヤー名） */}
                  <div className="text-[9.5px] font-bold mb-1 flex justify-between gap-1.5 items-center">
                    <span className={`px-1.5 py-0.2 rounded font-black shadow-xs ${badgeColorClass}`}>
                      {isChord ? chordSymbol : 'スケール'}
                    </span>
                    <span className="text-emerald-300/70 text-[8.5px] font-medium">{ownerName}</span>
                  </div>

                  {/* カード重なり表示（スマートスタック） */}
                  <div className="flex -space-x-2 overflow-visible">
                    {meld.cards.map((c) => {
                      const isNewlyAdded = c.id === lastAddedCardId;
                      const isSwappedIn = c.id === swappedInCardId;
                      return (
                        <div 
                          key={c.id} 
                          className={`transition-all duration-300 transform ${
                            isSwappedIn
                              ? 'animate-card-swap-in ring-2 ring-orange-400 rounded-md shadow-[0_0_14px_rgba(249,115,22,1)] z-30'
                              : isNewlyAdded 
                                ? 'animate-card-insert ring-2 ring-amber-400 rounded-md shadow-[0_0_10px_rgba(251,191,36,0.85)] z-20' 
                                : 'hover:z-10'
                          }`}
                        >
                          <CardComponent 
                            card={c} 
                            isSelected={false} 
                            interpretedAbsVal={c.interpretedAbsVal} 
                            sizeClass="w-[30px] h-[42px] sm:w-[36px] sm:h-[50px]" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
