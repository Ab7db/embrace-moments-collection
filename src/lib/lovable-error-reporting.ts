/** Simple error reporter — replace with your preferred error tracking (Sentry, etc.) */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[App Error]", error, context);
}
