import { describe, it, expect } from "vitest";
import { normalize, levenshtein, search, type SearchEntry } from "../src/utils/search";

describe("Search Utility - Normalization & Levenshtein", () => {
  it("should normalize accents, uppercase, and special characters", () => {
    expect(normalize("Guía Definitiva")).toBe("guia definitiva");
    expect(normalize("¿Cómo optimizar LCP?")).toBe("como optimizar lcp");
    expect(normalize("Cloudflare   Kitesurf!")).toBe("cloudflare kitesurf");
  });

  it("should correctly compute Levenshtein distance", () => {
    expect(levenshtein("cloudflaare", "cloudflare")).toBe(1);
    expect(levenshtein("playwright", "playwright")).toBe(0);
    expect(levenshtein("playwright", "playwrihgt")).toBe(2);
    expect(levenshtein("ai", "docker")).toBe(6);
  });
});

describe("Search Utility - Relevance Scoring & Typo Tolerance", () => {
  const sampleEntries: SearchEntry[] = [
    {
      title: "Playwright con TypeScript: Guía Definitiva de Arquitectura y Mejores Prácticas",
      description: "Guía arquitectónica de nivel empresarial para construir suites de tests robustas...",
      tags: ["Playwright", "TypeScript", "Testing", "DevOps"],
      slug: "arquitectura-playwright-typescript-mejores-practicas",
      type: "blog",
      lang: "es",
    },
    {
      title: "Cloudflare Kitesurf: El Navegador Stateless en Aislamiento V8",
      description: "Un análisis técnico en profundidad de Cloudflare Kitesurf...",
      tags: ["Cloudflare", "Browser", "Architecture", "Security"],
      slug: "cloudflare-kitesurf-navegador-agentico",
      type: "blog",
      lang: "es",
    },
    {
      title: "Cloudflare Kitesurf: Inside the Stateless V8-Isolate Browser",
      description: "A deep technical analysis of Cloudflare Kitesurf...",
      tags: ["Cloudflare", "Browser", "Architecture", "Security"],
      slug: "cloudflare-kitesurf-agentic-browser",
      type: "blog",
      lang: "en",
    },
    {
      title: "Kimi K3 vs. GPT-5.6 Sol y Claude Fable 5: La Revolución de Coste-Rendimiento",
      description: "Comparativa técnica de arquitectura y coste-rendimiento del modelo MoE...",
      tags: ["AI", "Kimi K3", "LLM Benchmarks", "DeepSeek"],
      slug: "comparativa-rendimiento-precio-kimi-k3",
      type: "blog",
      lang: "es",
    },
    {
      title: "La Guía Definitiva de Bastionado de VPS: Asegurando Servidores Linux para Producción",
      description: "Tutorial exhaustivo para blindar un nuevo servidor VPS Linux...",
      tags: ["DevSecOps", "Linux", "Security", "SSH"],
      slug: "guia-configuracion-vps-seguro",
      type: "blog",
      lang: "es",
    },
    {
      title: "Plataforma Labitcode",
      description: "El laboratorio de ingeniería que impulsa labitcode.com",
      tags: ["Astro", "Tailwind CSS", "TypeScript"],
      slug: "plataforma-labitcode",
      type: "project",
      lang: "es",
    },
  ];

  it("should match Cloudflare articles when typing 'cloudflaare' (typo) and completely exclude unrelated articles", () => {
    const results = search(sampleEntries, "cloudflaare", "es");

    // Only the two Cloudflare articles should be returned
    expect(results.length).toBe(2);
    expect(results[0].slug).toBe("cloudflare-kitesurf-navegador-agentico");
    expect(results[1].slug).toBe("cloudflare-kitesurf-agentic-browser");

    // Playwright, Kimi K3, and VPS articles MUST NOT be returned!
    const slugs = results.map((r) => r.slug);
    expect(slugs).not.toContain("arquitectura-playwright-typescript-mejores-practicas");
    expect(slugs).not.toContain("comparativa-rendimiento-precio-kimi-k3");
    expect(slugs).not.toContain("guia-configuracion-vps-seguro");
  });

  it("should rank Spanish article first when browsing in Spanish ('es')", () => {
    const results = search(sampleEntries, "cloudflare", "es");
    expect(results[0].lang).toBe("es");
    expect(results[1].lang).toBe("en");
  });

  it("should rank English article first when browsing in English ('en')", () => {
    const results = search(sampleEntries, "cloudflare", "en");
    expect(results[0].lang).toBe("en");
    expect(results[1].lang).toBe("es");
  });

  it("should match accent variations (e.g. 'guia' matches 'Guía')", () => {
    const results = search(sampleEntries, "guia", "es");
    const titles = results.map((r) => r.title);
    expect(titles.some((t) => t.includes("Playwright"))).toBe(true);
    expect(titles.some((t) => t.includes("Bastionado"))).toBe(true);
  });

  it("should match by tags (e.g. 'devsecops')", () => {
    const results = search(sampleEntries, "devsecops", "es");
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe("guia-configuracion-vps-seguro");
  });

  it("should return empty array for completely unrelated query", () => {
    const results = search(sampleEntries, "xyznonexistentquery", "es");
    expect(results).toEqual([]);
  });

  it("should require all tokens in multi-token queries", () => {
    const results = search(sampleEntries, "cloudflare playwright", "es");
    // No article contains BOTH Cloudflare AND Playwright
    expect(results).toEqual([]);
  });
});
