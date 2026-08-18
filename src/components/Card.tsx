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
        transition-transform duration-100 ease-out
        border-amber-700/50 text-amber-900 bg-gradient-to-b from-[#faf7ee] via-white to-[#f5f0e0]
        ${isSelected 
          ? '-translate-y-3 shadow-[0_8px_16px_rgba(0,0,0,0.25)] z-20 cursor-pointer' 
          : isDimmed
            ? 'opacity-35 cursor-default'
            : 'shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer'
        }
        ${extraClass}`}
    >
      <div className="flex flex-col items-center pointer-events-none">
        <span className="text-sm sm:text-base font-black flex items-baseline leading-none tracking-tight">
          {NOTE_NAMES[noteIndex]}
          <span className="text-[9px] font-bold ml-0.5 opacity-75">{oct}</span>
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 leading-none opacity-85">{NOTE_JP[noteIndex]}</span>
      </div>
    </div>
  );
};
