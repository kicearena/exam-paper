import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MathHtml,
  extractWrappingBoxLatex,
  renderMathHtml,
} from "./MathHtml.js";

describe("renderMathHtml", () => {
  it("renders inline and display math through KaTeX", () => {
    expect(renderMathHtml("x^2+1")).toContain("katex");
    expect(renderMathHtml("\\sum_{k=1}^{n} k", true)).toContain(
      "katex-display",
    );
  });

  it("keeps malformed latex renderable", () => {
    expect(() => renderMathHtml("\\not-a-command{")).not.toThrow();
    expect(renderMathHtml("\\not-a-command{")).toContain("katex-error");
  });

  it("preserves long formulas without source-length font reduction", () => {
    const markup = renderToStaticMarkup(
      createElement(MathHtml, {
        latex: String.raw`\sum_{k=1}^{100} (a_k+b_k+c_k+d_k+e_k+f_k+g_k+h_k+i_k+j_k)`,
        displayMode: true,
      }),
    );

    expect(markup).toContain("katex-display");
    expect(markup).not.toContain("kice-math-compact");
    expect(markup).not.toContain("kice-math-very-compact");
  });

  it("renders a top-level latex box as a wrapping document box", () => {
    const latex = String.raw`\boxed{\text{(가) 긴 조건 문장} + \frac{a}{b}}`;
    const markup = renderToStaticMarkup(
      createElement(MathHtml, { latex, displayMode: true }),
    );

    expect(extractWrappingBoxLatex(latex)).toBe(
      String.raw`\text{(가) 긴 조건 문장} + \frac{a}{b}`,
    );
    expect(markup).toContain("data-math-box");
    expect(markup).not.toContain("fbox");
  });

  it("leaves boxes embedded in larger formulas to KaTeX", () => {
    expect(extractWrappingBoxLatex(String.raw`x + \boxed{y}`)).toBeNull();
    expect(extractWrappingBoxLatex(String.raw`\boxed{{x}+{y}} + z`)).toBeNull();
  });

  it("keeps inline boxes inline and preserves their mathematical frame", () => {
    const markup = renderToStaticMarkup(
      createElement(MathHtml, { latex: String.raw`\boxed{x^2}` }),
    );
    expect(markup).toContain("fbox");
    expect(markup).not.toContain("data-math-box");
  });
});
