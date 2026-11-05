import { MathHtml } from "../common/MathHtml.js";
import { splitOuterLatex } from "./latexProse.js";
import styles from "./ProblemChoices.module.css";

export function ProblemChoices({
  choices,
  columns,
  number,
  presentation = "document",
  numbering = "extended",
}: {
  choices: readonly string[];
  columns?: readonly string[];
  number: number;
  presentation?: "document" | "public" | "print";
  numbering?: "five" | "extended";
}) {
  if (!choices.length) return null;
  if (columns) {
    const rows = choices.map((choice) => splitOuterLatex(choice, "&"));
    if (
      !columns.length ||
      rows.some((row) => !row || row.length !== columns.length)
    )
      throw new Error("Choice table columns must match every row.");
    return (
      <table
        className={styles.table}
        data-problem-choice-table
        data-presentation={presentation}
        aria-label={`${number}번 선택지`}
      >
        <thead>
          <tr>
            <th scope="col" aria-label="선택지 번호" />
            {columns.map((column, index) => (
              <th scope="col" key={index}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <th scope="row">{"①②③④⑤⑥⑦⑧⑨⑩"[index] ?? index + 1}</th>
              {row!.map((cell, column) => (
                <td key={column}>
                  <MathHtml latex={cell.trim()} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
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
