import { type ReactNode, memo } from "react";
import type { ProblemBodyBlock, ProblemDocument } from "../model.js";
import { LoadingImage } from "../common/LoadingImage.js";
import { MathHtml, extractWrappingBoxLatex } from "../common/MathHtml.js";
import { parseConditionLatex } from "./conditionLatex.js";
import { parseLatexProse, type LatexProsePart } from "./latexProse.js";
import { SkeletonText } from "../common/SkeletonText.js";
import styles from "./ProblemContent.module.css";

export const ProblemContent = memo(function ProblemContent({
  problem,
  presentation = "room",
}: {
  problem: Pick<ProblemDocument, "body" | "imageUrl" | "number">;
  presentation?: "room" | "spectator" | "public" | "preview" | "print";
}) {
  if (!problem.body?.length && problem.imageUrl) {
    return <ProblemImage problem={problem} presentation={presentation} />;
  }

  return (
    <article
      className={styles.content}
      data-problem-content
      data-presentation={presentation}
      aria-label={`${problem.number}번 문제`}
    >
      <div className={styles.body} data-problem-body>
        {(problem.body ?? []).map((block, index) => (
          <ProblemBlock
            preview={presentation === "preview"}
            printMode={presentation === "print"}
            key={`${block.kind}-${index}`}
            block={block}
          />
        ))}
      </div>
    </article>
  );
});

const ProblemBlock = memo(function ProblemBlock({
  block,
  preview,
  printMode,
}: {
  block: ProblemBodyBlock;
  preview: boolean;
  printMode: boolean;
}) {
  if (block.kind === "paragraph") {
    return (
      <p className={styles["paragraph"]}>
        {renderInlineMath(block.text, block.inlineMath)}
      </p>
    );
  }

  if (block.kind === "displayMath") {
    const parsed = parseConditionLatex(block.latex);
    if (parsed) {
      return (
        <dl
          className={[
            styles.conditions,
            parsed.boxed && styles["conditions-boxed"],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {parsed.conditions.map((condition, index) => (
            <div
              data-problem-condition
              className={styles["condition"]}
              key={index}
            >
              <dt>{condition.label}</dt>
              <dd>
                <LatexProse parts={condition.parts} />
              </dd>
            </div>
          ))}
        </dl>
      );
    }
    const boxed = extractWrappingBoxLatex(block.latex);
    const prose = parseLatexProse(boxed ?? block.latex);
    if (prose) {
      return (
        <p
          data-latex-prose
          className={[
            styles["latex-prose"],
            boxed !== null && styles["conditions-boxed"],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <LatexProse parts={prose} />
        </p>
      );
    }
    return (
      <MathHtml
        variant={preview ? "preview" : "default"}
        latex={block.latex}
        displayMode
      />
    );
  }

  if (block.kind === "choices") {
    return null;
  }

  if (block.kind === "diagram") {
    return (
      <figure className={styles["diagram"]}>
        <LoadingImage
          presentation={
            printMode ? "print" : preview ? "diagram-preview" : "default"
          }
          src={block.src}
          alt={block.alt}
        />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <p className={styles["note"]}>
      {renderInlineMath(block.text, block.inlineMath)}
    </p>
  );
});

function LatexProse({ parts }: { parts: LatexProsePart[] }) {
  return parts.map((part, index) =>
    part.kind === "text" ? (
      part.value
    ) : (
      <MathHtml
        key={index}
        latex={part.value}
        variant={part.kind === "mathText" ? "prose" : "default"}
      />
    ),
  );
}

function renderInlineMath(text: string, inlineMath: string[] = []) {
  const parts = text.split("{}");
  return parts.flatMap((part, index) => {
    const nodes: ReactNode[] = [part];
    const latex = inlineMath[index];
    if (latex) {
      const prose = parseLatexProse(latex);
      nodes.push(
        prose ? (
          <LatexProse key={`${latex}-${index}`} parts={prose} />
        ) : (
          <MathHtml key={`${latex}-${index}`} latex={latex} />
        ),
      );
    }
    return nodes;
  });
}

export function ProblemContentLoading() {
  return (
    <div className={styles.content}>
      <div className={styles.body} data-problem-body>
        <p>
          <SkeletonText width="95%" />
          <br />
          <SkeletonText width="90%" />
          <br />
          <SkeletonText width="65%" />
        </p>
        <p>
          <SkeletonText width="85%" />
          <br />
          <SkeletonText width="55%" />
        </p>
      </div>
    </div>
  );
}

export function ProblemImage({
  problem,
  presentation,
}: {
  problem: Pick<ProblemDocument, "imageUrl" | "number">;
  presentation: "room" | "public" | "preview" | "print" | "spectator";
}) {
  return (
    <LoadingImage
      presentation={
        presentation === "preview"
          ? "problem-preview"
          : presentation === "print"
            ? "print"
            : presentation === "room"
              ? "problem"
              : "default"
      }
      data-presentation={presentation}
      src={problem.imageUrl}
      alt={`${problem.number}번 문제`}
    />
  );
}
