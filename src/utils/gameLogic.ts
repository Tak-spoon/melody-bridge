import { Card, GameState, InterruptCandidate, Player } from '../types/game';
import { getChordInterpretation, getScaleInterpretation } from './musicTheory';

/**
 * 42枚のカード山札（赤21枚＋青21枚）を生成し、シャッフルして返します。
 */
export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let idCounter = 0;
  
  for (let absVal = 0; absVal < 21; absVal++) {
    const oct = Math.floor(absVal / 7) + 3;
    const val = absVal % 7;
    deck.push({ id: `c_${idCounter++}`, val, oct, absVal, suit: 'red' });
    deck.push({ id: `c_${idCounter++}`, val, oct, absVal, suit: 'blue' });
  }

  // Fisher-Yates シャッフル
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

/**
 * 手札を色（赤→青）および音の高さ（低い音→高い音）順にソートします。
 */
export const sortHand = (hand: Card[]): Card[] => {
  return [...hand].sort((a, b) => {
    if (a.suit === 'red' && b.suit === 'blue') return -1;
    if (a.suit === 'blue' && b.suit === 'red') return 1;
    return a.absVal - b.absVal;
  });
};

/**
 * 新しいラウンド（初期状態）をセットアップします。
 */
export const setupRound = (scores: number[] = [0, 0, 0, 0], roundNum: number = 1): GameState => {
  const deck = createDeck();
  const players: Player[] = [
    { id: 0, name: 'あなた', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: false },
    { id: 1, name: 'CPU 1', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true },
    { id: 2, name: 'CPU 2', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true },
    { id: 3, name: 'CPU 3', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true },
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

  // 王牌（山札の端から2枚を裏向きで捨てる）
  const hidden1 = deck.pop()!;
  const hidden2 = deck.pop()!;
  const startingTurn = (roundNum - 1) % 4;

  return {
    round: roundNum,
    scores,
    deck,
    discardPile: [
      { card: hidden1, discarderId: 'system', isHidden: true },
      { card: hidden2, discarderId: 'system', isHidden: true }
    ],
    players,
    field: [],
    turn: startingTurn,
    phase: 'draw',
    interruptInfo: null,
    winner: null,
    roundOver: false,
    message: `ラウンド ${roundNum} スタート`,
    logs: [
      { player: 'システム', text: `初期の王牌2枚が裏向きで捨てられました。` },
      { player: 'システム', text: `[R${roundNum}] ラウンド開始。先手: ${players[startingTurn].name}` }
    ],
    actionCount: 0
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

/**
 * ラウンドを終了し、スコア（残った手札枚数）を加算します。
 */
export const finishRound = (state: GameState, reasonMsg: string): void => {
  state.roundOver = true;
  const newScores = state.scores.map((score, idx) => {
    const handCount = state.players[idx].hand.length;
    return score + handCount;
  });
  state.scores = newScores;
  state.message = reasonMsg;
  addLog(state, 'システム', `🏁 ${reasonMsg} ラウンド終了`);
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
