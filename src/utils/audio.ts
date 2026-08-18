import { FREQUENCIES } from '../constants/music';

let globalAudioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

/**
 * Web Audio APIのコンテキストおよびマスターリミッター（音割れ防止コンプレッサー）を初期化・取得します。
 */
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
      
      // 音割れ（クリッピング歪み）を完全防止するマスターリミッター/コンプレッサー
      masterCompressor = globalAudioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-1.0, globalAudioCtx.currentTime); // -1dBで安全にリミット
      masterCompressor.knee.setValueAtTime(4.0, globalAudioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(16.0, globalAudioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.003, globalAudioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.20, globalAudioCtx.currentTime);

      masterCompressor.connect(globalAudioCtx.destination);
    }
  }
  return globalAudioCtx;
};

/**
 * オーディオ出力先ノード（マスターコンプレッサー経由）を取得
 */
const getAudioDestination = (ctx: AudioContext): AudioNode => {
  if (masterCompressor && masterCompressor.context === ctx) {
    return masterCompressor;
  }
  return ctx.destination;
};

/**
 * 1音のアコースティックピアノサウンド（澄み切ったクリアで温かみのあるピアノ音）を生成・再生します。
 * 音割れ（クリッピング）を完全防止し、純粋なピアノの音芯と自然な余韻を再現します。
 */
export const playPianoNote = (
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration = 1.3,
  volume = 0.18
): void => {
  try {
    const destination = getAudioDestination(ctx);
    const masterGain = ctx.createGain();
    
    // 温かみのあるアコースティックフィルター（耳障りな高域ノイズをカット）
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, startTime);
    filter.frequency.exponentialRampToValueAtTime(800, startTime + duration);

    // [周波数倍率, 波形タイプ, 相対ゲイン]
    // ゲイン合計を安全にコントロールし、音割れ（クリッピング歪み）を完全防止
    const toneComponents: [number, OscillatorType, number][] = [
      [1, 'sine', 0.60],       // 純粋なピアノの音芯
      [1, 'triangle', 0.25],   // 胴鳴りの温かみ
      [2, 'sine', 0.15],       // 1オクターブ上の倍音（自然な明るさ）
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

    // 自然なピアノ打鍵エンベロープ（0.006秒の滑らかなアタック → 指数減衰）
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.006);
    masterGain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

    filter.connect(masterGain);
    masterGain.connect(destination);
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
    const destination = getAudioDestination(ctx);
    const now = ctx.currentTime;

    if (type === 'pon') {
      // ポン：瞬時に立ち上がる爽快なアタック打撃音（バシィッ！）
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gainNode);
      gainNode.connect(destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else {
      // チー：軽快なスイープ音
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);

      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gainNode);
      gainNode.connect(destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // オーディオエラーのフォールバック
  }
};

/**
 * アガリ（和了）発生時のピアノファンファーレアルペジオ
 * 4音が重なっても濁らず、透明感あふれる美しい響きに調整
 */
export const playWinSound = (customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // ド4(14), ミ4(16), ソ4(18), ド5(21)
  const notes = [14, 16, 18, 21];
  const now = ctx.currentTime;
  notes.forEach((noteIdx, i) => {
    const freq = FREQUENCIES[noteIdx];
    const startTime = now + i * 0.12; // 0.12秒の美しいアルペジオ間隔
    const isTopNote = i === notes.length - 1;
    // 重なりを考慮した安全な音量設計（最高音は少し際立たせる）
    const noteVolume = isTopNote ? 0.20 : 0.16;
    const noteDuration = isTopNote ? 1.8 : 1.4;
    playPianoNote(ctx, freq, startTime, noteDuration, noteVolume);
  });
};

/**
 * 音程配列を澄んだアコースティックピアノのアルペジオ（分散和音）として順番に合成・再生します。
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
    const startTime = now + i * 0.13; // 心地よい打鍵間隔
    playPianoNote(ctx, freq, startTime, 1.3, 0.18);
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
  playPianoNote(ctx, freq, now, 0.8, 0.22);
};
