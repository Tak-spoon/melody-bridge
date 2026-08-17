import React from 'react';
import { Trophy, History, RotateCcw, ChevronRight } from 'lucide-react';
import { Player } from '../../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  round: number;
  scores: number[];
  players: Player[];
  message: string;
  onOpenLogs: () => void;
  onNextRound: () => void;
  onRestartGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  round,
  scores,
  players,
  message,
  onOpenLogs,
  onNextRound,
  onRestartGame
}) => {
  if (!isOpen) return null;

  const isFinalRound = round === 4;
  const minScore = Math.min(...scores);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-lg font-black text-slate-800 mb-1">
          {isFinalRound ? '最終結果発表' : `R${round} 終了`}
        </h2>
        <p className="text-xs font-bold text-blue-600 mb-3.5 bg-blue-50 py-1 px-2 rounded-lg border border-blue-100">
          {message}
        </p>
        
        {/* スコア一覧（ペナルティポイントなので少ない人が勝ち） */}
        <div className="bg-slate-50 p-3 rounded-xl mb-3.5 text-left border border-slate-200 text-xs font-bold shadow-inner">
          <div className="text-[10px] text-slate-400 font-semibold mb-1.5 flex justify-between">
            <span>プレイヤー</span>
            <span>ペナルティ (手札残数)</span>
          </div>
          <div className="space-y-1.5">
            {players.map((p, idx) => {
              const isWinner = isFinalRound && scores[idx] === minScore;
              return (
                <div 
                  key={p.id} 
                  className={`flex justify-between items-center px-2 py-1.5 rounded-lg transition-all ${
                    isWinner 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-black' 
                      : 'text-slate-700 bg-white border border-slate-200/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isWinner && (
                      <span className="text-[9px] bg-amber-500 text-white px-1 py-0.2 rounded font-bold">
                        1位
                      </span>
                    )}
                    {p.name}
                  </span>
                  <span className={`${isWinner ? 'text-amber-700 font-black' : 'text-slate-600'}`}>
                    {scores[idx]} pt
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={onOpenLogs} 
            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
          >
            <History className="w-3.5 h-3.5" /> 対戦ログを見る
          </button>
          
          {isFinalRound ? (
            <button 
              onClick={onRestartGame} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1 transition"
            >
              <RotateCcw className="w-4 h-4" /> もう一度遊ぶ
            </button>
          ) : (
            <button 
              onClick={onNextRound} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1 transition"
            >
              次へ (R{round + 1}) <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
