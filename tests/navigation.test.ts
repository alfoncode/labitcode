import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:4321";
const DIST_DIR = path.resolve(process.cwd(), "dist");

describe("Navigation & Route Integrity (HTTP or Built SSG)", () => {
  let isServerRunning = false;

  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(1000) });
      isServerRunning = res.status === 200;
    } catch {
      isServerRunning = false;
    }
  });

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

  function getDistPath(route: string): string {
    const cleanRoute = route.replace(/^\//, "");
    if (route.endsWith(".json") || route.endsWith(".xml") || route.endsWith(".txt")) {
      return path.join(DIST_DIR, cleanRoute);
    }
    if (route === "/404") return path.join(DIST_DIR, "404.html");
    if (route === "/500") return path.join(DIST_DIR, "500.html");
    return path.join(DIST_DIR, cleanRoute, "index.html");
  }

  for (const route of routesToTest) {
    it(`should serve or generate ${route} with valid content`, async () => {
      if (isServerRunning) {
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
      } else {
        // Fallback to testing built SSG files in dist/
        const filePath = getDistPath(route);
        expect(fs.existsSync(filePath), `Missing built artifact for ${route}: ${filePath}`).toBe(
          true
        );
        const content = fs.readFileSync(filePath, "utf-8");

        if (route.endsWith(".json")) {
          const json = JSON.parse(content);
          expect(Array.isArray(json)).toBe(true);
        } else if (route.endsWith(".xml")) {
          expect(content).toContain("<?xml");
        } else if (route.endsWith(".txt")) {
          expect(content.length).toBeGreaterThan(0);
        } else {
          expect(content.toLowerCase()).toContain("<!doctype html>");
          expect(content).toContain("<title>");
        }
      }
    });
  }

  it("should return 404 for draft blog posts", async () => {
    if (isServerRunning) {
      const draftResEn = await fetch(`${BASE_URL}/blog/markdown-style-guide`);
      expect(draftResEn.status).toBe(404);
      const draftResEs = await fetch(`${BASE_URL}/es/blog/guia-estilo-markdown`);
      expect(draftResEs.status).toBe(404);
    } else {
      expect(
        fs.existsSync(path.join(DIST_DIR, "blog/markdown-style-guide/index.html")),
        "Draft English post should not be emitted"
      ).toBe(false);
      expect(
        fs.existsSync(path.join(DIST_DIR, "es/blog/guia-estilo-markdown/index.html")),
        "Draft Spanish post should not be emitted"
      ).toBe(false);
    }
  });

  it("should have relative targetLangUrl in language toggle for all tested HTML routes", async () => {
    const htmlRoutes = [
      "/",
      "/es",
      "/blog",
      "/es/blog",
      "/projects",
      "/es/projects",
      "/team",
      "/es/team",
    ];
    for (const route of htmlRoutes) {
      let html = "";
      if (isServerRunning) {
        const res = await fetch(`${BASE_URL}${route}`);
        html = await res.text();
      } else {
        const filePath = getDistPath(route);
        html = fs.readFileSync(filePath, "utf-8");
      }

      const matches = [...html.matchAll(/href="([^"]*)"\s+class="lang-switch-btn/g)];
      expect(matches.length, `No lang-switch-btn found in ${route}`).toBeGreaterThan(0);
      for (const match of matches) {
        const href = match[1];
        expect(
          href.startsWith("http://") || href.startsWith("https://"),
          `Absolute URL in local nav: ${href} on ${route}`
        ).toBe(false);
        expect(href.startsWith("/"), `Invalid relative URL: ${href} on ${route}`).toBe(true);
      }
    }
  });
});
