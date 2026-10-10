const MILLIMETERS_TO_CSS_PIXELS = 96 / 25.4;
const LONG_PROBLEM_HEIGHT = 118 * MILLIMETERS_TO_CSS_PIXELS;

function clearPrintMath(documentElement: HTMLElement) {
  documentElement
    .querySelectorAll<HTMLElement>("[data-print-math-fit]")
    .forEach((math) => {
      math.style.removeProperty("font-size");
      delete math.dataset.printMathFit;
    });
}

function fitPrintMath(documentElement: HTMLElement) {
  // A paper copy cannot scroll. Expand to one column first, then fit only
  // mathematical groups that still exceed the actual printable width.
  documentElement
    .querySelectorAll<HTMLElement>("[data-math-kind]")
    .forEach((math) => {
      if (math.scrollWidth <= math.clientWidth + 1) return;
      const fontSize = Number.parseFloat(getComputedStyle(math).fontSize);
      math.style.fontSize = `${(fontSize * math.clientWidth) / math.scrollWidth}px`;
      math.dataset.printMathFit = "true";
    });
}

export function preparePrintLayout(documentElement: HTMLElement | null) {
  if (!documentElement) return;
  clearPrintMath(documentElement);

  const problems = Array.from(
    documentElement.querySelectorAll<HTMLElement>("[data-print-problem]"),
  );
  problems.forEach((problem) => delete problem.dataset.wide);
  documentElement.dataset.measuring = "true";
  void documentElement.offsetHeight;

  problems.forEach((problem) => {
    const wideMath = Array.from(
      problem.querySelectorAll<HTMLElement>("[data-math-kind]"),
    ).some((math) => math.scrollWidth > math.clientWidth + 1);
    if (
      wideMath ||
      problem.getBoundingClientRect().height > LONG_PROBLEM_HEIGHT
    )
      problem.dataset.wide = "true";
  });
  fitPrintMath(documentElement);
  delete documentElement.dataset.measuring;
}

export function clearPrintLayout(documentElement: HTMLElement | null) {
  if (documentElement) clearPrintMath(documentElement);
  if (documentElement) delete documentElement.dataset.measuring;
  documentElement
    ?.querySelectorAll<HTMLElement>("[data-print-problem][data-wide]")
    .forEach((problem) => delete problem.dataset.wide);
}
