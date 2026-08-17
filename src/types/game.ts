export type SuitType = 'red' | 'blue';

export interface Card {
  id: string;
  val: number;        // 0: C, 1: D, ... 6: B
  oct: number;        // 3, 4, 5
  absVal: number;     // 0〜20 (0: C3, ..., 20: B5)
  suit: SuitType;
  interpretedAbsVal?: number; // 和音やスケール解釈時の配置値
}

export type MeldType = 'chord' | 'scale';

export interface Meld {
  id: string;
  ownerId: number;
  type: MeldType;
  cards: Card[];
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  hasMelded: boolean;
  justDrawnCardId: string | null;
  isCPU: boolean;
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
}
