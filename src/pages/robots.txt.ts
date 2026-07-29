import type { APIRoute } from "astro";
import { SITE } from "@/consts";

const robotsTxt = `
User-agent: *
Allow: /
Disallow: /search-index.json

Sitemap: ${SITE}/sitemap-index.xml
Sitemap: ${SITE}/image-sitemap.xml
`.trim();

const robotsTxtDisallow = `
User-agent: *
Disallow: /
`.trim();

export const GET: APIRoute = () => {
  const isProductionEnv =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  const indexingDisabled = process.env.PUBLIC_INDEXING_ENABLED === "false";
  const indexingExplicitlyEnabled = process.env.PUBLIC_INDEXING_ENABLED === "true";

  // Production indexes by default unless PUBLIC_INDEXING_ENABLED=false; other envs index if PUBLIC_INDEXING_ENABLED=true
  const shouldIndex = (isProductionEnv && !indexingDisabled) || indexingExplicitlyEnabled;

  if (shouldIndex) {
    return new Response(robotsTxt, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(robotsTxtDisallow, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
