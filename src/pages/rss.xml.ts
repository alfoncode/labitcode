import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const blog = (await getCollection("blog")).filter((post) => !post.data.draft);
  const site = context.site ?? new URL("https://labitcode.com");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: new URL(`/blog/${post.id}`, site).href,
    })),
  });
}
