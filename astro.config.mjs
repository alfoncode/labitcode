import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

// Get list of archived project slugs to exclude from the sitemap (as they are set to noindex)
const getArchivedProjects = () => {
  const projectsDir = path.resolve("src/content/projects");
  if (!fs.existsSync(projectsDir)) return [];
  try {
    const files = fs.readdirSync(projectsDir);
    const archivedSlugs = [];
    for (const file of files) {
      if (file.endsWith(".md") || file.endsWith(".mdx")) {
        const content = fs.readFileSync(path.join(projectsDir, file), "utf-8");
        if (/status:\s*["']archived["']/.test(content)) {
          const slug = file.replace(/\.mdx?$/, "");
          archivedSlugs.push(slug);
        }
      }
    }
    return archivedSlugs;
  } catch (e) {
    console.error("Error reading projects for sitemap filter:", e);
    return [];
  }
};

export default defineConfig({
  site: "https://labitcode.com",
  trailingSlash: "never",
  build: {
    inlineStylesheets: "always",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        // Exclude tag pages
        if (page.includes("/blog/tag/")) return false;

        // Exclude archived projects
        const archivedSlugs = getArchivedProjects();
        if (archivedSlugs.some((slug) => page.includes(`/projects/${slug}`))) {
          return false;
        }

        return true;
      },
      lastmod: new Date(),
      changefreq: "weekly",
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
