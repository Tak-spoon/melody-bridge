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
        <p>「メロディ・ブリッジ」は、音楽のコード（和音）やスケール（音階）を作って手札を減らしていく音楽トランプゲームです。</p>
        
        <p><strong className="text-amber-300">【カードの構成】</strong></p>
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          1オクターブはピアノの白鍵（ドレミファソラシ）の7音のみで構成されています。<br/>
          「7音 × C2〜B5の4オクターブ × 各音2枚」＝ <strong className="text-amber-300 font-black">計56枚</strong> を使用します。<br/>
          各プレイヤーに手札7枚が配られてゲームが始まります。
        </div>
      </div>
    )
  },
  {
    title: "2. セット（役）の作り方",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場に出せる役（セット）には2種類あります。</p>
        
        {/* コード */}
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          <p className="font-black text-amber-300 text-xs mb-0.5">♪ コード（和音）</p>
          <p className="text-[11px]">和音（3〜4音）の構成音を揃えます。順番はバラバラ（転回形）でも構いません。</p>
          <p className="text-[10px] text-amber-300/80 font-bold mt-0.5">※1オクターブ以内のクローズドボイシングに対応。</p>
          <p className="text-[10px] text-amber-200/70">例：ド・ミ・ソ (C) / レ・ファ・ラ (Dm) / ミ・ソ・シ・ド (CM7転回形)</p>
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
    title: "3. 付け札 ＆ 入れ替え（★重要）",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場に出ているセットを活用して手札を有利に減らすことができます。</p>
        
        {/* 付け札 */}
        <div className="bg-[#26180f] p-2 rounded-lg border border-emerald-800/60 shadow-inner">
          <p className="font-black text-emerald-300 text-xs mb-0.5">🌿 付け札（Add）</p>
          <p className="text-[11px]">場のセットに手札のカードを1枚追加します（1手番に何枚でも可能）。</p>
          <ul className="list-disc pl-4 text-[10px] text-emerald-200/80 mt-0.5">
            <li>コード：3和音に4音目を追加して7thコード等へ進化（最大4枚）</li>
            <li>スケール：音階の両端に隣り合う音を追加して延長</li>
          </ul>
        </div>

        {/* 入れ替え */}
        <div className="bg-[#26180f] p-2 rounded-lg border border-cyan-800/60 shadow-inner">
          <p className="font-black text-cyan-300 text-xs mb-0.5">🔄 入れ替え（スワップ・リハーモナイズ）</p>
          <p className="text-[11px]">場の和音の1枚を手札の1枚と交換し、新たな和音へアレンジできます！</p>
          <ul className="list-disc pl-4 text-[10px] text-cyan-200/80 mt-0.5">
            <li>押し出された場のカードは<strong className="text-cyan-300">手札に回収</strong>されます。</li>
            <li>1手番につき最大1回まで。初手の手札事故時でも役出し前から使用可能です！</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "4. 割り込み（ポン・チー）と鳴き制限",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>他人が捨てたカードをもらってセットを完成させることができます。</p>
        
        <div className="bg-[#26180f] p-2 rounded-lg border border-amber-900/60 text-[10.5px] shadow-inner space-y-1">
          <p><strong className="text-amber-300">【ポン（コード）】</strong> 誰の捨て札からでもOK（捨て札1枚＋手札2枚）</p>
          <p><strong className="text-amber-300">【チー（スケール）】</strong> <strong className="text-amber-200">直前の人（左隣・上家）</strong>の捨て札からのみ（捨て札1枚＋手札2枚）</p>
        </div>

        <div className="bg-[#331818] p-2 rounded-lg border border-red-500/60 text-[10.5px] text-red-200 shadow-inner">
          <strong className="text-red-300 font-bold">⚠️ 鳴きアガリ禁止ルール</strong><br/>
          手札が2枚（鳴いたら手札が0枚になる状態）の時は、ポン・チーによる即アガリはできません。自力ドローや付け札・役出しでアガりましょう。
        </div>
      </div>
    )
  },
  {
    title: "5. ラウンドと勝敗（失点計算）",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p><strong className="text-amber-300">【ラウンドの終了条件】</strong></p>
        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
          <li>誰かの手札が0枚になった時（アガリ）</li>
          <li>山札0枚時の捨て札に対して誰もポン・チーしなかった時（流局）</li>
        </ul>

        <div>
          <p><strong className="text-amber-300">【ポイント計算】</strong></p>
          <p className="mt-0.5 text-[11px]">ラウンド終了時、手札に残っている枚数がそのまま「ペナルティ失点」となります（アガった人は0点）。</p>
        </div>

        <div className="bg-[#26180f] p-2 rounded-lg border border-amber-600/50 shadow-inner text-center">
          <p className="font-black text-amber-300 text-xs">
            全4ラウンド終了時、合計失点が<br/>一番少ない人の総合優勝！
          </p>
        </div>
      </div>
    )
  }
];

// -------------------------------------------------------------
// 2. 操作説明（画面の操作方法・UIガイド）
// -------------------------------------------------------------
const CONTROLS_DATA: RuleSection[] = [
  {
    title: "1. ターンの基本フロー",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>自分の手番は以下の3つのステップで進行します。</p>

        <div className="space-y-1.5 text-[11px]">
          <div className="bg-[#26180f] p-2 rounded-lg border border-amber-900/60 shadow-inner">
            <strong className="text-amber-300 block">① 引く（ドロー）：</strong>
            画面上部の<strong className="text-amber-300">「山札」</strong>をタップして1枚引きます。
          </div>
          <div className="bg-[#26180f] p-2 rounded-lg border border-amber-900/60 shadow-inner">
            <strong className="text-amber-300 block">② アクション（任意）：</strong>
            「役出し」「付け札」「入れ替え」を好きな順序で行えます。
          </div>
          <div className="bg-[#26180f] p-2 rounded-lg border border-amber-900/60 shadow-inner">
            <strong className="text-amber-300 block">③ 捨てる（ディスカード）：</strong>
            手札から不要な1枚を選び、<strong className="text-amber-300">「捨てる」</strong>を押してターン終了。
          </div>
        </div>
      </div>
    )
  },
  {
    title: "2. 役を場に出す操作（コード・スケール）",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>手札で3枚以上のコードやスケールが揃ったら、場に公開できます。</p>

        <ol className="list-decimal pl-4 space-y-1.5 bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner text-[11px]">
          <li>手札から役を作るカード（3枚以上）をタップして選択</li>
          <li>役が完成すると、右下の<strong className="text-amber-300">「コード」</strong>または<strong className="text-amber-300">「スケール」</strong>ボタンが光ります</li>
          <li>ボタンを押すと、場にセットが公開され美しい和音が響きます</li>
        </ol>
      </div>
    )
  },
  {
    title: "3. 付け札の操作方法",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場に出ているセットに、手札からカードを1枚追加する操作です。</p>

        <div className="bg-[#26180f] p-2.5 rounded-xl border border-emerald-500/80 shadow-inner space-y-1">
          <strong className="text-emerald-300 text-xs block">💡 付け札の3ステップ</strong>
          <ol className="list-decimal pl-4 space-y-1 text-amber-100 text-[11px]">
            <li>手札から追加したいカードを<strong className="text-emerald-300">1枚タップ</strong></li>
            <li>場にある追加先のセットを<strong className="text-emerald-300">タップして選択</strong>（金枠で囲まれます）</li>
            <li>右下の<strong className="text-emerald-300 font-black">「付け札」ボタン</strong>を押すとカードが差し込まれます</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    title: "4. 🔄 入れ替え（スワップ）の操作方法",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場の和音と手札のカードを1対1で入れ替えて、新たな和音へアレンジする操作です。</p>

        <div className="bg-[#26180f] p-2.5 rounded-xl border border-cyan-500/80 shadow-inner space-y-1">
          <strong className="text-cyan-300 text-xs block">💡 入れ替えの3ステップ</strong>
          <ol className="list-decimal pl-4 space-y-1 text-amber-100 text-[11px]">
            <li>手札から場に出したいカードを<strong className="text-cyan-300">1枚タップ</strong></li>
            <li>場にある和音セットを<strong className="text-cyan-300">タップして選択</strong>（金枠で囲まれます）</li>
            <li>条件を満たすと「🔄 ○○にアレンジ (○○回収)」バッジが表示され、<strong className="text-cyan-300 font-black">「入れ替え」ボタン（水色）</strong>が点灯！</li>
            <li>ボタンを押すと、場の古いカードが上へ押し出され、手札に回収されます</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    title: "5. ポン・チーの操作方法",
    content: (
      <div className="space-y-2.5 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>他人がカードを捨てた瞬間に割り込む操作方法です。</p>

        <ol className="list-decimal pl-4 space-y-1.5 bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner text-[11px]">
          <li>ポン・チーができる時、手札の使えるカードが持ち上がります</li>
          <li>使えるカードをタップすると、鳴きに使う2枚のペアが自動で選ばれます（同じカードを再度タップで別のペアに切り替え）</li>
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
