import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { ExamDocumentPaper } from "./ExamDocumentPaper.js";
import { ProblemContent } from "../problem/ProblemContent.js";
describe("exam paper", () => {
  it("renders actual math with caller-owned brand and preview chrome", () => {
    const markup = renderToStaticMarkup(
      <ExamDocumentPaper
        presentation="preview"
        items={[
          {
            id: "p7",
            number: 7,
            pointValue: 4,
            content: (
              <ProblemContent
                presentation="preview"
                problem={{
                  number: 7,
                  body: [
                    { kind: "paragraph", text: "본문 {}", inlineMath: ["x^2"] },
                  ],
                }}
              />
            ),
          },
        ]}
        activeId="p7"
        view="paged"
        title="수학 영역"
        subtitle="시험 제목"
        instructions={null}
        itemCount={1}
        totalPoints={4}
        finished={false}
        showNavigationState={false}
        onItemRef={() => {}}
        previewAnswer={<button disabled>Sample answer</button>}
      />,
    );
    expect(markup).toContain('data-exam-preview="true"');
    expect(markup).toContain("시험 제목");
    expect(markup).toContain("7번");
    expect(markup).toContain("4점");
    expect(markup).toContain('data-math-kind="inline"');
    expect(markup).toContain('disabled=""');
  });
});
