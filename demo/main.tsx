import { createRoot } from "react-dom/client";
import { useState } from "react";
import {
  ExamDocumentPaper,
  PrintableExamDocument,
  useExamPrint,
  ProblemContent,
  ProblemChoices,
} from "../src/index.js";
import "./style.css";
const fixtures = [
  {
    number: 1,
    body: [
      {
        kind: "paragraph" as const,
        text: "다항식 {}의 값은?",
        inlineMath: ["(x+1)^2-(x-1)^2"],
      },
      { kind: "displayMath" as const, latex: "x=2" },
    ],
  },
  {
    number: 2,
    body: [
      {
        kind: "paragraph" as const,
        text: "함수 {}에 대하여 {}의 값을 구하시오.",
        inlineMath: ["f(x)=x^3-3x", "\\int_0^2 f(x)\\,dx"],
      },
    ],
  },
  {
    number: 3,
    body: [
      {
        kind: "paragraph" as const,
        text: "다음 조건을 만족시키는 실수 {}의 값을 구하시오.",
        inlineMath: ["a"],
      },
      { kind: "displayMath" as const, latex: "\\boxed{a^2+2a=3}" },
    ],
  },
];
const items = fixtures.map((problem, i) => ({
  id: `q${i + 1}`,
  number: problem.number,
  pointValue: 4,
  content: (
    <>
      <ProblemContent problem={problem} />
      {i === 0 && (
        <ProblemChoices number={1} choices={["2", "4", "6", "8", "10"]} />
      )}
    </>
  ),
  printContent: (
    <>
      <ProblemContent presentation="print" problem={problem} />
      {i === 0 && (
        <ProblemChoices
          number={1}
          presentation="print"
          choices={["2", "4", "6", "8", "10"]}
        />
      )}
    </>
  ),
}));
function App() {
  const [view, setView] = useState<"continuous" | "paged">("continuous");
  const { printableDocumentRef, printDocument, printError } =
    useExamPrint(true);
  const brand = <strong>DEMO EXAM</strong>;
  return (
    <>
      <main data-print-hide>
        <nav>
          <small>KICE ARENA / OPEN SOURCE · MIT</small>
          <div>
            <button
              onClick={() =>
                setView(view === "continuous" ? "paged" : "continuous")
              }
            >
              Toggle layout
            </button>
            <button onClick={printDocument}>Print / PDF</button>
          </div>
        </nav>
        <h1>시험지, 수식으로 완성하다.</h1>
        <p>
          한글 본문과 LaTeX 수식, 조건 상자, 두 단 인쇄. 합성 예제 문항입니다.
        </p>
        <ExamDocumentPaper
          items={view === "paged" ? items.slice(0, 1) : items}
          activeId="q1"
          view={view}
          title="수학 영역"
          subtitle="공개 패키지 예제"
          instructions="문항을 읽고 답을 구하시오."
          itemCount={3}
          totalPoints={12}
          finished={false}
          showNavigationState={false}
          onItemRef={() => {}}
          brand={brand}
        />
        <p role="status">{printError}</p>
      </main>
      <PrintableExamDocument
        examName="수학 영역 · 합성 예제"
        items={items}
        documentRef={printableDocumentRef}
        brand={brand}
      />
    </>
  );
}
createRoot(document.querySelector("#app")!).render(<App />);
