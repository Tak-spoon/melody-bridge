import { Card, Meld } from '../types/game';
import { PuzzleChapter } from '../types/puzzle';

const NOTE_TO_VAL: Record<string, number> = {
  C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
};

function c(id: string, note: string, oct: number): Card {
  const val = NOTE_TO_VAL[note];
  const absVal = (oct - 2) * 7 + val;
  return { id, val, oct, absVal };
}

export const PUZZLE_CHAPTERS: PuzzleChapter[] = [
  {
    id: 'tutorial',
    title: 'チュートリアル: 基本ルールを学ぼう',
    subtitle: '役出し・ポン・チー・付け札・スワップの基本マスター（全12問）',
    stages: [
      {
        id: 'tut_1',
        title: 'T-1: ゲームの目的と手番サイクル（手札0枚でアガリ！）',
        description: '【ゲームの目的】\n誰よりも早く「手札をすべて使い切って0枚（手札ゼロ）」にした人が勝利（アガリ）となります！\n\n【手番の流れ（ゲームフロー）】\n①【引く】山札からカードを1枚引く（ドロー）\n②【減らす】役出しや付け札で手札を減らす\n③【捨てる】不要なカードを1枚捨てる\n\n山札からカードを引き、不要なカードを1枚捨てて【手札0枚のアガリ】を達成してみましょう！',
        hint: '① 右上の光る「山札」をタップしてカードを引く（ドロー）！\n② 手札のカード [A4(ラ)] を選んで、赤い「捨てる」ボタンを押す！\n③ 不要なカードを捨てて手札が0枚になった瞬間、アガリ（勝利）達成！',
        explanation: '【アガリ（勝利）と手番サイクルの基本】\nこのゲームはセブンブリッジやラミーのように、毎ターン「①引く ➔ ②役出し・付け札 ➔ ③1枚捨てる」を繰り返して手札を減らします。\n\n手札が0枚になったプレイヤーがアガリとなります！次のステージからは、手札を減らすための「コード（和音）」や「スケール（音階）」の役作りを学んでいきましょう！',
        initialHand: [c('h1', 'A', 4)],
        initialField: []
      },
      {
        id: 'tut_2',
        title: 'T-2: 基本の3枚役（コード編）',
        description: '手札からド・ミ・ソ（1つ飛ばしの3音）で基本3和音「Cコード」を場に出し、残った不要なカードを捨ててアガりましょう。',
        hint: '① 山札から [G3(ソ)] をドロー！\n② [C3・E3・G3] の3枚を選んで、金色の「コード」ボタンを押す！\n③ 残った不要なカード [A4(ラ)] を選んで「捨てる」と手札0枚クリア！',
        explanation: '1つ飛ばしの3音（ド・ミ・ソ、レ・ファ・ラ等）で「コード（和音）」が成立します！役を出した後は不要なカードを捨ててアガりましょう。',
        initialHand: [c('h1', 'C', 3), c('h2', 'E', 3), c('h3', 'A', 4), c('h4', 'G', 3)],
        initialField: []
      },
      {
        id: 'tut_3',
        title: 'T-3: 基本の3枚役（スケール編）',
        description: '手札からレ・ミ・ファ（隣り合う3音）で「スケール（音階）」を場に出し、残った不要なカードを捨ててアガりましょう。',
        hint: '① 山札から [F3(ファ)] をドロー！\n② [D3・E3・F3] の3枚を選んで、青い「スケール」ボタンを押す！\n③ 残った不要なカード [A4(ラ)] を選んで「捨てる」と手札0枚クリア！',
        explanation: '隣り合う3音（ド-レ-ミ、レ-ミ-ファ等）で「スケール（音階）」が成立します！役を出して不要なカードを捨てるのが基本です。',
        initialHand: [c('h1', 'D', 3), c('h2', 'E', 3), c('h3', 'A', 4), c('h4', 'F', 3)],
        initialField: []
      },
      {
        id: 'tut_4',
        title: 'T-4: 役出し＆捨て札の基本連携',
        description: '手札の3枚で [C3・E3・G3] のCコードを場に出し、残った不要なカードを捨てて手札0枚アガリを決めましょう！',
        hint: '① 山札から不要なカードをドロー！\n② 手札の [C3・E3・G3] を選んで「コード」を押す！\n③ 残った不要なカード [A4] を「捨てる」と手札0枚クリア！',
        explanation: '手札から役を出して手札を一気に減らし、最後の1枚を捨ててアガリを達成しました！',
        initialHand: [c('h1', 'C', 3), c('h2', 'E', 3), c('h3', 'G', 3), c('h4', 'A', 4)],
        initialField: []
      },
      {
        id: 'tut_5',
        title: 'T-5: 相手の捨て札で和音を作る「ポン（コード鳴き）」',
        description: 'CPU 2 が [G3(ソ)] を捨てました！手札の [C3(ド), E3(ミ)] と組み合わせて「ポン」で和音を完成させ、残ったカードを捨ててアガりましょう！',
        hint: '① 手札の [C3(ド)] と [E3(ミ)] の2枚を選ぶ！\n② 金色に光る「ポン」ボタンを押してCコードを場に出す！\n③ 残った手札 [A4(ラ)] を選んで「捨てる」とアガリ！',
        explanation: '【ポン（コード鳴き）のルール】\n誰かが捨てたカードを使って和音（コード）が作れる場合、誰の捨て札からでも「ポン」で割り込んで役を出すことができます！',
        initialHand: [c('h1', 'C', 3), c('h2', 'E', 3), c('h3', 'A', 4)],
        initialField: [],
        initialInterrupt: {
          type: 'pon',
          discarderId: 2,
          discardedCard: c('disc_g3', 'G', 3)
        }
      },
      {
        id: 'tut_6',
        title: 'T-6: 直前の捨て札で音階を作る「チー（スケール鳴き）」',
        description: '直前のプレイヤー（左隣 / CPU 3）が [F3(ファ)] を捨てました！手札の [D3(レ), E3(ミ)] と組み合わせて「チー」で音階を完成させ、残ったカードを捨ててアガりましょう！',
        hint: '① 手札の [D3(レ)] と [E3(ミ)] の2枚を選ぶ！\n② 青く光る「チー」ボタンを押してスケールを場に出す！\n③ 残った手札 [A4(ラ)] を選んで「捨てる」とアガリ！',
        explanation: '【チー（スケール鳴き）のルール】\n自分の直前のプレイヤー（上家/左隣）が捨てたカードを使って音階（スケール）が作れる場合、「チー」で割り込んで役を出すことができます！',
        initialHand: [c('h1', 'D', 3), c('h2', 'E', 3), c('h3', 'A', 4)],
        initialField: [],
        initialInterrupt: {
          type: 'chii',
          discarderId: 3,
          discardedCard: c('disc_f3', 'F', 3)
        }
      },
      {
        id: 'tut_7',
        title: 'T-7: スケールへの付け札（後ろに伸ばす）',
        description: '場のスケール [C・D・E] の末尾に手札から [F3(ファ)] を付け札し、残った不要なカードを捨ててアガりましょう。',
        hint: '① 山札から不要なカードをドロー！\n② 手札の [F3] と 場のスケールを選んで「付け札」を押す！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '場にあるスケールの後ろに音を足すことで、手札を効率よく減らせます！',
        initialHand: [c('h1', 'F', 3), c('h2', 'B', 4)],
        initialField: [{ id: 'm1', ownerId: 1, type: 'scale', cards: [c('m1', 'C', 3), c('m2', 'D', 3), c('m3', 'E', 3)] }]
      },
      {
        id: 'tut_8',
        title: 'T-8: スケールへの付け札（前に伸ばす）',
        description: '場のスケール [D・E・F] の先頭に手札から [C3(ド)] を付け札し、残った不要なカードを捨ててアガりましょう。',
        hint: '① 山札から不要なカードをドロー！\n② 手札の [C3(ド)] と 場のスケールを選んで「付け札」を押す！\n③ 残った不要なカードを「捨てる」と手札0枚クリア！',
        explanation: 'スケールは後ろだけでなく、先頭（前）にも音を付け札して伸ばすことができます！',
        initialHand: [c('h1', 'C', 3), c('h2', 'A', 2)],
        initialField: [{ id: 'm1', ownerId: 2, type: 'scale', cards: [c('m1', 'D', 3), c('m2', 'E', 3), c('m3', 'F', 3)] }]
      },
      {
        id: 'tut_9',
        title: 'T-9: 3和音から4和音へ進化（コードへの付け札）',
        description: '場のCコード [C・E・G] に手札から7度音 [B3(シ)] を付け札して4和音「CM7」に進化させ、残った不要なカードを捨ててアガりましょう。',
        hint: '① 山札から不要なカードをドロー！\n② 手札の [B3(シ)] と 場のCコードを選んで「付け札」を押す！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '3和音に付け札すると、響きが豊かで点数の高い4和音（セブンス）に進化します！コードへの付け札は4枚まで可能です。',
        initialHand: [c('h1', 'B', 3), c('h2', 'D', 4)],
        initialField: [{ id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3)] }]
      },
      {
        id: 'tut_10',
        title: 'T-10: スワップ（入れ替え）の基本',
        description: '場の 4和音【G7 [ソ・シ・レ・ファ]】は枚数上限（4枚）のため付け札できません。手札の [ミ(E4)] と入れ替えて別の和音（Em7）に変化させ、押し出された [ファ(F4)] を回収してスケールへ流しましょう！',
        hint: '① 手札の [E4 (ミ)] と 場の [G7] を選んで「入替」を押す（G7がEm7に変化し、[F4] が手札に飛び出す！）\n② 飛び出した [F4 (ファ)] を 場のスケール [C・D・E] の末尾へ「付け札」する！\n③ 残った手札の不要なカードを「捨てる」と手札0枚でアガリ！',
        explanation: '【スワップ（リハーモナイズ）の仕組み】\n[G・B・D・F (G7)] の [F] を抜いて [E] を差し込むと、構成音が [E・G・B・D (Em7)] に変化します！\nこのように場の和音を別のコードへ組み替えながら、欲しい音を手元に回収・引き継ぐのが『スワップ』の強力なテクニックです！',
        initialHand: [c('h1', 'E', 4), c('h2', 'A', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'G', 3), c('m2', 'B', 3), c('m3', 'D', 4), c('m4', 'F', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'C', 4), c('m6', 'D', 4), c('m7', 'E', 4)] }
        ]
      },
      {
        id: 'tut_11',
        title: 'T-11: マイナー7th から メジャー7th へのスワップ',
        description: '4和音【Am7 [ラ・ド・ミ・ソ]】に手札の [シ(B3)] をスワップして【CM7】へ変化させ、手元に飛び出した [ラ(A3)] をスケールへ流し込んでアガりましょう！',
        hint: '① 手札の [B3 (シ)] と 場の [Am7] を選んで「入替」を押す（Am7がCM7に変わり、[A3] が手元に抜ける！）\n② 抜けた [A3 (ラ)] を 場のスケール [E・F・G] の末尾へ「付け札」する！\n③ 残った手札を捨ててクリア！',
        explanation: '【マイナー7th から メジャー7th への転換】\n[A・C・E・G (Am7)] の [A] を抜いて [B] を入れると、[C・E・G・B (CM7)] に変化します！\n手に入れた [A] でスケール [E・F・G・A] を完成させる美しい連鎖コンボが決まりました！',
        initialHand: [c('h1', 'B', 3), c('h2', 'D', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'A', 3), c('m2', 'C', 4), c('m3', 'E', 4), c('m4', 'G', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'tut_12',
        title: 'T-12: 卒業試練！究極のトリプル連鎖コンボ',
        description: '場には 4和音【G7】、スケール【C-D-E】、3和音【Dm】の3つのセットがあります。スワップで和音を再構築して音を引き継ぎ、スケールへ流し、さらにDmを4和音進化させて不要なカードを捨て、手札0枚の華麗なアガリを決めましょう！',
        hint: '① 手札の [E4 (ミ)] と 場の [G7] を選んで「入替」！（G7がEm7に変わり、[F4] が手元に抜ける！）\n② 抜けた [F4 (ファ)] を 場のスケール [C4・D4・E4] の末尾へ「付け札」！\n③ 手札の [C4 (ド)] を 場の [Dm] へ「付け札」して【Dm7】へ4和音進化！\n④ 残った不要なカード [A2] を捨てて完全クリア！',
        explanation: '【チュートリアル全課程修了！お見事！】\n「スワップで和音を再構築する」➔「スケールを伸ばす」➔「3和音を4和音へ進化させる」という、メロディ・ブリッジの最高峰テクニックをすべて使いこなしました！これであなたも立派なマエストロです！',
        initialHand: [c('h1', 'E', 4), c('h2', 'C', 4), c('h3', 'A', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'G', 3), c('m2', 'B', 3), c('m3', 'D', 4), c('m4', 'F', 4)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'C', 4), c('m6', 'D', 4), c('m7', 'E', 4)] },
          { id: 'm3', ownerId: 3, type: 'chord', cards: [c('m8', 'D', 3), c('m9', 'F', 3), c('m10', 'A', 3)] }
        ]
      }
    ]
  },
  {
    id: 'ch1',
    title: '第1章: 初級編 ★☆☆',
    subtitle: '付け札と基本スワップを駆使する10問',
    stages: [
      {
        id: 'ch1_1',
        title: '1-1: 音階の前後拡張',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① 山札から不要なカードをドロー！\n② [レ・ミ・ファ] の手前に来る [C3(ド)] を付け札！\n③ 残った不要なカードを「捨てる」と手札0枚クリア！',
        explanation: 'スケールは末尾だけでなく先頭にも付け札が可能です！[C3(ド)] を足してアガリを決めました。',
        initialHand: [c('h1', 'C', 3), c('h2', 'G', 4)],
        initialField: [{ id: 'm1', ownerId: 1, type: 'scale', cards: [c('m1', 'D', 3), c('m2', 'E', 3), c('m3', 'F', 3)] }]
      },
      {
        id: 'ch1_2',
        title: '1-2: 4和音への昇華',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① 山札をドロー！\n② Dm [D・F・A] に合う7度音 [C (ド)] を付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: 'Dm [D・F・A] に [C] を足して [Dm7] に進化！不要なカードを捨てて手札0枚アガリです。',
        initialHand: [c('h1', 'C', 4), c('h2', 'G', 2)],
        initialField: [{ id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'D', 3), c('m2', 'F', 3), c('m3', 'A', 3)] }]
      },
      {
        id: 'ch1_3',
        title: '1-3: 二極への分配',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① 山札をドロー！\n② [B3] をCコードへ、[G3] をスケールへ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '1枚をコードへ、もう1枚をスケールへ付け札して手札を減らし、最後の1枚を捨ててアガリ！',
        initialHand: [c('h1', 'B', 3), c('h2', 'G', 3), c('h3', 'D', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m4', 'D', 3), c('m5', 'E', 3), c('m6', 'F', 3)] }
        ]
      },
      {
        id: 'ch1_4',
        title: '1-4: 4和音のスワップ',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① CM7 [C・E・G・B] に [A] をスワップして [B] を回収！\n② 飛び出した [B] をスケール [F・G・A] の末尾へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: 'CM7 に [A] をスワップして [B] を押し出し、スケールに流し込んでアガリ！',
        initialHand: [c('h1', 'A', 3), c('h2', 'D', 2)],
        initialField: [
          { id: 'm1', ownerId: 3, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3), c('m4', 'B', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'F', 3), c('m6', 'G', 3), c('m7', 'A', 3)] }
        ]
      },
      {
        id: 'ch1_5',
        title: '1-5: ハーフディミニッシュの転換',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Bm7(♭5) に [G] をスワップして [A3] を回収！\n② 抜けた [A3] をスケール [E3・F3・G3] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '4和音から狙った音をスワップで正確に回収し、スケールを完成させました！',
        initialHand: [c('h1', 'G', 3), c('h2', 'D', 4)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'B', 2), c('m2', 'D', 3), c('m3', 'F', 3), c('m4', 'A', 3)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch1_6',
        title: '1-6: 音階の連続伸長',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① スケール [F・G・A] の手前に [E (ミ)]、後ろに [B (シ)] を付け札！\n② 残った不要なカードを捨ててクリア！',
        explanation: '[E (ミ)] を手前に、[B (シ)] を後ろに付けて5音スケールを完成させました！',
        initialHand: [c('h1', 'E', 3), c('h2', 'B', 3), c('h3', 'C', 2)],
        initialField: [{ id: 'm1', ownerId: 2, type: 'scale', cards: [c('m1', 'F', 3), c('m2', 'G', 3), c('m3', 'A', 3)] }]
      },
      {
        id: 'ch1_7',
        title: '1-7: ドミナントの構築',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Gコード [G・B・D] に [F] を付け札！\n② 残った不要なカードを捨ててクリア！',
        explanation: 'G [G・B・D] に [F] を足して [G7] が成立！不要なカードを捨ててアガリを決めました。',
        initialHand: [c('h1', 'F', 4), c('h2', 'C', 2)],
        initialField: [{ id: 'm1', ownerId: 3, type: 'chord', cards: [c('m1', 'G', 3), c('m2', 'B', 3), c('m3', 'D', 4)] }]
      },
      {
        id: 'ch1_8',
        title: '1-8: 和音のリハーモナイズ',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① CM7 に [A] をスワップして [B3] を回収！\n② [B3] をスケール [F3・G3・A3] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '4和音 CM7 を Am7 にリハーモナイズし、手に入れた音でスケールを完成！',
        initialHand: [c('h1', 'A', 3), c('h2', 'D', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3), c('m4', 'B', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'F', 3), c('m6', 'G', 3), c('m7', 'A', 3)] }
        ]
      },
      {
        id: 'ch1_9',
        title: '1-9: メジャーセブンスへの進化',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① F [F・A・C] に [E (ミ)] を付け札して FM7 に進化！\n② 残った不要なカードを捨ててクリア！',
        explanation: 'F [F・A・C] に [E] を付けて美しい響きの [FM7] が完成しました！',
        initialHand: [c('h1', 'E', 4), c('h2', 'B', 2)],
        initialField: [{ id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'F', 3), c('m2', 'A', 3), c('m3', 'C', 4)] }]
      },
      {
        id: 'ch1_10',
        title: '1-10: 4和音の再構築スワップ',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Dm7 に [E] をスワップして [D] を回収！\n② 抜けた [D] をスケール [E・F・G] の先頭へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: '4和音から不要な音を差し替えて回収し、スケールへ流し込んで完全クリア！',
        initialHand: [c('h1', 'E', 4), c('h2', 'B', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'D', 3), c('m2', 'F', 3), c('m3', 'A', 3), c('m4', 'C', 4)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      }
    ]
  },
  {
    id: 'ch2',
    title: '第2章: 中級編 ★★☆',
    subtitle: 'リハーモナイズ連鎖と手札整理の10問',
    stages: [
      {
        id: 'ch2_1',
        title: '2-1: 音階への橋渡し',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① 山札をドロー！\n② CM7 に [A] をスワップ ➔ 飛び出した [B] をスケール [F・G・A] の末尾へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: '4和音から必要な音を正確にスワップで手元に引き継ぎ、スケールを完成させました！',
        initialHand: [c('h1', 'A', 3), c('h2', 'D', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3), c('m4', 'B', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'F', 3), c('m6', 'G', 3), c('m7', 'A', 3)] }
        ]
      },
      {
        id: 'ch2_2',
        title: '2-2: メジャー7thのリハーモナイズ',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① FM7 に [D] をスワップして [E4] を回収！\n② 回収した [E4] をスケール [B3・C4・D4] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '4和音 FM7 から正確に欲しい音を抜き取り、スケールを繋げました！',
        initialHand: [c('h1', 'D', 3), c('h2', 'A', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'F', 3), c('m2', 'A', 3), c('m3', 'C', 4), c('m4', 'E', 4)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'B', 3), c('m6', 'C', 4), c('m7', 'D', 4)] }
        ]
      },
      {
        id: 'ch2_3',
        title: '2-3: マイナー7thからの展開',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Am7 [A3・C4・E4・G4] に [B3] をスワップして [A] を回収！\n② 飛び出した [A] をスケール [E・F・G] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: 'Am7 から [A] を引っこ抜いてスケール [E・F・G] にドッキングさせました！',
        initialHand: [c('h1', 'B', 3), c('h2', 'D', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'A', 3), c('m2', 'C', 4), c('m3', 'E', 4), c('m4', 'G', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch2_4',
        title: '2-4: 難関和音の組み換え',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Bm7(♭5) に [G3] をスワップして [A3] を回収！\n② [A3] をスケール [E3・F3・G3] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '難関4和音を爽快な G7 にアレンジしてカードを回収しました！',
        initialHand: [c('h1', 'G', 3), c('h2', 'D', 4)],
        initialField: [
          { id: 'm1', ownerId: 3, type: 'chord', cards: [c('m1', 'B', 2), c('m2', 'D', 3), c('m3', 'F', 3), c('m4', 'A', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch2_5',
        title: '2-5: 付け札とスワップの連携',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① スケール1に [C3] を付け札！\n② G7 に [E4] をスワップして抜けた [F4] をスケール2へ！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: '付け札で手札を減らし、4和音スワップを決めて完全勝利！',
        initialHand: [c('h1', 'C', 3), c('h2', 'E', 4), c('h3', 'A', 4)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'scale', cards: [c('m1', 'D', 3), c('m2', 'E', 3), c('m3', 'F', 3)] },
          { id: 'm2', ownerId: 3, type: 'chord', cards: [c('m4', 'G', 3), c('m5', 'B', 3), c('m6', 'D', 4), c('m7', 'F', 4)] },
          { id: 'm3', ownerId: 2, type: 'scale', cards: [c('m8', 'C', 4), c('m9', 'D', 4), c('m10', 'E', 4)] }
        ]
      },
      {
        id: 'ch2_6',
        title: '2-6: スワップからの音階伸長',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① FM7 に [D] をスワップして [E] を回収！\n② 抜けた [E] をスケール [B・C・D] の末尾へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: 'FM7 から [E] を引っこ抜いてスケールにドッキングさせました！',
        initialHand: [c('h1', 'D', 3), c('h2', 'A', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'F', 3), c('m2', 'A', 3), c('m3', 'C', 4), c('m4', 'E', 4)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'B', 3), c('m6', 'C', 4), c('m7', 'D', 4)] }
        ]
      },
      {
        id: 'ch2_7',
        title: '2-7: ドミナント7thの連鎖',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① G7 [G3・B3・D4・F4] に [E4] をスワップして [F4] を回収！\n② 抜けた [F4] をスケール [C4・D4・E4] の末尾へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: 'G7 から [F4] を引っこ抜いてスケール [C4・D4・E4] の末尾にドッキング！',
        initialHand: [c('h1', 'E', 4), c('h2', 'A', 2)],
        initialField: [
          { id: 'm1', ownerId: 3, type: 'chord', cards: [c('m1', 'G', 3), c('m2', 'B', 3), c('m3', 'D', 4), c('m4', 'F', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'C', 4), c('m6', 'D', 4), c('m7', 'E', 4)] }
        ]
      },
      {
        id: 'ch2_8',
        title: '2-8: 和音と音階の架け橋',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① CM7 に [A] をスワップして [B] を回収！\n② [B] をスケール [F・G・A] の末尾へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: '4和音からのスワップで取り出した音を、別のセットに付け札する華麗なリレー！',
        initialHand: [c('h1', 'A', 3), c('h2', 'G', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3), c('m4', 'B', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'F', 3), c('m6', 'G', 3), c('m7', 'A', 3)] }
        ]
      },
      {
        id: 'ch2_9',
        title: '2-9: ダブルスケールへの分配',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① スケール1とスケール2の両端にそれぞれ手札を付け札！\n② 残った不要なカードを捨ててアガリ！',
        explanation: '2つのスケールの両端へ正確に付け札して手札をゼロにしました！',
        initialHand: [c('h1', 'E', 3), c('h2', 'B', 3), c('h3', 'F', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'scale', cards: [c('m1', 'F', 3), c('m2', 'G', 3), c('m3', 'A', 3)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m4', 'C', 3), c('m5', 'D', 3), c('m6', 'E', 3)] }
        ]
      },
      {
        id: 'ch2_10',
        title: '2-10: セブンスコードの転向',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Em7 に [F3] をスワップして [E3] を回収！\n② 抜けた [E3] をスケール [B2・C3・D3] の末尾へ付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: '4和音 Em7 から [E] を引っこ抜いてスケールにドッキングさせ、アガリ！',
        initialHand: [c('h1', 'F', 3), c('h2', 'G', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'E', 3), c('m2', 'G', 3), c('m3', 'B', 3), c('m4', 'D', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'B', 2), c('m6', 'C', 3), c('m7', 'D', 3)] }
        ]
      }
    ]
  },
  {
    id: 'ch3',
    title: '第3章: 上級編 ★★★',
    subtitle: '音楽理論と盤面全体の読みが必要な極限の10問',
    stages: [
      {
        id: 'ch3_1',
        title: '3-1: 極限のリハーモナイズ連鎖',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Bm7(♭5) に [G] をスワップして [A] を回収！\n② 抜けた [A] をスケール [E・F・G] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '難関4和音を華麗に再構築し、受け取った音でスケールを完成させる究極のスワップコンボです！',
        initialHand: [c('h1', 'G', 3), c('h2', 'D', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'B', 2), c('m2', 'D', 3), c('m3', 'F', 3), c('m4', 'A', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch3_2',
        title: '3-2: マイナーからメジャーへの昇華',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Dm7 に [E] をスワップして [D] を回収！\n② 抜けた [D] をスケール [E・F・G] の先頭へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: 'マイナー7thをメジャー7thへと華麗にリハーモナイズして勝利！',
        initialHand: [c('h1', 'E', 4), c('h2', 'B', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'D', 3), c('m2', 'F', 3), c('m3', 'A', 3), c('m4', 'C', 4)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch3_3',
        title: '3-3: 3セット連動パズル',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① CM7 に [A] をスワップして [B] を回収 ➔ スケールへ！\n② 手札の [C] を Dm に付け札！\n③ 残った不要なカードを捨ててアガリ！',
        explanation: '盤面の3つのセットすべてを巻き込む、圧倒的な大連鎖プレイが決まりました！',
        initialHand: [c('h1', 'A', 3), c('h2', 'C', 4), c('h3', 'D', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3), c('m4', 'B', 3)] },
          { id: 'm2', ownerId: 1, type: 'chord', cards: [c('m5', 'D', 3), c('m6', 'F', 3), c('m7', 'A', 3)] },
          { id: 'm3', ownerId: 3, type: 'scale', cards: [c('m8', 'F', 3), c('m9', 'G', 3), c('m10', 'A', 3)] }
        ]
      },
      {
        id: 'ch3_4',
        title: '3-4: セブンスコードの相互再構築',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Em7 に [F] をスワップして [E] を回収！\n② 抜けた [E] をスケール [B・C・D] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: 'セブンスコード同士の高度な組み替えにより、必要な音を完璧に調達しました！',
        initialHand: [c('h1', 'F', 3), c('h2', 'G', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'E', 3), c('m2', 'G', 3), c('m3', 'B', 3), c('m4', 'D', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'B', 2), c('m6', 'C', 3), c('m7', 'D', 3)] }
        ]
      },
      {
        id: 'ch3_5',
        title: '3-5: 孤立カードの全消しマジック',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① CM7 に [A] をスワップして [B] を回収！\n② スケール [F・G・A] の末尾 [B] へ付け札！\n③ 残った不要なカード [E] を捨ててアガリ！',
        explanation: '一見不可能な手詰まり盤面から、正確なスワップを見抜いて全消しを達成！',
        initialHand: [c('h1', 'A', 3), c('h2', 'E', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3), c('m4', 'B', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'F', 3), c('m6', 'G', 3), c('m7', 'A', 3)] }
        ]
      },
      {
        id: 'ch3_6',
        title: '3-6: 5音スケールの限界突破',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① スケールに [B3] を付け札して5音スケール完成！\n② [D3] をCコードへ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: 'スケール上限5枚のダイナミックな音階を完成させて見事クリア！',
        initialHand: [c('h1', 'B', 3), c('h2', 'D', 3), c('h3', 'A', 4)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'scale', cards: [c('m1', 'E', 3), c('m2', 'F', 3), c('m3', 'G', 3), c('m4', 'A', 3)] },
          { id: 'm2', ownerId: 2, type: 'chord', cards: [c('m5', 'C', 3), c('m6', 'E', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch3_7',
        title: '3-7: ドミナントの解決連鎖',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① G7 に [E] をスワップして [F] を回収！\n② 抜けた [F] をスケール [C・D・E] の末尾へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: '4和音 G7 を見事に解体し、スケールへと美しく解決させました！',
        initialHand: [c('h1', 'E', 4), c('h2', 'B', 2)],
        initialField: [
          { id: 'm1', ownerId: 3, type: 'chord', cards: [c('m1', 'G', 3), c('m2', 'B', 3), c('m3', 'D', 4), c('m4', 'F', 4)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'C', 4), c('m6', 'D', 4), c('m7', 'E', 4)] }
        ]
      },
      {
        id: 'ch3_8',
        title: '3-8: クローズドボイシングの極致',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Dm7 に [E] をスワップして [D] を回収！\n② 抜けた [D] をスケール [E・F・G] の先頭へ付け札！\n③ 残った不要なカードを捨ててクリア！',
        explanation: 'ボイシングルールを完璧に計算し尽くした、職人技のリハーモナイズです！',
        initialHand: [c('h1', 'E', 4), c('h2', 'F', 2)],
        initialField: [
          { id: 'm1', ownerId: 1, type: 'chord', cards: [c('m1', 'D', 3), c('m2', 'F', 3), c('m3', 'A', 3), c('m4', 'C', 4)] },
          { id: 'm2', ownerId: 2, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] }
        ]
      },
      {
        id: 'ch3_9',
        title: '3-9: 2大和音の同時進化',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Cコードに [B3]、Dmコードに [C4] をそれぞれ付け札！\n② 残った不要なカードを捨ててクリア！',
        explanation: '場をセブンスコードの響きで満たし、手札を一気に無くしました！',
        initialHand: [c('h1', 'B', 3), c('h2', 'C', 4), c('h3', 'A', 2)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'C', 3), c('m2', 'E', 3), c('m3', 'G', 3)] },
          { id: 'm2', ownerId: 1, type: 'chord', cards: [c('m4', 'D', 3), c('m5', 'F', 3), c('m6', 'A', 3)] }
        ]
      },
      {
        id: 'ch3_10',
        title: '3-10: マエストロの最終試練',
        description: '手札をすべて使い切り、手札0枚のアガリを達成してください。',
        hint: '① Bm7(♭5) に [G3] をスワップ ➔ 抜けた [A3] をスケール1へ！\n② 手札の [A2] をスケール2へ付け札！\n③ 残った不要なカードを捨てて完全制覇！',
        explanation: '全38ステージ完全制覇！あなたはメロディ・ブリッジの真のマスターです！！',
        initialHand: [c('h1', 'G', 3), c('h2', 'A', 2), c('h3', 'D', 4)],
        initialField: [
          { id: 'm1', ownerId: 2, type: 'chord', cards: [c('m1', 'B', 2), c('m2', 'D', 3), c('m3', 'F', 3), c('m4', 'A', 3)] },
          { id: 'm2', ownerId: 1, type: 'scale', cards: [c('m5', 'E', 3), c('m6', 'F', 3), c('m7', 'G', 3)] },
          { id: 'm3', ownerId: 3, type: 'scale', cards: [c('m8', 'B', 2), c('m9', 'C', 3), c('m10', 'D', 3)] }
        ]
      }
    ]
  }
];
