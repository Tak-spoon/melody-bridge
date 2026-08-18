import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card as CardType, GameState, MeldType } from './types/game';
import { NOTE_NAMES, NOTE_JP } from './constants/music';
import { getChordSymbol, getChordInterpretation, getScaleInterpretation, tryAddCardToMeld, trySwapCardInMeld, analyzeHandConnections, SwapResult } from './utils/musicTheory';
import { setupRound, sortHand, getCombinations, getValidPonCombs, getValidChiiCombs, checkInterrupts, addLog, finishRound, checkWinCondition } from './utils/gameLogic';
import { playMelody, playCutInSound, playWinSound, playCardTone, playSwapSound, getAudioContext } from './utils/audio';
import { GameStats, loadStats, recordGameRound, recordInterrupt } from './utils/stats';

import { Header } from './components/Header';
import { PlayerStatus } from './components/PlayerStatus';
import { GuideAndDeck } from './components/GuideAndDeck';
import { Field } from './components/Field';
import { IndicatorBar, ActionBadge } from './components/IndicatorBar';
import { ActionBar } from './components/ActionBar';
import { Hand } from './components/Hand';
import { Card as CardComponent } from './components/Card';
import { CutIn } from './components/CutIn';
import { WinEffect } from './components/WinEffect';
import { RuleModal } from './components/Modals/RuleModal';
import { OptionModal, BotSpeed, BotCountOption } from './components/Modals/OptionModal';
import { DiscardModal } from './components/Modals/DiscardModal';
import { LogModal } from './components/Modals/LogModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { StatsModal } from './components/Modals/StatsModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => setupRound());
  const [selectedHand, setSelectedHand] = useState<string[]>([]);
  const [selectedMeld, setSelectedMeld] = useState<string | null>(null);
  
  // モーダル表示状態
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  
  // 統計モーダル表示状態（localStorageで永続化し、ページリロード時も開いた状態を維持）
  const [showStatsModal, setShowStatsModal] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mb_show_stats_modal');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  const openStatsModal = () => {
    setShowStatsModal(true);
    try { localStorage.setItem('mb_show_stats_modal', JSON.stringify(true)); } catch {}
  };

  const closeStatsModal = () => {
    setShowStatsModal(false);
    try { localStorage.setItem('mb_show_stats_modal', JSON.stringify(false)); } catch {}
  };

  // 統計データ管理（localStorage永続化）
  const [stats, setStats] = useState<GameStats>(() => loadStats());

  // Bot自動対戦モード（localStorage永続化）
  const [botMode, setBotMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mb_bot_mode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [botSpeed, setBotSpeed] = useState<BotSpeed>('normal');
  const [botTargetCount, setBotTargetCount] = useState<BotCountOption>('unlimited');
  const [botRemainingCount, setBotRemainingCount] = useState<number | 'unlimited'>('unlimited');

  const toggleBotMode = () => {
    setBotMode(prev => {
      const next = !prev;
      try { localStorage.setItem('mb_bot_mode', JSON.stringify(next)); } catch {}
      if (next) {
        setBotRemainingCount(botTargetCount);
      }
      return next;
    });
  };

  const changeBotTargetCount = (count: BotCountOption) => {
    setBotTargetCount(count);
    if (botMode) {
      setBotRemainingCount(count);
    }
  };

  const cycleBotSpeed = () => {
    setBotSpeed(prev => {
      if (prev === 'normal') return 'fast';
      if (prev === 'fast') return 'ultra';
      return 'normal';
    });
  };

  // サウンド・オプション設定（localStorageで永続化）
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mb_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });
  const [cardToneEnabled, setCardToneEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mb_card_tone_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });

  // 初心者アシスト機能（デフォルトON・localStorageで永続化）
  const [assistEnabled, setAssistEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mb_assist_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('mb_sound_enabled', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleCardTone = () => {
    setCardToneEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('mb_card_tone_enabled', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleAssist = () => {
    setAssistEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('mb_assist_enabled', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // ポン・チー カットイン表示状態（横スライド）
  const [cutInInfo, setCutInInfo] = useState<{ type: 'pon' | 'chii'; playerName: string } | null>(null);

  // アガリ専用演出表示状態（中央ズームインパクト）
  const [winEffectName, setWinEffectName] = useState<string | null>(null);

  // ラウンド終了結果モーダル表示状態
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // 山札フライングドローアニメーション表示状態
  const [flyingDrawCard, setFlyingDrawCard] = useState<CardType | null>(null);

  // 付け札されたカードID（スライドイン差し込み演出用）
  const [lastAddedCardId, setLastAddedCardId] = useState<string | null>(null);

  // スワップ（入れ替え）演出状態
  const [lastSwappedMeldId, setLastSwappedMeldId] = useState<string | null>(null);
  const [lastSwappedInCardId, setLastSwappedInCardId] = useState<string | null>(null);
  const [swappedInCardId, setSwappedInCardId] = useState<string | null>(null);
  const [ejectedCardInfo, setEjectedCardInfo] = useState<{ card: CardType; meldId: string } | null>(null);

  // 初回ユーザー操作時にWeb Audio APIを有効化
  const initAudio = () => {
    getAudioContext();
  };

  // ラウンド終了処理の多重実行防止フラグ
  const isRoundEndingRef = useRef(false);
  const hasRecordedStatsRef = useRef(false);

  // ラウンド終了（アガリ・流局）時の演出・効果音・統計記録・モーダル表示の一元管理
  useEffect(() => {
    if (!gameState.roundOver) return;
    if (isRoundEndingRef.current) return;
    isRoundEndingRef.current = true;

    initAudio();

    // 勝者がいる場合はアガリ演出（中央ズーム）と効果音を先に再生！
    if (gameState.winner !== null) {
      playWinSound();
      const winnerName = gameState.players[gameState.winner]?.name || '誰か';
      setWinEffectName(winnerName);

      const waitDuration = botSpeed === 'ultra' ? 150 : 1200;
      setTimeout(() => {
        setWinEffectName(null);
        setShowGameOverModal(true); // 演出完了後にラウンド結果モーダルを開く！
      }, waitDuration);
    } else {
      setWinEffectName(null);
      setShowGameOverModal(true); // 流局時は即座にモーダルを開く
    }

    // 1ラウンドにつき確実に1度だけ統計記録
    if (!hasRecordedStatsRef.current) {
      hasRecordedStatsRef.current = true;
      setStats(currStats => recordGameRound(gameState, currStats));
    }

    // Bot指定回数のデクリメント
    setBotRemainingCount(curr => {
      if (typeof curr === 'number') {
        const next = curr - 1;
        if (next <= 0) {
          setBotMode(false);
          try { localStorage.setItem('mb_bot_mode', JSON.stringify(false)); } catch {}
          return 0;
        }
        return next;
      }
      return curr;
    });
  }, [gameState.roundOver, gameState.winner, gameState.players, botSpeed]);

  const finishRoundSafely = useCallback((winnerId: number | null, reasonMsg: string) => {
    if (isRoundEndingRef.current) return;
    
    setGameState(prev => {
      if (prev.roundOver) return prev;
      const s = { ...prev, logs: [...prev.logs], scores: [...prev.scores] };
      s.winner = winnerId;
      finishRound(s, reasonMsg);
      return s;
    });
  }, []);

  const triggerWinSequence = finishRoundSafely;

  const isPlayerTurn = gameState.turn === 0;
  const isMainPhase = gameState.phase === 'main';
  const isDrawPhase = gameState.phase === 'draw';
  const isInterruptTurn = gameState.phase === 'interrupt';
  
  const isMyInterrupt = isInterruptTurn && 
    gameState.interruptInfo !== null && 
    gameState.interruptInfo.candidates.length > 0 && 
    gameState.interruptInfo.candidates[0].playerId === 0;

  // -------------------------------------------------------------
  // アクション処理（ドロー、役出し、付け札、捨てる、割り込み）
  // -------------------------------------------------------------

  const doDraw = useCallback(() => {
    initAudio();
    setGameState(prev => {
      if (prev.phase !== 'draw' || prev.winner !== null || prev.roundOver) return prev;
      const s: GameState = { 
        ...prev, 
        players: [...prev.players], 
        logs: [...prev.logs], 
        scores: [...prev.scores] 
      };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: sortHand([...currentP.hand]) };
      
      if (s.deck.length === 0) {
        s.winner = null;
        finishRound(s, '山札がなくなりました（流局）');
        s.actionCount += 1;
        return s;
      }
      
      s.deck = [...s.deck];
      const drawnCard = s.deck.pop()!;
      
      // プレイヤー（あなた）のドロー時にフライングドローアニメーションを起動！
      if (s.turn === 0) {
        setFlyingDrawCard(drawnCard);
        setTimeout(() => {
          setFlyingDrawCard(null);
        }, 300);
      }

      p.justDrawnCardId = drawnCard.id;
      p.hand = [...sortHand(p.hand), drawnCard];
      p.actions = { ...p.actions, turns: (p.actions?.turns || 0) + 1 };
      
      s.players[s.turn] = p;
      s.phase = 'main';
      s.hasSwappedThisTurn = false; // 手番開始時にスワップ済みフラグをリセット
      s.message = `${p.name} のターン`;
      addLog(s, p.name, '山札からドロー');
      return s;
    });
  }, []);

  const doMeld = useCallback((cardIds: string[], type: MeldType, interpretedSeq: CardType[]) => {
    initAudio();
    playMelody(interpretedSeq.map(c => c.interpretedAbsVal ?? c.absVal));
    
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;
      const s: GameState = { 
        ...prev, 
        players: [...prev.players], 
        field: [...prev.field], 
        logs: [...prev.logs], 
        scores: [...prev.scores] 
      };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      p.hand = sortHand(p.hand.filter(c => !cardIds.includes(c.id)));
      p.hasMelded = true;
      p.justDrawnCardId = null;
      p.actions = { ...p.actions, melds: (p.actions?.melds || 0) + 1 };
      s.players[s.turn] = p;
      
      const symbol = type === 'chord' ? getChordSymbol(interpretedSeq) : 'スケール';
      const cardsStr = interpretedSeq.map(c => {
        const val = c.interpretedAbsVal ?? c.absVal;
        const idx = val % 7;
        const o = Math.floor(val / 7) + 2;
        return `${NOTE_NAMES[idx]}${o}(${NOTE_JP[idx]})`;
      }).join(', ');

      s.field.push({ 
        id: `meld_${Date.now()}_${Math.random()}`, 
        ownerId: s.turn, 
        type, 
        cards: interpretedSeq 
      });
      s.message = `${p.name} が ${type === 'scale' ? 'スケール' : symbol} を公開`;
      addLog(s, p.name, `[${cardsStr}] で ${type === 'scale' ? 'スケール' : symbol} を公開`);

      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        s.winner = winner.id;
        finishRound(s, `${winner.name} がアガリました！`);
      }
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, []);

  const doAdd = useCallback((cardId: string, meldId: string, newSeq: CardType[]) => {
    initAudio();
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;

      const s: GameState = { 
        ...prev, 
        players: [...prev.players], 
        field: [...prev.field], 
        logs: [...prev.logs], 
        scores: [...prev.scores] 
      };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      const meldIndex = s.field.findIndex(m => m.id === meldId);
      if (meldIndex === -1) return prev;
      const meld = { ...s.field[meldIndex] };
      
      const cardObj = p.hand.find(c => c.id === cardId);
      if (!cardObj) return prev;
      const noteIndex = cardObj.absVal % 7;
      const oct = Math.floor(cardObj.absVal / 7) + 2;
      const cardStr = `${NOTE_NAMES[noteIndex]}${oct}(${NOTE_JP[noteIndex]})`;
      const targetName = meld.type === 'chord' ? getChordSymbol(meld.cards) : 'スケール';
      const ownerName = s.players[meld.ownerId]?.name || '誰か';

      p.hand = sortHand(p.hand.filter(c => c.id !== cardId));
      p.justDrawnCardId = null;
      p.actions = { ...p.actions, adds: (p.actions?.adds || 0) + 1 };
      s.players[s.turn] = p;
      meld.cards = newSeq; 
      s.field[meldIndex] = meld;

      // 差し込みアニメーションのトリガー
      setLastAddedCardId(cardId);
      setTimeout(() => {
        setLastAddedCardId(null);
      }, 350);

      const newTargetName = meld.type === 'chord' ? getChordSymbol(newSeq) : 'スケール';

      s.message = `${p.name} が ${cardStr}を付け札`;
      addLog(s, p.name, `${ownerName}の [${targetName}] に ${cardStr}を付け札 → [${newTargetName}]`);

      playMelody(meld.cards.map(c => c.interpretedAbsVal ?? c.absVal));
      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        s.winner = winner.id;
        finishRound(s, `${winner.name} がアガリました！`);
      }
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, []);

  const doSwap = useCallback((handCardId: string, meldId: string, swapResult: SwapResult) => {
    initAudio();
    playSwapSound(); // スワップ専用のキラキラ効果音（ピロリン♪）
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;
      if (prev.hasSwappedThisTurn) return prev; // 1手番1回制限

      const s: GameState = { 
        ...prev, 
        players: [...prev.players], 
        field: [...prev.field], 
        logs: [...prev.logs], 
        scores: [...prev.scores],
        hasSwappedThisTurn: true, // スワップ完了フラグ
      };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      const meldIndex = s.field.findIndex(m => m.id === meldId);
      if (meldIndex === -1) return prev;
      const meld = { ...s.field[meldIndex] };
      
      const outCard = p.hand.find(c => c.id === handCardId);
      if (!outCard) return prev;

      // 手札から outCard を除き、replacedCard を追加してソート
      p.hand = sortHand([...p.hand.filter(c => c.id !== handCardId), swapResult.replacedCard]);
      p.justDrawnCardId = null;
      p.actions = { ...p.actions, swaps: (p.actions?.swaps || 0) + 1 };
      s.players[s.turn] = p;

      // 場のセットを更新
      const oldSymbol = getChordSymbol(meld.cards);
      const ownerName = s.players[meld.ownerId]?.name || '誰か';
      meld.cards = swapResult.newSequence; 
      s.field[meldIndex] = meld;

      // スワップ専用ハイライト演出（押し出し＆回収）
      setLastSwappedMeldId(meldId);
      setLastSwappedInCardId(swapResult.replacedCard.id);
      setSwappedInCardId(handCardId);
      setEjectedCardInfo({ card: swapResult.replacedCard, meldId });

      // 1. 枠内演出（カードの光・押し出し・バッジ）はカードが抜けるタイミング（550ms）で完全同期解除
      setTimeout(() => {
        setSwappedInCardId(null);
        setEjectedCardInfo(null);
      }, 550);

      // 2. 外枠のオレンジ点灯は余韻を残して800msで最後に消灯
      setTimeout(() => {
        setLastSwappedMeldId(null);
        setLastSwappedInCardId(null);
      }, 800);

      const outNote = `${NOTE_NAMES[outCard.absVal % 7]}${Math.floor(outCard.absVal / 7) + 2}`;
      const inNote = `${NOTE_NAMES[swapResult.replacedCard.absVal % 7]}${Math.floor(swapResult.replacedCard.absVal / 7) + 2}`;
      
      s.message = `🔄 ${p.name} が ${outNote} を出して 場の ${inNote} を回収！`;
      addLog(s, p.name, `🔄 ${ownerName}の [${oldSymbol}] の ${inNote} を手札の ${outNote} と入れ替え → [${swapResult.newSymbol}] にアレンジ！ (手札に ${inNote} を回収)`);

      // 少し遅延させて新しい和音のメロディを再生
      setTimeout(() => {
        playMelody(meld.cards.map(c => c.interpretedAbsVal ?? c.absVal));
      }, 250);

      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, []);

  const doDiscard = useCallback((cardId: string) => {
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;
      const s: GameState = { 
        ...prev, 
        players: [...prev.players], 
        discardPile: [...prev.discardPile], 
        logs: [...prev.logs], 
        scores: [...prev.scores] 
      };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      
      const cardIndex = p.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;
      
      const [discardedCard] = p.hand.splice(cardIndex, 1);
      p.hand = sortHand(p.hand);
      p.justDrawnCardId = null; 
      s.discardPile.push({ card: discardedCard, discarderId: s.turn, isHidden: false });
      s.players[s.turn] = p;

      const noteIndex = discardedCard.absVal % 7;
      const oct = Math.floor(discardedCard.absVal / 7) + 2;
      const noteText = `${NOTE_NAMES[noteIndex]}${oct}(${NOTE_JP[noteIndex]})`;
      addLog(s, p.name, `${noteText}を捨てた`);
      
      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        s.winner = winner.id;
        finishRound(s, `${winner.name} がアガリました！`);
        s.actionCount += 1;
        return s;
      }

      const candidates = checkInterrupts(s, s.turn, discardedCard);
      if (candidates.length > 0) {
        s.phase = 'interrupt';
        s.interruptInfo = { discarderId: s.turn, discardedCard, candidates };
        s.message = `割り込み確認中`;
      } else {
        // 山札が0枚の時の捨て札に対して誰もポン・チーできない場合は即座に流局
        if (s.deck.length === 0) {
          s.winner = null;
          finishRound(s, '山札切れにより流局');
          s.actionCount += 1;
          return s;
        }
        s.turn = (s.turn + 1) % 4;
        s.phase = 'draw';
        s.message = `${s.players[s.turn].name} のターン`;
      }
      s.actionCount += 1;
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, []);

  const doPassInterrupt = useCallback(() => {
    setGameState(prev => {
      if (prev.phase !== 'interrupt') return prev;
      const s: GameState = { ...prev, logs: [...prev.logs] };
      if (!s.interruptInfo || !s.interruptInfo.candidates) return s;
      s.interruptInfo = { ...s.interruptInfo, candidates: [...s.interruptInfo.candidates] };
      s.interruptInfo.candidates.shift();

      if (s.interruptInfo.candidates.length > 0) {
        return s;
      } else {
        // 全員パスで割り込み不成立時、山札が0枚なら即座に流局
        if (s.deck.length === 0) {
          s.winner = null;
          finishRound(s, '山札切れにより流局');
          s.interruptInfo = null;
          return s;
        }
        s.phase = 'draw';
        s.turn = ((s.interruptInfo.discarderId as number) + 1) % 4;
        s.message = `${s.players[s.turn].name} のターン`;
        s.interruptInfo = null;
        return s;
      }
    });
    setSelectedHand([]);
  }, []);

  const doInterruptAction = useCallback((playerId: number, type: 'pon' | 'chii', handCardIds: string[]) => {
    initAudio();
    playCutInSound(type);

    setGameState(prev => {
      if (prev.phase !== 'interrupt') return prev;
      const s: GameState = { 
        ...prev, 
        players: [...prev.players], 
        field: [...prev.field], 
        discardPile: [...prev.discardPile], 
        logs: [...prev.logs], 
        scores: [...prev.scores] 
      };
      const actorP = s.players[playerId];
      const p = { ...actorP, hand: [...actorP.hand] };
      
      // カットイン表示トリガー
      setCutInInfo({ type, playerName: p.name });
      setTimeout(() => {
        setCutInInfo(null);
      }, 900);

      const discarderId = s.interruptInfo ? s.interruptInfo.discarderId : null;
      const discarderName = discarderId !== null ? s.players[discarderId]?.name || '誰か' : '誰か';

      const lastDiscardObj = s.discardPile.pop();
      const discardedCard = lastDiscardObj ? lastDiscardObj.card : null;
      if (!discardedCard) return prev;

      const selectedObjs = p.hand.filter(c => handCardIds.includes(c.id));
      p.hand = sortHand(p.hand.filter(c => !handCardIds.includes(c.id)));
      p.justDrawnCardId = null;
      
      const testCards = [discardedCard, ...selectedObjs];
      const seq = type === 'pon' ? getChordInterpretation(testCards) : getScaleInterpretation(testCards);
      if (!seq) return prev;
      
      setTimeout(() => {
        playMelody(seq.map(c => c.interpretedAbsVal ?? c.absVal));
      }, 200);
      p.hasMelded = true;
      p.actions = {
        ...p.actions,
        pon: type === 'pon' ? (p.actions?.pon || 0) + 1 : (p.actions?.pon || 0),
        chii: type === 'chii' ? (p.actions?.chii || 0) + 1 : (p.actions?.chii || 0),
        turns: (p.actions?.turns || 0) + 1,
      };
      s.players[playerId] = p;
      
      const symbol = type === 'pon' ? getChordSymbol(seq) : 'スケール';
      const actionName = type === 'pon' ? 'ポン' : 'チー';
      const cardsStr = seq.map(c => {
        const val = c.interpretedAbsVal ?? c.absVal;
        const idx = val % 7;
        const o = Math.floor(val / 7) + 2;
        return `${NOTE_NAMES[idx]}${o}(${NOTE_JP[idx]})`;
      }).join(', ');

      s.field.push({ 
        id: `meld_${Date.now()}_${Math.random()}`, 
        ownerId: playerId, 
        type: type === 'pon' ? 'chord' : 'scale', 
        cards: seq 
      });
      
      s.turn = playerId;
      s.phase = 'main';
      s.hasSwappedThisTurn = false; // 割り込み手番開始時にスワップ済みフラグをリセット
      s.interruptInfo = null;
      s.message = `${p.name} が ${discarderName} の捨て札で ${actionName}`;
      addLog(s, p.name, `${discarderName}の捨て札で ${actionName}！ [${cardsStr}] で ${symbol} を公開`);
      
      // 統計データの割り込みカウントを更新
      setStats(curr => recordInterrupt(type, curr));
      
      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        s.winner = winner.id;
        finishRound(s, `${winner.name} がアガリました！`);
        s.actionCount += 1;
      }
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, []);

  // -------------------------------------------------------------
  // プレイヤーの操作ヘルパー
  // -------------------------------------------------------------

  const handlePlayerMeld = (type: 'scale' | 'chord') => {
    const p = gameState.players[0];
    const selectedObjs = p.hand.filter(c => selectedHand.includes(c.id));
    const seq = type === 'scale' ? getScaleInterpretation(selectedObjs) : getChordInterpretation(selectedObjs);
    if (seq) doMeld(selectedHand, type, seq);
  };

  const handlePlayerAdd = () => {
    const p = gameState.players[0];
    if (selectedHand.length !== 1 || !selectedMeld) return;

    const meld = gameState.field.find(m => m.id === selectedMeld);
    if (!meld) return;

    if (meld.type === 'chord' && meld.cards.length >= 4) return;
    const cardObj = p.hand.find(c => c.id === selectedHand[0]);
    if (!cardObj) return;
    const newSeq = tryAddCardToMeld(cardObj, meld);
    
    if (newSeq) {
      doAdd(cardObj.id, meld.id, newSeq);
    }
  };

  const handlePlayerSwap = () => {
    if (!currentSwapResult || selectedHand.length !== 1 || !selectedMeld || gameState.hasSwappedThisTurn) return;
    doSwap(selectedHand[0], selectedMeld, currentSwapResult);
  };

  const handlePlayerInterrupt = (type: 'pon' | 'chii') => {
    if (selectedHand.length !== 2 || !gameState.interruptInfo) return;
    const discardedCard = gameState.interruptInfo.discardedCard;
    const p = gameState.players[0];
    const selectedObjs = p.hand.filter(c => selectedHand.includes(c.id));
    const testCards = [discardedCard, ...selectedObjs];
    const seq = type === 'pon' ? getChordInterpretation(testCards) : getScaleInterpretation(testCards);
    if (seq) doInterruptAction(0, type, selectedHand);
  };

  // 手札・役の選択判定
  const playerHandCards = gameState.players[0].hand;
  const selectedObjs = playerHandCards.filter(c => selectedHand.includes(c.id));
  const isValidScaleSelection = selectedObjs.length >= 3 && getScaleInterpretation(selectedObjs) !== null;
  const isValidChordSelection = selectedObjs.length === 3 && getChordInterpretation(selectedObjs) !== null;

  let isValidAddSelection = false;
  if (selectedHand.length === 1 && selectedMeld !== null) {
    const cardObj = playerHandCards.find(c => c.id === selectedHand[0]);
    const meldObj = gameState.field.find(m => m.id === selectedMeld);
    if (cardObj && meldObj) {
      const addedSeq = tryAddCardToMeld(cardObj, meldObj);
      if (addedSeq !== null) {
        isValidAddSelection = true;
      }
    }
  }

  // 置き換え（スワップ・リハーモナイズ）判定（1手番1回まで、役出し前でも使用可能）
  let currentSwapResult: SwapResult | null = null;
  let isValidSwapSelection = false;
  if (!gameState.hasSwappedThisTurn && selectedHand.length === 1 && selectedMeld !== null) {
    const cardObj = playerHandCards.find(c => c.id === selectedHand[0]);
    const meldObj = gameState.field.find(m => m.id === selectedMeld);
    if (cardObj && meldObj && meldObj.type === 'chord') {
      currentSwapResult = trySwapCardInMeld(cardObj, meldObj);
      if (currentSwapResult !== null) {
        isValidSwapSelection = true;
      }
    }
  }

  // -------------------------------------------------------------
  // 初心者アシスト：場のセット & 手札のインタラクティブ・ナビゲーション
  // -------------------------------------------------------------
  const actionableMeldIds = new Set<string>();
  const reactionAddCardIds = new Set<string>();
  const reactionSwapCardIds = new Set<string>();

  if (assistEnabled && isPlayerTurn && isMainPhase) {
    // 手札の各カードと場の各セットを網羅チェック
    gameState.field.forEach(meld => {
      let meldActionable = false;

      playerHandCards.forEach(card => {
        // 付け札判定
        const canAdd = tryAddCardToMeld(card, meld) !== null;
        // スワップ（リハモ）判定（1手番1回）
        const canSwap = !gameState.hasSwappedThisTurn && meld.type === 'chord' && trySwapCardInMeld(card, meld) !== null;

        if (canAdd || canSwap) {
          meldActionable = true;
          // 選択中のセットに反応する手札カードを分類収集
          if (selectedMeld === meld.id) {
            if (canAdd) reactionAddCardIds.add(card.id);
            if (canSwap) reactionSwapCardIds.add(card.id);
          }
        }
      });

      // 手札が1枚選択されている場合は、その選択カードでアクション可能なセットのみを強調
      if (selectedHand.length === 1) {
        const selectedCard = playerHandCards.find(c => c.id === selectedHand[0]);
        if (selectedCard) {
          const canAdd = tryAddCardToMeld(selectedCard, meld) !== null;
          const canSwap = !gameState.hasSwappedThisTurn && meld.type === 'chord' && trySwapCardInMeld(selectedCard, meld) !== null;
          if (canAdd || canSwap) {
            actionableMeldIds.add(meld.id);
          }
        }
      } else if (meldActionable) {
        actionableMeldIds.add(meld.id);
      }
    });
  }

  // 手札カード選択時の「連結可能性（2段階アシスト）」判定（場のセット未選択時かつ手札1〜2枚選択時）
  let readyToMeldCardIds = new Set<string>();
  let twoCardPairCardIds = new Set<string>();
  if (assistEnabled && isPlayerTurn && isMainPhase && selectedMeld === null && (selectedHand.length === 1 || selectedHand.length === 2)) {
    const selectedObjs = playerHandCards.filter(c => selectedHand.includes(c.id));
    const unselectedObjs = playerHandCards.filter(c => !selectedHand.includes(c.id));
    const result = analyzeHandConnections(selectedObjs, unselectedObjs);
    readyToMeldCardIds = result.readyToMeldIds;
    twoCardPairCardIds = result.twoCardPairIds;
  }

  // 割り込み（ポン・チー）判定とスマート選択ロジック
  const highlightCardIds = new Set<string>();
  const allValidCombs: { type: 'pon' | 'chii'; cardIds: string[] }[] = [];

  if (isMyInterrupt && gameState.interruptInfo) {
    const discardedCard = gameState.interruptInfo.discardedCard;
    const myHand = gameState.players[0].hand;

    // ポン候補（誰の捨て札からでも可）
    const ponCombs = getValidPonCombs(myHand, discardedCard);
    ponCombs.forEach(comb => {
      allValidCombs.push({ type: 'pon', cardIds: comb });
      comb.forEach(id => highlightCardIds.add(id));
    });

    // チー候補（直前のプレイヤーの捨て札からのみ可）
    if (gameState.interruptInfo.discarderId === 3) {
      const chiiCombs = getValidChiiCombs(myHand, discardedCard);
      chiiCombs.forEach(comb => {
        allValidCombs.push({ type: 'chii', cardIds: comb });
        comb.forEach(id => highlightCardIds.add(id));
      });
    }
  }

  // 割り込み発生時に、有効な手札がまだ選ばれていなければ最初の候補を自動選択
  useEffect(() => {
    if (isMyInterrupt && allValidCombs.length > 0) {
      const isAlreadySelectedValid = allValidCombs.some(
        c => c.cardIds.length === selectedHand.length && c.cardIds.every(id => selectedHand.includes(id))
      );
      if (!isAlreadySelectedValid) {
        setSelectedHand(allValidCombs[0].cardIds);
      }
    }
  }, [isMyInterrupt, gameState.interruptInfo?.discardedCard.id]);

  // 現在選択中の手札（selectedHand）でポン・チーが可能かどうかを判定（ボタン連動）
  let canPon = false;
  let canChii = false;
  let formedMeldName: string | null = null;
  let formedMeldType: 'chord' | 'scale' | 'add' | null = null;
  const actionBadges: ActionBadge[] = [];

  if (isInterruptTurn && isMyInterrupt && gameState.interruptInfo && selectedHand.length === 2) {
    const discardedCard = gameState.interruptInfo.discardedCard;
    const currentSelectedCards = playerHandCards.filter(c => selectedHand.includes(c.id));
    const testCards = [discardedCard, ...currentSelectedCards];
    const chordSeq = getChordInterpretation(testCards);
    const scaleSeq = (gameState.interruptInfo.discarderId === 3) ? getScaleInterpretation(testCards) : null;
    canPon = chordSeq !== null;
    canChii = scaleSeq !== null;

    if (chordSeq) {
      const sym = getChordSymbol(chordSeq);
      formedMeldName = sym;
      formedMeldType = 'chord';
      actionBadges.push({ text: `ポン [${sym}]`, type: 'chord' });
    } else if (scaleSeq) {
      formedMeldName = 'スケール';
      formedMeldType = 'scale';
      actionBadges.push({ text: 'チー [スケール]', type: 'scale' });
    }
  } else if (isPlayerTurn && isMainPhase) {
    // 1. 手札単体での3枚コード完成
    if (isValidChordSelection) {
      const chordSeq = getChordInterpretation(selectedObjs);
      const sym = chordSeq ? getChordSymbol(chordSeq) : 'コード';
      formedMeldName = sym;
      formedMeldType = 'chord';
      actionBadges.push({ text: `[${sym}] コード完成`, type: 'chord' });
    }
    // 2. 手札単体での3枚以上スケール完成
    else if (isValidScaleSelection) {
      formedMeldName = 'スケール';
      formedMeldType = 'scale';
      actionBadges.push({ text: 'スケール完成', type: 'scale' });
    }

    // 3. 場のセットに対する「付け札」成立判定
    if (isValidAddSelection && selectedMeld) {
      const meldObj = gameState.field.find(m => m.id === selectedMeld);
      if (meldObj && meldObj.type === 'chord' && selectedObjs.length === 1) {
        const newSeq = tryAddCardToMeld(selectedObjs[0], meldObj);
        const newChordSymbol = newSeq ? getChordSymbol(newSeq) : '';
        const text = newChordSymbol ? `付け札 → ${newChordSymbol}` : '付け札可能';
        actionBadges.push({ text, type: 'add' });
        if (!formedMeldName) {
          formedMeldName = text;
          formedMeldType = 'add';
        }
      } else {
        actionBadges.push({ text: '付け札可能', type: 'add' });
        if (!formedMeldName) {
          formedMeldName = '付け札';
          formedMeldType = 'add';
        }
      }
    }

    // 4. 場のセットに対する「アレンジ（リハモ）」成立判定（独立して判定・追加！）
    if (isValidSwapSelection && currentSwapResult) {
      const inNote = `${NOTE_NAMES[currentSwapResult.replacedCard.absVal % 7]}${Math.floor(currentSwapResult.replacedCard.absVal / 7) + 2}`;
      const text = `🔄 ${currentSwapResult.newSymbol} にアレンジ (${inNote} 回収)`;
      actionBadges.push({ text, type: 'swap' });
      if (!formedMeldName) {
        formedMeldName = text;
        formedMeldType = 'add';
      }
    }
  }

  const handleCardClick = (card: CardType) => {
    initAudio();

    if (isInterruptTurn && isMyInterrupt) {
      if (highlightCardIds.has(card.id)) {
        // ポン・チー候補の選択時
        if (soundEnabled && cardToneEnabled) {
          playCardTone(card.interpretedAbsVal ?? card.absVal);
        }

        // タップされたカードを含む有効な組み合わせ一覧
        const matchingCombs = allValidCombs.filter(c => c.cardIds.includes(card.id));
        if (matchingCombs.length > 0) {
          // すでに現在選ばれているペアと一致する候補のインデックスを探す
          const currentIdx = matchingCombs.findIndex(
            c => c.cardIds.length === selectedHand.length && c.cardIds.every(id => selectedHand.includes(id))
          );
          if (currentIdx !== -1) {
            // 同じカードを再度タップした時は、そのカードを含む「次の組み合わせ」へ切り替え（ローテーション）
            const nextIdx = (currentIdx + 1) % matchingCombs.length;
            setSelectedHand(matchingCombs[nextIdx].cardIds);
          } else {
            // 別のカードをタップした時は、そのカードを含む組み合わせの2枚へ瞬時に選択枠が移動！
            setSelectedHand(matchingCombs[0].cardIds);
          }
        }
      }
      return;
    }

    if (!isPlayerTurn && !isMyInterrupt) return;

    // 「未選択 → 選択（持ち上げ）時」のみ音を鳴らし、解除（戻す）時は鳴らさない
    const isSelecting = !selectedHand.includes(card.id);
    if (isSelecting && soundEnabled && cardToneEnabled) {
      playCardTone(card.interpretedAbsVal ?? card.absVal);
    }

    // 場のセット（シークエンス）を選択している時は、付け札・入れ替え用の「単一選択（ワンタップ切替）モード」
    if (selectedMeld !== null) {
      setSelectedHand(prev => prev.includes(card.id) ? [] : [card.id]);
    } else {
      // 通常時は複数選択トグル（役作り用）
      setSelectedHand(prev => prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]);
    }
  };

  // -------------------------------------------------------------
  // CPU / Bot 思考ルーチン（スタック・無限ループ防止 ＆ 速度連動）
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameState.winner !== null || gameState.roundOver) return;

    let isSubscribed = true;

    // 速度設定に応じたディレイ（通常 / 高速 / 超高速）
    let delay = 900;
    if (botSpeed === 'ultra') {
      delay = 30; // 超高速
    } else if (botSpeed === 'fast') {
      delay = 180; // 高速
    } else {
      // 通常速度
      if (gameState.phase === 'draw') {
        delay = 850;
      } else if (gameState.phase === 'main') {
        delay = 1000;
      } else if (gameState.phase === 'interrupt') {
        delay = 850;
      }
    }

    const timer = setTimeout(() => {
      if (!isSubscribed) return;

      // 割り込み（ポン・チー）フェーズの処理
      if (gameState.phase === 'interrupt') {
        if (!gameState.interruptInfo || !gameState.interruptInfo.candidates || gameState.interruptInfo.candidates.length === 0) {
          return;
        }
        const candidate = gameState.interruptInfo.candidates[0];

        // プレイヤー（あなた）の割り込み確認
        if (candidate.playerId === 0) {
          if (botMode) {
            // BotモードONの場合、自動でポンまたはチーを実行
            const ponAction = candidate.actions.find(a => a.type === 'pon');
            const chiiAction = candidate.actions.find(a => a.type === 'chii');
            if (ponAction) {
              doInterruptAction(0, 'pon', ponAction.validCombs[0]);
            } else if (chiiAction) {
              doInterruptAction(0, 'chii', chiiAction.validCombs[0]);
            } else {
              doPassInterrupt();
            }
          } else {
            // 手動モードの場合、権利がなければ自動パス
            const discardedCard = gameState.interruptInfo.discardedCard;
            const myHand = gameState.players[0].hand;
            const hasPon = getValidPonCombs(myHand, discardedCard).length > 0;
            const hasChii = (gameState.interruptInfo.discarderId === 3) && (getValidChiiCombs(myHand, discardedCard).length > 0);

            if (!hasPon && !hasChii) {
              doPassInterrupt();
            }
          }
          return;
        }

        // CPUの割り込みアクション
        if (gameState.players[candidate.playerId].isCPU) {
          const ponAction = candidate.actions.find(a => a.type === 'pon');
          const chiiAction = candidate.actions.find(a => a.type === 'chii');
          if (ponAction) {
            doInterruptAction(candidate.playerId, 'pon', ponAction.validCombs[0]);
          } else if (chiiAction) {
            doInterruptAction(candidate.playerId, 'chii', chiiAction.validCombs[0]);
          } else {
            doPassInterrupt();
          }
        }
        return;
      }

      // 通常手番の処理（CPUまたはBot有効時のPlayer0）
      const p = gameState.players[gameState.turn];
      const isAutoActive = p.isCPU || (gameState.turn === 0 && botMode);
      if (!isAutoActive) return;

      if (gameState.phase === 'draw') {
        doDraw();
      } else if (gameState.phase === 'main') {
        const currentHand = [...p.hand];

        // 1. 役出しを試みる（スケール・コード）
        let melded = false;
        if (currentHand.length >= 3) {
          for (let size = Math.min(currentHand.length, 5); size >= 3; size--) {
            const combs = getCombinations(currentHand, size);
            for (const comb of combs) {
              const scaleSeq = getScaleInterpretation(comb);
              if (scaleSeq) {
                doMeld(comb.map(c => c.id), 'scale', scaleSeq);
                melded = true;
                break;
              }
              const chordSeq = getChordInterpretation(comb);
              if (chordSeq && size === 3) {
                doMeld(comb.map(c => c.id), 'chord', chordSeq);
                melded = true;
                break;
              }
            }
            if (melded) break;
          }
        }

        if (melded) {
          return; // 役を出した後は次のレンダリングで付け札や捨て札を判定
        }

        // 2. 付け札を試みる
        let added = false;
        for (const card of currentHand) {
          for (const meld of gameState.field) {
            const newSeq = tryAddCardToMeld(card, meld);
            if (newSeq) {
              doAdd(card.id, meld.id, newSeq);
              added = true;
              break;
            }
          }
          if (added) break;
        }

        if (added) {
          return; // 付け札をした後は次のレンダリングで追加の付け札や捨て札を判定
        }

        // 3. 役出しも付け札もできなかった場合、スワップ（入れ替え）を試みる（役出し前でも可・手札2枚以下時は不可・1手番最大1回）
        if (!gameState.hasSwappedThisTurn && currentHand.length > 2 && gameState.deck.length > 0) {
          let swapped = false;
          for (const card of currentHand) {
            for (const meld of gameState.field) {
              if (meld.type === 'chord') {
                const swapResult = trySwapCardInMeld(card, meld);
                if (swapResult) {
                  doSwap(card.id, meld.id, swapResult);
                  swapped = true;
                  break;
                }
              }
            }
            if (swapped) break;
          }
          if (swapped) return;
        }

        // 4. アクション完了後、必ず手札から1枚捨ててターンを終了
        if (currentHand.length > 0) {
          const discardTarget = currentHand[Math.floor(Math.random() * currentHand.length)];
          doDiscard(discardTarget.id);
        }
      }
    }, delay);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [gameState.turn, gameState.phase, gameState.players, gameState.field, gameState.actionCount, gameState.winner, gameState.roundOver, gameState.interruptInfo, botMode, botSpeed, doDraw, doMeld, doAdd, doSwap, doDiscard, doPassInterrupt, doInterruptAction]);

  // ラウンド進行
  const nextRound = useCallback(() => {
    if (gameState.round < 4) {
      isRoundEndingRef.current = false;
      hasRecordedStatsRef.current = false;
      setWinEffectName(null);
      setShowGameOverModal(false);
      setGameState(setupRound(gameState.scores, gameState.round + 1));
      setSelectedHand([]);
      setSelectedMeld(null);
    }
  }, [gameState.round, gameState.scores]);

  const restartGame = useCallback(() => {
    isRoundEndingRef.current = false;
    hasRecordedStatsRef.current = false;
    setWinEffectName(null);
    setShowGameOverModal(false);
    setGameState(setupRound([0, 0, 0, 0], 1));
    setSelectedHand([]);
    setSelectedMeld(null);
  }, []);

  // 手札0枚または山札切れの自動検知（取りこぼし防止セーフティネット）
  useEffect(() => {
    if (gameState.roundOver) return;

    const winner = gameState.players.find(p => p.hand.length === 0);
    if (winner) {
      finishRoundSafely(winner.id, `${winner.name} がアガリました！`);
    }
  }, [gameState.players, gameState.roundOver, finishRoundSafely]);

  // Botモード時の自動ラウンド進行（放置テスト用）
  useEffect(() => {
    if (!botMode || !gameState.roundOver) return;

    const autoDelay = botSpeed === 'ultra' ? 300 : botSpeed === 'fast' ? 1000 : 2500;
    const timer = setTimeout(() => {
      if (gameState.round < 4) {
        nextRound();
      } else {
        restartGame();
      }
    }, autoDelay);

    return () => clearTimeout(timer);
  }, [botMode, gameState.roundOver, gameState.round, botSpeed, nextRound, restartGame]);

  // ガイド文言（短く明確で自然な日本語、1行で美しく収まる）
  const getGuideMessage = () => {
    if (gameState.roundOver) return gameState.message;

    if (gameState.phase === 'draw') {
      if (gameState.turn === 0) return '山札を引いてください。';
      return `${gameState.players[gameState.turn].name} のドロー`;
    }
    
    if (gameState.phase === 'main') {
      if (gameState.turn === 0) {
        if (selectedHand.length > 0) {
          if (selectedHand.length === 1 && isValidAddSelection) return '場のセットをタップして「付け札」するか、捨てられます。';
          if (selectedHand.length === 1) return '1枚捨てるか、役を選んでください。';
          if (isValidScaleSelection || isValidChordSelection) return '役が完成しました（場に出せます）';
          return '役が揃っていません（選び直してください）';
        }
        return '役を場に出すか、1枚捨ててください。';
      }
      return `${gameState.players[gameState.turn].name} が思考中…`;
    }

    if (gameState.phase === 'interrupt') {
      if (isMyInterrupt) return 'ポン・チーが可能です。手札を選んでください。';
      return '割り込みを確認中…';
    }

    return gameState.message;
  };

  const lastDiscardItem = gameState.discardPile.length > 0 
    ? gameState.discardPile[gameState.discardPile.length - 1] 
    : undefined;

  // 直前のプレイヤーアクション（システムメッセージ以外の最新ログ全文）
  const lastPlayerLog = [...(gameState.logs || [])].reverse().find(l => l.player !== 'システム');
  const lastActionText = lastPlayerLog ? `${lastPlayerLog.player}: ${lastPlayerLog.text}` : undefined;

  return (
    <div className="relative w-full max-w-md h-full flex flex-col overflow-hidden shadow-2xl bg-[#170e08]">
      {/* ヘッダー */}
      <Header
        round={gameState.round}
        onOpenRules={() => setShowRuleModal(true)}
        onOpenOptions={() => setShowOptionModal(true)}
        onOpenLogs={() => setShowLogModal(true)}
      />

      {/* プレイヤー情報（4人） */}
      <PlayerStatus
        players={gameState.players}
        turn={gameState.turn}
        roundOver={gameState.roundOver}
      />

      {/* メインゲーム画面 */}
      <main className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden w-full min-h-0">
        {/* ガイドメッセージ ＆ 山札・捨て札（ポン・チーチャンス時は枠全体と対象牌がハイライト） */}
        <GuideAndDeck
          guideMessage={getGuideMessage()}
          lastActionText={lastActionText}
          isPlayerTurn={isPlayerTurn}
          isDrawPhase={isDrawPhase}
          isMyInterrupt={isMyInterrupt}
          roundOver={gameState.roundOver}
          deckCount={gameState.deck.length}
          lastDiscardItem={lastDiscardItem}
          onDraw={doDraw}
          onOpenDiscardModal={() => setShowDiscardModal(true)}
        />

        {/* 場（フィールド：和音・音階セット一覧） */}
        <Field
          field={gameState.field}
          players={gameState.players}
          selectedMeldId={selectedMeld}
          lastAddedCardId={lastAddedCardId}
          lastSwappedMeldId={lastSwappedMeldId}
          swappedInCardId={swappedInCardId}
          ejectedCardInfo={ejectedCardInfo}
          actionableMeldIds={actionableMeldIds}
          isPlayerTurn={isPlayerTurn}
          isMainPhase={isMainPhase}
          onSelectMeld={(meldId) => {
            setSelectedMeld(prev => {
              const next = prev === meldId ? null : meldId;
              if (next !== null && selectedHand.length > 1) {
                setSelectedHand([]);
              }
              return next;
            });
          }}
        />
      </main>

      {/* インジケーター表示専用コンテナ（横1行・情報ナビ専用） */}
      <div className="px-2 pb-1 shrink-0">
        <IndicatorBar
          selectedCount={selectedHand.length}
          selectedCards={playerHandCards.filter(c => selectedHand.includes(c.id))}
          formedMeldName={formedMeldName}
          actionBadges={actionBadges}
          isPlayerTurn={isPlayerTurn}
          isMainPhase={isMainPhase}
          isInterruptTurn={isInterruptTurn}
          isMyInterrupt={isMyInterrupt}
          selectedMeldId={selectedMeld}
          hasSwappedThisTurn={gameState.hasSwappedThisTurn}
        />
      </div>

      {/* アクション操作専用コンテナ（横1行・ボタン専用） */}
      <div className="px-2 pb-1 shrink-0">
        <ActionBar
          selectedCount={selectedHand.length}
          isPlayerTurn={isPlayerTurn}
          isMainPhase={isMainPhase}
          isInterruptTurn={isInterruptTurn}
          isMyInterrupt={isMyInterrupt}
          canPon={canPon}
          canChii={canChii}
          isValidScaleSelection={isValidScaleSelection}
          isValidChordSelection={isValidChordSelection}
          isValidAddSelection={isValidAddSelection}
          isValidSwapSelection={isValidSwapSelection}
          onMeld={handlePlayerMeld}
          onAdd={handlePlayerAdd}
          onSwap={handlePlayerSwap}
          onDiscard={doDiscard}
          onPassInterrupt={doPassInterrupt}
          onInterruptAction={handlePlayerInterrupt}
          firstSelectedCardId={selectedHand.length === 1 ? selectedHand[0] : undefined}
        />
      </div>

      {/* プレイヤー手札コンテナ（純粋な手札カードトレイ） */}
      <div className="px-2 pb-2 shrink-0">
        <Hand
          hand={playerHandCards}
          selectedHand={selectedHand}
          justDrawnCardId={gameState.players[0].justDrawnCardId}
          lastSwappedInCardId={lastSwappedInCardId}
          highlightCardIds={highlightCardIds}
          reactionAddCardIds={reactionAddCardIds}
          reactionSwapCardIds={reactionSwapCardIds}
          readyToMeldCardIds={readyToMeldCardIds}
          twoCardPairCardIds={twoCardPairCardIds}
          isInterruptTurn={isInterruptTurn}
          isMyInterrupt={isMyInterrupt}
          onCardClick={handleCardClick}
        />
      </div>

      {/* モーダル群 */}
      <StatsModal
        isOpen={showStatsModal}
        stats={stats}
        gameState={gameState}
        onClose={closeStatsModal}
        onUpdateStats={setStats}
      />

      <RuleModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
      />

      <OptionModal
        isOpen={showOptionModal}
        soundEnabled={soundEnabled}
        cardToneEnabled={cardToneEnabled}
        assistEnabled={assistEnabled}
        botMode={botMode}
        botSpeed={botSpeed}
        botTargetCount={botTargetCount}
        botRemainingCount={botRemainingCount}
        onToggleSound={toggleSound}
        onToggleCardTone={toggleCardTone}
        onToggleAssist={toggleAssist}
        onToggleBot={toggleBotMode}
        onChangeBotSpeed={cycleBotSpeed}
        onChangeBotTargetCount={changeBotTargetCount}
        onOpenStats={openStatsModal}
        onClose={() => setShowOptionModal(false)}
      />

      <DiscardModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        discardPile={gameState.discardPile}
        players={gameState.players}
      />

      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        logs={gameState.logs}
      />

      <GameOverModal
        isOpen={showGameOverModal}
        round={gameState.round}
        scores={gameState.scores}
        players={gameState.players}
        message={gameState.message}
        onOpenLogs={() => setShowLogModal(true)}
        onNextRound={nextRound}
        onRestartGame={restartGame}
      />

      {/* ポン・チー カットイン演出（横スライド） */}
      {cutInInfo && (
        <CutIn type={cutInInfo.type} playerName={cutInInfo.playerName} />
      )}

      {/* アガリ専用演出（中央ズームインパクト） */}
      {winEffectName && (
        <WinEffect winnerName={winEffectName} />
      )}
    </div>
  );
}
