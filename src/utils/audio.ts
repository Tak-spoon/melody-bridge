import { FREQUENCIES } from '../constants/music';

let globalAudioCtx: AudioContext | null = null;

/**
 * Web Audio APIのコンテキストを初期化・取得します。
 * （ブラウザのポリシーにより、ユーザーの初回クリック/タップ操作時に呼び出す必要があります）
 */
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  return globalAudioCtx;
};

/**
 * 1音のアコースティックピアノサウンド（澄み切ったクリアで温かみのあるピアノ音）を生成・再生します。
 * 音割れ（クリッピング）を完全防止し、純粋なピアノの音芯と自然な余韻を再現します。
 */
export const playPianoNote = (
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration = 1.4,
  volume = 0.22
): void => {
  try {
    const masterGain = ctx.createGain();
    
    // 温かみのあるアコースティックフィルター（耳障りな高域ノイズをカット）
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.frequency.exponentialRampToValueAtTime(700, startTime + duration);

    // [周波数倍率, 波形タイプ, 相対ゲイン]
    // ゲイン合計を安全にコントロールし、音割れ（クリッピング歪み）を完全防止
    const toneComponents: [number, OscillatorType, number][] = [
      [1, 'sine', 0.65],       // 純粋なピアノの音芯
      [1, 'triangle', 0.25],   // 胴鳴りの温かみ
      [2, 'sine', 0.10],       // 1オクターブ上の倍音（自然な明るさ）
    ];

    toneComponents.forEach(([mult, type, gainRatio]) => {
      const oscFreq = freq * mult;
      if (oscFreq > 16000) return;

      const osc = ctx.createOscillator();
      const compGain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(oscFreq, startTime);

      compGain.gain.setValueAtTime(gainRatio, startTime);
      osc.connect(compGain);
      compGain.connect(filter);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // 自然なピアノ打鍵エンベロープ（0.008秒の滑らかなアタック → 指数減衰）
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.008);
    masterGain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
  } catch {
    // フォールバック
  }
};

/**
 * ポン・チーのカットイン発生時の決定効果音（SE）
 * 遅延なく瞬時に立ち上がるシャープなインパクト音
 */
export const playCutInSound = (type: 'pon' | 'chii', customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const now = ctx.currentTime;

    if (type === 'pon') {
      // ポン：瞬時に立ち上がる爽快なアタック打撃音（バシィッ！）
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else {
      // チー：軽快なスイープ音
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // オーディオエラーのフォールバック
  }
};

/**
 * アガリ（和了）発生時のピアノファンファーレアルペジオ
 */
export const playWinSound = (customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // ド4(7), ミ4(9), ソ4(11), ド5(14)
  const notes = [7, 9, 11, 14];
  const now = ctx.currentTime;
  notes.forEach((noteIdx, i) => {
    const freq = FREQUENCIES[noteIdx];
    const startTime = now + i * 0.1;
    playPianoNote(ctx, freq, startTime, 1.5, 0.25);
  });
};

/**
 * 音程配列（absVal: 0〜20）を澄んだアコースティックピアノのアルペジオ（分散和音）として順番に合成・再生します。
 */
export const playMelody = (absVals: number[], customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  absVals.forEach((absVal, i) => {
    if (absVal < 0 || absVal >= FREQUENCIES.length) return;
    const freq = FREQUENCIES[absVal];
    const startTime = now + i * 0.14; // 心地よい打鍵間隔
    playPianoNote(ctx, freq, startTime, 1.4, 0.22);
  });
};

/**
 * 手札カード選択時に、そのカードの音（単音ピアノ）を軽やかに再生します。
 * タップした瞬間に澄み切ったピアノの単音（ポーン）が響きます。
 */
export const playCardTone = (absVal: number, customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  if (absVal < 0 || absVal >= FREQUENCIES.length) return;
  const freq = FREQUENCIES[absVal];
  const now = ctx.currentTime;
  playPianoNote(ctx, freq, now, 0.85, 0.28);
};
