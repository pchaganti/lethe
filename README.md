# Lethe

A modern, fast, self-hosted bookmarking app. 100% free, serverless, running entirely within the GitHub ecosystem.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+

### Local Development

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The site will be available at `http://localhost:4321`.

### Building

```bash
# Build the Astro site
pnpm --filter site build

# Build the browser extension
pnpm --filter extension build
```

## Architecture

- **`site/`** — Astro 5 static site with Tailwind CSS, Pagefind search, dark mode, Zod-validated content collections
- **`extension/`** — Chrome extension (Manifest V3) with Preact, CRXJS, Dexie.js offline queue, ULID-based IDs
- **`scripts/`** — Node scripts for content extraction (Readability, sharp image processing, turndown markdown)
- **`data/`** — JSON index + Markdown content files (the "database"). IDs are ULIDs.

## Data Pipeline

1. **Capture** — Browser extension saves URL, title, tags, notes to `data/bookmarks.json` on GitHub
2. **Process** — `pnpm process:bookmarks` fetches articles, extracts content, downloads cover images as WebP
3. **Build** — `pnpm --filter site build` generates the static site (30+ pages)
4. **Deploy** — GitHub Actions automates the pipeline on push to `data/bookmarks.json`

## Setup Guide

### 1. Create a GitHub Repository

1. Create a new public repository on GitHub (e.g., `username/lethe`)
2. Clone it locally and initialize Lethe inside it

### 2. Configure GitHub Actions

The workflow (`.github/workflows/build.yml`) requires these repository permissions:

1. Go to your repo **Settings → Actions → General**
2. Under **Workflow permissions**, select **"Read and write permissions"**
3. Click **Save**

This allows the Actions bot to commit generated content back to the repo and deploy to GitHub Pages.

### 3. Enable GitHub Pages

1. Go to your repo **Settings → Pages**
2. Under **Source**, select **"GitHub Actions"**
3. The workflow will deploy automatically on push

### 4. Create a GitHub Personal Access Token (PAT)

The browser extension needs a PAT to sync bookmarks to your repo.

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Click **"Generate new token"**
3. Set a name (e.g., "Lethe Extension")
4. Under **Repository access**, select **"Only select repositories"** and choose your Lethe repo
5. Under **Permissions → Repository permissions**, enable:
   - **Contents**: Read and Write
6. Click **Generate token**
7. **Copy the token immediately** — you won't see it again

### 5. Install the Browser Extension

1. Build the extension:
   ```bash
   pnpm --filter extension build
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **"Load unpacked"** and select `extension/dist/`
5. The Lethe icon appears in your toolbar

### 6. Configure the Extension

1. Click the Lethe icon → **Settings**
2. Enter your:
   - **GitHub Token**: The PAT from step 4
   - **Repository Owner**: Your GitHub username
   - **Repository Name**: Your repo name (e.g., `lethe`)
   - **Default Tags** (optional): Comma-separated tags applied to every bookmark
3. Click **Save Settings**

### 7. Start Bookmarking

1. Navigate to any webpage
2. Click the Lethe icon
3. Edit the title, add tags and a note
4. Click **Save Bookmark**

The bookmark syncs to your GitHub repo. The GitHub Actions workflow then:
- Extracts the article content
- Downloads the cover image
- Builds the static site
- Deploys to GitHub Pages

## Browser Extension

1. Load `extension/dist/` as an unpacked extension in Chrome
2. Go to Settings and enter your GitHub PAT (fine-grained, Contents: Read/Write on the repo)
3. Set your GitHub username and repo name
4. Optionally set default tags (applied to every new bookmark)
5. Click the extension icon on any page to save it

## Features

- **Dashboard** — Responsive grid of bookmark cards with cover images
- **Reader Mode** — Distraction-free article rendering with beautiful typography
- **Full-Text Search** — Pagefind-powered search with Cmd+K shortcut
- **Taxonomy Pages** — Auto-generated `/tags/[tag]` and `/domains/[domain]` pages
- **RSS Feed** — `/rss.xml` for RSS reader integration
- **Dark Mode** — System-aware with manual toggle, flash-free loading
- **Offline Queue** — Dexie.js-backed offline sync with automatic retry

## Processing Bookmarks Locally

To process bookmarks without waiting for CI:

```bash
# Extract content for unfetched bookmarks
pnpm process:bookmarks
```

This fetches HTML, extracts content with Readability, converts to Markdown, and downloads cover images.

## Migrating from osmosmemo

If you're migrating from osmosmemo:

```bash
# Convert osmosmemo JSON to Lethe format
pnpm tsx scripts/migrate-osmosmemo.ts /path/to/osmosmemo/bookmarks.json
```

This creates a new `data/bookmarks.json` in Lethe format.

## License

MIT
