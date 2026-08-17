import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card as CardType, GameState, MeldType } from './types/game';
import { NOTE_NAMES, NOTE_JP } from './constants/music';
import { getChordSymbol, getChordInterpretation, getScaleInterpretation, tryAddCardToMeld } from './utils/musicTheory';
import { setupRound, sortHand, getCombinations, getValidPonCombs, getValidChiiCombs, checkInterrupts, addLog, finishRound, checkWinCondition } from './utils/gameLogic';
import { playMelody, playCutInSound, playWinSound, getAudioContext } from './utils/audio';

import { Header } from './components/Header';
import { PlayerStatus } from './components/PlayerStatus';
import { GuideAndDeck } from './components/GuideAndDeck';
import { Field } from './components/Field';
import { Hand } from './components/Hand';
import { Card as CardComponent } from './components/Card';
import { CutIn } from './components/CutIn';
import { WinEffect } from './components/WinEffect';
import { RuleModal } from './components/Modals/RuleModal';
import { DiscardModal } from './components/Modals/DiscardModal';
import { LogModal } from './components/Modals/LogModal';
import { GameOverModal } from './components/Modals/GameOverModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => setupRound());
  const [selectedHand, setSelectedHand] = useState<string[]>([]);
  const [selectedMeld, setSelectedMeld] = useState<string | null>(null);
  
  // モーダル表示状態
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // ポン・チー カットイン表示状態（横スライド）
  const [cutInInfo, setCutInInfo] = useState<{ type: 'pon' | 'chii'; playerName: string } | null>(null);

  // アガリ専用演出表示状態（中央ズームインパクト）
  const [winEffectName, setWinEffectName] = useState<string | null>(null);

  // 初回ユーザー操作時にWeb Audio APIを有効化
  const initAudio = () => {
    getAudioContext();
  };

  // アガリ・流局演出の起動
  const triggerWinSequence = useCallback((winnerId: number | null, reasonMsg: string) => {
    initAudio();
    if (winnerId !== null) {
      setGameState(curr => {
        const winnerName = curr.players[winnerId]?.name || '誰か';
        playWinSound();
        setWinEffectName(winnerName);
        return curr;
      });
    }

    setTimeout(() => {
      setWinEffectName(null);
      setGameState(prev => {
        if (prev.roundOver) return prev;
        const s = { ...prev, logs: [...prev.logs], scores: [...prev.scores] };
        s.winner = winnerId;
        finishRound(s, reasonMsg);
        return s;
      });
    }, 1200);
  }, []);

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
        triggerWinSequence(null, '山札がなくなりました（流局）');
        s.actionCount += 1;
        return s;
      }
      
      s.deck = [...s.deck];
      const drawnCard = s.deck.pop()!;
      
      p.justDrawnCardId = drawnCard.id;
      p.hand = [...sortHand(p.hand), drawnCard];
      
      s.players[s.turn] = p;
      s.phase = 'main';
      s.message = `${p.name} のターン`;
      addLog(s, p.name, '山札からドロー');
      s.actionCount += 1;
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
      s.players[s.turn] = p;
      
      const symbol = type === 'chord' ? getChordSymbol(interpretedSeq) : 'スケール';
      const cardsStr = interpretedSeq.map(c => {
        const val = c.interpretedAbsVal ?? c.absVal;
        const idx = val % 7;
        const o = Math.floor(val / 7) + 3;
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
        triggerWinSequence(winner.id, `${winner.name} がアガリました！`);
      }
      s.actionCount += 1;
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, [triggerWinSequence]);

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
      const oct = Math.floor(cardObj.absVal / 7) + 3;
      const cardStr = `${NOTE_NAMES[noteIndex]}${oct}(${NOTE_JP[noteIndex]})`;
      const targetName = meld.type === 'chord' ? getChordSymbol(meld.cards) : 'スケール';
      const ownerName = s.players[meld.ownerId]?.name || '誰か';

      p.hand = sortHand(p.hand.filter(c => c.id !== cardId));
      p.justDrawnCardId = null;
      s.players[s.turn] = p;
      meld.cards = newSeq; 
      s.field[meldIndex] = meld;

      const newTargetName = meld.type === 'chord' ? getChordSymbol(newSeq) : 'スケール';

      s.message = `${p.name} が ${cardStr}を付け札`;
      addLog(s, p.name, `${ownerName}の [${targetName}] に ${cardStr}を付け札 → [${newTargetName}]`);

      playMelody(meld.cards.map(c => c.interpretedAbsVal ?? c.absVal));
      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        triggerWinSequence(winner.id, `${winner.name} がアガリました！`);
      }
      s.actionCount += 1;
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, [triggerWinSequence]);

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
      const oct = Math.floor(discardedCard.absVal / 7) + 3;
      const noteText = `${NOTE_NAMES[noteIndex]}${oct}(${NOTE_JP[noteIndex]})`;
      addLog(s, p.name, `${noteText}を捨てた`);
      
      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        triggerWinSequence(winner.id, `${winner.name} がアガリました！`);
        return s;
      }

      const candidates = checkInterrupts(s, s.turn, discardedCard);
      if (candidates.length > 0) {
        s.phase = 'interrupt';
        s.interruptInfo = { discarderId: s.turn, discardedCard, candidates };
        s.message = `割り込み確認中`;
      } else {
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
        s.phase = 'draw';
        s.turn = ((s.interruptInfo.discarderId as number) + 1) % 4;
        s.message = `${s.players[s.turn].name} のターン`;
        s.interruptInfo = null;
        s.actionCount += 1;
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
      s.players[playerId] = p;
      
      const symbol = type === 'pon' ? getChordSymbol(seq) : 'スケール';
      const actionName = type === 'pon' ? `ポン` : `チー`;
      const cardsStr = seq.map(c => {
        const val = c.interpretedAbsVal ?? c.absVal;
        const idx = val % 7;
        const o = Math.floor(val / 7) + 3;
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
      s.interruptInfo = null;
      s.message = `${p.name} が ${discarderName} の捨て札で ${actionName}`;
      addLog(s, p.name, `${discarderName}の捨て札で ${actionName}！ [${cardsStr}] で ${symbol} を公開`);
      
      const winner = s.players.find(pl => pl.hand.length === 0);
      if (winner) {
        triggerWinSequence(winner.id, `${winner.name} がアガリました！`);
      }
      s.actionCount += 1;
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  }, [triggerWinSequence]);

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

  if (isInterruptTurn && isMyInterrupt && gameState.interruptInfo && selectedHand.length === 2) {
    const discardedCard = gameState.interruptInfo.discardedCard;
    const currentSelectedCards = playerHandCards.filter(c => selectedHand.includes(c.id));
    const testCards = [discardedCard, ...currentSelectedCards];
    const chordSeq = getChordInterpretation(testCards);
    const scaleSeq = (gameState.interruptInfo.discarderId === 3) ? getScaleInterpretation(testCards) : null;
    canPon = chordSeq !== null;
    canChii = scaleSeq !== null;

    if (chordSeq) {
      formedMeldName = getChordSymbol(chordSeq);
      formedMeldType = 'chord';
    } else if (scaleSeq) {
      formedMeldName = 'スケール';
      formedMeldType = 'scale';
    }
  } else if (isPlayerTurn && isMainPhase) {
    if (isValidChordSelection) {
      const chordSeq = getChordInterpretation(selectedObjs);
      formedMeldName = chordSeq ? getChordSymbol(chordSeq) : 'コード';
      formedMeldType = 'chord';
    } else if (isValidScaleSelection) {
      formedMeldName = 'スケール';
      formedMeldType = 'scale';
    } else if (isValidAddSelection && selectedMeld) {
      formedMeldName = '付け札';
      formedMeldType = 'add';
    }
  }

  const handleCardClick = (card: CardType) => {
    initAudio();
    if (isInterruptTurn && isMyInterrupt) {
      if (highlightCardIds.has(card.id)) {
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
    setSelectedHand(prev => prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]);
  };

  // -------------------------------------------------------------
  // CPU 思考ルーチン（スタック・無限ループ防止）
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameState.winner !== null || gameState.roundOver) return;

    let isSubscribed = true;

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
          const discardedCard = gameState.interruptInfo.discardedCard;
          const myHand = gameState.players[0].hand;
          const hasPon = getValidPonCombs(myHand, discardedCard).length > 0;
          const hasChii = (gameState.interruptInfo.discarderId === 3) && (getValidChiiCombs(myHand, discardedCard).length > 0);

          // プレイヤーに権利がなければ自動パス
          if (!hasPon && !hasChii) {
            doPassInterrupt();
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

      // 通常手番の処理
      const p = gameState.players[gameState.turn];
      if (!p.isCPU) return;

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

        // 3. 役出しも付け札も完了したら、必ず手札から1枚捨ててターンを終了
        if (currentHand.length > 0) {
          const discardTarget = currentHand[Math.floor(Math.random() * currentHand.length)];
          doDiscard(discardTarget.id);
        }
      }
    }, 600);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [gameState.turn, gameState.phase, gameState.actionCount, gameState.winner, gameState.roundOver, gameState.interruptInfo, doDraw, doMeld, doAdd, doDiscard, doPassInterrupt, doInterruptAction]);

  // ラウンド進行
  const nextRound = () => {
    if (gameState.round < 4) {
      setGameState(setupRound(gameState.scores, gameState.round + 1));
      setSelectedHand([]);
      setSelectedMeld(null);
    }
  };

  const restartGame = () => {
    setGameState(setupRound([0, 0, 0, 0], 1));
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  // ガイド文言
  const getGuideMessage = () => {
    if (gameState.roundOver) return gameState.message;

    if (gameState.phase === 'draw') {
      if (gameState.turn === 0) return 'あなたのターンです。山札から1枚引いてください。';
      return `${gameState.players[gameState.turn].name} のターン（ドロー中）`;
    }
    
    if (gameState.phase === 'main') {
      if (gameState.turn === 0) {
        if (selectedHand.length > 0) {
          if (selectedHand.length === 1 && isValidAddSelection) return '「付け札」または「捨てる」が可能です。';
          if (selectedHand.length === 1) return '不要なら「捨てる」、役を作るならさらにカードを選択してください。';
          if (isValidScaleSelection || isValidChordSelection) return '役が完成しています。アクションボタンで場に出せます。';
          return 'その組み合わせでは役を作れません。選び直すか1枚だけ捨ててください。';
        }
        return '役を作って場に出すか、不要なカードを1枚選んで捨ててください。';
      }
      return `${gameState.players[gameState.turn].name} が考え中...`;
    }

    if (gameState.phase === 'interrupt') {
      if (isMyInterrupt) return 'ポン・チーが可能です。手札の光るカードを選んでください。';
      return '他プレイヤーの割り込みを確認中...';
    }

    return gameState.message;
  };

  const lastDiscardItem = gameState.discardPile.length > 0 
    ? gameState.discardPile[gameState.discardPile.length - 1] 
    : undefined;

  // 直前のプレイヤーアクション（システムメッセージ以外の最新ログ）
  const lastPlayerLog = [...(gameState.logs || [])].reverse().find(l => l.player !== 'システム');
  const lastActionText = lastPlayerLog ? `[${lastPlayerLog.player}] ${lastPlayerLog.text}` : undefined;

  return (
    <div className="relative w-full max-w-md h-full flex flex-col overflow-hidden shadow-2xl bg-[#170e08]">
      {/* ヘッダー */}
      <Header
        round={gameState.round}
        onOpenRules={() => setShowRuleModal(true)}
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
          isPlayerTurn={isPlayerTurn}
          isMainPhase={isMainPhase}
          onSelectMeld={(meldId) => setSelectedMeld(prev => prev === meldId ? null : meldId)}
        />
      </main>

      {/* プレイヤー手札 ＆ アクション操作フッター */}
      <Hand
        hand={playerHandCards}
        selectedHand={selectedHand}
        justDrawnCardId={gameState.players[0].justDrawnCardId}
        highlightCardIds={highlightCardIds}
        formedMeldName={formedMeldName}
        formedMeldType={formedMeldType}
        isPlayerTurn={isPlayerTurn}
        isMainPhase={isMainPhase}
        isInterruptTurn={isInterruptTurn}
        isMyInterrupt={isMyInterrupt}
        canPon={canPon}
        canChii={canChii}
        isValidScaleSelection={isValidScaleSelection}
        isValidChordSelection={isValidChordSelection}
        isValidAddSelection={isValidAddSelection}
        onCardClick={handleCardClick}
        onMeld={handlePlayerMeld}
        onAdd={handlePlayerAdd}
        onDiscard={doDiscard}
        onPassInterrupt={doPassInterrupt}
        onInterruptAction={handlePlayerInterrupt}
      />

      {/* モーダル群 */}
      <RuleModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
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
        isOpen={gameState.roundOver}
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
