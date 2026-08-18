import React, { useState, useRef } from 'react';
import { BarChart3, X, Zap, RotateCcw, PlayCircle, GripHorizontal, Minimize2, Maximize2, Activity, ShieldCheck, AlertTriangle, Copy, Check } from 'lucide-react';
import { GameStats, runBatchSimulation, resetStats } from '../../utils/stats';
import { GameState } from '../../types/game';
import { getChordSymbol } from '../../utils/musicTheory';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  gameState: GameState;
  onUpdateStats: (newStats: GameStats) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  gameState,
  onUpdateStats,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'overview' | 'players' | 'transitions' | 'melds' | 'sim'>('current');
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  // ドラッグ移動位置の管理
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
  });
  const modalRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: posRef.current.x,
      initPosY: posRef.current.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = dragStartRef.current.initPosX + dx;
    const newY = dragStartRef.current.initPosY + dy;

    posRef.current = { x: newX, y: newY };

    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    animFrameIdRef.current = requestAnimationFrame(() => {
      if (modalRef.current) {
        modalRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setPosition(posRef.current);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  if (!isOpen) return null;

  const totalRounds = stats.totalRounds;
  const totalWins = stats.wins.reduce((a, b) => a + b, 0);
  const winRate = totalRounds > 0 ? ((totalWins / totalRounds) * 100).toFixed(1) : '0.0';
  const drawRate = totalRounds > 0 ? ((stats.draws / totalRounds) * 100).toFixed(1) : '0.0';
  const avgTurns = totalRounds > 0 ? (stats.totalTurns / totalRounds).toFixed(1) : '0.0';

  const p0Score = (stats.totalScores || stats.totalPenalties || [0, 0, 0, 0])[0];
  const p0AvgMatchScoreVal = totalRounds > 0 ? (p0Score / totalRounds) * 4 : 0;
  const p0AvgMatchScoreStr = p0AvgMatchScoreVal > 0 ? `+${p0AvgMatchScoreVal.toFixed(1)}` : p0AvgMatchScoreVal.toFixed(1);

  const playerNames = ['あなた(Bot)', 'CPU 1', 'CPU 2', 'CPU 3'];
  const playerColors = [
    'from-amber-400 to-amber-600 border-amber-300 text-slate-950',
    'from-blue-500 to-blue-700 border-blue-400 text-white',
    'from-emerald-500 to-emerald-700 border-emerald-400 text-white',
    'from-purple-500 to-purple-700 border-purple-400 text-white',
  ];

  const handleBatchSim = (count: number) => {
    setIsSimulating(true);
    setTimeout(() => {
      const updated = runBatchSimulation(count, stats);
      onUpdateStats(updated);
      setIsSimulating(false);
    }, 50);
  };

  const handleReset = () => {
    if (window.confirm('統計データをリセットしてもよろしいですか？')) {
      const fresh = resetStats();
      onUpdateStats(fresh);
    }
  };

  const handleCopyStats = () => {
    const avgTurnsPerRound = totalRounds > 0 ? (stats.totalTurns / totalRounds).toFixed(1) : '0.0';
    const reportText = `【メロディ・ブリッジ 対戦統計レポート】
・総対戦数: ${totalRounds} 戦
・アガリ率: ${winRate}% (${totalWins}回) / 流局率: ${drawRate}% (${stats.draws}回)
・平均決着手番数: ${avgTurnsPerRound} 手番 (全体)
・割り込み発生: ポン ${stats.interruptsCount.pon}回 / チー ${stats.interruptsCount.chii}回

【プレイヤー別成績】
${playerNames.map((name, i) => {
  const wins = stats.wins[i];
  const pWinRate = totalRounds > 0 ? ((wins / totalRounds) * 100).toFixed(1) : '0.0';
  const scoresArray = stats.totalScores || stats.totalPenalties || [0, 0, 0, 0];
  const avgMatchScore = totalRounds > 0 ? ((scoresArray[i] / totalRounds) * 4).toFixed(1) : '0.0';
  const act = stats.playerActions?.[i] || { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 };
  const avgTurnsPerP = totalRounds > 0 ? (act.turns / totalRounds).toFixed(1) : '0.0';
  return `・${name}: ${wins}勝 (${pWinRate}%) / 平均手番: ${avgTurnsPerP}回 / 1試合平均: ${avgMatchScore} pt (4局計) [役出:${act.melds}, 付札:${act.adds}, 入替:${act.swaps || 0}, ポン:${act.pon}, チー:${act.chii}]`;
}).join('\n')}

【役・和音の内訳】
・和音(コード): ${stats.meldsCount.chord}個 (${chordRatio}%) / 音階(スケール): ${stats.meldsCount.scale}個 (${scaleRatio}%)
・出現コード上位: ${sortedChordTypes.map(([chord, cnt]) => `${chord}(${cnt}回)`).join(', ')}

--- RAW JSON DATA ---
${JSON.stringify(stats, null, 2)}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const sortedChordTypes = Object.entries(stats.meldsCount.chordTypes || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const totalMelds = stats.meldsCount.total;
  const chordRatio = totalMelds > 0 ? ((stats.meldsCount.chord / totalMelds) * 100).toFixed(0) : '0';
  const scaleRatio = totalMelds > 0 ? ((stats.meldsCount.scale / totalMelds) * 100).toFixed(0) : '0';

  const deckMax = 28;
  const deckRemaining = gameState.deck.length;
  const deckUsed = deckMax - deckRemaining;
  const deckProgressPct = Math.min(100, Math.max(0, (deckRemaining / deckMax) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none z-[80] flex items-center justify-center p-3">
      {/* モーダル本体（GPUアクセラレーション＆遅延なしドラッグ） */}
      <div 
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`pointer-events-auto bg-[#180f09]/95 backdrop-blur-md rounded-2xl shadow-[0_14px_50px_rgba(0,0,0,0.92)] border-2 border-amber-500/70 will-change-transform flex flex-col ${
          isMinimized 
            ? 'w-80 p-3' 
            : 'max-w-lg w-full p-4'
        }`}
      >
        {/* ドラッグ可能なヘッダーバー */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex justify-between items-center pb-2.5 mb-3 border-b border-[#382315] cursor-grab active:cursor-grabbing select-none shrink-0 touch-none"
          title="ここをドラッグして好きな位置に移動できます"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-5 h-5 text-amber-400/80" />
            <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>対戦統計・シミュレーション ({totalRounds}戦)</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(prev => !prev)}
              className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-[#281a10] transition"
              title={isMinimized ? "大きく表示" : "コンパクト表示"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-[#281a10] transition"
              title="統計を閉じる"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 最小化（コンパクト）時の表示 */}
        {isMinimized ? (
          <div className="text-xs text-amber-200/90 flex items-center justify-between px-1 select-none font-bold">
            <span>局: <strong className="text-amber-300">R{gameState.round} ({gameState.actionCount}手番)</strong></span>
            <span>勝率: <strong className="text-amber-300">{winRate}%</strong></span>
            <span>平均: <strong className="text-amber-300">{avgTurns}手</strong></span>
          </div>
        ) : (
          <>
            {/* タブ切り替えバー（文字を大きく押しやすく） */}
            <div className="grid grid-cols-6 gap-1 p-1 bg-[#0e0805] rounded-xl border border-amber-900/60 mb-3 shrink-0 select-none text-[11px]">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-1.5 rounded-lg font-black transition-all flex items-center justify-center gap-0.5 ${
                  activeTab === 'current'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>現在局</span>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1.5 rounded-lg font-black transition-all text-center ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                概要
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`py-1.5 rounded-lg font-black transition-all text-center ${
                  activeTab === 'players'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                成績
              </button>
              <button
                onClick={() => setActiveTab('transitions')}
                className={`py-1.5 rounded-lg font-black transition-all text-center ${
                  activeTab === 'transitions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                順位推移
              </button>
              <button
                onClick={() => setActiveTab('melds')}
                className={`py-1.5 rounded-lg font-black transition-all text-center ${
                  activeTab === 'melds'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                役分析
              </button>
              <button
                onClick={() => setActiveTab('sim')}
                className={`py-1.5 rounded-lg font-black transition-all text-center flex items-center justify-center gap-0.5 ${
                  activeTab === 'sim'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>テスト</span>
              </button>
            </div>

            {/* コンテンツ領域（スクロール不要・見やすい表形式） */}
            <div className="select-none">
              
              {/* 0. 現在試合・推移（Live Match）タブ */}
              {activeTab === 'current' && (
                <div className="space-y-3">
                  {/* サマリーバー */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">現在の進行</span>
                      <span className="text-base font-black text-amber-100">第 {gameState.round} / 4 局</span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">累計手番数</span>
                      <span className="text-base font-black text-amber-300">{gameState.actionCount} 手番</span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">山札残り</span>
                      <span className="text-base font-black text-amber-100">{deckRemaining} / 28 枚</span>
                    </div>
                  </div>

                  {/* 🏆 1試合（全4ラウンド）順位・スコア推移テーブル */}
                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-500/50 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                        📊 1試合 順位・スコア推移（全4ラウンド）
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-bold">獲得点 (累計) [順位]</span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-amber-400/70 border-b border-amber-900/60 pb-1">
                          <th className="pb-1.5 font-bold">対戦者</th>
                          <th className="pb-1.5 font-bold text-center">R1</th>
                          <th className="pb-1.5 font-bold text-center">R2</th>
                          <th className="pb-1.5 font-bold text-center">R3</th>
                          <th className="pb-1.5 font-bold text-center">R4</th>
                          <th className="pb-1.5 font-bold text-right">現在の総合順位</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-950/60">
                        {(() => {
                          const currentScores = gameState.scores || [0, 0, 0, 0];
                          // 現在の総合順位算出
                          const overallRanked = [0, 1, 2, 3].sort((a, b) => (currentScores[b] || 0) - (currentScores[a] || 0));

                          return gameState.players.map((p, idx) => {
                            const isTurn = gameState.turn === idx;
                            const myScore = currentScores[idx] || 0;
                            const overallRank = overallRanked.indexOf(idx) + 1;
                            const history = gameState.roundHistory || [];

                            return (
                              <tr key={p.id} className={isTurn ? 'bg-amber-950/40' : ''}>
                                <td className="py-2 font-black text-amber-100 flex items-center gap-1">
                                  <span className={`text-[9px] font-black px-1 py-0.2 rounded bg-gradient-to-b ${playerColors[idx]}`}>
                                    P{idx}
                                  </span>
                                  <span className="truncate max-w-[65px] text-[11px]">{p.name}</span>
                                </td>

                                {/* R1 ~ R4 各ラウンド終了時のスコア・順位推移 */}
                                {[1, 2, 3, 4].map(rNum => {
                                  const rRec = history.find(h => h.round === rNum);
                                  if (!rRec) {
                                    return (
                                      <td key={rNum} className="py-2 text-center text-[10px] text-amber-500/30 font-bold">
                                        {gameState.round === rNum ? '進行中' : '-'}
                                      </td>
                                    );
                                  }
                                  const pts = rRec.roundScores[idx] || 0;
                                  const accum = rRec.accumulatedScores[idx] || 0;
                                  const rRank = rRec.ranks.indexOf(idx) + 1;

                                  return (
                                    <td key={rNum} className="py-2 text-center text-[10px] leading-tight">
                                      <div className="flex flex-col items-center justify-center">
                                        <span className={`font-black text-[10.5px] ${rRank === 1 ? 'text-amber-300' : 'text-emerald-400'}`}>
                                          +{pts} pt
                                        </span>
                                        <div className="flex items-center gap-1 text-[9px] text-amber-200/70">
                                          <span>({accum})</span>
                                          <span className={`font-bold px-1 rounded text-[8.5px] ${
                                            rRank === 1 ? 'bg-amber-400 text-slate-950' :
                                            rRank === 2 ? 'bg-slate-700 text-slate-200' :
                                            rRank === 3 ? 'bg-amber-900 text-amber-200' :
                                            'bg-slate-900 text-slate-400'
                                          }`}>
                                            {rRank}位
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}

                                {/* 現在の総合順位 / 累計スコア */}
                                <td className="py-2 text-right">
                                  <div className="flex flex-col items-end justify-center">
                                    <span className="font-black text-amber-100 text-xs">
                                      {myScore} pt
                                    </span>
                                    <span className={`text-[9.5px] font-black px-1.5 py-0.2 rounded shadow-xs ${
                                      overallRank === 1 ? 'bg-amber-400 text-slate-950 border border-amber-200' :
                                      overallRank === 2 ? 'bg-slate-300 text-slate-950' :
                                      overallRank === 3 ? 'bg-amber-700 text-white' :
                                      'bg-slate-800 text-slate-400'
                                    }`}>
                                      総合 {overallRank}位
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* ⚡ 現在局のリアルタイム状況テーブル */}
                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60">
                    <div className="text-[11px] font-bold text-amber-300/80 mb-1.5">
                      ⚡ 第 {gameState.round} 局 リアルタイム状況
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-amber-300/70 border-b border-amber-900/60 pb-1">
                          <th className="pb-1 font-bold">プレイヤー</th>
                          <th className="pb-1 font-bold text-center">手札</th>
                          <th className="pb-1 font-bold text-center">役出</th>
                          <th className="pb-1 font-bold text-center">付札</th>
                          <th className="pb-1 font-bold text-center">ポン</th>
                          <th className="pb-1 font-bold text-center">チー</th>
                          <th className="pb-1 font-bold text-right">状態</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-950/60">
                        {gameState.players.map((p, idx) => {
                          const isTurn = gameState.turn === idx;
                          const isTenpai = p.hand.length === 1;

                          return (
                            <tr key={p.id} className={isTurn ? 'bg-amber-950/30' : ''}>
                              <td className="py-1 font-bold text-amber-100 truncate max-w-[80px]">
                                {p.name}
                              </td>
                              <td className="py-1 text-center font-black text-amber-300">
                                {p.hand.length}枚
                              </td>
                              <td className="py-1 text-center font-bold text-amber-200">
                                {p.actions?.melds || 0}
                              </td>
                              <td className="py-1 text-center font-bold text-teal-300">
                                {p.actions?.adds || 0}
                              </td>
                              <td className="py-1 text-center font-bold text-orange-300">
                                {p.actions?.pon || 0}
                              </td>
                              <td className="py-1 text-center font-bold text-cyan-300">
                                {p.actions?.chii || 0}
                              </td>
                              <td className="py-1 text-right font-bold">
                                {isTenpai ? (
                                  <span className="text-[9px] text-rose-400 font-black animate-pulse px-1 py-0.5 bg-rose-950/60 rounded border border-rose-800">
                                    残り1枚
                                  </span>
                                ) : isTurn ? (
                                  <span className="text-[9px] text-slate-950 font-black px-1 py-0.5 bg-amber-400 rounded">
                                    手番中
                                  </span>
                                ) : p.hasMelded ? (
                                  <span className="text-[9px] text-emerald-400 font-medium">役出済</span>
                                ) : (
                                  <span className="text-[9px] text-amber-300/40">未公開</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 場のセット一覧 */}
                  <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300/80">場のセット ({gameState.field.length}組):</span>
                    <div className="flex flex-wrap gap-1 max-w-[70%] justify-end">
                      {gameState.field.length === 0 ? (
                        <span className="text-amber-300/40">なし</span>
                      ) : (
                        gameState.field.map(m => (
                          <span 
                            key={m.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              m.type === 'chord' 
                                ? 'bg-amber-950/80 text-amber-200 border-amber-600/60' 
                                : 'bg-teal-950/80 text-teal-200 border-teal-600/60'
                            }`}
                          >
                            {m.type === 'chord' ? getChordSymbol(m.cards) : 'スケール'}({m.cards.length})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 1. 概要タブ */}
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[10px] text-amber-300/70 font-bold block">総対戦数</span>
                      <span className="text-base font-black text-amber-100">{totalRounds} <span className="text-[10px] font-normal">戦</span></span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[10px] text-amber-300/70 font-bold block">アガリ率</span>
                      <span className="text-base font-black text-amber-400">{winRate}%</span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[10px] text-amber-300/70 font-bold block">1試合平均 (4局)</span>
                      <span className="text-base font-black text-emerald-400">{p0AvgMatchScoreStr} <span className="text-[10px] font-normal">pt</span></span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[10px] text-amber-300/70 font-bold block">平均決着手番</span>
                      <span className="text-base font-black text-amber-100">{avgTurns} <span className="text-[10px] font-normal">手</span></span>
                    </div>
                  </div>

                  <div className="bg-[#24150c] p-3 rounded-xl border border-amber-900/60 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-amber-200">アガリ vs 流局 比率</span>
                      <span className="text-amber-300">アガリ {totalWins}回 ({winRate}%) / 流局 {stats.draws}回 ({drawRate}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-amber-900/40">
                      <div style={{ width: `${winRate}%` }} className="h-full bg-gradient-to-r from-amber-400 to-amber-500" />
                      <div style={{ width: `${drawRate}%` }} className="h-full bg-slate-600" />
                    </div>
                  </div>

                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#180f09] p-2 rounded-lg border border-amber-900/40 flex justify-between items-center">
                      <span className="text-amber-200 font-bold">ポン発生合計:</span>
                      <span className="font-black text-amber-400 text-sm">{stats.interruptsCount.pon} 回</span>
                    </div>
                    <div className="bg-[#180f09] p-2 rounded-lg border border-amber-900/40 flex justify-between items-center">
                      <span className="text-teal-200 font-bold">チー発生合計:</span>
                      <span className="font-black text-teal-400 text-sm">{stats.interruptsCount.chii} 回</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. 成績（プレイヤー）タブ */}
              {activeTab === 'players' && (
                <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[11px] text-amber-300/70 border-b border-amber-900/60 pb-1">
                        <th className="pb-1.5 font-bold">プレイヤー</th>
                        <th className="pb-1.5 font-bold text-center">勝利(勝率)</th>
                        <th className="pb-1.5 font-bold text-center">平均手番</th>
                        <th className="pb-1.5 font-bold text-center text-emerald-400">1試合平均 (4局)</th>
                        <th className="pb-1.5 font-bold text-center">役出</th>
                        <th className="pb-1.5 font-bold text-center">付札</th>
                        <th className="pb-1.5 font-bold text-center">ポン</th>
                        <th className="pb-1.5 font-bold text-center">チー</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-950/60">
                      {playerNames.map((name, idx) => {
                        const wins = stats.wins[idx];
                        const pWinRate = totalRounds > 0 ? ((wins / totalRounds) * 100).toFixed(1) : '0.0';
                        const scoresArr = stats.totalScores || stats.totalPenalties || [0, 0, 0, 0];
                        const rawAvg = totalRounds > 0 ? (scoresArr[idx] / totalRounds) * 4 : 0;
                        const avgMatchScoreStr = rawAvg > 0 ? `+${rawAvg.toFixed(1)}` : rawAvg.toFixed(1);
                        const pActions = stats.playerActions?.[idx] || { melds: 0, adds: 0, pon: 0, chii: 0, turns: 0 };
                        const avgTurnsPerP = totalRounds > 0 ? (pActions.turns / totalRounds).toFixed(1) : '0.0';

                        return (
                          <tr key={idx}>
                            <td className="py-2 font-black text-amber-100 flex items-center gap-1.5">
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded bg-gradient-to-b ${playerColors[idx]}`}>
                                P{idx}
                              </span>
                              <span>{name}</span>
                            </td>
                            <td className="py-2 text-center font-black text-amber-300">
                              {wins}勝 ({pWinRate}%)
                            </td>
                            <td className="py-2 text-center font-bold text-amber-400">
                              {avgTurnsPerP}回 <span className="text-[9px] text-amber-300/60 font-normal">({pActions.turns}回)</span>
                            </td>
                            <td className="py-2 text-center font-black text-emerald-400">
                              {avgMatchScoreStr} pt
                            </td>
                            <td className="py-2 text-center text-amber-100 font-bold">
                              {pActions.melds}
                            </td>
                            <td className="py-2 text-center text-teal-300 font-bold">
                              {pActions.adds}
                            </td>
                            <td className="py-2 text-center text-orange-300 font-bold">
                              {pActions.pon}
                            </td>
                            <td className="py-2 text-center text-cyan-300 font-bold">
                              {pActions.chii}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. 順位推移 (Rank Transitions) タブ */}
              {activeTab === 'transitions' && (
                <div className="space-y-3">
                  {(() => {
                    const trans = stats.rankTransitions || [
                      [0, 0, 0, 0],
                      [0, 0, 0, 0],
                      [0, 0, 0, 0],
                      [0, 0, 0, 0],
                    ];
                    
                    const r1FirstTotal = trans[0].reduce((a, b) => a + b, 0);
                    const r1LastTotal = trans[3].reduce((a, b) => a + b, 0);

                    const r1FirstToWin = trans[0][0]; // R1 1着 -> 最終1位
                    const r1LastToWin = trans[3][0];  // R1 4着 -> 最終1位

                    const winKeepRate = r1FirstTotal > 0 ? ((r1FirstToWin / r1FirstTotal) * 100).toFixed(1) : '0.0';
                    const comebackWinRate = r1LastTotal > 0 ? ((r1LastToWin / r1LastTotal) * 100).toFixed(1) : '0.0';

                    return (
                      <>
                        {/* ハイライトサマリー */}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-gradient-to-b from-[#2a1a0f] to-[#1e1109] p-2.5 rounded-xl border border-amber-500/50 shadow-sm">
                            <span className="text-[10px] text-amber-300 font-bold block mb-0.5">🔥 初手4着からの1位逆転率</span>
                            <span className="text-lg font-black text-emerald-400">{comebackWinRate}%</span>
                            <span className="text-[9px] text-amber-300/60 block leading-tight pt-0.5">
                              ({r1LastToWin} / {r1LastTotal} 試合)
                            </span>
                          </div>
                          <div className="bg-gradient-to-b from-[#2a1a0f] to-[#1e1109] p-2.5 rounded-xl border border-amber-500/50 shadow-sm">
                            <span className="text-[10px] text-amber-300 font-bold block mb-0.5">🛡️ 初手1着からの逃げ切り率</span>
                            <span className="text-lg font-black text-amber-300">{winKeepRate}%</span>
                            <span className="text-[9px] text-amber-300/60 block leading-tight pt-0.5">
                              ({r1FirstToWin} / {r1FirstTotal} 試合)
                            </span>
                          </div>
                        </div>

                        {/* R1順位 ➔ 最終順位の遷移マトリクス表 */}
                        <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60">
                          <div className="text-[11px] font-bold text-amber-300 mb-2 flex items-center justify-between">
                            <span>📊 順位推移マトリクス (R1順位 ➔ 最終順位)</span>
                            <span className="text-[9.5px] text-amber-400/60">全 {stats.totalMatches || 0} 試合</span>
                          </div>

                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="text-[9.5px] text-amber-400/80 border-b border-amber-900/60 pb-1">
                                <th className="pb-1 font-bold">R1スタート</th>
                                <th className="pb-1 font-bold text-center text-amber-300">最終1位(優勝)</th>
                                <th className="pb-1 font-bold text-center">最終2位</th>
                                <th className="pb-1 font-bold text-center">最終3位</th>
                                <th className="pb-1 font-bold text-center">最終4位</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-950/60 font-bold text-[10.5px]">
                              {[0, 1, 2, 3].map(r1Idx => {
                                const rowTotal = trans[r1Idx].reduce((a, b) => a + b, 0);

                                return (
                                  <tr key={r1Idx} className="hover:bg-amber-950/30">
                                    <td className="py-2 text-amber-200 font-bold flex items-center gap-1">
                                      <span className={`text-[8.5px] font-black px-1 rounded ${
                                        r1Idx === 0 ? 'bg-amber-400 text-slate-950' :
                                        r1Idx === 1 ? 'bg-slate-700 text-slate-200' :
                                        r1Idx === 2 ? 'bg-amber-900 text-amber-200' :
                                        'bg-slate-900 text-slate-400'
                                      }`}>
                                        {r1Idx + 1}着
                                      </span>
                                      <span>で開始</span>
                                    </td>

                                    {[0, 1, 2, 3].map(finalIdx => {
                                      const count = trans[r1Idx][finalIdx];
                                      const pct = rowTotal > 0 ? ((count / rowTotal) * 100).toFixed(1) : '0.0';
                                      const isSpecial = (r1Idx === 3 && finalIdx === 0) || (r1Idx === 0 && finalIdx === 0);

                                      return (
                                        <td key={finalIdx} className="py-2 text-center leading-tight">
                                          <span className={isSpecial ? 'text-emerald-400 font-black text-xs' : 'text-amber-100'}>
                                            {pct}%
                                          </span>
                                          <span className="text-[8.5px] text-amber-300/50 block font-normal">
                                            ({count}回)
                                          </span>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* 3. 役分析タブ */}
              {activeTab === 'melds' && (
                <div className="space-y-3">
                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-amber-300">和音(コード): {stats.meldsCount.chord}個 ({chordRatio}%)</span>
                      <span className="text-teal-300">音階(スケール): {stats.meldsCount.scale}個 ({scaleRatio}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-amber-900/40">
                      <div style={{ width: `${chordRatio}%` }} className="h-full bg-amber-500" />
                      <div style={{ width: `${scaleRatio}%` }} className="h-full bg-teal-500" />
                    </div>
                  </div>

                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60 space-y-2">
                    <span className="text-xs text-amber-300/80 font-bold block">出現コードランキング Top 8</span>
                    {sortedChordTypes.length === 0 ? (
                      <p className="text-xs text-amber-300/50 py-2 text-center">まだデータがありません</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {sortedChordTypes.map(([chordName, count], i) => (
                          <div key={chordName} className="bg-[#180f09] p-1.5 rounded-lg border border-amber-900/40">
                            <span className="text-[9px] text-amber-400 font-bold block">#{i + 1}</span>
                            <span className="text-xs font-black text-amber-100 block">{chordName}</span>
                            <span className="text-[10px] text-amber-300/70">{count}回</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. テスト（一括シミュレーション）タブ */}
              {activeTab === 'sim' && (
                <div className="space-y-3">
                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60 text-xs">
                    <span className="font-black text-amber-200 flex items-center gap-1 mb-1">
                      <Zap className="w-4 h-4 text-amber-400" />
                      高速バックグラウンドシミュレーション
                    </span>
                    <p className="text-amber-300/70 text-[11px]">
                      現在のルールで指定した回数分を裏で即座に計算し、全統計データに加算します。
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      disabled={isSimulating}
                      onClick={() => handleBatchSim(10)}
                      className="py-2.5 bg-[#2a170d] hover:bg-[#3a2012] active:scale-95 disabled:opacity-50 text-amber-200 font-black text-xs rounded-xl border border-amber-600/60 transition shadow-xs flex flex-col items-center justify-center gap-0.5"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-400" />
                      <span>+10 戦</span>
                    </button>
                    <button
                      disabled={isSimulating}
                      onClick={() => handleBatchSim(50)}
                      className="py-2.5 bg-[#2a170d] hover:bg-[#3a2012] active:scale-95 disabled:opacity-50 text-amber-200 font-black text-xs rounded-xl border border-amber-600/60 transition shadow-xs flex flex-col items-center justify-center gap-0.5"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-400" />
                      <span>+50 戦</span>
                    </button>
                    <button
                      disabled={isSimulating}
                      onClick={() => handleBatchSim(100)}
                      className="py-2.5 bg-[#2a170d] hover:bg-[#3a2012] active:scale-95 disabled:opacity-50 text-amber-200 font-black text-xs rounded-xl border border-amber-600/60 transition shadow-xs flex flex-col items-center justify-center gap-0.5"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-400" />
                      <span>+100 戦</span>
                    </button>
                    <button
                      disabled={isSimulating}
                      onClick={() => handleBatchSim(500)}
                      className="py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl border border-amber-300 transition shadow-xs flex flex-col items-center justify-center gap-0.5"
                    >
                      <Zap className="w-4 h-4 text-slate-950" />
                      <span>+500 戦</span>
                    </button>
                  </div>

                  {isSimulating && (
                    <div className="text-center py-1.5 text-xs font-bold text-amber-400 animate-pulse">
                      ⚡ 高速シミュレーション計算中...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 固定フッター */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#382315] shrink-0 select-none gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg text-xs font-bold border border-rose-900/60 transition"
                title="統計データをすべてリセットします"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>初期化</span>
              </button>

              <button
                onClick={handleCopyStats}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition border shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-[#24150c] hover:bg-[#341e11] text-amber-200 border-amber-600/60 active:scale-95'
                }`}
                title="AIに共有するための完全な統計テキスト＆JSONデータをクリップボードにコピーします"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>コピー完了！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>統計をコピー</span>
                  </>
                )}
              </button>

              <button 
                onClick={onClose} 
                className="px-5 py-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition"
              >
                閉じる
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
