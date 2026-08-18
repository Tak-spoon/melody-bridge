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
  onSelectMeld: (meldId: string) => void;
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
  const chordMelds = field.filter(m => m.type === 'chord');
  const scaleMelds = field.filter(m => m.type === 'scale');

  const canSelectMeld = isPlayerTurn && isMainPhase;

  return (
    <div className="flex-1 bg-[#0e3b26] rounded-xl border-2 border-[#185c3d] p-2 overflow-y-auto flex flex-col gap-2 shadow-[inset_0_4px_24px_rgba(0,0,0,0.55)]">
      {field.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-emerald-300/60 py-8">
          <p className="text-xs font-bold text-emerald-200/70">場に公開されたセットはありません</p>
          <p className="text-[10px] text-emerald-300/50 mt-1">手札から3枚以上のコードやスケールを出せます</p>
        </div>
      )}

      {/* 和音（コード）エリア */}
      {chordMelds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chordMelds.map((meld) => {
            const chordSymbol = getChordSymbol(meld.cards);
            const isCompleted = meld.cards.length === 4;
            const symbolColorClass = 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
            const isSelected = selectedMeldId === meld.id;
            const isSwapped = lastSwappedMeldId === meld.id;
            const isEjecting = ejectedCardInfo?.meldId === meld.id;
            const isActionable = !isSelected && !isCompleted && actionableMeldIds?.has(meld.id);
            const ownerName = players[meld.ownerId]?.name || '誰か';

            return (
              <div 
                key={meld.id} 
                onClick={() => !isCompleted && canSelectMeld && onSelectMeld(meld.id)}
                className={`relative p-1.5 rounded-xl border transition-all overflow-visible ${
                  isSwapped
                    ? 'border-cyan-400 ring-4 ring-cyan-400 bg-cyan-950/80 shadow-[0_0_24px_rgba(6,182,212,0.9)] scale-[1.04] z-30 animate-pulse'
                    : isCompleted 
                      ? 'bg-[#082014]/90 border-emerald-800/80 opacity-85 cursor-default' 
                      : isSelected 
                        ? 'border-amber-400 ring-2 ring-amber-400 bg-[#164d33] shadow-lg cursor-pointer scale-[1.02]' 
                        : isActionable
                          ? 'animate-pulse-slow border-emerald-400/90 bg-[#103d27] cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.5)] hover:border-amber-400'
                          : canSelectMeld
                            ? 'bg-[#082417]/95 border-emerald-600/70 hover:border-amber-400/80 cursor-pointer shadow-md'
                            : 'bg-[#082417]/90 border-emerald-700/60 cursor-default shadow-xs'
                }`}
              >
                {/* 押し出された古いカードのイジェクト（上へ跳ね上がる）アニメーション */}
                {isEjecting && ejectedCardInfo && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-card-eject z-50 pointer-events-none">
                    <div className="relative">
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-cyan-500 text-white text-[8px] font-black rounded-full shadow-[0_0_8px_rgba(6,182,212,1)] whitespace-nowrap">
                        💨 押し出し！
                      </span>
                      <CardComponent 
                        card={ejectedCardInfo.card} 
                        isSelected={false} 
                        sizeClass="w-8 h-11 sm:w-9 sm:h-12" 
                      />
                    </div>
                  </div>
                )}

                {/* スワップ・リハーモナイズ専用フローティングバッジ */}
                {isSwapped && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-black rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] whitespace-nowrap animate-bounce z-40">
                    🔄 REHARMONIZE!
                  </div>
                )}
                <div className="text-[10px] font-bold mb-1 flex justify-between gap-2 items-center">
                  <span className={`px-1.5 py-0.2 rounded font-black shadow-xs ${
                    isSwapped
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white ring-1 ring-white/60'
                      : isCompleted 
                        ? 'bg-slate-700 text-white' 
                        : symbolColorClass
                  }`}>
                    {chordSymbol}
                  </span>
                  <span className="text-emerald-300/70 text-[9px] font-medium">{ownerName}</span>
                </div>
                <div className="flex -space-x-1.5 overflow-visible">
                  {meld.cards.map((c) => {
                    const isNewlyAdded = c.id === lastAddedCardId;
                    const isSwappedIn = c.id === swappedInCardId;
                    return (
                      <div 
                        key={c.id} 
                        className={`transition-all duration-300 transform ${
                          isSwappedIn
                            ? 'animate-card-swap-in ring-2 ring-cyan-400 rounded-md sm:rounded-lg shadow-[0_0_16px_rgba(6,182,212,1)] z-30'
                            : isNewlyAdded 
                              ? 'animate-card-insert ring-2 ring-amber-400 rounded-md sm:rounded-lg shadow-[0_0_12px_rgba(251,191,36,0.85)] z-20' 
                              : 'hover:z-10'
                        }`}
                      >
                        <CardComponent 
                          card={c} 
                          isSelected={false} 
                          interpretedAbsVal={c.interpretedAbsVal} 
                          sizeClass="w-8 h-11 sm:w-9 sm:h-12" 
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

      {/* 和音と音階の区切り（両方ある場合） */}
      {chordMelds.length > 0 && scaleMelds.length > 0 && (
        <div className="border-t border-emerald-600/40 my-0.5" />
      )}

      {/* 音階（スケール）エリア */}
      {scaleMelds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scaleMelds.map((meld) => {
            const scaleColorClass = 'bg-gradient-to-r from-teal-500 to-teal-600 text-white';
            const isSelected = selectedMeldId === meld.id;
            const isActionable = !isSelected && actionableMeldIds?.has(meld.id);
            const ownerName = players[meld.ownerId]?.name || '誰か';

            return (
              <div 
                key={meld.id} 
                onClick={() => canSelectMeld && onSelectMeld(meld.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400 bg-[#164d33] shadow-lg cursor-pointer scale-[1.02]' 
                    : isActionable
                      ? 'animate-pulse-slow border-emerald-400/90 bg-[#103d27] cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.5)] hover:border-amber-400'
                      : canSelectMeld
                        ? 'bg-[#082417]/95 border-emerald-600/70 hover:border-amber-400/80 cursor-pointer shadow-md'
                        : 'bg-[#082417]/90 border-emerald-700/60 cursor-default shadow-xs'
                }`}
              >
                <div className="text-[10px] font-bold mb-1 flex justify-between gap-2 items-center">
                  <span className={`px-1.5 py-0.2 rounded font-black text-[9px] shadow-xs ${scaleColorClass}`}>
                    スケール
                  </span>
                  <span className="text-emerald-300/70 text-[9px] font-medium">{ownerName}</span>
                </div>
                <div className="flex -space-x-1.5 overflow-visible">
                  {meld.cards.map((c) => {
                    const isNewlyAdded = c.id === lastAddedCardId;
                    return (
                      <div 
                        key={c.id} 
                        className={`transition-all duration-300 transform ${
                          isNewlyAdded 
                            ? 'animate-card-insert ring-2 ring-amber-400 rounded-md sm:rounded-lg shadow-[0_0_12px_rgba(251,191,36,0.85)] z-20' 
                            : 'hover:z-10'
                        }`}
                      >
                        <CardComponent 
                          card={c} 
                          isSelected={false} 
                          interpretedAbsVal={c.interpretedAbsVal} 
                          sizeClass="w-8 h-11 sm:w-9 sm:h-12" 
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
  );
};
