import React from 'react';
import { Card as CardComponent } from './Card';
import { Meld, Player } from '../types/game';
import { getChordSymbol } from '../utils/musicTheory';

interface FieldProps {
  field: Meld[];
  players: Player[];
  selectedMeldId: string | null;
  lastAddedCardId?: string | null;
  isPlayerTurn: boolean;
  isMainPhase: boolean;
  onSelectMeld: (meldId: string) => void;
}

export const Field: React.FC<FieldProps> = ({
  field,
  players,
  selectedMeldId,
  lastAddedCardId,
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
            const chordSuit = meld.cards[0]?.suit || 'red';
            const symbolColorClass = chordSuit === 'blue' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white';
            const isSelected = selectedMeldId === meld.id;
            const ownerName = players[meld.ownerId]?.name || '誰か';

            return (
              <div 
                key={meld.id} 
                onClick={() => !isCompleted && canSelectMeld && onSelectMeld(meld.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-[#082014]/90 border-emerald-800/80 opacity-85 cursor-default' 
                    : isSelected 
                      ? 'border-amber-400 ring-2 ring-amber-400 bg-[#164d33] shadow-lg cursor-pointer scale-[1.02]' 
                      : canSelectMeld
                        ? 'bg-[#082417]/95 border-emerald-600/70 hover:border-amber-400/80 cursor-pointer shadow-md'
                        : 'bg-[#082417]/90 border-emerald-700/60 cursor-default shadow-xs'
                }`}
              >
                <div className="text-[10px] font-bold mb-1 flex justify-between gap-2 items-center">
                  <span className={`px-1.5 py-0.2 rounded font-black shadow-xs ${
                    isCompleted ? 'bg-slate-700 text-white' : symbolColorClass
                  }`}>
                    {chordSymbol}
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
                          interpretedSuit={c.suit} 
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
            const scaleSuit = meld.cards[0]?.suit || 'red';
            const scaleColorClass = scaleSuit === 'blue' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white';
            const isSelected = selectedMeldId === meld.id;
            const ownerName = players[meld.ownerId]?.name || '誰か';

            return (
              <div 
                key={meld.id} 
                onClick={() => canSelectMeld && onSelectMeld(meld.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400 bg-[#164d33] shadow-lg cursor-pointer scale-[1.02]' 
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
                          interpretedSuit={c.suit} 
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
