import { afterEach, describe, expect, it, vi } from "vitest";
import { clearPrintLayout, preparePrintLayout } from "./printLayout.js";

function math(width: number, scroll: number) {
  return {
    clientWidth: width,
    scrollWidth: scroll,
    dataset: {} as Record<string, string>,
    style: {
      fontSize: "",
      removeProperty: vi.fn(function (this: { fontSize: string }) {
        this.fontSize = "";
      }),
    },
  };
}
function problem(height: number, formulas: ReturnType<typeof math>[]) {
  return {
    dataset: {} as Record<string, string>,
    getBoundingClientRect: () => ({ height }),
    querySelectorAll: vi.fn((selector: string) =>
      selector === "[data-math-kind]" ? formulas : [],
    ),
  };
}
function documentFixture(problems: ReturnType<typeof problem>[]) {
  const formulas = problems.flatMap((p) =>
    p.querySelectorAll("[data-math-kind]"),
  );
  const dataset = {} as Record<string, string>;
  const element = {
    dataset,
    offsetHeight: 0,
    querySelectorAll: vi.fn((selector: string) => {
      if (selector === "[data-print-math-fit]")
        return formulas.filter((formula) => formula.dataset.printMathFit);
      if (selector === "[data-math-kind]") return formulas;
      if (selector === "[data-print-problem]") return problems;
      if (selector === "[data-print-problem][data-wide]")
        return problems.filter((p) => p.dataset.wide);
      throw new Error(`Unexpected print selector: ${selector}`);
    }),
  };
  return element as unknown as HTMLElement;
}

afterEach(() => vi.unstubAllGlobals());

describe("print layout semantic hooks", () => {
  it("preserves the two-column promotion threshold and fits overflowing math", () => {
    vi.stubGlobal("getComputedStyle", () => ({ fontSize: "20px" }));
    const wideFormula = math(100, 200);
    const fits = problem(200, [math(100, 100)]);
    const wide = problem(200, [wideFormula]);
    const tall = problem(500, []);
    const document = documentFixture([fits, wide, tall]);
    preparePrintLayout(document);
    expect(fits.dataset.wide).toBeUndefined();
    expect(wide.dataset.wide).toBe("true");
    expect(tall.dataset.wide).toBe("true");
    expect(wideFormula.style.fontSize).toBe("10px");
    expect(wideFormula.dataset.printMathFit).toBe("true");
    expect(document.dataset.measuring).toBeUndefined();
    clearPrintLayout(document);
    expect(wide.dataset.wide).toBeUndefined();
    expect(tall.dataset.wide).toBeUndefined();
    expect(wideFormula.style.fontSize).toBe("");
    expect(wideFormula.dataset.printMathFit).toBeUndefined();
  });
  it("clears prior sizing before re-measuring and accepts an unmounted document", () => {
    const formula = math(100, 100);
    formula.dataset.printMathFit = "true";
    formula.style.fontSize = "12px";
    const item = problem(100, [formula]);
    item.dataset.wide = "true";
    preparePrintLayout(documentFixture([item]));
    expect(formula.style.removeProperty).toHaveBeenCalledWith("font-size");
    expect(formula.dataset.printMathFit).toBeUndefined();
    expect(item.dataset.wide).toBeUndefined();
    expect(() => preparePrintLayout(null)).not.toThrow();
    expect(() => clearPrintLayout(null)).not.toThrow();
  });
});
