export interface Catalog {
  id: string;
  name: string;
  address: string;
  description: string;
}

export interface Theme {
  name: string;
  enigmes_count: number;
  puzzles: Puzzle[];
  size: number;
}

export interface Puzzle {
  id: string;
  name: string;
  author: string;
  difficulty: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  cipher: string;
  obscure: string;
  compressedSize: number;
  uncompressedSize: number;
}
