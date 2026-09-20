import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

interface ParsedFrontmatter {
  lang?: string;
  translationSlug?: string;
  [key: string]: unknown;
}

function parseFrontmatter(fileContent: string): ParsedFrontmatter {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return {};
  const yamlContent = match[1];
  const result: ParsedFrontmatter = {};

  const lines = yamlContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      const rawVal = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (rawVal === "true") result[key] = true;
      else if (rawVal === "false") result[key] = false;
      else result[key] = rawVal;
    }
  }
  return result;
}

describe("i18n Bilingual Content Integrity", () => {
  const blogDir = path.resolve(process.cwd(), "src/content/blog");
  const projectDir = path.resolve(process.cwd(), "src/content/projects");
  const teamDir = path.resolve(process.cwd(), "src/content/team");

  it("should have both English and Spanish versions for all blog posts with reciprocal translationSlugs", () => {
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
    const postMap = new Map<string, ParsedFrontmatter>();

    files.forEach((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
      postMap.set(slug, parseFrontmatter(content));
    });

    const enPosts: string[] = [];
    const esPosts: string[] = [];

    postMap.forEach((data, slug) => {
      if (data.lang === "es") esPosts.push(slug);
      else enPosts.push(slug);
    });

    expect(enPosts.length).toBeGreaterThan(0);
    expect(esPosts.length).toBeGreaterThan(0);
    expect(esPosts.length).toBe(enPosts.length);

    // Verify reciprocal translation slugs
    enPosts.forEach((enSlug) => {
      const enData = postMap.get(enSlug)!;
      const esSlug = enData.translationSlug as string | undefined;
      expect(esSlug, `Missing translationSlug for English post ${enSlug}`).toBeDefined();
      expect(
        postMap.has(esSlug!),
        `Spanish post ${esSlug} referenced by ${enSlug} does not exist`
      ).toBe(true);

      const esData = postMap.get(esSlug!)!;
      expect(esData.translationSlug, `Spanish post ${esSlug} reciprocal slug mismatch`).toBe(enSlug);
      expect(esData.lang, `Spanish post ${esSlug} must have lang: "es"`).toBe("es");
    });
  });

  it("should have both English and Spanish versions for all projects with reciprocal translationSlugs", () => {
    const files = fs
      .readdirSync(projectDir)
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
    const projectMap = new Map<string, ParsedFrontmatter>();

    files.forEach((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const content = fs.readFileSync(path.join(projectDir, file), "utf-8");
      projectMap.set(slug, parseFrontmatter(content));
    });

    const enProjects: string[] = [];
    const esProjects: string[] = [];

    projectMap.forEach((data, slug) => {
      if (data.lang === "es") esProjects.push(slug);
      else enProjects.push(slug);
    });

    expect(enProjects.length).toBe(3);
    expect(esProjects.length).toBe(3);

    enProjects.forEach((enSlug) => {
      const enData = projectMap.get(enSlug)!;
      const esSlug = enData.translationSlug as string | undefined;
      expect(esSlug, `Missing translationSlug for project ${enSlug}`).toBeDefined();
      expect(projectMap.has(esSlug!), `Spanish project ${esSlug} does not exist`).toBe(true);

      const esData = projectMap.get(esSlug!)!;
      expect(esData.translationSlug, `Project ${esSlug} reciprocal translationSlug mismatch`).toBe(
        enSlug
      );
      expect(esData.lang).toBe("es");
    });
  });

  it("should have both English and Spanish versions for team members", () => {
    const files = fs.readdirSync(teamDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
    const teamMap = new Map<string, ParsedFrontmatter>();

    files.forEach((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const content = fs.readFileSync(path.join(teamDir, file), "utf-8");
      teamMap.set(slug, parseFrontmatter(content));
    });

    expect(teamMap.has("alfonso")).toBe(true);
    expect(teamMap.has("alfonso-es")).toBe(true);
    expect(teamMap.has("ai")).toBe(true);
    expect(teamMap.has("ai-es")).toBe(true);

    expect(teamMap.get("alfonso-es")?.lang).toBe("es");
    expect(teamMap.get("ai-es")?.lang).toBe("es");
  });
});

describe("Browser Language Detection & Auto-Redirect Logic", () => {
  function computeRedirect({
    currentPath,
    effectiveLang,
    esUrl,
    enUrl,
    preferredLang,
    languages,
    userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  }: {
    currentPath: string;
    effectiveLang: "en" | "es";
    esUrl: string;
    enUrl: string;
    preferredLang: string | null;
    languages: string[];
    userAgent?: string;
  }): string | null {
    if (
      /bot|googlebot|bingbot|crawler|spider|slurp|duckduckbot/i.test(userAgent)
    ) {
      return null;
    }

    let isBrowserEs = false;
    for (let i = 0; i < languages.length; i++) {
      const l = (languages[i] || "").toLowerCase();
      if (l.startsWith("es")) {
        isBrowserEs = true;
        break;
      }
      if (l.startsWith("en")) {
        isBrowserEs = false;
        break;
      }
    }

    // Case 1: Visitor prefers Spanish (explicitly or via browser default with no preference)
    if ((preferredLang === "es" || (!preferredLang && isBrowserEs)) && effectiveLang === "en") {
      if (esUrl && esUrl !== currentPath) {
        return esUrl;
      }
    }

    // Case 2: Visitor explicitly prefers English (clicked EN) but landed on a Spanish page
    if (preferredLang === "en" && effectiveLang === "es") {
      if (enUrl && enUrl !== currentPath) {
        return enUrl;
      }
    }

    return null;
  }

  it("should redirect Spanish browser from root '/' to '/es'", () => {
    const result = computeRedirect({
      currentPath: "/",
      effectiveLang: "en",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: null,
      languages: ["es-ES", "es", "en"],
    });
    expect(result).toBe("/es");
  });

  it("should stay on '/' for English browser", () => {
    const result = computeRedirect({
      currentPath: "/",
      effectiveLang: "en",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: null,
      languages: ["en-US", "en"],
    });
    expect(result).toBeNull();
  });

  it("should stay on '/' for French browser", () => {
    const result = computeRedirect({
      currentPath: "/",
      effectiveLang: "en",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: null,
      languages: ["fr-FR", "fr", "en"],
    });
    expect(result).toBeNull();
  });

  it("should redirect Spanish browser from an English post to its Spanish translation", () => {
    const result = computeRedirect({
      currentPath: "/blog/building-labitcode",
      effectiveLang: "en",
      esUrl: "/es/blog/construyendo-labitcode",
      enUrl: "/blog/building-labitcode",
      preferredLang: null,
      languages: ["es-419", "es"],
    });
    expect(result).toBe("/es/blog/construyendo-labitcode");
  });

  it("should respect explicit preferredLang: 'en' and NOT redirect Spanish browser to '/es'", () => {
    const result = computeRedirect({
      currentPath: "/",
      effectiveLang: "en",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: "en",
      languages: ["es-ES", "es"],
    });
    expect(result).toBeNull();
  });

  it("should redirect explicit preferredLang: 'es' from '/' to '/es' even on English browser", () => {
    const result = computeRedirect({
      currentPath: "/",
      effectiveLang: "en",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: "es",
      languages: ["en-US", "en"],
    });
    expect(result).toBe("/es");
  });

  it("should redirect explicit preferredLang: 'en' from '/es' to '/'", () => {
    const result = computeRedirect({
      currentPath: "/es",
      effectiveLang: "es",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: "en",
      languages: ["es-ES", "es"],
    });
    expect(result).toBe("/");
  });

  it("should never redirect search engine bots", () => {
    const result = computeRedirect({
      currentPath: "/",
      effectiveLang: "en",
      esUrl: "/es",
      enUrl: "/",
      preferredLang: null,
      languages: ["es-ES"],
      userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    });
    expect(result).toBeNull();
  });
});
