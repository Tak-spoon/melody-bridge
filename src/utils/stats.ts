import { Card, GameState, Meld } from '../types/game';
import { getChordSymbol, getChordInterpretation, getScaleInterpretation, tryAddCardToMeld, trySwapCardInMeld } from './musicTheory';
import { createDeck, getCombinations, getValidPonCombs, getValidChiiCombs } from './gameLogic';

export interface GameStats {
  totalRounds: number;
  wins: [number, number, number, number]; // [Player0, CPU1, CPU2, CPU3]
  draws: number;
  totalTurns: number;
  turnsList: number[]; // 各ラウンドの手数
  totalPenalties: [number, number, number, number]; // プレイヤー別累計失点
  meldsCount: {
    total: number;
    chord: number;
    scale: number;
    chordTypes: Record<string, number>; // "C": 15, "Am": 10, etc.
  };
  interruptsCount: {
    pon: number;
    chii: number;
  };
  playerActions: [
    { melds: number; adds: number; swaps: number; pon: number; chii: number; turns: number },
    { melds: number; adds: number; swaps: number; pon: number; chii: number; turns: number },
    { melds: number; adds: number; swaps: number; pon: number; chii: number; turns: number },
    { melds: number; adds: number; swaps: number; pon: number; chii: number; turns: number }
  ];
  lastUpdated: string;
}

const STATS_STORAGE_KEY = 'mb_game_statistics_v1';

export const getDefaultStats = (): GameStats => ({
  totalRounds: 0,
  wins: [0, 0, 0, 0],
  draws: 0,
  totalTurns: 0,
  turnsList: [],
  totalPenalties: [0, 0, 0, 0],
  meldsCount: {
    total: 0,
    chord: 0,
    scale: 0,
    chordTypes: {},
  },
  interruptsCount: {
    pon: 0,
    chii: 0,
  },
  playerActions: [
    { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 },
    { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 },
    { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 },
    { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 },
  ],
  lastUpdated: new Date().toISOString(),
});

/**
 * localStorageから統計データを読み込む
 */
export const loadStats = (): GameStats => {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return getDefaultStats();
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultStats(),
      ...parsed,
      meldsCount: {
        ...getDefaultStats().meldsCount,
        ...(parsed.meldsCount || {}),
        chordTypes: parsed.meldsCount?.chordTypes || {},
      },
      interruptsCount: {
        ...getDefaultStats().interruptsCount,
        ...(parsed.interruptsCount || {}),
      },
      playerActions: (parsed.playerActions || getDefaultStats().playerActions).map((act: any) => ({
        melds: act.melds || 0,
        adds: act.adds || 0,
        swaps: act.swaps || 0,
        pon: act.pon || 0,
        chii: act.chii || 0,
        turns: act.turns || 0,
      })) as GameStats['playerActions'],
    };
  } catch (e) {
    console.error('Failed to load stats:', e);
    return getDefaultStats();
  }
};

/**
 * 統計データをlocalStorageに保存
 */
export const saveStats = (stats: GameStats): void => {
  try {
    stats.lastUpdated = new Date().toISOString();
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
};

/**
 * 割り込み（ポン・チー）発生を記録
 */
export const recordInterrupt = (type: 'pon' | 'chii', currentStats: GameStats): GameStats => {
  const updated: GameStats = {
    ...currentStats,
    interruptsCount: {
      ...currentStats.interruptsCount,
      [type]: currentStats.interruptsCount[type] + 1,
    },
  };
  saveStats(updated);
  return updated;
};

/**
 * 統計データをリセット
 */
export const resetStats = (): GameStats => {
  const fresh = getDefaultStats();
  saveStats(fresh);
  return fresh;
};

/**
 * 実際のゲームラウンド終了時の結果を統計に記録
 */
export const recordGameRound = (
  state: GameState,
  currentStats: GameStats
): GameStats => {
  const defaultActions = { melds: 0, adds: 0, pon: 0, chii: 0 };
  const updated: GameStats = {
    ...currentStats,
    totalRounds: currentStats.totalRounds + 1,
    totalTurns: currentStats.totalTurns + state.actionCount,
    turnsList: [...currentStats.turnsList.slice(-199), state.actionCount], // 直近200件保持
    totalPenalties: [
      currentStats.totalPenalties[0] + state.players[0].hand.length,
      currentStats.totalPenalties[1] + state.players[1].hand.length,
      currentStats.totalPenalties[2] + state.players[2].hand.length,
      currentStats.totalPenalties[3] + state.players[3].hand.length,
    ],
    meldsCount: {
      ...currentStats.meldsCount,
      chordTypes: { ...currentStats.meldsCount.chordTypes },
    },
    interruptsCount: { ...currentStats.interruptsCount },
    playerActions: [
      {
        melds: (currentStats.playerActions?.[0]?.melds || 0) + (state.players[0]?.actions?.melds || 0),
        adds: (currentStats.playerActions?.[0]?.adds || 0) + (state.players[0]?.actions?.adds || 0),
        swaps: (currentStats.playerActions?.[0]?.swaps || 0) + (state.players[0]?.actions?.swaps || 0),
        pon: (currentStats.playerActions?.[0]?.pon || 0) + (state.players[0]?.actions?.pon || 0),
        chii: (currentStats.playerActions?.[0]?.chii || 0) + (state.players[0]?.actions?.chii || 0),
        turns: (currentStats.playerActions?.[0]?.turns || 0) + (state.players[0]?.actions?.turns || 0),
      },
      {
        melds: (currentStats.playerActions?.[1]?.melds || 0) + (state.players[1]?.actions?.melds || 0),
        adds: (currentStats.playerActions?.[1]?.adds || 0) + (state.players[1]?.actions?.adds || 0),
        swaps: (currentStats.playerActions?.[1]?.swaps || 0) + (state.players[1]?.actions?.swaps || 0),
        pon: (currentStats.playerActions?.[1]?.pon || 0) + (state.players[1]?.actions?.pon || 0),
        chii: (currentStats.playerActions?.[1]?.chii || 0) + (state.players[1]?.actions?.chii || 0),
        turns: (currentStats.playerActions?.[1]?.turns || 0) + (state.players[1]?.actions?.turns || 0),
      },
      {
        melds: (currentStats.playerActions?.[2]?.melds || 0) + (state.players[2]?.actions?.melds || 0),
        adds: (currentStats.playerActions?.[2]?.adds || 0) + (state.players[2]?.actions?.adds || 0),
        swaps: (currentStats.playerActions?.[2]?.swaps || 0) + (state.players[2]?.actions?.swaps || 0),
        pon: (currentStats.playerActions?.[2]?.pon || 0) + (state.players[2]?.actions?.pon || 0),
        chii: (currentStats.playerActions?.[2]?.chii || 0) + (state.players[2]?.actions?.chii || 0),
        turns: (currentStats.playerActions?.[2]?.turns || 0) + (state.players[2]?.actions?.turns || 0),
      },
      {
        melds: (currentStats.playerActions?.[3]?.melds || 0) + (state.players[3]?.actions?.melds || 0),
        adds: (currentStats.playerActions?.[3]?.adds || 0) + (state.players[3]?.actions?.adds || 0),
        swaps: (currentStats.playerActions?.[3]?.swaps || 0) + (state.players[3]?.actions?.swaps || 0),
        pon: (currentStats.playerActions?.[3]?.pon || 0) + (state.players[3]?.actions?.pon || 0),
        chii: (currentStats.playerActions?.[3]?.chii || 0) + (state.players[3]?.actions?.chii || 0),
        turns: (currentStats.playerActions?.[3]?.turns || 0) + (state.players[3]?.actions?.turns || 0),
      },
    ],
  };

  if (state.winner !== null) {
    updated.wins = [...updated.wins];
    updated.wins[state.winner] += 1;
  } else {
    updated.draws += 1;
  }

  // 場の役を集計
  for (const meld of state.field) {
    updated.meldsCount.total += 1;
    if (meld.type === 'chord') {
      updated.meldsCount.chord += 1;
      const symbol = getChordSymbol(meld.cards);
      updated.meldsCount.chordTypes[symbol] = (updated.meldsCount.chordTypes[symbol] || 0) + 1;
    } else if (meld.type === 'scale') {
      updated.meldsCount.scale += 1;
    }
  }

  saveStats(updated);
  return updated;
};

/**
 * バックグラウンドで高速一括シミュレーションを実行し、統計データを加算
 */
export const runBatchSimulation = (
  roundsCount: number,
  baseStats: GameStats
): GameStats => {
  const updated: GameStats = {
    ...baseStats,
    wins: [...baseStats.wins],
    turnsList: [...baseStats.turnsList],
    totalPenalties: [...baseStats.totalPenalties],
    meldsCount: {
      ...baseStats.meldsCount,
      chordTypes: { ...baseStats.meldsCount.chordTypes },
    },
    interruptsCount: { ...baseStats.interruptsCount },
    playerActions: [
      { ...(baseStats.playerActions?.[0] || { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }) },
      { ...(baseStats.playerActions?.[1] || { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }) },
      { ...(baseStats.playerActions?.[2] || { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }) },
      { ...(baseStats.playerActions?.[3] || { melds: 0, adds: 0, swaps: 0, pon: 0, chii: 0, turns: 0 }) },
    ],
  };

  const PLAYERS = 4;
  const HAND_SIZE = 7;

  for (let r = 0; r < roundsCount; r++) {
    const deck = createDeck(); // 56枚
    const hands: Card[][] = [[], [], [], []];
    const hasMeldedList: boolean[] = [false, false, false, false];
    const startPlayer = r % PLAYERS; // 本編ゲーム同様、P0 -> P1 -> P2 -> P3 と親が1局ごとに完全交代

    // 親から順番に1枚ずつ配牌
    for (let i = 0; i < HAND_SIZE * PLAYERS; i++) {
      const pIdx = (startPlayer + i) % PLAYERS;
      hands[pIdx].push(deck.pop()!);
    }

    const field: Meld[] = [];
    let turn = startPlayer; // 親からスタート
    let totalTurns = 0;
    let roundWinner: number | null = null;
    const MAX_TURNS = 200;

    while (totalTurns < MAX_TURNS) {
      const hand = hands[turn];
      updated.playerActions[turn].turns += 1; // 手番回数（巡数）を加算

      // ドロー
      if (deck.length > 0) {
        hand.push(deck.pop()!);
      }

      // 役出し
      let melded = true;
      while (melded) {
        melded = false;
        for (let size = Math.min(hand.length, 5); size >= 3; size--) {
          if (hand.length < size) continue;
          const combs = getCombinations(hand, size);
          for (const comb of combs) {
            const scaleSeq = getScaleInterpretation(comb);
            if (scaleSeq) {
              field.push({ id: `sim_m_${field.length}`, ownerId: turn, type: 'scale', cards: scaleSeq });
              updated.meldsCount.total += 1;
              updated.meldsCount.scale += 1;
              updated.playerActions[turn].melds += 1;
              hasMeldedList[turn] = true;
              for (const c of comb) {
                const idx = hand.findIndex(h => h.id === c.id);
                if (idx !== -1) hand.splice(idx, 1);
              }
              melded = true;
              break;
            }
            if (size <= 4) {
              const chordSeq = getChordInterpretation(comb);
              if (chordSeq) {
                field.push({ id: `sim_m_${field.length}`, ownerId: turn, type: 'chord', cards: chordSeq });
                updated.meldsCount.total += 1;
                updated.meldsCount.chord += 1;
                updated.playerActions[turn].melds += 1;
                hasMeldedList[turn] = true;
                const sym = getChordSymbol(chordSeq);
                updated.meldsCount.chordTypes[sym] = (updated.meldsCount.chordTypes[sym] || 0) + 1;
                for (const c of comb) {
                  const idx = hand.findIndex(h => h.id === c.id);
                  if (idx !== -1) hand.splice(idx, 1);
                }
                melded = true;
                break;
              }
            }
          }
          if (melded) break;
        }
      }

      if (hand.length === 0) {
        roundWinner = turn;
        break;
      }

      // 付け札
      let added = true;
      while (added) {
        added = false;
        for (let ci = hand.length - 1; ci >= 0; ci--) {
          for (const meld of field) {
            const newSeq = tryAddCardToMeld(hand[ci], meld);
            if (newSeq) {
              meld.cards = newSeq;
              hand.splice(ci, 1);
              updated.playerActions[turn].adds += 1;
              added = true;
              break;
            }
          }
          if (added) break;
        }
      }

      if (hand.length === 0) {
        roundWinner = turn;
        break;
      }

      // スワップ（本編同様：役出し前でも使用可能、手札2枚以下のリーチ時は不可、1手番1回）
      if (hand.length > 2 && deck.length > 0) {
        for (let ci = 0; ci < hand.length; ci++) {
          let swapped = false;
          for (const meld of field) {
            if (meld.type === 'chord') {
              const swapResult = trySwapCardInMeld(hand[ci], meld);
              if (swapResult) {
                // 手札を入れ替え
                hand.splice(ci, 1, swapResult.replacedCard);
                meld.cards = swapResult.newSequence;
                updated.playerActions[turn].swaps += 1;
                swapped = true;
                break;
              }
            }
          }
          if (swapped) break;
        }
      }

      // 捨て札
      const discardIdx = Math.floor(Math.random() * hand.length);
      const discardedCard = hand.splice(discardIdx, 1)[0];
      if (hand.length === 0) {
        roundWinner = turn;
        break;
      }

      const discarderId = turn;
      const nextPlayer = (discarderId + 1) % PLAYERS;
      let interrupted = false;

      // ポン判定（誰からでも）
      for (let i = 1; i < 4; i++) {
        const pId = (discarderId + i) % PLAYERS;
        if (hands[pId].length <= 2) continue; // 鳴きアガリ禁止（手札2枚時は鳴けない）

        const ponCombs = getValidPonCombs(hands[pId], discardedCard);
        if (ponCombs.length > 0) {
          const pairIds = ponCombs[0];
          const pairObjs = hands[pId].filter(c => pairIds.includes(c.id));
          const testCards = [discardedCard, ...pairObjs];
          const chordSeq = getChordInterpretation(testCards);
          if (chordSeq) {
            field.push({ id: `sim_m_${field.length}`, ownerId: pId, type: 'chord', cards: chordSeq });
            updated.meldsCount.total += 1;
            updated.meldsCount.chord += 1;
            const sym = getChordSymbol(chordSeq);
            updated.meldsCount.chordTypes[sym] = (updated.meldsCount.chordTypes[sym] || 0) + 1;
            updated.interruptsCount.pon += 1;
            updated.playerActions[pId].pon += 1;
            hasMeldedList[pId] = true;

            for (const c of pairObjs) {
              const idx = hands[pId].findIndex(h => h.id === c.id);
              if (idx !== -1) hands[pId].splice(idx, 1);
            }

            // ポン後捨て札
            const di = Math.floor(Math.random() * hands[pId].length);
            hands[pId].splice(di, 1);
            if (hands[pId].length === 0) {
              roundWinner = pId;
              interrupted = true;
              break;
            }

            turn = (pId + 1) % PLAYERS;
            totalTurns++;
            interrupted = true;
            break;
          }
        }
      }

      if (roundWinner !== null) break;

      // チー判定（上家のみ）
      if (!interrupted && hands[nextPlayer].length > 2) {
        const chiiCombs = getValidChiiCombs(hands[nextPlayer], discardedCard);
        if (chiiCombs.length > 0) {
          const pairIds = chiiCombs[0];
          const pairObjs = hands[nextPlayer].filter(c => pairIds.includes(c.id));
          const testCards = [discardedCard, ...pairObjs];
          const scaleSeq = getScaleInterpretation(testCards);
          if (scaleSeq) {
            field.push({ id: `sim_m_${field.length}`, ownerId: nextPlayer, type: 'scale', cards: scaleSeq });
            updated.meldsCount.total += 1;
            updated.meldsCount.scale += 1;
            updated.interruptsCount.chii += 1;
            updated.playerActions[nextPlayer].chii += 1;
            hasMeldedList[nextPlayer] = true;

            for (const c of pairObjs) {
              const idx = hands[nextPlayer].findIndex(h => h.id === c.id);
              if (idx !== -1) hands[nextPlayer].splice(idx, 1);
            }

            const di = Math.floor(Math.random() * hands[nextPlayer].length);
            hands[nextPlayer].splice(di, 1);
            if (hands[nextPlayer].length === 0) {
              roundWinner = nextPlayer;
              break;
            }

            turn = (nextPlayer + 1) % PLAYERS;
            totalTurns++;
            interrupted = true;
          }
        }
      }

      if (roundWinner !== null) break;

      if (!interrupted) {
        if (deck.length === 0) break; // 流局
        turn = (turn + 1) % PLAYERS;
      }

      totalTurns++;
    }

    // 1ラウンドの結果を集計
    updated.totalRounds += 1;
    updated.totalTurns += totalTurns;
    updated.turnsList.push(totalTurns);
    if (updated.turnsList.length > 200) updated.turnsList.shift();

    for (let p = 0; p < 4; p++) {
      updated.totalPenalties[p] += hands[p].length;
    }

    if (roundWinner !== null) {
      updated.wins[roundWinner] += 1;
    } else {
      updated.draws += 1;
    }
  }

  saveStats(updated);
  return updated;
};
