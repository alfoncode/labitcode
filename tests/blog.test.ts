import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

interface BlogPostData {
  title?: string;
  description?: string;
  pubDate?: Date;
  tags?: string[];
  author?: string;
  draft?: boolean;
  [key: string]: unknown;
}

function parseFrontmatter(fileContent: string): BlogPostData {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return {};
  const yamlContent = match[1];
  const result: BlogPostData = {};

  const lines = yamlContent.split("\n");
  let currentKey = "";
  let isCollectingArray = false;
  let arrayBuffer = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (isCollectingArray) {
      arrayBuffer += " " + trimmed;
      if (trimmed.includes("]")) {
        const cleaned = arrayBuffer
          .slice(arrayBuffer.indexOf("[") + 1, arrayBuffer.lastIndexOf("]"))
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        result[currentKey] = cleaned;
        isCollectingArray = false;
        arrayBuffer = "";
        currentKey = "";
      }
      continue;
    }

    if (trimmed.startsWith("[") && currentKey) {
      if (trimmed.includes("]")) {
        result[currentKey] = trimmed
          .slice(trimmed.indexOf("[") + 1, trimmed.lastIndexOf("]"))
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        currentKey = "";
      } else {
        isCollectingArray = true;
        arrayBuffer = trimmed;
      }
      continue;
    }

    if (trimmed.startsWith("- ") && currentKey && Array.isArray(result[currentKey])) {
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, "");
      result[currentKey].push(val);
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();

      if (val.startsWith("[") && !val.includes("]")) {
        currentKey = key;
        isCollectingArray = true;
        arrayBuffer = val;
      } else if (val.startsWith("[") && val.includes("]")) {
        result[key] = val
          .slice(val.indexOf("[") + 1, val.lastIndexOf("]"))
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else if (val === "") {
        result[key] = [];
        currentKey = key;
      } else {
        const cleanVal = val.replace(/^["']|["']$/g, "");
        if (cleanVal === "true") result[key] = true;
        else if (cleanVal === "false") result[key] = false;
        else if (key === "pubDate" || key === "updatedDate") result[key] = new Date(cleanVal);
        else result[key] = cleanVal;
        currentKey = "";
      }
    }
  }

  return result;
}

describe("Blog Collection", () => {
  const blogDir = path.resolve(process.cwd(), "src/content/blog");
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  it("should have at least one blog post", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("should have valid post structure for all posts", () => {
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
      const data = parseFrontmatter(content);

      expect(data.title, `Missing title in ${file}`).toBeDefined();
      expect(typeof data.title).toBe("string");
      expect(data.description, `Missing description in ${file}`).toBeDefined();
      expect(typeof data.description).toBe("string");
      expect(data.pubDate, `Invalid pubDate in ${file}`).toBeInstanceOf(Date);
      expect(data.tags, `Tags should be an array in ${file}`).toBeInstanceOf(Array);
      expect(data.tags.length).toBeGreaterThan(0);
      expect(["Alfonso Garcia", "AI"], `Invalid author in ${file}: ${data.author}`).toContain(
        data.author
      );
    });
  });
});

