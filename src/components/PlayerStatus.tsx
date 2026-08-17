import React from 'react';
import { Player } from '../types/game';
import { User, Cpu } from 'lucide-react';

interface PlayerStatusProps {
  players: Player[];
  turn: number;
  roundOver: boolean;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({ players, turn, roundOver }) => {
  return (
    <div className="bg-white/95 backdrop-blur-xs border-b border-amber-900/20 px-2 py-1.5 shrink-0 shadow-xs">
      <div className="grid grid-cols-4 gap-1.5">
        {players.map((p) => {
          const isCurrent = turn === p.id && !roundOver;
          return (
            <div 
              key={p.id} 
              className={`h-11 px-1 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-150 select-none ${
                isCurrent 
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-md font-black' 
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1 max-w-full">
                {p.isCPU ? (
                  <Cpu className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-amber-950' : 'text-slate-400'}`} />
                ) : (
                  <User className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-amber-950' : 'text-slate-400'}`} />
                )}
                <span className="text-[11px] font-black truncate leading-tight">{p.name}</span>
              </div>
              <span className={`text-[10px] mt-0.5 leading-none ${isCurrent ? 'text-amber-950 font-black' : 'text-slate-500 font-bold'}`}>
                {p.hand.length}枚
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
