import React, { useState, useEffect } from 'react';
import { Trophy, History, RotateCcw, ChevronRight, Crown } from 'lucide-react';
import { Player } from '../../types/game';
import { calculateRoundScore } from '../../utils/stats';

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

  // 最終順位（得点が高い順にソート）
  const rankedPlayers = players.map((p, idx) => ({
    player: p,
    score: scores[idx],
    idx
  })).sort((a, b) => b.score - a.score);

  // ラウンド順位の算出 (手札の残りが少ない順。勝者が1位)
  const winner = players.find(p => p.hand.length === 0);
  let roundRankOrder: number[] = [];
  if (winner) {
    const rem = [0, 1, 2, 3].filter(p => p !== winner.id);
    rem.sort((a, b) => players[a].hand.length - players[b].hand.length);
    roundRankOrder = [winner.id, ...rem];
  } else {
    const allP = [0, 1, 2, 3];
    allP.sort((a, b) => players[a].hand.length - players[b].hand.length);
    roundRankOrder = allP;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[70] p-2.5">
      <div className="bg-[#180f09] rounded-2xl p-3.5 max-w-sm w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.85)] border-2 border-amber-500/70 animate-in fade-in zoom-in-95 duration-200">
        
        {/* アイコンヘッダー */}
        <div className="flex justify-center mb-1.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md border-2 border-amber-200">
            {showFinalStandings ? <Crown className="w-5 h-5 animate-bounce" /> : <Trophy className="w-5 h-5" />}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* パターンA：各ラウンド（第1〜第4）のラウンド結果画面 */}
        {/* ------------------------------------------------------------- */}
        {!showFinalStandings && (
          <>
            <h2 className="text-base font-black text-amber-100 mb-0.5">
              第{round}ラウンド 結果
            </h2>
            <p className="text-[11px] font-black text-amber-200 mb-2.5 bg-[#2a1a0f] py-1 px-2 rounded-lg border border-amber-500/50 shadow-inner">
              {message}
            </p>
            
            {/* スコア詳細 内訳テーブル（スマホ縦画面360px完全収まり・役と付け札を別々に明記） */}
            <div className="bg-[#22160d] p-1.5 rounded-xl mb-3 text-left border border-amber-900/60 shadow-inner">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="text-[9px] text-amber-400/90 border-b border-amber-900/60 pb-1">
                    <th className="py-1 font-bold">対戦者</th>
                    <th className="py-1 font-bold text-center">着順</th>
                    <th className="py-1 font-bold text-center text-amber-400">着順点</th>
                    <th className="py-1 font-bold text-center text-emerald-400">役</th>
                    <th className="py-1 font-bold text-center text-teal-400">付け札</th>
                    <th className="py-1 font-bold text-center text-emerald-300">今回</th>
                    <th className="py-1 font-bold text-right text-amber-200">累計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-950/60 font-bold">
                  {players.map((p, idx) => {
                    const rPos = roundRankOrder.indexOf(idx);
                    const melds = p.actions?.melds || 0;
                    const adds = p.actions?.adds || 0;
                    const detail = calculateRoundScore(rPos, melds, adds);
                    const rank = rPos + 1;

                    return (
                      <tr key={p.id} className="hover:bg-amber-950/30">
                        {/* 1. 対戦者名 */}
                        <td className="py-1 font-bold text-amber-100 truncate max-w-[55px] text-[10px]">
                          {p.name}
                        </td>

                        {/* 2. 着順バッジ */}
                        <td className="py-1 text-center">
                          <span className={`text-[8.5px] font-black px-1 py-0.2 rounded shadow-xs ${
                            rank === 1 ? 'bg-amber-400 text-slate-950 font-black' :
                            rank === 2 ? 'bg-slate-700 text-slate-200' :
                            rank === 3 ? 'bg-amber-900 text-amber-200' :
                            'bg-slate-900 text-slate-400'
                          }`}>
                            {rank}着
                          </span>
                        </td>

                        {/* 3. 着順点 */}
                        <td className="py-1 text-center text-amber-400 font-bold text-[10px]">
                          +{detail.rankPoints}
                        </td>

                        {/* 4. 役加点 */}
                        <td className="py-1 text-center text-emerald-400/90 font-bold text-[10px]">
                          +{detail.meldBonus}
                        </td>

                        {/* 5. 付け札加点 */}
                        <td className="py-1 text-center text-teal-400/90 font-bold text-[10px]">
                          +{detail.addBonus}
                        </td>

                        {/* 6. 今回獲得合計 */}
                        <td className="py-1 text-center text-emerald-300 font-black text-[10px]">
                          +{detail.totalRoundScore}pt
                        </td>

                        {/* 7. 累計スコア */}
                        <td className="py-1 text-right text-amber-100 font-black text-[10px]">
                          {scores[idx]}pt
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            
            {/* 順位ランキング表（最高得点順） */}
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

