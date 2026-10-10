import { clsx as cn } from "clsx";
import styles from "./SkeletonText.module.css";
import type { CSSProperties } from "react";

/** Reserves the text baseline without exposing placeholder data to assistive technology. */
export function SkeletonText({
  width = "8ch",
  variant = "text",
  className,
}: {
  width?: string;
  className?: string;
  variant?: "text" | "ticket-date";
}) {
  return (
    <span
      data-slot="skeleton-text"
      className={cn(styles[variant], className)}
      style={{ "--skeleton-width": width } as CSSProperties}
      aria-hidden="true"
    />
  );
}
