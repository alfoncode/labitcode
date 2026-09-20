/** Calculate reading time from raw markdown/text content. */
export function getReadingTime(content: string, lang: "en" | "es" = "en"): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 238));
  return lang === "es" ? `${minutes} min de lectura` : `${minutes} min read`;
}

/** Format a Date object into a human-readable string. */
export function formatDate(date: Date, lang: "en" | "es" = "en"): string {
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
