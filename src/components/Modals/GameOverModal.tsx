import React, { useState, useEffect } from 'react';
import { Trophy, History, RotateCcw, ChevronRight, Crown, Medal } from 'lucide-react';
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
  // 第4ラウンド終了時に「ラウンド結果」→「最終順位発表」の2段階表示を管理
  const [showFinalStandings, setShowFinalStandings] = useState(false);

  // モーダルが閉じた時やラウンドが変わった時にリセット
  useEffect(() => {
    if (!isOpen || round < 4) {
      setShowFinalStandings(false);
    }
  }, [isOpen, round]);

  if (!isOpen) return null;

  const isFinalRound = round === 4;

  // 最終順位（スコアが低い順にソート）
  const rankedPlayers = players.map((p, idx) => ({
    player: p,
    score: scores[idx],
    idx
  })).sort((a, b) => a.score - b.score);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
      <div className="bg-[#180f09] rounded-2xl p-5 max-w-xs w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.85)] border-2 border-amber-500/70 animate-in fade-in zoom-in-95 duration-200">
        
        {/* アイコンヘッダー */}
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md border-2 border-amber-200">
            {showFinalStandings ? <Crown className="w-6 h-6 animate-bounce" /> : <Trophy className="w-6 h-6" />}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* パターンA：各ラウンド（第1〜第4）のラウンド結果画面 */}
        {/* ------------------------------------------------------------- */}
        {!showFinalStandings && (
          <>
            <h2 className="text-lg font-black text-amber-100 mb-1">
              第{round}ラウンド 結果
            </h2>
            <p className="text-xs font-black text-amber-200 mb-3.5 bg-[#2a1a0f] py-1.5 px-2.5 rounded-lg border border-amber-500/50 shadow-inner">
              {message}
            </p>
            
            {/* スコア一覧（今回変動と累計のグリッド整列） */}
            <div className="bg-[#22160d] p-3 rounded-xl mb-3.5 text-left border border-amber-900/60 text-xs font-bold shadow-inner">
              {/* ヘッダー行 */}
              <div className="grid grid-cols-[1fr_52px_16px_52px] items-center text-[10px] text-amber-400/70 font-bold mb-1.5 px-2.5">
                <span>プレイヤー</span>
                <span className="text-center">今回変動</span>
                <span></span>
                <span className="text-right">累計</span>
              </div>

              {/* 各プレイヤー行 */}
              <div className="space-y-1.5">
                {players.map((p, idx) => {
                  const roundPenalty = p.hand.length;
                  return (
                    <div 
                      key={p.id} 
                      className="grid grid-cols-[1fr_52px_16px_52px] items-center px-2.5 py-1.5 rounded-lg text-amber-200/90 bg-[#190f09] border border-amber-900/50"
                    >
                      <span className="truncate">{p.name}</span>

                      {/* 今ラウンドでの変動点 */}
                      <span className={`text-[11px] font-bold text-center ${
                        roundPenalty === 0 ? 'text-emerald-400' : 'text-rose-400/90'
                      }`}>
                        {roundPenalty === 0 ? '±0' : `+${roundPenalty}`}
                      </span>

                      {/* 矢印 */}
                      <span className="text-amber-500/40 text-[10px] text-center">→</span>

                      {/* 累計トータルスコア */}
                      <span className="text-xs text-right text-amber-100 font-bold">
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
                className="w-full py-1.5 bg-[#26180f] hover:bg-[#382315] text-amber-200 border border-amber-700/50 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
              >
                <History className="w-3.5 h-3.5 text-amber-400" /> 対戦ログを見る
              </button>
              
              {isFinalRound ? (
                <button 
                  onClick={() => setShowFinalStandings(true)} 
                  className="w-full py-2.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-lg border-2 border-amber-200 flex items-center justify-center gap-1 transition animate-pulse"
                >
                  🏆 最終結果の発表へ <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={onNextRound} 
                  className="w-full py-2.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-lg border-2 border-amber-200 flex items-center justify-center gap-1 transition"
                >
                  次へ (R{round + 1}) <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* パターンB：全4ラウンド終了後の「最終結果発表（総合順位）」画面 */}
        {/* ------------------------------------------------------------- */}
        {showFinalStandings && (
          <>
            <h2 className="text-lg font-black text-amber-100 mb-1">
              🏆 最終順位発表
            </h2>
            <p className="text-xs font-black text-amber-300 mb-3.5 bg-[#2a1a0f] py-1.5 px-2.5 rounded-lg border border-amber-500/50 shadow-inner">
              全4ラウンドの対戦が終了しました！
            </p>
            
            {/* 順位ランキング表 */}
            <div className="bg-[#22160d] p-3 rounded-xl mb-3.5 text-left border border-amber-900/60 text-xs font-bold shadow-inner space-y-2">
              {rankedPlayers.map((item, rankIdx) => {
                const rank = rankIdx + 1;
                const isChampion = rank === 1;
                return (
                  <div 
                    key={item.player.id} 
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isChampion 
                        ? 'bg-gradient-to-r from-amber-500/40 via-amber-400/30 to-amber-500/40 text-amber-100 border-2 border-amber-400 shadow-md' 
                        : rank === 2
                          ? 'bg-slate-700/40 text-slate-200 border border-slate-500/60'
                          : rank === 3
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                            : 'bg-[#190f09] text-slate-400 border border-amber-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs shrink-0 ${
                        isChampion 
                          ? 'bg-amber-400 text-slate-950' 
                          : rank === 2 
                            ? 'bg-slate-300 text-slate-950' 
                            : rank === 3 
                              ? 'bg-amber-700 text-white' 
                              : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rank}位
                      </span>
                      <span className={`truncate ${isChampion ? 'font-black text-amber-200 text-xs' : 'font-bold'}`}>
                        {item.player.name}
                      </span>
                    </div>

                    <span className={`text-xs font-black ${isChampion ? 'text-amber-300' : 'text-amber-100'}`}>
                      {item.score} pt
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={onOpenLogs} 
                className="w-full py-1.5 bg-[#26180f] hover:bg-[#382315] text-amber-200 border border-amber-700/50 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
              >
                <History className="w-3.5 h-3.5 text-amber-400" /> 対戦ログを見る
              </button>

              <button 
                onClick={onRestartGame} 
                className="w-full py-2.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-lg border-2 border-amber-200 flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-4 h-4" /> もう一度遊ぶ（再戦）
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
