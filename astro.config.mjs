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

// Rehype plugin to wrap markdown tables in a responsive scroll container
function rehypeTableWrapper() {
  return (tree) => {
    const visit = (node, index, parent) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && node.tagName === "table") {
        if (
          parent &&
          parent.type === "element" &&
          parent.tagName === "div" &&
          parent.properties?.className &&
          (Array.isArray(parent.properties.className)
            ? parent.properties.className.includes("table-wrapper")
            : parent.properties.className === "table-wrapper")
        ) {
          return;
        }
        const wrapper = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrapper"] },
          children: [node],
        };
        if (parent && Array.isArray(parent.children) && typeof index === "number") {
          parent.children[index] = wrapper;
        }
      } else if (node.children && Array.isArray(node.children)) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          visit(node.children[i], i, node);
        }
      }
    };
    visit(tree, null, null);
  };
}

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
    rehypePlugins: [rehypeTableWrapper],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
