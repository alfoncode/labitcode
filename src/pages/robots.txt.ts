
import type { APIRoute } from 'astro';

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://labitcode.com/sitemap-index.xml
`.trim();

const robotsTxtDisallow = `
User-agent: *
Disallow: /
`.trim();

export const GET: APIRoute = ({ site }) => {
    // To enable indexing in production:
    // 1. created a new Environment Variable in Vercel (Settings > Environment Variables)
    //    called PUBLIC_INDEXING_ENABLED with value "true" for the Production environment.
    // 2. OR simply change the logic below when you are ready to launch.

    const isProductionEnv = process.env.VERCEL_ENV === 'production';
    const indexingEnabled = process.env.PUBLIC_INDEXING_ENABLED === 'true';

    // Currently disabled for ALL environments until the site is ready
    const shouldIndex = isProductionEnv && indexingEnabled;

    if (shouldIndex) {
        return new Response(robotsTxt, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }

    return new Response(robotsTxtDisallow, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
};
