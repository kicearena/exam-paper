import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseConditionLatex } from "./conditionLatex.js";
import { ProblemContent } from "./ProblemContent.js";

const rc1Conditions = String.raw`\begin{array}{ll}
\text{(가)} & f'(0)=0,\quad f(0)>0\text{이고, }f(x)\text{의 최솟값은 }-27\text{이다.}\\[4pt]
\text{(나)} & \text{함수 }y=|f(x)-t|\text{가 미분가능하지 않은 실수 }x\text{의 개수가}\\
& 4\text{가 되도록 하는 실수 }t\text{의 집합은 }\{t\mid 0<t<5\}\text{이다.}
\end{array}`;

describe("condition LaTeX layout", () => {
  it("merges RC1 problem 5 continuation rows into the labelled condition", () => {
    const parsed = parseConditionLatex(rc1Conditions)!;
    expect(parsed.boxed).toBe(false);
    expect(parsed.conditions.map((condition) => condition.label)).toEqual([
      "(가)",
      "(나)",
    ]);
    expect(parsed.conditions[0].parts).toEqual([
      { kind: "math", value: String.raw`f'(0)=0,\quad f(0)>0` },
      { kind: "text", value: "이고, " },
      { kind: "math", value: "f(x)" },
      { kind: "text", value: "의 최솟값은 " },
      { kind: "math", value: "-27" },
      { kind: "text", value: "이다." },
    ]);
    expect(parsed.conditions[1].parts.slice(-5)).toEqual([
      { kind: "text", value: "가 되도록 하는 실수 " },
      { kind: "math", value: "t" },
      { kind: "text", value: "의 집합은 " },
      { kind: "math", value: String.raw`\{t\mid 0<t<5\}` },
      { kind: "text", value: "이다." },
    ]);
    const html = renderToStaticMarkup(
      createElement(ProblemContent, {
        problem: {
          number: 5,
          body: [{ kind: "displayMath", latex: rc1Conditions }],
        },
      }),
    );
    expect(html).toContain("<dt>(가)</dt>");
    expect(html).toContain("<dt>(나)</dt>");
    expect(html).toContain("의 최솟값은 ");
    expect(html).not.toContain("mtable");
    expect(html).not.toContain("katex-error");
  });

  it("recognizes boxed aligned conditions and keeps nested math intact", () => {
    const nested = String.raw`\begin{cases}1 & x>0\\0 & x\le0\end{cases}`;
    const parsed = parseConditionLatex(
      String.raw`\boxed{\begin{aligned}\text{(가)} & f(x)=${nested}\text{이다.}\\\text{(나)} & \frac{a}{b}=2\end{aligned}}`,
    )!;
    expect(parsed.boxed).toBe(true);
    expect(parsed.conditions[0].parts).toEqual([
      { kind: "math", value: `f(x)=${nested}` },
      { kind: "text", value: "이다." },
    ]);
    expect(parsed.conditions[1].parts).toEqual([
      { kind: "math", value: String.raw`\frac{a}{b}=2` },
    ]);
  });

  it("leaves other arrays and malformed rows to the math renderer", () => {
    for (const source of [
      String.raw`\begin{array}{ll}a & b\\c & d\end{array}`,
      String.raw`\begin{array}{lr}\text{(가)} & x\end{array}`,
      String.raw`\begin{array}{ll}& x\end{array}`,
      String.raw`\begin{array}{ll}\text{(가)} & x & y\end{array}`,
      String.raw`x+\boxed{\begin{array}{ll}\text{(가)} & x\end{array}}`,
    ])
      expect(parseConditionLatex(source)).toBeNull();
  });

  it("recognizes label spacing used by RC2 and keeps nested cases unchanged", () => {
    const nested = String.raw`\begin{cases}2S_n, & (n\text{이 짝수이다.})\\[0.4em]a_n+S_n, & (n\text{이 홀수이다.})\end{cases}`;
    const parsed = parseConditionLatex(
      String.raw`\begin{aligned}\text{(가)}\quad & S_2=1,\qquad\sum_{k=1}^{8}S_k=153\\[1.2em]\text{(나)}\quad & a_{n+1}+a_{n+2}=${nested}\end{aligned}`,
    )!;
    expect(parsed.conditions.map((condition) => condition.label)).toEqual([
      "(가)",
      "(나)",
    ]);
    expect(parsed.conditions[1].parts).toEqual([
      { kind: "math", value: `a_{n+1}+a_{n+2}=${nested}` },
    ]);
  });

  it.each(["array}{l", "gathered"])(
    "recognizes single-column %s conditions",
    (environment) => {
      const name = environment.split("}")[0];
      const parsed = parseConditionLatex(
        `\\begin{${environment}}\\text{(가)} x=1\\\\\\text{(나)} x>0\\end{${name}}`,
      )!;
      expect(parsed.conditions.map((condition) => condition.label)).toEqual([
        "(가)",
        "(나)",
      ]);
    },
  );

  it("rejoins mathematical continuation before parsing", () => {
    const latex = String.raw`\begin{aligned}\text{(가)} & \frac{a}{b}+\\ &\frac{c}{d}\text{이다.}\end{aligned}`;
    const parsed = parseConditionLatex(latex)!;
    expect(parsed.conditions[0].parts[0]).toEqual({
      kind: "math",
      value: String.raw`\frac{a}{b}+ \frac{c}{d}`,
    });
    const html = renderToStaticMarkup(
      createElement(ProblemContent, {
        problem: { number: 1, body: [{ kind: "displayMath", latex }] },
      }),
    );
    expect(html).not.toContain("katex-error");
  });

  it("extracts a label embedded in the same text group as its condition", () => {
    const parsed = parseConditionLatex(
      String.raw`\begin{array}{l}\text{(가) 모든 실수에 대하여 양수이다.}\\\text{(나) \textbf{서로 다른} 두 실수이다.}\end{array}`,
    )!;
    expect(parsed.conditions[0]).toEqual({
      label: "(가)",
      parts: [{ kind: "text", value: "모든 실수에 대하여 양수이다." }],
    });
    expect(parsed.conditions[1]).toEqual({
      label: "(나)",
      parts: [
        {
          kind: "mathText",
          value: String.raw`\text{\textbf{서로 다른} 두 실수이다.}`,
        },
      ],
    });
  });
});
