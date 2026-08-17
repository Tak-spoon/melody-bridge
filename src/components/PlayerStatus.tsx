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
    <div className="bg-white border-b border-slate-200 px-2 py-1.5 shrink-0">
      <div className="grid grid-cols-4 gap-1.5">
        {players.map((p) => {
          const isCurrent = turn === p.id && !roundOver;
          return (
            <div 
              key={p.id} 
              className={`py-1 px-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                isCurrent 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300 transform scale-[1.02]' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center gap-1 max-w-full">
                {p.isCPU ? (
                  <Cpu className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`} />
                ) : (
                  <User className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`} />
                )}
                <span className="text-[11px] font-bold truncate leading-tight">{p.name}</span>
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 ${isCurrent ? 'text-blue-100 font-bold' : 'text-slate-500'}`}>
                {p.hand.length}枚
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
