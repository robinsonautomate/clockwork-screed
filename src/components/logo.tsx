import { cn } from "@/lib/utils";

type LogoProps = {
  /** "light" for use on the dark slate sidebar. */
  variant?: "default" | "light";
  /** Hide the wordmark, show only the mark. */
  markOnly?: boolean;
  className?: string;
};

/**
 * Clockwork Screed wordmark — slate squares with an amber accent square,
 * evoking poured screed bays. Inline SVG so it stays crisp and themeable.
 */
export function Logo({
  variant = "default",
  markOnly = false,
  className,
}: LogoProps) {
  const light = variant === "light";
  const base = light ? "#f8fafc" : "#1e293b";
  const inner = light ? "#1e293b" : "#f1f5f9";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 36 36"
        width="28"
        height="28"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="2" width="32" height="32" rx="7.5" fill={base} />
        <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" fill={inner} />
        <rect x="19.5" y="8.5" width="8" height="8" rx="2" fill="#f59e0b" />
        <rect x="8.5" y="20.5" width="8" height="8" rx="2" fill="#f59e0b" />
        <rect
          x="19.5"
          y="19.5"
          width="11"
          height="11"
          rx="2.5"
          fill={inner}
          opacity="0.55"
        />
      </svg>
      {!markOnly && (
        <span
          className={cn(
            "font-semibold tracking-tight leading-none whitespace-nowrap",
            light ? "text-white" : "text-slate-800",
          )}
        >
          <span className="text-[15px]">Clockwork</span>{" "}
          <span className="text-[15px]">Screed</span>
        </span>
      )}
    </span>
  );
}
