import { Puzzle } from "./Puzzle";

export interface Theme {
  name: string;
  enigmes_count: number;
  puzzles: Puzzle[];
  size: number;
}
