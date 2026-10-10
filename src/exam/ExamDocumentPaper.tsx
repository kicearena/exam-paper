import styles from "./ExamDocumentPaper.module.css";
import type { ReactNode } from "react";
import type { ExamDocumentItem } from "../model.js";
import type { ExamDocumentView } from "../model.js";
import { ExamPaperHeader } from "./ExamPaperHeader.js";

export function ExamDocumentPaper({
  items,
  activeId,
  view,
  title,
  subtitle,
  instructions,
  itemCount,
  totalPoints,
  finished,
  showNavigationState,
  onItemRef,
  previewAnswer,
  presentation = "document",
  brand,
}: {
  items: readonly ExamDocumentItem[];
  activeId: string;
  view: ExamDocumentView;
  title: string;
  subtitle: string;
  instructions: ReactNode;
  itemCount: number;
  totalPoints: number;
  finished: boolean;
  showNavigationState: boolean;
  onItemRef: (id: string, node: HTMLElement | null) => void;
  previewAnswer?: ReactNode;
  presentation?: "document" | "preview";
  brand?: ReactNode;
}) {
  if (presentation === "preview") {
    const item = items[0];
    return (
      <div className={styles.preview} data-exam-preview>
        <ExamPaperHeader
          brand={brand}
          title={title}
          subtitle={subtitle}
          itemCount={itemCount}
          totalPoints={totalPoints}
          instructions={instructions}
          preview={{ number: item.number, pointValue: item.pointValue }}
        />
        <div className={styles["preview-body"]}>{item.content}</div>
        {previewAnswer}
      </div>
    );
  }
  return (
    <article
      className={styles["exam-paper"]}
      data-exam-paper
      data-view={view}
      aria-label={
        view === "paged" ? `${items[0]?.number}번 수학 문제` : "수학 시험지"
      }
    >
      <ExamPaperHeader
        brand={brand}
        title={title}
        subtitle={subtitle}
        itemCount={itemCount}
        totalPoints={totalPoints}
        instructions={instructions}
      />
      <div data-exam-problems>
        {items.map((item) => (
          <section
            ref={(node) => onItemRef(item.id, node)}
            key={item.id}
            id={`problem-${item.id}`}
            data-problem-id={item.id}
            className={[
              styles["question-block"],
              item.id === activeId && styles["active-question"],
              styles[view],
            ]
              .filter(Boolean)
              .join(" ")}
            data-exam-question
            aria-current={item.id === activeId ? "true" : undefined}
            aria-label={`${item.number}번 문제`}
          >
            {item.content}
            <small>
              KICE ARENA · <span>{String(item.number).padStart(2, "0")}</span>
              {showNavigationState && (
                <span aria-hidden="true">
                  {item.state === "correct"
                    ? "✓"
                    : item.state === "wrong"
                      ? "×"
                      : "—"}
                </span>
              )}
            </small>
          </section>
        ))}
      </div>
      <footer className={styles["paper-end"]}>
        확인 사항
        <small>
          {finished
            ? "문항별 채점 결과를 확인하십시오."
            : "아직 제출하지 않은 답안이 있는지 확인하십시오."}
        </small>
      </footer>
    </article>
  );
}

export function ExamPaperLoading({
  subtitle,
  instructions,
  children,
  view,
  brand,
}: {
  brand?: ReactNode;
  subtitle: ReactNode;
  instructions: ReactNode;
  children: ReactNode;
  view?: ExamDocumentView;
}) {
  return (
    <section className={styles["exam-paper"]} data-exam-paper data-view={view}>
      <ExamPaperHeader
        brand={brand}
        title="수학 영역"
        subtitle={subtitle}
        itemCount={null}
        totalPoints={0}
        instructions={instructions}
      />
      <div
        className={[styles["question-block"], view && styles[view]]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
