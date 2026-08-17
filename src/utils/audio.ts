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
