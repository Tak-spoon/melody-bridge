import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Gamepad2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface RuleSection {
  title: string;
  content: React.ReactNode;
}

// -------------------------------------------------------------
// 1. ルール説明（ゲームの概念・音楽理論・勝敗）
// -------------------------------------------------------------
const RULES_DATA: RuleSection[] = [
  {
    title: "1. ゲームの目的とカード構成",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>「メロディ・ブリッジ」は、音楽のコード（和音）やスケール（音階）を作って手札を減らしていくトランプゲームです。</p>
        
        <p><strong className="text-amber-300">【カードの構成】</strong></p>
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          1オクターブはピアノの白鍵（ドレミファソラシ）の7音のみで構成されています。<br/>
          「7音 × C3〜B5の3オクターブ × 赤青2色」＝ <strong className="text-amber-300 font-black">計42枚</strong> を使用します。
        </div>

        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 text-[11px] text-amber-200/80 shadow-inner">
          ※カードの「赤」と「青」はトランプのマーク（スート）です。役を作るときは必ず同じ色同士で揃えます（赤のみ、または青のみ）。
        </div>
      </div>
    )
  },
  {
    title: "2. セット（役）の作り方",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場に出せる役（セット）には2種類あります。<strong className="text-amber-300">必ず同じ色（赤カード同士、または青カード同士）で揃えます。</strong></p>
        
        {/* コード */}
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          <p className="font-black text-amber-300 text-xs mb-0.5">♪ コード（和音）</p>
          <p className="text-[11px]">和音（3〜4音）の構成音を揃えます。順番はバラバラ（転回形）でも構いません。</p>
          <p className="text-[10px] text-amber-300/80 font-bold mt-0.5">※クローズドボイシング（1オクターブ以内）のみ対応。</p>
          <p className="text-[10px] text-amber-200/70">例：ド・ミ・ソ (C) / ミ・ソ・シ・ド (CM7の転回形)</p>
        </div>
        
        {/* スケール */}
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          <p className="font-black text-amber-300 text-xs mb-0.5">➡ スケール（音階）</p>
          <p className="text-[11px]">音階順に連続する3枚以上のカードを揃えます。</p>
          <p className="text-[10px] text-amber-200/70 mt-0.5">例：ド・レ・ミ / ソ・ラ・シ・ド など</p>
        </div>
      </div>
    )
  },
  {
    title: "3. ラウンドと勝敗（失点計算）",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p><strong className="text-amber-300">【ラウンドの終了条件】</strong></p>
        <ul className="list-disc pl-4 space-y-1 text-[11px]">
          <li>誰かの手札が0枚になった時（アガリ）</li>
          <li><strong className="text-amber-300">山札が0枚の時の捨て札に対して誰もポン・チーしなかった時（流局）</strong></li>
        </ul>

        <div className="bg-[#26180f] p-2 rounded-lg border border-amber-900/60 text-[10.5px] text-amber-200/80 shadow-inner">
          ※山札が0枚になっても、捨て札を拾って手札（失点）を減らす連鎖チャンスが続きます。誰も拾えなくなった瞬間にラウンド終了となります。
        </div>
        
        <div>
          <p><strong className="text-amber-300">【ポイント計算】</strong></p>
          <p className="mt-0.5 text-[11px]">ラウンド終了時、手札に残っている枚数がそのまま「ペナルティ失点」として加算されます（アガった人は0点）。</p>
        </div>

        <div className="bg-[#26180f] p-2 rounded-lg border border-amber-600/50 shadow-inner text-center">
          <p className="font-black text-amber-300 text-xs">
            全4ラウンド終了時、合計失点が<br/>一番少ない人の総合優勝！
          </p>
        </div>
      </div>
    )
  },
  {
    title: "4. 割り込みルール（ポン・チー）",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>他人がカードを捨てた瞬間、そのカードをもらってセットを完成させることができます。</p>
        
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 text-[11px] shadow-inner">
          <strong className="text-amber-300 font-black">【重要】割り込みは「捨て札1枚＋手札2枚」の3枚組のみ</strong><br/>
          手札から一度に出せるのは2枚までです。いきなり4枚組は作れません。
        </div>

        <ul className="list-disc pl-4 space-y-1 text-[11px]">
          <li>
            <strong className="text-amber-300">ポン（コード作成）：</strong><br/>
            誰の捨て札からでも可能です。手札2枚と合わせてコードが作れる場合に割り込めます。
          </li>
          <li>
            <strong className="text-amber-300">チー（スケール作成）：</strong><br/>
            <strong className="text-amber-200">直前の順番の人（左隣・上家）</strong>の捨て札からのみ可能です。手札2枚と合わせてスケールが作れる場合に割り込めます。
          </li>
        </ul>
      </div>
    )
  }
];

// -------------------------------------------------------------
// 2. 操作説明（画面の操作方法・UIガイド）
// -------------------------------------------------------------
const CONTROLS_DATA: RuleSection[] = [
  {
    title: "1. カードを引く ＆ 捨てる",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          <strong className="text-amber-300 block mb-0.5">🎴 カードを引く（ドロー）</strong>
          自分のターンが来たら、画面上部・右側の<strong className="text-amber-300">「山札」をタップ</strong>してカードを1枚引きます。
        </div>

        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          <strong className="text-amber-300 block mb-0.5">🗑️ カードを捨てる（ターン終了）</strong>
          手札から不要なカードを<strong className="text-amber-300">1枚タップ</strong>して選び、右下の<strong className="text-amber-300">「捨てる」ボタン</strong>を押します。
        </div>
      </div>
    )
  },
  {
    title: "2. 役を場に出す操作（コード・スケール）",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>手札で3枚以上のコードやスケールが完成したら、場に公開できます。</p>

        <ol className="list-decimal pl-4 space-y-1.5 bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner text-[11px]">
          <li>手札から役を構成するカード（3枚以上）をタップして選択</li>
          <li>役が完成すると、右下の<strong className="text-amber-300">「コード」</strong>または<strong className="text-amber-300">「スケール」</strong>ボタンが光ります</li>
          <li>ボタンを押すと、場にセットが公開されます</li>
        </ol>
      </div>
    )
  },
  {
    title: "3. 付け札の操作方法（★重要）",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>すでに場に出ている自分や相手のセットに、手札からカードを1枚追加できます（1ターンに何度でも可能）。</p>

        <div className="bg-[#26180f] p-3 rounded-xl border-2 border-amber-500/80 shadow-inner">
          <strong className="text-amber-300 text-xs block mb-1">💡 付け札の3ステップ操作</strong>
          <ol className="list-decimal pl-4 space-y-1 text-amber-100 text-[11px]">
            <li>手札から追加したいカードを<strong className="text-amber-300">1枚タップ</strong>して選択</li>
            <li>場にある追加先のセットを<strong className="text-amber-300">タップして選択</strong>（金枠で囲まれます）</li>
            <li>右下の<strong className="text-amber-300 font-black">「付け札」ボタン</strong>を押すと、カードがシュッと差し込まれます</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    title: "4. ポン・チーの操作方法",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>他人がカードを捨てた瞬間に割り込む操作方法です。</p>

        <ol className="list-decimal pl-4 space-y-1.5 bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner text-[11px]">
          <li>ポン・チーができる時、手札の使えるカードが持ち上がります</li>
          <li>使えるカードをタップすると、鳴きに使う2枚の組み合わせが自動で選ばれます（同じカードを再度タップで別のペアに切り替え）</li>
          <li>右下の<strong className="text-amber-300">「ポン」</strong>または<strong className="text-amber-300">「チー」</strong>ボタンを押して割り込みます（不要なら「パス」）</li>
        </ol>
      </div>
    )
  }
];

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'controls'>('rules');
  const [page, setPage] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // スワイプ / ドラッグ判定用のポインタ追跡
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const currentData = activeTab === 'rules' ? RULES_DATA : CONTROLS_DATA;

  // タブやページ切り替え時にスクロール位置を最上部にリセット
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab, page]);

  // タブ切り替え時にページを0にリセット
  const handleTabChange = (tab: 'rules' | 'controls') => {
    setActiveTab(tab);
    setPage(0);
  };

  // スワイプ処理
  const handleSwipeEnd = (endX: number) => {
    if (touchStartX === null) return;
    const diff = touchStartX - endX;
    const threshold = 35; // スワイプ検知しきい値(px)

    if (diff > threshold) {
      // 左スワイプ（次へ）
      if (page < currentData.length - 1) {
        setPage(p => p + 1);
      }
    } else if (diff < -threshold) {
      // 右スワイプ（前へ）
      if (page > 0) {
        setPage(p => p - 1);
      }
    }
    setTouchStartX(null);
    setIsMouseDown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[80] p-4">
      <div className="bg-[#180f09] rounded-2xl p-4 max-w-sm w-full h-[475px] max-h-[90vh] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col border-2 border-amber-500/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 固定ヘッダー */}
        <div className="flex justify-between items-center mb-2 border-b border-[#382315] pb-1.5 shrink-0">
          <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>遊び方・ガイド</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-amber-400/70 hover:text-amber-200 p-1 rounded-lg hover:bg-[#281a10] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2大タブ（ルール説明 ＆ 操作ガイド） */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0e0805] rounded-xl border border-amber-900/60 mb-2 shrink-0">
          <button
            onClick={() => handleTabChange('rules')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'rules'
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-md border border-amber-200'
                : 'text-amber-300/70 hover:text-amber-100 hover:bg-[#26180f]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📜 ルール説明</span>
          </button>

          <button
            onClick={() => handleTabChange('controls')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'controls'
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-md border border-amber-200'
                : 'text-amber-300/70 hover:text-amber-100 hover:bg-[#26180f]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>🎮 操作ガイド</span>
          </button>
        </div>

        {/* 視覚的スワイプ・プログレスバー（各ステップの進捗が一目でわかるバー） */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5 shrink-0 px-0.5">
          {currentData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              className={`h-1.5 rounded-full transition-all ${
                page === idx
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                  : idx < page
                    ? 'bg-amber-600/70'
                    : 'bg-[#331e11]'
              }`}
              title={`${idx + 1}ページ目`}
            />
          ))}
        </div>
        
        {/* スワイプ可能コンテンツ領域（左右に控えめなナビゲーションシェブロン） */}
        <div className="relative flex-1 min-h-0 flex items-stretch">
          {/* 左スワイプ・ナビゲーション矢印（視覚的手がかり） */}
          {page > 0 && (
            <button
              onClick={() => setPage(p => p - 1)}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-black/40 hover:bg-black/70 text-amber-300/60 hover:text-amber-200 flex items-center justify-center rounded-r-lg transition backdrop-blur-xs"
              aria-label="前のページ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* メインコンテンツ（タッチ・ドラッグスワイプ可能） */}
          <div 
            ref={contentRef}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
            onMouseDown={(e) => {
              setTouchStartX(e.clientX);
              setIsMouseDown(true);
            }}
            onMouseUp={(e) => {
              if (isMouseDown) handleSwipeEnd(e.clientX);
            }}
            onMouseLeave={(e) => {
              if (isMouseDown) handleSwipeEnd(e.clientX);
            }}
            className="w-full flex-1 overflow-y-auto px-1 min-h-0 cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <div className="mb-2">
              <h4 className="font-black text-amber-300 text-xs border-l-4 border-amber-500 pl-2">
                {currentData[page].title}
              </h4>
            </div>
            
            <div key={`${activeTab}-${page}`} className="animate-in fade-in duration-200">
              {currentData[page].content}
            </div>
          </div>

          {/* 右スワイプ・ナビゲーション矢印（視覚的手がかり） */}
          {page < currentData.length - 1 && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-black/40 hover:bg-black/70 text-amber-300/60 hover:text-amber-200 flex items-center justify-center rounded-l-lg transition backdrop-blur-xs"
              aria-label="次のページ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 固定フッター（ドットインジケーター ＆ 閉じるボタン） */}
        <div className="mt-2.5 flex items-center justify-between gap-3 pt-2 border-t border-[#382315] shrink-0">
          
          {/* ドットインジケーター ＆ ページ数 */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-amber-400/80 tracking-wider">
              {page + 1} / {currentData.length}
            </span>
            <div className="flex items-center gap-1.5">
              {currentData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`transition-all rounded-full ${
                    page === idx 
                      ? 'w-4 h-1.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                      : 'w-1.5 h-1.5 bg-[#3f2717] hover:bg-amber-700/60'
                  }`}
                  title={`${idx + 1}ページ目`}
                />
              ))}
            </div>
          </div>

          {/* 閉じるボタン */}
          <button 
            onClick={onClose} 
            className="px-6 py-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
