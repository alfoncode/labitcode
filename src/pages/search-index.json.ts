import { getCollection } from "astro:content";

export async function GET() {
  const [posts, projects] = await Promise.all([getCollection("blog"), getCollection("projects")]);

  const searchEntries = [
    ...posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        tags: post.data.tags,
        slug: post.id,
        type: "blog" as const,
      })),
    ...projects.map((project) => ({
      title: project.data.title,
      description: project.data.description,
      tags: project.data.stack,
      slug: project.id,
      type: "project" as const,
    })),
  ];

  return new Response(JSON.stringify(searchEntries), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
