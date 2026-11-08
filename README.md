# diyor.dev

Personal portfolio of Mukhammaddiyor Abdulazimov. Astro, static output, TypeScript, plain CSS, 4 languages: English (`/`), Chinese (`/zh/`), Russian (`/ru/`), Uzbek (`/uz/`). No third-party requests at runtime.

## Run
    npm install
    npm run dev       # http://localhost:4321
    npm run build     # static site in dist/
    npx astro check

## Structure
- `src/i18n/{en,zh,ru,uz}.json`: all UI strings, skills, experience, contact text.
- `src/content/projects/<slug>/index.md`, `index.zh.md`, `index.ru.md`: project cards and detail pages.
- `src/content/blog/<slug>/index.md`, `index.zh.md`, `index.ru.md` + images in the same folder.
- `src/config.ts`: email, links, `UPWORK` (null hides the row), `SHOW_CV`.
- `src/pages/[...slug].astro`: one route file that generates every page in every language.
- `public/cv/cv-en.pdf`, `cv-zh.pdf`: CVs (phone-free). The Russian site links the EN CV.

## Add a project
Create `src/content/projects/<slug>/index.md` (English), plus `index.zh.md` and `index.ru.md`. Frontmatter: `title`, `summary`, `order`, `stats` (exactly 2 pairs `["value", "label"]`), `tags`, `repo`, optional `repoLabel`. The body is the detail page (Problem, What I did, Method, Results, Limitations, AI assistance). Real figures from the project repos go in the same folder and are referenced with a relative path, plus an italic caption on the next line (CPU and SST pages get a light figure-card frame, see `figcards` in `ProjectDetail.astro`). The Gesture demo video and poster live in `public/media/` so the 6 MB GIF is never autoplayed. Cards on Home and Projects are built from these files.

## Add a blog post (with images), in EN / ZH / RU
One folder per post. Images go in the same folder:

    src/content/blog/my-post/
      index.md        # English
      index.zh.md     # Chinese (optional)
      index.ru.md     # Russian (optional)
      cover.jpg       # optional cover
      diagram.png     # any images you use

Frontmatter (same in every language file; translate the text values):

    ---
    title: "Post title"
    description: "One sentence for the list page and search engines"
    date: 2026-11-05
    draft: true            # true = not published; set false to publish
    cover: ./cover.jpg     # optional
    coverAlt: "What the cover shows"
    ---

In the body, put an image with a relative path, then a caption in italics on the **next line**:

    ![Alt text describing the image](./diagram.png)
    *Caption shown under the image.*

Astro converts images to WebP and sizes them for the screen. A post exists in a language only if that language file exists; the language switcher then falls back to the blog list. Draft posts show in `npm run dev` but are excluded from `npm run build`, the sitemap and RSS.

## Add or change a translation string
Edit the key in `src/i18n/en.json`, then the same key in `zh.json` and `ru.json`. Translated pages carry `<!-- REVIEW: translation -->` until a fluent speaker checks them.

## Rules
Facts come only from the approved facts list; unknown items are marked `TODO(diyor):`. Search for `TODO(diyor)` to list them. Never publish phone number, address, passport, GPA or visa details.
