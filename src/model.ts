import type { ReactNode } from "react";
export type ProblemBodyBlock =
  | { kind: "paragraph"; text: string; inlineMath?: string[] }
  | { kind: "displayMath"; latex: string }
  | { kind: "choices"; choices: string[] }
  | { kind: "diagram"; src: string; alt: string; caption?: string }
  | { kind: "note"; text: string; inlineMath?: string[] };

export type ProblemDocument = {
  number: number;
  imageUrl?: string;
  body?: ProblemBodyBlock[];
};
export type ExamDocumentView = "paged" | "continuous";
export type ExamDocumentItem = {
  id: string;
  number: number;
  pointValue?: number;
  content: ReactNode;
  printContent?: ReactNode;
  state?: "correct" | "wrong" | "empty";
};
