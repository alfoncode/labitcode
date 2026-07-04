import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const baseURL = (site ?? new URL("https://labitcode.com")).href.replace(/\/$/, "");
  const posts = (await getCollection("blog")).filter((p) => !p.data.draft && p.data.heroImage);
  const projects = (await getCollection("projects")).filter((p) => p.data.heroImage);

  const entries = [
    ...posts.map((p) => ({
      loc: `${baseURL}/blog/${p.id}`,
      image: `${baseURL}${p.data.heroImage}`,
      title: p.data.title,
    })),
    ...projects.map((p) => ({
      loc: `${baseURL}/projects/${p.id}`,
      image: `${baseURL}${p.data.heroImage}`,
      title: p.data.title,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <image:image>
      <image:loc>${e.image}</image:loc>
      <image:title>${e.title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</image:title>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
