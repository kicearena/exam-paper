import katex from "katex";

export type LatexProsePart = {
  kind: "text" | "math" | "mathText";
  value: string;
};

const textCommands =
  /\\(text|textbf|textit|textrm|textsf|texttt|textnormal)\s*\{/g;
const scopedCommands =
  /\\(?:def|gdef|newcommand|renewcommand|color|colorlet|textstyle|scriptstyle|scriptscriptstyle)\b/;

const validMath = (part: LatexProsePart) => {
  if (part.kind === "text") return true;
  try {
    katex.renderToString(part.value, {
      throwOnError: true,
      strict: "ignore",
      trust: false,
    });
    return true;
  } catch {
    return false;
  }
};

export const readLatexGroup = (source: string, start: number) => {
  if (source[start] !== "{") return null;
  let depth = 1;
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") index += 1;
    else if (source[index] === "{") depth += 1;
    else if (source[index] === "}") depth -= 1;
    if (depth === 0)
      return { content: source.slice(start + 1, index), end: index + 1 };
  }
  return null;
};

// Commands and groups are indivisible; separators inside cases, fractions or
// scalable delimiters belong to that expression rather than the document.
export const splitOuterLatex = (source: string, separator: string) => {
  const parts: string[] = [];
  const scopes: string[] = [];
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (!scopes.length && source.startsWith(separator, index)) {
      parts.push(source.slice(start, index));
      index += separator.length - 1;
      start = index + 1;
    } else if (source[index] === "{") {
      const group = readLatexGroup(source, index);
      if (!group) return null;
      index = group.end - 1;
    } else if (source[index] === "}") return null;
    else if (source[index] === "\\") {
      const scope = source
        .slice(index)
        .match(/^\\(begin|end)\{([^{}]+)\}|^\\(left|right)\b/);
      if (!scope) {
        index += 1;
        continue;
      }
      const opening = scope[1] === "begin" || scope[3] === "left";
      const name = scope[2] ?? "delimiter";
      if (opening) scopes.push(name);
      else if (scopes.pop() !== name) return null;
      index += scope[0].length - 1;
    }
  }
  if (scopes.length) return null;
  parts.push(source.slice(start));
  return parts;
};

const proseText = (
  command: string,
  content: string,
  latex: string,
): LatexProsePart => {
  const plain =
    command === "text" &&
    !/[{}$]/.test(content) &&
    !/\\(?![%&#_{}$\\ ])/.test(content);
  return plain
    ? {
        kind: "text",
        value: content.replace(/\\([%&#_{}$\\ ])/g, "$1").replace(/~/g, " "),
      }
    : { kind: "mathText", value: latex };
};

/** Reflow top-level prose only when each remaining mathematical fragment is valid. */
export const parseLatexProse = (source: string): LatexProsePart[] | null => {
  if (scopedCommands.test(source)) return null;
  const parts: LatexProsePart[] = [];
  let cursor = 0;
  let displayStyle = "";
  for (const match of source.matchAll(textCommands)) {
    const index = match.index;
    if (index < cursor) continue;
    // An unfinished scope means this text is part of a mathematical group.
    if (!splitOuterLatex(source.slice(cursor, index), "\u0000")) continue;
    const group = readLatexGroup(source, index + match[0].length - 1);
    if (!group) return null;
    if (/^\s*[_^]/.test(source.slice(group.end))) return null;
    // Text containing embedded math or other stateful commands remains atomic.
    if (
      /\$|\\(?!text(?:bf|it|rm|sf|tt|normal)?\b|[%&#_{}$\\ ])/.test(
        group.content,
      )
    )
      return null;
    const math = source.slice(cursor, index).trim();
    if (math.includes("\\displaystyle")) displayStyle = "\\displaystyle ";
    if (math) parts.push({ kind: "math", value: `${displayStyle}${math}` });
    parts.push(
      proseText(match[1], group.content, source.slice(index, group.end)),
    );
    cursor = group.end;
  }
  if (!parts.length) return null;
  const math = source.slice(cursor).trim();
  if (math) parts.push({ kind: "math", value: `${displayStyle}${math}` });
  // Prevent splitting command arguments, scripts, or unmatched delimiters.
  if (!parts.every(validMath)) return null;
  return parts;
};
