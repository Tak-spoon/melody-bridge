import React from 'react';
import { Music } from 'lucide-react';
import { Card as CardType } from '../types/game';
import { NOTE_NAMES, NOTE_JP, SUITS } from '../constants/music';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  interpretedAbsVal?: number | null;
  interpretedSuit?: 'red' | 'blue' | null;
  sizeClass?: string;
  isHighlighted?: boolean;
  isHidden?: boolean;
  extraClass?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  onClick,
  interpretedAbsVal = null,
  interpretedSuit = null,
  sizeClass = "w-11 h-15 sm:w-13 sm:h-18",
  isHighlighted = false,
  isHidden = false,
  extraClass = ""
}) => {
  if (isHidden) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${sizeClass} rounded-lg border border-slate-400 bg-slate-700 shadow-xs flex flex-col items-center justify-center cursor-default select-none transition-all duration-200 ${extraClass}`}
      >
        <Music className="w-4 h-4 text-slate-400 opacity-40" />
      </div>
    );
  }

  const absValToUse = interpretedAbsVal !== null && interpretedAbsVal !== undefined ? interpretedAbsVal : card.absVal;
  const suitToUse = interpretedSuit !== null && interpretedSuit !== undefined ? interpretedSuit : card.suit;
  
  const oct = Math.floor(absValToUse / 7) + 3;
  const suitObj = SUITS.find(s => s.id === suitToUse) || SUITS[0];
  const noteIndex = absValToUse % 7;

  return (
    <div 
      onClick={onClick}
      className={`relative ${sizeClass} rounded-lg border-2 shadow-xs flex flex-col items-center justify-center cursor-pointer select-none
        ${suitObj.color}
        ${isSelected ? 'ring-2 ring-slate-800 -translate-y-1.5 shadow-md z-10' : ''}
        ${isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50 animate-bounce shadow-md' : ''}
        ${extraClass}`}
    >
      <div className="flex flex-col items-center pointer-events-none">
        <span className="text-sm sm:text-base font-black flex items-baseline leading-none">
          {NOTE_NAMES[noteIndex]}
          <span className="text-[9px] font-bold ml-0.5 opacity-80">{oct}</span>
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 leading-none opacity-90">{NOTE_JP[noteIndex]}</span>
      </div>
    </div>
  );
};
