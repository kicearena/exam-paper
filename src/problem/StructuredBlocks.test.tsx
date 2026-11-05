import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProblemContent } from "./ProblemContent.js";
import { ProblemChoices } from "./ProblemChoices.js";

describe("structured exam content", () => {
  it("keeps prose, a graph and display math in one ordered proof box", () => {
    const html = renderToStaticMarkup(
      <ProblemContent
        problem={{
          number: 20,
          body: [
            {
              kind: "box",
              variant: "proof",
              blocks: [
                { kind: "paragraph", text: "그래프는 다음과 같다." },
                { kind: "diagram", src: "/graph.svg", alt: "그래프" },
                { kind: "displayMath", latex: "x_1<x_2" },
              ],
            },
          ],
        }}
      />,
    );
    expect(html).toContain('data-problem-box="proof"');
    expect(html.indexOf("그래프는 다음과 같다.")).toBeLessThan(
      html.indexOf('src="/graph.svg"'),
    );
    expect(html.indexOf('src="/graph.svg"')).toBeLessThan(
      html.indexOf('class="katex'),
    );
  });
  it("renders table headers and five answer rows without splitting nested math", () => {
    const html = renderToStaticMarkup(
      <ProblemChoices
        number={27}
        columns={["(가)", "(나)", "(다)"]}
        choices={Array(5).fill(
          String.raw`\le & \begin{matrix}a&b\end{matrix} & \ge`,
        )}
      />,
    );
    expect(html).toContain("<table");
    expect((html.match(/scope="row"/g) ?? []).length).toBe(5);
    expect((html.match(/<td>/g) ?? []).length).toBe(15);
    expect(html).toContain("⑤");
    expect(html).not.toContain("katex-error");
  });
  it("rejects mismatched choice columns", () => {
    expect(() =>
      renderToStaticMarkup(
        <ProblemChoices number={1} columns={["가", "나"]} choices={["1"]} />,
      ),
    ).toThrow("columns");
  });
});
