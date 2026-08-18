import React from 'react';
import { Settings, X, Volume2, Music2, Check, Minus, Bot, Zap, BarChart3, Repeat } from 'lucide-react';

export type BotSpeed = 'normal' | 'fast' | 'ultra';
export type BotCountOption = 1 | 4 | 10 | 50 | 'unlimited';

interface OptionModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  cardToneEnabled: boolean;
  botMode: boolean;
  botSpeed: BotSpeed;
  botTargetCount: BotCountOption;
  botRemainingCount: number | 'unlimited';
  onToggleSound: () => void;
  onToggleCardTone: () => void;
  onToggleBot: () => void;
  onChangeBotSpeed: () => void;
  onChangeBotTargetCount: (count: BotCountOption) => void;
  onOpenStats: () => void;
  onClose: () => void;
}

export const OptionModal: React.FC<OptionModalProps> = ({
  isOpen,
  soundEnabled,
  cardToneEnabled,
  botMode,
  botSpeed,
  botTargetCount,
  botRemainingCount,
  onToggleSound,
  onToggleCardTone,
  onToggleBot,
  onChangeBotSpeed,
  onChangeBotTargetCount,
  onOpenStats,
  onClose
}) => {
  if (!isOpen) return null;

  const speedLabels: Record<BotSpeed, { label: string; desc: string }> = {
    normal: { label: '1x 通常', desc: '目視用 (約0.9秒)' },
    fast: { label: '3x 高速', desc: 'サクサク (約0.2秒)' },
    ultra: { label: '10x 爆速', desc: '一瞬 (約0.03秒)' },
  };

  const countOptions: { value: BotCountOption; label: string }[] = [
    { value: 1, label: '1局' },
    { value: 4, label: '4局(1戦)' },
    { value: 10, label: '10局' },
    { value: 50, label: '50局' },
    { value: 'unlimited', label: '無限' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
      <div className="bg-[#180f09] rounded-2xl p-4 max-w-sm w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.85)] border-2 border-amber-500/70 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-2 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-amber-100">設定・オプション</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-amber-300 hover:bg-amber-950/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 設定項目一覧 */}
        <div className="space-y-3 mb-4 text-left">
          
          {/* セクションA: サウンド設定 */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-amber-400/80 px-1 block">
              🎵 サウンド設定
            </span>

            {/* 1. カード選択音 */}
            <div className="bg-[#22160d] p-2.5 rounded-xl border border-amber-900/60 shadow-inner flex items-center justify-between gap-2">
              <div className="flex items-start gap-2 pr-1 min-w-0">
                <Music2 className={`w-4 h-4 shrink-0 mt-0.5 ${cardToneEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-100">カード選択音</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
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

              {/* トグルスイッチ */}
              <button
                onClick={onToggleCardTone}
                className={`w-12 h-6 rounded-full transition-all relative shrink-0 p-0.5 border flex items-center shadow-inner ${
                  cardToneEnabled 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                    : 'bg-[#110a06] border-amber-950/90'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full shadow-md transition-all flex items-center justify-center ${
                    cardToneEnabled 
                      ? 'translate-x-6 bg-slate-950 text-amber-400 border border-amber-300' 
                      : 'translate-x-0 bg-slate-700 text-slate-400 border border-slate-600'
                  }`} 
                >
                  {cardToneEnabled ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <Minus className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
              </button>
            </div>

            {/* 2. ゲーム効果音 */}
            <div className="bg-[#22160d] p-2.5 rounded-xl border border-amber-900/60 shadow-inner flex items-center justify-between gap-2">
              <div className="flex items-start gap-2 pr-1 min-w-0">
                <Volume2 className={`w-4 h-4 shrink-0 mt-0.5 ${soundEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-100">効果音＆和音</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      soundEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-200/60 leading-tight block mt-0.5">
                    役成立時の和音やSE
                  </span>
                </div>
              </div>

              {/* トグルスイッチ */}
              <button
                onClick={onToggleSound}
                className={`w-12 h-6 rounded-full transition-all relative shrink-0 p-0.5 border flex items-center shadow-inner ${
                  soundEnabled 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                    : 'bg-[#110a06] border-amber-950/90'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full shadow-md transition-all flex items-center justify-center ${
                    soundEnabled 
                      ? 'translate-x-6 bg-slate-950 text-amber-400 border border-amber-300' 
                      : 'translate-x-0 bg-slate-700 text-slate-400 border border-slate-600'
                  }`} 
                >
                  {soundEnabled ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <Minus className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* セクションB: プレイヤーBot（回数指定対応） */}
          <div className="space-y-2 pt-1 border-t border-amber-950/80">
            <span className="text-[11px] font-black text-amber-400/80 px-1 block">
              🤖 プレイヤーBot（自動対戦・回数指定）
            </span>

            {/* 3. プレイヤーBot自動対戦 */}
            <div className="bg-[#22160d] p-2.5 rounded-xl border border-amber-900/60 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-2 pr-1 min-w-0">
                  <Bot className={`w-4 h-4 shrink-0 mt-0.5 ${botMode ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-100">自動プレイ (Bot)</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        botMode ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {botMode ? '稼働中' : 'OFF'}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-200/60 leading-tight block mt-0.5">
                      {botMode && botRemainingCount !== 'unlimited' 
                        ? `指定回数実行中（残り ${botRemainingCount} 局）`
                        : 'あなたの手番も全自動で対戦'}
                    </span>
                  </div>
                </div>

                {/* トグルスイッチ */}
                <button
                  onClick={onToggleBot}
                  className={`w-12 h-6 rounded-full transition-all relative shrink-0 p-0.5 border flex items-center shadow-inner ${
                    botMode 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                      : 'bg-[#110a06] border-amber-950/90'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 rounded-full shadow-md transition-all flex items-center justify-center ${
                      botMode 
                        ? 'translate-x-6 bg-slate-950 text-amber-400 border border-amber-300' 
                        : 'translate-x-0 bg-slate-700 text-slate-400 border border-slate-600'
                    }`} 
                  >
                    {botMode ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Minus className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </div>
                </button>
              </div>

              {/* 回数指定セレクター */}
              <div className="space-y-1 bg-[#140b06] p-2 rounded-lg border border-amber-900/40">
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-300/80">
                  <span className="flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-amber-400" />
                    対戦回数の指定:
                  </span>
                  {botMode && botRemainingCount !== 'unlimited' && (
                    <span className="text-amber-400 font-black">残り {botRemainingCount} 局</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {countOptions.map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => onChangeBotTargetCount(opt.value)}
                      className={`py-1 rounded text-[10px] font-black transition-all ${
                        botTargetCount === opt.value
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-[#22160d] text-amber-200/80 hover:text-amber-100 border border-amber-900/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot速度切り替えパネル */}
              <div className="bg-[#140b06] p-1.5 rounded-lg border border-amber-900/40 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-amber-200/80 font-bold">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>速度: {speedLabels[botSpeed].desc}</span>
                </div>
                <button
                  onClick={onChangeBotSpeed}
                  className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] rounded shadow-xs active:scale-95 transition"
                >
                  {speedLabels[botSpeed].label}
                </button>
              </div>
            </div>

            {/* 4. 統計データモーダルを開くボタン */}
            <button
              onClick={() => {
                onClose();
                onOpenStats();
              }}
              className="w-full py-2 bg-[#22160d] hover:bg-[#322013] active:scale-98 text-amber-200 font-black text-xs rounded-xl border border-amber-700/60 shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>対戦データ・統計を見る ＆ 一括テスト</span>
            </button>
          </div>

        </div>

        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          className="w-full py-2 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition shrink-0"
        >
          設定を閉じる
        </button>
      </div>
    </div>
  );
};
