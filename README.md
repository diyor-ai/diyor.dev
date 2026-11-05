# diyor.dev

Personal portfolio of Mukhammaddiyor Abdulazimov. Astro, static output, TypeScript, plain CSS, 3 languages (EN `/`, ZH `/zh/`, RU `/ru/`).

## Run
    npm install
    npm run dev      # http://localhost:4321
    npm run build    # static site in dist/
    npx astro check

## Add a project
Create `src/content/projects/<lang>/<slug>.md` for each language with the frontmatter defined in `src/content.config.ts`.

## Add a blog post
Create `src/content/blog/<lang>/<slug>.md`. Set `draft: true` to keep it out of the build.

## Add a translation string
Edit `src/i18n/en.json`, then the same key in `zh.json` and `ru.json`.

## Rules
No third-party requests at runtime (no CDN, fonts or analytics). Facts come only from the approved facts file; unknown items are marked `TODO(diyor):`.
