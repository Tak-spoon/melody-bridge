import React from 'react';
import { Card as CardComponent } from './Card';
import { Meld, Player } from '../types/game';
import { getChordSymbol } from '../utils/musicTheory';

interface FieldProps {
  field: Meld[];
  players: Player[];
  selectedMeldId: string | null;
  isPlayerTurn: boolean;
  isMainPhase: boolean;
  onSelectMeld: (meldId: string) => void;
}

export const Field: React.FC<FieldProps> = ({
  field,
  players,
  selectedMeldId,
  isPlayerTurn,
  isMainPhase,
  onSelectMeld
}) => {
  const chordMelds = field.filter(m => m.type === 'chord');
  const scaleMelds = field.filter(m => m.type === 'scale');

  const canSelectMeld = isPlayerTurn && isMainPhase;

  return (
    <div className="flex-1 bg-emerald-50 rounded-xl border border-emerald-200 p-2 overflow-y-auto flex flex-col gap-2 shadow-inner">
      {field.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
          <p className="text-xs font-bold text-slate-400">場に公開されたセットはありません</p>
          <p className="text-[10px] text-slate-400 mt-1">手札から3枚以上のコードやスケールを出せます</p>
        </div>
      )}

      {/* 和音（コード）エリア */}
      {chordMelds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chordMelds.map((meld) => {
            const chordSymbol = getChordSymbol(meld.cards);
            const isCompleted = meld.cards.length === 4;
            const chordSuit = meld.cards[0]?.suit || 'red';
            const symbolColorClass = chordSuit === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800';
            const isSelected = selectedMeldId === meld.id;
            const ownerName = players[meld.ownerId]?.name || '誰か';

            return (
              <div 
                key={meld.id} 
                onClick={() => !isCompleted && canSelectMeld && onSelectMeld(meld.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-slate-100 border-slate-300 opacity-90 cursor-default' 
                    : isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50/80 shadow-md cursor-pointer scale-102' 
                      : canSelectMeld
                        ? 'bg-white border-slate-200 hover:border-blue-300 cursor-pointer shadow-2xs'
                        : 'bg-white border-slate-200 cursor-default shadow-2xs'
                }`}
              >
                <div className="text-[10px] font-bold mb-1 flex justify-between gap-2 items-center">
                  <span className={`px-1.5 py-0.2 rounded font-black ${isCompleted ? 'bg-slate-700 text-white' : symbolColorClass}`}>
                    {chordSymbol}
                  </span>
                  <span className="text-slate-400 text-[9px] font-medium">{ownerName}</span>
                </div>
                <div className="flex -space-x-1.5">
                  {meld.cards.map((c, i) => (
                    <div key={`${meld.id}_card_${i}`} className="transform hover:z-10 transition-transform">
                      <CardComponent 
                        card={c} 
                        isSelected={false} 
                        interpretedAbsVal={c.interpretedAbsVal} 
                        interpretedSuit={c.suit} 
                        sizeClass="w-8 h-11 sm:w-9 sm:h-12" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 和音と音階の区切り（両方ある場合） */}
      {chordMelds.length > 0 && scaleMelds.length > 0 && (
        <div className="border-t border-emerald-200/60 my-0.5" />
      )}

      {/* 音階（スケール）エリア */}
      {scaleMelds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scaleMelds.map((meld) => {
            const scaleSuit = meld.cards[0]?.suit || 'red';
            const scaleColorClass = scaleSuit === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800';
            const isSelected = selectedMeldId === meld.id;
            const ownerName = players[meld.ownerId]?.name || '誰か';

            return (
              <div 
                key={meld.id} 
                onClick={() => canSelectMeld && onSelectMeld(meld.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50/80 shadow-md cursor-pointer scale-102' 
                    : canSelectMeld
                      ? 'bg-white border-slate-200 hover:border-blue-300 cursor-pointer shadow-2xs'
                      : 'bg-white border-slate-200 cursor-default shadow-2xs'
                }`}
              >
                <div className="text-[10px] font-bold mb-1 flex justify-between gap-2 items-center">
                  <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${scaleColorClass}`}>スケール</span>
                  <span className="text-slate-400 text-[9px] font-medium">{ownerName}</span>
                </div>
                <div className="flex -space-x-1.5">
                  {meld.cards.map((c, i) => (
                    <div key={`${meld.id}_card_${i}`} className="transform hover:z-10 transition-transform">
                      <CardComponent 
                        card={c} 
                        isSelected={false} 
                        interpretedAbsVal={c.interpretedAbsVal} 
                        interpretedSuit={c.suit} 
                        sizeClass="w-8 h-11 sm:w-9 sm:h-12" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
