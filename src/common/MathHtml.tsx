import katex from "katex";
import "katex/dist/katex.min.css";
import { memo, useMemo } from "react";
import styles from "./MathHtml.module.css";

const MAX_MATH_CACHE_ENTRIES = 300;
const mathHtmlCache = new Map<string, string>();

const cacheKey = (latex: string, displayMode: boolean) =>
  `${displayMode ? "display" : "inline"}\u0000${latex}`;

const rememberMathHtml = (key: string, html: string) => {
  if (mathHtmlCache.has(key)) mathHtmlCache.delete(key);
  mathHtmlCache.set(key, html);
  if (mathHtmlCache.size <= MAX_MATH_CACHE_ENTRIES) return;
  const oldestKey = mathHtmlCache.keys().next().value;
  if (oldestKey) mathHtmlCache.delete(oldestKey);
};

export const renderMathHtml = (latex: string, displayMode = false) => {
  const key = cacheKey(latex, displayMode);
  const cached = mathHtmlCache.get(key);
  if (cached) {
    mathHtmlCache.delete(key);
    mathHtmlCache.set(key, cached);
    return cached;
  }

  const html = katex.renderToString(latex, {
    displayMode,
    output: "html",
    throwOnError: false,
    strict: "ignore",
    trust: false,
    // Give tall cells (fractions/radicals) breathing room in ordinary tables.
    // Explicit TeX definitions and environment-specific spacing take precedence.
    macros: { "\\arraystretch": "1.4" },
  });
  rememberMathHtml(key, html);
  return html;
};

export const extractWrappingBoxLatex = (latex: string) => {
  const source = latex.trim();
  const prefix = "\\boxed{";
  if (!source.startsWith(prefix)) return null;

  let depth = 1;
  for (let index = prefix.length; index < source.length; index += 1) {
    const character = source[index];
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (character === "{") depth += 1;
    if (character !== "}") continue;
    depth -= 1;
    if (depth !== 0) continue;
    if (source.slice(index + 1).trim()) return null;
    return source.slice(prefix.length, index);
  }

  return null;
};

export const MathHtml = memo(function MathHtml({
  latex,
  displayMode = false,
  className = "",
  variant = "default",
}: {
  latex: string;
  displayMode?: boolean;
  className?: string;
  variant?: "default" | "prose" | "choice" | "rating" | "preview";
}) {
  const wrappingBoxLatex = useMemo(
    () => (displayMode ? extractWrappingBoxLatex(latex) : null),
    [displayMode, latex],
  );
  const renderedLatex = wrappingBoxLatex ?? latex;
  const html = useMemo(
    () => renderMathHtml(renderedLatex, displayMode),
    [displayMode, renderedLatex],
  );
  const mathClassName = [
    styles[displayMode ? "display" : "inline"],
    wrappingBoxLatex !== null && styles.box,
    variant === "prose" && styles.prose,
    variant === "choice" && styles.choice,
    variant === "rating" && styles.rating,
    variant === "preview" && styles.preview,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      data-math-box={wrappingBoxLatex !== null || undefined}
      data-math-prose={variant === "prose" || undefined}
      data-math-kind={displayMode ? "display" : "inline"}
      className={mathClassName}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
