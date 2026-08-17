import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface RuleSection {
  title: string;
  content: React.ReactNode;
}

const RULES: RuleSection[] = [
  {
    title: "1. ゲームの目的とカード構成",
    content: (
      <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed">
        <p>「メロディ・ブリッジ」は、音楽のコード（和音）やスケール（音階）を作って手札を減らしていく、セブンブリッジや麻雀に似たカードゲームです。</p>
        
        <p><strong className="text-amber-300">【カードの構成】</strong></p>
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 shadow-inner">
          1オクターブはピアノの白鍵（ドレミファソラシ）の7音のみで構成されています。<br/>
          「7音 × C3〜B5の3オクターブ × 赤青2色」＝ <strong className="text-amber-400 font-black">計42枚</strong> のカードを使用します。
        </div>
      </div>
    )
  },
  {
    title: "2. 基本ルール",
    content: (
      <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed">
        <p><strong className="text-amber-300">【ゲームの進行】</strong></p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>プレイヤーは4人（あなたとCPU3人）。</li>
          <li>各プレイヤーに最初に7枚のカードが配られます。</li>
          <li>ゲーム開始時、山札の上から2枚が裏向きで捨てられ（王牌）、残りの山札は12枚からスタートします。</li>
          <li>自分のターンに山札から1枚引き、役（セット）を作って場に出すか、不要なカードを1枚捨てます。</li>
          <li>全4ラウンドを行い、手札の残り枚数が少ない（失点が少ない）人が総合優勝となります。</li>
        </ul>
      </div>
    )
  },
  {
    title: "3. ラウンドと勝敗",
    content: (
      <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed">
        <p><strong className="text-amber-300">【ラウンドの終了条件】</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>誰かの手札が0枚になった時（アガリ）</li>
          <li><strong className="text-rose-400">0枚になった山札を引こうとした時（流局）</strong></li>
        </ul>
        
        <div className="mt-3">
          <p><strong className="text-amber-300">【ポイント（スコア）計算】</strong></p>
          <p className="mt-1">ラウンド終了時、手札に残っているカードの枚数がそのまま「ペナルティポイント」として加算されます（アガった人は0ポイント）。</p>
        </div>

        <div className="mt-3 bg-[#26180f] p-2 rounded-lg border border-amber-600/50 shadow-inner">
          <p className="font-black text-amber-300 text-center text-xs">
            全4ラウンド終了時、合計ポイントが<br/>一番少ない（0に近い）人の優勝！
          </p>
        </div>
      </div>
    )
  },
  {
    title: "4. セット（役）の作り方",
    content: (
      <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed">
        <p>場に出せる「セット」には2種類あります。<strong className="text-amber-300">必ず同じ色（赤のみ、青のみ）で揃える必要があります。</strong></p>
        
        <div className="bg-[#2a1410] p-2.5 rounded-lg border border-rose-800/80">
          <p className="font-black text-rose-300 text-[13px] mb-1">♪ コード（和音）</p>
          <p>音楽理論における和音（3〜4音）の構成音を揃えます。順番はバラバラ（転回形）でも構いません。</p>
          <p className="text-[10px] text-rose-300/80 font-bold mt-1">※コードのボイシングは、クローズドボイシング（1オクターブ以内におさまる形）のみ対応しています。</p>
          <p className="text-[10px] text-rose-200/70 mt-0.5">例：ド・ミ・ソ (C) / ミ・ソ・シ・ド (CM7の転回形)</p>
        </div>
        
        <div className="bg-[#131b2c] p-2.5 rounded-lg border border-indigo-800/80">
          <p className="font-black text-indigo-300 text-[13px] mb-1">➡ スケール（音階）</p>
          <p>音階順に連続する3枚以上のカードを揃えます。</p>
          <p className="text-[10px] text-indigo-200/70 mt-1">例：ド・レ・ミ / ソ・ラ・シ・ド など</p>
        </div>
      </div>
    )
  },
  {
    title: "5. ターンの行動",
    content: (
      <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed">
        <p>自分のターンが来たら、以下の順序で行動します。</p>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-amber-300">ドロー：</strong><br/>
            山札から1枚引きます。
          </li>
          <li>
            <strong className="text-amber-300">アクション（任意）：</strong><br/>
            手札から完成した3枚以上のセットを場に出せます。<br/>
            また、すでに場に出ているセットに手札から1枚追加する<strong className="text-emerald-400">「付け札」</strong>も可能です。<br/>
            条件を満たす限り、<strong className="text-emerald-400">同じ手番中に何度でも</strong>付け札ができます。
            <ul className="list-disc pl-4 mt-1 text-[11px] text-amber-200/70">
              <li><strong>コードへの付け札：</strong> 構成音として成立する最大4音まで。</li>
              <li><strong>スケールへの付け札：</strong> 連番（2度）で繋がるのであれば枚数制限なし。</li>
            </ul>
          </li>
          <li>
            <strong className="text-amber-300">捨てる：</strong><br/>
            手札から不要なカードを1枚選んで捨て、ターンを終了します。
          </li>
        </ol>
      </div>
    )
  },
  {
    title: "6. 割り込み（ポン・チー）",
    content: (
      <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed">
        <p>他人がカードを捨てた瞬間、自分のターンでなくてもそのカードをもらってセットを作ることができます。</p>
        
        <div className="bg-[#26180f] p-2.5 rounded-lg border border-amber-900/60 text-[11px]">
          <strong className="text-rose-400">【重要】割り込みで作れるのは「3枚1組」のみ</strong><br/>
          手札から一度に同時に出せるのは<strong>2枚まで</strong>です（捨て札1枚＋手札2枚＝計3枚）。いきなり4枚組は作れません。<br/>
          <span className="text-amber-200/60 mt-1 block">例：手札に「ド・ミ・ソ」がある時、他人の捨て札「シ」に対して手札3枚をすべて出し、一気に4和音を作ることは不可。「ミ・ソ」の2枚を出して「ミ・ソ・シ」の3和音を作ることは可能です。</span>
        </div>

        <ul className="list-disc pl-5 space-y-1.5 mt-2">
          <li>
            <strong className="text-rose-400">ポン（コード作成）：</strong><br/>
            誰の捨て札からでも可能です。捨て札＋自分の手札2枚で「コード」が作れる場合に割り込めます。
          </li>
          <li>
            <strong className="text-indigo-400">チー（スケール作成）：</strong><br/>
            <strong>直前の順番の人（上家）</strong>の捨て札からのみ可能です。捨て札＋手札2枚で「スケール」が作れる場合に割り込めます。
          </li>
        </ul>
      </div>
    )
  }
];

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ isOpen, onClose }) => {
  const [rulePage, setRulePage] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // ページ切り替え時にスクロール位置を最上部にリセット
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [rulePage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[80] p-4">
      <div className="bg-[#180f09] rounded-2xl p-4 max-w-sm w-full h-[490px] max-h-[85vh] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col border-2 border-amber-500/60 animate-in fade-in zoom-in-95 duration-200">
        {/* 固定ヘッダー */}
        <div className="flex justify-between items-center mb-3 border-b border-[#382315] pb-2.5 shrink-0">
          <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>遊び方・ルール</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-amber-400/70 hover:text-amber-200 p-1 rounded-lg hover:bg-[#281a10] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* スクロールコンテンツ領域（高さ固定で伸縮なし） */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0" ref={contentRef}>
          <h4 className="font-black text-amber-300 text-xs mb-2 border-l-4 border-amber-500 pl-2">
            {RULES[rulePage].title}
          </h4>
          {RULES[rulePage].content}
        </div>

        {/* 固定フッター（ボタン位置が一切ブレない） */}
        <div className="mt-3 flex flex-col gap-2.5 pt-2 border-t border-[#382315] shrink-0">
          <div className="flex justify-between items-center text-xs">
            <button 
              disabled={rulePage === 0} 
              onClick={() => setRulePage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#26180f] hover:bg-[#382315] text-amber-200 border border-amber-700/50 disabled:opacity-30 disabled:pointer-events-none font-bold rounded-lg transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> 前へ
            </button>
            <span className="text-amber-400/80 font-black text-xs">{rulePage + 1} / {RULES.length}</span>
            <button 
              disabled={rulePage === RULES.length - 1} 
              onClick={() => setRulePage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#26180f] hover:bg-[#382315] text-amber-200 border border-amber-700/50 disabled:opacity-30 disabled:pointer-events-none font-bold rounded-lg transition"
            >
              次へ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="w-full py-2 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
