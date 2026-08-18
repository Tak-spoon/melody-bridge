// スート（赤・青）は廃止済み

export interface Card {
  id: string;
  val: number;        // 0: C, 1: D, ... 6: B
  oct: number;        // 2, 3, 4, 5
  absVal: number;     // 0〜27 (0: C2, ..., 27: B5)

  interpretedAbsVal?: number; // 和音やスケール解釈時の配置値
}

export type MeldType = 'chord' | 'scale';

export interface Meld {
  id: string;
  ownerId: number;
  type: MeldType;
  cards: Card[];
}

export interface PlayerActionCounts {
  melds: number;
  adds: number;
  swaps: number; // 場のカードとの入れ替え（スワップ）回数
  pon: number;
  chii: number;
  turns: number; // 手番が回ってきた回数（巡数）
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  hasMelded: boolean;
  justDrawnCardId: string | null;
  isCPU: boolean;
  actions: PlayerActionCounts;
}

export interface LogEntry {
  player: string;
  text: string;
}

export interface DiscardItem {
  card: Card;
  discarderId: number | 'system';
  isHidden: boolean;
}

export type InterruptType = 'pon' | 'chii';

export interface InterruptAction {
  type: InterruptType;
  validCombs: string[][]; // 手札カードIDのペア [id1, id2] の配列
}

export interface InterruptCandidate {
  playerId: number;
  actions: InterruptAction[];
}

export interface InterruptInfo {
  discarderId: number;
  discardedCard: Card;
  candidates: InterruptCandidate[];
}

export type GamePhase = 'draw' | 'main' | 'interrupt';

export interface GameState {
  round: number;
  scores: number[];
  deck: Card[];
  discardPile: DiscardItem[];
  players: Player[];
  field: Meld[];
  turn: number;
  phase: GamePhase;
  interruptInfo: InterruptInfo | null;
  winner: number | null;
  roundOver: boolean;
  message: string;
  logs: LogEntry[];
  actionCount: number;
  hasSwappedThisTurn?: boolean; // 今手番ですでにスワップを行ったか（無限ループ防止・1手番1回制限）
}
