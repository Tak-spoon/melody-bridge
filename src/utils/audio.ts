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
 * ポン・チーのカットイン発生時の決定効果音（SE）
 */
export const playCutInSound = (type: 'pon' | 'chii', customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (type === 'pon') {
      // ポン：キレのあるインパクト音（周波数が急激に変化するスナップアタック）
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // チー：軽快なスイープ音
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.1);

      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // オーディオエラーのフォールバック
  }
};

/**
 * アガリ（和了）発生時のファンファーレ効果音
 */
export const playWinSound = (customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // ド4(7), ミ4(9), ソ4(11), ド5(14)
  const notes = [7, 9, 11, 14];
  notes.forEach((noteIdx, i) => {
    try {
      const now = ctx.currentTime;
      const startTime = now + i * 0.1;
      const duration = 0.6;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = FREQUENCIES[noteIdx];

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.stop(startTime + duration);
    } catch {
      // フォールバック
    }
  });
};

/**
 * 音程配列（absVal: 0〜20）をアルペジオ（分散和音/メロディ）として順番に合成・再生します。
 */
export const playMelody = (absVals: number[], customCtx?: AudioContext | null): void => {
  const ctx = customCtx || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  absVals.forEach((absVal, i) => {
    if (absVal < 0 || absVal >= FREQUENCIES.length) return;
    
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // トライアングル波（柔らかいシンセ音）
      osc.type = 'triangle';
      osc.frequency.value = FREQUENCIES[absVal];

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = now + i * 0.15;
      const duration = 0.5;

      osc.start(startTime);
      // エンベロープ設定（音の立ち上がりと減衰）
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.stop(startTime + duration);
    } catch {
      // オーディオ再生エラーのフォールバック（無視）
    }
  });
};
