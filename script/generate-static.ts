import { writeFileSync, mkdirSync, cpSync, rmSync, existsSync, readdirSync, readFileSync, statSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import {
  renderHome, renderCategory, renderService, renderBlogIndex, renderBlogPost,
  render404, renderConditionsHub, renderConditionCategory, renderCondition,
  renderAbout, renderDrHendry, renderContact, renderServicesHub,
  renderPrivacy, renderDisclaimer, renderSitemapHtml,
  renderFunctionalMedicineHub,
} from "../server/renderer";
import {
  allServices, categoryDefinitions, BASE_URL,
  getSEOForUrl, injectSEOIntoHTML, getBlogPostSEO, generateRobotsTxt,
} from "../server/seo";
import { conditions, conditionCategories } from "../server/conditions";
import { BLOG_410S } from "../server/blog-redirects";
import type { BlogPost } from "../shared/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(__dirname, "..");
const DIST   = path.resolve(ROOT, "dist");
const PUBLIC = path.resolve(ROOT, "public");
const ASSETS = path.resolve(ROOT, "attached_assets");
const CONTENT_BLOG = path.resolve(ROOT, "content/blog");

/* ─── The 6 heavy images that get WebP conversion ─────────────────────────── */
const WEBP_IMAGES = [
  "/images/dr-hendry.jpg",
  "/images/clinic/exterior.jpg",
  "/images/clinic/waiting.jpg",
  "/images/clinic/pharmacy.jpg",
  "/images/clinic/room1.jpg",
  "/images/clinic/hallway.jpg",
];

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/** Replace the 6 heavy JPG paths with their WebP equivalents in HTML. */
function swapToWebp(html: string): string {
  for (const jpg of WEBP_IMAGES) html = html.split(jpg).join(jpg.replace(".jpg", ".webp"));
  return html;
}

/** Add alt attribute to any <img> tag that is missing one entirely. */
function ensureImgAlt(html: string, defaultAlt: string): string {
  const escaped = defaultAlt.replace(/"/g, "&quot;");
  return html.replace(/<img\b([^>]*)>/gi, (_m, attrs: string) =>
    /\balt\s*=/i.test(attrs) ? _m : `<img${attrs} alt="${escaped}">`
  );
}

/**
 * Rewrite every internal href="/path" → href="/path/" so that Netlify's
 * canonical URL (always with trailing slash) matches every link on the page.
 * Skips: root "/", paths that already end with "/", and paths with a file
 * extension (.xml, .txt, .css, .js, .jpg, .webp, etc.).
 */
function addTrailingSlashes(html: string): string {
  return html.replace(/\bhref="(\/[^"#?]*)"/g, (_m, p: string) => {
    if (p === "/" || p.endsWith("/") || /\.[a-z]{2,6}$/i.test(p)) return _m;
    return `href="${p}/"`;
  });
}

function writePage(urlPath: string, html: string): void {
  const rel  = urlPath === "/" ? "index.html" : `${urlPath.replace(/^\//, "")}/index.html`;
  const file = path.join(DIST, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, addTrailingSlashes(html), "utf8");
  process.stdout.write(`  ✓ ${urlPath}\n`);
}

/** Normalise SEO canonical to trailing-slash form, inject, then write. */
function buildPage(urlPath: string, rawHtml: string): void {
  const seo = getSEOForUrl(urlPath);
  if (seo) {
    if (!seo.canonical.endsWith("/")) seo.canonical += "/";
    rawHtml = injectSEOIntoHTML(rawHtml, seo);
  }
  writePage(urlPath, swapToWebp(rawHtml));
}

function loadBlogPosts(): BlogPost[] {
  if (!existsSync(CONTENT_BLOG)) {
    console.error(`ERROR: ${CONTENT_BLOG} does not exist. Run: npm run export-blog`);
    process.exit(1);
  }
  const files = readdirSync(CONTENT_BLOG).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const raw = JSON.parse(readFileSync(path.join(CONTENT_BLOG, f), "utf8"));
    return {
      id:         raw.slug,
      title:      raw.title      || "",
      slug:       raw.slug,
      link:       raw.link       || "",
      pubDate:    raw.pubDate    ? new Date(raw.pubDate) : new Date(),
      creator:    raw.creator    || "Dr. William Hendry, DAOM",
      excerpt:    raw.excerpt    || "",
      content:    raw.content    || "",
      categories: raw.categories || [],
      syncedAt:   new Date(),
    } satisfies BlogPost;
  }).sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/* ─── INIT ─────────────────────────────────────────────────────────────────── */

if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const allBlogPosts = loadBlogPosts();
const liveBlogPosts = allBlogPosts.filter(p => !BLOG_410S.has(`/blog/${p.slug}`));
console.log(`\nLoaded ${allBlogPosts.length} blog posts (${liveBlogPosts.length} live)\n`);

/* ─── STATIC PAGES ─────────────────────────────────────────────────────────── */

console.log("── Core pages ──");
buildPage("/",           renderHome());
buildPage("/functional-medicine-greenville-sc", renderFunctionalMedicineHub());
buildPage("/about",      renderAbout());
buildPage("/dr-hendry",  renderDrHendry());
buildPage("/contact",    renderContact());
buildPage("/privacy",    renderPrivacy());
buildPage("/disclaimer", renderDisclaimer());
buildPage("/services",   renderServicesHub());
buildPage("/conditions", renderConditionsHub());
buildPage("/blog",       (() => {
  const raw = renderBlogIndex(liveBlogPosts);
  const seo = getSEOForUrl("/blog");
  return seo ? injectSEOIntoHTML(raw, seo) : raw;
})());

/* ─── SERVICE CATEGORIES ───────────────────────────────────────────────────── */

console.log("\n── Service category hubs ──");
for (const cat of categoryDefinitions) {
  const raw = renderCategory(cat.slug);
  if (raw) buildPage(`/services/${cat.slug}`, raw);
  else console.warn(`  WARN: renderCategory returned null for ${cat.slug}`);
}

/* ─── 130 SERVICE PAGES ────────────────────────────────────────────────────── */

console.log("\n── Service pages ──");
let svcOk = 0; let svcFail = 0;
for (const svc of allServices) {
  const raw = renderService(svc.slug);
  if (raw) { buildPage(`/services/${svc.slug}`, raw); svcOk++; }
  else { console.warn(`  WARN: no render for /services/${svc.slug}`); svcFail++; }
}
console.log(`  → ${svcOk} service pages OK, ${svcFail} warnings`);

/* ─── CONDITION CATEGORY HUBS ──────────────────────────────────────────────── */

console.log("\n── Condition category hubs ──");
for (const cat of conditionCategories) {
  const raw = renderConditionCategory(cat.slug);
  if (raw) buildPage(`/conditions/${cat.slug}`, raw);
  else console.warn(`  WARN: renderConditionCategory returned null for ${cat.slug}`);
}

/* ─── 35 CONDITION PAGES ───────────────────────────────────────────────────── */

console.log("\n── Condition pages ──");
let condOk = 0; let condFail = 0;
for (const cond of conditions) {
  const raw = renderCondition(cond.slug);
  if (raw) { buildPage(`/conditions/${cond.slug}`, raw); condOk++; }
  else { console.warn(`  WARN: no render for /conditions/${cond.slug}`); condFail++; }
}
console.log(`  → ${condOk} condition pages OK, ${condFail} warnings`);

/* ─── BLOG POSTS ───────────────────────────────────────────────────────────── */

console.log("\n── Blog posts ──");
let blogOk = 0;
for (const post of liveBlogPosts) {
  let raw         = renderBlogPost(post);
  const rawDesc   = (post as any).metaDescription || post.excerpt || post.content || "";
  const cleanExc  = rawDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().substring(0, 155)
                    || `${post.title} — expert health article from Integrative Health Partners in Greenville, SC.`;
  const dateStr   = post.pubDate instanceof Date ? post.pubDate.toISOString() : String(post.pubDate);
  const blogSEO   = getBlogPostSEO(post.title, cleanExc, post.slug, dateStr);
  if (!blogSEO.canonical.endsWith("/")) blogSEO.canonical += "/";
  let html        = injectSEOIntoHTML(raw, blogSEO);
  html            = ensureImgAlt(html, post.title);
  html            = swapToWebp(html);
  writePage(`/blog/${post.slug}`, html);
  blogOk++;
}
console.log(`  → ${blogOk} blog posts written`);

/* ─── HTML Sitemap ──────────────────────────────────────────────────────────── */

console.log("\n── HTML Sitemap ──");
{
  const sitemapHtml = renderSitemapHtml(liveBlogPosts.map(p => ({ title: p.title, slug: p.slug })));
  const sitemapSeo = getSEOForUrl("/sitemap.html");
  const sitemapFinal = sitemapSeo ? injectSEOIntoHTML(swapToWebp(sitemapHtml), sitemapSeo) : swapToWebp(sitemapHtml);
  writeFileSync(path.join(DIST, "sitemap.html"), addTrailingSlashes(sitemapFinal), "utf8");
  console.log("  ✓ sitemap.html");
}

/* ─── 404 / 410 pages ──────────────────────────────────────────────────────── */

console.log("\n── Error pages ──");
writeFileSync(path.join(DIST, "404.html"), render404(), "utf8");
console.log("  ✓ 404.html");

const gone410Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex,nofollow">
  <title>Content Removed | Integrative Health Partners</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header style="padding:2rem;text-align:center">
    <a href="/" style="font-size:1.5rem;font-weight:bold;text-decoration:none;color:#2F814A">
      Integrative Health Partners
    </a>
  </header>
  <main style="max-width:600px;margin:6rem auto;padding:2rem;text-align:center">
    <h1 style="font-size:2rem;margin-bottom:1rem">Content Permanently Removed</h1>
    <p style="color:#555;margin-bottom:2rem">This page has been permanently removed from our website.</p>
    <a href="/blog" style="background:#2F814A;color:#fff;padding:.75rem 2rem;border-radius:4px;text-decoration:none">
      View our blog
    </a>
  </main>
</body>
</html>`;
writeFileSync(path.join(DIST, "410.html"), gone410Html, "utf8");
console.log("  ✓ 410.html");

/* ─── SITEMAP.XML ──────────────────────────────────────────────────────────── */

console.log("\n── sitemap.xml ──");
const today = new Date().toISOString().split("T")[0];

const sitemapUrls: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }> = [
  { loc: "/",                                    priority: "1.0", changefreq: "weekly",  lastmod: today },
  { loc: "/functional-medicine-greenville-sc",   priority: "0.85", changefreq: "monthly", lastmod: today },
  { loc: "/services",                            priority: "0.9", changefreq: "monthly", lastmod: today },
  { loc: "/conditions",priority: "0.9", changefreq: "monthly", lastmod: today },
  { loc: "/about",     priority: "0.8", changefreq: "monthly", lastmod: today },
  { loc: "/dr-hendry", priority: "0.8", changefreq: "monthly", lastmod: today },
  { loc: "/blog",      priority: "0.8", changefreq: "weekly",  lastmod: today },
  { loc: "/contact",   priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/privacy",   priority: "0.3", changefreq: "yearly",  lastmod: today },
  { loc: "/disclaimer",priority: "0.3", changefreq: "yearly",  lastmod: today },
];

for (const cat of categoryDefinitions)
  sitemapUrls.push({ loc: `/services/${cat.slug}`, priority: "0.9", changefreq: "monthly", lastmod: today });

for (const svc of allServices)
  sitemapUrls.push({ loc: `/services/${svc.slug}`, priority: "0.7", changefreq: "monthly", lastmod: today });

for (const cat of conditionCategories)
  sitemapUrls.push({ loc: `/conditions/${cat.slug}`, priority: "0.8", changefreq: "monthly", lastmod: today });

for (const cond of conditions)
  sitemapUrls.push({ loc: `/conditions/${cond.slug}`, priority: "0.8", changefreq: "monthly", lastmod: today });

for (const post of liveBlogPosts) {
  const lastmod = post.pubDate instanceof Date
    ? post.pubDate.toISOString().split("T")[0]
    : today;
  sitemapUrls.push({ loc: `/blog/${post.slug}`, priority: "0.6", changefreq: "never", lastmod });
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(({ loc, priority, changefreq, lastmod }) => {
  const canonical = loc === "/" ? `${BASE_URL}/` : `${BASE_URL}${loc}/`;
  return `  <url>
    <loc>${canonical}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join("\n")}
</urlset>`;

writeFileSync(path.join(DIST, "sitemap.xml"), sitemapXml, "utf8");
console.log(`  ✓ sitemap.xml (${sitemapUrls.length} URLs)`);

/* ─── ROBOTS.TXT ───────────────────────────────────────────────────────────── */

writeFileSync(path.join(DIST, "robots.txt"), generateRobotsTxt(), "utf8");
console.log("  ✓ robots.txt");

/* ─── LLMS.TXT ─────────────────────────────────────────────────────────────── */

const createSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const svcCatContext: Record<string, string> = {
  "Acupuncture Therapy":            "Full-spectrum acupuncture using classical point selection and Dr. Hendry's 25+ years of diagnostic expertise. Addresses pain, chronic illness, and functional health.",
  "Dry Needling Therapy":           "Trigger-point dry needling targets myofascial pain and muscle dysfunction. Dr. Hendry holds dual expertise in traditional acupuncture and Western dry needling.",
  "Electroacupuncture":             "Electrical stimulation combined with acupuncture enhances therapeutic effect for neuropathy, chronic pain, and nerve regeneration.",
  "Functional Medicine Consultation":"Advanced root-cause diagnostics: nutrient panels, hormone testing, food sensitivity, and gut health analysis interpreted through an integrative lens.",
  "Chinese Herbal Medicine":        "Custom herbal formulas dispensed same-day from our in-house professional pharmacy. Classical formulas, granule extracts, and single-herb preparations.",
  "Ozone Therapy":                  "Medical-grade ozone delivered via infrared sauna protocols. Supports immune function, detoxification, and recovery from chronic fatigue and fibromyalgia.",
  "Cupping Therapy":                "Traditional cupping stimulates blood flow and releases fascial tension. Effective for musculoskeletal pain, respiratory conditions, and recovery.",
  "Gua Sha Treatment":              "Gua sha scraping technique reduces inflammation, improves circulation, and addresses chronic muscle tension and systemic qi stagnation.",
  "Moxibustion Therapy":            "Heat applied via burning moxa warms meridians, supports immune function, and addresses cold-type conditions including menstrual pain and digestive weakness.",
};

let llms = `# Integrative Health Partners — AI Site Index (llms.txt)
# Generated: ${today}
# Site: ${BASE_URL}

## About This Practice

Integrative Health Partners is a functional medicine and acupuncture clinic located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609.
Phone: (864) 365-6156 | Email: info@ihpgreenville.com | Hours: Mon–Fri 9am–5pm

Led by Dr. William Hendry, DAOM — a board-certified acupuncturist with 25+ years of clinical experience, NCCAOM Diplomate of Oriental Medicine (Cert. #114498), NPI 1417184045, SC License ACUP141. Dr. Hendry holds hospital privileges at Prisma Health (9 years) and is co-author of a landmark 3-year Prisma Health Emergency Department study on needle-based alternatives to opioids ("Alternatives to Opiates"). He has 5 peer-reviewed publications and 52 citations. ResearchGate: https://www.researchgate.net/profile/William-Hendry-4

Services include acupuncture, cupping, gua sha, moxibustion, Chinese herbal medicine, dry needling, electroacupuncture, functional medicine, ozone therapy, injection therapy, and nutritional counseling. In-house professional herbal pharmacy on site.

## Core Pages

${BASE_URL}
Home page. Overview of Integrative Health Partners: acupuncturist and functional medicine clinic in Greenville, SC. Features Dr. Hendry credentials, services summary, testimonials, and FAQs.

${BASE_URL}/about
About Integrative Health Partners. Practice history, root-cause philosophy, in-house herbal pharmacy, and what makes IHP different from conventional care.

${BASE_URL}/dr-hendry
Dr. William Hendry biography and credentials page. Full credential verification (DAOM, NCCAOM #114498, NPI 1417184045, SC ACUP141, FL AP2646). Features the Prisma Health 3-year opioid alternative ER study, 5 peer-reviewed publications, hospital privileges, and philosophy of care.

${BASE_URL}/blog
Health and wellness blog. Expert articles on acupuncture, functional medicine, Chinese medicine, and integrative health.

${BASE_URL}/contact
Contact page. Schedule an appointment with Dr. William Hendry at Integrative Health Partners. Address: 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Phone: (864) 365-6156. Email: info@ihpgreenville.com.

## Service Category Pages

${BASE_URL}/services/acupuncturist-services
Acupuncturist services hub. 27 acupuncture services including acupuncture therapy, electroacupuncture, laser acupuncture, dry needling, biopuncture, and fertility acupuncture. Greenville SC.

${BASE_URL}/services/acupuncture-clinic-services
Acupuncture clinic services hub. 24 pain treatment services including back pain, sciatica, neck pain, shoulder pain, knee pain, fibromyalgia, and neuropathy treatment. Greenville SC.

${BASE_URL}/services/chinese-medicine-clinic-services
Chinese medicine clinic services hub. 33 TCM services including cupping, gua sha, moxibustion, Chinese herbal medicine, menopause treatment, IBS treatment, and stress management. Greenville SC.

${BASE_URL}/services/alternative-medicine-practitioner-services
Alternative medicine practitioner services hub. 46 functional medicine services including ozone therapy, hormone testing, thyroid treatment, autoimmune disease treatment, and nutritional counseling. Greenville SC.

## Individual Service Pages (130 total)

`;

for (const svc of allServices) {
  const extra = svcCatContext[svc.name] || "Part of IHP's integrative approach combining acupuncture, Chinese medicine, and functional medicine under Dr. William Hendry, DAOM.";
  llms += `${BASE_URL}/services/${svc.slug}\n${svc.name} in Greenville, SC. ${extra} Integrative Health Partners: (864) 365-6156.\n\n`;
}

llms += `## Conditions We Treat

${BASE_URL}/conditions
Conditions hub page. Overview of 30 health conditions treated with acupuncture and functional medicine at Integrative Health Partners in Greenville, SC.

${BASE_URL}/conditions/pain-and-musculoskeletal
Pain & Musculoskeletal conditions category. Includes back pain, sciatica, fibromyalgia, neuropathy, sports injuries, and joint pain treatment.

${BASE_URL}/conditions/neurological-mental-health
Neurological & Mental Health category. Includes anxiety, depression, insomnia, PTSD, and brain fog treatment with acupuncture.

${BASE_URL}/conditions/hormonal-womens-health
Hormonal & Women's Health category. Includes fertility support, PCOS, menopause, perimenopause, and hormone imbalance treatment.

${BASE_URL}/conditions/digestive-immune
Digestive & Immune Health category. Includes IBS, leaky gut, food sensitivities, autoimmune disease, Hashimoto's, and adrenal fatigue treatment.

`;

for (const cond of conditions) {
  llms += `${BASE_URL}/conditions/${cond.slug}\n${cond.name} treatment in Greenville, SC. Acupuncture and functional medicine approach by Dr. William Hendry at Integrative Health Partners.\n\n`;
}

llms += `## Blog Posts\n\n`;
for (const post of liveBlogPosts) {
  const cleanExc = post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "").substring(0, 200) : "";
  llms += `${BASE_URL}/blog/${post.slug}\n${post.title}. ${cleanExc}\n\n`;
}

llms += `## Location & Service Area

Primary location: 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609
Service area: Greenville, Taylors, Travelers Rest, Mauldin, Simpsonville, Greer, Spartanburg, and greater Upstate South Carolina.

## Key Differentiators

- Dr. Hendry holds hospital privileges at Prisma Health (9 years) — rare for an acupuncturist
- Co-author of 3-year Prisma Emergency Department opioid alternative study
- DAOM degree from East West College of Natural Medicine (highest academic credential in field)
- NCCAOM board-certified since August 6, 2009 (valid through August 31, 2029)
- 5 peer-reviewed publications, 52 citations
- Member: American Academy of Ozone Therapy (AAOT)
- In-house professional-grade herbal pharmacy
- Injection therapy certified
- Active SC License ACUP141, FL License AP2646
`;

writeFileSync(path.join(DIST, "llms.txt"), llms, "utf8");
console.log("  ✓ llms.txt");

/* ─── _REDIRECTS (Netlify) ─────────────────────────────────────────────────── */

const redirectLines: string[] = [
  "# Proxy /admin to Railway server (must be first — before catch-all)",
  "/admin  https://ihp-greenville-website-production.up.railway.app/admin  200",
  "/admin/*  https://ihp-greenville-website-production.up.railway.app/admin/:splat  200",
  "",
  "# 410 Gone — permanently retired blog posts",
];
for (const slug of BLOG_410S) {
  redirectLines.push(`${slug}  /410.html  410`);
}
redirectLines.push("");
redirectLines.push("# 301 redirect — digestive-issues → ibs-gut-issues");
redirectLines.push("/conditions/digestive-issues  /conditions/ibs-gut-issues  301");
redirectLines.push("");
redirectLines.push("# 301 redirects — foundational link campaign anchor URLs (Mar 2026)");
redirectLines.push("# Backlinks were built to old/wrong slugs — redirect to correct pages to recover link equity");
redirectLines.push("/services/acupuncture  /services/acupuncture-therapy  301");
redirectLines.push("/services/dry-needling  /services/dry-needling-therapy  301");
redirectLines.push("/services/acupuncture-injection-therapy  /services/biopuncture-therapy  301");
redirectLines.push("/services/integrative-functional-medicine  /services/integrative-medicine-consultation  301");
redirectLines.push("/services/body-contour  /services/cosmetic-acupuncture  301");
redirectLines.push("");
redirectLines.push("# 404 catch-all");
redirectLines.push("/*  /404.html  404");

writeFileSync(path.join(DIST, "_redirects"), redirectLines.join("\n") + "\n", "utf8");
console.log("  ✓ _redirects");

/* ─── COPY STATIC ASSETS ───────────────────────────────────────────────────── */

console.log("\n── Static assets ──");
cpSync(PUBLIC, DIST, { recursive: true, force: true });
console.log("  ✓ public/ → dist/");

if (existsSync(ASSETS)) {
  const assetDest = path.join(DIST, "assets");
  mkdirSync(assetDest, { recursive: true });
  cpSync(ASSETS, assetDest, { recursive: true, force: true });
  console.log("  ✓ attached_assets/ → dist/assets/");
}

/* ─── WEBP IMAGE OPTIMIZATION ──────────────────────────────────────────────── */

console.log("\n── WebP image optimization ──");
for (const jpg of WEBP_IMAGES) {
  const src  = path.join(DIST, jpg);
  const dest = path.join(DIST, jpg.replace(".jpg", ".webp"));
  if (!existsSync(src)) { console.warn(`  WARN: ${src} not found, skipping`); continue; }
  try {
    execFileSync("magick", [src, "-resize", "800x>", "-quality", "45", dest]);
    const kb = Math.round(statSync(dest).size / 1024);
    console.log(`  ✓ ${jpg.replace(".jpg", ".webp")} → ${kb}KB`);
  } catch (e) {
    console.warn(`  WARN: magick failed for ${jpg}: ${(e as Error).message}`);
  }
}

/* ─── SUMMARY ──────────────────────────────────────────────────────────────── */

function countFiles(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}
const total = countFiles(DIST);
console.log(`\n${"─".repeat(50)}`);
console.log(`✅ Build complete — ${total} files in dist/`);
console.log(`${"─".repeat(50)}\n`);
