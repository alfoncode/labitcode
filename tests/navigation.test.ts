import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:4321";

describe("Local Navigation & HTTP 200 Verification", () => {
  const routesToTest = [
    // English main pages
    "/",
    "/blog",
    "/projects",
    "/team",
    // Spanish main pages
    "/es",
    "/es/blog",
    "/es/projects",
    "/es/team",
    // Feeds & indexes
    "/rss.xml",
    "/es/rss.xml",
    "/search-index.json",
    "/robots.txt",
    "/image-sitemap.xml",
    // English blog posts
    "/blog/ai-driven-development",
    "/blog/anthropic-prompt-engineering-guide",
    "/blog/building-labitcode",
    "/blog/cloudflare-kitesurf-agentic-browser",
    "/blog/claude-fable-5",
    "/blog/fable-5-export-control-shutdown",
    "/blog/github-actions-secrets-audit-devsecops",
    "/blog/gpt-5-6-sol",
    "/blog/hermes-autonomous-team",
    "/blog/kimi-k3-performance-pricing-comparison",
    "/blog/pagespeed-optimization-guide",
    "/blog/playwright-typescript-architecture-best-practices",
    "/blog/secure-vps-setup-guide",
    "/blog/spec-driven-development-openspec-vs-spec-kit",
    "/blog/the-ai-velocity-paradox",
    "/blog/the-death-of-sprints",
    // Spanish blog posts
    "/es/blog/desarrollo-guiado-por-ia",
    "/es/blog/disenando-con-claude-del-prompt-a-produccion",
    "/es/blog/construyendo-labitcode",
    "/es/blog/cloudflare-kitesurf-navegador-agentico",
    "/es/blog/claude-fable-5-es",
    "/es/blog/fable-5-controles-exportacion-cierre",
    "/es/blog/auditoria-secretos-github-actions-devsecops",
    "/es/blog/gpt-5-6-sol-es",
    "/es/blog/hermes-equipo-autonomo-agentes",
    "/es/blog/comparativa-rendimiento-precio-kimi-k3",
    "/es/blog/guia-optimizacion-pagespeed",
    "/es/blog/arquitectura-playwright-typescript-mejores-practicas",
    "/es/blog/guia-configuracion-vps-seguro",
    "/es/blog/desarrollo-guiado-por-especificaciones-openspec-vs-spec-kit",
    "/es/blog/la-paradoja-de-la-velocidad-de-la-ia",
    "/es/blog/la-muerte-de-los-sprints",
    // Projects (EN & ES)
    "/projects/labitcode-platform",
    "/es/projects/plataforma-labitcode",
    "/projects/terreno-rustico-monitoring",
    "/es/projects/monitorizacion-terreno-rustico",
    "/projects/terreno-rustico",
    "/es/projects/terreno-rustico-es",
    // Tags (EN & ES)
    "/blog/tag/AI",
    "/es/blog/tag/AI",
    "/blog/tag/DevOps",
    "/es/blog/tag/DevOps",
    "/blog/tag/TypeScript",
    "/es/blog/tag/TypeScript",
    // Error pages
    "/404",
    "/500",
  ];

  for (const route of routesToTest) {
    it(`should serve ${route} with expected status and valid content`, async () => {
      const res = await fetch(`${BASE_URL}${route}`);
      const expectedStatus = route === "/404" ? 404 : route === "/500" ? 500 : 200;
      expect(res.status, `Unexpected status for ${route}`).toBe(expectedStatus);

      const contentType = res.headers.get("content-type") || "";
      if (route.endsWith(".json")) {
        expect(contentType).toContain("application/json");
        const json = await res.json();
        expect(Array.isArray(json)).toBe(true);
      } else if (route.endsWith(".xml")) {
        expect(contentType).toContain("xml");
        const text = await res.text();
        expect(text).toContain("<?xml");
      } else if (route.endsWith(".txt")) {
        expect(contentType).toContain("text/plain");
      } else {
        expect(contentType).toContain("text/html");
        const html = await res.text();
        expect(html.toLowerCase()).toContain("<!doctype html>");
        expect(html).toContain("<title>");
      }
    });
  }

  it("should return 404 for draft blog posts", async () => {
    const draftResEn = await fetch(`${BASE_URL}/blog/markdown-style-guide`);
    expect(draftResEn.status).toBe(404);
    const draftResEs = await fetch(`${BASE_URL}/es/blog/guia-estilo-markdown`);
    expect(draftResEs.status).toBe(404);
  });

  it("should have relative targetLangUrl in language toggle for all tested HTML routes", async () => {
    const htmlRoutes = ["/", "/es", "/blog", "/es/blog", "/projects", "/es/projects", "/team", "/es/team"];
    for (const route of htmlRoutes) {
      const res = await fetch(`${BASE_URL}${route}`);
      const html = await res.text();
      // Match all lang-switch-btn hrefs
      const matches = [...html.matchAll(/href="([^"]*)"\s+class="lang-switch-btn/g)];
      expect(matches.length, `No lang-switch-btn found in ${route}`).toBeGreaterThan(0);
      for (const match of matches) {
        const href = match[1];
        expect(href.startsWith("http://") || href.startsWith("https://"), `Absolute URL in local nav: ${href} on ${route}`).toBe(false);
        expect(href.startsWith("/"), `Invalid relative URL: ${href} on ${route}`).toBe(true);
      }
    }
  });
});
