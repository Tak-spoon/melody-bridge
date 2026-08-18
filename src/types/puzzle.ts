import { Card, Meld } from './game';

export interface PuzzleStage {
  id: string;             // 一意のステージID (例: 'ch1_1')
  title: string;          // ステージタイトル (例: '第1問: ドレミの完成')
  description: string;    // 問題文 (例: '手札から適切なカードを付け札してアガってください。')
  hint: string;           // ヒント (例: '場のスケールに注目してみよう')
  explanation: string;    // クリア後の音楽理論解説
  initialHand: Card[];    // プレイヤーの初期手札
  initialField: Meld[];   // 場の初期セット
  initialInterrupt?: {    // ポン・チーのチュートリアル用初期割り込み情報
    type: 'pon' | 'chii';
    discarderId: number;
    discardedCard: Card;
  };
  allowDiscard?: boolean; // 捨て札が必要かどうか（デフォルトtrue）
}

export interface PuzzleChapter {
  id: string;             // チャプターID (例: 'ch1')
  title: string;          // チャプター名 (例: '第1章: 付け札入門')
  subtitle: string;       // サブタイトル (例: '場のセットを活用してアガる基本')
  stages: PuzzleStage[];  // この章に含まれるステージ一覧
}
