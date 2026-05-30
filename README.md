# labitcode

Welcome to the official repository for **labitcode** (labitcode.com), a modern personal portfolio and blog built with performance and developer experience in mind.

## 🚀 Tech Stack

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Content:** [MDX](https://mdxjs.com/) for blog posts and projects
- **Deployment:** [Vercel](https://vercel.com/)

## ✨ Key Features

- **Performance First:** 100/100 Lighthouse score thanks to Astro's island architecture.
- **Content Collections:** Type-safe markdown content for:
  - 📝 **Blog:** Technical articles with code highlighting (Shiki).
  - 💼 **Projects:** Portfolio showcase with tech stack tags.
  - 👥 **Team:** Team member profiles with social links.
- **Local Search:** Built-in search functionality using a generated `search-index.json` (no external services required).
- **SEO Optimized:** 
  - Automatic `sitemap.xml` generation.
  - Dynamic `robots.txt` handling for different environments.
  - Semantic HTML and metadata management.
  - RSS feed for blog posts.
- **Responsive Design:** Mobile-first approach with custom Tailwind configuration.
- **Dark Mode:** Full theme toggle with system preference detection.
- **Code Quality:** ESLint, Prettier, and Vitest for testing.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alfoncode/labitcode.git
   cd labitcode
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:4321`.

### Build for Production

To create a production build locally:

```bash
npm run build
```
The output will be in the `dist/` directory. You can preview it with `npm run preview`.

### Code Quality Commands

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting errors
npm run format     # Format code with Prettier
npm run test       # Run tests with Vitest
npm run screenshots # Generate screenshots with Playwright
```

## 📂 Project Structure

```
/
├── public/             # Static assets (favicons, images)
├── src/
│   ├── components/     # Reusable UI components (Header, Footer, SEOHead...)
│   ├── content/        # Markdown content (Blog posts, Projects, Team)
│   │   ├── blog/
│   │   ├── projects/
│   │   └── team/
│   ├── layouts/        # Page layouts
│   ├── pages/          # Astro pages and API endpoints
│   │   ├── blog/       # Blog listing and detail pages
│   │   ├── projects/   # Project portfolio pages
│   │   ├── rss.xml.ts # RSS feed for blog
│   │   └── robots.txt.ts # Dynamic robots.txt generation
│   ├── styles/         # Global styles
│   └── consts.ts      # Site constants
├── tests/              # Test files
├── .eslintrc.cjs       # ESLint configuration
├── .prettierrc         # Prettier configuration
├── vitest.config.ts    # Vitest configuration
└── astro.config.mjs    # Astro configuration
```

## 🌍 Environment & Deployment

This project is configured for deployment on **Vercel**.

### Robots.txt & Indexing

The project uses a dynamic `src/pages/robots.txt.ts` endpoint to manage search engine indexing:
- **Development/Preview:** Indexing is **DISABLED** (`Disallow: /`) by default.
- **Production:** Indexing is **ENABLED** (`Allow: /`) only if properly configured.

**To enable indexing in production:**
1. Go to your Vercel Project Settings > Environment Variables.
2. Add `PUBLIC_INDEXING_ENABLED` with value `true`.
3. Select **Production** environment only.

### Branches

- `main`: Production code. Deploys to `labitcode.com`.
- `development`: Staging/Development code. Deploys to `labitcode.vercel.app`.

## 🤝 Contributing

1. Fork the repository.
2. Create standard feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

### Pull Request Guidelines

- Ensure all tests pass (`npm run test`).
- Run linting and formatting (`npm run lint` and `npm run format`).
- Update documentation if needed.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
