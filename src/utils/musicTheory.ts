import { Card, Meld, MeldType } from '../types/game';
import { NOTE_NAMES } from '../constants/music';

/**
 * 構成音からコードネーム（和音記号：例 C, Am, G7, FM7など）を判定します。
 */
export const getChordSymbol = (cards: Card[]): string => {
  if (!cards || cards.length < 3) return 'Chord';
  
  // 白鍵の音程番号（0:C, 1:D, 2:E, 3:F, 4:G, 5:A, 6:B）を半音数（0〜11）に変換
  const noteToSemi = (absVal: number) => {
    const note = absVal % 7;
    return [0, 2, 4, 5, 7, 9, 11][note];
  };

  const sortedCards = [...cards].sort((a, b) => (a.interpretedAbsVal ?? a.absVal) - (b.interpretedAbsVal ?? b.absVal));
  const pitchClasses = sortedCards.map(c => (c.interpretedAbsVal ?? c.absVal) % 7);
  const uniquePitches = [...new Set(pitchClasses)];

  let rootNoteIndex = pitchClasses[0];
  let found = false;

  // 4和音の場合、ルート音（根音）を探索
  if (cards.length === 4) {
    for (const r of uniquePitches) {
      const third = (r + 2) % 7;
      const fifth = (r + 4) % 7;
      const seventh = (r + 6) % 7;
      if (uniquePitches.includes(third) && uniquePitches.includes(fifth) && uniquePitches.includes(seventh)) {
        rootNoteIndex = r;
        found = true;
        break;
      }
    }
  }

  // 3和音の場合、ルート音を探索
  if (!found) {
    for (const r of uniquePitches) {
      const third = (r + 2) % 7;
      const fifth = (r + 4) % 7;
      if (uniquePitches.includes(third) && uniquePitches.includes(fifth)) {
        rootNoteIndex = r;
        found = true;
        break;
      }
    }
  }

  if (!found) {
    rootNoteIndex = pitchClasses[0];
  }

  const rootNoteName = NOTE_NAMES[rootNoteIndex];
  const rootSemi = noteToSemi(rootNoteIndex);
  const semiClasses = sortedCards.map(c => noteToSemi(c.interpretedAbsVal ?? c.absVal));
  const intervalsFromRoot = semiClasses.map(s => (s - rootSemi + 12) % 12).sort((a, b) => a - b);
  
  const hasMajor3rd = intervalsFromRoot.includes(4);
  const hasMinor3rd = intervalsFromRoot.includes(3);
  const hasPerf5th  = intervalsFromRoot.includes(7);
  const hasDim5th   = intervalsFromRoot.includes(6);
  const hasAug5th   = intervalsFromRoot.includes(8);
  const hasMajor6th = intervalsFromRoot.includes(9);
  const hasMin7th   = intervalsFromRoot.includes(10);
  const hasMaj7th   = intervalsFromRoot.includes(11);

  let quality = '';
  if (cards.length === 3) {
    if (hasMinor3rd && hasPerf5th) quality = 'm';
    else if (hasMinor3rd && hasDim5th) quality = 'dim';
    else if (hasMajor3rd && hasPerf5th) quality = '';
    else if (hasMajor3rd && hasAug5th) quality = 'aug';
    else if (hasMinor3rd) quality = 'm';
  } else if (cards.length === 4) {
    if (hasMajor3rd && hasPerf5th && hasMaj7th) quality = 'M7';
    else if (hasMajor3rd && hasPerf5th && hasMin7th) quality = '7';
    else if (hasMinor3rd && hasPerf5th && hasMin7th) quality = 'm7';
    else if (hasMinor3rd && hasDim5th && hasMin7th) quality = 'm7(♭5)';
    else if (hasMajor3rd && hasPerf5th && hasMajor6th) quality = '6';
    else if (hasMinor3rd && hasPerf5th && hasMajor6th) quality = 'm6';
    else if (hasMinor3rd) quality = 'm7';
    else quality = '7';
  }

  return `${rootNoteName}${quality}`;
};

/**
 * 指定した長さのスケール（連番）の有効パターンを生成
 */
export const generateValidScaleTargets = (length: number): number[][] => {
  const targets: number[][] = [];
  for (let start = 0; start <= 27; start++) {
    if (start + length - 1 <= 27) {
      const target: number[] = [];
      for (let i = 0; i < length; i++) target.push(start + i);
      targets.push(target);
    }
  }
  return targets;
};

/**
 * 指定した長さのコード（和音：基本形・転回形）の有効パターンを生成（1オクターブ以内のクローズドボイシング）
 */
export const generateValidChordTargets = (length: number): number[][] => {
  const targets: number[][] = [];
  for (let start = 0; start <= 27; start++) {
    if (length === 3) {
      if (start + 4 <= 27) targets.push([start, start + 2, start + 4]); 
      if (start + 5 <= 27) {
        targets.push([start, start + 2, start + 5]); 
        targets.push([start, start + 3, start + 5]); 
      }
    } else if (length === 4) {
      if (start + 6 <= 27) targets.push([start, start + 2, start + 4, start + 6]); 
      if (start + 5 <= 27) {
        targets.push([start, start + 2, start + 4, start + 5]); 
        targets.push([start, start + 2, start + 3, start + 5]); 
        targets.push([start, start + 1, start + 3, start + 5]); 
      }
    }
  }
  return targets;
};

/**
 * カード群が目標パターン（ターゲット）と一致しているか（音の値が一致、同一absVal重複なし）
 */
export const isMatchTarget = (cards: Card[], target: number[]): boolean => {
  if (cards.length === 0) return false;
  
  const normalVals = cards.map(c => c.absVal);
  const used = new Set<number>();
  for (const n of normalVals) {
    if (!target.includes(n)) return false;
    if (used.has(n)) return false; 
    used.add(n);
  }
  return true; 
};

/**
 * ターゲットの並び順に従って解釈されたカード配列を構築
 */
export const buildInterpretedSequence = (cardObjs: Card[], targetSeq: number[]): Card[] => {
  const result: Card[] = [];
  const usedIds = new Set<string>();

  for (const targetVal of targetSeq) {
    const found = cardObjs.find(c => c.absVal === targetVal && !usedIds.has(c.id));
    if (found) {
      usedIds.add(found.id);
      result.push({ 
        ...found, 
        interpretedAbsVal: targetVal
      });
    }
  }
  return result;
};

/**
 * カード群が特定のタイプ（scale または chord）の有効な役になっているかを判定し、並び替え済みカード配列を返します。
 */
export const getInterpretation = (cardObjs: Card[], type: MeldType): Card[] | null => {
  const length = cardObjs.length;
  if (type === 'chord' && length > 4) return null;
  const targets = type === 'scale' ? generateValidScaleTargets(length) : generateValidChordTargets(length);
  for (const target of targets) {
    if (isMatchTarget(cardObjs, target)) {
      return buildInterpretedSequence(cardObjs, target);
    }
  }
  return null;
};

export const getScaleInterpretation = (cardObjs: Card[]): Card[] | null => getInterpretation(cardObjs, 'scale');
export const getChordInterpretation = (cardObjs: Card[]): Card[] | null => getInterpretation(cardObjs, 'chord');

/**
 * すでに場にあるセット（Meld）に手札のカード1枚を「付け札」できるかを判定します。
 * 成功した場合は新しいカード配列を返し、できない場合は null を返します。
 */
export const tryAddCardToMeld = (cardObj: Card, meld: Meld): Card[] | null => {
  const currentCards = meld.cards;

  const newLength = currentCards.length + 1;
  if (meld.type === 'chord' && newLength > 4) return null;
  
  const fixedCurrentCards: Card[] = currentCards.map(c => ({
    id: c.id,
    val: c.val,
    oct: c.oct,
    absVal: c.interpretedAbsVal ?? c.absVal,
    interpretedAbsVal: c.interpretedAbsVal
  }));
  
  const testCards = [...fixedCurrentCards, { ...cardObj }];

  // 同一absValの重複チェック
  const absVals = testCards.map(c => c.absVal);
  if (new Set(absVals).size !== absVals.length) return null;

  if (meld.type === 'scale') {
    const targets = generateValidScaleTargets(newLength);
    for (const target of targets) {
      if (isMatchTarget(testCards, target)) {
        return buildInterpretedSequence(testCards, target);
      }
    }
  } else {
    const targets = generateValidChordTargets(newLength);
    for (const target of targets) {
      if (isMatchTarget(testCards, target)) {
        return buildInterpretedSequence(testCards, target);
      }
    }
  }
  return null;
};

export interface SwapResult {
  replacedCard: Card;       // 場から回収されて手札に戻るカード
  newSequence: Card[];      // 入れ替え後の新しい場のセット構成
  newSymbol: string;        // 新しいコード名（例: "Am", "C"）
}

/**
 * 場のセット内の1枚を手札のカードと入れ替え（スワップ・リハーモナイズ）できるかを判定します。
 * 和音（コード）セットを対象とし、入れ替え後も正しい和音になる場合に成立します。
 */
export const trySwapCardInMeld = (handCard: Card, meld: Meld): SwapResult | null => {
  if (meld.type !== 'chord' || meld.cards.length < 3) return null;

  // 場の各カードを順番に入れ替え候補としてテスト
  for (let i = 0; i < meld.cards.length; i++) {
    const targetMeldCard = meld.cards[i];
    // 同一カード（または同一音高）ならスキップ
    if (targetMeldCard.id === handCard.id || targetMeldCard.absVal === handCard.absVal) continue;

    // targetMeldCard を handCard に差し替えたテスト配列を作成
    const testCards = meld.cards.map((c, idx) => idx === i ? { ...handCard } : { ...c });

    // 和音として成立するかチェック
    const newSequence = getChordInterpretation(testCards);
    if (newSequence) {
      const newSymbol = getChordSymbol(newSequence);
      return {
        replacedCard: targetMeldCard,
        newSequence,
        newSymbol
      };
    }
  }

  return null;
};

export interface ConnectionAssistResult {
  readyToMeldIds: Set<string>; // 🥇 今の手札で3枚役が即完成するカード（グリーン光）
  twoCardPairIds: Set<string>; // 🥈 あと1枚で役になる2枚ペア（パープル光）
}

/**
 * 選択中のカード群に対して、
 * 1. 今の手札で3枚役が即完成するカード（readyToMeldIds: グリーン）
 * 2. あと1枚で役になる相性の良い2枚ペア（twoCardPairIds: パープル）
 * を区別して判定・抽出します。
 */
export const analyzeHandConnections = (
  selectedCards: Card[],
  unselectedCards: Card[]
): ConnectionAssistResult => {
  const readyToMeldIds = new Set<string>();
  const twoCardPairIds = new Set<string>();

  if (selectedCards.length === 0 || selectedCards.length >= 3) {
    return { readyToMeldIds, twoCardPairIds };
  }

  // 2枚選択時：
  if (selectedCards.length === 2) {
    unselectedCards.forEach(candidate => {
      const testCards = [...selectedCards, candidate];
      if (getChordInterpretation(testCards) !== null || getScaleInterpretation(testCards) !== null) {
        readyToMeldIds.add(candidate.id); // 3枚目として役が即完成！
      }
    });
    return { readyToMeldIds, twoCardPairIds };
  }

  // 1枚選択時（cardA）：
  if (selectedCards.length === 1) {
    const cardA = selectedCards[0];

    // 1. 今の手札の中で実際に3枚役（コード・スケール）を組めるペアを探す ➔ readyToMeldIds
    for (let i = 0; i < unselectedCards.length; i++) {
      for (let j = i + 1; j < unselectedCards.length; j++) {
        const cardB = unselectedCards[i];
        const cardC = unselectedCards[j];
        const testCards = [cardA, cardB, cardC];

        if (getChordInterpretation(testCards) !== null || getScaleInterpretation(testCards) !== null) {
          readyToMeldIds.add(cardB.id);
          readyToMeldIds.add(cardC.id);
        }
      }
    }

    // 2. 2枚ペア（あと1枚引けば役になる相性の良い近隣カード）を探す ➔ twoCardPairIds
    const DIATONIC_CHORD_NOTE_SETS = [
      [0, 2, 4], // C
      [1, 3, 5], // Dm
      [2, 4, 6], // Em
      [3, 5, 0], // F
      [4, 6, 1], // G
      [5, 0, 2], // Am
      [6, 1, 3], // Bdim
    ];

    const n1 = cardA.absVal % 7;

    unselectedCards.forEach(candidate => {
      if (readyToMeldIds.has(candidate.id)) return;

      const n2 = candidate.absVal % 7;
      const absDiff = Math.abs(cardA.absVal - candidate.absVal);

      // 近隣オクターブ（音高差が1オクターブ以内: absDiff <= 7）での相性をチェック
      if (absDiff <= 7) {
        // スケール2音ペア（隣接音または1音空き）
        const isScalePair = absDiff === 1 || absDiff === 2;

        // コード2音ペア（同じダイアトニック和音に含まれる音程）
        const isChordPair = (absDiff === 2 || absDiff === 4 || absDiff === 3 || absDiff === 5) &&
          DIATONIC_CHORD_NOTE_SETS.some(chord => chord.includes(n1) && chord.includes(n2));

        if (isScalePair || isChordPair) {
          twoCardPairIds.add(candidate.id);
        }
      }
    });
  }

  return { readyToMeldIds, twoCardPairIds };
};

// 互換性のためのエイリアス
export const getConnectedCandidateCardIds = (
  selectedCards: Card[],
  unselectedCards: Card[]
): Set<string> => {
  const { readyToMeldIds, twoCardPairIds } = analyzeHandConnections(selectedCards, unselectedCards);
  return new Set([...readyToMeldIds, ...twoCardPairIds]);
};


