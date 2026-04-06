# 🧠 MASTERMIND — IHP Greenville Website Knowledge Base
> This file is referenced before every change, plan, or response. Updated continuously.
> Last updated: 2026-04-06
> **Rule:** This file is updated after every session with new learnings, fixes, and decisions.

---

## 🎯 MOST RECENT TASK
> **Update this section immediately after every task. If lost or confused, read this first.**

**Task:** Fix 15 duplicate meta titles + 3 over-length titles sitewide.

**Root cause:** `getConditionPageSEO()` in `server/seo.ts` generated `${name} Treatment in Greenville, SC | IHP` for ALL condition pages — identical to the corresponding service page titles (e.g., both `/conditions/adrenal-fatigue/` and `/services/adrenal-fatigue-treatment/` had "Adrenal Fatigue Treatment in Greenville, SC | IHP"). Google can't differentiate which page to rank. Blog index and FM Hub titles were also 67 chars (limit is 65).

**Fix:**
- `getConditionPageSEO()` title template changed from `${name} Treatment in Greenville, SC | IHP` → `${name}: Causes & Care | IHP Greenville`
- Blog index title: 67ch → 45ch ("Integrative Health Blog | Greenville SC | IHP")
- FM Hub title: 67ch → 43ch ("Functional Medicine in Greenville, SC | IHP")
- All 233 pages now verified ≤65 chars; 0 duplicate titles between condition/service pages

**⚠️ Rule going forward:** Condition pages MUST use "Causes & Care" framing — never "Treatment" in title. Treatment keyword belongs to service pages only. Condition pages answer "what is it / why do I have it." Service pages answer "how we treat it."

**Status:** ✅ Complete — committed ad7be78, pushed to main

---

**Task:** SEO schema.org validation fixes (165 pages had errors in Ahrefs).

**Root causes found:**
1. `"@type": "Physician"` used for Dr. Hendry — `Physician` is a `MedicalBusiness` subtype (an Organization), not a Person. All Person properties (`hasCredential`, `honorificPrefix`) were invalid on it.
2. `performer` property on `MedicalProcedure` schema — not a valid MedicalProcedure property
3. `speakable` on `MedicalProcedure` and `MedicalCondition` schemas — only valid on WebPage/Article
4. `medicalSpecialty` as bare string URL — must use `{"@id": "https://schema.org/..."}` enum format
5. `procedureType` using HTTP URL not enum value — valid values are `NoninvasiveProcedure`, `SurgicalProcedure`, `PercutaneousProcedure`

**Fixes applied in `server/seo.ts`:**
- `"@type": "Physician"` → `"@type": "Person"` in 3 places (homepage employee, homepage standalone, getDrHendrySEO)
- Removed `performer` from MedicalProcedure schema
- Removed `speakable` from MedicalProcedure and MedicalCondition schemas
- `medicalSpecialty: "https://..."` → `medicalSpecialty: { "@id": "https://..." }`
- `procedureType: "http://schema.org/TherapeuticProcedure"` → `procedureType: "https://schema.org/NoninvasiveProcedure"`

**Status:** ✅ Complete

---

**Task:** Add Functional Medicine hub page + Lyme Disease condition page (new content).

**Functional Medicine Hub (`/functional-medicine-greenville-sc/`):**
- Targets: "functional medicine greenville sc" (vol 150), "integrative medicine greenville sc" (60), "holistic doctor greenville sc" (60), "naturopathic doctor greenville sc" (50)
- ~2,200 words, 6 FAQ pairs, MedicalBusiness + BreadcrumbList + FAQPage schemas
- Added to desktop nav (Functional Medicine column) and mobile nav
- Added `renderFunctionalMedicineHub()` in `server/renderer.ts`
- Added `getFunctionalMedicineSEO()` in `server/seo.ts`
- Added `buildPage()` call + sitemap entry at priority 0.85 in `script/generate-static.ts`

**Lyme Disease (`/conditions/lyme-disease/`):**
- Entry added to `server/conditions.ts` using ConditionData interface
- Auto-picked up by conditions loop in generate-static.ts
- Covers: Borrelia persistence, co-infections (Babesia, Bartonella), herbal protocols, ozone therapy
- Linked from `/conditions/digestive-immune/` category page

**Status:** ✅ Complete

---

**Task:** Add `relatedServiceSlugs` to all 130 service pages + `comparison` sections to 7 priority pages.

**What was done:**
- All 130 service pages in `server/services-content.ts` now have `relatedServiceSlugs` (4–8 slugs each), grouped by semantic topic clusters:
  - Functional medicine cluster, gut health cluster, pain cluster, women's health cluster, Chinese medicine cluster, injection therapy cluster, mental health cluster, immune/autoimmune cluster, etc.
- `comparison` sections added to 7 highest-impact pages:
  - `hormone-testing`, `adrenal-fatigue-treatment`, `weight-loss-support`, `natural-diabetes-support`, `leaky-gut-treatment`, `long-covid-treatment`, `autoimmune-disease-treatment`
- Comparison format: `{ title: string, text: string }` — patient scenario narrative, 150–200 words each

**⚠️ Rule:** `relatedServiceSlugs` must reference slugs that EXIST in `serviceContentMap`. Invalid slugs cause no error but render dead links. Always verify against actual keys in services-content.ts.

**Status:** ✅ Complete

---

**Task:** Fix Ahrefs issues — OG image 404, favicon missing, publisher logo wrong dimensions, blog author.

**Fixes applied:**
- Created `public/favicon.svg` — green circle (#2F814A) with "IHP" text
- Created `public/assets/logo.svg` — 280×50px publisher logo for Article schemas (Google spec ≤600×60)
- `baseHead()` in `server/renderer.ts`: added favicon link tags, changed og:image/twitter:image from missing `/assets/ogImage.png` → `/assets/ogImage.png` (now exists), added CSS preload
- Blog Article schema `image` field: `dr-hendry.jpg` (7.8MB) → `dr-hendry.webp` (14KB)
- Blog Article schema publisher logo: wrong path + wrong dimensions → `assets/logo.svg` (280×50)
- Blog post author: all 53 `content/blog/*.json` files updated `creator` from "Integrative Health Partners" → "Dr. William Hendry, DAOM"
- Fallback in `script/generate-static.ts`: `raw.creator || "Dr. William Hendry, DAOM"`
- Google Fonts moved from CSS `@import` (render-blocking chain) → async `<link media="print" onload="this.media='all'">` in `renderHead()`
- Removed `@import` from `public/css/style.css`
- Hero video: added `poster="/images/clinic/exterior.webp"` to eliminate black flash

**Status:** ✅ Complete

---

## 👤 ABOUT THE USER — Josiah

### Identity & Context
- **Name:** Josiah
- **Role:** Running two projects — ProspectPro (outbound web design agency) + IHP Greenville (client website SEO)
- **Location:** Greenville / Spartanburg, SC (864 area code)
- **Client:** Integrative Health Partners — Dr. William Hendry, DAOM — acupuncture + functional medicine practice

### Personality & Working Style
- **Moves fast** — minimal back-and-forth, just execute
- **Visual thinker** — often sends screenshots to communicate
- **Low tolerance for bugs or stale data** — catches issues immediately
- **Doesn't want to be asked questions** he hasn't brought up — execute and report
- **Wants to see measurable SEO results** — Ahrefs validation, Google ranking, schema correctness
- **Trusts the system** once it's built

### Goals for IHP Website
- Rank #1 in Greenville for: "acupuncture greenville sc", "functional medicine greenville sc", "integrative medicine greenville sc", "holistic doctor greenville sc"
- Fix all Ahrefs technical SEO errors
- Build topical authority through hub pages, condition pages, and content depth
- Outrank Spruce MD (primary competitor — ranks for 47 keyword variations from one hub page)
- Clean schema.org validation (Rich Results eligibility)

---

## 🏗️ PROJECT — IHP Greenville Website

### Overview
- **Type:** Static site (HTML/CSS/JS) — no framework, no runtime
- **Stack:** TypeScript + Node.js static generator → outputs to `dist/`
- **Host:** Netlify (auto-deploys from GitHub `main` branch)
- **Repo:** `github.com/platinumpartnersolutions/ihp-greenville-website`
- **Build command:** `npx tsx script/generate-static.ts`
- **Output:** 325 HTML files in `dist/` — every page pre-rendered at build time

### File Structure (key files)
```
ihp-greenville-website-main/
├── server/
│   ├── renderer.ts           — All HTML rendering: renderHome(), renderService(), renderCondition(),
│   │                            renderFunctionalMedicineHub(), renderAbout(), renderBlog(), etc.
│   │                            Also: baseHead(), nav, footer, schema injection
│   ├── seo.ts                — All SEO: meta titles, descriptions, JSON-LD schemas per page type.
│   │                            getSEOForUrl() is the main router function.
│   ├── services-content.ts   — 130 service page content objects (ServiceContent interface)
│   │                            Fields: slug, name, metaTitle, metaDescription, category,
│   │                            categorySlug, content{}, relatedServiceSlugs[], comparison{},
│   │                            research{}, timeline{}, costInfo{}
│   └── conditions.ts         — 36 condition entries (ConditionData interface) + 4 category entries
│                                Fields: slug, name, navLabel, categorySlug, metaTitle,
│                                metaDescription, relatedServiceSlugs[], relatedConditionSlugs[],
│                                content{ definition, symptoms[], rootCauses, howTreated,
│                                drApproach, faqs[] }
├── script/
│   └── generate-static.ts    — Build script: loops all services, conditions, blog posts,
│                                calls renderXxx() + getSEOForUrl(), writes dist/*.html,
│                                generates sitemap.xml
├── content/
│   └── blog/
│       └── *.json            — 53 blog post JSON files. Fields: title, slug, excerpt,
│                                creator, datePublished, dateModified, content (markdown)
├── public/
│   ├── css/style.css         — Main stylesheet. Google Fonts loaded async from renderer.ts head.
│   ├── favicon.svg           — Green circle IHP favicon
│   ├── assets/
│   │   ├── ogImage.png       — 1200×630 OG share image (15KB)
│   │   └── logo.svg          — 280×50 publisher logo for Article schemas
│   └── images/               — Clinic photos, dr-hendry.jpg (7.8MB), dr-hendry.webp (14KB)
├── dist/                     — Built output (gitignored from Netlify — built on deploy)
├── netlify.toml              — Cache headers, redirect rules
└── MASTERMIND.md             — This file
```

### Content Scale
- **130** service pages (`/services/[slug]/`)
- **36** condition pages (`/conditions/[slug]/`)
- **4** condition category pages (`/conditions/[category-slug]/`)
- **53** blog posts (`/blog/[slug]/`)
- **9** static pages: home, about, dr-hendry, contact, blog index, conditions hub, services hub, FM hub, privacy, disclaimer
- **4** service category pages
- **Total built:** 325 files

### Core Data Flow
1. `generate-static.ts` reads `serviceContentMap` (services-content.ts) + `conditions` array (conditions.ts) + blog JSON files
2. For each page: calls `renderXxx(data)` → HTML string, then `getSEOForUrl(path)` → PageSEO object
3. `injectSEOIntoHTML(html, seo)` merges title, description, canonical, og tags, JSON-LD schemas
4. Writes to `dist/[path]/index.html`
5. Generates `dist/sitemap.xml` with all URLs + priorities
6. `git push main` → Netlify auto-builds and deploys

### Optional Content Fields (conditionally rendered)
These fields exist on ServiceContent but only render in HTML if present:
- `relatedServiceSlugs: string[]` → "Related Services" section (grid of linked service cards)
- `comparison: { title, text }` → "Conventional vs. Integrative" comparison section
- `research: { title, text }` → Evidence/research citations section
- `timeline: { title, steps[] }` → Treatment timeline section
- `costInfo: { title, text }` → Cost/insurance information section

The 9 core "money pages" have all of these. 121 standard pages previously had none — `relatedServiceSlugs` has now been added to all.

---

## 🏥 PRACTICE INFORMATION (NAP — Name, Address, Phone)

```
Name:    Integrative Health Partners
Address: 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609
Phone:   (864) 365-6156 / +1-864-365-6156
Email:   info@ihpgreenville.com
URL:     https://www.ihpgreenville.com
Hours:   Mon–Fri 9:00 AM – 5:00 PM
Coords:  34.862258, -82.382482
```

### Dr. William Hendry
- **Credentials:** DAOM (Doctor of Acupuncture and Oriental Medicine)
- **Specialties:** Acupuncture, Oriental Medicine, Functional Medicine, Integrative Medicine
- **Background:** Held hospital privileges at Prisma Health for 9 years; co-authored needling research as opioid alternative; in-house pharmacy; dual training in DAOM + functional medicine
- **Note:** Dr. Hendry is NOT an MD. Schema should use `"@type": "Person"` NOT `"@type": "Physician"` (Physician = MedicalBusiness/Organization in schema.org, not a Person)

---

## 🔍 SEO STRATEGY

### Target Keyword Clusters
| Page | Primary Target | Monthly Vol | KD |
|------|---------------|-------------|-----|
| Homepage | acupuncture greenville sc | 500 | 14 |
| FM Hub | functional medicine greenville sc | 150 | 10 |
| FM Hub | integrative medicine greenville sc | 60 | 13 |
| FM Hub | holistic doctor greenville sc | 60 | 15 |
| Service: acupuncture-therapy | acupuncture greenville sc | 500 | 14 |
| Service: functional-medicine-consultation | functional medicine doctor greenville sc | ~40 | 8 |
| Condition: lyme-disease | lyme disease doctor greenville sc | ~310K assoc. | — |

### Primary Competitor
**Spruce MD** — their homepage IS a functional medicine hub page. Ranks for 47 keyword variations off one URL. IHP's `functional-medicine-greenville-sc` hub page was created specifically to replicate this strategy.

### Content Hierarchy
```
Homepage (domain authority anchor)
  └── /functional-medicine-greenville-sc/ (topic authority hub)
  └── /services/ (130 service pages — long-tail captures)
  └── /conditions/ (36 condition pages — informational intent)
  └── /blog/ (53 posts — topical depth + long-tail)
```

### Schema Strategy
- Homepage: `MedicalBusiness` + `Person` (Dr. Hendry) + `FAQPage`
- Service pages: `MedicalProcedure` + `BreadcrumbList` + `FAQPage`
- Condition pages: `MedicalCondition` + `BreadcrumbList` + `FAQPage`
- Blog posts: `Article` + `BreadcrumbList`
- FM Hub: `MedicalBusiness` + `BreadcrumbList` + `FAQPage`
- Dr. Hendry page: `Person` + `BreadcrumbList`

---

## 🐛 KNOWN ISSUES & HARD-LEARNED LESSONS

### Resolved
| Issue | Root Cause | Fix |
|-------|-----------|-----|
| OG image 404 on all pages | `/assets/ogImage.png` didn't exist | Created `public/assets/ogImage.png` |
| Favicon missing sitewide | No favicon file or link tag existed | Created `public/favicon.svg` + added link tags in `baseHead()` |
| 165 schema.org validation errors | `Physician` used as Person type; invalid properties | Changed to `"@type": "Person"`; removed `performer`, `speakable` |
| `procedureType` schema error | Used full URL instead of enum value | Changed to `"https://schema.org/NoninvasiveProcedure"` |
| `medicalSpecialty` schema error | Bare string URL, not enum reference | Changed to `{ "@id": "https://schema.org/..." }` |
| Publisher logo wrong size (1200×630) | Google requires ≤600×60 for Article | Created `assets/logo.svg` (280×50) |
| Blog posts showing "Integrative Health Partners" as author | `creator` field in JSON files + fallback both wrong | Updated all 53 JSON files + fallback to "Dr. William Hendry, DAOM" |
| Google Fonts render-blocking | CSS `@import` creates blocking chain | Moved to async `<link media="print" onload>` in renderer.ts head |
| Hero video black flash on load | No poster image set | Added `poster="/images/clinic/exterior.webp"` |
| 15 duplicate titles (condition vs. service pages) | `getConditionPageSEO()` template used "Treatment" keyword | Changed template to "Causes & Care" framing |
| Blog index + FM Hub titles >65ch | Full brand name in titles | Shortened both (67ch → 45ch and 43ch) |
| FM Hub no inbound links (orphan) | New page created with no nav link | Added to desktop + mobile nav in `renderer.ts` |

### Watch Out For
- **NEVER use `"@type": "Physician"` for Dr. Hendry** — Physician is an Organization type in schema.org, not a Person. Use `"@type": "Person"`.
- **Condition page titles must NOT say "Treatment"** — that keyword belongs to service pages. Use "Causes & Care" or similar.
- **`relatedServiceSlugs` must reference real slugs** — invalid slugs silently render dead links. Verify against `serviceContentMap` keys.
- **OG image should use `ogImage.png` (15KB), NOT `dr-hendry.jpg` (7.8MB)** — large file wrecks social share load time
- **Blog Article image should use `dr-hendry.webp` (14KB), NOT `dr-hendry.jpg` (7.8MB)**
- **Any new page requires 3 file edits:** `renderer.ts` (render function), `seo.ts` (SEO function + URL case), `generate-static.ts` (buildPage call + sitemap entry)
- **Conditions loop is automatic** — adding a new entry to `conditions` array in `conditions.ts` is sufficient; generate-static.ts picks it up automatically
- **`trim160(desc)`** is called on all meta descriptions in seo.ts — descriptions longer than 160 chars are auto-trimmed
- **Hero video is 34MB** — needs re-export at 3–5MB (requires video editing software, not code)
- **`magick` warnings on build** are OK — ImageMagick not installed on this machine, WebP conversion skipped (WebP files already exist pre-built)

---

## 📈 PROGRESS TRACKER

### ✅ Completed — SEO Technical Fixes
- [x] Created `public/favicon.svg` + added to all page heads
- [x] Created `public/assets/logo.svg` (publisher logo, 280×50)
- [x] Fixed OG image 404 → `assets/ogImage.png` on all pages
- [x] Fixed blog Article image → `dr-hendry.webp` (schema + og)
- [x] Fixed publisher logo dimensions in blog Article schemas
- [x] Fixed 165 schema.org validation errors (Physician→Person, removed performer/speakable)
- [x] Fixed `procedureType` enum value on all 130 service schemas
- [x] Fixed `medicalSpecialty` enum format on FM Hub schema
- [x] Removed invalid `medicalSpecialty` from homepage + dr-hendry Physician schemas
- [x] Fixed `openingHours` → `openingHoursSpecification` on homepage schema
- [x] Added `author` to Blog index schema
- [x] Fixed blog post author: all 53 posts now show "Dr. William Hendry, DAOM"
- [x] Async Google Fonts loading (eliminated render-blocking chain)
- [x] Hero video poster image (eliminated black flash)
- [x] Fixed 15 duplicate condition/service page meta titles
- [x] Fixed 3 over-length titles (>65ch)
- [x] All 233 pages: 0 duplicate titles, 0 titles >65 chars (verified)

### ✅ Completed — Content Authority
- [x] Functional Medicine hub page created (`/functional-medicine-greenville-sc/`)
- [x] Lyme Disease condition page created (`/conditions/lyme-disease/`)
- [x] `relatedServiceSlugs` added to all 130 service pages (topic cluster internal linking)
- [x] `comparison` sections added to 7 priority service pages
- [x] FM hub page added to desktop + mobile nav
- [x] MASTERMIND.md created — persistent knowledge base

### 🔲 Planned / On Hold
- [ ] Add `research` sections to ~25 functional medicine cluster pages (hormone-testing, thyroid-testing, adrenal-testing, gut-health-testing, leaky-gut-treatment, weight-loss-support, etc.)
- [ ] Add internal links TO FM hub from homepage "Our Services" section
- [ ] Add internal links TO FM hub from relevant blog posts (via routes.ts autolinker)
- [ ] Hero video compression: 34MB → 3–5MB (requires video editor, not code)
- [ ] IndexNow submission for 124 recently updated pages (via Ahrefs dashboard or sitemap ping)
- [ ] Internal link audit: `/blog/red-wine-for-health/` still has only 1 inbound link
- [ ] netlify.toml: add `stale-while-revalidate=86400` to HTML cache headers
- [ ] netlify.toml: add image/asset caching headers

---

## 💡 ARCHITECTURE PRINCIPLES (enforce always)

1. **One hub page per semantic cluster** — don't create separate pages for synonymous keywords ("functional medicine", "integrative medicine", "holistic doctor" all live on one hub page). Google's NLP handles the cluster.
2. **Content voice: clinician speaking to patient** — specific, grounded, never buzzword-heavy ("groundbreaking", "cutting-edge", "revolutionary"). The 9 core money pages are the quality benchmark.
3. **Condition pages = informational intent; Service pages = transactional intent** — titles, content, and schema must reflect this split. Never put "Treatment" in a condition page title.
4. **Add new pages via 3-file edit** — renderer.ts (render function) + seo.ts (SEO function + URL case in getSEOForUrl) + generate-static.ts (buildPage + sitemap)
5. **Schema.org types must be exact enum values** — `Physician` ≠ Person, `medicalSpecialty` needs `{"@id": "..."}` not bare string, `procedureType` needs enum not URL
6. **Images: always use WebP** — `dr-hendry.webp` (14KB) not `dr-hendry.jpg` (7.8MB) for any schema or OG tag
7. **Verify slugs before using** — `relatedServiceSlugs` and condition cross-links must reference slugs that actually exist in the data maps
8. **Run build and verify dist/ before committing** — `npx tsx script/generate-static.ts` takes ~10s; always check key output files

---

## 📝 NOTES & MISC

- **Build command:** `npx tsx script/generate-static.ts` (run from project root)
- **Preview server:** `npx serve dist --listen 4000` (config in `.claude/launch.json`)
- **Deploy:** Git push to `main` → Netlify auto-deploys (usually 1–2 min)
- **GitHub repo:** `https://github.com/platinumpartnersolutions/ihp-greenville-website`
- **Google will show stale cached titles** for days/weeks after a deploy — normal. Use Search Console → URL Inspection → Request Indexing for priority pages.
- **No TypeScript strict mode** — the project compiles with `npx tsx`, not `tsc --strict`. Type errors that don't break runtime are tolerated.
- **`magick` WebP warnings are safe to ignore** — ImageMagick not installed; WebP files already exist in `public/images/`
- **Sitemap priorities:** Homepage 1.0, Category pages 0.90, Core money pages 0.90, FM Hub 0.85, Standard service pages 0.80, Condition pages 0.75, Blog posts 0.70, Static pages 0.50
- **9 core money pages** (have research + comparison + timeline + costInfo): acupuncture-therapy, functional-medicine-consultation, functional-medicine-testing, chinese-herbal-medicine, dry-needling-therapy, hormone-testing, ozone-therapy, weight-loss-support, integrative-medicine-consultation
- **Conditions data has `metaTitle` fields** but `getConditionPageSEO()` does NOT use them — it generates titles from the template. The `metaTitle` fields in conditions.ts are currently unused. This could be a future refactor to allow per-condition title overrides.
- **Blog posts in `content/blog/*.json`** — the `creator` field drives the visible author byline. All 53 posts set to "Dr. William Hendry, DAOM".
