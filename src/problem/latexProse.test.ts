import { describe, expect, it } from "vitest";
import {
  parseLatexProse,
  readLatexGroup,
  splitOuterLatex,
} from "./latexProse.js";

describe("LaTeX prose boundaries", () => {
  it("reflows unlabelled RC3 prose while preserving formulas", () => {
    expect(
      parseLatexProse(
        String.raw`\text{모든 실수 }t\text{에 대하여, 닫힌구간 }[t,t+L]\text{에서 방정식 }f(x)=b\text{의 서로 다른 실근이 }n\text{개 이상이다.}`,
      ),
    ).toEqual([
      { kind: "text", value: "모든 실수 " },
      { kind: "math", value: "t" },
      { kind: "text", value: "에 대하여, 닫힌구간 " },
      { kind: "math", value: "[t,t+L]" },
      { kind: "text", value: "에서 방정식 " },
      { kind: "math", value: "f(x)=b" },
      { kind: "text", value: "의 서로 다른 실근이 " },
      { kind: "math", value: "n" },
      { kind: "text", value: "개 이상이다." },
    ]);
  });

  it("keeps text inside scalable delimiters, fractions and environments in the formula", () => {
    const math = String.raw`\left(\text{왼쪽}+\frac{\text{분자}}{b}+\begin{cases}x&x>0\\0&x\le0\end{cases}\right)`;
    expect(parseLatexProse(`${math}\\text{이다.}`)).toEqual([
      { kind: "math", value: math },
      { kind: "text", value: "이다." },
    ]);
  });

  it("preserves nested text formatting and escaped characters", () => {
    expect(
      parseLatexProse(
        String.raw`\text{\textbf{중요한} 조건}x\text{의 비율은 10\%이다.}`,
      ),
    ).toEqual([
      { kind: "mathText", value: String.raw`\text{\textbf{중요한} 조건}` },
      { kind: "math", value: "x" },
      { kind: "text", value: "의 비율은 10%이다." },
    ]);
    expect(readLatexGroup(String.raw`{a\{b\}c}`, 0)?.content).toBe(
      String.raw`a\{b\}c`,
    );
  });

  it("retains displaystyle across prose fragments", () => {
    const parsed = parseLatexProse(
      String.raw`\displaystyle\sum_{n=1}^{\infty}a_n\text{와 }\frac{a}{b}\text{이다.}`,
    )!;
    expect(parsed[2]).toEqual({
      kind: "math",
      value: String.raw`\displaystyle \frac{a}{b}`,
    });
  });

  it.each([
    String.raw`\sqrt\text{조건}`,
    String.raw`x_\text{조건}`,
    String.raw`\text{조건}^2`,
    String.raw`\text{수식 $x^2$이다.}`,
    String.raw`\color{red}x\text{조건}`,
    String.raw`\text{조건} + \unknown`,
    String.raw`\left(\text{조건}`,
    String.raw`\frac{a}{b}`,
  ])("preserves an unsplittable expression: %s", (source) => {
    expect(parseLatexProse(source)).toBeNull();
  });

  it("splits only outer rows and rejects unbalanced or mismatched scopes", () => {
    expect(
      splitOuterLatex(String.raw`a&\begin{cases}b&c\\d&e\end{cases}`, "&"),
    ).toEqual(["a", String.raw`\begin{cases}b&c\\d&e\end{cases}`]);
    for (const source of [
      "a}",
      "{a",
      String.raw`\begin{cases}a\end{matrix}`,
      String.raw`\left(x`,
    ])
      expect(splitOuterLatex(source, "&")).toBeNull();
  });
});
