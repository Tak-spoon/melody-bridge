import React from 'react';
import { Music } from 'lucide-react';
import { Card as CardType } from '../types/game';
import { NOTE_NAMES, NOTE_JP } from '../constants/music';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  interpretedAbsVal?: number | null;
  sizeClass?: string;
  isHighlighted?: boolean;
  isReadyToMeld?: boolean;
  isTwoCardPair?: boolean;
  isDimmed?: boolean;
  isHidden?: boolean;
  extraClass?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  onClick,
  interpretedAbsVal = null,
  sizeClass = "w-11 h-15 sm:w-13 sm:h-18",
  isHighlighted = false,
  isReadyToMeld = false,
  isTwoCardPair = false,
  isDimmed = false,
  isHidden = false,
  extraClass = ""
}) => {
  // トランプの裏面（山札のカードバック）
  if (isHidden) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${sizeClass} rounded-md sm:rounded-lg border-2 border-white bg-slate-800 p-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-default select-none overflow-hidden ${extraClass}`}
      >
        <div className="w-full h-full rounded-xs border border-slate-600/50 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:5px_5px] bg-slate-800 flex items-center justify-center">
          <Music className="w-3.5 h-3.5 text-slate-400 opacity-60" />
        </div>
      </div>
    );
  }

  const absValToUse = interpretedAbsVal !== null && interpretedAbsVal !== undefined ? interpretedAbsVal : card.absVal;
  
  const oct = Math.floor(absValToUse / 7) + 2;
  const noteIndex = absValToUse % 7;

  return (
    <div 
      onClick={onClick}
      className={`relative ${sizeClass} rounded-md sm:rounded-lg border-2 flex flex-col items-center justify-center select-none
        transition-all duration-150 ease-out
        ${isSelected 
          ? '-translate-y-3 border-amber-500 bg-gradient-to-b from-[#fffbeb] via-white to-[#fef3c7] text-amber-900 shadow-[0_8px_16px_rgba(0,0,0,0.35)] z-20 cursor-pointer ring-2 ring-amber-400/90' 
          : isReadyToMeld
            ? 'border-amber-300 text-amber-950 bg-gradient-to-b from-[#ffffff] via-[#fffbeb] to-[#fef08a] shadow-[0_2px_8px_rgba(251,191,36,0.4)] cursor-pointer ring-1.5 ring-amber-300 z-15'
          : isTwoCardPair
            ? 'border-purple-400 text-purple-950 bg-gradient-to-b from-[#faf5ff] via-white to-[#f3e8ff] shadow-xs cursor-pointer ring-1 ring-purple-400/70 z-10'
              : isDimmed
                ? 'border-amber-900/30 text-amber-900/70 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0] opacity-65 brightness-90 shadow-none cursor-pointer hover:opacity-90'
                : 'border-amber-700/50 text-amber-900 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer hover:border-amber-500'
        }
        ${extraClass}`}
    >
      <div className="flex flex-col items-center pointer-events-none">
        <span className={`text-sm sm:text-base font-black flex items-baseline leading-none tracking-tight ${
          isReadyToMeld && !isSelected ? 'text-amber-950 font-black' : isTwoCardPair && !isSelected ? 'text-purple-900' : ''
        }`}>
          {NOTE_NAMES[noteIndex]}
          <span className="text-[9px] font-bold ml-0.5 opacity-75">{oct}</span>
        </span>
        <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 leading-none ${
          isReadyToMeld && !isSelected ? 'text-amber-900 font-black' : isTwoCardPair && !isSelected ? 'text-purple-700 font-black' : 'opacity-85'
        }`}>
          {NOTE_JP[noteIndex]}
        </span>
      </div>
    </div>
  );
};
