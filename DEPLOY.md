# Deploying the portfolio

## What is here

- `index.html` – the whole site, one file, no build step. Fonts come from Google Fonts; everything else is inline.
- `src/page.html` – the same page as an artifact fragment (no doctype/head/body). Edit this one, then rebuild
  `index.html` with the node one-liner below, or just edit `index.html` directly once you stop using the artifact.
- `github-profile/README.md` – your GitHub profile README. Goes in a public repo named `RShivuri`.
- `CONTENT.md` – all the copy, the layout rationale and the pre-launch checklist.

## Option A: GitHub Pages (free, `rshivuri.github.io`)

```bash
cd "C:/Users/RonellS/OneDrive - Paycorp Group (Pty) Ltd/Desktop/rshivuri-portfolio"
git init && git add index.html CONTENT.md DEPLOY.md && git commit -m "Portfolio v1"
gh repo create RShivuri/rshivuri.github.io --public --source=. --push
```

Then in the repo: Settings → Pages → Source: Deploy from a branch → `main` / root. The site is live at
https://rshivuri.github.io within a minute or two. A custom domain is one CNAME record away.

## Option B: Vercel

```bash
npx vercel --prod
```

Accept the defaults (static, no framework). Vercel serves `index.html` at the root.

## GitHub profile README

```bash
gh repo create RShivuri/RShivuri --public --clone
cp github-profile/README.md RShivuri/README.md
cd RShivuri && git add README.md && git commit -m "Profile README" && git push
```

## Editing and rebuilding

Edit `src/template.html`, then run:

```bash
node build.js
```

That writes `src/page.html` (artifact fragment) and `index.html` (standalone site). The template uses placeholders
that `build.js` fills from `assets-raw/`: `{{svg:slug}}` inlines a simple-icons glyph, `{{img:file}}` embeds a logo or
badge as a data URI, `{{glyph:slug:#hex}}` makes a tinted glyph for the Canvas animation.

The contribution map under the hero comes from `assets-raw/contrib.json`. Refresh it before a rebuild with:

```bash
MSYS_NO_PATHCONV=1 gh api graphql -f query='query{ user(login:"RShivuri"){ contributionsCollection{ totalCommitContributions restrictedContributionsCount contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } } } } }' > assets-raw/contrib.json
```

`assets-raw/` holds the downloaded brand assets: Microsoft certification badge SVGs (learn.microsoft.com),
Paycorp, Xiquel Group, Coca-Cola Beverages Africa and Rhodes University logos (their own sites and favicons),
and simple-icons glyphs. They identify employers and credentials, which is normal portfolio use, but each remains
its owner's trademark.

## Pinned repos

On github.com/RShivuri, pin NZWalks.API, PythonBasicPrep, ObjectsMastering and
ETL-Pipeline-for-Multi-format-Data-Integration, and give each a one-line description and topics (`dotnet`,
`csharp`, `minimal-api`, `python`, `etl`). Empty descriptions are the first thing a recruiter notices.
