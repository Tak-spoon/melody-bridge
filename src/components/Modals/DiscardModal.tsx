import React from 'react';
import { X, Layers } from 'lucide-react';
import { Card as CardComponent } from '../Card';
import { DiscardItem, Player } from '../../types/game';

interface DiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  discardPile: DiscardItem[];
  players: Player[];
}

export const DiscardModal: React.FC<DiscardModalProps> = ({
  isOpen,
  onClose,
  discardPile,
  players
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
      <div className="bg-[#180f09] rounded-2xl p-4 max-w-sm sm:max-w-md w-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh] border-2 border-amber-500/60 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-3 border-b border-[#382315] pb-2.5">
          <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>捨て札一覧 ({discardPile.length}枚)</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-amber-400/70 hover:text-amber-200 p-1 rounded-lg hover:bg-[#281a10] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 p-1">
          {discardPile.map((item, idx) => {
            const isSystem = item.discarderId === 'system';
            const ownerName = isSystem ? '初期(王牌)' : (players[item.discarderId as number]?.name || '誰か');
            const isUser = item.discarderId === 0;

            return (
              <div 
                key={`${item.card.id}_${idx}`} 
                className="flex flex-col items-center gap-1 bg-[#24170e] p-1.5 rounded-lg border border-amber-900/60 shadow-inner"
              >
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded truncate max-w-full ${
                  isUser 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : isSystem 
                      ? 'bg-slate-700 text-slate-200' 
                      : 'bg-[#382315] text-amber-200'
                }`}>
                  {ownerName}
                </span>
                <CardComponent
                  card={item.card}
                  isSelected={false}
                  sizeClass="w-9 h-12"
                  isHidden={item.isHidden}
                />
              </div>
            );
          })}
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-3 w-full py-2 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
