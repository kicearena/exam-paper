import type { ReactNode } from "react";
export type ProblemContentBlock =
  | { kind: "paragraph"; text: string; inlineMath?: string[] }
  | { kind: "displayMath"; latex: string }
  | { kind: "diagram"; src: string; alt: string; caption?: string }
  | { kind: "note"; text: string; inlineMath?: string[] };

export type ProblemBodyBlock =
  | ProblemContentBlock
  | {
      kind: "box";
      variant: "conditions" | "proof";
      blocks: ProblemContentBlock[];
    }
  | { kind: "choices"; choices: string[]; columns?: string[] };

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
  state?: string;
};
