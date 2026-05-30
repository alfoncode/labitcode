import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
        tags: z.array(z.string()),
        author: z.enum(['Alfonso Garcia', 'AI']),
        draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        stack: z.array(z.string()),
        url: z.string().optional(),
        repo: z.string().optional(),
        heroImage: z.string().optional(),
        lastUpdated: z.coerce.date(),
        creator: z.string(),
        status: z.enum(['active', 'archived', 'in-progress']),
    }),
});

const team = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/team' }),
    schema: z.object({
        name: z.string(),
        role: z.string(),
        bio: z.string(),
        avatar: z.string().optional(),
        github: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
    }),
});

export const collections = { blog, projects, team };
