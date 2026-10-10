import { preparePrintLayout, clearPrintLayout } from "./printLayout.js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import styles from "./PrintableExamDocument.module.css";

export type PrintableExamItem = {
  id: string;
  number: number;
  pointValue?: number;
  content: ReactNode;
  printContent?: ReactNode;
};

async function waitForPrintAssets(documentElement: HTMLElement) {
  if ("fonts" in document) await document.fonts.ready;
  const images = Array.from(
    documentElement.querySelectorAll<HTMLImageElement>("img"),
  );
  images.forEach((image) => {
    image.loading = "eager";
  });
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve, reject) => {
          const fail = () => reject(new Error("print-image"));
          if (image.complete) {
            if (image.naturalWidth > 0 || image.currentSrc.startsWith("data:"))
              resolve();
            else fail();
            return;
          }
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", fail, { once: true });
        }),
    ),
  );
}

export function useExamPrint(printReady: boolean) {
  const printableDocumentRef = useRef<HTMLElement>(null);
  const [printError, setPrintError] = useState("");

  const printDocument = useCallback(async () => {
    const printableDocument = printableDocumentRef.current;
    if (!printReady || !printableDocument) return;
    setPrintError("");
    try {
      await waitForPrintAssets(printableDocument);
      preparePrintLayout(printableDocument);
      window.print();
    } catch {
      setPrintError(
        "시험지 그림을 준비하지 못해 인쇄할 수 없습니다. 다시 시도해 주세요.",
      );
    }
  }, [printReady]);

  useEffect(() => {
    if (!printReady) setPrintError("");
  }, [printReady]);

  useEffect(() => {
    const beforePrint = () => preparePrintLayout(printableDocumentRef.current);
    const afterPrint = () => clearPrintLayout(printableDocumentRef.current);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  return { printableDocumentRef, printDocument, printError };
}

export function PrintableExamDocument({
  examName,
  items,
  documentRef,
  brand,
}: {
  examName: string;
  items: readonly PrintableExamItem[];
  brand?: ReactNode;
  documentRef: RefObject<HTMLElement | null>;
}) {
  return (
    <article
      ref={documentRef}
      data-print-document
      className={styles["printable-exam-document"]}
      aria-hidden="true"
    >
      <header data-print-header className={styles["printable-exam-header"]}>
        <div data-print-brand className={styles["printable-exam-brand"]}>
          {brand}
        </div>
        <h1>{examName}</h1>
      </header>
      <div data-print-problems className={styles["printable-exam-problems"]}>
        {items.map((item) => (
          <section
            data-print-problem
            key={item.id}
            className={styles["printable-exam-problem"]}
          >
            <header className={styles["printable-exam-problem-number"]}>
              <strong>{item.number}.</strong>
              {item.pointValue !== undefined && (
                <span>[{item.pointValue}점]</span>
              )}
            </header>
            {item.printContent ?? item.content}
          </section>
        ))}
      </div>
    </article>
  );
}
