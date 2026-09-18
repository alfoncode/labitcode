# Blog Tags Taxonomy & Guidelines for labitcode.com

To maintain clean tag navigation (`/blog/tag/[tag]`) and accurate related-post recommendations, follow this established tag taxonomy when creating new articles.

---

## Core Domain Tags (Broad Categories)

Assign 1–2 broad domain tags per article:

- `AI` — General artificial intelligence, generative models, LLMs, agents.
- `Software Engineering` — Software design principles, patterns, engineering velocity, team dynamics.
- `Architecture` or `Software Architecture` — High-level system design, edge compute, serverless vs containers.
- `DevOps` / `DevSecOps` — Infrastructure as code, CI/CD, automation, server hardening, security pipelines.
- `Security` — Vulnerability assessments, secrets management, threat modeling, server hardening.
- `Web Performance` — PageSpeed, Core Web Vitals, Astro SSG optimizations, bundle reduction.
- `Testing` — E2E testing, unit testing, test-driven development, mocks and fixtures.

---

## Technology & Platform Tags (Specific Tools)

Assign 2–3 specific technology tags relevant to the article's implementation:

### AI & Agentic Tooling

- `Claude`
- `Anthropic`
- `OpenAI`
- `GPT-5`
- `GPT-5.6 Sol`
- `Claude Fable 5`
- `Kimi K3`
- `Grok 4.5`
- `LLM`
- `LLM Benchmarks`
- `AI Agents`
- `Agents`
- `Hermes`
- `OpenSpec`
- `Spec Kit`
- `Spec-Driven Development`

### Web & Runtime Architecture

- `Astro`
- `TypeScript`
- `Cloudflare`
- `V8 Isolates`
- `WebAssembly`
- `Web Scraping`
- `SEO`
- `Core Web Vitals`
- `Accessibility`

### Testing & Quality Assurance

- `Playwright`
- `E2E`

### Infrastructure & Operations

- `Linux`
- `Docker`
- `SysAdmin`
- `GitHub Actions`
- `CI/CD`

### Product & Engineering Methodology

- `Agile`
- `Management`
- `Shape Up`
- `Startup`
- `Cost-Performance`
- `Policy`

---

## Tag Selection Guidelines

1. **Aim for 3 to 6 tags per article**:
   - Too few tags makes related-post matching ineffective.
   - Too many tags dilutes search relevance.
2. **Reuse Existing Tags First**: Before introducing a new tag, check if one of the tags above already accurately covers the topic.
3. **Casing & Capitalization**:
   - Use standard Title Case or official acronym capitalization (e.g., `CI/CD`, `E2E`, `DevOps`, `DevSecOps`, `LLM`, `AI`).
   - Avoid all-lowercase tags (e.g., prefer `Markdown` over `markdown`).
4. **Single-line YAML array in Frontmatter**:
   - Always format tags as a single-line array for maximum parser compatibility:
     ```yaml
     tags: ["AI", "Software Engineering", "Architecture"]
     ```
