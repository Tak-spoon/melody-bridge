import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Gamepad2, X, ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, AlertCircle, PlusCircle, RefreshCw } from 'lucide-react';

interface RuleSection {
  title: string;
  content: React.ReactNode;
}

// -------------------------------------------------------------
// マニュアル専用：視覚的ミニカードコンポーネント
// -------------------------------------------------------------
interface MiniCardProps {
  note: string;
  oct?: number;
  jp: string;
  highlight?: 'gold' | 'blue' | 'green' | 'orange' | 'purple' | 'red';
  compact?: boolean;
}

const MiniCard: React.FC<MiniCardProps> = ({ note, oct = 3, jp, highlight, compact = false }) => {
  let borderClass = 'border-amber-700/60 bg-[#faf7ee] text-amber-950';
  if (highlight === 'gold') borderClass = 'border-amber-400 bg-amber-100/90 text-amber-950 ring-1 ring-amber-400';
  if (highlight === 'blue') borderClass = 'border-sky-400 bg-sky-100/90 text-sky-950 ring-1 ring-sky-400';
  if (highlight === 'green') borderClass = 'border-emerald-400 bg-emerald-100/90 text-emerald-950 ring-1 ring-emerald-400';
  if (highlight === 'orange') borderClass = 'border-orange-400 bg-orange-100/90 text-orange-950 ring-1 ring-orange-400';
  if (highlight === 'purple') borderClass = 'border-purple-400 bg-purple-100/90 text-purple-950 ring-1 ring-purple-400';
  if (highlight === 'red') borderClass = 'border-rose-400 bg-rose-100/90 text-rose-950 ring-1 ring-rose-400';

  const sizeClass = compact 
    ? 'w-[22px] h-[31px] rounded-[3px]' 
    : 'w-6 h-9 sm:w-7 sm:h-10 rounded';

  return (
    <div className={`inline-flex flex-col items-center justify-center border shadow-xs select-none shrink-0 ${sizeClass} ${borderClass}`}>
      <span className={`${compact ? 'text-[8.5px]' : 'text-[9.5px] sm:text-[10.5px]'} font-black leading-none flex items-baseline`}>
        {note}
        <span className={`${compact ? 'text-[6px]' : 'text-[6.5px]'} font-bold opacity-75 ml-0.2`}>{oct}</span>
      </span>
      <span className={`${compact ? 'text-[6.5px]' : 'text-[7px]'} font-bold opacity-85 leading-none mt-0.5`}>
        {jp}
      </span>
    </div>
  );
};

// -------------------------------------------------------------
// 1. ルール説明（ゲームの目的・役・勝敗・成立コード一覧）
// -------------------------------------------------------------
const RULES_DATA: RuleSection[] = [
  {
    title: "1. ゲームの目的 と カード構成",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p className="text-amber-200">
          トランプの<strong>セブンブリッジ（ラミー）</strong>をベースにした音楽カードゲームです。<br/>
          手札から<strong>「コード（和音）」</strong>や<strong>「スケール（音階）」</strong>を作って場に出し、誰よりも早く手札を0枚にした人が勝利（アガリ）となります！
        </p>

        {/* 手番の流れ（セブンブリッジサイクル） */}
        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 shadow-inner flex items-center justify-around text-center text-[10px]">
          <div className="flex flex-col items-center">
            <span className="font-bold text-amber-400">① 引く</span>
            <span className="text-[9px] text-amber-200/70">山札からドロー</span>
          </div>
          <span className="text-amber-600 font-bold">➔</span>
          <div className="flex flex-col items-center">
            <span className="font-bold text-emerald-400">② 減らす</span>
            <span className="text-[9px] text-amber-200/70">役出し / 付け札</span>
          </div>
          <span className="text-amber-600 font-bold">➔</span>
          <div className="flex flex-col items-center">
            <span className="font-bold text-rose-400">③ 捨てる</span>
            <span className="text-[9px] text-amber-200/70">不要な1枚</span>
          </div>
        </div>
        
        {/* カードの構成 */}
        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-300">カードの構成（全56枚）</span>
            <span className="text-[10px] text-amber-400/90 font-bold">初期手札: 各7枚</span>
          </div>
          <div className="flex items-center justify-between gap-0.5 bg-[#120a05] p-1.5 rounded-lg border border-amber-950">
            <MiniCard note="C" oct={3} jp="ド" />
            <MiniCard note="D" oct={3} jp="レ" />
            <MiniCard note="E" oct={3} jp="ミ" />
            <MiniCard note="F" oct={3} jp="ファ" />
            <MiniCard note="G" oct={3} jp="ソ" />
            <MiniCard note="A" oct={3} jp="ラ" />
            <MiniCard note="B" oct={3} jp="シ" />
          </div>
          <p className="text-[9.5px] text-amber-200/80 leading-tight">
            ピアノの白鍵7音 × 4オクターブ（C2〜B5）× 各音2枚 ＝ <strong>計56枚</strong> を使用。
          </p>
        </div>
      </div>
    )
  },
  {
    title: "2. 役の基本 と クローズドボイシング",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場に出せる役（セット）は <strong>3枚以上</strong> で成立します。</p>
        
        {/* ボイシングルール警告ボックス */}
        <div className="bg-[#301c10] p-2 rounded-xl border border-amber-500/70 text-[10px] text-amber-100 shadow-inner">
          <strong className="text-amber-300 font-bold block mb-0.5">※ クローズドボイシング（密集配置）限定</strong>
          コードは最高音と最低音の音程差が <strong>「1オクターブ（7音分）以内」</strong> に収まっている必要があります（オクターブをまたぐ離れた配置は不可）。順番の並び替え（転回形）は自由です。
        </div>

        {/* 2大役の概要 */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <div className="bg-[#24150c] p-2 rounded-xl border border-amber-500/40 text-[10px] shadow-inner space-y-1">
            <span className="font-black text-amber-300 block">コード（3〜4枚）</span>
            <div className="flex items-center gap-0.5 justify-center py-0.5">
              <MiniCard note="C" oct={3} jp="ド" highlight="gold" />
              <MiniCard note="E" oct={3} jp="ミ" highlight="gold" />
              <MiniCard note="G" oct={3} jp="ソ" highlight="gold" />
            </div>
            <span className="text-amber-300/80 block text-center text-[9px]">ド・ミ・ソ (C)</span>
          </div>

          <div className="bg-[#24150c] p-2 rounded-xl border border-sky-500/40 text-[10px] shadow-inner space-y-1">
            <span className="font-black text-sky-300 block">スケール（3枚以上）</span>
            <div className="flex items-center gap-0.5 justify-center py-0.5">
              <MiniCard note="C" oct={3} jp="ド" highlight="blue" />
              <MiniCard note="D" oct={3} jp="レ" highlight="blue" />
              <MiniCard note="E" oct={3} jp="ミ" highlight="blue" />
            </div>
            <span className="text-sky-300/80 block text-center text-[9px]">音階順に連続</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "3. 付け札 と 入れ替え（アレンジ）",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>場に出ているセットを活用して手札を有利に減らせます。</p>
        
        {/* 付け札 */}
        <div className="bg-[#24150c] p-2 rounded-xl border border-emerald-500/40 space-y-1 shadow-inner">
          <span className="font-black text-emerald-300 text-xs flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" /> 付け札（1手番何枚でもOK）
          </span>
          <div className="flex items-center gap-1 bg-[#120a05] p-1.5 rounded-lg border border-amber-950 text-[10px]">
            <div className="flex items-center gap-0.5">
              <MiniCard note="C" oct={3} jp="ド" />
              <MiniCard note="E" oct={3} jp="ミ" />
              <MiniCard note="G" oct={3} jp="ソ" />
            </div>
            <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
            <div className="flex items-center gap-0.5">
              <span className="text-emerald-300 font-bold">+</span>
              <MiniCard note="B" oct={3} jp="シ" highlight="green" />
            </div>
            <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-black">CM7 に進化！</span>
          </div>
        </div>

        {/* 入れ替え */}
        <div className="bg-[#24150c] p-2 rounded-xl border border-orange-500/40 space-y-1 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-black text-orange-300 text-xs flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> 入れ替え（3〜4和音対応・1手番1回）
            </span>
          </div>
          <p className="text-[10px] text-orange-200/80">場の和音（3〜4音）の1枚を手札と交換し、別の和音へアレンジ（抜いたカードは手札回収）！</p>
          <div className="flex items-center gap-1 bg-[#120a05] p-1.5 rounded-lg border border-amber-950 text-[10px]">
            <div className="flex items-center gap-0.5">
              <MiniCard note="C" oct={3} jp="ド" />
              <MiniCard note="E" oct={3} jp="ミ" />
              <MiniCard note="G" oct={3} jp="ソ" />
            </div>
            <ArrowRight className="w-3 h-3 text-orange-400 shrink-0" />
            <div className="flex items-center gap-0.5">
              <span className="text-orange-300 font-bold">入替</span>
              <MiniCard note="B" oct={3} jp="シ" highlight="orange" />
            </div>
            <ArrowRight className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="text-orange-300 font-black">Em (ド回収)</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "4. 割り込み（ポン・チー）と鳴き制限",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <p>他人が捨てたカードを使って、自分の手番外でもセットを場に出せます。</p>
        
        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 space-y-1.5 shadow-inner text-[10.5px]">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[10px] shrink-0">ポン</span>
            <span><strong>コードを完成</strong>：誰の捨て札からでも可能（捨て札1枚＋手札2枚）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-black text-[10px] shrink-0">チー</span>
            <span><strong>スケールを完成</strong>：<strong>直前の人（左隣・上家）</strong>の捨て札からのみ</span>
          </div>
        </div>

        <div className="bg-[#301614] p-2 rounded-xl border border-rose-500/70 text-[10px] text-rose-200 shadow-inner flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 block">鳴きアガリ禁止ルール</strong>
            手札2枚（鳴いたら手札0枚になる状態）の時は、ポン・チーによる即アガリはできません。自力ドローや付け札でアガりましょう。
          </div>
        </div>
      </div>
    )
  },
  {
    title: "5. ラウンド勝敗とポイント計算",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 space-y-1 shadow-inner text-[10.5px]">
          <span className="text-amber-300 font-bold block">ラウンド終了条件</span>
          <ul className="list-disc pl-4 space-y-0.5 text-amber-200/90">
            <li>誰かの手札が0枚になった時（アガリ）</li>
            <li>山札0枚時の捨て札に対して誰もポン・チーしなかった時（流局）</li>
          </ul>
        </div>

        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 space-y-1.5 shadow-inner text-[10.5px]">
          <span className="text-amber-300 font-bold block">ラウンド獲得ポイント計算方程式</span>
          <p className="text-amber-200/90 font-bold text-amber-300">
            【ラウンド獲得点】＝ 着順点 ＋ 手札削減成果ボーナス
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
            <div className="bg-[#180f09] p-1.5 rounded border border-amber-950/60">
              <span className="text-amber-400 font-bold block">🥇 着順点（固定）</span>
              1位: <strong>+40pt</strong> / 2位: <strong>+15pt</strong><br />
              3位: <strong>+5pt</strong> / 4位: <strong>0pt</strong>
            </div>
            <div className="bg-[#180f09] p-1.5 rounded border border-amber-950/60">
              <span className="text-emerald-400 font-bold block">🎵 手札削減成果加点</span>
              ・役出し: 1つにつき <strong>+5pt</strong><br />
              ・付け札: 1枚につき <strong>+3pt</strong>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-950 via-[#3a2012] to-amber-950 p-2 rounded-xl border border-amber-500/60 text-center shadow-md">
          <p className="font-black text-amber-300 text-xs">
            全4ラウンド終了時、獲得ポイントが最も多いプレイヤーが総合優勝！
          </p>
        </div>
      </div>
    )
  }
,
  {
    title: "6. 基本3和音一覧（全7種）",
    content: (
      <div className="space-y-1 text-xs text-amber-100/90 select-none">
        <p className="text-[10px] text-amber-200/80">
          白鍵で作れる基本の3和音一覧です（1オクターブ内・転回形もOK）。
        </p>

        {/* カードデザインを活かした2列グリッド（スクロールゼロ） */}
        <div className="grid grid-cols-2 gap-1 bg-[#140b07] p-1.5 rounded-xl border border-amber-900/70">
          {/* C */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10.5px] w-6">C</span>
            <div className="flex gap-0.5">
              <MiniCard note="C" oct={3} jp="ド" highlight="gold" compact />
              <MiniCard note="E" oct={3} jp="ミ" highlight="gold" compact />
              <MiniCard note="G" oct={3} jp="ソ" highlight="gold" compact />
            </div>
          </div>

          {/* Dm */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10.5px] w-6">Dm</span>
            <div className="flex gap-0.5">
              <MiniCard note="D" oct={3} jp="レ" highlight="gold" compact />
              <MiniCard note="F" oct={3} jp="ファ" highlight="gold" compact />
              <MiniCard note="A" oct={3} jp="ラ" highlight="gold" compact />
            </div>
          </div>

          {/* Em */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10.5px] w-6">Em</span>
            <div className="flex gap-0.5">
              <MiniCard note="E" oct={3} jp="ミ" highlight="gold" compact />
              <MiniCard note="G" oct={3} jp="ソ" highlight="gold" compact />
              <MiniCard note="B" oct={3} jp="シ" highlight="gold" compact />
            </div>
          </div>

          {/* F */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10.5px] w-6">F</span>
            <div className="flex gap-0.5">
              <MiniCard note="F" oct={3} jp="ファ" highlight="gold" compact />
              <MiniCard note="A" oct={3} jp="ラ" highlight="gold" compact />
              <MiniCard note="C" oct={4} jp="ド" highlight="gold" compact />
            </div>
          </div>

          {/* G */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10.5px] w-6">G</span>
            <div className="flex gap-0.5">
              <MiniCard note="G" oct={3} jp="ソ" highlight="gold" compact />
              <MiniCard note="B" oct={3} jp="シ" highlight="gold" compact />
              <MiniCard note="D" oct={4} jp="レ" highlight="gold" compact />
            </div>
          </div>

          {/* Am */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10.5px] w-6">Am</span>
            <div className="flex gap-0.5">
              <MiniCard note="A" oct={3} jp="ラ" highlight="gold" compact />
              <MiniCard note="C" oct={4} jp="ド" highlight="gold" compact />
              <MiniCard note="E" oct={4} jp="ミ" highlight="gold" compact />
            </div>
          </div>

          {/* Bdim */}
          <div className="bg-[#24150c] px-1.5 py-0.5 rounded-lg border border-amber-950 flex items-center justify-between">
            <span className="font-black text-amber-300 text-[10px] w-7">Bdim</span>
            <div className="flex gap-0.5">
              <MiniCard note="B" oct={3} jp="シ" highlight="gold" compact />
              <MiniCard note="D" oct={4} jp="レ" highlight="gold" compact />
              <MiniCard note="F" oct={4} jp="ファ" highlight="gold" compact />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "7. 発展4和音一覧（セブンス全7種）",
    content: (
      <div className="space-y-1 text-xs text-amber-100/90 select-none">
        <p className="text-[10px] text-amber-200/80">
          3和音に1枚付け札して作れる4和音一覧です（1オクターブ内）。
        </p>

        {/* カードデザインを活かした2列グリッド（スクロールゼロ） */}
        <div className="grid grid-cols-2 gap-1 bg-[#140b07] p-1.5 rounded-xl border border-emerald-950/80">
          {/* CM7 */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[9.5px] w-7">CM7</span>
            <div className="flex gap-0.5">
              <MiniCard note="C" oct={3} jp="ド" highlight="green" compact />
              <MiniCard note="E" oct={3} jp="ミ" highlight="green" compact />
              <MiniCard note="G" oct={3} jp="ソ" highlight="green" compact />
              <MiniCard note="B" oct={3} jp="シ" highlight="green" compact />
            </div>
          </div>

          {/* Dm7 */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[9.5px] w-7">Dm7</span>
            <div className="flex gap-0.5">
              <MiniCard note="D" oct={3} jp="レ" highlight="green" compact />
              <MiniCard note="F" oct={3} jp="ファ" highlight="green" compact />
              <MiniCard note="A" oct={3} jp="ラ" highlight="green" compact />
              <MiniCard note="C" oct={4} jp="ド" highlight="green" compact />
            </div>
          </div>

          {/* Em7 */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[9.5px] w-7">Em7</span>
            <div className="flex gap-0.5">
              <MiniCard note="E" oct={3} jp="ミ" highlight="green" compact />
              <MiniCard note="G" oct={3} jp="ソ" highlight="green" compact />
              <MiniCard note="B" oct={3} jp="シ" highlight="green" compact />
              <MiniCard note="D" oct={4} jp="レ" highlight="green" compact />
            </div>
          </div>

          {/* FM7 */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[9.5px] w-7">FM7</span>
            <div className="flex gap-0.5">
              <MiniCard note="F" oct={3} jp="ファ" highlight="green" compact />
              <MiniCard note="A" oct={3} jp="ラ" highlight="green" compact />
              <MiniCard note="C" oct={4} jp="ド" highlight="green" compact />
              <MiniCard note="E" oct={4} jp="ミ" highlight="green" compact />
            </div>
          </div>

          {/* G7 */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[9.5px] w-7">G7</span>
            <div className="flex gap-0.5">
              <MiniCard note="G" oct={3} jp="ソ" highlight="green" compact />
              <MiniCard note="B" oct={3} jp="シ" highlight="green" compact />
              <MiniCard note="D" oct={4} jp="レ" highlight="green" compact />
              <MiniCard note="F" oct={4} jp="ファ" highlight="green" compact />
            </div>
          </div>

          {/* Am7 */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[9.5px] w-7">Am7</span>
            <div className="flex gap-0.5">
              <MiniCard note="A" oct={3} jp="ラ" highlight="green" compact />
              <MiniCard note="C" oct={4} jp="ド" highlight="green" compact />
              <MiniCard note="E" oct={4} jp="ミ" highlight="green" compact />
              <MiniCard note="G" oct={4} jp="ソ" highlight="green" compact />
            </div>
          </div>

          {/* Bm7(♭5) */}
          <div className="bg-[#1b261b] px-1 py-0.5 rounded-lg border border-emerald-900/60 flex items-center justify-between">
            <span className="font-black text-emerald-300 text-[8.5px] w-9 shrink-0">Bm7(♭5)</span>
            <div className="flex gap-0.5">
              <MiniCard note="B" oct={3} jp="シ" highlight="green" compact />
              <MiniCard note="D" oct={4} jp="レ" highlight="green" compact />
              <MiniCard note="F" oct={4} jp="ファ" highlight="green" compact />
              <MiniCard note="A" oct={4} jp="ラ" highlight="green" compact />
            </div>
          </div>
        </div>
      </div>
    )
  }
];

// -------------------------------------------------------------
// 2. 操作ガイド（画面の操作方法・UIの見方）
// -------------------------------------------------------------
const CONTROLS_DATA: RuleSection[] = [
  {
    title: "1. 自分の手番の流れ（3ステップ）",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <div className="space-y-1.5 text-[11px]">
          <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 shadow-inner flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0">1</span>
            <div>
              <strong className="text-amber-300">引く（ドロー）：</strong><br/>
              画面上部の「山札」をタップしてカードを1枚引きます。
            </div>
          </div>

          <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 shadow-inner flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0">2</span>
            <div>
              <strong className="text-amber-300">アクション（任意）：</strong><br/>
              「役出し」「付け札」「入れ替え」を好きな順序で行えます。
            </div>
          </div>

          <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 shadow-inner flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0">3</span>
            <div>
              <strong className="text-amber-300">捨てる（ディスカード）：</strong><br/>
              手札から不要な1枚を選び、赤い「捨てる」ボタンを押してターン終了。
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "2. 役出しの操作（コード・スケール）",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/80 space-y-1.5 shadow-inner text-[10.5px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>手札から役を作るカード（3枚以上）をタップして選択</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>役が揃うと、下の <strong>「コード（金）」</strong> または <strong>「スケール（青）」</strong> ボタンが点灯</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>ボタンを押すと、場に公開されて美しい和音が鳴り響きます</span>
          </div>
        </div>

        {/* コマンドカラー早見 */}
        <div className="flex items-center justify-around bg-[#120a05] p-2 rounded-xl border border-amber-950 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded bg-sky-900 text-sky-200 border border-sky-400">スケール（青）</span>
          <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-200 border border-amber-400">コード（金）</span>
          <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-400">捨てる（赤）</span>
        </div>
      </div>
    )
  },
  {
    title: "3. 付け札 と 入れ替え（アレンジ）の操作",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        {/* 共通の起点ステップ */}
        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-500/60 space-y-1 shadow-inner text-[10.5px]">
          <strong className="text-amber-300 font-bold block">💡 共通の操作ステップ（場のセットから選択）</strong>
          <div className="space-y-1 text-amber-100/90 pl-1">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0">1</span>
              <span><strong>場のセットをタップ</strong>（使える手札カードが浮遊し、🟢/🟧バッジが出現）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0">2</span>
              <span>浮き上がった手札から<strong>出したいカードを1枚タップ</strong></span>
            </div>
          </div>
        </div>

        {/* 2大アクションの分岐ボタン */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <div className="bg-[#1b261b] p-2 rounded-xl border border-emerald-500/60 space-y-1 text-[10px] shadow-inner">
            <span className="font-black text-emerald-300 block">🟢 付け札（緑ボタン）</span>
            <p className="text-emerald-100/90 leading-tight">
              ③ 緑の<strong>「付け札」</strong>を押すと、選んだカードが場のセットに追加され、<strong>手札が1枚減ります</strong>（例: 3和音 ➔ CM7等へ進化）。
            </p>
          </div>

          <div className="bg-[#2b170c] p-2 rounded-xl border border-orange-500/60 space-y-1 text-[10px] shadow-inner">
            <span className="font-black text-orange-300 block">🟧 入れ替え（橙ボタン）</span>
            <p className="text-orange-100/90 leading-tight">
              ③ 橙の<strong>「入れ替え」</strong>を押すと、手札のカードが場に入って新たな和音に変化し、<strong>押し出された場の古いカードが手札に回収</strong>されます。
            </p>
          </div>
        </div>

        {/* 入れ替えで起こることの具体例 */}
        <div className="bg-[#140a05] p-1.5 rounded-lg border border-orange-900/80 text-[9px] text-orange-200/90 leading-tight">
          <strong className="text-orange-300 block mb-0.5">例：場の Cコード [ド・ミ・ソ] に 手札の [シ] を入れ替えた場合</strong>
          場は新たな <strong>Emコード [ミ・ソ・シ]</strong> に変化し、押し出された <strong>[ド] が自分の手札に加わります</strong>（1手番1回まで）。
        </div>
      </div>
    )
  },
  {
    title: "4. ポン・チー（割り込み）の操作",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <div className="bg-[#24150c] p-2.5 rounded-xl border border-amber-900/80 space-y-1.5 shadow-inner text-[10.5px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0">1</span>
            <span>他人の捨て札で鳴ける時、手札の使えるカードが自動で浮き上がります</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0">2</span>
            <span>カードをタップすると使うペアが選択（再タップで別ペアに切替）</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0">3</span>
            <span><strong>「ポン」</strong>または<strong>「チー」</strong>ボタンを押して割り込み（不要なら「パス」）</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "5. アシストナビ機能の見方",
    content: (
      <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed select-none">
        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 space-y-1.5 shadow-inner text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-7 rounded border border-amber-400 bg-amber-100 text-amber-950 font-bold flex items-center justify-center text-[9px] shadow-xs">光沢</div>
            <span><strong>完成形カード</strong>：選ぶと即役が揃うカードが美しい光沢シマーで光ります</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-7 rounded border border-purple-400 bg-purple-100 text-purple-950 font-bold flex items-center justify-center text-[9px] shadow-xs">紫枠</div>
            <span><strong>2枚ペアカード</strong>：あと1枚で役になるペアが紫枠で光ります</span>
          </div>
        </div>

        <div className="bg-[#24150c] p-2 rounded-xl border border-amber-900/80 space-y-1 shadow-inner text-[10px]">
          <span className="text-amber-300 font-bold block">場のセット選択時の判別丸バッジ（カード右上）</span>
          <div className="grid grid-cols-3 gap-1 text-center pt-0.5">
            <div className="bg-[#120a05] p-1 rounded border border-emerald-950">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white mb-0.5" /><br/>
              <span className="text-emerald-300 font-bold">🟢 付け札</span>
            </div>
            <div className="bg-[#120a05] p-1 rounded border border-orange-950">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 border border-white mb-0.5" /><br/>
              <span className="text-orange-300 font-bold">🟧 入れ替え</span>
            </div>
            <div className="bg-[#120a05] p-1 rounded border border-amber-950">
              <span className="inline-flex gap-0.5 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white" />
              </span><br/>
              <span className="text-amber-200 font-bold">🟢 🟧 両方可能</span>
            </div>
          </div>
        </div>
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[80] p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#180f09] rounded-2xl p-3.5 sm:p-4 max-w-md w-full h-[470px] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col border-2 border-amber-500/60 animate-in zoom-in-95 duration-200 select-none">
        
        {/* 固定ヘッダー */}
        <div className="flex justify-between items-center mb-2 border-b border-[#382315] pb-1.5 shrink-0">
          <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>遊び方・マニュアル</span>
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
            <span>ルール・役の作り方</span>
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
            <span>操作・画面ガイド</span>
          </button>
        </div>

        {/* 視覚的スワイプ・プログレスバー */}
        <div 
          className="grid gap-1 mb-2 shrink-0 px-0.5" 
          style={{ gridTemplateColumns: `repeat(${currentData.length}, minmax(0, 1fr))` }}
        >
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
        
        {/* スワイプ可能コンテンツ領域（完全均一化・内部スクロールゼロ） */}
        <div className="relative flex-1 min-h-0 flex items-stretch overflow-hidden">
          {page > 0 && (
            <button
              onClick={() => setPage(p => p - 1)}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-black/40 hover:bg-black/70 text-amber-300/60 hover:text-amber-200 flex items-center justify-center rounded-r-lg transition backdrop-blur-xs"
              aria-label="前のページ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

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
            className="w-full flex-1 overflow-hidden px-1 min-h-0 cursor-grab active:cursor-grabbing flex flex-col"
          >
            <div className="mb-1.5 shrink-0">
              <h4 className="font-black text-amber-300 text-xs border-l-4 border-amber-500 pl-2">
                {currentData[page].title}
              </h4>
            </div>
            
            <div key={`${activeTab}-${page}`} className="flex-1 flex flex-col justify-start animate-in fade-in duration-150 overflow-hidden">
              {currentData[page].content}
            </div>
          </div>

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
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-amber-400/80 tracking-wider">
              {page + 1} / {currentData.length}
            </span>
            <div className="flex items-center gap-1">
              {currentData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`transition-all rounded-full ${
                    page === idx 
                      ? 'w-3.5 h-1.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                      : 'w-1.5 h-1.5 bg-[#3f2717] hover:bg-amber-700/60'
                  }`}
                  title={`${idx + 1}ページ目`}
                />
              ))}
            </div>
          </div>

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
