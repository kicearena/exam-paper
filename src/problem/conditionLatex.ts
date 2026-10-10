import { extractWrappingBoxLatex } from "../common/MathHtml.js";
import {
  parseLatexProse,
  readLatexGroup,
  splitOuterLatex,
  type LatexProsePart,
} from "./latexProse.js";

export type LatexCondition = { label: string; parts: LatexProsePart[] };
const labelPattern =
  /^(?:\\text\{\s*(\([가-힣]\))\s*\}|(\([가-힣]\)))\s*(?:(?:\\(?:quad|qquad|enspace|enskip)|\\[,;:! ])\s*)*$/;

const readSingleCondition = (cell: string) => {
  const source = cell.trim();
  const command = source.match(/^\\text\s*(?=\{)/);
  if (command) {
    const group = readLatexGroup(source, command[0].length);
    const label = group?.content.match(/^\s*(\([가-힣]\))\s*/);
    if (group && label)
      return {
        labelSource: label[1],
        content: `\\text{${group.content.slice(label[0].length)}}${source.slice(group.end)}`,
      };
  }
  const label = source.match(/^(\([가-힣]\))\s*(.*)$/s);
  return label ? { labelSource: label[1], content: label[2] } : null;
};

const readConditionRow = (source: string) => {
  const row = source.replace(/^\s*\[[^\]]*\]/, "").trim();
  const cells = splitOuterLatex(row, "&");
  if (!cells || cells.length > 2) return null;
  // Single-column tables put the label at the start of the prose cell.
  const single = cells.length === 1 ? readSingleCondition(cells[0]) : null;
  return {
    row,
    labelSource: single ? single.labelSource : cells[0].trim(),
    content: single ? single.content : cells[1],
  };
};

/** Recognize labelled prose tables, leaving ordinary mathematical arrays intact. */
export const parseConditionLatex = (latex: string) => {
  const boxed = extractWrappingBoxLatex(latex);
  const source = (boxed ?? latex).trim();
  const table = source.match(
    /^\\begin\{(array|aligned|gathered)\}\s*(\{\s*l(?:\s*l)?\s*\})?([\s\S]*?)\\end\{\1\}$/,
  );
  if (!table || (table[1] === "array") !== Boolean(table[2])) return null;
  const rows = splitOuterLatex(table[3], "\\\\");
  if (!rows) return null;
  const conditions: { label: string; source: string }[] = [];
  for (const rawRow of rows) {
    const parsedRow = readConditionRow(rawRow);
    if (!parsedRow) return null;
    const { row, labelSource, content } = parsedRow;
    if (!row) continue;
    const label = labelSource.match(labelPattern);
    if (label) conditions.push({ label: label[1] ?? label[2], source: "" });
    else if (labelSource || !conditions.length) return null;
    if (content === undefined) return null;
    conditions.at(-1)!.source += ` ${content}`;
  }
  if (
    !conditions.length ||
    conditions.some((condition) => !condition.source.trim())
  )
    return null;
  const parsed: LatexCondition[] = conditions.map((condition) => ({
    label: condition.label,
    parts: parseLatexProse(condition.source) ?? [
      { kind: "math", value: condition.source.trim() },
    ],
  }));
  return { boxed: boxed !== null, conditions: parsed };
};
