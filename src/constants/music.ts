import { SuitType } from '../types/game';

export const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const NOTE_JP = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'] as const;

export interface SuitConfig {
  id: SuitType;
  name: string;
  color: string;
}

export const SUITS: SuitConfig[] = [
  { 
    id: 'red', 
    name: '赤', 
    color: 'border-rose-300 text-rose-700 bg-gradient-to-b from-white via-white to-rose-50/60 ring-rose-400' 
  },
  { 
    id: 'blue', 
    name: '青', 
    color: 'border-blue-300 text-blue-700 bg-gradient-to-b from-white via-white to-blue-50/60 ring-blue-400' 
  }
];

// C3〜B5の21音の周波数一覧（Hz）
export const FREQUENCIES = [
  130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, // C3〜B3 (0〜6)
  261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, // C4〜B4 (7〜13)
  523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77  // C5〜B5 (14〜20)
];
