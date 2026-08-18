import React from 'react';
import { Gamepad2, GraduationCap, Layers, BookOpen, BarChart2, Settings } from 'lucide-react';
import { Card } from './Card';
import { Card as CardType } from '../types/game';
import { playCardTone } from '../utils/audio';

interface TitleScreenProps {
  onSelectBattle: () => void;
  onSelectTutorial: () => void;
  onSelectPuzzle: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenOptions: () => void;
}

// サンプル用カードデータ（3枚コード ＆ 3枚スケール）
const SAMPLE_CHORD_CARDS: CardType[] = [
  { id: 'sc1', val: 0, oct: 3, absVal: 7 },  // C3 (ド)
  { id: 'sc2', val: 2, oct: 3, absVal: 9 },  // E3 (ミ)
  { id: 'sc3', val: 4, oct: 3, absVal: 11 }, // G3 (ソ)
];

const SAMPLE_SCALE_CARDS: CardType[] = [
  { id: 'ss1', val: 3, oct: 3, absVal: 10 }, // F3 (ファ)
  { id: 'ss2', val: 4, oct: 3, absVal: 11 }, // G3 (ソ)
  { id: 'ss3', val: 5, oct: 3, absVal: 12 }, // A3 (ラ)
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onSelectBattle,
  onSelectTutorial,
  onSelectPuzzle,
  onOpenRules,
  onOpenStats,
  onOpenOptions,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-3 sm:p-5 bg-[#120a06] text-[#e8d5b5] select-none overflow-y-auto">
      
      {/* 1. タイトルロゴ */}
      <div className="flex flex-col items-center text-center pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-[#f5ebd9] font-serif drop-shadow-md">
          メロディ・ブリッジ
        </h1>
        <span className="text-[9.5px] tracking-[0.35em] text-[#9c7849] uppercase font-serif mt-0.5">
          MELODY BRIDGE
        </span>
      </div>

      {/* 2. 🃏 3枚×2の躍動感あるクロスオーバー・カードショーケース */}
      <div className="w-full max-w-xs my-2 flex items-center justify-center">
        <div className="relative h-32 sm:h-36 w-72 sm:w-80 flex items-center justify-center">
          
          {/* 左側グループ: Cコード [C3, E3, G3] */}
          <div className="absolute left-2 sm:left-4 flex items-center transition-transform hover:scale-105 duration-300">
            {/* C3 */}
            <div 
              className="absolute -translate-x-8 -translate-y-1 transform -rotate-[18deg] shadow-2xl cursor-pointer transition hover:-translate-y-3"
              onClick={() => playCardTone(7)}
              title="C3 (ド)"
            >
              <Card card={SAMPLE_CHORD_CARDS[0]} sizeClass="w-13 h-18 sm:w-14 sm:h-20" />
            </div>
            {/* E3 */}
            <div 
              className="absolute -translate-x-1 translate-y-0.5 transform -rotate-[6deg] shadow-2xl cursor-pointer transition hover:-translate-y-3 z-10"
              onClick={() => playCardTone(9)}
              title="E3 (ミ)"
            >
              <Card card={SAMPLE_CHORD_CARDS[1]} sizeClass="w-13 h-18 sm:w-14 sm:h-20" />
            </div>
            {/* G3 */}
            <div 
              className="relative translate-x-6 -translate-y-0.5 transform rotate-[6deg] shadow-2xl cursor-pointer transition hover:-translate-y-3 z-20"
              onClick={() => playCardTone(11)}
              title="G3 (ソ)"
            >
              <Card card={SAMPLE_CHORD_CARDS[2]} sizeClass="w-13 h-18 sm:w-14 sm:h-20" />
            </div>
          </div>

          {/* 右側グループ: スケール [F3, G3, A3] */}
          <div className="absolute right-2 sm:right-4 flex items-center transition-transform hover:scale-105 duration-300">
            {/* F3 */}
            <div 
              className="relative -translate-x-6 -translate-y-0.5 transform -rotate-[6deg] shadow-2xl cursor-pointer transition hover:-translate-y-3"
              onClick={() => playCardTone(10)}
              title="F3 (ファ)"
            >
              <Card card={SAMPLE_SCALE_CARDS[0]} sizeClass="w-13 h-18 sm:w-14 sm:h-20" />
            </div>
            {/* G3 */}
            <div 
              className="absolute translate-x-1 translate-y-0.5 transform rotate-[6deg] shadow-2xl cursor-pointer transition hover:-translate-y-3 z-10"
              onClick={() => playCardTone(11)}
              title="G3 (ソ)"
            >
              <Card card={SAMPLE_SCALE_CARDS[1]} sizeClass="w-13 h-18 sm:w-14 sm:h-20" />
            </div>
            {/* A3 */}
            <div 
              className="absolute translate-x-8 -translate-y-1 transform rotate-[18deg] shadow-2xl cursor-pointer transition hover:-translate-y-3 z-20"
              onClick={() => playCardTone(12)}
              title="A3 (ラ)"
            >
              <Card card={SAMPLE_SCALE_CARDS[2]} sizeClass="w-13 h-18 sm:w-14 sm:h-20" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. モード選択（3大モード・スマートな1行説明文付き） */}
      <div className="w-full max-w-sm space-y-2.5 mb-2">
        
        {/* 1. 通常対戦 */}
        <button
          onClick={onSelectBattle}
          className="group w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#211309] via-[#2a190d] to-[#211309] hover:from-[#2e1c10] hover:via-[#3b2313] hover:to-[#2e1c10] border border-[#6b4724]/60 hover:border-[#b88e54] shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#140b06] border border-[#4d3219] flex items-center justify-center text-[#d4af37] group-hover:border-[#b88e54] transition-colors shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#f5ebd9] group-hover:text-[#ffd978] transition-colors font-serif">
                  通常対戦
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#140b06] text-[#b88e54] border border-[#4d3219]">
                  4 Players
                </span>
              </div>
              <p className="text-[10px] text-[#9c7b50] mt-0.5">
                4人で競い合う音楽カード対戦
              </p>
            </div>
          </div>
        </button>

        {/* 2. チュートリアル */}
        <button
          onClick={onSelectTutorial}
          className="group w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#171a24] via-[#1f2330] to-[#171a24] hover:from-[#222736] hover:via-[#2b3142] hover:to-[#222736] border border-[#3b4766]/60 hover:border-[#60a5fa] shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0e1017] border border-[#262f45] flex items-center justify-center text-[#60a5fa] group-hover:border-[#60a5fa] transition-colors shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-[#e8effc] group-hover:text-[#93c5fd] transition-colors font-serif block">
                チュートリアル
              </span>
              <p className="text-[10px] text-[#8292b3] mt-0.5">
                基本操作と役作りをステップ学習
              </p>
            </div>
          </div>
        </button>

        {/* 3. パズルモード */}
        <button
          onClick={onSelectPuzzle}
          className="group w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#121e16] via-[#17281e] to-[#121e16] hover:from-[#192b1f] hover:via-[#22392b] hover:to-[#192b1f] border border-[#34533f]/60 hover:border-[#528a64] shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0b140f] border border-[#233a2c] flex items-center justify-center text-[#68a880] group-hover:border-[#528a64] transition-colors shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-[#e8f5ed] group-hover:text-[#a8e0be] transition-colors font-serif block">
                パズルモード
              </span>
              <p className="text-[10px] text-[#7a9985] mt-0.5">
                一手でアガリを導く本格思考パズル
              </p>
            </div>
          </div>
        </button>

      </div>

      {/* 4. サブメニューバー */}
      <div className="w-full max-w-sm flex items-center justify-center gap-2 pt-2 border-t border-[#382213]/40">
        <button
          onClick={onOpenRules}
          className="flex-1 py-1.5 px-2 bg-[#1a0f07] hover:bg-[#26160c] text-[#b89f82] hover:text-[#f5ebd9] text-xs font-bold rounded-lg border border-[#472d1a]/50 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#8f6d3e]" />
          <span>遊び方</span>
        </button>

        <button
          onClick={onOpenStats}
          className="flex-1 py-1.5 px-2 bg-[#1a0f07] hover:bg-[#26160c] text-[#b89f82] hover:text-[#f5ebd9] text-xs font-bold rounded-lg border border-[#472d1a]/50 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <BarChart2 className="w-3.5 h-3.5 text-[#8f6d3e]" />
          <span>対戦記録</span>
        </button>

        <button
          onClick={onOpenOptions}
          className="flex-1 py-1.5 px-2 bg-[#1a0f07] hover:bg-[#26160c] text-[#b89f82] hover:text-[#f5ebd9] text-xs font-bold rounded-lg border border-[#472d1a]/50 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <Settings className="w-3.5 h-3.5 text-[#8f6d3e]" />
          <span>設定</span>
        </button>
      </div>

    </div>
  );
};
