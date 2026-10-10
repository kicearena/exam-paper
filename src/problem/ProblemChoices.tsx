import { MathHtml } from "../common/MathHtml.js";
import styles from "./ProblemChoices.module.css";

export function ProblemChoices({
  choices,
  number,
  presentation = "document",
  numbering = "extended",
}: {
  choices: readonly string[];
  number: number;
  presentation?: "document" | "public" | "print";
  numbering?: "five" | "extended";
}) {
  return (
    <div
      className={styles.choices}
      data-presentation={presentation}
      data-problem-choices
      role="list"
      aria-label={`${number}번 선택지`}
    >
      {choices.map((choice, index) => (
        <span key={index} role="listitem">
          <i className={styles.number} aria-hidden="true">
            {numbering === "five"
              ? "①②③④⑤"[index]
              : ("①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"[index] ?? String(index + 1))}
          </i>
          <MathHtml className={styles.value} latex={choice} />
        </span>
      ))}
    </div>
  );
}
