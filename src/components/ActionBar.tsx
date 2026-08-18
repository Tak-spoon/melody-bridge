import React from 'react';

interface ActionBarProps {
  selectedCount: number;
  isPlayerTurn: boolean;
  isMainPhase: boolean;
  isInterruptTurn: boolean;
  isMyInterrupt: boolean;
  canPon: boolean;
  canChii: boolean;
  isValidScaleSelection: boolean;
  isValidChordSelection: boolean;
  isValidAddSelection: boolean;
  isValidSwapSelection?: boolean;
  onMeld: (type: 'scale' | 'chord') => void;
  onAdd: () => void;
  onSwap?: () => void;
  onDiscard: (cardId: string) => void;
  onPassInterrupt: () => void;
  onInterruptAction: (type: 'pon' | 'chii') => void;
  firstSelectedCardId?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  isPlayerTurn,
  isMainPhase,
  isInterruptTurn,
  isMyInterrupt,
  canPon,
  canChii,
  isValidScaleSelection,
  isValidChordSelection,
  isValidAddSelection,
  isValidSwapSelection,
  onMeld,
  onAdd,
  onSwap,
  onDiscard,
  onPassInterrupt,
  onInterruptAction,
  firstSelectedCardId
}) => {
  return (
    <div className="bg-[#21130a] border-2 border-[#54331d] rounded-xl px-3 py-1.5 shadow-md flex items-center justify-center shrink-0 z-20 min-h-[38px]">
      <div className="w-full flex gap-1.5 items-center justify-between">
        {isInterruptTurn && isMyInterrupt ? (
          <>
            <button 
              onClick={onPassInterrupt} 
              className="flex-1 py-1.5 bg-slate-600 hover:bg-slate-500 border border-slate-400 active:scale-95 text-white text-[11px] font-black rounded-lg shadow-xs transition"
            >
              パス
            </button>
            <button 
              onClick={() => onInterruptAction('chii')} 
              disabled={!canChii || selectedCount !== 2} 
              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 disabled:bg-[#1a1109] disabled:border-[#382215] disabled:text-amber-900/40 active:scale-95 text-white text-[11px] font-black rounded-lg shadow-xs transition"
            >
              チー
            </button>
            <button 
              onClick={() => onInterruptAction('pon')} 
              disabled={!canPon || selectedCount !== 2} 
              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 border border-rose-400 disabled:bg-[#1a1109] disabled:border-[#382215] disabled:text-amber-900/40 active:scale-95 text-white text-[11px] font-black rounded-lg shadow-xs transition"
            >
              ポン
            </button>
          </>
        ) : isInterruptTurn ? (
          <div className="w-full text-center text-[10.5px] text-amber-300 font-bold animate-pulse py-1 bg-amber-950/80 rounded-lg border border-amber-500/50">
            他プレイヤーの割り込み確認中...
          </div>
        ) : (
          <>
            <button 
              disabled={!isPlayerTurn || !isMainPhase || !isValidScaleSelection} 
              onClick={() => onMeld('scale')} 
              className="flex-1 py-1.5 sm:py-1 bg-sky-600 hover:bg-sky-500 border border-sky-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
              title="音階（3音以上）を場に出す"
            >
              スケール
            </button>
            <button 
              disabled={!isPlayerTurn || !isMainPhase || !isValidChordSelection} 
              onClick={() => onMeld('chord')} 
              className="flex-1 py-1.5 sm:py-1 bg-amber-600 hover:bg-amber-500 border border-amber-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
              title="和音（3音）を場に出す"
            >
              コード
            </button>
            <button 
              disabled={!isPlayerTurn || !isMainPhase || !isValidAddSelection} 
              onClick={onAdd} 
              className="flex-1 py-1.5 sm:py-1 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
              title="選択した1枚を場のセットに付ける"
            >
              付け札
            </button>
            <button 
              disabled={!isPlayerTurn || !isMainPhase || !isValidSwapSelection} 
              onClick={onSwap} 
              className="flex-1 py-1.5 sm:py-1 bg-orange-600 hover:bg-orange-500 border border-orange-400 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
              title="手札の1枚と場の1枚を入れ替えて手札に回収する"
            >
              入れ替え
            </button>
            <button 
              disabled={!isPlayerTurn || !isMainPhase || selectedCount !== 1 || !firstSelectedCardId} 
              onClick={() => firstSelectedCardId && onDiscard(firstSelectedCardId)} 
              className="flex-1 py-1.5 sm:py-1 bg-rose-700 hover:bg-rose-600 border border-rose-500 disabled:bg-[#170f08] disabled:border-[#331e11] disabled:text-amber-900/50 active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black rounded-lg shadow-xs transition touch-manipulation"
              title="選択した1枚を手札から捨てる"
            >
              捨てる
            </button>
          </>
        )}
      </div>
    </div>
  );
};
