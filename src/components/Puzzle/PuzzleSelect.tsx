import React, { useState } from 'react';
import { ArrowLeft, Trophy, Sparkles, BookOpen, Star, Layers } from 'lucide-react';
import { PUZZLE_CHAPTERS } from '../../constants/puzzles';
import { PuzzleStage } from '../../types/puzzle';

interface PuzzleSelectProps {
  onSelectStage: (stage: PuzzleStage) => void;
  onBackToTitle: () => void;
  initialChapterId?: string;
}

const CLEARED_STORAGE_KEY = 'mb_puzzle_cleared_stages_v1';

export const PuzzleSelect: React.FC<PuzzleSelectProps> = ({
  onSelectStage,
  onBackToTitle,
  initialChapterId = 'tutorial',
}) => {
  // 選択中のチャプターID
  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    if (initialChapterId && PUZZLE_CHAPTERS.some(ch => ch.id === initialChapterId)) {
      return initialChapterId;
    }
    return PUZZLE_CHAPTERS[0].id;
  });

  // クリア済みステージIDのリスト
  const [clearedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CLEARED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const totalStages = PUZZLE_CHAPTERS.reduce((acc, ch) => acc + ch.stages.length, 0);
  const totalCleared = clearedIds.length;

  const currentChapter = PUZZLE_CHAPTERS.find(c => c.id === activeChapterId) || PUZZLE_CHAPTERS[0];
  const currentChapterCleared = currentChapter.stages.filter(s => clearedIds.includes(s.id)).length;
  const isCurrentAllCleared = currentChapterCleared === currentChapter.stages.length;

  // タブ用の略称ラベル
  const getTabLabel = (chapterId: string) => {
    switch (chapterId) {
      case 'tutorial': return '入門';
      case 'ch1': return '初級 ★';
      case 'ch2': return '中級 ★★';
      case 'ch3': return '上級 ★★★';
      default: return '';
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-[#141f17] via-[#1a2d21] to-[#0f1712] text-emerald-100 select-none overflow-hidden">
      
      {/* 1. 最上部ヘッダーバー */}
      <div className="bg-[#0f1d14] px-3 py-2 shadow-md flex justify-between items-center shrink-0 border-b border-emerald-900/60 z-20">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBackToTitle}
            className="px-2 py-1 rounded-lg bg-[#182c1f] hover:bg-[#23402d] text-emerald-300 hover:text-emerald-100 transition active:scale-95 border border-emerald-700/50 flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>タイトル</span>
          </button>
          <h2 className="text-xs sm:text-sm font-bold text-emerald-100 flex items-center gap-1.5 ml-1 font-serif">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>パズルモード</span>
          </h2>
        </div>

        {/* 全体クリア進捗バッジ */}
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10.5px] font-bold text-emerald-300 shadow-inner">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{totalCleared} / {totalStages} クリア</span>
        </div>
      </div>

      {/* 2. チャプター切り替えタブバー（4タブ横並び） */}
      <div className="bg-[#122217] px-2 py-1.5 border-b border-emerald-800/60 shrink-0 grid grid-cols-4 gap-1.5 shadow-sm">
        {PUZZLE_CHAPTERS.map(ch => {
          const isActive = ch.id === activeChapterId;
          const clearedCount = ch.stages.filter(s => clearedIds.includes(s.id)).length;
          const isDone = clearedCount === ch.stages.length;

          return (
            <button
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              className={`py-1.5 px-1 rounded-xl font-bold text-center transition-all flex flex-col items-center justify-center relative active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-300'
                  : 'bg-[#182c1f]/80 text-emerald-300/80 hover:bg-[#203c2a] hover:text-emerald-100 border border-emerald-800/40'
              }`}
            >
              <span className="text-[11px] sm:text-xs font-black tracking-tight flex items-center gap-0.5">
                {getTabLabel(ch.id)}
                {isDone && <Star className="w-3 h-3 text-amber-300 fill-amber-300" />}
              </span>
              <span className={`text-[9.5px] ${isActive ? 'text-emerald-100 font-black' : 'text-emerald-400/70'}`}>
                {clearedCount}/{ch.stages.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. チャプター概要バー */}
      <div className="px-3 py-1.5 bg-[#172c1e]/60 border-b border-emerald-900/40 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-black text-emerald-200 flex items-center gap-1.5">
            <span>{currentChapter.title}</span>
            {isCurrentAllCleared && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ⭐ ALL CLEAR
              </span>
            )}
          </span>
          <span className="text-[10px] text-emerald-300/70 line-clamp-1">
            {currentChapter.subtitle}
          </span>
        </div>
      </div>

      {/* 4. ステージ一覧（2列グリッドタイルで一望できるレイアウト） */}
      <div className="flex-1 overflow-y-auto p-2.5">
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {currentChapter.stages.map((stage, idx) => {
            const isCleared = clearedIds.includes(stage.id);

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage)}
                className={`group p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-[0.97] min-h-[62px] relative overflow-hidden ${
                  isCleared
                    ? 'bg-gradient-to-br from-[#1d3826] to-[#162a1d] hover:from-[#244530] hover:to-[#1c3524] border-emerald-600/70 shadow-sm'
                    : 'bg-gradient-to-br from-[#132217] to-[#0e1911] hover:from-[#1a2e20] hover:to-[#132318] border-emerald-900/80 shadow-inner'
                }`}
              >
                {/* 背景装飾 */}
                {isCleared && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
                )}

                {/* カード上部：ステージ番号 ＆ クリアスター */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isCleared
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                  }`}>
                    {stage.title.split(':')[0]}
                  </span>

                  {isCleared ? (
                    <div className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
                      <span className="text-[9px] font-black">済</span>
                    </div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-emerald-600/50 bg-emerald-950/40" />
                  )}
                </div>

                {/* カード中央：ステージ名 */}
                <div className="my-1.5">
                  <h4 className="text-xs sm:text-[13px] font-black text-emerald-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-tight">
                    {stage.title.split(':')[1]?.trim() || stage.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
