import React from 'react';
import { Settings, X, Volume2, Music2, Check, Minus } from 'lucide-react';

interface OptionModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  cardToneEnabled: boolean;
  onToggleSound: () => void;
  onToggleCardTone: () => void;
  onClose: () => void;
}

export const OptionModal: React.FC<OptionModalProps> = ({
  isOpen,
  soundEnabled,
  cardToneEnabled,
  onToggleSound,
  onToggleCardTone,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
      <div className="bg-[#180f09] rounded-2xl p-5 max-w-xs w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.85)] border-2 border-amber-500/70 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-amber-100">設定・オプション</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-amber-300 hover:bg-amber-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 設定項目一覧 */}
        <div className="space-y-3 mb-5 text-left">
          
          {/* 1. カード選択時の音（単音ピアノ） */}
          <div className="bg-[#22160d] p-3 rounded-xl border border-amber-900/60 shadow-inner flex items-center justify-between gap-2">
            <div className="flex items-start gap-2.5 pr-1 min-w-0">
              <Music2 className={`w-4 h-4 shrink-0 mt-0.5 ${cardToneEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-100">カード選択音</span>
                  <span className={`text-[9px] font-black px-1 py-0.2 rounded ${
                    cardToneEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {cardToneEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className="text-[10px] text-amber-200/60 leading-tight block mt-0.5">
                  手札を選んだ時のピアノ単音
                </span>
              </div>
            </div>

            {/* トグルスイッチ（明確なON/OFFビジュアル） */}
            <button
              onClick={onToggleCardTone}
              className={`w-14 h-7 rounded-full transition-all relative shrink-0 p-0.5 border flex items-center shadow-inner ${
                cardToneEnabled 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                  : 'bg-[#110a06] border-amber-950/90'
              }`}
            >
              {/* トグル内部のラベル表示 */}
              <span className={`absolute left-1.5 text-[9px] font-black tracking-wider transition-opacity ${
                cardToneEnabled ? 'opacity-100 text-slate-950 font-black' : 'opacity-0'
              }`}>
                ON
              </span>
              <span className={`absolute right-1.5 text-[9px] font-bold tracking-wider transition-opacity ${
                !cardToneEnabled ? 'opacity-100 text-amber-700/80' : 'opacity-0'
              }`}>
                OFF
              </span>

              {/* スライドするノブ */}
              <div 
                className={`w-6 h-6 rounded-full shadow-md transition-all flex items-center justify-center ${
                  cardToneEnabled 
                    ? 'translate-x-7 bg-slate-950 text-amber-400 border border-amber-300' 
                    : 'translate-x-0 bg-slate-700 text-slate-400 border border-slate-600'
                }`} 
              >
                {cardToneEnabled ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Minus className="w-3 h-3 stroke-[3]" />
                )}
              </div>
            </button>
          </div>

          {/* 2. ゲーム効果音・メロディ */}
          <div className="bg-[#22160d] p-3 rounded-xl border border-amber-900/60 shadow-inner flex items-center justify-between gap-2">
            <div className="flex items-start gap-2.5 pr-1 min-w-0">
              <Volume2 className={`w-4 h-4 shrink-0 mt-0.5 ${soundEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-100">効果音＆和音</span>
                  <span className={`text-[9px] font-black px-1 py-0.2 rounded ${
                    soundEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {soundEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className="text-[10px] text-amber-200/60 leading-tight block mt-0.5">
                  役成立時のピアノ和音やSE
                </span>
              </div>
            </div>

            {/* トグルスイッチ（明確なON/OFFビジュアル） */}
            <button
              onClick={onToggleSound}
              className={`w-14 h-7 rounded-full transition-all relative shrink-0 p-0.5 border flex items-center shadow-inner ${
                soundEnabled 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                  : 'bg-[#110a06] border-amber-950/90'
              }`}
            >
              {/* トグル内部のラベル表示 */}
              <span className={`absolute left-1.5 text-[9px] font-black tracking-wider transition-opacity ${
                soundEnabled ? 'opacity-100 text-slate-950 font-black' : 'opacity-0'
              }`}>
                ON
              </span>
              <span className={`absolute right-1.5 text-[9px] font-bold tracking-wider transition-opacity ${
                !soundEnabled ? 'opacity-100 text-amber-700/80' : 'opacity-0'
              }`}>
                OFF
              </span>

              {/* スライドするノブ */}
              <div 
                className={`w-6 h-6 rounded-full shadow-md transition-all flex items-center justify-center ${
                  soundEnabled 
                    ? 'translate-x-7 bg-slate-950 text-amber-400 border border-amber-300' 
                    : 'translate-x-0 bg-slate-700 text-slate-400 border border-slate-600'
                }`} 
              >
                {soundEnabled ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Minus className="w-3 h-3 stroke-[3]" />
                )}
              </div>
            </button>
          </div>

        </div>

        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-lg border-2 border-amber-200 transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
