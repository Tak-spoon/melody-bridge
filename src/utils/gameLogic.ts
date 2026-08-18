import { Card, GameState, InterruptCandidate, Player, RoundScoreRecord } from '../types/game';
import { getChordInterpretation, getScaleInterpretation } from './musicTheory';

/**
 * 56枚のカード山札（白鍵28音 × 各2枚・スートなし）を生成し、シャッフルして返します。
 */
export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let idCounter = 0;
  
  for (let absVal = 0; absVal < 28; absVal++) {
    const oct = Math.floor(absVal / 7) + 2;
    const val = absVal % 7;
    for (let copy = 0; copy < 2; copy++) {
      deck.push({ id: `c_${idCounter++}`, val, oct, absVal });
    }
  }

  // Fisher-Yates シャッフル
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

/**
 * 手札を音の高さ（低い音→高い音）順にソートします。
 */
export const sortHand = (hand: Card[]): Card[] => {
  return [...hand].sort((a, b) => a.absVal - b.absVal);
};

/**
 * 新しいラウンド（初期状態）をセットアップします。
 */
export const setupRound = (scores: number[] = [0, 0, 0, 0], roundNum: number = 1, roundHistory: RoundScoreRecord[] = []): GameState => {
  const deck = createDeck();
  const defaultActions = { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 };
  const players: Player[] = [
    { id: 0, name: 'あなた', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: false, actions: { ...defaultActions } },
    { id: 1, name: 'CPU 1', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true, actions: { ...defaultActions } },
    { id: 2, name: 'CPU 2', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true, actions: { ...defaultActions } },
    { id: 3, name: 'CPU 3', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true, actions: { ...defaultActions } },
  ];

  // 各プレイヤーに7枚ずつ配る
  for (let i = 0; i < 7; i++) {
    players.forEach(p => {
      const card = deck.pop();
      if (card) p.hand.push(card);
    });
  }
  
  // プレイヤーの手札をソート
  players[0].hand = sortHand(players[0].hand);

  const startingTurn = (roundNum - 1) % 4;

  return {
    round: roundNum,
    scores,
    deck,
    discardPile: [],
    players,
    field: [],
    turn: startingTurn,
    phase: 'draw',
    interruptInfo: null,
    winner: null,
    roundOver: false,
    message: `ラウンド ${roundNum} スタート`,
    logs: [
      { player: 'システム', text: `[R${roundNum}] ラウンド開始。先手: ${players[startingTurn].name}` }
    ],
    actionCount: 0,
    hasSwappedThisTurn: false,
    roundHistory: [...roundHistory]
  };
};

/**
 * 配列から指定サイズの全組み合わせを取得します。
 */
export const getCombinations = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  const p = (t: T[], i: number) => {
    if (t.length === size) {
      result.push(t);
      return;
    }
    if (i >= array.length) return;
    p([...t, array[i]], i + 1);
    p(t, i + 1);
  };
  p([], 0);
  return result;
};

/**
 * 捨てられたカードに対して、手札2枚と組み合わせてポン（和音作成）できる手札ペアのIDリストを返します。
 */
export const getValidPonCombs = (hand: Card[], discardedCard: Card): string[][] => {
  const combs = getCombinations(hand, 2);
  const valid: string[][] = [];
  for (const comb of combs) {
    const testCards = [discardedCard, ...comb];
    const seq = getChordInterpretation(testCards);
    if (seq) valid.push(comb.map(c => c.id));
  }
  return valid;
};

/**
 * 捨てられたカードに対して、手札2枚と組み合わせてチー（スケール作成）できる手札ペアのIDリストを返します。
 */
export const getValidChiiCombs = (hand: Card[], discardedCard: Card): string[][] => {
  const combs = getCombinations(hand, 2);
  const valid: string[][] = [];
  for (const comb of combs) {
    const testCards = [discardedCard, ...comb];
    const seq = getScaleInterpretation(testCards);
    if (seq) valid.push(comb.map(c => c.id));
  }
  return valid;
};

/**
 * 誰かがカードを捨てた際に、他のプレイヤーにポンまたはチーの権利があるかを判定します。
 */
export const checkInterrupts = (state: GameState, discarderId: number, discardedCard: Card): InterruptCandidate[] => {
  const candidates: InterruptCandidate[] = [];
  const nextPlayerId = (discarderId + 1) % 4; // 上家の捨て札を取れるのは下家（次のプレイヤー）のみ

  for (let i = 1; i < 4; i++) {
    const pId = (discarderId + i) % 4;
    const hand = state.players[pId].hand;

    // 手札が2枚以下の場合、鳴きアガリ（ポン・チーで手札0枚になるアガリ）は禁止（本家セブンブリッジ仕様）
    if (hand.length <= 2) continue;

    const actions: { type: 'pon' | 'chii'; validCombs: string[][] }[] = [];
    
    // ポン（誰からでもOK）
    const ponCombs = getValidPonCombs(hand, discardedCard);
    if (ponCombs.length > 0) {
      actions.push({ type: 'pon', validCombs: ponCombs });
    }
    
    // チー（直前の順番の人からのみ）
    if (pId === nextPlayerId) {
      const chiiCombs = getValidChiiCombs(hand, discardedCard);
      if (chiiCombs.length > 0) {
        actions.push({ type: 'chii', validCombs: chiiCombs });
      }
    }
    
    if (actions.length > 0) {
      candidates.push({ playerId: pId, actions });
    }
  }
  
  // ポン優先ソート
  candidates.sort((a, b) => {
    const aHasPon = a.actions.some(x => x.type === 'pon');
    const bHasPon = b.actions.some(x => x.type === 'pon');
    if (aHasPon && !bHasPon) return -1;
    if (!aHasPon && bHasPon) return 1;
    return 0;
  });

  return candidates;
};

/**
 * ログを追加します。
 */
export const addLog = (state: GameState, playerName: string, text: string): void => {
  if (!state.logs) state.logs = [];
  const entry = { player: playerName, text };
  state.logs = [...state.logs.slice(-49), entry];
};

import { calculateRoundScore } from './stats';

/**
 * ラウンドを終了し、新スコア計算方式（着順点 ＋ 手札削減成果）によりスコアを加算します。
 */
export const finishRound = (state: GameState, reasonMsg: string): void => {
  state.roundOver = true;
  
  // ラウンド順位の確定: 勝者が1位、それ以外は残った手札の少ない順
  let rankOrder: number[] = [];
  if (state.winner !== null) {
    const rem = [0, 1, 2, 3].filter(p => p !== state.winner);
    rem.sort((a, b) => state.players[a].hand.length - state.players[b].hand.length);
    rankOrder = [state.winner, ...rem];
  } else {
    const allP = [0, 1, 2, 3];
    allP.sort((a, b) => state.players[a].hand.length - state.players[b].hand.length);
    rankOrder = allP;
  }

  // プレイヤーごとのこのラウンドの得点を計算
  const roundDetails = [0, 1, 2, 3].map(pId => {
    const rPos = rankOrder.indexOf(pId);
    const melds = state.players[pId].actions?.melds || 0;
    const adds = state.players[pId].actions?.adds || 0;
    return calculateRoundScore(rPos, melds, adds);
  });

  const roundScores = roundDetails.map(d => d.totalRoundScore);
  state.scores = state.scores.map((score, idx) => score + roundScores[idx]);

  const currentHistory = state.roundHistory || [];
  if (!currentHistory.some(h => h.round === state.round)) {
    state.roundHistory = [
      ...currentHistory,
      {
        round: state.round,
        winnerId: state.winner,
        roundScores,
        accumulatedScores: [...state.scores],
        ranks: rankOrder,
      }
    ];
  }

  state.message = reasonMsg;
  addLog(state, 'システム', `${reasonMsg} ラウンド終了`);
};

/**
 * 誰かがアガったか（手札が0枚になったか）をチェックします。
 */
export const checkWinCondition = (state: GameState): boolean => {
  for (const p of state.players) {
    if (p.hand.length === 0) {
      state.winner = p.id;
      finishRound(state, `${p.name} がアガリました！`);
      return true;
    }
  }
  return false;
};

