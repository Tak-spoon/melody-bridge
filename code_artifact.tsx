import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Info, ChevronRight, Music, AlertCircle, History, Terminal, Layers, Trophy, User, Cpu, BookOpen } from 'lucide-react';

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTE_JP = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'];

const SUITS = [
  { id: 'red', color: 'border-red-500 bg-red-50 text-red-900 ring-red-400' },
  { id: 'blue', color: 'border-blue-500 bg-blue-50 text-blue-900 ring-blue-400' }
];

const FREQUENCIES = [
  130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 
  261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 
  523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77  
];

const RULES = [
  {
    title: "1. ゲームの目的とカード構成",
    content: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>「メロディ・ブリッジ」は、音楽のコード（和音）やスケール（音階）を作って手札を減らしていく、麻雀やラミーに似たカードゲームです。</p>
        
        <p><strong>【カードの構成】</strong></p>
        <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          1オクターブはピアノの白鍵（ドレミファソラシ）の7音のみで構成されています。<br/>
          「7音 × C3〜B5の3オクターブ × 赤青2色」＝ <strong className="text-blue-700">計42枚</strong> のカードを使用します。
        </p>
      </div>
    )
  },
  {
    title: "2. 基本ルール",
    content: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p><strong>【ゲームの進行】</strong></p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>プレイヤーは4人（あなたとCPU3人）。</li>
          <li>各プレイヤーに最初に7枚のカードが配られます。</li>
          <li>ゲーム開始時、山札の上から2枚が裏向きで捨てられ、残りの山札は12枚からスタートします。</li>
          <li>自分のターンに山札から1枚引き、役（セット）を作って場に出すか、不要なカードを1枚捨てます。</li>
          <li>全4ラウンドを行い、手札の残り枚数が少ない（失点が少ない）人が総合優勝となります。</li>
        </ul>
      </div>
    )
  },
  {
    title: "3. ラウンドと勝敗",
    content: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p><strong>【ラウンドの終了条件】</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>誰かの手札が0枚になった時（アガリ）</li>
          <li><strong className="text-red-600">0枚になった山札を引こうとした時（流局）</strong></li>
        </ul>
        
        <div className="mt-3">
          <p><strong>【ポイント（スコア）計算】</strong></p>
          <p className="mt-1">ラウンド終了時、手札に残っているカードの枚数がそのまま「ペナルティポイント」として加算されます（アガった人は0ポイント）。</p>
        </div>

        <div className="mt-3 bg-blue-50 p-2 rounded-lg border border-blue-200">
          <p className="font-bold text-blue-800 text-center">
            全4ラウンド終了時、合計ポイントが<br/>一番少ない（0に近い）人の優勝！
          </p>
        </div>
      </div>
    )
  },
  {
    title: "4. セット（役）の作り方",
    content: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>場に出せる「セット」には2種類あります。<strong>必ず同じ色（赤のみ、青のみ）で揃える必要があります。</strong></p>
        
        <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <p className="font-black text-rose-800 text-[13px] mb-1">♪ コード（和音）</p>
          <p>音楽理論における和音（3〜4音）の構成音を揃えます。順番はバラバラ（転回形）でも構いません。</p>
          <p className="text-[10px] text-red-600 font-bold mt-1">※コードのボイシングは、クローズドボイシング（1オクターブ以内におさまる形）のみ対応しています。</p>
          <p className="text-[10px] text-rose-600 mt-0.5">例：ド・ミ・ソ (C) / ミ・ソ・シ・ド (CM7の転回形)</p>
        </div>
        
        <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
          <p className="font-black text-indigo-800 text-[13px] mb-1">➡ スケール（音階）</p>
          <p>音階順に連続する3枚以上のカードを揃えます。</p>
          <p className="text-[10px] text-indigo-600 mt-1">例：ド・レ・ミ / ソ・ラ・シ・ド など</p>
        </div>
      </div>
    )
  },
  {
    title: "5. ターンの行動",
    content: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>自分のターンが来たら、以下の順序で行動します。</p>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-blue-700">ドロー：</strong><br/>
            山札から1枚引きます。
          </li>
          <li>
            <strong className="text-blue-700">アクション（任意）：</strong><br/>
            手札から完成した3枚以上のセットを場に出せます。<br/>
            また、すでに場に出ているセットに手札から1枚追加する<strong>「付け札」</strong>も可能です。<br/>
            条件を満たす限り、<strong className="text-emerald-700">同じ手番中に何度でも</strong>付け札ができます。
            <ul className="list-disc pl-4 mt-1 text-[11px] text-slate-600">
              <li><strong>コードへの付け札：</strong> 構成音として成立する最大4音まで。</li>
              <li><strong>スケールへの付け札：</strong> 連番（2度）で繋がるのであれば枚数制限なし。</li>
            </ul>
          </li>
          <li>
            <strong className="text-blue-700">捨てる：</strong><br/>
            手札から不要なカードを1枚選んで捨て、ターンを終了します。
          </li>
        </ol>
      </div>
    )
  },
  {
    title: "6. 割り込み（ポン・チー）",
    content: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>他人がカードを捨てた瞬間、自分のターンでなくてもそのカードをもらってセットを作ることができます。</p>
        
        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
          <strong className="text-red-600">【重要】割り込みで作れるのは「3枚1組」のみ</strong><br/>
          手札から一度に同時に出せるのは<strong>2枚まで</strong>です（捨て札1枚＋手札2枚＝計3枚）。いきなり4枚組（麻雀のカンに相当）は作れません。<br/>
          <span className="text-slate-500 mt-1 block">例：手札に「ド・ミ・ソ」がある時、他人の捨て札「シ」に対して手札3枚をすべて出し、一気に4和音を作ることは不可。「ミ・ソ」の2枚を出して「ミ・ソ・シ」の3和音を作ることは可能です。</span>
        </div>

        <ul className="list-disc pl-5 space-y-1.5 mt-2">
          <li>
            <strong className="text-rose-600">ポン（コード作成）：</strong><br/>
            誰の捨て札からでも可能です。捨て札＋自分の手札2枚で「コード」が作れる場合に割り込めます。
          </li>
          <li>
            <strong className="text-indigo-600">チー（スケール作成）：</strong><br/>
            <strong>直前の順番の人</strong>の捨て札からのみ可能です。捨て札＋手札2枚で「スケール」が作れる場合に割り込めます。
          </li>
        </ul>
      </div>
    )
  }
];

const getChordSymbol = (cards) => {
  if (!cards || cards.length < 3) return 'Chord';
  
  const noteToSemi = (absVal) => {
    const note = absVal % 7;
    return [0, 2, 4, 5, 7, 9, 11][note];
  };

  const sortedCards = [...cards].sort((a, b) => a.interpretedAbsVal - b.interpretedAbsVal);
  const pitchClasses = sortedCards.map(c => c.interpretedAbsVal % 7);
  const uniquePitches = [...new Set(pitchClasses)];

  let rootNoteIndex = pitchClasses[0];
  let found = false;

  if (cards.length === 4) {
    for (let r of uniquePitches) {
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

  if (!found) {
    for (let r of uniquePitches) {
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
  const semiClasses = sortedCards.map(c => noteToSemi(c.interpretedAbsVal));
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

const generateValidScaleTargets = (length) => {
  const targets = [];
  for (let start = 0; start <= 20; start++) {
    if (start + length - 1 <= 20) {
      const target = [];
      for(let i=0; i<length; i++) target.push(start + i);
      targets.push(target);
    }
  }
  return targets;
};

const generateValidChordTargets = (length) => {
  const targets = [];
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

const isMatchTarget = (cards, target) => {
  const firstSuit = cards[0].suit;
  if (!cards.every(c => c.suit === firstSuit)) return false;
  
  const normalVals = cards.map(c => c.absVal);
  const used = new Set();
  for (let n of normalVals) {
    if (!target.includes(n)) return false;
    if (used.has(n)) return false; 
    used.add(n);
  }
  return true; 
};

const buildInterpretedSequence = (cardObjs, targetSeq) => {
  let result = [];
  let usedIds = new Set();

  for (let targetVal of targetSeq) {
    let found = cardObjs.find(c => c.absVal === targetVal && !usedIds.has(c.id));
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

const getInterpretation = (cardObjs, type) => {
  const length = cardObjs.length;
  if (type === 'chord' && length > 4) return null;
  const targets = type === 'scale' ? generateValidScaleTargets(length) : generateValidChordTargets(length);
  for (let target of targets) {
    if (isMatchTarget(cardObjs, target)) {
      return buildInterpretedSequence(cardObjs, target);
    }
  }
  return null;
};

const getScaleInterpretation = (cardObjs) => getInterpretation(cardObjs, 'scale');
const getChordInterpretation = (cardObjs) => getInterpretation(cardObjs, 'chord');

const tryAddCardToMeld = (cardObj, meld) => {
  const currentCards = meld.cards;
  const meldSuit = currentCards[0].suit;

  if (cardObj.suit !== meldSuit) return null;

  const newLength = currentCards.length + 1;
  if (meld.type === 'chord' && newLength > 4) return null;
  
  const fixedCurrentCards = currentCards.map(c => ({
    id: c.id, absVal: c.interpretedAbsVal, suit: c.suit, original: c
  }));
  
  const testCards = [...fixedCurrentCards, { ...cardObj, original: cardObj, suit: meldSuit }];

  if (meld.type === 'scale') {
    const targets = generateValidScaleTargets(newLength);
    for (let target of targets) {
      if (isMatchTarget(testCards, target)) {
        const newSeq = buildInterpretedSequence(testCards, target);
        return newSeq.map(ns => ({
          ...ns.original, interpretedAbsVal: ns.interpretedAbsVal, suit: meldSuit
        }));
      }
    }
  } else {
    const targets = generateValidChordTargets(newLength);
    for (let target of targets) {
      if (isMatchTarget(testCards, target)) {
        const newSeq = buildInterpretedSequence(testCards, target);
        return newSeq.map(ns => ({
          ...ns.original, interpretedAbsVal: ns.interpretedAbsVal, suit: meldSuit
        }));
      }
    }
  }
  return null;
};

const getCombinations = (array, size) => {
  const result = [];
  const p = (t, i) => {
    if (t.length === size) { result.push(t); return; }
    if (i + 1 > array.length) return;
    p([...t, array[i]], i + 1);
    p(t, i + 1);
  };
  p([], 0);
  return result;
};

const getValidPonCombs = (hand, discardedCard) => {
  const combs = getCombinations(hand, 2);
  const valid = [];
  for (let comb of combs) {
    const testCards = [discardedCard, ...comb];
    const seq = getChordInterpretation(testCards);
    if (seq) valid.push(comb.map(c => c.id));
  }
  return valid;
};

const getValidChiiCombs = (hand, discardedCard) => {
  const combs = getCombinations(hand, 2);
  const valid = [];
  for (let comb of combs) {
    const testCards = [discardedCard, ...comb];
    const seq = getScaleInterpretation(testCards);
    if (seq) valid.push(comb.map(c => c.id));
  }
  return valid;
};

const checkInterrupts = (state, discarderId, discardedCard) => {
  let candidates = [];
  const nextPlayerId = (discarderId + 1) % 4;

  for (let i = 1; i < 4; i++) {
    const pId = (discarderId + i) % 4;
    const hand = state.players[pId].hand;
    let actions = [];
    
    const ponCombs = getValidPonCombs(hand, discardedCard);
    if (ponCombs.length > 0) actions.push({ type: 'pon', validCombs: ponCombs });
    
    if (pId === nextPlayerId) {
      const chiiCombs = getValidChiiCombs(hand, discardedCard);
      if (chiiCombs.length > 0) actions.push({ type: 'chii', validCombs: chiiCombs });
    }
    
    if (actions.length > 0) candidates.push({ playerId: pId, actions });
  }
  
  candidates.sort((a, b) => {
    const aHasPon = a.actions.some(x => x.type === 'pon');
    const bHasPon = b.actions.some(x => x.type === 'pon');
    if (aHasPon && !bHasPon) return -1;
    if (!aHasPon && bHasPon) return 1;
    return 0;
  });

  return candidates;
};

const createDeck = () => {
  let deck = [];
  let idCounter = 0;
  
  for (let absVal = 0; absVal < 21; absVal++) {
    const oct = Math.floor(absVal / 7) + 3;
    const val = absVal % 7;
    deck.push({ id: `c_${idCounter++}`, val, oct, absVal, suit: 'red' });
    deck.push({ id: `c_${idCounter++}`, val, oct, absVal, suit: 'blue' });
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const sortHand = (hand) => {
  return [...hand].sort((a, b) => {
    if (a.suit === 'red' && b.suit === 'blue') return -1;
    if (a.suit === 'blue' && b.suit === 'red') return 1;
    return a.absVal - b.absVal;
  });
};

const setupRound = (scores = [0, 0, 0, 0], roundNum = 1) => {
  let deck = createDeck();
  const players = [
    { id: 0, name: 'あなた', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: false },
    { id: 1, name: 'CPU 1', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true },
    { id: 2, name: 'CPU 2', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true },
    { id: 3, name: 'CPU 3', hand: [], hasMelded: false, justDrawnCardId: null, isCPU: true },
  ];
  for (let i = 0; i < 7; i++) players.forEach(p => p.hand.push(deck.pop()));
  
  players[0].hand = sortHand(players[0].hand);

  const hidden1 = deck.pop();
  const hidden2 = deck.pop();
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

export default function App() {
  const [gameState, setGameState] = useState(setupRound());
  const [selectedHand, setSelectedHand] = useState([]);
  const [selectedMeld, setSelectedMeld] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [rulePage, setRulePage] = useState(0);
  const [audioCtx, setAudioCtx] = useState(null);
  
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (showLogModal && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [showLogModal, gameState.logs]);

  const initAudio = () => {
    if (!audioCtx) setAudioCtx(new (window.AudioContext || window.webkitAudioContext)());
  };

  const playMelody = useCallback((absVals) => {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    absVals.forEach((absVal, i) => {
      if (absVal < 0 || absVal > 20) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = FREQUENCIES[absVal];
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      osc.start(now + i * 0.15);
      gainNode.gain.setValueAtTime(0, now + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.stop(now + i * 0.15 + 0.5);
    });
  }, [audioCtx]);

  const addLog = (state, playerName, text) => {
    if (!state.logs) state.logs = [];
    const entry = { player: playerName, text };
    state.logs = [...state.logs.slice(-49), entry];
  };

  const finishRound = (state, reasonMsg) => {
    state.roundOver = true;
    const newScores = state.scores.map((score, idx) => {
      const handCount = state.players[idx].hand.length;
      return score + handCount;
    });
    state.scores = newScores;
    state.message = reasonMsg;
    addLog(state, 'システム', `🏁 ${reasonMsg} ラウンド終了`);
  };

  const checkWinCondition = (state) => {
    for (let p of state.players) {
      if (p.hand.length === 0) {
        state.winner = p.id;
        finishRound(state, `${p.name} がアガリました`);
        return true;
      }
    }
    return false;
  };

  const doDraw = () => {
    initAudio();
    setGameState(prev => {
      if (prev.phase !== 'draw' || prev.winner !== null || prev.roundOver) return prev;
      const s = { ...prev, players: [...prev.players], logs: [...(prev.logs || [])], scores: [...prev.scores] };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: sortHand([...currentP.hand]) };
      
      if (s.deck.length === 0) {
        finishRound(s, '0枚になった山札を引こうとしました（流局）');
        s.actionCount += 1;
        return s;
      }
      
      s.deck = [...s.deck];
      const drawnCard = s.deck.pop();
      
      p.justDrawnCardId = drawnCard.id;
      p.hand = [...sortHand(p.hand), drawnCard];
      
      s.players[s.turn] = p;
      s.phase = 'main';
      s.message = `${p.name} のターン`;
      addLog(s, p.name, '山札からドロー');
      s.actionCount += 1;
      return s;
    });
  };

  const doMeld = (cardIds, type, interpretedSeq) => {
    initAudio();
    playMelody(interpretedSeq.map(c => c.interpretedAbsVal));
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;
      const s = { ...prev, players: [...prev.players], field: [...prev.field], logs: [...(prev.logs || [])], scores: [...prev.scores] };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      p.hand = sortHand(p.hand.filter(c => !cardIds.includes(c.id)));
      p.hasMelded = true;
      p.justDrawnCardId = null;
      s.players[s.turn] = p;
      
      const symbol = type === 'chord' ? getChordSymbol(interpretedSeq) : 'スケール';
      const cardsStr = interpretedSeq.map(c => `${NOTE_NAMES[c.interpretedAbsVal % 7]}${Math.floor(c.interpretedAbsVal / 7) + 3}`).join(', ');

      s.field.push({ id: `meld_${Date.now()}_${Math.random()}`, ownerId: s.turn, type, cards: interpretedSeq });
      s.message = `${p.name} が ${type === 'scale' ? 'スケール' : symbol} を公開`;
      addLog(s, p.name, `[${cardsStr}] で ${type === 'scale' ? 'スケール' : symbol} を公開`);

      checkWinCondition(s);
      s.actionCount += 1;
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  const doAdd = (cardId, meldId, newSeq) => {
    initAudio();
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;
      const s = { ...prev, players: [...prev.players], field: [...prev.field], logs: [...(prev.logs || [])], scores: [...prev.scores] };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      const meldIndex = s.field.findIndex(m => m.id === meldId);
      if (meldIndex === -1) return prev;
      const meld = { ...s.field[meldIndex] };
      
      const cardObj = p.hand.find(c => c.id === cardId);
      const cardStr = `${NOTE_NAMES[cardObj.absVal % 7]}${Math.floor(cardObj.absVal / 7) + 3}`;
      const targetName = meld.type === 'chord' ? getChordSymbol(meld.cards) : 'スケール';
      const ownerName = s.players[meld.ownerId].name;

      p.hand = sortHand(p.hand.filter(c => c.id !== cardId));
      p.justDrawnCardId = null;
      s.players[s.turn] = p;
      meld.cards = newSeq; 
      s.field[meldIndex] = meld;

      const newTargetName = meld.type === 'chord' ? getChordSymbol(newSeq) : 'スケール';

      s.message = `${p.name} が ${cardStr} を付け札`;
      addLog(s, p.name, `${ownerName}の [${targetName}] に ${cardStr} を付け札 → [${newTargetName}]`);

      playMelody(meld.cards.map(c => c.interpretedAbsVal));
      checkWinCondition(s);
      s.actionCount += 1;
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  const doDiscard = (cardId) => {
    setGameState(prev => {
      if (prev.phase !== 'main' || prev.winner !== null || prev.roundOver) return prev;
      const s = { ...prev, players: [...prev.players], discardPile: [...prev.discardPile], logs: [...(prev.logs || [])], scores: [...prev.scores] };
      const currentP = s.players[s.turn];
      const p = { ...currentP, hand: [...currentP.hand] };
      
      const cardIndex = p.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;
      
      const [discardedCard] = p.hand.splice(cardIndex, 1);
      p.hand = sortHand(p.hand);
      p.justDrawnCardId = null; 
      s.discardPile.push({ card: discardedCard, discarderId: s.turn, isHidden: false });
      s.players[s.turn] = p;

      const noteText = `${NOTE_NAMES[discardedCard.absVal % 7]}${Math.floor(discardedCard.absVal / 7) + 3}`;
      addLog(s, p.name, `${noteText} を捨てた`);
      
      if (checkWinCondition(s)) return s;

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
  };

  const doPassInterrupt = () => {
    setGameState(prev => {
      if (prev.phase !== 'interrupt') return prev;
      const s = { ...prev, logs: [...(prev.logs || [])] };
      if (!s.interruptInfo || !s.interruptInfo.candidates) return s;
      s.interruptInfo = { ...s.interruptInfo, candidates: [...s.interruptInfo.candidates] };
      s.interruptInfo.candidates.shift();

      if (s.interruptInfo.candidates.length > 0) {
        return s;
      } else {
        s.phase = 'draw';
        s.turn = (s.interruptInfo.discarderId + 1) % 4;
        s.message = `${s.players[s.turn].name} のターン`;
        s.interruptInfo = null;
        s.actionCount += 1;
        return s;
      }
    });
    setSelectedHand([]);
  };

  const doInterruptAction = (playerId, type, handCardIds) => {
    initAudio();
    setGameState(prev => {
      if (prev.phase !== 'interrupt') return prev;
      const s = { ...prev, players: [...prev.players], field: [...prev.field], discardPile: [...prev.discardPile], logs: [...(prev.logs || [])], scores: [...prev.scores] };
      const actorP = s.players[playerId];
      const p = { ...actorP, hand: [...actorP.hand] };
      
      const discarderId = s.interruptInfo ? s.interruptInfo.discarderId : null;
      const discarderName = discarderId !== null ? s.players[discarderId].name : '誰か';

      const lastDiscardObj = s.discardPile.pop();
      const discardedCard = lastDiscardObj ? lastDiscardObj.card : null;

      const selectedObjs = p.hand.filter(c => handCardIds.includes(c.id));
      p.hand = sortHand(p.hand.filter(c => !handCardIds.includes(c.id)));
      p.justDrawnCardId = null;
      
      const testCards = [discardedCard, ...selectedObjs];
      const seq = type === 'pon' ? getChordInterpretation(testCards) : getScaleInterpretation(testCards);
      
      playMelody(seq.map(c => c.interpretedAbsVal));
      p.hasMelded = true;
      s.players[playerId] = p;
      
      const symbol = type === 'pon' ? getChordSymbol(seq) : 'スケール';
      const actionName = type === 'pon' ? `ポン` : `チー`;
      const cardsStr = seq.map(c => `${NOTE_NAMES[c.interpretedAbsVal % 7]}${Math.floor(c.interpretedAbsVal / 7) + 3}`).join(', ');

      s.field.push({ id: `meld_${Date.now()}_${Math.random()}`, ownerId: playerId, type: type === 'pon' ? 'chord' : 'scale', cards: seq });
      
      s.turn = playerId;
      s.phase = 'main';
      s.interruptInfo = null;
      s.message = `${p.name} が ${discarderName} の捨て札で ${actionName}`;
      addLog(s, p.name, `${discarderName}の捨て札で ${actionName}！ [${cardsStr}] で ${symbol} を公開`);
      
      s.actionCount += 1;
      checkWinCondition(s);
      return s;
    });
    setSelectedHand([]);
    setSelectedMeld(null);
  };

  const handlePlayerMeld = (type) => {
    const p = gameState.players[0];
    const selectedObjs = p.hand.filter(c => selectedHand.includes(c.id));
    let seq = type === 'scale' ? getScaleInterpretation(selectedObjs) : getChordInterpretation(selectedObjs);
    if (seq) doMeld(selectedHand, type, seq);
  };

  const handlePlayerAdd = () => {
    const p = gameState.players[0];
    if (selectedHand.length !== 1 || !selectedMeld) return;

    const meld = gameState.field.find(m => m.id === selectedMeld);
    if (!meld) return;

    if (meld.type === 'chord' && meld.cards.length >= 4) return;
    const cardObj = p.hand.find(c => c.id === selectedHand[0]);
    const newSeq = tryAddCardToMeld(cardObj, meld);
    
    if (newSeq) {
      doAdd(cardObj.id, meld.id, newSeq);
    }
  };

  const handlePlayerInterrupt = (type) => {
    if (selectedHand.length !== 2) return;
    const discardedCard = gameState.interruptInfo.discardedCard;
    const p = gameState.players[0];
    const selectedObjs = p.hand.filter(c => selectedHand.includes(c.id));
    const testCards = [discardedCard, ...selectedObjs];
    const seq = type === 'pon' ? getChordInterpretation(testCards) : getScaleInterpretation(testCards);
    if (seq) doInterruptAction(0, type, selectedHand);
  };

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

  const highlightCardIds = new Set();
  const validCombsList = [];
  const isInterruptTurn = gameState.phase === 'interrupt';
  const isMyInterrupt = isInterruptTurn && gameState.interruptInfo?.candidates?.length > 0 && gameState.interruptInfo.candidates[0].playerId === 0;

  if (isMyInterrupt) {
    const discardedCard = gameState.interruptInfo.discardedCard;
    const myHand = gameState.players[0].hand;
    const ponCombs = getValidPonCombs(myHand, discardedCard);
    ponCombs.forEach(comb => {
      validCombsList.push(comb);
      comb.forEach(id => highlightCardIds.add(id));
    });
    if (gameState.interruptInfo.discarderId === 3) {
      const chiiCombs = getValidChiiCombs(myHand, discardedCard);
      chiiCombs.forEach(comb => {
        validCombsList.push(comb);
        comb.forEach(id => highlightCardIds.add(id));
      });
    }
  }

  const handleCardClick = (card) => {
    if (isInterruptTurn && isMyInterrupt) {
      if (highlightCardIds.has(card.id)) {
        const matchedComb = validCombsList.find(comb => comb.includes(card.id));
        if (matchedComb) {
          setSelectedHand(matchedComb);
        }
      }
      return;
    }

    if (!isPlayerTurn && !isMyInterrupt) return;
    setSelectedHand(prev => prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]);
  };

  const isCpuActing = useRef(false);
  useEffect(() => {
    if (gameState.winner !== null || gameState.roundOver) return;
    
    const runGameLoop = async () => {
      isCpuActing.current = true;
      await new Promise(r => setTimeout(r, 600));

      if (gameState.phase === 'interrupt') {
        if (!gameState.interruptInfo || !gameState.interruptInfo.candidates || gameState.interruptInfo.candidates.length === 0) {
          isCpuActing.current = false;
          return;
        }
        const candidate = gameState.interruptInfo.candidates[0];
        
        if (candidate.playerId === 0) {
           const discardedCard = gameState.interruptInfo.discardedCard;
           const myHand = gameState.players[0].hand;
           const hasPon = getValidPonCombs(myHand, discardedCard).length > 0;
           const hasChii = (gameState.interruptInfo.discarderId === 3) && (getValidChiiCombs(myHand, discardedCard).length > 0);

           if (!hasPon && !hasChii) {
              doPassInterrupt();
              isCpuActing.current = false;
              return;
           }
        }

        if (gameState.players[candidate.playerId].isCPU) {
           const ponAction = candidate.actions.find(a => a.type === 'pon');
           const chiiAction = candidate.actions.find(a => a.type === 'chii');
           if (ponAction) doInterruptAction(candidate.playerId, 'pon', ponAction.validCombs[0]);
           else if (chiiAction) doInterruptAction(candidate.playerId, 'chii', chiiAction.validCombs[0]);
           else doPassInterrupt();
        }
        isCpuActing.current = false;
        return;
      }

      const p = gameState.players[gameState.turn];
      if (!p.isCPU) { isCpuActing.current = false; return; }

      if (gameState.phase === 'draw') {
        doDraw();
      } else if (gameState.phase === 'main') {
        let actionTaken = false;
        const hand = [...p.hand];
        
        if (hand.length >= 3) {
          for (let size = Math.min(hand.length, 5); size >= 3; size--) {
            const combs = getCombinations(hand, size);
            for (let comb of combs) {
              const scaleSeq = getScaleInterpretation(comb);
              if (scaleSeq) { doMeld(comb.map(c=>c.id), 'scale', scaleSeq); actionTaken = true; break; }
              const chordSeq = getChordInterpretation(comb);
              if (chordSeq && size === 3) { doMeld(comb.map(c=>c.id), 'chord', chordSeq); actionTaken = true; break; }
            }
            if (actionTaken) break;
          }
        }

        if (!actionTaken) {
           for (let card of hand) {
             for (let meld of gameState.field) {
               const newSeq = tryAddCardToMeld(card, meld);
               if (newSeq) { doAdd(card.id, meld.id, newSeq); actionTaken = true; break; }
             }
             if (actionTaken) break;
           }
        }

        if (!actionTaken) {
          await new Promise(r => setTimeout(r, 600));
          doDiscard(hand[Math.floor(Math.random() * hand.length)].id);
        }
      }
      isCpuActing.current = false;
    };

    if (!isCpuActing.current) runGameLoop();
  }, [gameState.turn, gameState.phase, gameState.actionCount, gameState.winner, gameState.roundOver]);

  const renderCard = (card, isSelected, onClick, interpretedAbsVal = null, interpretedSuit = null, sizeClass = "w-11 h-15 sm:w-13 sm:h-18", isHighlighted = false, isHidden = false, extraClass = "") => {
    if (isHidden) {
      return (
        <div 
          onClick={onClick}
          className={`relative ${sizeClass} rounded-lg border border-slate-400 bg-slate-700 shadow-xs flex flex-col items-center justify-center cursor-default select-none transition-all duration-200 ${extraClass}`}
        >
          <Music className="w-4 h-4 text-slate-400 opacity-40" />
        </div>
      );
    }

    const absValToUse = interpretedAbsVal !== null ? interpretedAbsVal : card.absVal;
    const suitToUse = interpretedSuit !== null ? interpretedSuit : card.suit;
    
    const oct = Math.floor(absValToUse / 7) + 3;
    const suitObj = SUITS.find(s => s.id === suitToUse) || SUITS[0];
    const noteIndex = absValToUse % 7;

    return (
      <div 
        key={card.id} onClick={onClick}
        className={`relative ${sizeClass} rounded-lg border-2 shadow-xs flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200
          ${suitObj.color}
          ${isSelected ? 'ring-2 ring-blue-500 transform -translate-y-1' : 'hover:-translate-y-0.5'}
          ${isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50 animate-bounce' : ''}
          ${extraClass}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-black flex items-baseline">
            {NOTE_NAMES[noteIndex]}
            <span className="text-[9px] font-bold ml-0.2">{oct}</span>
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold">{NOTE_JP[noteIndex]}</span>
        </div>
      </div>
    );
  };

  const isPlayerTurn = gameState.turn === 0;
  const isMainPhase = gameState.phase === 'main';

  let canPon = false, canChii = false;
  if (isMyInterrupt) {
    const myActions = gameState.interruptInfo.candidates[0].actions;
    canPon = myActions.some(a => a.type === 'pon');
    canChii = myActions.some(a => a.type === 'chii');
  }

  const nextRound = () => {
    if (gameState.round < 4) {
      setGameState(setupRound(gameState.scores, gameState.round + 1));
      setSelectedHand([]);
      setSelectedMeld(null);
      setRulePage(0);
    }
  };

  const isFinalRoundOver = gameState.roundOver && gameState.round === 4;

  const chordMelds = gameState.field.filter(m => m.type === 'chord');
  const scaleMelds = gameState.field.filter(m => m.type === 'scale');

  const getGuideMessage = () => {
    if (gameState.roundOver) return gameState.message;

    if (gameState.phase === 'draw') {
      if (gameState.turn === 0) return '👉 あなたのターンです。右の光っている山札から引いてください。';
      return `⏳ ${gameState.players[gameState.turn].name} のターン（ドロー待ち）...`;
    }
    
    if (gameState.phase === 'main') {
      if (gameState.turn === 0) {
        if (selectedHand.length > 0) {
           if (selectedHand.length === 1 && isValidAddSelection) return '👉 「付け札」または「捨てる」が可能です。';
           if (selectedHand.length === 1) return '👉 不要なら「捨てる」、役を作るならさらにカードを選択してください。';
           if (isValidScaleSelection || isValidChordSelection) return '👉 役が完成しています！アクションボタンで場に出せます。';
           return '👉 その組み合わせでは役を作れません。選択を直すか1枚だけ捨ててください。';
        }
        return '👉 役（3枚以上）を作って出すか、不要なカードを1枚選んで捨ててください。';
      }
      return `⏳ ${gameState.players[gameState.turn].name} が考え中...`;
    }

    if (gameState.phase === 'interrupt') {
      if (isMyInterrupt) return '⚡ ポン・チーのチャンス！光っているカードをタップしてください。';
      return '⏳ 他プレイヤーの割り込みを確認中...';
    }

    return gameState.message;
  };

  return (
    <div className={`h-screen font-sans flex flex-col overflow-hidden transition-colors duration-300 ${isPlayerTurn && !gameState.roundOver ? 'bg-blue-50/30' : 'bg-slate-50'}`}>
      <header className="bg-white px-3 py-1.5 shadow-xs flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-blue-600" />
          <h1 className="text-xs font-bold text-slate-800">メロディ・ブリッジ <span className="text-slate-400 font-normal">R{gameState.round}/4</span></h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRuleModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold rounded transition"
          >
            <BookOpen className="w-3 h-3" /> 遊び方
          </button>
          <button 
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded transition"
          >
            <History className="w-3 h-3" /> 履歴
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-2 py-1 shrink-0">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-1">
          {gameState.players.map((p) => {
            const isCurrent = gameState.turn === p.id && !gameState.roundOver;
            return (
              <div 
                key={p.id} 
                className={`p-1 rounded border flex flex-col items-center justify-center transition-all ${
                  isCurrent 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-300' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 opacity-75'
                }`}
              >
                <span className="text-[10px] font-bold truncate max-w-[65px]">{p.name}</span>
                <span className={`text-[9px] ${isCurrent ? 'text-blue-100 font-bold' : 'text-slate-400'}`}>
                  {p.hand.length}枚
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden max-w-6xl mx-auto w-full">
        {isInterruptTurn && isMyInterrupt && (
          <div className="bg-amber-50 border border-amber-300 p-1.5 rounded-lg flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-amber-800 font-bold text-[11px]">ポン・チー可能</p>
            </div>
            {renderCard(gameState.interruptInfo.discardedCard, false, null, null, null, "w-8 h-11")}
          </div>
        )}

        <div className={`flex justify-between items-center px-2.5 py-2 rounded-xl border transition-colors shrink-0 ${isPlayerTurn && !gameState.roundOver ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-white border-slate-200'}`}>
          <div className="flex items-start gap-1.5 text-slate-800 font-bold text-xs pr-2 flex-1">
            <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isPlayerTurn && !gameState.roundOver ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="leading-snug break-words whitespace-normal">{getGuideMessage()}</span>
          </div>
          
          <div className="flex gap-3 items-center shrink-0 pl-2 border-l border-slate-200/60">
            <div className="text-center">
              <div onClick={() => isPlayerTurn && gameState.phase === 'draw' && doDraw()}
                className={`relative w-9 h-12 rounded border flex items-center justify-center transition-all duration-300 ${
                  isPlayerTurn && gameState.phase === 'draw' 
                    ? 'bg-blue-500 border-blue-300 ring-4 ring-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer scale-110 z-10 animate-pulse' 
                    : 'bg-slate-700 border-slate-800 opacity-85 cursor-default'
                }`}>
                <Music className={`w-4 h-4 ${isPlayerTurn && gameState.phase === 'draw' ? 'text-white' : 'text-slate-500 opacity-40'}`} />
                <div className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs ${isPlayerTurn && gameState.phase === 'draw' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {gameState.deck.length}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div onClick={() => setShowDiscardModal(true)} className="cursor-pointer transition-transform hover:scale-105">
                {gameState.discardPile.length > 0 ? (
                  renderCard(
                    gameState.discardPile[gameState.discardPile.length - 1].card, 
                    false, undefined, null, null, "w-9 h-12", false, 
                    gameState.discardPile[gameState.discardPile.length - 1].isHidden
                  )
                ) : (
                  <div className="w-9 h-12 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center"><span className="text-[8px] text-slate-400">-</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-emerald-50/30 rounded-xl border border-emerald-100 p-2 overflow-y-auto flex flex-col gap-2">
          {gameState.field.length === 0 && (
            <p className="text-slate-400 text-xs text-center py-6">Field</p>
          )}

          {chordMelds.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1.5">
                {chordMelds.map((meld) => {
                  const chordSymbol = getChordSymbol(meld.cards);
                  const isCompleted = meld.cards.length === 4;
                  const chordSuit = meld.cards[0]?.suit || 'red';
                  const symbolColorClass = chordSuit === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800';

                  return (
                    <div 
                      key={meld.id} 
                      onClick={() => !isCompleted && isPlayerTurn && isMainPhase && setSelectedMeld(meld.id)}
                      className={`p-1.5 rounded-lg shadow-2xs border transition-all ${
                        isCompleted 
                          ? 'bg-slate-200 border-slate-400 opacity-90 cursor-default' 
                          : selectedMeld === meld.id 
                            ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/30 cursor-pointer' 
                            : 'bg-white border-slate-200 cursor-pointer'
                      }`}
                    >
                      <div className="text-[9px] font-bold mb-1 flex justify-between gap-2 items-center">
                        <span className={`px-1.5 py-0.2 rounded font-black ${isCompleted ? 'bg-slate-700 text-white' : symbolColorClass}`}>
                          {chordSymbol}
                        </span>
                        <span className="text-slate-400 text-[8px]">{gameState.players[meld.ownerId].name}</span>
                      </div>
                      <div className="flex -space-x-1">
                        {meld.cards.map((c, i) => (
                          <div key={i}>
                             {renderCard(c, false, undefined, c.interpretedAbsVal, c.suit, "w-8 h-11")}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {scaleMelds.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1.5">
                {scaleMelds.map((meld) => {
                  const scaleSuit = meld.cards[0]?.suit || 'red';
                  const scaleColorClass = scaleSuit === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800';

                  return (
                    <div 
                      key={meld.id} 
                      onClick={() => isPlayerTurn && isMainPhase && setSelectedMeld(meld.id)}
                      className={`p-1.5 rounded-lg shadow-2xs border transition-all cursor-pointer ${selectedMeld === meld.id ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/30' : 'bg-white border-slate-200'}`}
                    >
                      <div className="text-[9px] font-bold mb-1 flex justify-between gap-2 items-center">
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[8px] ${scaleColorClass}`}>スケール</span>
                        <span className="text-slate-400 text-[8px]">{gameState.players[meld.ownerId].name}</span>
                      </div>
                      <div className="flex -space-x-1">
                        {meld.cards.map((c, i) => (
                          <div key={i}>
                             {renderCard(c, false, undefined, c.interpretedAbsVal, c.suit, "w-8 h-11")}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-2 shadow-xs shrink-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <h2 className="text-[11px] font-bold text-slate-800">
              手札 <span className="text-slate-400 font-normal">({selectedHand.length}枚)</span>
            </h2>
            
            <div className="flex gap-1 flex-wrap justify-end">
              {isInterruptTurn && isMyInterrupt ? (
                 <>
                   <button onClick={doPassInterrupt} className="px-2.5 py-1 bg-slate-500 hover:bg-slate-600 text-white text-[11px] font-bold rounded shadow-2xs">パス</button>
                   <button onClick={() => handlePlayerInterrupt('chii')} disabled={!canChii || selectedHand.length !== 2} className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-200 text-white text-[11px] font-bold rounded shadow-2xs">チー</button>
                   <button onClick={() => handlePlayerInterrupt('pon')} disabled={!canPon || selectedHand.length !== 2} className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white text-[11px] font-bold rounded shadow-2xs">ポン</button>
                 </>
              ) : isInterruptTurn ? (
                 <div className="text-[10px] text-amber-600 font-bold animate-pulse">割り込み確認中</div>
              ) : (
                 <>
                   <button disabled={!isPlayerTurn || !isMainPhase || !isValidScaleSelection} onClick={() => handlePlayerMeld('scale')} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-[10px] font-bold rounded shadow-2xs">スケール</button>
                   <button disabled={!isPlayerTurn || !isMainPhase || !isValidChordSelection} onClick={() => handlePlayerMeld('chord')} className="px-2 py-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white text-[10px] font-bold rounded shadow-2xs">コード</button>
                   <button disabled={!isPlayerTurn || !isMainPhase || !isValidAddSelection} onClick={handlePlayerAdd} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-[10px] font-bold rounded shadow-2xs">付け札</button>
                   <button disabled={!isPlayerTurn || !isMainPhase || selectedHand.length !== 1} onClick={() => doDiscard(selectedHand[0])} className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 text-white text-[10px] font-bold rounded shadow-2xs">捨てる</button>
                 </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap min-h-[60px] items-center p-1 bg-slate-100 rounded-lg border border-slate-200 justify-center">
            {gameState.players[0].hand.map(card => {
              const isJustDrawn = card.id === gameState.players[0].justDrawnCardId;
              return renderCard(
                card, 
                selectedHand.includes(card.id),
                () => handleCardClick(card),
                null, 
                null, 
                "w-10 h-14 sm:w-13 sm:h-18 mx-0.5", 
                highlightCardIds.has(card.id), 
                false,
                isJustDrawn ? "ml-3 sm:ml-5 ring-2 ring-emerald-400 shadow-md" : ""
              );
            })}
          </div>
        </div>
      </footer>

      {/* ルール説明モーダル（6ページ構成） */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-3">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" /> 遊び方・ルール
              </h3>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base px-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              <h4 className="font-black text-blue-800 text-sm mb-3 border-l-4 border-blue-500 pl-2">
                {RULES[rulePage].title}
              </h4>
              {RULES[rulePage].content}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <button 
                  disabled={rulePage === 0} 
                  onClick={() => setRulePage(p => p - 1)}
                  className="px-4 py-2 bg-slate-100 disabled:opacity-30 font-bold rounded-lg transition"
                >
                  前へ
                </button>
                <span className="text-slate-500 font-bold">{rulePage + 1} / {RULES.length}</span>
                <button 
                  disabled={rulePage === RULES.length - 1} 
                  onClick={() => setRulePage(p => p + 1)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 disabled:opacity-30 font-bold rounded-lg transition"
                >
                  次へ
                </button>
              </div>
              <button onClick={() => setShowRuleModal(false)} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-xs">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-3">
          <div className="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">捨て札一覧 ({gameState.discardPile.length})</h3>
              <button onClick={() => setShowDiscardModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base px-2">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-3 p-1">
              {gameState.discardPile.map((item, idx) => {
                const isSystem = item.discarderId === 'system';
                const ownerName = isSystem ? '初期(王牌)' : (gameState.players[item.discarderId]?.name || '誰か');
                const isUser = item.discarderId === 0;
                return (
                  <div key={`${item.card.id}_${idx}`} className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded truncate max-w-full ${isUser ? 'bg-blue-100 text-blue-800' : isSystem ? 'bg-slate-300 text-slate-600' : 'bg-slate-200 text-slate-700'}`}>
                      {ownerName}
                    </span>
                    {renderCard(item.card, false, undefined, null, null, "w-9 h-12", false, item.isHidden)}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowDiscardModal(false)} className="mt-3 w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">
              閉じる
            </button>
          </div>
        </div>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">履歴</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base px-2">✕</button>
            </div>
            <div 
              className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]"
              ref={logContainerRef}
            >
              {(gameState.logs || []).map((log, i) => {
                let isUser = false, isSystem = false;
                if (typeof log === 'object' && log.player) {
                  isUser = log.player === 'あなた';
                  isSystem = log.player === 'システム';
                } else if (typeof log === 'string') {
                  isSystem = true;
                }
                const playerName = log.player || 'システム';
                const text = log.text || log;

                return (
                  <div 
                    key={i} 
                    className={`p-1.5 rounded border text-xs flex gap-2 shadow-2xs ${
                      isSystem 
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' 
                        : isUser 
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium' 
                          : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-bold shrink-0 w-16 truncate border-r border-slate-200/60 pr-1">[{playerName}]</span>
                    <span className="flex-1 leading-relaxed">{text}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowLogModal(false)} className="mt-3 w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">
              閉じる
            </button>
          </div>
        </div>
      )}

      {gameState.roundOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center shadow-2xl">
            <h2 className="text-lg font-black text-amber-500 mb-1">
              {isFinalRoundOver ? '🏆 結果発表' : `R${gameState.round} 終了`}
            </h2>
            <p className="text-xs font-bold text-slate-700 mb-3">{gameState.message}</p>
            
            <div className="bg-slate-50 p-2.5 rounded-xl mb-3 text-left border text-xs font-bold">
              <div className="space-y-1">
                {gameState.players.map((p, idx) => {
                  const minScore = Math.min(...gameState.scores);
                  const isWinner = isFinalRoundOver && gameState.scores[idx] === minScore;
                  return (
                    <div key={p.id} className={`flex justify-between items-center px-2 py-1 rounded ${isWinner ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-700'}`}>
                      <span>{isWinner && '👑'} {p.name}</span>
                      <span>{gameState.scores[idx]} pt</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => setShowLogModal(true)} className="w-full py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg text-xs">
                履歴
              </button>
              {isFinalRoundOver ? (
                <button onClick={() => setGameState(setupRound([0,0,0,0], 1))} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">
                  もう一度遊ぶ
                </button>
              ) : (
                <button onClick={nextRound} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">
                  次へ (R{gameState.round + 1})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}