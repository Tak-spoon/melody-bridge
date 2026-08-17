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
  for (let start = 0; start <= 20; start++) {
    if (start + length - 1 <= 20) {
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
  for (let start = 0; start <= 20; start++) {
    if (length === 3) {
      if (start + 4 <= 20) targets.push([start, start + 2, start + 4]); 
      if (start + 5 <= 20) {
        targets.push([start, start + 2, start + 5]); 
        targets.push([start, start + 3, start + 5]); 
      }
    } else if (length === 4) {
      if (start + 6 <= 20) targets.push([start, start + 2, start + 4, start + 6]); 
      if (start + 5 <= 20) {
        targets.push([start, start + 2, start + 4, start + 5]); 
        targets.push([start, start + 2, start + 3, start + 5]); 
        targets.push([start, start + 1, start + 3, start + 5]); 
      }
    }
  }
  return targets;
};

/**
 * カード群が目標パターン（ターゲット）と一致しているか（同じ色かつ音の値が一致）
 */
export const isMatchTarget = (cards: Card[], target: number[]): boolean => {
  if (cards.length === 0) return false;
  const firstSuit = cards[0].suit;
  if (!cards.every(c => c.suit === firstSuit)) return false;
  
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
        interpretedAbsVal: targetVal,
        suit: found.suit
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
  const meldSuit = currentCards[0].suit;

  if (cardObj.suit !== meldSuit) return null;

  const newLength = currentCards.length + 1;
  if (meld.type === 'chord' && newLength > 4) return null;
  
  const fixedCurrentCards: Card[] = currentCards.map(c => ({
    id: c.id,
    val: c.val,
    oct: c.oct,
    absVal: c.interpretedAbsVal ?? c.absVal,
    suit: c.suit,
    interpretedAbsVal: c.interpretedAbsVal
  }));
  
  const testCards = [...fixedCurrentCards, { ...cardObj, suit: meldSuit }];

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
