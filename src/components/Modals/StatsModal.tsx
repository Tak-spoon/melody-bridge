import React, { useState, useRef } from 'react';
import { BarChart3, X, Zap, RotateCcw, PlayCircle, GripHorizontal, Minimize2, Maximize2, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'current' | 'overview' | 'players' | 'melds' | 'sim'>('current');
  const [isMinimized, setIsMinimized] = useState(false);

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

    // requestAnimationFrameでGPU描画に完全同期（もたつきゼロ）
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
            <span>局: <strong className="text-amber-300">R{gameState.round} ({gameState.actionCount}手)</strong></span>
            <span>勝率: <strong className="text-amber-300">{winRate}%</strong></span>
            <span>平均: <strong className="text-amber-300">{avgTurns}手</strong></span>
          </div>
        ) : (
          <>
            {/* タブ切り替えバー（文字を大きく押しやすく） */}
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#0e0805] rounded-xl border border-amber-900/60 mb-3 shrink-0 select-none">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'current'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>現在局</span>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                概要
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'players'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                成績
              </button>
              <button
                onClick={() => setActiveTab('melds')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'melds'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                役分析
              </button>
              <button
                onClick={() => setActiveTab('sim')}
                className={`py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'sim'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300/80 hover:text-amber-100 hover:bg-[#26180f]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>テスト</span>
              </button>
            </div>

            {/* コンテンツ領域（スクロール不要・見やすい表形式） */}
            <div className="select-none">
              
              {/* 0. 現在局（Live）タブ */}
              {activeTab === 'current' && (
                <div className="space-y-3">
                  {/* サマリーバー */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">ラウンド</span>
                      <span className="text-base font-black text-amber-100">Round {gameState.round}/4</span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">経過手数</span>
                      <span className="text-base font-black text-amber-300">{gameState.actionCount} 手目</span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">山札残り</span>
                      <span className="text-base font-black text-amber-100">{deckRemaining} / 28 枚</span>
                    </div>
                  </div>

                  {/* 4人の対比テーブル（一目で全員の状況がわかる） */}
                  <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[11px] text-amber-300/70 border-b border-amber-900/60 pb-1">
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
                              <td className="py-1.5 font-black text-amber-100 flex items-center gap-1.5">
                                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded bg-gradient-to-b ${playerColors[idx]}`}>
                                  P{idx}
                                </span>
                                <span>{p.name}</span>
                              </td>
                              <td className="py-1.5 text-center font-black text-amber-300 text-sm">
                                {p.hand.length}枚
                              </td>
                              <td className="py-1.5 text-center font-bold text-amber-200">
                                {p.actions?.melds || 0}
                              </td>
                              <td className="py-1.5 text-center font-bold text-teal-300">
                                {p.actions?.adds || 0}
                              </td>
                              <td className="py-1.5 text-center font-bold text-orange-300">
                                {p.actions?.pon || 0}
                              </td>
                              <td className="py-1.5 text-center font-bold text-cyan-300">
                                {p.actions?.chii || 0}
                              </td>
                              <td className="py-1.5 text-right font-bold">
                                {isTenpai ? (
                                  <span className="text-[10px] text-rose-400 font-black animate-pulse px-1.5 py-0.5 bg-rose-950/60 rounded border border-rose-800">
                                    残り1枚
                                  </span>
                                ) : isTurn ? (
                                  <span className="text-[10px] text-slate-950 font-black px-1.5 py-0.5 bg-amber-400 rounded">
                                    手番中
                                  </span>
                                ) : p.hasMelded ? (
                                  <span className="text-[10px] text-emerald-400 font-medium">役出済</span>
                                ) : (
                                  <span className="text-[10px] text-amber-300/40">未公開</span>
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
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">総対戦数</span>
                      <span className="text-lg font-black text-amber-100">{totalRounds} <span className="text-xs font-normal">戦</span></span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">アガリ率</span>
                      <span className="text-lg font-black text-amber-400">{winRate}%</span>
                    </div>
                    <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/60">
                      <span className="text-[11px] text-amber-300/70 font-bold block">平均決着手数</span>
                      <span className="text-lg font-black text-amber-100">{avgTurns} <span className="text-xs font-normal">手</span></span>
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

              {/* 2. 成績（プレイヤー）タブ */}
              {activeTab === 'players' && (
                <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[11px] text-amber-300/70 border-b border-amber-900/60 pb-1">
                        <th className="pb-1.5 font-bold">プレイヤー</th>
                        <th className="pb-1.5 font-bold text-center">勝利(勝率)</th>
                        <th className="pb-1.5 font-bold text-center">平均失点</th>
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
                        const avgPenalty = totalRounds > 0 ? (stats.totalPenalties[idx] / totalRounds).toFixed(1) : '0.0';
                        const pActions = stats.playerActions?.[idx] || { melds: 0, adds: 0, pon: 0, chii: 0 };

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
                            <td className="py-2 text-center font-bold text-amber-200">
                              {avgPenalty}点
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
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#382315] shrink-0 select-none">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg text-xs font-bold border border-rose-900/60 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>データ初期化</span>
              </button>

              <button 
                onClick={onClose} 
                className="px-6 py-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition"
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
