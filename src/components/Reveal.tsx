import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useMotionPrefs";

/** Slow editorial fade + rise on enter. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "header";
}) {
  const { ref, inView } = useReveal();
  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translate3d(0, 28px, 0)",
        transition: `opacity 1s var(--ease-cine) ${delay}ms, transform 1.2s var(--ease-cine) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/** Small uppercase section label with a hairline. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <span className="type-meta">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
