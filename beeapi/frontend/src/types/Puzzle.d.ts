export interface Puzzle {
  name: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  language: string;
  compressedSize: number | string;
  uncompressedSize: number | string;
  cipher: string;
  obscure: string;
}
