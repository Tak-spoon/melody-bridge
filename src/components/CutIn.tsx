import React from 'react';

interface CutInProps {
  type: 'pon' | 'chii';
  playerName: string;
}

export const CutIn: React.FC<CutInProps> = ({ type, playerName }) => {
  const isPon = type === 'pon';

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* 背景のフラッシュディマー */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs animate-cutin-dimmer" />

      {/* スピードライン帯（右から高速イン → 中央キープ → 左へ高速アウト） */}
      <div className="relative w-[260%] py-4 sm:py-5 overflow-hidden shadow-2xl flex items-center justify-center animate-cutin-slash shrink-0">
        <div className={`absolute inset-0 border-y-2 border-white/70 shadow-lg ${
          isPon 
            ? 'bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 text-white' 
            : 'bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700 text-white'
        }`} />

        {/* 光の反射エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent" />

        {/* メイン文字コンテンツ */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-white/90 drop-shadow-sm uppercase">
            {playerName}
          </span>
          <span className="text-3xl sm:text-4xl font-black italic tracking-wider text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] my-0.5 transform scale-105">
            {isPon ? 'ポン！' : 'チー！'}
          </span>
        </div>
      </div>
    </div>
  );
};
