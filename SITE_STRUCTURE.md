# bmoreveg Site Structure

## Overview

bmoreveg is a **hand-coded static site** with no framework, build step, or CMS. It's pure HTML, CSS, and vanilla JavaScript, deployed on Netlify.

## Directory Layout

```
bmoreveg/
├── index.html                  # Main site (simpler version)
├── files/
│   ├── index.html              # Expanded version (more restaurants)
│   ├── thank-you.html          # Newsletter subscription confirmation page
│   ├── baltimore-skyline.jpg   # About section hero image
│   └── bmoreveg-logo.svg       # Carrot logo
└── README.md
```

## Single-Page Architecture

Both `index.html` files are single-page layouts with hash-based navigation (`/#coffee`, `/#bakeries`, `/#restaurants`, `/#about`). All content lives in one file, organized into these sections:

| Section | Purpose |
|---|---|
| **Header** | Logo (inline SVG carrot) and tagline |
| **Nav** | Sticky navigation bar linking to Map, Coffee, Bakeries, Restaurants, About |
| **Map** | Interactive Leaflet.js map with custom carrot markers for each restaurant |
| **Filters** | Client-side filtering by neighborhood (11 options) and price tier ($, $$, $$$) |
| **Coffee** | Coffee shop listings |
| **Bakeries** | Bakery listings |
| **Restaurants** | Restaurant listings |
| **About** | Mission statement with hero image |
| **Newsletter** | Email signup form via Netlify Forms |
| **Privacy** | Inline privacy policy |

## Restaurant Data Model

Each restaurant is an `<article class="place">` element with data attributes that drive both the map and the filtering system:

```html
<article class="place"
  data-neighborhood="hampden,fells-point"
  data-price="2"
  data-lat="39.3295"
  data-lng="-76.6295"
  data-name="Ekiben">
```

- `data-neighborhood` — comma-separated list of neighborhood slugs for filtering
- `data-price` — numeric tier (1 = $, 2 = $$, 3 = $$$)
- `data-lat` / `data-lng` — coordinates for the map marker
- `data-name` — display name used in map popups

Each article contains a title, neighborhood tags, category badge, price indicator, description, and a "vibe" summary.

## Styling

All CSS is embedded in an inline `<style>` block — there are no external stylesheets. Design tokens are defined as CSS custom properties:

- `--bg: #FAFAF8` — page background
- `--text: #1a1a1a` — body text
- `--accent: #2D5A27` — green accent color
- `--carrot: #F5794A` — orange accent color
- `--border: #e5e5e5` — border color

**Fonts** (loaded from Google Fonts CDN):
- **Newsreader** (serif) — body text and descriptions
- **Space Grotesk** (sans-serif) — headings, buttons, and labels

**Responsive design** uses a single breakpoint at 600px.

## JavaScript

All JavaScript is vanilla (no libraries except Leaflet). It handles three things:

1. **Map** — Leaflet.js map centered on Baltimore (`39.2904, -76.6122`), using OpenStreetMap tiles and custom carrot SVG icons as markers. Each restaurant's coordinates create a marker with a popup.

2. **Filtering** — Real-time client-side filtering by neighborhood and price. Filters toggle visibility of `.place` articles, update a visible count, and dynamically adjust which markers appear on the map and the map bounds.

3. **Form submission** — The newsletter signup form uses Netlify Forms (`data-netlify="true"`) with honeypot spam protection (`data-netlify-honeypot="bot-field"`). On success it redirects to the `/thank-you` page.

## External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| Leaflet.js | 1.9.4 | Interactive map (loaded from CDN) |
| Google Fonts | — | Newsreader and Space Grotesk typefaces |
| OpenStreetMap | — | Map tile layer |

Everything else is hand-written with no npm packages or build tools.

## URL Structure

- `/` — Main site (root `index.html`)
- `/#map-section` — Map section
- `/#coffee` — Coffee section
- `/#bakeries` — Bakeries section
- `/#restaurants` — Restaurants section
- `/#about` — About section
- `/#privacy` — Privacy policy
- `/thank-you` — Newsletter confirmation (served from `files/thank-you.html`)

## Two Versions

The repository contains two versions of the main page:

- **Root `index.html`** — Original/simpler version with fewer restaurant entries
- **`files/index.html`** — Expanded version with more restaurants and content

The `files/` version appears to be the more current and complete version.

## Deployment

The site is hosted on **Netlify**, which serves the static HTML files directly. There is no build process, bundling, or compilation step.
