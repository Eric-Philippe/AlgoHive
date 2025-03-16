export interface Try {
  id: string;
  puzzle_id: string;
  puzzle_index: number;
  puzzle_lvl: string;
  step: number;
  start_time: string;
  end_time?: string;
  attempts: number;
  score: number;
  competition_id: string;
  user_id: string;
  user?: User;
}
