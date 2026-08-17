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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl p-4 max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col max-h-[80vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2.5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>捨て札一覧 ({discardPile.length}枚)</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
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
                className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 shadow-2xs"
              >
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded truncate max-w-full ${
                  isUser ? 'bg-blue-100 text-blue-800' : isSystem ? 'bg-slate-300 text-slate-700' : 'bg-slate-200 text-slate-700'
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
          className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
