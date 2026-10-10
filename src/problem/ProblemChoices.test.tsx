import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProblemChoices } from "./ProblemChoices.js";
describe("inert exam choices", () => {
  it.each(["document", "public", "print"] as const)(
    "renders labelled mathematical choices in %s presentation",
    (presentation) => {
      const html = renderToStaticMarkup(
        <ProblemChoices
          number={1}
          presentation={presentation}
          choices={["1", "2", "3", "\\frac{1}{2}", "5"]}
        />,
      );
      expect(html).toContain('aria-label="1번 선택지"');
      expect((html.match(/role="listitem"/g) ?? []).length).toBe(5);
      expect(html).toContain("①");
      expect(html).toContain("⑤");
      expect(html).toContain("katex");
      expect(html).not.toContain("<button");
    },
  );
});
