import styles from "./ExamPaperHeader.module.css";
import { SkeletonText } from "../common/SkeletonText.js";
import type { ReactNode } from "react";

export function ExamPaperHeader({
  title,
  subtitle,
  itemCount,
  totalPoints,
  instructions,
  className = "",
  preview,
  brand,
}: {
  title: string;
  subtitle: ReactNode;
  itemCount: number | null;
  totalPoints: number;
  instructions: ReactNode;
  className?: string;
  brand?: ReactNode;
  preview?: { number: number; pointValue?: number };
}) {
  if (preview)
    return (
      <div className={styles["problem-focus-head"]}>
        <div>
          <span>{subtitle}</span>
          <strong>{preview.number}번</strong>
          <small className={styles["problem-attempt-count"]}>응시 화면</small>
        </div>
        <span aria-hidden="true" />
        <em>{preview.pointValue}점</em>
      </div>
    );
  return (
    <header
      data-exam-paper-header
      className={[styles["paper-head"], className].filter(Boolean).join(" ")}
    >
      <div className={styles["exam-paper-head__topline"]}>
        <span data-exam-brand className={styles["exam-paper-head__brand"]}>
          {brand}
        </span>
        <span className={styles["exam-paper-head__summary"]}>
          {itemCount === null ? (
            <SkeletonText width="8ch" />
          ) : (
            `${itemCount}문항${totalPoints > 0 ? ` · ${totalPoints}점` : ""}`
          )}
        </span>
      </div>
      <div className={styles["exam-paper-head__title"]}>
        <span className={styles["exam-edition"]}>{subtitle}</span>
        <h2>{title}</h2>
      </div>
      <div className={styles["paper-instruction"]}>{instructions}</div>
    </header>
  );
}
