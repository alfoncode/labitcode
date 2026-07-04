import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/consts";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absImage(baseURL: string, hero: string): string {
  if (/^https?:\/\//i.test(hero)) return hero;
  if (!hero.startsWith("/")) hero = `/${hero}`;
  return `${baseURL}${hero}`;
}

export const GET: APIRoute = async ({ site }) => {
  const baseURL = (site ?? new URL(SITE)).href.replace(/\/$/, "");
  const posts = (await getCollection("blog")).filter(
    (p) => !p.data.draft && p.data.heroImage && p.data.heroImage.startsWith("/")
  );
  const projects = (
    await getCollection("projects")
  ).filter((p) => p.data.status !== "archived" && p.data.heroImage && p.data.heroImage.startsWith("/"));

  const entries = [
    ...posts.map((p) => ({
      loc: `${baseURL}/blog/${p.id}`,
      image: absImage(baseURL, p.data.heroImage!),
      title: p.data.title,
    })),
    ...projects.map((p) => ({
      loc: `${baseURL}/projects/${p.id}`,
      image: absImage(baseURL, p.data.heroImage!),
      title: p.data.title,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <image:image>
      <image:loc>${escapeXml(e.image)}</image:loc>
      <image:title>${escapeXml(e.title)}</image:title>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
