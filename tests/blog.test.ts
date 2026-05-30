import { describe, it, expect } from 'vitest';
import { getCollection } from 'astro:content';

describe('Blog Collection', () => {
  it('should have at least one blog post', async () => {
    const posts = await getCollection('blog');
    expect(posts.length).toBeGreaterThan(0);
  });

  it('should have valid post structure', async () => {
    const posts = await getCollection('blog');
    posts.forEach((post) => {
      expect(post.data.title).toBeDefined();
      expect(post.data.description).toBeDefined();
      expect(post.data.pubDate).toBeInstanceOf(Date);
      expect(post.data.tags).toBeInstanceOf(Array);
      expect(['Alfonso Garcia', 'AI']).toContain(post.data.author);
    });
  });
});
