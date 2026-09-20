import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE } from "@/consts";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(context: { site?: URL }) {
  const blog = (await getCollection("blog")).filter(
    (post) => !post.data.draft && post.data.lang === "es"
  );
  const site = context.site ?? new URL(SITE);
  return rss({
    title: `${SITE_TITLE} (Español)`,
    description:
      "Laboratorio de ingeniería donde el código humano converge con la innovación en IA",
    site,
    items: blog.map((post) => {
      const link = new URL(`/es/blog/${post.id}`, site).href;
      const hero = post.data.heroImage
        ? new URL(post.data.heroImage, site).href
        : new URL("/og-default.png", site).href;
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link,
        author: post.data.author,
        categories: post.data.tags,
        customData: `<enclosure url="${escapeXml(hero)}" type="image/webp" />`,
      };
    }),
    customData: `<language>es-es</language>`,
  });
}
