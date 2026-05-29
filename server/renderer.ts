import { categoryDefinitions, allServices, serviceMap, categoryMap, NAP, BASE_URL, getConditionCategorySEO, getConditionPageSEO, injectSEOIntoHTML, coreServiceParents } from "./seo";
import { conditions, conditionCategories, conditionMap, conditionCategoryMap } from "./conditions";
import { serviceContentMap } from "./services-content";
import { getBlogSiteLinks, getServiceBlogLinks, getConditionBlogLinks } from "./blog-crosslinks";
import { BLOG_301S, BLOG_410S } from "./blog-redirects";
import { autoLink } from "./auto-linker";
import type { BlogPost } from "@shared/schema";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

/* Cache-bust: embed MD5 of style.css so browsers re-fetch on every deploy.
   Uses process.cwd() — works in both ESM and CommonJS (Railway CJS bundle). */
const CSS_HASH = (() => {
  try {
    const css = readFileSync(join(process.cwd(), "public/css/style.css"));
    return createHash("md5").update(css).digest("hex").slice(0, 8);
  } catch {
    return Date.now().toString(36);
  }
})();

const createSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ============================================================
   SVG Icons (inline, no external dependency)
   ============================================================ */
const icons = {
  phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.05 1.19 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  mapPin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><polyline points="6 9 12 15 18 9"/></svg>`,
  star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;vertical-align:middle"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  leaf: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.82 21C6.38 21 9 20.62 10.5 20C13 19 15 17 15.5 14C16 11 17 8 22 6c0 5-2 8-5 10s-5 4.5-5 6"/></svg>`,
  activity: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  award: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  externalLink: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  anchor: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg>`,
  book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  globe: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
};

/* ============================================================
   HTML Head (with SEO placeholders — injected by SEO middleware)
   ============================================================ */
function renderHead(title = "Integrative Health Partners | Greenville, SC", desc = "Functional medicine & acupuncture in Greenville, SC. Root-cause testing, Chinese herbs, integrative care. Dr. Hendry, DAOM. Call (864) 365-6156.", canonicalUrl?: string, extraSchemas?: object[]): string {
  const canonicalHref = canonicalUrl ?? BASE_URL;
  const schemaScripts = extraSchemas?.map(s => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n") ?? "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.svg" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${canonicalHref}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalHref}" />
  <meta property="og:image" content="${BASE_URL}/images/dr-hendry.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${BASE_URL}/images/dr-hendry.webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="/css/style.css?v=${CSS_HASH}" fetchpriority="high" />
  <link rel="stylesheet" href="/css/style.css?v=${CSS_HASH}" />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" /></noscript>${schemaScripts ? "\n" + schemaScripts : ""}
</head>`;
}

/* ============================================================
   Navigation
   ============================================================ */
function renderNav(transparent = false): string {
  const navClass = transparent ? "nav transparent" : "nav opaque";
  return `<nav id="main-nav" class="${navClass}" aria-label="Main navigation">
  <div class="nav__inner">
    <a href="/" class="nav__logo" aria-label="Integrative Health Partners — Home">
      <img src="/favicon.svg" alt="Integrative Health Partners logo" class="nav__logo-img" width="44" height="44" />
      <span class="nav__logo-name">Integrative Health Partners</span>
    </a>

    <div class="nav__links" role="list">
      <a href="/" class="nav__link" role="listitem">Home</a>

      <div class="nav__dropdown" role="listitem">
        <button class="nav__dropdown-btn" aria-haspopup="true" aria-expanded="false">
          Services
          <span class="nav__dropdown-chevron">${icons.chevronDown}</span>
        </button>
        <div class="nav__dropdown-menu nav__dropdown-menu--wide4" role="menu">
          <div class="nav__dropdown-grid nav__dropdown-grid--4col">
            <div class="nav__dropdown-col nav__dropdown-col--divider">
              <span class="nav__dropdown-col-label">Needling</span>
              <a href="/services/acupuncture-therapy/" class="nav__dropdown-item" role="menuitem">Acupuncture Therapy</a>
              <a href="/services/dry-needling-therapy/" class="nav__dropdown-item" role="menuitem">Dry Needling</a>
              <a href="/services/electroacupuncture/" class="nav__dropdown-item" role="menuitem">Electroacupuncture</a>
              <a href="/services/medical-acupuncture/" class="nav__dropdown-item" role="menuitem">Medical Acupuncture</a>
              <a href="/services/auricular-acupuncture/" class="nav__dropdown-item" role="menuitem">Auricular Acupuncture</a>
              <a href="/services/scalp-acupuncture/" class="nav__dropdown-item" role="menuitem">Scalp Acupuncture</a>
              <a href="/services/fertility-acupuncture/" class="nav__dropdown-item" role="menuitem">Fertility Acupuncture</a>
              <a href="/services/acupuncture-for-anxiety/" class="nav__dropdown-item" role="menuitem">Acupuncture for Anxiety</a>
              <a href="/services/acupuncture-for-migraines/" class="nav__dropdown-item" role="menuitem">Acupuncture for Migraines</a>
              <a href="/services/biopuncture-therapy/" class="nav__dropdown-item" role="menuitem">Biopuncture Therapy</a>
              <a href="/services/prolotherapy/" class="nav__dropdown-item" role="menuitem">Prolotherapy</a>
            </div>
            <div class="nav__dropdown-col nav__dropdown-col--divider">
              <span class="nav__dropdown-col-label">Body &amp; Pain</span>
              <a href="/services/back-pain-treatment/" class="nav__dropdown-item" role="menuitem">Back Pain Treatment</a>
              <a href="/services/neck-pain-treatment/" class="nav__dropdown-item" role="menuitem">Neck Pain Treatment</a>
              <a href="/services/knee-pain-treatment/" class="nav__dropdown-item" role="menuitem">Knee Pain Treatment</a>
              <a href="/services/sciatica-treatment/" class="nav__dropdown-item" role="menuitem">Sciatica Treatment</a>
              <a href="/services/shoulder-pain-treatment/" class="nav__dropdown-item" role="menuitem">Shoulder Pain Treatment</a>
              <a href="/services/hip-pain-treatment/" class="nav__dropdown-item" role="menuitem">Hip Pain Treatment</a>
              <a href="/services/fibromyalgia-treatment/" class="nav__dropdown-item" role="menuitem">Fibromyalgia Treatment</a>
              <a href="/services/neuropathy-treatment/" class="nav__dropdown-item" role="menuitem">Neuropathy Treatment</a>
              <a href="/services/sports-injury-treatment/" class="nav__dropdown-item" role="menuitem">Sports Injury Treatment</a>
              <a href="/services/trigger-point-therapy/" class="nav__dropdown-item" role="menuitem">Trigger Point Therapy</a>
            </div>
            <div class="nav__dropdown-col nav__dropdown-col--divider">
              <span class="nav__dropdown-col-label">Chinese Medicine</span>
              <a href="/services/cupping-therapy/" class="nav__dropdown-item" role="menuitem">Cupping Therapy</a>
              <a href="/services/gua-sha-treatment/" class="nav__dropdown-item" role="menuitem">Gua Sha</a>
              <a href="/services/moxibustion-therapy/" class="nav__dropdown-item" role="menuitem">Moxibustion</a>
              <a href="/services/chinese-herbal-medicine/" class="nav__dropdown-item" role="menuitem">Chinese Herbal Medicine</a>
              <a href="/services/custom-herbal-formulations/" class="nav__dropdown-item" role="menuitem">Custom Herbal Formulations</a>
              <a href="/services/herbal-consultation/" class="nav__dropdown-item" role="menuitem">Herbal Consultation</a>
              <a href="/services/herb-drug-interaction-consultation/" class="nav__dropdown-item" role="menuitem">Herb-Drug Consultation</a>
              <a href="/services/ibs-treatment/" class="nav__dropdown-item" role="menuitem">IBS Treatment</a>
              <a href="/services/natural-anxiety-treatment/" class="nav__dropdown-item" role="menuitem">Natural Anxiety Treatment</a>
              <a href="/services/insomnia-treatment/" class="nav__dropdown-item" role="menuitem">Insomnia Treatment</a>
            </div>
            <div class="nav__dropdown-col">
              <span class="nav__dropdown-col-label">Functional Medicine</span>
              <a href="/functional-medicine-greenville-sc/" class="nav__dropdown-item nav__dropdown-item--primary" role="menuitem">About Functional Medicine</a>
              <a href="/services/functional-medicine-consultation/" class="nav__dropdown-item" role="menuitem">Consultation</a>
              <a href="/services/hormone-testing/" class="nav__dropdown-item" role="menuitem">Hormone Testing</a>
              <a href="/services/thyroid-testing/" class="nav__dropdown-item" role="menuitem">Thyroid Testing</a>
              <a href="/services/adrenal-fatigue-treatment/" class="nav__dropdown-item" role="menuitem">Adrenal Fatigue Treatment</a>
              <a href="/services/gut-health-testing/" class="nav__dropdown-item" role="menuitem">Gut Health Testing</a>
              <a href="/services/food-sensitivity-testing/" class="nav__dropdown-item" role="menuitem">Food Sensitivity Testing</a>
              <a href="/services/leaky-gut-treatment/" class="nav__dropdown-item" role="menuitem">Leaky Gut Treatment</a>
              <a href="/services/functional-medicine-testing/" class="nav__dropdown-item" role="menuitem">Functional Medicine Testing</a>
              <a href="/services/weight-loss-support/" class="nav__dropdown-item" role="menuitem">Weight Loss Support</a>
              <a href="/services/long-covid-treatment/" class="nav__dropdown-item" role="menuitem">Long COVID Treatment</a>
              <a href="/services/chronic-fatigue-treatment/" class="nav__dropdown-item" role="menuitem">Chronic Fatigue Treatment</a>
              <a href="/services/autoimmune-disease-treatment/" class="nav__dropdown-item" role="menuitem">Autoimmune Disease Treatment</a>
              <a href="/services/ozone-therapy/" class="nav__dropdown-item" role="menuitem">Ozone Therapy</a>
              <a href="/services/infrared-sauna-therapy/" class="nav__dropdown-item" role="menuitem">Infrared Sauna Therapy</a>
              <a href="/services/nutritional-counseling/" class="nav__dropdown-item" role="menuitem">Nutritional Counseling</a>
              <a href="/services/body-contour/" class="nav__dropdown-item" role="menuitem">Body Contouring</a>
            </div>
          </div>
          <a href="/services/" class="nav__dropdown-item nav__dropdown-item--cta" role="menuitem" style="display:block;text-align:center;margin-top:0.25rem">â†’ View All Services</a>
        </div>
      </div>

      <div class="nav__dropdown" role="listitem">
        <button class="nav__dropdown-btn" aria-haspopup="true" aria-expanded="false">
          Conditions We Treat
          <span class="nav__dropdown-chevron">${icons.chevronDown}</span>
        </button>
        <div class="nav__dropdown-menu nav__dropdown-menu--wide" role="menu">
          <div class="nav__dropdown-grid">
            <div class="nav__dropdown-col">
              <a href="/conditions/back-pain/" class="nav__dropdown-item" role="menuitem">Back Pain</a>
              <a href="/conditions/neck-pain/" class="nav__dropdown-item" role="menuitem">Neck Pain</a>
              <a href="/conditions/knee-pain/" class="nav__dropdown-item" role="menuitem">Knee Pain</a>
              <a href="/conditions/hip-pain/" class="nav__dropdown-item" role="menuitem">Hip Pain</a>
              <a href="/conditions/shoulder-pain/" class="nav__dropdown-item" role="menuitem">Shoulder Pain</a>
              <a href="/conditions/sciatica/" class="nav__dropdown-item" role="menuitem">Sciatica</a>
              <a href="/conditions/headaches-migraines/" class="nav__dropdown-item" role="menuitem">Headaches &amp; Migraines</a>
              <a href="/conditions/fibromyalgia/" class="nav__dropdown-item" role="menuitem">Fibromyalgia</a>
              <a href="/conditions/neuropathy/" class="nav__dropdown-item" role="menuitem">Neuropathy</a>
              <a href="/conditions/sports-injuries/" class="nav__dropdown-item" role="menuitem">Sports Injuries</a>
            </div>
            <div class="nav__dropdown-col">
              <a href="/conditions/anxiety-stress/" class="nav__dropdown-item" role="menuitem">Anxiety &amp; Stress</a>
              <a href="/conditions/depression/" class="nav__dropdown-item" role="menuitem">Depression</a>
              <a href="/conditions/insomnia/" class="nav__dropdown-item" role="menuitem">Insomnia</a>
              <a href="/conditions/ptsd/" class="nav__dropdown-item" role="menuitem">PTSD</a>
              <a href="/conditions/brain-fog/" class="nav__dropdown-item" role="menuitem">Brain Fog</a>
              <a href="/conditions/fertility/" class="nav__dropdown-item" role="menuitem">Fertility Support</a>
              <a href="/conditions/pcos/" class="nav__dropdown-item" role="menuitem">PCOS</a>
              <a href="/conditions/menopause/" class="nav__dropdown-item" role="menuitem">Menopause</a>
              <a href="/conditions/hormone-imbalance/" class="nav__dropdown-item" role="menuitem">Hormone Imbalance</a>
              <a href="/conditions/perimenopause/" class="nav__dropdown-item" role="menuitem">Perimenopause</a>
            </div>
            <div class="nav__dropdown-col">
              <a href="/conditions/ibs-gut-issues/" class="nav__dropdown-item" role="menuitem">IBS &amp; Gut Issues</a>
              <a href="/conditions/chronic-fatigue/" class="nav__dropdown-item" role="menuitem">Chronic Fatigue</a>
              <a href="/conditions/autoimmune-disease/" class="nav__dropdown-item" role="menuitem">Autoimmune Disease</a>
              <a href="/conditions/hashimotos/" class="nav__dropdown-item" role="menuitem">Hashimoto's</a>
              <a href="/conditions/thyroid-issues/" class="nav__dropdown-item" role="menuitem">Thyroid Issues</a>
              <a href="/conditions/food-sensitivities/" class="nav__dropdown-item" role="menuitem">Food Sensitivities</a>
              <a href="/conditions/leaky-gut/" class="nav__dropdown-item" role="menuitem">Leaky Gut</a>
              <a href="/conditions/adrenal-fatigue/" class="nav__dropdown-item" role="menuitem">Adrenal Fatigue</a>
              <a href="/conditions/chronic-illness/" class="nav__dropdown-item" role="menuitem">Chronic Illness</a>
              <a href="/conditions/weight-issues/" class="nav__dropdown-item" role="menuitem">Weight Issues</a>
            </div>
          </div>
          <a href="/conditions/" class="nav__dropdown-item nav__dropdown-item--cta" role="menuitem" style="display:block;text-align:center;margin-top:0.25rem">â†’ View All Conditions</a>
        </div>
      </div>

      <div class="nav__dropdown" role="listitem">
        <button class="nav__dropdown-btn" aria-haspopup="true" aria-expanded="false">
          About
          <span class="nav__dropdown-chevron">${icons.chevronDown}</span>
        </button>
        <div class="nav__dropdown-menu" role="menu">
          <a href="/about/" class="nav__dropdown-item nav__dropdown-item--primary" role="menuitem">About Integrative Health Partners</a>
          <a href="/dr-hendry/" class="nav__dropdown-item" role="menuitem">Dr. William Hendry, DAOM</a>
        </div>
      </div>

      <a href="/blog/" class="nav__link" role="listitem">Blog</a>
      <a href="/contact/" class="nav__link" role="listitem">Contact</a>
    </div>

    <a href="tel:${NAP.phoneRaw}" class="nav__cta">${icons.phone} ${NAP.phone}</a>

    <button class="nav__hamburger" id="nav-hamburger" aria-label="Toggle mobile menu" aria-expanded="false" aria-controls="nav-mobile">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div id="nav-mobile" class="nav__mobile" role="dialog" aria-label="Mobile navigation">
  <div class="nav__mobile-section">Navigation</div>
  <a href="/" class="nav__mobile-link">Home</a>
  <a href="/blog/" class="nav__mobile-link">Blog</a>

  <div class="nav__mobile-section">Services</div>
  <a href="/services/acupuncture-therapy/" class="nav__mobile-sublink">Acupuncture Therapy</a>
  <a href="/services/dry-needling-therapy/" class="nav__mobile-sublink">Dry Needling</a>
  <a href="/services/electroacupuncture/" class="nav__mobile-sublink">Electroacupuncture</a>
  <a href="/services/medical-acupuncture/" class="nav__mobile-sublink">Medical Acupuncture</a>
  <a href="/services/auricular-acupuncture/" class="nav__mobile-sublink">Auricular Acupuncture</a>
  <a href="/services/scalp-acupuncture/" class="nav__mobile-sublink">Scalp Acupuncture</a>
  <a href="/services/fertility-acupuncture/" class="nav__mobile-sublink">Fertility Acupuncture</a>
  <a href="/services/acupuncture-for-anxiety/" class="nav__mobile-sublink">Acupuncture for Anxiety</a>
  <a href="/services/acupuncture-for-migraines/" class="nav__mobile-sublink">Acupuncture for Migraines</a>
  <a href="/services/biopuncture-therapy/" class="nav__mobile-sublink">Biopuncture Therapy</a>
  <a href="/services/prolotherapy/" class="nav__mobile-sublink">Prolotherapy</a>
  <a href="/services/back-pain-treatment/" class="nav__mobile-sublink">Back Pain Treatment</a>
  <a href="/services/neck-pain-treatment/" class="nav__mobile-sublink">Neck Pain Treatment</a>
  <a href="/services/knee-pain-treatment/" class="nav__mobile-sublink">Knee Pain Treatment</a>
  <a href="/services/sciatica-treatment/" class="nav__mobile-sublink">Sciatica Treatment</a>
  <a href="/services/shoulder-pain-treatment/" class="nav__mobile-sublink">Shoulder Pain Treatment</a>
  <a href="/services/hip-pain-treatment/" class="nav__mobile-sublink">Hip Pain Treatment</a>
  <a href="/services/fibromyalgia-treatment/" class="nav__mobile-sublink">Fibromyalgia Treatment</a>
  <a href="/services/neuropathy-treatment/" class="nav__mobile-sublink">Neuropathy Treatment</a>
  <a href="/services/sports-injury-treatment/" class="nav__mobile-sublink">Sports Injury Treatment</a>
  <a href="/services/trigger-point-therapy/" class="nav__mobile-sublink">Trigger Point Therapy</a>
  <a href="/services/cupping-therapy/" class="nav__mobile-sublink">Cupping Therapy</a>
  <a href="/services/gua-sha-treatment/" class="nav__mobile-sublink">Gua Sha</a>
  <a href="/services/moxibustion-therapy/" class="nav__mobile-sublink">Moxibustion</a>
  <a href="/services/chinese-herbal-medicine/" class="nav__mobile-sublink">Chinese Herbal Medicine</a>
  <a href="/services/custom-herbal-formulations/" class="nav__mobile-sublink">Custom Herbal Formulations</a>
  <a href="/services/herbal-consultation/" class="nav__mobile-sublink">Herbal Consultation</a>
  <a href="/services/herb-drug-interaction-consultation/" class="nav__mobile-sublink">Herb-Drug Consultation</a>
  <a href="/services/ibs-treatment/" class="nav__mobile-sublink">IBS Treatment</a>
  <a href="/services/natural-anxiety-treatment/" class="nav__mobile-sublink">Natural Anxiety Treatment</a>
  <a href="/services/insomnia-treatment/" class="nav__mobile-sublink">Insomnia Treatment</a>
  <a href="/functional-medicine-greenville-sc/" class="nav__mobile-sublink" style="font-weight:600">About Functional Medicine</a>
  <a href="/services/functional-medicine-consultation/" class="nav__mobile-sublink">Consultation</a>
  <a href="/services/hormone-testing/" class="nav__mobile-sublink">Hormone Testing</a>
  <a href="/services/thyroid-testing/" class="nav__mobile-sublink">Thyroid Testing</a>
  <a href="/services/adrenal-fatigue-treatment/" class="nav__mobile-sublink">Adrenal Fatigue Treatment</a>
  <a href="/services/gut-health-testing/" class="nav__mobile-sublink">Gut Health Testing</a>
  <a href="/services/food-sensitivity-testing/" class="nav__mobile-sublink">Food Sensitivity Testing</a>
  <a href="/services/leaky-gut-treatment/" class="nav__mobile-sublink">Leaky Gut Treatment</a>
  <a href="/services/functional-medicine-testing/" class="nav__mobile-sublink">Functional Medicine Testing</a>
  <a href="/services/weight-loss-support/" class="nav__mobile-sublink">Weight Loss Support</a>
  <a href="/services/long-covid-treatment/" class="nav__mobile-sublink">Long COVID Treatment</a>
  <a href="/services/chronic-fatigue-treatment/" class="nav__mobile-sublink">Chronic Fatigue Treatment</a>
  <a href="/services/autoimmune-disease-treatment/" class="nav__mobile-sublink">Autoimmune Disease Treatment</a>
  <a href="/services/ozone-therapy/" class="nav__mobile-sublink">Ozone Therapy</a>
  <a href="/services/infrared-sauna-therapy/" class="nav__mobile-sublink">Infrared Sauna Therapy</a>
  <a href="/services/nutritional-counseling/" class="nav__mobile-sublink">Nutritional Counseling</a>
  <a href="/services/" class="nav__mobile-sublink">â†’ View All Services</a>

  <div class="nav__mobile-section">Conditions We Treat</div>
  <a href="/conditions/back-pain/" class="nav__mobile-sublink">Back Pain</a>
  <a href="/conditions/neck-pain/" class="nav__mobile-sublink">Neck Pain</a>
  <a href="/conditions/knee-pain/" class="nav__mobile-sublink">Knee Pain</a>
  <a href="/conditions/hip-pain/" class="nav__mobile-sublink">Hip Pain</a>
  <a href="/conditions/shoulder-pain/" class="nav__mobile-sublink">Shoulder Pain</a>
  <a href="/conditions/sciatica/" class="nav__mobile-sublink">Sciatica</a>
  <a href="/conditions/headaches-migraines/" class="nav__mobile-sublink">Headaches &amp; Migraines</a>
  <a href="/conditions/fibromyalgia/" class="nav__mobile-sublink">Fibromyalgia</a>
  <a href="/conditions/neuropathy/" class="nav__mobile-sublink">Neuropathy</a>
  <a href="/conditions/sports-injuries/" class="nav__mobile-sublink">Sports Injuries</a>
  <a href="/conditions/anxiety-stress/" class="nav__mobile-sublink">Anxiety &amp; Stress</a>
  <a href="/conditions/depression/" class="nav__mobile-sublink">Depression</a>
  <a href="/conditions/insomnia/" class="nav__mobile-sublink">Insomnia</a>
  <a href="/conditions/ptsd/" class="nav__mobile-sublink">PTSD</a>
  <a href="/conditions/brain-fog/" class="nav__mobile-sublink">Brain Fog</a>
  <a href="/conditions/fertility/" class="nav__mobile-sublink">Fertility Support</a>
  <a href="/conditions/pcos/" class="nav__mobile-sublink">PCOS</a>
  <a href="/conditions/menopause/" class="nav__mobile-sublink">Menopause</a>
  <a href="/conditions/hormone-imbalance/" class="nav__mobile-sublink">Hormone Imbalance</a>
  <a href="/conditions/perimenopause/" class="nav__mobile-sublink">Perimenopause</a>
  <a href="/conditions/ibs-gut-issues/" class="nav__mobile-sublink">IBS &amp; Gut Issues</a>
  <a href="/conditions/chronic-fatigue/" class="nav__mobile-sublink">Chronic Fatigue</a>
  <a href="/conditions/autoimmune-disease/" class="nav__mobile-sublink">Autoimmune Disease</a>
  <a href="/conditions/hashimotos/" class="nav__mobile-sublink">Hashimoto's</a>
  <a href="/conditions/thyroid-issues/" class="nav__mobile-sublink">Thyroid Issues</a>
  <a href="/conditions/food-sensitivities/" class="nav__mobile-sublink">Food Sensitivities</a>
  <a href="/conditions/leaky-gut/" class="nav__mobile-sublink">Leaky Gut</a>
  <a href="/conditions/adrenal-fatigue/" class="nav__mobile-sublink">Adrenal Fatigue</a>
  <a href="/conditions/chronic-illness/" class="nav__mobile-sublink">Chronic Illness</a>
  <a href="/conditions/weight-issues/" class="nav__mobile-sublink">Weight Issues</a>
  <a href="/conditions/" class="nav__mobile-sublink">â†’ View All Conditions</a>

  <div class="nav__mobile-section">About</div>
  <a href="/about/" class="nav__mobile-sublink">About Integrative Health Partners</a>
  <a href="/dr-hendry/" class="nav__mobile-sublink">Dr. William Hendry, DAOM</a>
  <a href="/contact/" class="nav__mobile-sublink">Contact &amp; Directions</a>

  <a href="tel:${NAP.phoneRaw}" class="nav__mobile-cta">${icons.phone} Call ${NAP.phone}</a>
</div>`;
}

/* ============================================================
   Breadcrumbs
   ============================================================ */
type BreadcrumbItem = { name: string; href?: string };
function renderBreadcrumbs(items: BreadcrumbItem[]): string {
  const all = [{ name: "Home", href: "/" }, ...items];
  return `<nav aria-label="Breadcrumb" class="breadcrumbs">
    ${all.map((item, i) => {
      const isLast = i === all.length - 1;
      if (isLast) return `<span aria-current="page">${item.name}</span>`;
      return `<a href="${item.href}">${item.name}</a><span class="breadcrumbs__sep" aria-hidden="true">/</span>`;
    }).join("")}
  </nav>`;
}

/* ============================================================
   Footer
   ============================================================ */
function renderFooter(): string {
  return `<footer>
  <div class="container">
    <div class="footer__grid">
      <div>
        <div class="footer__logo">
          <img src="/favicon.svg" alt="Integrative Health Partners logo" class="footer__logo-img" width="48" height="48" />
          <span class="footer__logo-name">Integrative Health Partners</span>
        </div>
        <p class="footer__tagline">Trusted acupuncture &amp; functional medicine in Greenville, SC. Compassionate, evidence-based care for your whole health.</p>
      </div>

      <div>
        <p class="footer__col-title">Contact &amp; Location</p>
        <div class="footer__contact-list">
          <div class="footer__contact-row">${icons.mapPin}<span>319 Wade Hampton Blvd, Ste A<br>Greenville, SC 29609</span></div>
          <div class="footer__contact-row">${icons.phone}<a href="tel:${NAP.phoneRaw}" class="footer__contact-link">${NAP.phone}</a></div>
          <div class="footer__contact-row">${icons.mail}<a href="mailto:${NAP.email}" class="footer__contact-link">${NAP.email}</a></div>
          <div class="footer__contact-row">${icons.clock}<span>Mon—Fri 9am—5pm</span></div>
        </div>
      </div>

      <div>
        <p class="footer__col-title">Services</p>
        <div class="footer__links">
          <a href="/services/acupuncturist-services/" class="footer__link">Acupuncturist Services</a>
          <a href="/services/acupuncture-clinic-services/" class="footer__link">Acupuncture Clinic Services</a>
          <a href="/services/chinese-medicine-clinic-services/" class="footer__link">Chinese Medicine Clinic Services</a>
          <a href="/services/functional-medicine-services/" class="footer__link">Functional Medicine Services</a>
          <a href="/services/" class="footer__link">â†’ View All 130+ Services</a>
          <a href="/blog/" class="footer__link">Health Blog</a>
        </div>
      </div>

      <div>
        <p class="footer__col-title">About</p>
        <div class="footer__links">
          <a href="/about/" class="footer__link">About Our Practice</a>
          <a href="/dr-hendry/" class="footer__link">Dr. William Hendry</a>
          <a href="/contact/" class="footer__link">Contact &amp; Directions</a>
          <a href="https://share.google/TYarboIHpqlhU6odK" target="_blank" rel="noopener noreferrer" class="footer__link">â­ Leave a Google Review</a>
        </div>
      </div>

      <div>
        <p class="footer__col-title">Conditions We Treat</p>
        <div class="footer__links">
          <a href="/conditions/pain-and-musculoskeletal/" class="footer__link">Pain &amp; Musculoskeletal</a>
          <a href="/conditions/neurological-mental-health/" class="footer__link">Neurological &amp; Mental Health</a>
          <a href="/conditions/hormonal-womens-health/" class="footer__link">Hormonal &amp; Women's Health</a>
          <a href="/conditions/digestive-immune/" class="footer__link">Digestive &amp; Immune</a>
          <a href="/conditions/" class="footer__link">View All Conditions</a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <p>&copy; ${new Date().getFullYear()} Integrative Health Partners. All rights reserved.</p>
      <p>319 Wade Hampton Blvd, Ste A, Greenville, SC 29609 &nbsp;&bull;&nbsp; <a href="tel:${NAP.phoneRaw}" style="color:inherit">${NAP.phone}</a></p>
      <p style="margin-top:0.5rem;font-size:0.75rem">
        <a href="/privacy/" style="color:inherit;text-decoration:underline">Privacy Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="/disclaimer/" style="color:inherit;text-decoration:underline">Medical Disclaimer</a>
      </p>
      <p style="margin-top:0.5rem;font-size:0.7rem;opacity:0.6">Site by <a href="https://www.platinumpartnersolutions.com" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">Platinum Partner Solutions</a></p>
    </div>
  </div>
</footer>`;
}

/* ============================================================
   Star row
   ============================================================ */
function starRow(n = 5): string {
  return Array(n).fill(icons.star).join("");
}

/* ============================================================
   HOME PAGE
   ============================================================ */
export function renderHome(): string {
  const featuredServices = [
    { name: "Functional Medicine", slug: "functional-medicine-consultation", icon: icons.activity, text: "Advanced testing — nutrient levels, hormones, food reactions — to uncover what traditional labs miss. No one-size-fits-all plans. Dr. Hendry starts by listening to your whole health story, then builds a step-by-step plan unique to your body." },
    { name: "Injection Therapy", slug: "prolotherapy", icon: icons.shield, text: "Prolotherapy, biopuncture, and perineural injection therapy to stimulate natural tissue repair in damaged joints, ligaments, and tendons. An evidence-based alternative to surgery or long-term pain medications for musculoskeletal conditions." },
    { name: "Acupuncture Therapy", slug: "acupuncture-therapy", icon: icons.leaf, text: "Precise needle placement guided by Dr. Hendry's 25 years of expertise in traditional Chinese diagnostic methods to relieve acute and chronic pain, restore nervous system balance, and address root causes rather than symptoms alone." },
    { name: "Chinese Herbal Medicine", slug: "chinese-herbal-medicine", icon: icons.leaf, text: "Customized herbal protocols combining traditional Chinese formulas with standardized Western botanical extracts. All herbs are third-party tested for purity and potency — dispensed from our in-house pharmacy, same day." },
    { name: "Ozone Sauna Therapy", slug: "ozone-therapy", icon: icons.globe, text: "Medical-grade ozone protocols delivered through infrared saunas that boost immune function, enhance detoxification, increase cellular energy production, and accelerate recovery from chronic fatigue, fibromyalgia, and immune disorders." },
    { name: "Electroacupuncture", slug: "electroacupuncture", icon: icons.activity, text: "Dr. Hendry adds therapeutic electrical frequencies to acupuncture points to accelerate healing and block pain signals more effectively — stimulating nerve regeneration for conditions like neuropathy and chronic pain." },
  ];

  const testimonials = [
    { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal. I am working out at the gym everyday again. My Focus is so much better as well. Also all my back and neck pain is gone. His care truly feels like getting my life back. I strongly recommend Dr. Hendry and Integrative Health Partners.", author: "Danny Pyatt", date: "March 2026" },
    { text: "Dr. Hendry spent a long time going over my particular medical situation and explaining his recommendations for getting my immune system back on track. I received acupuncture and supplements to start my treatment. I'm very excited about getting healthy again and have every confidence in Dr. Hendry's approach and treatment plan.", author: "Cam Norden", date: "July 2025" },
    { text: "Dr Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds. After reading a book about natural salt I saw in his office, I have been using natural salt — it has eliminated my chronic headaches.", author: "Karen Hill", date: "April 2025" },
    { text: "Dr. Hendry is so informative and truly listens to all of your concerns. Definitely steps away from normal western medicine. So excited to see where this journey takes me!", author: "Calla Fanton", date: "April 2025" },
    { text: "Dr. Hendry really takes the time to listen to why I'm seeking his help. He explains and shows me what muscles and bones have been affected by my injury. I love his calm demeanor. He asks what seems to be working and what's not before each treatment!", author: "Diane Thoma", date: "April 2024" },
    { text: "Getting acupuncture is the highlight of my week! I've learned more from Dr. Hendry than ANY medical professional. He is extremely knowledgeable at what he does! I could not recommend him and Integrative Health Partners more!", author: "Meagan McClaran", date: "April 2022" },
    { text: "I have bad arthritis and bone spurs in my knees and was referred to them by one of my friends. I could hardly walk when I started seeing him and now I am back to running with no pain at all. He is very informative when explaining the treatment.", author: "Spencer Hughes", date: "April 2022" },
    { text: "Dr. Hendry is the best, he has been the only one who has been able to help me alleviate my back pain.", author: "Gabriela Riveron", date: "April 2024" },
    { text: "I am so glad to find the peri-neural therapy here to help heal nerve damage. My pain level decreased significantly after my first treatment.", author: "Laura Getty", date: "April 2023" },
    { text: "It's pretty amazing how you can get instant relief from chronic pains from Acupuncture. Doctor Hendry's knowledge of the human body never ceases to amaze me.", author: "R. McClaran", date: "April 2023" },
    { text: "I can't express how awesome Dr. Hendry is! He keeps me on the road running lots and lots of miles. He is a joy to visit every 3 weeks with his own personal touch. His office staff is also very pleasant to deal with. Recommend his services to anyone that has any type of physical issues! In reality, 5 stars are not enough.", author: "Brooks Smith", date: "April 2020" },
    { text: "I was struggling with adductor and hamstring issues for years, stopping me from running. I tried this place as a last ditch effort and am glad I did. After a consultation it was decided to try a 'wet needling' therapy — it saved my running career.", author: "Corey Coll", date: "April 2022" },
    { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
    { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V", date: "April 2020" },
    { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
    { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
    { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
    { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
    { text: "Great experience, will definitely come back again.", author: "Mike Lo", date: "April 2015" },
  ];

  const homeFAQs = [
    { q: "What conditions does Dr. Hendry treat?", a: "Dr. Hendry treats chronic pain, headaches, digestive problems, hormone imbalances, autoimmune conditions, chronic fatigue, fibromyalgia, and unexplained symptoms that haven't responded to conventional treatments. His 25 years of Chinese medicine experience and functional medicine training help address root causes rather than just symptoms. Each person's situation is different, so results vary." },
    { q: "What is functional medicine and how does it work with acupuncture?", a: "Functional medicine uses advanced lab testing to find hidden causes of chronic illness like nutrient deficiencies, hormone imbalances, and food sensitivities that regular blood work misses. When combined with acupuncture, we can treat both the underlying biochemical problems and energy blockages, giving you faster and more complete healing." },
    { q: "Does acupuncture hurt?", a: "Most people are surprised that acupuncture is virtually painless. We use hair-thin needles that are much smaller than injection needles. You might feel a tiny pinch when the needle goes in, followed by a dull ache or tingling sensation that means the treatment is working. Many patients find acupuncture so relaxing they fall asleep during treatment. Everyone's pain tolerance is different." },
    { q: "How quickly will I see results?", a: "Some patients notice improvements within the first few treatments, while others take several weeks. Acute conditions often respond faster than chronic problems you've had for years. Dr. Hendry monitors your progress and adjusts treatment as needed. Results vary based on individual conditions." },
    { q: "How is this different from regular medical care?", a: "Regular medicine often focuses on managing symptoms with medications. Dr. Hendry combines traditional Chinese medicine with functional medicine to find underlying causes — like nutrient deficiencies, hormone imbalances, or toxin exposure — that standard tests might miss. His approach works alongside your current medical care, not instead of it." },
    { q: "What is Ozone Sauna Therapy?", a: "Ozone sauna therapy combines medical-grade ozone gas with infrared heat to boost your immune system and help your body detoxify naturally. You sit in a sauna while ozone is delivered around your body (not inhaled), which increases oxygen levels in your tissues, fights infections, and reduces inflammation. It's particularly helpful for chronic fatigue, fibromyalgia, immune disorders, and recovery from illness. Sessions last 20—30 minutes and most people feel energized and relaxed afterward." },
    { q: "Are you accepting new patients?", a: "Yes, Dr. Hendry is currently accepting new patients. New patient appointments include initial consultations that last 60—90 minutes. Call (864) 365-6156 to schedule your comprehensive evaluation." },
    { q: "Do you accept insurance?", a: "We are a cash-pay practice and do not bill insurance directly. This allows us to spend more time with each patient and provide personalized care without insurance restrictions. We provide detailed receipts that you can submit to your insurance for possible reimbursement. Many patients find that our comprehensive approach saves money long-term by addressing root causes and reducing the need for multiple specialists." },
  ];

  const conditionHighlights = [
    { name: "Back Pain", slug: "back-pain", cat: "Pain & Musculoskeletal" },
    { name: "Sciatica", slug: "sciatica", cat: "Pain & Musculoskeletal" },
    { name: "Anxiety & Stress", slug: "anxiety-stress", cat: "Neurological & Mental Health" },
    { name: "Insomnia", slug: "insomnia", cat: "Neurological & Mental Health" },
    { name: "Fertility Support", slug: "fertility", cat: "Hormonal & Women's Health" },
    { name: "Hormone Imbalance", slug: "hormone-imbalance", cat: "Hormonal & Women's Health" },
    { name: "IBS & Gut Issues", slug: "ibs-gut-issues", cat: "Digestive & Immune" },
    { name: "Chronic Fatigue", slug: "chronic-fatigue", cat: "Digestive & Immune" },
    { name: "Headaches & Migraines", slug: "headaches-migraines", cat: "Neurological & Mental Health" },
    { name: "Fibromyalgia", slug: "fibromyalgia", cat: "Pain & Musculoskeletal" },
    { name: "Autoimmune Disease", slug: "autoimmune-disease", cat: "Digestive & Immune" },
    { name: "Thyroid Issues", slug: "thyroid-issues", cat: "Digestive & Immune" },
  ];

  return `${renderHead("Functional Medicine & Injection Therapy | IHP Greenville SC", "Functional medicine, injection therapy & acupuncture in Greenville, SC. Root-cause testing, prolotherapy, Chinese medicine. Dr. William Hendry, DAOM, Prisma Health. Call (864) 365-6156.")}
<body data-page="home">
  ${renderNav(true)}

  <main>
    <!-- Hero -->
    <section class="hero" aria-label="Welcome to Integrative Health Partners">
      <div class="hero__bg">
        <video class="hero__video" autoplay muted loop playsinline preload="none" poster="/images/clinic/exterior.webp" aria-hidden="true">
          <source src="/images/hero-video.mp4" type="video/mp4" />
        </video>
        <div class="hero__overlay" aria-hidden="true"></div>
      </div>
      <div class="hero__content">
        <h1 class="hero__h1 reveal font-display">
          <a href="/services/functional-medicine-consultation/" style="color:inherit;text-decoration:none"><em>Functional Medicine</em></a> &amp; Injection Therapy in Greenville, SC
        </h1>
        <p class="hero__subtitle reveal reveal-delay-2">
          Greenville's most credentialed integrative health practice — <a href="/services/functional-medicine-consultation/" class="hero__text-link">functional medicine</a>, <a href="/services/prolotherapy/" class="hero__text-link">injection therapy</a>, and <a href="/services/acupuncture-therapy/" class="hero__text-link">acupuncture</a>. Led by Dr. William Hendry, DAOM, with hospital privileges at Prisma Health and 5 peer-reviewed publications.
        </p>
        <div class="hero__stars reveal reveal-delay-3">
          <div class="hero__star-row" aria-label="5 star rating">${starRow()}</div>
          <span class="hero__rating">5.0 Google Rating &middot; 19 Reviews</span>
        </div>
        <div class="reveal reveal-delay-3" style="display:flex;justify-content:center;">
          <a href="tel:${NAP.phoneRaw}" class="btn btn-white btn-lg">${icons.phone} Call (864) 365-6156</a>
        </div>
      </div>
      <div class="hero__scroll" aria-hidden="true">
        <div class="hero__scroll-mouse"><div class="hero__scroll-dot"></div></div>
      </div>
    </section>

    <!-- Section 1: E-E-A-T Credentials -->
    <section class="section section--card" aria-labelledby="credentials-heading">
      <div class="container">
        <div style="display:grid;grid-template-columns:300px 1fr;gap:3.5rem;align-items:start" class="provider-section-grid">

          <!-- Portrait card -->
          <div class="reveal" style="display:flex;flex-direction:column;gap:0">
            <div style="border-radius:0.875rem;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);border:1px solid var(--color-border)">
              <img src="/images/dr-hendry.jpg"
                alt="Dr. William Hendry, DAOM — Board-Certified Acupuncturist and Functional Medicine Practitioner in Greenville, SC"
                style="width:100%;height:auto;display:block;object-fit:cover"
                width="300" height="360" loading="lazy" />
              <div style="background:var(--color-card);padding:1.125rem 1.25rem;border-top:1px solid var(--color-border)">
                <p style="font-family:var(--font-heading);font-weight:700;font-size:1.0625rem;color:var(--color-foreground);margin:0 0 0.2rem">Dr. William Hendry</p>
                <p style="font-size:0.8125rem;color:var(--color-primary);font-weight:600;margin:0 0 0.5rem">DAOM Â· Dipl. O.M. (NCBAHM)Â®</p>
                <p style="font-size:0.75rem;color:var(--color-muted);margin:0;line-height:1.5">Board-Certified Acupuncturist<br>Functional Medicine Practitioner<br>Greenville, SC</p>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.375rem;margin-top:1rem">
              <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--color-muted);padding:0.5rem 0.75rem;background:var(--color-card);border:1px solid var(--color-border);border-radius:0.5rem">
                ${icons.shield}<span>SC License <strong>ACUP141</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--color-muted);padding:0.5rem 0.75rem;background:var(--color-card);border:1px solid var(--color-border);border-radius:0.5rem">
                ${icons.award}<span>NCBAHM <strong>#114498</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--color-muted);padding:0.5rem 0.75rem;background:var(--color-card);border:1px solid var(--color-border);border-radius:0.5rem">
                ${icons.check}<span>NPI <strong>1417184045</strong></span>
              </div>
            </div>
          </div>

          <!-- Bio / credentials -->
          <div>
            <span class="section-label reveal">Meet Your Provider</span>
            <h2 class="section-title reveal reveal-delay-1" id="credentials-heading">Dr. William Hendry, DAOM</h2>

            <div class="highlight-box highlight-box--compact reveal reveal-delay-2" style="margin-top:1.25rem">
              <strong>${icons.award} Prisma Health — 3-Year Opioid Alternative Study</strong>
              <p style="margin:0.5rem 0 0;font-size:0.9375rem;line-height:1.65">
                Dr. Hendry co-authored a landmark 3-year Emergency Department study at Prisma Health on needling techniques as non-opioid alternatives for acute pain management — earning 9 years of hospital privileges, a distinction extremely rare among acupuncturists.
              </p>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.875rem;margin:1.75rem 0 2rem">
              ${[
                `25+ years clinical experience in <a href="/services/acupuncture-therapy/" class="text-link">acupuncture</a> and integrative medicine`,
                "5 peer-reviewed research publications, 54 citations",
                "NCBAHM board-certified Diplomate of Oriental Medicine",
                "Injection Therapy certified Â· AAOT member",
                "In-house professional herbal pharmacy on site"
              ].map(item => `
              <div class="check-item reveal"><span>${icons.checkCircle}</span><span>${item}</span></div>`).join("")}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1rem" class="reveal">
              <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Schedule a Consultation</a>
              <a href="/dr-hendry/" class="btn btn-outline">Full Credentials</a>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Patient Stories Section -->
    <section class="section section--dark" aria-labelledby="testimonials-heading">
      <div class="container">
        <div style="max-width:48rem;margin-inline:auto">
          <div class="text-center" style="margin-bottom:2rem">
            <span class="section-label section-label--white reveal">Patient Stories</span>
            <h2 class="section-title section-title--white reveal reveal-delay-1" id="testimonials-heading">What Greenville Patients Say</h2>
            <p class="section-sub section-sub--white reveal reveal-delay-2" style="max-width:40rem;margin-inline:auto">Every review below is a verified Google review from a real patient.</p>
          </div>
          <div class="testimonials__carousel" aria-live="polite">
            ${testimonials.map((t, i) => `
            <div class="testimonial${i === 0 ? " active" : ""}" role="article" aria-label="Testimonial from ${t.author}" itemscope itemtype="https://schema.org/Review">
              <div class="testimonial__stars" aria-label="5 stars">${starRow()}</div>
              <blockquote class="testimonial__text" itemprop="reviewBody">"${t.text}"</blockquote>
              <p class="testimonial__author">— <span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${t.author}</span></span>${t.date ? ` &middot; <time>${t.date}</time>` : ""}</p>
            </div>`).join("")}
          </div>
          <div class="testimonials__controls" aria-label="Testimonial navigation">
            <button id="tm-prev" class="tm-btn" aria-label="Previous testimonial">${icons.arrowLeft}</button>
            <div class="tm-dots">
              ${testimonials.map((_, i) => `<button class="tm-dot${i === 0 ? " active" : ""}" aria-label="Go to testimonial ${i + 1}"></button>`).join("")}
            </div>
            <button id="tm-next" class="tm-btn" aria-label="Next testimonial">${icons.arrowRight}</button>
          </div>
          <div class="text-center" style="margin-top:1.5rem">
            <a href="https://share.google/TYarboIHpqlhU6odK" target="_blank" rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:0.375rem;font-family:var(--font-heading);font-size:0.9375rem;font-weight:600;color:var(--color-secondary);text-decoration:underline;text-underline-offset:3px">
              See all reviews on Google ${icons.externalLink}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Philosophy / Approach Section -->
    <section class="section section--botanical" aria-labelledby="approach-heading" style="background-image:linear-gradient(rgba(252,249,244,0.83),rgba(252,249,244,0.83)),url('/images/clinic/entrance-wide.jpg');background-size:cover;background-position:center">
      <!-- Botanical corner: drooping branch top-right -->
      <svg width="340" height="420" viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;top:0;right:0;pointer-events:none;opacity:0.09;z-index:0">
        <path d="M340 0 C300 30 260 55 220 90 C180 125 155 165 140 210 C125 255 128 300 122 380" stroke="#2F814A" stroke-width="1.5"/>
        <ellipse cx="270" cy="52" rx="30" ry="13" fill="#2F814A" transform="rotate(-38,270,52)"/>
        <ellipse cx="228" cy="98" rx="32" ry="14" fill="#2F814A" transform="rotate(-12,228,98)"/>
        <ellipse cx="194" cy="145" rx="28" ry="12" fill="#2F814A" transform="rotate(22,194,145)"/>
        <ellipse cx="168" cy="195" rx="29" ry="13" fill="#2F814A" transform="rotate(-28,168,195)"/>
        <ellipse cx="150" cy="248" rx="26" ry="11" fill="#2F814A" transform="rotate(14,150,248)"/>
        <ellipse cx="138" cy="302" rx="22" ry="10" fill="#2F814A" transform="rotate(-20,138,302)"/>
        <ellipse cx="300" cy="28" rx="18" ry="8" fill="#2F814A" transform="rotate(18,300,28)"/>
        <ellipse cx="248" cy="74" rx="19" ry="8" fill="#2F814A" transform="rotate(52,248,74)"/>
        <ellipse cx="208" cy="122" rx="18" ry="8" fill="#2F814A" transform="rotate(-48,208,122)"/>
        <ellipse cx="179" cy="172" rx="17" ry="7" fill="#2F814A" transform="rotate(38,179,172)"/>
        <circle cx="284" cy="44" r="4.5" fill="#2F814A" opacity="0.6"/>
        <circle cx="216" cy="110" r="4" fill="#2F814A" opacity="0.6"/>
        <circle cx="182" cy="158" r="3.5" fill="#2F814A" opacity="0.6"/>
      </svg>
      <div class="container" style="position:relative;z-index:1">
        <div style="max-width:56rem;margin-inline:auto">
          <div class="text-center" style="margin-bottom:3rem">
            <span class="section-label reveal">Our Philosophy</span>
            <h2 class="section-title reveal reveal-delay-1" id="approach-heading">Integrative Functional Medicine in Greenville, SC</h2>
            <p class="section-sub reveal reveal-delay-2" style="max-width:48rem;margin-inline:auto">
              The highest purpose of medicine should be to restore your body to optimum function — not just mask symptoms. Eastern traditions have long operated from this position, and now this idea is being popularized in the West as Functional Medicine. By combining these complementary approaches, we integrate the best of science and tradition to help you restore and maintain optimum health.
            </p>
          </div>

          <div class="grid-auto md:grid-3" style="margin-bottom:2.5rem">
            ${[
              {
                num: "01",
                title: "Finding Your Root Cause — Personally",
                body: "No one-size-fits-all plans here. Dr. Hendry starts by listening to your whole health story — where you've been, what you've tried, what hasn't worked, and how symptoms actually affect your everyday life. Then we use advanced testing — nutrient levels, hormones, food reactions, and more — to uncover what traditional labs might miss."
              },
              {
                num: "02",
                title: "A Step-by-Step Plan, Just for You",
                body: "Once we have the full picture, you and Dr. Hendry create a practical, step-by-step action plan unique to your body and your goals: tailored nutrition changes, targeted supplements only if they match what you need, strategies for sleep and stress, and clear explanations for each step — why it matters, and what to expect."
              },
              {
                num: "03",
                title: "Why This Matters",
                body: "People in Greenville choose integrative functional medicine because it helps uncover the true sources of pain, fatigue, and stubborn symptoms — and gives you a clear path forward, not just a new prescription. If you want to finally know why you feel this way and what you can do about it, Dr. Hendry's personalized approach can help."
              },
            ].map((item, i) => `
            <div class="reveal content-section" style="transition-delay:${i * 0.1}s;background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.75rem">
              <div style="font-family:var(--font-heading);font-size:2rem;font-weight:800;color:var(--color-primary-light);line-height:1;margin-bottom:0.875rem">${item.num}</div>
              <h3 style="font-family:var(--font-heading);font-size:1.0625rem;font-weight:700;color:var(--color-foreground);margin-bottom:0.75rem">${item.title}</h3>
              <p style="color:var(--color-muted);font-size:0.9375rem;line-height:1.7;margin:0">${item.body}</p>
            </div>`).join("")}
          </div>

          <div class="text-center reveal">
            <a href="/services/functional-medicine-consultation/" class="btn btn-primary">Learn About Functional Medicine ${icons.arrowRight}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Conditions We Treat -->
    <section class="section section--botanical" aria-labelledby="conditions-heading" style="background-image:linear-gradient(rgba(252,249,244,0.83),rgba(252,249,244,0.83)),url('/images/clinic/treatment-room-2.jpg');background-size:cover;background-position:center">
      <!-- Botanical corner: rising branch bottom-left -->
      <svg width="310" height="400" viewBox="0 0 310 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;bottom:0;left:0;pointer-events:none;opacity:0.09;z-index:0">
        <path d="M0 400 C35 355 75 318 110 278 C145 238 172 195 195 150 C218 105 228 65 248 0" stroke="#2F814A" stroke-width="1.5"/>
        <ellipse cx="48" cy="366" rx="30" ry="13" fill="#2F814A" transform="rotate(32,48,366)"/>
        <ellipse cx="88" cy="325" rx="32" ry="14" fill="#2F814A" transform="rotate(-18,88,325)"/>
        <ellipse cx="122" cy="283" rx="28" ry="12" fill="#2F814A" transform="rotate(14,122,283)"/>
        <ellipse cx="152" cy="240" rx="29" ry="13" fill="#2F814A" transform="rotate(-32,152,240)"/>
        <ellipse cx="178" cy="195" rx="26" ry="11" fill="#2F814A" transform="rotate(18,178,195)"/>
        <ellipse cx="202" cy="148" rx="24" ry="10" fill="#2F814A" transform="rotate(-22,202,148)"/>
        <ellipse cx="224" cy="100" rx="22" ry="9" fill="#2F814A" transform="rotate(12,224,100)"/>
        <ellipse cx="20" cy="384" rx="18" ry="8" fill="#2F814A" transform="rotate(-25,20,384)"/>
        <ellipse cx="68" cy="346" rx="19" ry="8" fill="#2F814A" transform="rotate(55,68,346)"/>
        <ellipse cx="105" cy="302" rx="18" ry="8" fill="#2F814A" transform="rotate(-45,105,302)"/>
        <ellipse cx="138" cy="260" rx="17" ry="7" fill="#2F814A" transform="rotate(40,138,260)"/>
        <circle cx="65" cy="335" r="4.5" fill="#2F814A" opacity="0.6"/>
        <circle cx="138" cy="270" r="4" fill="#2F814A" opacity="0.6"/>
        <circle cx="190" cy="170" r="3.5" fill="#2F814A" opacity="0.6"/>
      </svg>
      <div class="container" style="position:relative;z-index:1">
        <div class="text-center" style="margin-bottom:3rem">
          <span class="section-label reveal">What We Help With</span>
          <h2 class="section-title reveal reveal-delay-1" id="conditions-heading">Conditions We Treat in Greenville, SC</h2>
          <p class="section-sub reveal reveal-delay-2" style="max-width:44rem;margin-inline:auto">
            Dr. Hendry uses <a href="/services/acupuncture-therapy/" class="text-link">acupuncture</a>, functional medicine diagnostics, and Chinese herbal medicine to address 30+ conditions
            across pain, neurological, hormonal, and digestive health — identifying and treating root causes rather than managing symptoms.
          </p>
        </div>

        <div class="grid-auto md:grid-2 lg:grid-4" style="margin-bottom:2.5rem">
          ${[
            { name: "Pain & Joint Conditions", slug: "pain-and-musculoskeletal", count: 10, desc: "Back pain, sciatica, fibromyalgia, neuropathy, sports injuries" },
            { name: "Mental Health & Sleep", slug: "neurological-mental-health", count: 5, desc: "Anxiety, depression, insomnia, PTSD, brain fog" },
            { name: "Women's & Hormonal Health", slug: "hormonal-womens-health", count: 5, desc: "Fertility, PCOS, menopause, hormone imbalance, perimenopause" },
            { name: "Gut, Immune & Chronic Illness", slug: "digestive-immune", count: 10, desc: "IBS, leaky gut, autoimmune disease, chronic fatigue, Hashimoto's" },
          ].map((cat, i) => `
          <div class="reveal" style="transition-delay:${i * 0.08}s">
            <a href="/conditions/${cat.slug}/" class="cat-card">
              <div class="cat-card__header">
                <span class="cat-card__badge cat-card__badge--secondary">Conditions</span>
                <span class="cat-card__arrow">${icons.arrowRight}</span>
              </div>
              <h3 class="cat-card__title">${cat.name}</h3>
              <p class="cat-card__count">${cat.count} conditions</p>
              <p class="cat-card__desc">${cat.desc}</p>
            </a>
          </div>`).join("")}
        </div>

        <div class="grid-auto sm:grid-2 md:grid-3 lg:grid-4" style="margin-bottom:2rem">
          ${conditionHighlights.map((c, i) => `
          <div class="reveal" style="transition-delay:${Math.min(i * 0.04, 0.4)}s">
            <a href="/conditions/${c.slug}/" class="svc-list-link">
              <div class="svc-list-link__inner">
                <span class="svc-list-link__name">${c.name}</span>
                <span class="svc-list-link__arrow">${icons.arrowRight}</span>
              </div>
            </a>
          </div>`).join("")}
        </div>

        <div class="text-center reveal">
          <a href="/conditions/" class="btn btn-primary">View All 30+ Conditions ${icons.arrowRight}</a>
        </div>
      </div>
    </section>

    <!-- Section 3: Services -->
    <section class="section section--card" aria-labelledby="services-heading">
      <div class="container">
        <div class="text-center" style="margin-bottom:3rem">
          <span class="section-label reveal">Our Services</span>
          <h2 class="section-title reveal reveal-delay-1" id="services-heading">130+ Integrative Health Services in Greenville, SC</h2>
          <p class="section-sub reveal reveal-delay-2" style="max-width:44rem;margin-inline:auto">
            Four service categories — each with a dedicated hub page listing every available treatment.
            Guided by Dr. Hendry's 25+ years of clinical expertise and doctoral training.
          </p>
        </div>
        <div class="grid-auto md:grid-2 lg:grid-4" style="margin-bottom:3rem">
          ${categoryDefinitions.map((cat, i) => `
          <div class="reveal" style="transition-delay:${i * 0.08}s">
            <a href="/services/${cat.slug}/" class="cat-card">
              <div class="cat-card__header">
                <span class="cat-card__badge ${cat.isPrimary ? "cat-card__badge--primary" : "cat-card__badge--secondary"}">${cat.isPrimary ? "Primary" : "Specialty"}</span>
                <span class="cat-card__arrow">${icons.arrowRight}</span>
              </div>
              <h3 class="cat-card__title">${cat.name} Services</h3>
              <p class="cat-card__count">${cat.serviceNames.length} services</p>
              <p class="cat-card__desc">${cat.metaDescription.substring(0, 100)}â€¦</p>
            </a>
          </div>`).join("")}
        </div>

        <div class="text-center reveal" style="margin-bottom:2.5rem">
          <a href="/services/" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:0.5rem">
            View All 130+ Services ${icons.arrowRight}
          </a>
        </div>

        <div class="text-center" style="margin-bottom:1rem">
          <h3 class="font-heading" style="font-size:1rem;font-weight:600;color:var(--color-muted);margin-bottom:1.25rem">Popular Services</h3>
        </div>
        <div class="grid-auto md:grid-2 lg:grid-3" style="margin-bottom:2.5rem">
          ${featuredServices.map((svc, i) => `
          <div class="reveal" style="transition-delay:${i * 0.07}s">
            <a href="/services/${svc.slug}/" class="svc-overview-card">
              <div class="svc-overview-card__icon">${svc.icon}</div>
              <h3 class="svc-overview-card__title">${svc.name}</h3>
              <p class="svc-overview-card__text">${svc.text}</p>
            </a>
          </div>`).join("")}
        </div>
      </div>
    </section>

    <!-- Section 4: Why Choose IHP -->
    <section class="section section--primary" aria-labelledby="why-heading" style="background-image:linear-gradient(rgba(14,42,19,0.86),rgba(14,42,19,0.86)),url('/images/clinic/waiting-area.jpg');background-size:cover;background-position:center">
      <div class="container">
        <div style="max-width:56rem;margin-inline:auto;text-align:center">
          <span class="section-label section-label--white reveal">Why Integrative Health Partners?</span>
          <h2 class="section-title section-title--white reveal reveal-delay-1" id="why-heading">What Separates IHP from Other Greenville Practices</h2>
          <p class="section-sub section-sub--white reveal reveal-delay-2" style="margin-bottom:3rem">
            Credentials, research, and clinical experience that most integrative practices in the region simply cannot match.
          </p>

          <div class="grid-auto md:grid-2 lg:grid-2" style="margin-bottom:3rem;text-align:left">
            ${[
              { icon: icons.award, title: "Hospital-Level Clinical Credentials", body: "9 years of hospital privileges at Prisma Health — one of South Carolina's leading health systems — reflect the trust placed in Dr. Hendry's clinical judgment by the broader medical community." },
              { icon: icons.shield, title: "Published Opioid Alternative Research", body: "Co-author of a 3-year Prisma Health ER study examining needling as a non-opioid pain solution. 5 peer-reviewed publications and 54 citations across acupuncture, HRV biofeedback, and integrative oncology." },
              { icon: icons.leaf, title: "Doctoral Training + NCBAHM Certification", body: "Dr. Hendry's DAOM (East West College of Natural Medicine, 2008) represents the highest academic credential in acupuncture. NCBAHM board-certified (Cert. #114498), valid through August 2029." },
              { icon: icons.book, title: "In-House Herbal Pharmacy", body: "Full professional herbal pharmacy on site — custom formulas dispensed same-day, not referred out. Classical formulas, granule extracts, and single-herb preparations meet strict purity and potency standards." },
              { icon: icons.activity, title: "Full-Spectrum Integrative Therapies", body: "Acupuncture, dry needling, Chinese herbal medicine, functional medicine, ozone therapy, injection therapy (biopuncture), and nutritional counseling — all under one roof in Greenville, SC." },
              { icon: icons.heart, title: "Root-Cause, Whole-Person Approach", body: "No symptom suppression. Every patient begins with a comprehensive intake covering health history, diet, sleep, stress, and environment. Treatment plans are built on understanding, not assumption." },
            ].map(item => `
            <div class="reveal" style="background:rgba(255,255,255,0.08);border-radius:0.75rem;padding:1.5rem;text-align:left">
              <div style="color:var(--color-secondary);width:2rem;height:2rem;margin-bottom:0.875rem">${item.icon}</div>
              <h3 style="font-family:var(--font-heading);font-weight:700;font-size:1rem;color:#fff;margin-bottom:0.5rem">${item.title}</h3>
              <p style="color:rgba(255,255,255,0.8);font-size:0.9375rem;line-height:1.65;margin:0">${item.body}</p>
            </div>`).join("")}
          </div>
        </div>


      </div>
    </section>

    <!-- Office Photo Gallery -->
    <section class="section" aria-label="Inside Our Greenville Clinic">
      <div class="container">
        <div style="text-align:center;margin-bottom:2rem">
          <span class="section-label reveal">Our Clinic</span>
          <h2 class="section-title reveal reveal-delay-1">Inside Integrative Health Partners</h2>
          <p class="section-sub reveal reveal-delay-2">A welcoming, professional environment where traditional Eastern medicine meets evidence-based Western care.</p>
        </div>
        <div class="clinic-gallery reveal">
          <img src="/images/clinic/room1.jpg" alt="Acupuncture treatment room at Integrative Health Partners — treatment table, traditional Chinese physician art, and anatomical model" loading="lazy" width="600" height="260" />
          <img src="/images/clinic/pharmacy.jpg" alt="In-house herbal pharmacy at IHP Greenville stocked with professional-grade herbs, supplements, and botanical formulas" loading="lazy" width="600" height="260" />
          <img src="/images/clinic/hallway.jpg" alt="IHP clinic hallway with chalkboard listing Acupuncture, Chinese Herbs, and Functional Medicine — call 365-6156" loading="lazy" width="600" height="260" />
        </div>
      </div>
    </section>

    <!-- Section 5: FAQ -->
    <section class="section section--card" aria-labelledby="faq-heading">
      <div class="container">
        <div style="max-width:56rem;margin-inline:auto">
          <div class="text-center" style="margin-bottom:3rem">
            <span class="section-label reveal">Common Questions</span>
            <h2 class="section-title reveal reveal-delay-1" id="faq-heading">Frequently Asked Questions</h2>
          </div>
          ${homeFAQs.map(faq => `
          <div class="faq-item reveal">
            <button class="faq-btn" aria-expanded="false">
              ${faq.q}
              <span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span>
            </button>
            <div class="faq-body" role="region">
              <div class="faq-content">${faq.a}</div>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </section>

    <!-- Section 6: Local Trust Signals + NAP -->
    <section class="section" id="contact" aria-labelledby="contact-heading">
      <div class="container">
        <div class="two-col">
          <div>
            <span class="section-label reveal">Visit Us in Greenville, SC</span>
            <h2 class="section-title reveal reveal-delay-1" id="contact-heading">Schedule Your First Consultation</h2>
            <p style="color:var(--color-muted);line-height:1.75;margin:1.25rem 0 1.5rem" class="reveal reveal-delay-2">
              Our clinic is at 319 Wade Hampton Blvd, Ste A — just a few minutes east of downtown and North Main. We're conveniently close to Bob Jones University, Wade Hampton Lanes, and a quick drive from Greenville Memorial Hospital and the Stone Lake community.
            </p>
            <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.25rem" class="reveal reveal-delay-2">
              <div style="display:flex;align-items:flex-start;gap:0.75rem">
                <span style="color:var(--color-primary);flex-shrink:0;margin-top:0.125rem">${icons.mapPin}</span>
                <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.6;margin:0"><strong style="color:var(--color-foreground)">Near Everyday Greenville:</strong> Down the road from Community Tap, Cookout, Harris Teeter, Henry's Smokehouse — easy to reach from North Main, Overbrook, and Northwood Hills.</p>
              </div>
              <div style="display:flex;align-items:flex-start;gap:0.75rem">
                <span style="color:var(--color-primary);flex-shrink:0;margin-top:0.125rem">${icons.checkCircle}</span>
                <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.6;margin:0"><strong style="color:var(--color-foreground)">Ample Free Parking:</strong> Free and easy parking access right at our door — no meters, garages, or downtown traffic.</p>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:1.5rem">
              <div class="info-row reveal">
                <div class="info-icon">${icons.mapPin}</div>
                <div>
                  <div class="info-label">Office Address</div>
                  <div class="info-value">319 Wade Hampton Blvd, Ste A<br>Greenville, SC 29609</div>
                </div>
              </div>
              <div class="info-row reveal">
                <div class="info-icon">${icons.phone}</div>
                <div>
                  <div class="info-label">Phone</div>
                  <a href="tel:${NAP.phoneRaw}" class="info-value info-link">${NAP.phone}</a>
                </div>
              </div>
              <div class="info-row reveal">
                <div class="info-icon">${icons.mail}</div>
                <div>
                  <div class="info-label">Email</div>
                  <a href="mailto:${NAP.email}" class="info-value info-link">${NAP.email}</a>
                </div>
              </div>
              <div class="info-row reveal">
                <div class="info-icon">${icons.clock}</div>
                <div>
                  <div class="info-label">Office Hours</div>
                  <div class="info-value">Monday — Friday: 9:00 AM — 5:00 PM</div>
                </div>
              </div>
            </div>
            <div style="margin-top:2rem;display:flex;flex-wrap:wrap;gap:1rem" class="reveal">
              <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call to Schedule</a>
              <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="btn btn-outline">${icons.mapPin} Get Directions</a>
            </div>
          </div>
          <div class="reveal reveal-delay-2">
            <div class="map-wrap">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.4!2d-82.382482!3d34.862258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDUxJzQ0LjEiTiA4MsKwMjInNTcuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="600" height="400" style="border:0;width:100%;height:320px" allowfullscreen loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Integrative Health Partners location map"></iframe>
            </div>
            <div style="margin-top:1.5rem;background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.25rem">
              <p style="font-size:0.8125rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--color-muted);margin-bottom:0.75rem">Service Area</p>
              <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.65;margin:0">
                Greenville, Taylors, Travelers Rest, Greer, Mauldin, Simpsonville, Piedmont, Five Forks, North Greenville, and greater Upstate South Carolina.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CATEGORY PAGE
   ============================================================ */
export function renderCategory(catSlug: string): string | null {
  const cat = categoryMap.get(catSlug);
  if (!cat) return null;

  const catServices = cat.serviceNames.map(name => ({
    name,
    slug: createSlug(name),
  }));

  const otherCats = categoryDefinitions.filter(c => c.slug !== catSlug);

  const catPhotos: Record<string, { src: string; alt: string }> = {
    "acupuncturist-greenville-sc": { src: "/images/clinic/room2.jpg", alt: "Acupuncture treatment room at IHP Greenville — treatment table with meridian charts and TDP heat lamp" },
    "acupuncture-clinic-greenville-sc": { src: "/images/clinic/room3.jpg", alt: "Prepared acupuncture treatment table at Integrative Health Partners, Greenville SC" },
    "chinese-medicine-clinic-greenville-sc": { src: "/images/clinic/pharmacy.jpg", alt: "Full in-house herbal pharmacy at IHP — professional Chinese herbs, supplements, and botanical formulas" },
    "functional-medicine-greenville-sc": { src: "/images/clinic/products.jpg", alt: "Functional medicine, ozone therapy, and integrative wellness products available at IHP Greenville" },
  };
  const catPhoto = catPhotos[catSlug];

  const faqItems = [
    {
      q: `What ${cat.name.toLowerCase()} services do you offer in Greenville, SC?`,
      a: `At Integrative Health Partners, we offer ${cat.serviceNames.length} ${cat.name.toLowerCase()} services including ${cat.serviceNames.slice(0, 5).join(", ")}, and more. Dr. William Hendry has over 25 years of experience providing these treatments.`,
    },
    {
      q: `How do I schedule a ${cat.name.toLowerCase()} appointment?`,
      a: `Call us at (864) 365-6156. We're located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. New patients are always welcome.`,
    },
    {
      q: `Does Dr. Hendry accept insurance for ${cat.name.toLowerCase()} services?`,
      a: `Integrative Health Partners is a cash-pay practice and does not bill insurance directly. This allows Dr. Hendry to spend more time with each patient and provide genuinely personalized care. We provide itemized superbills you can submit to your insurance for potential out-of-network reimbursement. Call (864) 365-6156 to discuss.`,
    },
  ];

  return `${renderHead(cat.metaTitle, cat.metaDescription)}
<body data-page="category">
  ${renderNav(false)}

  <main class="page-top">
    <section class="section" aria-labelledby="cat-heading">
      <div class="container">
        ${renderBreadcrumbs([{ name: "Services", href: "/services" }, { name: `${cat.name} Services` }])}

        <div style="max-width:48rem;margin-bottom:3.5rem">
          ${cat.isPrimary ? `<span class="tag reveal">Primary GBP Category</span>` : `<span class="tag reveal">Specialty Services</span>`}
          <h1 class="section-title reveal reveal-delay-1" id="cat-heading" style="margin-top:0.875rem">
            ${cat.name} Services in Greenville, SC
          </h1>
          <p style="color:var(--color-muted);line-height:1.75;margin-top:1.25rem;font-size:1.0625rem" class="reveal reveal-delay-2">
            ${cat.metaDescription}
          </p>
          <div style="margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:1rem" class="reveal reveal-delay-3">
            <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
          </div>
        </div>

        ${catPhoto ? `
        <figure class="clinic-photo-card reveal" style="max-width:52rem;margin-bottom:2rem">
          <img src="${catPhoto.src}" alt="${catPhoto.alt}" loading="lazy" width="800" height="260" />
        </figure>` : ""}

        <!-- Service Grid -->
        <h2 class="font-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:1.25rem" id="services-list">
          All ${cat.name} Services (${catServices.length})
        </h2>
        <div class="grid-auto sm:grid-2 md:grid-3" style="margin-bottom:3rem">
          ${catServices.map((svc, i) => `
          <div class="reveal" style="transition-delay:${Math.min(i * 0.04, 0.4)}s">
            <a href="/services/${svc.slug}/" class="svc-list-link">
              <div class="svc-list-link__inner">
                <span class="svc-list-link__name">${svc.name}</span>
                <span class="svc-list-link__arrow">${icons.arrowRight}</span>
              </div>
            </a>
          </div>`).join("")}
        </div>

        <!-- CTA -->
        <div class="cta-subtle reveal" style="text-align:center;margin-bottom:4rem">
          <h2 class="font-display" style="font-size:1.75rem;margin-bottom:0.875rem">Ready to start your healing journey?</h2>
          <p style="color:var(--color-muted);margin-bottom:1.5rem;max-width:36rem;margin-inline:auto">
            Dr. Hendry is accepting new patients. Schedule your consultation today.
          </p>
          <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
        </div>

        <!-- FAQ -->
        <div style="max-width:56rem;margin-bottom:3rem">
          <h2 class="section-title reveal" style="margin-bottom:1.75rem">Frequently Asked Questions</h2>
          ${faqItems.map(faq => `
          <div class="faq-item reveal">
            <button class="faq-btn" aria-expanded="false">
              ${faq.q}
              <span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span>
            </button>
            <div class="faq-body">
              <div class="faq-content">${faq.a}</div>
            </div>
          </div>`).join("")}
        </div>

        <!-- Other Categories -->
        <div>
          <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;color:var(--color-muted);margin-bottom:1rem">Explore Our Other Service Areas</h2>
          <div class="grid-auto sm:grid-2 md:grid-3 lg:grid-3">
            ${otherCats.map(oc => `
            <a href="/services/${oc.slug}/" class="other-cat-card reveal">
              <div class="other-cat-card__title">${oc.name} Services</div>
              <div class="other-cat-card__count">${oc.serviceNames.length} services</div>
              <span class="other-cat-card__link">View services ${icons.arrowRight}</span>
            </a>`).join("")}
          </div>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   PER-PAGE REVIEW MAP
   Maps service and condition slugs to a single matched patient review.
   Renders as a testimonial block near the top of the page.
   ============================================================ */
const reviewMap: Record<string, { text: string; author: string; date: string }> = {
  // Acupuncture
  "acupuncture-therapy":            { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "acupuncture-treatment":          { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "medical-acupuncture":            { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "traditional-chinese-acupuncture":{ text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "electroacupuncture":             { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "dry-needling-therapy":           { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "trigger-point-dry-needling":     { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "prolotherapy":                   { text: "I was struggling with adductor and hamstring issues for years, stopping me from running. I tried this place as a last ditch effort and am glad I did. After a consultation it was decided to try a 'wet needling' therapy — it saved my running career.", author: "Corey Coll", date: "April 2022" },
  "acupuncture-for-anxiety":        { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "acupuncture-for-migraines":      { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "acupuncture-for-headaches":      { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "acupuncture-for-insomnia":       { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "acupuncture-for-stress-relief":  { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "fertility-acupuncture":          { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "cosmetic-acupuncture":           { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "facial-rejuvenation-acupuncture":{ text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "scalp-acupuncture":              { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "auricular-acupuncture":          { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "ear-acupuncture":                { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "laser-acupuncture":              { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "prenatal-acupuncture":           { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "pregnancy-acupuncture":          { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  // Pain
  "neck-pain-treatment":            { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "back-pain-treatment":            { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "lower-back-pain-treatment":      { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "chronic-back-pain-treatment":    { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "upper-back-pain-treatment":      { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "sciatica-treatment":             { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "sciatic-nerve-pain-treatment":   { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "joint-pain-treatment":           { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "arthritis-pain-treatment":       { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "knee-pain-treatment":            { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "hip-pain-treatment":             { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "shoulder-pain-treatment":        { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "fibromyalgia-treatment":         { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "chronic-pain-management":        { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "muscle-pain-treatment":          { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "neuropathy-treatment":           { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "peripheral-neuropathy-treatment":{ text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "sports-injury-treatment":        { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "frozen-shoulder-treatment":      { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "carpal-tunnel-treatment":        { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "plantar-fasciitis-treatment":    { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "tmj-treatment":                  { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "tmj-pain-relief":                { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "trigger-point-therapy":          { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  // Gut / Digestive
  "leaky-gut-treatment":            { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "ibs-treatment":                  { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "digestive-issues-treatment":     { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "digestive-health-treatment":     { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "gut-health-testing":             { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "acid-reflux-treatment":          { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "food-sensitivity-testing":       { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V.", date: "April 2020" },
  // Functional Medicine / Testing
  "functional-medicine-consultation":      { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "functional-medicine-testing":           { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "integrative-medicine-consultation":     { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "holistic-health-assessment":            { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "natural-medicine-consultation":         { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "comprehensive-blood-panel":             { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "functional-blood-chemistry-analysis":   { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "root-cause-analysis":                   { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V.", date: "April 2020" },
  "nutritional-deficiency-testing":        { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "inflammatory-marker-testing":           { text: "Dr. Hendry spent a long time going over my particular medical situation and explaining his recommendations for getting my immune system back on track. I received acupuncture and supplements to start my treatment.", author: "Cam Norden", date: "July 2025" },
  // Hormones / Women's Health
  "hormone-testing":                { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "hormonal-imbalance-treatment":   { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "thyroid-testing":                { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "thyroid-disorder-treatment":     { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "adrenal-testing":                { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "adrenal-fatigue-treatment":      { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "menopause-treatment":            { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "hot-flash-treatment":            { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "pms-treatment":                  { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "menstrual-pain-treatment":       { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "fertility-treatment":            { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "infertility-treatment":          { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  // Immune / Chronic
  "immune-system-support":          { text: "Dr. Hendry spent a long time going over my particular medical situation and explaining his recommendations for getting my immune system back on track. I received acupuncture and supplements to start my treatment. I'm very excited about getting healthy again.", author: "Cam Norden", date: "July 2025" },
  "autoimmune-disease-treatment":   { text: "Dr. Hendry spent a long time going over my particular medical situation and explaining his recommendations for getting my immune system back on track. I received acupuncture and supplements to start my treatment. I'm very excited about getting healthy again.", author: "Cam Norden", date: "July 2025" },
  "chronic-fatigue-treatment":      { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "fatigue-treatment":              { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "long-covid-treatment":           { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "post-covid-recovery":            { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "brain-fog-treatment":            { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  // Mental Health / Sleep
  "natural-anxiety-treatment":      { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "insomnia-treatment":             { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "sleep-disorder-treatment":       { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "stress-management":              { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "natural-depression-treatment":   { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  // Weight / Blood Sugar
  "weight-loss-support":            { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "blood-sugar-support":            { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "natural-diabetes-support":       { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "high-blood-pressure-support":    { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "metabolism-support":             { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  // Ozone / Detox
  "ozone-therapy":                  { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V.", date: "April 2020" },
  "medical-ozone-therapy":          { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V.", date: "April 2020" },
  "detoxification-therapy":         { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "heavy-metal-detox":              { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  // Condition pages
  "leaky-gut":          { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "ibs-gut-issues":     { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "chronic-fatigue":    { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "hormone-imbalance":  { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "thyroid-issues":     { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "hashimotos":         { text: "Dr. Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds.", author: "Karen Hill", date: "January 2025" },
  "adrenal-fatigue":    { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "arthritis":          { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "back-pain":          { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "neck-pain":          { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "sciatica":           { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "knee-pain":          { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "shoulder-pain":      { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "hip-pain":           { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "fibromyalgia":       { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "neuropathy":         { text: "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice.", author: "Margie Halley", date: "April 2015" },
  "anxiety-stress":     { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "depression":         { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "insomnia":           { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "pcos":               { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "perimenopause":      { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "menopause":          { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "weight-issues":      { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "autoimmune-disease": { text: "Dr. Hendry spent a long time going over my particular medical situation and explaining his recommendations for getting my immune system back on track. I received acupuncture and supplements to start my treatment. I'm very excited about getting healthy again.", author: "Cam Norden", date: "July 2025" },
  "brain-fog":          { text: "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal.", author: "Danny Pyatt", date: "March 2026" },
  "food-sensitivities": { text: "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine.", author: "Stuart M.", date: "April 2015" },
  "headaches-migraines":{ text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "fertility":          { text: "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I get acupuncture and love the results.", author: "Katlyn Garcia", date: "April 2022" },
  "ptsd":               { text: "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about.", author: "Catherine Hosack", date: "April 2015" },
  "sports-injuries":    { text: "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture.", author: "Michael F. McLeod", date: "April 2015" },
  "chronic-illness":    { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V.", date: "April 2020" },
  "lyme-disease":       { text: "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me.", author: "Tat V.", date: "April 2020" },
};

function renderPageReview(slug: string): string {
  const review = reviewMap[slug];
  if (!review) return "";
  return `
  <div class="reveal" style="background:var(--color-card);border-left:4px solid var(--color-primary);border-radius:0 0.5rem 0.5rem 0;padding:1.25rem 1.5rem;margin-bottom:2rem" itemscope itemtype="https://schema.org/Review">
    <div style="color:#F4A61C;font-size:1rem;letter-spacing:0.1em;margin-bottom:0.5rem" aria-label="5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    <blockquote style="margin:0;font-style:italic;color:var(--color-foreground);line-height:1.7;font-size:0.9375rem" itemprop="reviewBody">"${review.text}"</blockquote>
    <p style="margin:0.75rem 0 0;font-size:0.875rem;font-weight:600;color:var(--color-primary)">— <span itemprop="author">${review.author}</span>${review.date ? ` &middot; ${review.date}` : ""} &middot; <span style="font-weight:400;color:var(--color-muted)">Google Review</span></p>
  </div>`;
}

/* ============================================================
   SERVICE PAGE
   ============================================================ */
export function renderService(svcSlug: string): string | null {
  const service = serviceMap.get(svcSlug);
  if (!service) return null;

  const cat = categoryMap.get(service.categorySlug);
  if (!cat) return null;

  const baseSlug = svcSlug.replace(/-greenville-sc$/, "");
  const content = serviceContentMap.get(baseSlug);
  const svcCurrentUrl = `/services/${baseSlug}`;

  const relatedServices = content && content.relatedServiceSlugs && content.relatedServiceSlugs.length > 0
    ? content.relatedServiceSlugs
        .map(rs => serviceMap.get(rs))
        .filter((s): s is NonNullable<typeof s> => !!s)
        .slice(0, 5)
    : allServices
        .filter(s => s.categorySlug === service.categorySlug && s.slug !== svcSlug)
        .slice(0, 5);

  const faqItems = content
    ? content.faqs
    : [
        { q: `How does ${service.name} work?`, a: `${service.name} is an evidence-based treatment offered at Integrative Health Partners in Greenville, SC. Dr. Hendry conducts a thorough assessment to understand your individual health needs and creates a customized treatment protocol to address the root cause of your condition.` },
        { q: `How many ${service.name} sessions will I need?`, a: `The number of sessions depends on your specific condition and its chronicity. Acute conditions typically require 3—6 sessions, while chronic conditions may need 8—12 or more sessions. Dr. Hendry will outline a recommended treatment schedule during your initial consultation.` },
        { q: `Where is ${service.name} available in Greenville, SC?`, a: `${service.name} is available at Integrative Health Partners, located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156 to schedule your appointment with Dr. William Hendry.` },
      ];

  const conditionsLinksHtml = content && content.conditionsTreated.length > 0
    ? `<div style="margin-top:2.5rem;margin-bottom:2rem" class="reveal">
        <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1rem">Conditions Treated with ${service.name}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          ${content.conditionsTreated.map(ct => `<a href="/conditions/${ct.slug}/" class="tag tag--link">${ct.name}</a>`).join("")}
        </div>
      </div>`
    : "";

  const comparisonHtml = content && content.comparison
    ? `<div class="highlight-box reveal" style="margin-top:2rem;margin-bottom:2rem">
        <h3 class="font-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem">${content.comparison.title}</h3>
        <p style="color:var(--color-muted);line-height:1.75">${content.comparison.text}</p>
      </div>`
    : "";

  const researchHtml = content && content.research
    ? `<div class="reveal" style="margin-top:2rem;margin-bottom:2rem">
        <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1rem">Research & Evidence</h2>
        <p style="color:var(--color-muted);line-height:1.75">${autoLink(content.research, svcCurrentUrl)}</p>
      </div>`
    : "";

  const costHtml = content && content.costInfo
    ? `<div class="reveal" style="margin-top:2rem;margin-bottom:2rem">
        <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1rem">Cost & Insurance Information</h2>
        <p style="color:var(--color-muted);line-height:1.75">${content.costInfo}</p>
      </div>`
    : "";

  const timelineHtml = content && content.timeline && content.timeline.length > 0
    ? `<div class="reveal" style="margin-top:2rem;margin-bottom:2rem">
        <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1.25rem">Treatment Timeline</h2>
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${content.timeline.map((t, i) => `
          <div style="display:flex;gap:1rem;align-items:flex-start">
            <div style="min-width:2.5rem;height:2.5rem;border-radius:50%;background:var(--color-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.875rem">${i + 1}</div>
            <div><strong style="display:block;margin-bottom:0.25rem">${t.label}</strong><span style="color:var(--color-muted);line-height:1.65">${t.desc}</span></div>
          </div>`).join("")}
        </div>
      </div>`
    : "";

  const stepsHtml = content && content.howItWorksSteps && content.howItWorksSteps.length > 0
    ? `<div style="display:flex;flex-direction:column;gap:0.875rem;margin-bottom:2rem">
        ${content.howItWorksSteps.map(step => `<div class="check-item reveal">${icons.checkCircle}<span>${step}</span></div>`).join("")}
      </div>`
    : "";

  const openingHtml = autoLink(
    content
      ? content.opening.split("\n\n").map(p => `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.5rem" class="reveal">${p}</p>`).join("")
      : `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.5rem" class="reveal">At Integrative Health Partners in Greenville, SC, Dr. William Hendry provides expert ${service.name} as part of our comprehensive ${cat.name.toLowerCase()} services. Every treatment is personalized to your unique health history and therapeutic goals. Dr. Hendry draws on 25+ years of clinical experience and ongoing research to deliver the highest standard of integrative care.</p>`,
    svcCurrentUrl
  );

  const howItWorksHtml = content
    ? autoLink(`<h2 class="font-display reveal" style="font-size:1.75rem;margin-top:2.5rem;margin-bottom:1rem">How ${service.name} Works</h2>
       ${content.howItWorks.split("\n\n").map(p => `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.5rem" class="reveal">${p}</p>`).join("")}
       ${stepsHtml}`, svcCurrentUrl)
    : "";

  const firstApptHtml = content
    ? `<div class="highlight-box--compact reveal" style="margin-top:2rem;margin-bottom:2rem">
        <h3 class="font-heading" style="font-size:1.125rem;font-weight:600;margin-bottom:0.5rem">${icons.calendar} Your First Appointment</h3>
        <p style="color:var(--color-muted);line-height:1.65;font-size:0.9375rem">${autoLink(content.firstAppointment, svcCurrentUrl)}</p>
      </div>`
    : "";

  const whyDrHendryHtml = content
    ? `<div class="reveal" style="margin-top:2rem;margin-bottom:2rem">
        <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1rem">Why Dr. Hendry for ${service.name}</h2>
        <p style="color:var(--color-muted);line-height:1.75">${autoLink(content.whyDrHendry, svcCurrentUrl)}</p>
      </div>`
    : "";

  const photosHtml = content && content.photos && content.photos.length > 0
    ? `<div class="reveal" style="margin-top:2.5rem;margin-bottom:2rem">
        <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1.25rem">Inside Our ${service.name} Suite</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">
          ${content.photos.map(p => `
          <figure style="margin:0">
            <img src="${p.src}" alt="${p.alt}" loading="lazy" width="600" height="400" style="width:100%;height:220px;object-fit:cover;border-radius:0.5rem;display:block" />
            ${p.caption ? `<figcaption style="font-size:0.8125rem;color:var(--color-muted);margin-top:0.375rem;text-align:center">${p.caption}</figcaption>` : ""}
          </figure>`).join("")}
        </div>
      </div>`
    : "";

  return `${renderHead(service.metaTitle, service.metaDescription)}
<body data-page="service">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: `${cat.name} Services`, href: `/services/${cat.slug}` },
        ...(coreServiceParents[baseSlug] ? [{ name: coreServiceParents[baseSlug].name, href: `/services/${coreServiceParents[baseSlug].slug}` }] : []),
        { name: service.name },
      ])}

      <div class="main-sidebar">
        <article>
          <a href="/services/${cat.slug}/" class="tag tag--link" style="margin-bottom:1rem;display:inline-block">${cat.name} Services</a>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">${baseSlug === "functional-medicine-consultation" ? "Functional Medicine" : service.name} in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2rem" class="reveal reveal-delay-1">
            ${service.metaDescription}
          </p>

          ${renderPageReview(baseSlug)}
          ${openingHtml}
          ${howItWorksHtml}
          ${conditionsLinksHtml}
          ${comparisonHtml}
          ${researchHtml}
          ${costHtml}
          ${timelineHtml}
          ${firstApptHtml}
          ${whyDrHendryHtml}
          ${photosHtml}

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-top:2.5rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          ${faqItems.map(faq => `
          <div class="faq-item reveal">
            <button class="faq-btn" aria-expanded="false">
              ${faq.q}
              <span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span>
            </button>
            <div class="faq-body">
              <div class="faq-content">${faq.a}</div>
            </div>
          </div>`).join("")}

          ${relatedServices.length > 0 ? `
          <div style="margin-top:3rem">
            <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              Related ${cat.name} Services
            </h2>
            <div class="grid-auto sm:grid-2">
              ${relatedServices.map(rs => `
              <a href="/services/${rs.slug}/" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${rs.name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`).join("")}
            </div>
          </div>` : ""}

          ${(() => {
            const rawBlogLinks = getServiceBlogLinks(baseSlug, 6);
            const blogLinks = rawBlogLinks
              .map(b => {
                const key = `/blog/${b.slug}`;
                if (BLOG_410S.has(key)) return null;
                return { slug: b.slug, title: b.title, url: BLOG_301S[key] ?? `/blog/${b.slug}` };
              })
              .filter((b): b is { slug: string; title: string; url: string } => b !== null)
              .slice(0, 4);
            if (blogLinks.length === 0) return "";
            return `
          <div style="margin-top:3rem" class="reveal">
            <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              ${icons.leaf} From the IHP Blog
            </h2>
            <div style="display:flex;flex-direction:column;gap:0.625rem">
              ${blogLinks.map(b => `
              <a href="${b.url}" style="display:flex;align-items:center;gap:0.625rem;font-size:0.9375rem;color:var(--color-primary);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--color-border)" class="blog-cross-link">
                ${icons.arrowRight}<span>${b.title}</span>
              </a>`).join("")}
            </div>
          </div>`;
          })()}
        </article>

        <aside class="sidebar">
          <div class="cta-box">
            <h3 class="cta-box__title">Ready to Get Started?</h3>
            <p class="cta-box__text">Schedule your ${service.name} consultation with Dr. William Hendry today. New patients welcome.</p>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-white btn-full">${icons.phone} ${NAP.phone}</a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Why Choose Dr. Hendry?</p>
            <div class="check-list">
              <div class="check-item">${icons.check}<span>25+ years clinical experience</span></div>
              <div class="check-item">${icons.check}<span>NCBAHM board-certified</span></div>
              <div class="check-item">${icons.check}<span>Hospital privileges — Prisma Health</span></div>
              <div class="check-item">${icons.check}<span>5 research publications</span></div>
              <div class="check-item">${icons.check}<span>New patients welcome</span></div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.65;margin-bottom:0.75rem">
              319 Wade Hampton Blvd, Ste A<br>Greenville, SC 29609
            </p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">
              ${icons.mapPin} Get Directions
            </a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Browse ${cat.name} Services</p>
            ${cat.serviceNames.slice(0, 8).map(svcName => {
              const svcSl = createSlug(svcName);
              return `<a href="/services/${svcSl}/" class="sidebar-link">${svcName}</a>`;
            }).join("")}
            <a href="/services/${cat.slug}/" class="text-link" style="font-size:0.875rem;font-weight:500;display:block;margin-top:0.75rem">
              View all ${cat.serviceNames.length} services â†’
            </a>
          </div>
        </aside>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   BLOG INDEX
   ============================================================ */
function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function renderBlogIndex(posts: BlogPost[]): string {
  return `${renderHead("Health & Wellness Blog | Integrative Health Partners Greenville, SC", "Root-cause medicine articles from Dr. Hendry in Greenville, SC. Functional testing, acupuncture, Chinese herbs, and holistic health — evidence-based insights.")}
<body data-page="blog">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:5rem">
      ${renderBreadcrumbs([{ name: "Blog" }])}

      <div style="max-width:48rem;margin-bottom:3rem">
        <h1 class="section-title reveal">Health &amp; Wellness Blog</h1>
        <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-top:1rem" class="reveal reveal-delay-1">
          Insights on acupuncture, functional medicine, and natural health from Dr. William Hendry
          and the team at Integrative Health Partners in Greenville, SC.
        </p>
        <p style="font-size:0.9375rem;margin-top:0.875rem;color:var(--color-text)" class="reveal reveal-delay-2">
          Looking for care rather than reading? <a href="/services/functional-medicine-consultation/" style="color:var(--color-primary);font-weight:600;text-decoration:underline;text-underline-offset:3px">Book a Functional Medicine Consultation â†’</a>
        </p>
      </div>

      <div style="background:var(--color-primary-light);border-radius:0.75rem;padding:1.25rem 1.5rem;margin-bottom:2rem;display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;align-items:center" class="reveal">
        <span style="font-weight:700;color:var(--color-primary);white-space:nowrap">${icons.award} Classic Reads:</span>
        <a href="/blog/red-wine-for-health/" style="color:var(--color-primary);text-decoration:underline;text-underline-offset:3px">Red Wine for Heart Health</a>
        <a href="/blog/magnesium-the-master-commander/" style="color:var(--color-primary);text-decoration:underline;text-underline-offset:3px">Magnesium: The Master Commander</a>
        <a href="/blog/does-acupuncture-hurt/" style="color:var(--color-primary);text-decoration:underline;text-underline-offset:3px">Does Acupuncture Hurt?</a>
      </div>

      ${posts.length === 0 ? `
      <div style="text-align:center;padding:4rem 0;color:var(--color-muted)">
        <p style="font-size:1.125rem">No blog posts available yet. Check back soon!</p>
      </div>` : `
      <div class="grid-auto md:grid-2 lg:grid-3" id="blog-grid">
        ${posts.map((post, i) => {
          const excerpt = post.excerpt ? stripHtml(post.excerpt).substring(0, 180) : "";
          return `
          <article class="reveal" style="transition-delay:${Math.min(i * 0.06, 0.5)}s">
            <a href="/blog/${post.slug}/" class="blog-card">
              <div class="blog-card__meta">
                <span>${icons.calendar} ${formatDate(post.pubDate)}</span>
                ${post.creator ? `<span>${icons.user} ${post.creator}</span>` : ""}
              </div>
              <h2 class="blog-card__title">${post.title}</h2>
              ${excerpt ? `<p class="blog-card__excerpt">${excerpt}â€¦</p>` : ""}
              ${post.categories && post.categories.length > 0 ? `
              <div class="blog-card__tags">
                ${post.categories.slice(0, 3).map(c => `<span class="blog-card__tag">${c}</span>`).join("")}
              </div>` : ""}
              <span class="blog-card__more">Read more ${icons.arrowRight}</span>
            </a>
          </article>`;
        }).join("")}
      </div>`}
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   BLOG POST
   ============================================================ */
export function renderBlogPost(post: BlogPost): string {
  const excerpt = post.excerpt ? stripHtml(post.excerpt).substring(0, 160) : "";
  const shortTitle = (() => {
    const suffix = " | IHP Greenville";
    const full = `${post.title} | Integrative Health Partners`;
    const short = `${post.title}${suffix}`;
    return full.length > 60 ? short : full;
  })();
  return `${renderHead(shortTitle, excerpt)}
<body data-page="blog-post">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container-narrow" style="padding-top:1.5rem;padding-bottom:5rem">
      ${renderBreadcrumbs([{ name: "Blog", href: "/blog" }, { name: post.title }])}

      <header style="margin-bottom:2.5rem">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;font-size:0.875rem;color:var(--color-muted);margin-bottom:1.25rem">
          ${icons.calendar} <span>${formatDate(post.pubDate)}</span>
          ${post.creator ? `${icons.user} <span>${post.creator}</span>` : ""}
        </div>
        <h1 class="section-title reveal">${post.title}</h1>
        ${post.categories && post.categories.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1.25rem" class="reveal">
          ${post.categories.map(c => `<span class="tag">${c}</span>`).join("")}
        </div>` : ""}
      </header>

      <div class="prose blog-post-content" id="blog-post-body">
        ${autoLink(post.content || `<p>${excerpt}</p>`, `/blog/${post.slug}`)}
      </div>

      <aside style="margin-top:2rem;margin-bottom:2rem;padding:1rem 1.25rem;background:var(--color-bg-alt,#f8f8f8);border-left:3px solid var(--color-primary,#2563eb);border-radius:0.375rem;font-size:0.8125rem;color:var(--color-muted)" role="note" aria-label="Medical disclaimer">
        <strong>Medical Disclaimer:</strong> This article is for informational and educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making changes to your health regimen. <a href="/disclaimer/" style="color:var(--color-primary)">Read our full disclaimer.</a>
      </aside>

      ${(() => {
        const links = getBlogSiteLinks(post.slug);
        const svcLinks = links.serviceBaseSlugs
          .map(bs => {
            const svc = serviceMap.get(`${bs}-greenville-sc`) ?? serviceMap.get(bs);
            return svc ? { href: `/services/${svc.slug}`, name: svc.name } : null;
          })
          .filter(Boolean) as { href: string; name: string }[];
        const condLinks = links.conditionSlugs
          .map(cs => {
            const cond = conditionMap.get(cs);
            return cond ? { href: `/conditions/${cs}`, name: cond.name } : null;
          })
          .filter(Boolean) as { href: string; name: string }[];
        if (svcLinks.length === 0 && condLinks.length === 0) return "";
        return `
      <div class="highlight-box--compact" style="margin-top:2.5rem;margin-bottom:1rem">
        <p style="font-family:var(--font-heading);font-size:0.8125rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--color-primary);margin-bottom:0.875rem">
          Related Services &amp; Conditions at IHP
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          ${svcLinks.map(l => `<a href="${l.href}" class="tag tag--link">${l.name}</a>`).join("")}
          ${condLinks.map(l => `<a href="${l.href}" class="tag tag--link tag--teal">${l.name}</a>`).join("")}
        </div>
      </div>`;
      })()}

      <hr class="divider" />

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:2rem">
        <a href="/blog/" class="back-link">${icons.arrowLeft} Back to Blog</a>
        <a href="tel:${NAP.phoneRaw}" class="btn btn-primary btn-sm">${icons.phone} ${NAP.phone}</a>
      </div>

      <div class="cta-subtle" style="text-align:center">
        <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.75rem">Ready to Experience Integrative Care?</h2>
        <p style="color:var(--color-muted);margin-bottom:1.25rem">Schedule a consultation with Dr. William Hendry in Greenville, SC.</p>
        <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITIONS HUB PAGE  (/conditions/)
   ============================================================ */
export function renderConditionsHub(): string {
  const conditionHubs = [
    { slug: "back-and-spine-pain",          name: "Back &amp; Spine Pain",              count: 2, desc: "Chronic back pain, sciatica, disc herniation, and lumbar dysfunction — acupuncture, dry needling, and central sensitization resolution." },
    { slug: "joint-and-muscle-pain",         name: "Joint &amp; Muscle Pain",             count: 7, desc: "Neck pain, knee pain, hip pain, shoulder pain, arthritis, headaches, and sports injuries — kinetic chain assessment and multi-modal needling." },
    { slug: "hormonal-and-thyroid-health",   name: "Hormonal &amp; Thyroid Health",       count: 7, desc: "Hashimoto's, thyroid dysfunction, adrenal fatigue, PCOS, menopause, perimenopause, and hormone imbalance — comprehensive functional hormone panels." },
    { slug: "gut-and-digestive-health",      name: "Gut &amp; Digestive Health",          count: 3, desc: "IBS, leaky gut, and food sensitivities — SIBO testing, microbiome analysis, gut-healing protocols, and enteric nervous system support." },
    { slug: "fatigue-brain-nervous-system",  name: "Fatigue, Brain &amp; Nervous System", count: 8, desc: "Chronic fatigue, brain fog, anxiety, depression, insomnia, PTSD, neuropathy, and cognitive decline — HPA axis regulation and neurological support." },
    { slug: "fertility-and-womens-health",   name: "Fertility &amp; Women's Health",      count: 2, desc: "Fertility support, IVF enhancement, and PCOS from the reproductive angle — HPO axis regulation, cycle optimization, and evidence-based acupuncture." },
    { slug: "autoimmune-and-chronic-illness",name: "Autoimmune &amp; Chronic Illness",    count: 5, desc: "Autoimmune disease, fibromyalgia, Lyme disease, chronic illness, and weight dysfunction — root-cause immune modulation and central sensitization." },
  ];
  const hubFAQs = [
    { q: "What conditions does acupuncture treat?", a: "Acupuncture has demonstrated clinical efficacy for a broad range of conditions including chronic pain, anxiety, insomnia, digestive disorders, hormonal imbalances, and more. At Integrative Health Partners, Dr. Hendry uses acupuncture as part of a comprehensive integrative protocol tailored to each patient's unique presentation." },
    { q: "How is functional medicine different from conventional medicine for chronic conditions?", a: "Functional medicine seeks to identify and address the root biological causes of chronic conditions — gut dysbiosis, hormonal imbalances, nutritional deficiencies, systemic inflammation — rather than managing symptoms with medication. This approach often produces more durable results for complex, multi-system chronic conditions." },
    { q: "Do you treat patients who are already seeing other doctors?", a: "Absolutely. Dr. Hendry works collaboratively with your existing healthcare team. Many patients come to us while under the care of other specialists, using integrative medicine to complement their conventional treatment and address the root causes that conventional care may not be reaching." },
    { q: "Is integrative medicine evidence-based?", a: "Yes. Dr. Hendry's approach draws on peer-reviewed research in acupuncture, functional medicine, and nutritional science. He holds 5 research publications and 54 citations, and his clinical protocols are informed by the best available evidence across both Eastern and Western medical traditions." },
  ];

  return `${renderHead("Conditions We Treat | Integrative Health Partners Greenville, SC", "Functional & integrative medicine for 30+ conditions in Greenville, SC. Root-cause testing, acupuncture, Chinese herbs. Find your condition and how we can help.", `${BASE_URL}/conditions/`)}
<body data-page="conditions-hub">
  ${renderNav(false)}

  <main class="page-top">
    <section class="section" aria-labelledby="conditions-hub-heading">
      <div class="container">
        ${renderBreadcrumbs([{ name: "Conditions We Treat" }])}

        <div style="max-width:48rem;margin-bottom:3rem">
          <span class="tag reveal">Conditions We Treat</span>
          <h1 class="section-title reveal reveal-delay-1" id="conditions-hub-heading" style="margin-top:0.875rem">
            Comprehensive Condition Treatment in Greenville, SC
          </h1>
          <p style="color:var(--color-muted);line-height:1.75;margin-top:1.25rem;font-size:1.0625rem" class="reveal reveal-delay-2">
            At Integrative Health Partners, Dr. William Hendry uses acupuncture, functional medicine, and Traditional Chinese
            Medicine to address the root causes of 30+ conditions across 7 clinical areas. Each hub below brings together
            every relevant treatment approach, clinical evidence, and Dr. Hendry's first-person clinical perspective.
          </p>
        </div>

        <!-- Condition Hub Cards -->
        <div class="grid-auto md:grid-2 lg:grid-3" style="margin-bottom:4rem">
          ${conditionHubs.map((hub, i) => `
          <div class="reveal" style="transition-delay:${i * 0.07}s">
            <a href="/conditions/${hub.slug}/" class="cat-card">
              <div class="cat-card__header">
                <span class="cat-card__badge cat-card__badge--secondary">Conditions</span>
                <span class="cat-card__arrow">${icons.arrowRight}</span>
              </div>
              <h2 class="cat-card__title">${hub.name}</h2>
              <p class="cat-card__count">${hub.count} condition${hub.count !== 1 ? "s" : ""}</p>
              <p class="cat-card__desc">${hub.desc}</p>
            </a>
          </div>`).join("")}
        </div>

        <!-- Why IHP -->
        <div class="cta-subtle reveal" style="margin-bottom:4rem">
          <div style="max-width:44rem;margin-inline:auto;text-align:center">
            <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1rem">Why Integrative Health Partners?</h2>
            <p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.5rem">
              Dr. William Hendry brings 25+ years of clinical experience, NCBAHM board certification,
              hospital privileges at Prisma Health, and 5 research publications to every patient consultation.
              His dual training in Oriental medicine and functional medicine means your condition is evaluated
              from every angle — and treated at its root.
            </p>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
          </div>
        </div>

        <!-- FAQ -->
        <div style="max-width:56rem;margin-inline:auto">
          <h2 class="section-title reveal" style="margin-bottom:1.75rem">Frequently Asked Questions</h2>
          ${hubFAQs.map(faq => `
          <div class="faq-item reveal">
            <button class="faq-btn" aria-expanded="false">
              ${faq.q}
              <span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span>
            </button>
            <div class="faq-body">
              <div class="faq-content">${faq.a}</div>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION CATEGORY PAGE  (/conditions/:categorySlug/)
   ============================================================ */
const conditionCategoryContent: Record<string, { approach: string; whyIHP: string; faqs: { q: string; a: string }[] }> = {
  "pain-and-musculoskeletal": {
    approach: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Chronic and acute musculoskeletal pain conditions require more than anti-inflammatory medications and rest. Dr. Hendry's integrative approach begins with identifying the structural, neurological, and systemic factors that perpetuate each patient's pain — including unresolved myofascial trigger points, central sensitization patterns, nutritional deficiencies that impair tissue repair, inflammatory dysregulation, and biomechanical dysfunction. This root-cause framework allows targeted treatment rather than symptom management alone.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Acupuncture and dry needling address pain through multiple mechanisms simultaneously: peripheral nerve stimulation triggers endorphin and serotonin release, local needling resolves trigger points and myofascial restrictions, and autonomic modulation shifts the nervous system out of the chronic pain sensitization loop. For complex or longstanding pain conditions, Dr. Hendry integrates functional medicine testing — inflammatory markers, nutrient status, gut integrity — to address systemic drivers that local treatments cannot reach.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Dr. Hendry brings a uniquely evidence-based credential to pain treatment: he co-authored a 3-year study at Prisma Health's Emergency Department evaluating needling techniques as non-opioid alternatives for acute pain management. This research context informs every pain treatment protocol at Integrative Health Partners — ensuring that clinical decisions are grounded in real-world outcomes data.</p>`,
    whyIHP: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Patients seek out Integrative Health Partners for pain conditions when they've found that conventional approaches — medications, physical therapy, injections — provide incomplete or temporary relief. Dr. Hendry's combination of acupuncture, dry needling, cupping, Chinese herbal medicine, and functional medicine testing provides a multi-mechanism approach that addresses both the local tissue and systemic drivers of pain simultaneously.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Treatment timelines vary: acute injuries typically resolve in 4—8 sessions. Longstanding chronic pain requires 10—14 sessions for significant improvement, with monthly maintenance thereafter. At your first appointment, Dr. Hendry will assess your specific presentation and give you a realistic, personalized treatment timeline.</p>`,
    faqs: [
      { q: "Can acupuncture help with chronic pain that hasn't responded to other treatments?", a: "Yes. Many of our pain patients have already tried physical therapy, medications, and injections. Acupuncture works through mechanisms that these approaches don't reach — specifically, it modulates central pain sensitization, resolves deep myofascial restrictions, and addresses systemic inflammatory drivers. Dr. Hendry's multi-modal approach combining acupuncture with dry needling and functional medicine is particularly effective for complex, multi-year pain cases." },
      { q: "What is dry needling and how does it differ from acupuncture?", a: "Dry needling targets specific myofascial trigger points using solid filiform needles to release muscle knots and restore normal neuromuscular function. Traditional acupuncture uses the same needles at mapped acupoints along meridian pathways to regulate the nervous system, reduce inflammation, and address systemic patterns. Dr. Hendry is trained in both and integrates them based on each patient's presentation — often using both modalities in a single treatment session for pain conditions." },
      { q: "How long until I see results for my pain condition?", a: "Most patients notice measurable improvement within 3—5 sessions. Acute conditions (recent injuries, post-surgical recovery) often respond more quickly. Chronic conditions — especially those involving central sensitization, fibromyalgia, or longstanding structural damage — typically require 8—12 sessions for significant, lasting improvement. Dr. Hendry will give you a clear, honest timeline at your first visit based on your specific condition history." },
      { q: "Do you treat sports injuries at Integrative Health Partners?", a: "Yes. We treat a wide range of sports and overuse injuries including rotator cuff issues, IT band syndrome, patellar tendinopathy, shin splints, plantar fasciitis, and muscle strains. Acupuncture and dry needling accelerate healing by improving local circulation, reducing inflammation, and releasing the neuromuscular tension patterns that develop around injury sites." },
    ],
  },
  "neurological-mental-health": {
    approach: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Neurological and mental health conditions have clear biological foundations — and Dr. Hendry's integrative approach treats those foundations directly rather than managing symptoms alone. Anxiety, depression, insomnia, PTSD, and cognitive dysfunction all involve measurable dysregulation in the HPA axis, autonomic nervous system, neurotransmitter synthesis, gut-brain axis signaling, and neuroimmune communication. Identifying and correcting these specific drivers is the core of his treatment philosophy.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Acupuncture has well-documented effects on the autonomic nervous system — shifting the nervous system from sympathetic dominance (chronic stress, fight-or-flight) to parasympathetic tone (rest, repair, cognitive clarity). Multiple randomized controlled trials have documented acupuncture's efficacy for generalized anxiety disorder, primary insomnia, PTSD, and major depressive disorder — mechanisms include cortisol regulation, serotonin and GABA modulation, and direct effects on limbic system activity.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Dr. Hendry's published research on heart rate variability (HRV) biofeedback for symptom management in cancer patients reflects his deep understanding of autonomic nervous system regulation — the same principles he applies to anxiety, sleep disorders, and stress-related conditions. This research-informed approach ensures treatment decisions are grounded in measurable physiological outcomes rather than theoretical frameworks alone.</p>`,
    whyIHP: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Many of our neurological and mental health patients have tried medications, therapy, or lifestyle changes with incomplete results. Dr. Hendry's integrative approach adds what conventional care often misses: specific testing for nutritional deficiencies (B12, D3, folate, zinc, magnesium) that directly impair neurotransmitter synthesis, gut microbiome evaluation to address gut-brain axis dysfunction, and adrenal/cortisol testing to identify HPA axis dysregulation patterns that drive anxiety, insomnia, and mood instability.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Acupuncture and herbal medicine add non-pharmacological regulation of the nervous system that can work alongside — or provide an alternative to — conventional psychiatric medications. We work collaboratively with mental health providers and always prioritize patient safety and continuity of care.</p>`,
    faqs: [
      { q: "Can acupuncture help with anxiety and insomnia without medication?", a: "Acupuncture has strong evidence for both anxiety and insomnia as a standalone or adjunct treatment. It regulates the HPA axis, reduces cortisol, promotes melatonin secretion, and modulates GABA signaling — directly addressing the biological underpinnings of both conditions. Many patients see measurable improvement in sleep quality within 3—5 sessions. We also assess and address nutritional factors (magnesium, B vitamins) and gut-brain axis imbalances that perpetuate anxiety and sleep disruption." },
      { q: "Is this treatment safe alongside medications for depression or anxiety?", a: "Yes. Acupuncture has an excellent safety profile and does not interact with psychiatric medications. Dr. Hendry communicates with your prescribing provider as appropriate and always prioritizes continuity of care. Herbal medicine requires more careful management alongside pharmaceuticals — Dr. Hendry performs a thorough herb-drug interaction assessment before recommending any herbal formulas." },
      { q: "What does brain fog treatment look like at IHP?", a: "Brain fog typically involves multiple overlapping factors: sleep dysregulation, HPA axis dysfunction, nutritional deficiencies (particularly B12, D3, and omega-3s), gut microbiome imbalance, thyroid function, and neuroinflammation. Dr. Hendry uses functional medicine testing to identify your specific pattern and creates a targeted protocol — combining acupuncture, targeted supplementation, dietary adjustments, and sleep support — that addresses the root causes of your cognitive symptoms." },
      { q: "Do you treat PTSD at Integrative Health Partners?", a: "Yes. Acupuncture has emerging clinical evidence for PTSD, particularly in regulating hyperarousal, improving sleep quality, and reducing autonomic nervous system dysregulation. Dr. Hendry's approach complements — and does not replace — trauma-focused psychotherapy. We coordinate with your mental health team and create protocols that support nervous system regulation as part of a comprehensive care plan." },
    ],
  },
  "hormonal-womens-health": {
    approach: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Hormonal health is among the most undertreated areas in conventional medicine. Standard annual lab panels frequently miss early hormonal imbalances — TSH alone misses significant thyroid dysfunction, basic FSH misses complex fertility pathology, and standard sex hormone panels fail to capture the dynamic patterns underlying PCOS, perimenopause, and adrenal-hormonal interactions. Dr. Hendry's functional medicine approach uses comprehensive hormonal testing to build a complete picture of each patient's hormonal environment.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">For hormonal conditions, Dr. Hendry integrates advanced testing (full thyroid panels including rT3 and thyroid antibodies, Dutch hormone testing, 4-point cortisol rhythm testing, comprehensive sex hormone panels) with acupuncture's documented ability to regulate the hypothalamic-pituitary-ovarian axis. This combination addresses both the measurable biochemical drivers of hormonal imbalance and the neuroendocrine regulatory mechanisms that determine how those hormones are used by the body.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Chinese herbal medicine has over 2,000 years of clinical use in women's health — and the modern evidence base supports specific herbal formulas for fertility, PCOS, menstrual regulation, and menopausal symptom management. Dr. Hendry's in-house herbal pharmacy allows same-day dispensing of custom formulations matched to each patient's individual presentation, not a generic off-the-shelf supplement protocol.</p>`,
    whyIHP: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Patients seek Integrative Health Partners for hormonal and women's health issues when conventional care has not provided answers — when lab results are "normal" but symptoms are clearly present, when standard fertility interventions have not worked, or when conventional hormone therapy has not adequately addressed menopausal symptoms. Dr. Hendry's deeper functional medicine testing often reveals the specific imbalances that standard panels miss.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Treatment is always evidence-informed and individualized. We never prescribe a standard protocol — every patient receives a treatment plan built from their own lab data, health history, and therapeutic goals. New patients are welcome; call (864) 365-6156 to schedule a comprehensive initial consultation.</p>`,
    faqs: [
      { q: "Can acupuncture help with fertility?", a: "Yes. Acupuncture has documented effects on fertility — regulating the HPO axis, improving uterine blood flow, supporting ovarian function, and reducing stress hormones that suppress fertility. It is commonly used alongside IVF to improve success rates and as a standalone approach for natural conception. Dr. Hendry integrates acupuncture with Chinese herbal medicine and functional medicine testing (including complete hormone panels and thyroid assessment) to build a comprehensive fertility support protocol." },
      { q: "What hormonal testing does Dr. Hendry offer that my primary care doctor doesn't?", a: "Dr. Hendry offers comprehensive functional hormone panels beyond what standard primary care provides: full thyroid panels (including free T3, reverse T3, and thyroid antibodies TPO and TgAb), Dutch hormone testing for sex hormone metabolites, 4-point cortisol rhythm testing (not just a single morning cortisol draw), and comprehensive nutrient testing that identifies deficiencies affecting hormonal synthesis and metabolism." },
      { q: "How does acupuncture help with menopause symptoms?", a: "Multiple clinical trials have documented acupuncture's effectiveness for hot flashes, sleep disturbance, mood instability, and joint pain associated with menopause. Acupuncture appears to regulate thermoregulatory centers in the hypothalamus and modulate the autonomic nervous system patterns that drive menopausal hot flashes and sleep disruption. Chinese herbal medicine — particularly formulas in the classical women's health tradition — provides additional hormonal support alongside acupuncture." },
      { q: "Do you treat PCOS at Integrative Health Partners?", a: "Yes. PCOS is one of our core areas of expertise. Dr. Hendry's approach addresses the underlying insulin resistance, androgens, and inflammatory drivers of PCOS through functional medicine testing and targeted interventions — combined with acupuncture to regulate the HPO axis and menstrual cycle. Clinical evidence supports acupuncture for menstrual regulation in PCOS, improving both hormonal parameters and cycle regularity." },
    ],
  },
  "digestive-immune": {
    approach: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Digestive and immune health are intimately connected — the gut houses approximately 70% of the immune system, and disruption to gut barrier integrity, microbiome composition, or digestive function creates cascading immune dysregulation throughout the body. Dr. Hendry approaches digestive and immune conditions with the most advanced functional medicine testing available: gut microbiome analysis, intestinal permeability assessment, SIBO breath testing, comprehensive food sensitivity panels, and autoimmune marker panels that go far beyond what standard gastroenterology or immunology testing captures.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Acupuncture has well-documented effects on gastrointestinal function — regulating motility, reducing visceral hypersensitivity, calming IBS symptoms, and modulating the enteric nervous system (the "second brain"). Combined with herbal medicine's long tradition in digestive health and the targeted repair protocols of functional medicine (addressing leaky gut, microbiome rebalancing, and inflammatory triggers), this integrative approach provides comprehensive digestive healing that isolated conventional treatments cannot match.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">For autoimmune conditions — including Hashimoto's thyroiditis, rheumatoid arthritis, lupus, and inflammatory bowel disease — Dr. Hendry uses a root-cause framework that identifies and addresses the environmental triggers and gut-immune dysfunction at the foundation of immune dysregulation. While not a cure for autoimmune disease, this approach can meaningfully reduce symptom burden, lower inflammatory markers, and reduce the immune system's activation against self-tissue.</p>`,
    whyIHP: `<p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.25rem">Many of our digestive and immune patients have been told their labs are "normal" despite ongoing symptoms, or have received diagnoses like IBS without investigation into the underlying causes. Dr. Hendry's functional medicine approach is specifically designed to find what standard testing misses — and to create targeted protocols based on what he finds, not a generic elimination diet or probiotic recommendation.</p>
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Integrative Health Partners is one of the few practices in Upstate South Carolina offering this depth of functional digestive and immune evaluation. Our in-house herbal pharmacy allows same-day dispensing of customized formulations for gut healing protocols. New patients are welcome — call (864) 365-6156 to schedule.</p>`,
    faqs: [
      { q: "Can acupuncture help with IBS and digestive issues?", a: "Yes. Clinical evidence supports acupuncture for irritable bowel syndrome, reducing both visceral pain and bowel habit dysregulation. Acupuncture regulates the enteric nervous system, reduces intestinal inflammation, and modulates the gut-brain axis signaling that drives many IBS symptoms. It works well alongside dietary and microbiome interventions to provide multi-mechanism digestive support." },
      { q: "What does a functional medicine gut evaluation look like at IHP?", a: "Dr. Hendry uses advanced testing including comprehensive stool analysis (microbiome, pathogen screening, digestive enzyme function), intestinal permeability assessment (leaky gut markers), SIBO breath testing, comprehensive food sensitivity panels (IgG and IgA), and inflammatory markers. The results inform a targeted protocol — not a generic elimination diet, but a specific intervention matched to your gut's actual biology." },
      { q: "How does Dr. Hendry treat autoimmune disease?", a: "Autoimmune conditions require identifying and removing the environmental triggers that activate immune dysregulation — common triggers include gut permeability, specific food antigens, microbial imbalances, heavy metal burden, and chronic low-grade infections. Dr. Hendry's comprehensive evaluation identifies which factors are relevant for each patient and creates targeted protocols to address them. While not a cure for autoimmune disease, this root-cause approach often significantly reduces symptoms and inflammatory markers." },
      { q: "Do you treat Hashimoto's thyroiditis at Integrative Health Partners?", a: "Yes. Hashimoto's is one of our core specialty areas. Dr. Hendry uses comprehensive thyroid panels (free T4, free T3, reverse T3, TPO antibodies, TgAb antibodies) plus full functional gut evaluation to identify the autoimmune triggers underlying each patient's Hashimoto's. Treatment typically involves gut healing, dietary modifications (gluten and dairy assessment), targeted supplementation (selenium, iodine balance, Vitamin D), and acupuncture for thyroid regulation and immune modulation." },
    ],
  },
};

export function renderConditionCategory(catSlug: string): string | null {
  const cat = conditionCategoryMap.get(catSlug);
  if (!cat) return null;

  const catConditions = cat.conditionSlugs.map(s => conditionMap.get(s)).filter(Boolean) as typeof conditions;
  const seo = getConditionCategorySEO(cat.slug, cat.shortName, cat.metaDescription);
  const otherCats = conditionCategories.filter(c => c.slug !== catSlug);
  const catContent = conditionCategoryContent[catSlug] || null;

  const html = `${renderHead(seo.title, seo.description)}
<body data-page="condition-category">
  ${renderNav(false)}

  <main class="page-top">
    <section class="section" aria-labelledby="cond-cat-heading">
      <div class="container">
        ${renderBreadcrumbs([
          { name: "Conditions We Treat", href: "/conditions" },
          { name: cat.shortName },
        ])}

        <div style="max-width:48rem;margin-bottom:3rem">
          <span class="tag reveal">Conditions We Treat</span>
          <h1 class="section-title reveal reveal-delay-1" id="cond-cat-heading" style="margin-top:0.875rem">
            ${cat.name} in Greenville, SC
          </h1>
          <p style="color:var(--color-muted);line-height:1.75;margin-top:1.25rem;font-size:1.0625rem" class="reveal reveal-delay-2">
            ${cat.openingParagraph}
          </p>
          <div style="margin-top:1.75rem" class="reveal reveal-delay-3">
            <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
          </div>
        </div>

        <!-- Condition Cards -->
        <h2 class="font-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:1.25rem">
          ${cat.shortName} Conditions We Treat (${catConditions.length})
        </h2>
        <div class="grid-auto sm:grid-2 md:grid-3" style="margin-bottom:3rem">
          ${catConditions.map((cond, i) => `
          <div class="reveal" style="transition-delay:${Math.min(i * 0.05, 0.4)}s">
            <a href="/conditions/${cond.slug}/" class="svc-list-link">
              <div class="svc-list-link__inner">
                <span class="svc-list-link__name">${cond.name}</span>
                <span class="svc-list-link__arrow">${icons.arrowRight}</span>
              </div>
            </a>
          </div>`).join("")}
        </div>

        ${catContent ? `
        <!-- Approach Section -->
        <div style="max-width:48rem;margin-bottom:3rem">
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.25rem">Dr. Hendry's Approach to ${cat.shortName} Conditions</h2>
          <div class="reveal reveal-delay-1">${catContent.approach}</div>
        </div>

        <!-- Why IHP Section -->
        <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.75rem;max-width:48rem;margin-bottom:3rem" class="reveal">
          <h2 class="font-display" style="font-size:1.5rem;margin-bottom:1rem">Why Patients Choose Integrative Health Partners</h2>
          ${catContent.whyIHP}
        </div>
        ` : ""}

        <!-- CTA -->
        <div class="cta-subtle reveal" style="text-align:center;margin-bottom:3rem">
          <h2 class="font-display" style="font-size:1.75rem;margin-bottom:0.875rem">Ready to address the root cause?</h2>
          <p style="color:var(--color-muted);margin-bottom:1.5rem;max-width:36rem;margin-inline:auto">
            Dr. Hendry is accepting new patients. Schedule a consultation to find out how integrative medicine can help your specific condition.
          </p>
          <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
        </div>

        ${catContent ? `
        <!-- FAQ Section -->
        <div style="max-width:48rem;margin-bottom:3rem">
          <h2 class="section-title reveal" style="margin-bottom:1.75rem">Frequently Asked Questions</h2>
          ${catContent.faqs.map(faq => `
          <div class="faq-item reveal">
            <button class="faq-btn" aria-expanded="false">${faq.q}<span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span></button>
            <div class="faq-body" role="region">
              <div class="faq-content">${faq.a}</div>
            </div>
          </div>`).join("")}
        </div>
        ` : ""}

        <!-- Other Categories -->
        <div>
          <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;color:var(--color-muted);margin-bottom:1rem">
            Other Condition Categories
          </h2>
          <div class="grid-auto sm:grid-2 md:grid-3">
            ${otherCats.map(oc => `
            <a href="/conditions/${oc.slug}/" class="other-cat-card reveal">
              <div class="other-cat-card__title">${oc.shortName}</div>
              <div class="other-cat-card__count">${oc.conditionSlugs.length} conditions</div>
              <span class="other-cat-card__link">View conditions ${icons.arrowRight}</span>
            </a>`).join("")}
          </div>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;

  return injectSEOIntoHTML(html, seo);
}

/* ============================================================
   INDIVIDUAL CONDITION PAGE  (/conditions/:conditionSlug/)
   ============================================================ */
export function renderCondition(condSlug: string): string | null {
  const cond = conditionMap.get(condSlug);
  if (!cond) return null;

  const cat = conditionCategoryMap.get(cond.categorySlug);
  if (!cat) return null;

  const relatedConditions = cond.relatedConditionSlugs
    .map(s => conditionMap.get(s))
    .filter(Boolean) as typeof conditions;

  const seo = getConditionPageSEO(
    cond.slug,
    cond.name,
    cond.metaDescription,
    cat.slug,
    cat.shortName,
    cond.content.faqs
  );

  const html = `${renderHead(seo.title, seo.description)}
<body data-page="condition">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: cat.shortName, href: `/conditions/${cat.slug}` },
        { name: cond.name },
      ])}

      <div class="main-sidebar">
        <!-- Main Content -->
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">${cat.shortName}</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">${cond.name} Treatment in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2rem" class="reveal reveal-delay-1">
            ${cond.metaDescription}
          </p>

          ${renderPageReview(condSlug)}
          <!-- What is it? -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">What Is ${cond.name}?</h2>
          <p style="color:var(--color-muted);line-height:1.75;margin-bottom:2rem" class="reveal">${autoLink(cond.content.definition, `/conditions/${condSlug}`)}</p>

          <!-- Symptoms -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Common Symptoms</h2>
          <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:2rem">
            ${cond.content.symptoms.map(s => `
            <div class="check-item reveal">${icons.checkCircle}<span>${s}</span></div>`).join("")}
          </div>

          <!-- Root Causes -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Root Causes: A Functional Medicine Perspective</h2>
          <div style="color:var(--color-muted);line-height:1.75;margin-bottom:2rem" class="reveal">
            ${autoLink(cond.content.rootCauses.split("\n\n").map(p => `<p style="margin-bottom:1rem">${p}</p>`).join(""), `/conditions/${condSlug}`)}
          </div>

          <!-- How IHP Treats It -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">How We Treat ${cond.name} at IHP</h2>
          <div style="color:var(--color-muted);line-height:1.75;margin-bottom:2rem" class="reveal">
            ${autoLink(cond.content.howTreated.split("\n\n").map(p => `<p style="margin-bottom:1rem">${p}</p>`).join(""), `/conditions/${condSlug}`)}
          </div>

          <!-- Dr. Hendry's Approach -->
          <div class="cta-subtle reveal" style="margin-bottom:2rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} Dr. Hendry's Approach</h2>
            <p style="color:var(--color-muted);line-height:1.75">${autoLink(cond.content.drApproach, `/conditions/${condSlug}`)}</p>
          </div>

          <!-- Related Services -->
          ${cond.relatedServiceSlugs.length > 0 ? `
          <div style="margin-bottom:2rem">
            <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              Treatments We Use for ${cond.name}
            </h2>
            <div class="grid-auto sm:grid-2">
              ${cond.relatedServiceSlugs.map(s => {
                const svcData = serviceMap.get(s);
                const name = svcData ? svcData.name : s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                return `
              <a href="/services/${s}/" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`;
              }).join("")}
            </div>
          </div>` : ""}

          <!-- FAQ -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-top:2rem;margin-bottom:1.5rem">
            Frequently Asked Questions About ${cond.name}
          </h2>
          ${cond.content.faqs.map(faq => `
          <div class="faq-item reveal">
            <button class="faq-btn" aria-expanded="false">
              ${faq.q}
              <span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span>
            </button>
            <div class="faq-body">
              <div class="faq-content">${faq.a}</div>
            </div>
          </div>`).join("")}

          <!-- Related Conditions -->
          ${relatedConditions.length > 0 ? `
          <div style="margin-top:3rem">
            <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              Related Conditions
            </h2>
            <div class="grid-auto sm:grid-2">
              ${relatedConditions.map(rc => `
              <a href="/conditions/${rc.slug}/" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${rc.name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`).join("")}
            </div>
          </div>` : ""}

          ${(() => {
            const rawBlogLinks = getConditionBlogLinks(condSlug, 5);
            const blogLinks = rawBlogLinks
              .map(b => {
                const key = `/blog/${b.slug}`;
                if (BLOG_410S.has(key)) return null;
                return { slug: b.slug, title: b.title, url: BLOG_301S[key] ?? `/blog/${b.slug}` };
              })
              .filter((b): b is { slug: string; title: string; url: string } => b !== null)
              .slice(0, 3);
            if (blogLinks.length === 0) return "";
            return `
          <div style="margin-top:3rem" class="reveal">
            <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              ${icons.leaf} From the IHP Blog
            </h2>
            <div style="display:flex;flex-direction:column;gap:0.625rem">
              ${blogLinks.map(b => `
              <a href="${b.url}" style="display:flex;align-items:center;gap:0.625rem;font-size:0.9375rem;color:var(--color-primary);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--color-border)" class="blog-cross-link">
                ${icons.arrowRight}<span>${b.title}</span>
              </a>`).join("")}
            </div>
          </div>`;
          })()}
        </article>

        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="cta-box">
            <h3 class="cta-box__title">Get Treatment for ${cond.name}</h3>
            <p class="cta-box__text">Schedule a consultation with Dr. William Hendry. New patients welcome in Greenville, SC.</p>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-white btn-full">${icons.phone} ${NAP.phone}</a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Why Choose Dr. Hendry?</p>
            <div class="check-list">
              <div class="check-item">${icons.check}<span>25+ years clinical experience</span></div>
              <div class="check-item">${icons.check}<span>NCBAHM board-certified</span></div>
              <div class="check-item">${icons.check}<span>Hospital privileges — Prisma Health</span></div>
              <div class="check-item">${icons.check}<span>5 research publications</span></div>
              <div class="check-item">${icons.check}<span>Dual Oriental &amp; functional medicine training</span></div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Explore All Conditions</p>
            ${conditionCategories.map(cc => `
            <a href="/conditions/${cc.slug}/" class="sidebar-link">${cc.shortName}</a>`).join("")}
            <a href="/conditions/" class="text-link" style="font-size:0.875rem;font-weight:500;display:block;margin-top:0.75rem">
              View all conditions â†’
            </a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.65;margin-bottom:0.75rem">
              319 Wade Hampton Blvd, Ste A<br>Greenville, SC 29609
            </p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">
              ${icons.mapPin} Get Directions
            </a>
          </div>
        </aside>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;

  return injectSEOIntoHTML(html, seo);
}

/* ============================================================
   ABOUT PAGE
   ============================================================ */
export function renderAbout(): string {
  const html = `${renderHead("About IHP | Functional Medicine & Acupuncture Greenville SC", "Integrative Health Partners — Greenville SC's root-cause health practice. Functional medicine, acupuncture, in-house herbal pharmacy. Call (864) 365-6156.")}
<body data-page="about">
  ${renderNav(false)}

  <main class="page-top">
    <div class="page-hero page-hero--green">
      <div class="container">
        ${renderBreadcrumbs([{ name: "About", href: "/about" }])}
        <h1 class="page-hero__title font-display">About Integrative Health Partners</h1>
        <p class="page-hero__subtitle">Root-cause care for the whole person — integrating ancient wisdom with evidence-based medicine</p>
      </div>
    </div>

    <div class="container section">
      <div class="two-col-layout">
        <div class="two-col-layout__main">

          <section class="content-section">
            <h2>A Different Kind of Practice</h2>
            <p>Integrative Health Partners was founded on a simple but powerful conviction: most chronic health conditions have an identifiable root cause — and finding it changes everything. When patients arrive at our Greenville, SC practice, many have already spent years managing symptoms without resolution. Our job is to stop the cycle.</p>
            <p>Led by <a href="/dr-hendry/" class="internal-link">Dr. William Hendry, DAOM</a>, our practice blends traditional Chinese medicine — refined over 2,000 years — with modern functional medicine diagnostics. The result is a comprehensive, patient-centered approach that addresses not just what you feel, but <em>why</em> you feel it.</p>
          </section>

          <section class="content-section">
            <h2>Our Philosophy of Care</h2>
            <p>Conventional medicine excels at crisis care. Functional and integrative medicine excels at <em>chronic care</em> — the persistent conditions that don't resolve with a pill or a procedure. At Integrative Health Partners, we use both lenses.</p>
            <p>Every new patient begins with a thorough intake that explores not just their chief complaint, but their entire health history: diet, sleep, stress, environment, medications, and prior treatments. From this foundation, Dr. Hendry builds an individualized treatment plan that may include <a href="/services/acupuncture-therapy/" class="internal-link">acupuncture therapy</a>, <a href="/services/chinese-herbal-medicine/" class="internal-link">Chinese herbal medicine</a>, <a href="/services/functional-medicine-consultation/" class="internal-link">functional medicine consultation</a>, and targeted nutritional support.</p>
            <p>We believe in transparency. You will always understand what we are doing and why — and we will track your progress with measurable outcomes at every step.</p>
          </section>

          <section class="content-section">
            <h2>In-House Herbal Pharmacy</h2>
            <p>One of the most distinctive features of our practice is our full in-house herbal pharmacy. Many acupuncture clinics refer patients elsewhere for Chinese herbal formulas, creating delays and gaps in care. We stock an extensive formulary of professional-grade, tested herbal medicines on site.</p>
            <p>Dr. Hendry prescribes custom herbal formulations tailored to each patient's constitution and condition — not a one-size-fits-all supplement. Our pharmacy includes classical formulas, granule extracts, and single-herb preparations. Every product meets rigorous quality standards for purity and potency. For patients managing complex conditions like <a href="/conditions/autoimmune-disease/" class="internal-link">autoimmune disease</a>, <a href="/conditions/hormone-imbalance/" class="internal-link">hormone imbalance</a>, or <a href="/conditions/chronic-fatigue/" class="internal-link">chronic fatigue</a>, the herbal pharmacy is an essential component of the healing process.</p>
          </section>

          <figure class="clinic-photo-card reveal">
            <img src="/images/clinic/pharmacy.jpg" alt="In-house herbal pharmacy at Integrative Health Partners — hundreds of professional-grade herbs, formulas, and supplements" loading="lazy" width="800" height="260" />
            <figcaption>Our full in-house herbal pharmacy — professional-grade formulas, granule extracts, and single-herb preparations dispensed same-day at your appointment.</figcaption>
          </figure>

          <section class="content-section">
            <h2>What Makes IHP Different</h2>
            <ul class="styled-list">
              <li>${icons.checkCircle} <strong>Hospital-level expertise:</strong> Dr. Hendry held hospital privileges at Prisma Health for 9 years — rare for an acupuncturist — and participated in a landmark 3-year Emergency Department study on needle-based alternatives to opioids.</li>
              <li>${icons.checkCircle} <strong>Doctoral-level training:</strong> Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine, representing the highest academic credential in the field.</li>
              <li>${icons.checkCircle} <strong>Published researcher:</strong> With 5 peer-reviewed publications and 54 citations, Dr. Hendry brings an evidence base to every clinical decision. Learn more on the <a href="/dr-hendry/" class="internal-link">Dr. Hendry page</a>.</li>
              <li>${icons.checkCircle} <strong>Full-spectrum integrative care:</strong> Acupuncture, herbal medicine, functional medicine diagnostics, <a href="/services/ozone-therapy/" class="internal-link">ozone therapy</a>, injection therapy, and nutritional counseling — all under one roof.</li>
              <li>${icons.checkCircle} <strong>In-house herbal pharmacy:</strong> Professional-grade herbs dispensed at the time of your appointment — no waiting, no third-party sourcing.</li>
            </ul>
          </section>

          <section class="content-section">
            <h2>Our Location</h2>
            <p>We are conveniently located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609 — easily accessible from Spartanburg, Anderson, North Greenville, Travelers Rest, Taylors, Mauldin, Simpsonville, and the greater Upstate South Carolina area. We serve patients throughout Upstate SC.</p>
            <p>We see patients Monday through Friday, 9am—5pm. New patients are always welcome. Call us at <a href="tel:+1-864-365-6156" class="internal-link">(864) 365-6156</a> or email <!--email_off--><a href="mailto:info@ihpgreenville.com" class="internal-link">info@ihpgreenville.com</a><!--/email_off--> to schedule your initial consultation.</p>
          </section>

          <section class="content-section">
            <h2>Frequently Asked Questions About Our Practice</h2>
            ${[
              { q: "What types of patients does Integrative Health Partners see?", a: "We see patients of all ages with both acute and chronic conditions. Many of our patients have complex health issues that haven't resolved with conventional care alone — including chronic pain, autoimmune conditions, hormonal imbalances, digestive disorders, and neurological conditions. We also see patients seeking preventive care and health optimization." },
              { q: "Do I need a referral from my doctor to be seen?", a: "No referral is needed. You can book directly by calling (864) 365-6156. If you have been referred by a physician, we welcome that collaboration and will communicate with your referring provider as appropriate." },
              { q: "What should I bring to my first appointment?", a: "Bring a list of current medications and supplements, any recent lab work or imaging results, and a brief summary of your health history and current concerns. Wearing loose, comfortable clothing is recommended if acupuncture will be part of your initial visit." },
              { q: "How long is an initial consultation?", a: "Your first visit typically lasts 60—90 minutes. This allows Dr. Hendry to conduct a thorough health history, perform diagnostic assessments (including tongue and pulse diagnosis), and begin developing your individualized treatment plan." },
              { q: "Do you accept insurance?", a: "Integrative Health Partners is a cash-pay practice and does not bill insurance directly. We provide itemized superbills that you can submit to your insurance for potential out-of-network reimbursement. Call (864) 365-6156 to learn more." },
              { q: "What makes IHP different from other acupuncture clinics?", a: "Three key differentiators: Dr. Hendry's 9-year hospital privileges at Prisma Health (rare for an acupuncturist), our full in-house herbal pharmacy for same-day dispensing, and Dr. Hendry's published research background (5 publications, 54 citations) ensuring every treatment decision is evidence-informed." },
            ].map(faq => `
            <div class="faq-item reveal">
              <button class="faq-btn" aria-expanded="false">${faq.q}<span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span></button>
              <div class="faq-body"><div class="faq-content">${faq.a}</div></div>
            </div>`).join("")}
          </section>

          <div class="cta-box">
            <h3 class="cta-box__title">Ready to Start Your Healing Journey?</h3>
            <p class="cta-box__text">Discover what's really driving your health challenges. Dr. Hendry will conduct a comprehensive evaluation and build a treatment plan designed around your specific needs.</p>
            <div class="cta-box__actions">
              <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
              <a href="/dr-hendry/" class="btn btn-outline">Meet Dr. Hendry</a>
            </div>
          </div>

          <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-muted)">
            Have questions before booking? <a href="mailto:${NAP.email}" class="internal-link">Contact us at ${NAP.email}</a>.
          </p>

        </div>

        <aside class="sidebar">
          <div class="sidebar-card" style="padding:0;overflow:hidden">
            <div class="sidebar-photo">
              <img src="/images/clinic/lamp.jpg" alt="Gooseneck exterior lamp above the entrance of Integrative Health Partners clinic at 319 Wade Hampton Blvd, Greenville SC" loading="lazy" width="400" height="180" />
            </div>
            <div style="padding:0.875rem 1.25rem">
              <p style="font-size:0.875rem;color:var(--color-muted);margin:0;line-height:1.6">319 Wade Hampton Blvd, Ste A, Greenville, SC — look for the brick building with the gooseneck lamp.</p>
            </div>
          </div>

          <div class="sidebar-card" style="text-align:center">
            <img src="/images/dr-hendry.jpg"
              alt="Dr. William Hendry, DAOM — Acupuncturist and Functional Medicine Practitioner, Greenville SC"
              class="dr-headshot" loading="lazy" />
            <p class="sidebar-card__title" style="margin-top:0.75rem">Meet Dr. Hendry</p>
            <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.65;margin-bottom:0.75rem">
              Dr. William Hendry, DAOM holds a doctorate in acupuncture and oriental medicine and is NCBAHM board-certified with 25+ years of clinical experience.
            </p>
            <a href="/dr-hendry/" class="sidebar-link">${icons.arrowRight} Full Credentials &amp; Biography</a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Contact &amp; Location</p>
            <div class="footer__contact-list" style="gap:0.625rem">
              <div class="footer__contact-row">${icons.mapPin}<span>319 Wade Hampton Blvd<br>Ste A, Greenville, SC 29609</span></div>
              <div class="footer__contact-row">${icons.phone}<a href="tel:${NAP.phoneRaw}" class="footer__contact-link">${NAP.phone}</a></div>
              <div class="footer__contact-row">${icons.mail}<a href="mailto:${NAP.email}" class="footer__contact-link">${NAP.email}</a></div>
              <div class="footer__contact-row">${icons.clock}<span>Mon—Fri 9am—5pm</span></div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Services</p>
            <div class="footer__links" style="gap:0.375rem">
              <a href="/services/acupuncturist-services/" class="sidebar-link">${icons.arrowRight} Acupuncturist Services</a>
              <a href="/services/acupuncture-clinic-services/" class="sidebar-link">${icons.arrowRight} Acupuncture Clinic</a>
              <a href="/services/chinese-medicine-clinic-services/" class="sidebar-link">${icons.arrowRight} Chinese Medicine</a>
              <a href="/services/functional-medicine-services/" class="sidebar-link">${icons.arrowRight} Functional Medicine</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;

  return html;
}

/* ============================================================
   DR. HENDRY PAGE
   ============================================================ */
export function renderDrHendry(): string {
  const publications = [
    {
      title: "Emergency Department Alternatives to Opioids: Adapting and Implementing Proven Therapies in Practice",
      authors: "Floyd SB, McGarby S, Cordero Romero S, Garrison S, Walker K, Hendry W, Moschella PC",
      venue: "International Journal of Environmental Research and Public Health — Jan 2023",
      doi: "10.3390/ijerph20021206",
      pmid: "36673962",
      url: "https://pubmed.ncbi.nlm.nih.gov/36673962/",
      summary: "3-year Prisma Health Emergency Department study demonstrating that implementing acupuncture and needle-based alternatives (ED-ALTO) reduced opioid prescriptions and morphine milligram equivalents for comparable diagnoses.",
      citations: "36"
    },
    {
      title: "Symptom Management Among Cancer Survivors: Randomized Pilot Intervention Trial of Heart Rate Variability Biofeedback",
      authors: "Burch JB, Ginsberg JP, McLain AC, Franco R, Stokes S, Susko K, Hendry W, Crowley E, Christ A, Hanna J, Anderson A, HÃ©bert JR, O'Rourke MA",
      venue: "Applied Psychophysiology and Biofeedback — Jun 2020, 45(2):99—108",
      doi: "10.1007/s10484-020-09462-3",
      pmid: "32358782",
      url: "https://pubmed.ncbi.nlm.nih.gov/32358782/",
      summary: "Randomized, wait-list-controlled pilot trial showing HRV biofeedback training significantly reduced sleep disturbance symptoms among cancer survivors, with positive trends for stress, fatigue, PTSD, and depression.",
      citations: "14"
    },
    {
      title: "Use of Heart Rate Variability (HRV) Biofeedback for Symptom Management Among Cancer Survivors",
      authors: "O'Rourke MA, Franco RA, Sofge J, Ginsberg J, Susko K, Crowley E, Anderson A, Christ A, Hanna J, Hendry W, Burch J",
      venue: "Journal of Clinical Oncology — May 2017, 35(15 Suppl):10099",
      doi: "10.1200/JCO.2017.35.15_suppl.10099",
      pmid: "",
      url: "https://ascopubs.org/doi/10.1200/JCO.2017.35.15_suppl.10099",
      summary: "ASCO annual meeting presentation of the feasibility trial: HRV biofeedback for autonomic dysfunction and late cancer treatment effects including pain, fatigue, stress, and depression. 179 screened, 34 enrolled, 31 completed.",
      citations: ""
    },
    {
      title: "Evaluating the Effects of Acupuncture in the Treatment of Taxane-Induced Peripheral Neuropathy",
      authors: "Hendry W et al.",
      venue: "Prisma Health Patient Engagement Studio — Clinical Research",
      doi: "",
      pmid: "",
      url: "https://www.researchgate.net/profile/William-Hendry-4",
      summary: "Clinical study evaluating acupuncture as an intervention for taxane-induced peripheral neuropathy (TIPN), a common dose-limiting side effect of chemotherapy in cancer patients.",
      citations: ""
    },
    {
      title: "Neurogenesis: Implications for Integrative Care of Neurological Conditions",
      authors: "Hendry W",
      venue: "Peer-Reviewed Journal — November 2013",
      doi: "",
      pmid: "",
      url: "https://www.researchgate.net/profile/William-Hendry-4",
      summary: "Review examining the implications of neurogenesis research for integrative and acupuncture-based care of neurological conditions.",
      citations: ""
    }
  ];

  const credentials = [
    { label: "Degree", value: "Doctor of Acupuncture and Oriental Medicine (DAOM)" },
    { label: "Institution", value: "East West College of Natural Medicine (Graduated December 2008)" },
    { label: "NCBAHM Certification", value: "Dipl. O.M. (NCBAHM)Â® — Certificate #114498" },
    { label: "NCBAHM Valid Through", value: "August 31, 2029" },
    { label: "NPI Number", value: "1417184045 (Active since June 22, 2009)" },
    { label: "SC License", value: "ACUP141 (Expires September 30, 2027)" },
    { label: "FL License", value: "AP2646" },
    { label: "Additional Certification", value: "Injection Therapy Certified" },
    { label: "Hospital Privileges", value: "Prisma Health — 9 Years" },
    { label: "Professional Membership", value: "American Academy of Ozone Therapy (AAOT)" },
    { label: "Research Publications", value: "5 peer-reviewed studies | 54 citations" },
  ];

  const html = `${renderHead("Dr. William Hendry, DAOM | Integrative Medicine Greenville SC", "Dr. William Hendry, DAOM — NCBAHM #114498, 25+ yrs clinical exp. Co-author: Prisma Health opioid alternative ER study. Greenville, SC integrative medicine.")}
<body data-page="dr-hendry">
  ${renderNav(false)}

  <main class="page-top">
    <div class="page-hero page-hero--green">
      <div class="container">
        ${renderBreadcrumbs([{ name: "Dr. William Hendry", href: "/dr-hendry" }])}
        <h1 class="page-hero__title font-display">Dr. William Hendry, DAOM</h1>
        <p class="page-hero__subtitle">Board-Certified Acupuncturist &amp; Functional Medicine Practitioner | 25+ Years Clinical Experience | Serving Greenville, Spartanburg, Anderson &amp; Upstate SC</p>
      </div>
    </div>

    <div class="container section">
      <div class="two-col-layout">
        <div class="two-col-layout__main">

          <section class="content-section">
            <h2>Credentials at a Glance</h2>
            <div class="credentials-grid">
              ${credentials.map(c => `
              <div class="credential-row">
                <span class="credential-label">${c.label}</span>
                <span class="credential-value">${c.value}</span>
              </div>`).join('')}
            </div>
            <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-muted)">
              <a href="https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==" target="_blank" rel="noopener noreferrer" class="internal-link">Verify NCBAHM Badge ${icons.externalLink}</a>
              &nbsp;&bull;&nbsp;
              <a href="https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx" target="_blank" rel="noopener noreferrer" class="internal-link">Verify NPI ${icons.externalLink}</a>
              &nbsp;&bull;&nbsp;
              <a href="https://llr.sc.gov/med/" target="_blank" rel="noopener noreferrer" class="internal-link">SC License Lookup ${icons.externalLink}</a>
            </p>
          </section>

          <section class="content-section">
            <h2 class="highlight-heading">The Prisma Health Opioid Alternative Study</h2>
            <div class="highlight-box">
              <p>Dr. Hendry served as a co-investigator on a landmark <strong>3-year research study conducted at the Prisma Health Emergency Department</strong> — one of the leading health systems in South Carolina. The study examined <strong>needling techniques as non-opioid alternatives for acute pain management</strong> in an emergency care setting.</p>
              <p>The study, titled <em>"Alternatives to Opiates,"</em> represented a direct clinical response to the opioid crisis and demonstrated that acupuncture and dry needling can provide meaningful, measurable pain relief without the risks associated with opioid analgesics. For Dr. Hendry, this research was not abstract — it was applied at the bedside, in real time, with emergency patients.</p>
              <p>This work earned Dr. Hendry a 9-year appointment with hospital privileges at Prisma Health — an exceptional distinction for an acupuncturist, and a testament to the level of trust the medical community placed in his clinical judgment and skill.</p>
              <p>
                <a href="https://pubmed.ncbi.nlm.nih.gov/36673962/" target="_blank" rel="noopener noreferrer" class="internal-link">Read on PubMed — PMID 36673962 ${icons.externalLink}</a>
                &nbsp;&bull;&nbsp;
                <a href="https://doi.org/10.3390/ijerph20021206" target="_blank" rel="noopener noreferrer" class="internal-link">DOI: 10.3390/ijerph20021206 ${icons.externalLink}</a>
              </p>
            </div>
          </section>

          <section class="content-section">
            <h2>25+ Years of Clinical Excellence</h2>
            <p>Dr. Hendry began his formal training in acupuncture and oriental medicine in the late 1990s and graduated with his Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine in December 2008 — completing the highest academic credential available in the field. He passed his NCBAHM board examinations and has maintained active board certification ever since, with his current certification valid through August 2029.</p>
            <p>Over more than 25 years, Dr. Hendry has treated thousands of patients across a wide range of conditions — from <a href="/conditions/back-pain/" class="internal-link">chronic back pain</a> and <a href="/conditions/fibromyalgia/" class="internal-link">fibromyalgia</a> to <a href="/conditions/fertility/" class="internal-link">fertility challenges</a>, <a href="/conditions/anxiety-stress/" class="internal-link">anxiety and stress</a>, and complex chronic illnesses. His approach is both disciplined and creative: grounded in the classical literature of Chinese medicine, yet continuously informed by the latest functional medicine research.</p>
            <p>He holds active licenses in both South Carolina (ACUP141) and Florida (AP2646), and is a certified Injection Therapy practitioner — enabling him to offer biopuncture and nutrient injection therapies unavailable at most acupuncture clinics.</p>
          </section>

          <section class="content-section">
            <h2>Research &amp; Publications</h2>
            <p>Dr. Hendry has authored or co-authored 5 peer-reviewed research publications with a combined 54 citations. His research spans acupuncture as a non-opioid pain alternative in emergency medicine, HRV biofeedback for cancer survivor symptom management, acupuncture for chemotherapy-induced neuropathy, and the neuroscience of integrative care.</p>
            <div class="publications-list" itemscope itemtype="https://schema.org/ItemList">
              ${publications.map((pub, i) => `
              <div class="publication-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ScholarlyArticle">
                <span class="publication-number">${i + 1}</span>
                <div class="publication-content">
                  <p class="publication-title">
                    <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="internal-link" itemprop="url">
                      <span itemprop="name">${pub.title}</span> ${icons.externalLink}
                    </a>
                  </p>
                  <p class="publication-venue" style="font-size:0.8125rem;color:var(--color-muted);margin:0.2rem 0 0.3rem">
                    <em itemprop="isPartOf">${pub.venue}</em>
                  </p>
                  <p style="font-size:0.8rem;color:var(--color-muted);margin:0 0 0.35rem" itemprop="author">${pub.authors}</p>
                  ${pub.summary ? `<p style="font-size:0.8125rem;color:var(--color-muted);margin:0 0 0.35rem;line-height:1.55" itemprop="description">${pub.summary}</p>` : ''}
                  <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.25rem">
                    ${pub.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/" target="_blank" rel="noopener noreferrer" class="tag tag--link" style="font-size:0.75rem">PubMed ${icons.externalLink}</a>` : ''}
                    ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer" class="tag tag--link" style="font-size:0.75rem">DOI: ${pub.doi} ${icons.externalLink}</a>` : ''}
                    ${pub.citations ? `<span class="tag" style="font-size:0.75rem">${pub.citations} citations</span>` : ''}
                  </div>
                </div>
              </div>`).join('')}
            </div>
            <p style="margin-top:1.5rem">
              <a href="https://www.researchgate.net/profile/William-Hendry-4" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">View ResearchGate Profile ${icons.externalLink}</a>
            </p>
          </section>

          <section class="content-section">
            <h2>Teaching, Speaking &amp; Professional Contributions</h2>
            <p>In November 2016, Dr. Hendry was invited to present a webinar for <em>Acupuncture Today</em> — one of the leading professional publications in the field — titled <strong>"Medicating Our Microbes: Herbs, Supplements and the Microbiome,"</strong> sponsored by Biotics Research Corporation. The presentation explored how Chinese herbal medicine intersects with modern microbiome science, reflecting Dr. Hendry's commitment to bridging traditional knowledge with contemporary evidence.</p>
            <p><a href="https://acupuncturetoday.com/webinars/detail/medicating-our-microbes-herbs-supplements-and-the-microbiome" target="_blank" rel="noopener noreferrer" class="internal-link">View Acupuncture Today Webinar ${icons.externalLink}</a></p>
          </section>

          <section class="content-section">
            <h2>Philosophy of Care</h2>
            <p>Dr. Hendry's clinical philosophy is built on a foundational belief: the body has an extraordinary capacity to heal itself when given the right conditions. His role — as he sees it — is to remove obstacles, restore balance, and support the body's innate intelligence. That philosophy translates into personalized, whole-person care that respects each patient's unique history, constitution, and goals.</p>
            <p>He is equally at home working with a patient navigating <a href="/conditions/autoimmune-disease/" class="internal-link">autoimmune disease</a> as he is treating a high-performance athlete recovering from a <a href="/conditions/sports-injuries/" class="internal-link">sports injury</a>. Whether prescribing a classical herbal formula or interpreting functional blood chemistry, Dr. Hendry brings the same rigor, curiosity, and compassion to every patient encounter.</p>
            <p>His membership in the <strong>American Academy of Ozone Therapy (AAOT)</strong> reflects his commitment to staying at the frontier of integrative medicine, including emerging therapies like <a href="/services/ozone-therapy/" class="internal-link">medical ozone therapy</a> that are gaining traction in evidence-based circles.</p>
          </section>

          <section class="content-section">
            <h2>Frequently Asked Questions About Dr. Hendry</h2>
            ${[
              { q: "What is Dr. Hendry's highest academic credential?", a: "Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine, which is the highest academic degree available in the acupuncture and oriental medicine field. He graduated in December 2008." },
              { q: "Is Dr. Hendry board certified?", a: "Yes. Dr. Hendry holds NCBAHM (National Certification Board for Acupuncture and Herbal Medicine) board certification as a Diplomate of Oriental Medicine — certificate #114498. His certification is valid through August 31, 2029." },
              { q: "Has Dr. Hendry published research?", a: "Yes. Dr. Hendry has authored or co-authored 5 peer-reviewed research publications with a combined 54 citations. His research includes the Prisma Health opioid alternative study, HRV biofeedback for cancer survivors, and neurogenesis in integrative care." },
              { q: "What is Dr. Hendry's hospital experience?", a: "Dr. Hendry held hospital privileges at Prisma Health for 9 years — an exceptional distinction for an acupuncturist. During that time, he co-investigated a 3-year study using needling techniques as alternatives to opioid pain management in the Emergency Department." },
              { q: "Does Dr. Hendry offer injection therapies?", a: "Yes. Dr. Hendry is a certified Injection Therapy practitioner, enabling him to offer biopuncture and nutrient injection therapies. These treatments involve micro-injections of natural substances at specific points to support healing — a service unavailable at most acupuncture clinics." },
              { q: "How can I verify Dr. Hendry's credentials?", a: "You can verify his NCBAHM certification via the official NCBAHM digital badge, his NPI number (1417184045) through the NPI database, and his South Carolina license (ACUP141) through the SC Department of Labor, Licensing and Regulation website." },
            ].map(faq => `
            <div class="faq-item reveal">
              <button class="faq-btn" aria-expanded="false">${faq.q}<span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span></button>
              <div class="faq-body"><div class="faq-content">${faq.a}</div></div>
            </div>`).join("")}
          </section>

          <div class="cta-box">
            <h3 class="cta-box__title">Schedule with Dr. Hendry</h3>
            <p class="cta-box__text">New patients are welcome. Call us to schedule your initial consultation and find out what's really behind your health challenges.</p>
            <div class="cta-box__actions">
              <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
              <a href="/about/" class="btn btn-outline">About Our Practice</a>
            </div>
          </div>

        </div>

        <aside class="sidebar">
          <div style="border-radius:0.875rem;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);border:1px solid var(--color-border);margin-bottom:1.5rem">
            <img src="/images/dr-hendry.jpg"
              alt="Dr. William Hendry, DAOM — Acupuncturist and Functional Medicine Practitioner, Greenville SC"
              style="width:100%;height:auto;display:block;object-fit:cover"
              width="320" height="380" loading="lazy" />
            <div style="padding:1rem 1.125rem;background:var(--color-card);border-top:1px solid var(--color-border)">
              <p style="font-family:var(--font-heading);font-weight:700;font-size:1rem;color:var(--color-foreground);margin:0 0 0.2rem">Dr. William Hendry</p>
              <p style="font-size:0.8125rem;color:var(--color-primary);font-weight:600;margin:0 0 0.4rem">DAOM Â· Dipl. O.M. (NCBAHM)Â®</p>
              <p style="font-size:0.75rem;color:var(--color-muted);margin:0;line-height:1.5">Integrative Health Partners<br>Greenville, SC</p>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Board Certifications</p>
            <div class="footer__links" style="gap:0.5rem">
              <div class="sidebar-cred">${icons.award} NCBAHM Dipl. O.M. #114498</div>
              <div class="sidebar-cred">${icons.shield} SC License ACUP141</div>
              <div class="sidebar-cred">${icons.shield} FL License AP2646</div>
              <div class="sidebar-cred">${icons.check} Injection Therapy Certified</div>
              <div class="sidebar-cred">${icons.check} NPI 1417184045</div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Verify Credentials</p>
            <div class="footer__links" style="gap:0.5rem">
              <a href="https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} NCBAHM Badge</a>
              <a href="https://directory.ncbahm.org/FAP/PractitionerDetail?AgencyClientId=ssLe-Z5Nnck=&d=4.8" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} NCBAHM Directory</a>
              <a href="https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} NPI Verification</a>
              <a href="https://llr.sc.gov/med/" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} SC License Lookup</a>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Research</p>
            <div class="footer__links" style="gap:0.5rem">
              <a href="https://www.researchgate.net/profile/William-Hendry-4" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.book} ResearchGate Profile</a>
              <a href="https://academics.prismahealth.org/research-and-innovation/research-development/resources/patient-engagement-studio/main-studio" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} Prisma Health Research</a>
              <a href="https://acupuncturetoday.com/webinars/detail/medicating-our-microbes-herbs-supplements-and-the-microbiome" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.globe} Acupuncture Today Webinar</a>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Contact Our Office</p>
            <div class="footer__contact-list" style="gap:0.625rem">
              <div class="footer__contact-row">${icons.phone}<a href="tel:${NAP.phoneRaw}" class="footer__contact-link">${NAP.phone}</a></div>
              <div class="footer__contact-row">${icons.mail}<a href="mailto:${NAP.email}" class="footer__contact-link">${NAP.email}</a></div>
              <div class="footer__contact-row">${icons.mapPin}<span>319 Wade Hampton Blvd<br>Ste A, Greenville SC</span></div>
            </div>
          </div>

          <div class="sidebar-card" style="padding:0;overflow:hidden">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--color-border)">
              <img src="/images/clinic/fergus-1.jpg" alt="Fergus, Dr. Hendry's Irish Setter — the friendly clinic dog at Integrative Health Partners, Greenville SC" loading="lazy" width="200" height="200" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" />
              <img src="/images/clinic/fergus-2.jpg" alt="Fergus smiling at Integrative Health Partners clinic — Dr. Hendry's dog and unofficial clinic mascot" loading="lazy" width="200" height="200" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" />
            </div>
            <div style="padding:0.75rem 1rem;background:var(--color-card)">
              <p style="font-family:var(--font-heading);font-weight:700;font-size:0.9375rem;color:var(--color-foreground);margin:0 0 0.2rem">Meet Fergus</p>
              <p style="font-size:0.8125rem;color:var(--color-muted);margin:0;line-height:1.5">Dr. Hendry's Irish Setter and unofficial clinic mascot. You may meet him on your visit.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;

  return html;
}

/* ============================================================
   CONTACT PAGE  (/contact)
   ============================================================ */
export function renderContact(): string {
  const html = `${renderHead("Contact IHP | Book an Appointment in Greenville, SC", "Schedule an appointment with Integrative Health Partners. 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156. Mon—Fri 9am—5pm.")}
<body data-page="contact">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Contact" },
      ])}

      <div class="main-sidebar">
        <!-- Main Content -->
        <article>
          <h1 class="section-title reveal" style="margin-bottom:1.5rem">Contact Integrative Health Partners</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2rem" class="reveal">
            Ready to schedule with Dr. William Hendry? Call us directly at <a href="tel:${NAP.phoneRaw}" style="color:var(--color-primary);font-weight:600">${NAP.phone}</a> or email <a href="mailto:${NAP.email}" style="color:var(--color-primary)">${NAP.email}</a>. New patients are welcome. We see patients Monday through Friday, 9am—5pm.
          </p>

          <!-- NAP Block (canonical) -->
          <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.75rem;margin-bottom:2rem" class="reveal" itemscope itemtype="https://schema.org/LocalBusiness">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:1.25rem">Practice Information</h2>
            <div style="display:flex;flex-direction:column;gap:0.875rem">
              <div style="display:flex;align-items:flex-start;gap:0.75rem">
                ${icons.mapPin}
                <div>
                  <strong itemprop="name">Integrative Health Partners</strong><br>
                  <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
                    <span itemprop="streetAddress">319 Wade Hampton Blvd, Ste A</span><br>
                    <span itemprop="addressLocality">Greenville</span>, <span itemprop="addressRegion">SC</span> <span itemprop="postalCode">29609</span>
                  </span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem">
                ${icons.phone}
                <span><strong>Phone:</strong> <a href="tel:${NAP.phoneRaw}" style="color:var(--color-primary)" itemprop="telephone">${NAP.phone}</a></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem">
                ${icons.mail}
                <span><strong>Email:</strong> <a href="mailto:${NAP.email}" style="color:var(--color-primary)" itemprop="email">${NAP.email}</a></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem">
                ${icons.clock}
                <span itemprop="openingHours" content="Mo-Fr 09:00-17:00"><strong>Hours:</strong> Monday—Friday, 9:00am—5:00pm</span>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem">
                ${icons.mapPin}
                <span><strong>Service Area:</strong> Greenville, Spartanburg, Anderson, and Upstate South Carolina</span>
              </div>
            </div>
          </div>

          <!-- Google Map Embed -->
          <div style="margin-bottom:2rem;border-radius:0.75rem;overflow:hidden;border:1px solid var(--color-border)" class="reveal">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3269.892!2d-82.38248!3d34.86226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8856a1c1a1a1a1a1%3A0x1!2s319+Wade+Hampton+Blvd+Suite+A%2C+Greenville%2C+SC+29609!5e0!3m2!1sen!2sus!4v1"
              width="100%" height="360" style="border:0;display:block" allowfullscreen loading="lazy"
              title="Integrative Health Partners location map — 319 Wade Hampton Blvd, Ste A Greenville SC"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>

          <!-- Clinic Exterior Photos -->
          <div class="reveal" style="margin-bottom:2rem">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem">
              <figure style="margin:0">
                <img src="/images/clinic/sign.jpg" alt="Integrative Health Partners sign at 319 Wade Hampton Blvd, Greenville SC — IHP logo with phone number 864-365-6156" loading="lazy" width="600" height="450" style="width:100%;height:200px;object-fit:cover;border-radius:0.5rem;display:block" />
              </figure>
              <figure style="margin:0">
                <img src="/images/clinic/entrance.jpg" alt="Front entrance of Integrative Health Partners clinic in Greenville, SC — glass door with gooseneck lamp and covered entryway" loading="lazy" width="600" height="450" style="width:100%;height:200px;object-fit:cover;border-radius:0.5rem;display:block" />
              </figure>
            </div>
            <figure style="margin:0">
              <img src="/images/clinic/entrance-wide.jpg" alt="Exterior of Integrative Health Partners at 319 Wade Hampton Blvd, Greenville SC — brick building with clinic entrance and surrounding greenery" loading="lazy" width="1200" height="450" style="width:100%;height:200px;object-fit:cover;border-radius:0.5rem;display:block" />
              <figcaption style="font-size:0.8125rem;color:var(--color-muted);margin-top:0.5rem;text-align:center">319 Wade Hampton Blvd, Ste A, Greenville, SC — look for the IHP sign on the brick building</figcaption>
            </figure>
          </div>

          <!-- Driving Directions -->
          <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.75rem;margin-bottom:2rem" class="reveal">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:1rem">Getting Here</h2>
            <p style="color:var(--color-muted);line-height:1.75;margin-bottom:1rem">
              Our clinic is located on Wade Hampton Blvd (US-29) in Greenville, SC. We are easily accessible from:
            </p>
            <ul style="color:var(--color-muted);padding-left:1.25rem;line-height:1.9;margin-bottom:1.25rem">
              <li><strong>Downtown Greenville:</strong> Head north on Church St, continue onto Wade Hampton Blvd — approximately 5 minutes.</li>
              <li><strong>Spartanburg / I-85:</strong> Take I-85 S to SC-14 W (exit 72), merge onto Wade Hampton Blvd — approximately 30 minutes.</li>
              <li><strong>Anderson / I-85 N:</strong> Take I-85 N to SC-14/Wade Hampton area — approximately 45 minutes.</li>
              <li><strong>Travelers Rest / North Greenville:</strong> Head south on US-25 to Wade Hampton Blvd — approximately 10 minutes.</li>
              <li><strong>Taylors / Greer:</strong> US-29 W (Wade Hampton Blvd) directly to our office — approximately 10 minutes.</li>
            </ul>
            <a href="https://www.google.com/maps/dir/?api=1&destination=319+Wade+Hampton+Blvd+Suite+A+Greenville+SC+29609" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:0.5rem">
              ${icons.mapPin} Get Google Maps Directions
            </a>
          </div>

          <!-- Inside the Clinic -->
          <div class="reveal" style="margin-bottom:2rem">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:1rem">Inside the Clinic</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
              <figure style="margin:0">
                <img src="/images/clinic/waiting-area.jpg" alt="Waiting area at Integrative Health Partners Greenville SC — two chairs beneath a large traditional Chinese mountain landscape painting, with health resource table" loading="lazy" width="600" height="400" style="width:100%;height:180px;object-fit:cover;border-radius:0.5rem;display:block" />
                <figcaption style="font-size:0.75rem;color:var(--color-muted);margin-top:0.375rem;text-align:center">Welcoming waiting area</figcaption>
              </figure>
              <figure style="margin:0">
                <img src="/images/clinic/reception.jpg" alt="Reception desk at Integrative Health Partners Greenville SC — viewed through service window, with supplement shelving visible in background" loading="lazy" width="600" height="400" style="width:100%;height:180px;object-fit:cover;border-radius:0.5rem;display:block" />
                <figcaption style="font-size:0.75rem;color:var(--color-muted);margin-top:0.375rem;text-align:center">Front desk — call or walk in</figcaption>
              </figure>
              <figure style="margin:0" style="grid-column:1/-1">
                <img src="/images/clinic/hallway-chalkboard.jpg" alt="IHP clinic hallway in Greenville SC with chalkboard sign listing Acupuncture, Chinese Herbs, and Functional Medicine services and phone number 365-6156" loading="lazy" width="1200" height="400" style="width:100%;height:180px;object-fit:cover;border-radius:0.5rem;display:block" />
                <figcaption style="font-size:0.75rem;color:var(--color-muted);margin-top:0.375rem;text-align:center">Three disciplines, one practitioner — Acupuncture Â· Chinese Herbs Â· Functional Medicine</figcaption>
              </figure>
            </div>
          </div>

          <!-- Review Link -->
          <div style="background:linear-gradient(135deg,var(--color-primary),var(--color-accent));border-radius:0.75rem;padding:1.75rem;margin-bottom:2rem;color:#fff;text-align:center" class="reveal">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:0.75rem;color:#fff">Enjoyed Your Visit?</h2>
            <p style="opacity:0.9;margin-bottom:1.25rem;line-height:1.65">Your Google review helps other Greenville-area patients find quality integrative care. It takes less than 2 minutes.</p>
            <a href="https://share.google/TYarboIHpqlhU6odK" target="_blank" rel="noopener noreferrer"
              style="background:#fff;color:var(--color-primary);font-weight:700;padding:0.75rem 1.5rem;border-radius:0.5rem;text-decoration:none;display:inline-block">
              â­ Leave Us a Google Review
            </a>
          </div>

          <!-- Directory Listings -->
          <div style="margin-bottom:2rem" class="reveal">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:1rem">Find Us Online</h2>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
              <a href="https://www.google.com/maps/place/Integrative+Health+Partners" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Google Business Profile</a>
              <a href="https://www.healthgrades.com" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Healthgrades</a>
              <a href="https://www.yelp.com" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Yelp</a>
              <a href="https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">NCBAHM Verification</a>
            </div>
          </div>
        </article>

        <!-- Sidebar -->
        <aside>
          <!-- CTA Card -->
          <div class="sidebar-cta" style="margin-bottom:1.5rem">
            <p class="sidebar-cta__label">New Patients Welcome</p>
            <h2 class="sidebar-cta__title">Schedule Your Consultation</h2>
            <p class="sidebar-cta__body">Call Dr. Hendry's office directly to book your comprehensive initial evaluation. Appointments typically last 60—90 minutes.</p>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-primary btn-block">${icons.phone} Call ${NAP.phone}</a>
            <a href="mailto:${NAP.email}" class="btn btn-secondary btn-block" style="margin-top:0.625rem">${icons.mail} ${NAP.email}</a>
          </div>

          <!-- Hours Card -->
          <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.5rem;margin-bottom:1.5rem">
            <h3 class="font-display" style="font-size:1.125rem;margin-bottom:1rem">Office Hours</h3>
            <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.9375rem">
              ${["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d => `
              <div style="display:flex;justify-content:space-between">
                <span style="font-weight:500">${d}</span>
                <span style="color:var(--color-primary)">9:00am — 5:00pm</span>
              </div>`).join("")}
              <div style="display:flex;justify-content:space-between">
                <span style="font-weight:500">Saturday—Sunday</span>
                <span style="color:var(--color-muted)">Closed</span>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.5rem;margin-bottom:1.5rem">
            <h3 class="font-display" style="font-size:1.125rem;margin-bottom:0.875rem">About Our Practice</h3>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              <a href="/about/" class="internal-link">About Integrative Health Partners</a>
              <a href="/dr-hendry/" class="internal-link">Dr. William Hendry, DAOM</a>
              <a href="/conditions/" class="internal-link">Conditions We Treat</a>
              <a href="/services/acupuncturist-services/" class="internal-link">Acupuncturist Services</a>
            </div>
          </div>

          <!-- Clinic Exterior Photo -->
          <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;overflow:hidden">
            <div class="sidebar-photo">
              <img src="/images/clinic/exterior.jpg" alt="Exterior entrance of Integrative Health Partners clinic at 319 Wade Hampton Blvd, Greenville SC" loading="lazy" width="400" height="180" />
            </div>
            <div style="padding:0.875rem 1.25rem">
              <p style="font-size:0.875rem;color:var(--color-muted);margin:0;line-height:1.6;font-weight:500">319 Wade Hampton Blvd, Ste A<br>Greenville, SC 29609</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;

  const seo = {
    title: "Contact IHP | Acupuncture Appointment Greenville, SC",
    description: "Schedule an appointment with Integrative Health Partners. 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156. Mon—Fri 9am—5pm.",
    canonical: `${process.env.BASE_URL || "https://www.ihpgreenville.com"}/contact`,
    ogType: "website",
    schemas: []
  };
  return injectSEOIntoHTML(html, seo);
}

/* ============================================================
   SERVICES HUB PAGE  (/services)
   ============================================================ */
export function renderServicesHub(): string {
  const categoryIcons: Record<string, string> = {
    "acupuncturist-services": icons.leaf,
    "acupuncture-clinic-services": icons.check,
    "chinese-medicine-clinic-services": icons.star,
    "functional-medicine-services": icons.shield,
  };
  const servicesByCategory = new Map<string, Array<{ slug: string; name: string }>>();
  for (const svc of allServices) {
    if (!servicesByCategory.has(svc.categorySlug)) servicesByCategory.set(svc.categorySlug, []);
    servicesByCategory.get(svc.categorySlug)!.push({ slug: svc.slug, name: svc.name });
  }
  return `${renderHead("Services | Functional Medicine & Acupuncture | IHP Greenville", "Functional medicine, acupuncture, Chinese herbs, and integrative therapies in Greenville, SC. Root-cause diagnostics and needle-based treatments. Call (864) 365-6156.")}
<body data-page="services-hub">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="max-width:1100px;padding:3rem 1.25rem 4rem">

      <nav aria-label="Breadcrumb" class="breadcrumb" style="margin-bottom:2rem">
        <a href="/">Home</a>
        <span aria-hidden="true"> â€º </span>
        <span aria-current="page">Services</span>
      </nav>

      <h1 class="font-display reveal" style="font-size:clamp(1.75rem,4vw,2.5rem);margin-bottom:1rem">
        Acupuncture &amp; Functional Medicine Services in Greenville, SC
      </h1>
      <p class="reveal" style="font-size:1.0625rem;line-height:1.75;max-width:720px;margin-bottom:3rem;color:var(--color-text-light)">
        Integrative Health Partners offers a comprehensive range of evidence-informed services across four specialties.
        Dr. William Hendry, DACM, L.Ac., blends traditional Chinese medicine with functional medicine to address the root causes of your health concerns.
      </p>

      <div style="display:grid;gap:2.5rem">
        ${categoryDefinitions.map(cat => `
        <section class="reveal" aria-labelledby="cat-${cat.slug}">
          <a href="/services/${cat.slug}/" style="text-decoration:none;color:inherit">
            <h2 id="cat-${cat.slug}" class="font-heading" style="font-size:1.25rem;font-weight:700;color:var(--color-primary);margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem">
              ${categoryIcons[cat.slug] ?? icons.leaf} ${cat.name}
            </h2>
          </a>
          <p style="font-size:0.9375rem;color:var(--color-text-light);margin-bottom:1.25rem;line-height:1.65">${cat.metaDescription}</p>
          <div class="grid-auto" style="gap:0.625rem">
            ${(servicesByCategory.get(cat.slug) ?? []).map(s => `
            <a href="/services/${s.slug}/" class="related-card">
              <div class="related-card__inner">
                <span class="related-card__name">${s.name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>
          <a href="/services/${cat.slug}/" class="btn btn-outline" style="margin-top:1rem;display:inline-flex;align-items:center;gap:0.4rem">
            View all ${cat.name} services ${icons.arrowRight}
          </a>
        </section>`).join("")}
      </div>

      <div class="cta-box reveal" style="margin-top:4rem;text-align:center">
        <h2 class="cta-box__title">Ready to Begin?</h2>
        <p class="cta-box__text">Call us today to schedule your first appointment with Dr. Hendry. New patients welcome.</p>
        <div style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center">
          <a href="tel:${NAP.phoneRaw}" class="btn btn-white">${icons.phone} ${NAP.phone}</a>
          <a href="/contact/" class="btn btn-outline-white">Contact Us</a>
        </div>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   PRIVACY POLICY PAGE  (/privacy)
   ============================================================ */
export function renderPrivacy(): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `${renderHead("Privacy Policy | Integrative Health Partners Greenville, SC", "Privacy Policy for Integrative Health Partners — how we collect, use, and protect your personal information.")}
<body data-page="privacy">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container-narrow" style="padding-top:2rem;padding-bottom:5rem">
      ${renderBreadcrumbs([{ name: "Privacy Policy" }])}

      <h1 class="section-title" style="margin-bottom:0.5rem">Privacy Policy</h1>
      <p style="color:var(--color-muted);font-size:0.875rem;margin-bottom:2.5rem">Last updated: ${today}</p>

      <div class="prose">
        <h2>1. Introduction</h2>
        <p>Integrative Health Partners ("IHP," "we," "us," or "our") operates the website at <a href="${BASE_URL}">${BASE_URL}</a>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or contact us. Please read this policy carefully. If you disagree with its terms, please discontinue use of this site.</p>

        <h2>2. Information We Collect</h2>
        <h3>Information You Provide Directly</h3>
        <ul>
          <li>Name, phone number, and email address when you contact us or request an appointment</li>
          <li>Health-related information you voluntarily share in inquiry forms or messages</li>
        </ul>
        <h3>Information Collected Automatically</h3>
        <ul>
          <li>IP address, browser type, operating system, referring URLs, and pages visited</li>
          <li>Cookies and similar tracking technologies (see Section 5)</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to your inquiries and schedule appointments</li>
          <li>Provide healthcare services and follow up on treatment</li>
          <li>Improve our website and services</li>
          <li>Send administrative communications related to your care</li>
          <li>Comply with applicable laws and regulations</li>
        </ul>
        <p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</p>

        <h2>4. HIPAA Notice</h2>
        <p>As a healthcare provider, Integrative Health Partners is subject to the Health Insurance Portability and Accountability Act (HIPAA). Protected Health Information (PHI) collected in connection with your care is governed by our separate <strong>Notice of Privacy Practices</strong>, which is provided to patients at the time of service. This website Privacy Policy governs information collected through this website only.</p>

        <h2>5. Cookies</h2>
        <p>Our website may use cookies and similar technologies to enhance your browsing experience and analyze site traffic. These are small data files placed on your device. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. However, some features of our website may not function properly without cookies.</p>

        <h2>6. Third-Party Services</h2>
        <p>Our website may use third-party services including Google Analytics (for site usage analytics), Google Maps (for location display), and Cloudflare (for security and performance). These services have their own privacy policies governing their use of your data.</p>

        <h2>7. Data Security</h2>
        <p>We implement administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2>8. Children's Privacy</h2>
        <p>Our website is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>

        <h2>9. Your Rights</h2>
        <p>Depending on your location, you may have the right to access, correct, or delete personal information we hold about you. To exercise these rights, please contact us at <a href="mailto:${NAP.email}">${NAP.email}</a> or call <a href="tel:${NAP.phoneRaw}">${NAP.phone}</a>.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date at the top of this page. We encourage you to review this policy periodically.</p>

        <h2>11. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us:</p>
        <address style="font-style:normal;line-height:1.8">
          <strong>Integrative Health Partners</strong><br>
          319 Wade Hampton Blvd, Ste A<br>
          Greenville, SC 29609<br>
          Phone: <a href="tel:${NAP.phoneRaw}">${NAP.phone}</a><br>
          Email: <a href="mailto:${NAP.email}">${NAP.email}</a>
        </address>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   MEDICAL DISCLAIMER PAGE  (/disclaimer)
   ============================================================ */
export function renderDisclaimer(): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `${renderHead("Medical Disclaimer | Integrative Health Partners Greenville, SC", "Medical disclaimer for Integrative Health Partners — this website is for informational purposes only and does not constitute medical advice.")}
<body data-page="disclaimer">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container-narrow" style="padding-top:2rem;padding-bottom:5rem">
      ${renderBreadcrumbs([{ name: "Medical Disclaimer" }])}

      <h1 class="section-title" style="margin-bottom:0.5rem">Medical Disclaimer</h1>
      <p style="color:var(--color-muted);font-size:0.875rem;margin-bottom:2.5rem">Last updated: ${today}</p>

      <div class="prose">
        <div style="padding:1.25rem 1.5rem;background:var(--color-bg-alt,#f8f8f8);border-left:4px solid var(--color-primary,#2563eb);border-radius:0.375rem;margin-bottom:2rem">
          <p style="margin:0;font-weight:600">The information provided on this website is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment, and should not replace consultation with a qualified healthcare professional.</p>
        </div>

        <h2>1. Not Medical Advice</h2>
        <p>The content on this website — including articles, blog posts, service descriptions, condition information, and all other materials — is provided for general informational and educational purposes only. This information is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
        <p>Always seek the advice of your physician, licensed acupuncturist, or other qualified healthcare provider with any questions you may have regarding a medical condition or treatment. Never disregard professional medical advice or delay seeking it because of something you have read on this website.</p>

        <h2>2. No Doctor-Patient Relationship</h2>
        <p>Viewing or using this website does not create a doctor-patient or practitioner-patient relationship between you and Integrative Health Partners or Dr. William Hendry. A professional relationship is only established through a formal intake process and mutual agreement.</p>

        <h2>3. Individual Results Vary</h2>
        <p>Treatment outcomes and results discussed on this website reflect general information and individual patient experiences. Results vary significantly based on individual health history, condition severity, compliance with treatment recommendations, and many other factors. No specific outcome is guaranteed.</p>

        <h2>4. Emergency Situations</h2>
        <p>If you are experiencing a medical emergency, call 911 or go to your nearest emergency room immediately. Do not use this website to seek emergency medical advice.</p>

        <h2>5. Integrative &amp; Complementary Medicine</h2>
        <p>Acupuncture, Chinese herbal medicine, functional medicine, and other integrative therapies discussed on this site are complementary approaches that may work alongside — but should not replace — conventional medical care for serious conditions. Always inform all of your healthcare providers about all treatments and supplements you are using.</p>

        <h2>6. Research References</h2>
        <p>Where research studies, clinical trials, or scientific publications are referenced on this website, such references are provided for informational context only. Individual clinical results may differ from study findings. Research in acupuncture and integrative medicine continues to evolve.</p>

        <h2>7. Scope of Practice</h2>
        <p>Dr. William Hendry is a licensed acupuncturist (SC License ACUP141) and Doctor of Acupuncture and Oriental Medicine (DAOM). He is not a medical doctor (MD) or osteopathic physician (DO) and does not practice conventional Western medicine. Services provided at Integrative Health Partners are within the lawful scope of acupuncture and Oriental medicine practice in South Carolina.</p>

        <h2>8. Contact Us</h2>
        <p>If you have questions about treatments or whether care at Integrative Health Partners is appropriate for your situation, please contact us directly — we are happy to discuss your needs:</p>
        <address style="font-style:normal;line-height:1.8">
          <strong>Integrative Health Partners</strong><br>
          319 Wade Hampton Blvd, Ste A<br>
          Greenville, SC 29609<br>
          Phone: <a href="tel:${NAP.phoneRaw}">${NAP.phone}</a><br>
          Email: <a href="mailto:${NAP.email}">${NAP.email}</a>
        </address>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   HTML SITEMAP PAGE  (/sitemap.html)
   ============================================================ */
export function renderSitemapHtml(blogPosts: { title: string; slug: string }[] = []): string {
  const corePages = [
    { name: "Home", href: "/" },
    { name: "About IHP", href: "/about/" },
    { name: "Dr. William Hendry", href: "/dr-hendry/" },
    { name: "Contact & Directions", href: "/contact/" },
    { name: "Health Blog", href: "/blog/" },
  ];

  const categoryPages = categoryDefinitions.map(c => ({ name: `${c.name} Services`, href: `/services/${c.slug}/` }));
  const conditionCatPages = [
    { name: "Pain & Musculoskeletal", href: "/conditions/pain-and-musculoskeletal/" },
    { name: "Neurological & Mental Health", href: "/conditions/neurological-mental-health/" },
    { name: "Hormonal & Women's Health", href: "/conditions/hormonal-womens-health/" },
    { name: "Digestive & Immune", href: "/conditions/digestive-immune/" },
  ];

  const head = renderHead("Site Map | Integrative Health Partners Greenville, SC", "Complete site map for Integrative Health Partners — all services, conditions, and pages.")
    .replace("</head>", `  <meta name="robots" content="noindex,nofollow" />\n</head>`);
  return `${head}
<body data-page="sitemap">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container-narrow" style="padding-top:2rem;padding-bottom:5rem">
      ${renderBreadcrumbs([{ name: "Site Map" }])}
      <h1 class="section-title" style="margin-bottom:2rem">Site Map</h1>

      <div class="prose">
        <h2>Core Pages</h2>
        <ul>
          ${corePages.map(p => `<li><a href="${p.href}">${p.name}</a></li>`).join("\n          ")}
        </ul>

        <h2>Services</h2>
        <h3>Service Categories</h3>
        <ul>
          ${categoryPages.map(p => `<li><a href="${p.href}">${p.name}</a></li>`).join("\n          ")}
        </ul>
        <h3>All Individual Services (130+)</h3>
        <ul>
          ${allServices.map(s => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join("\n          ")}
        </ul>

        <h2>Conditions We Treat</h2>
        <h3>Condition Categories</h3>
        <ul>
          ${conditionCatPages.map(p => `<li><a href="${p.href}">${p.name}</a></li>`).join("\n          ")}
        </ul>

        <h2>Blog Posts</h2>
        <ul>
          ${blogPosts.map(p => `<li><a href="/blog/${p.slug}/">${p.title}</a></li>`).join("\n          ")}
        </ul>

        <h2>Legal</h2>
        <ul>
          <li><a href="/privacy/">Privacy Policy</a></li>
          <li><a href="/disclaimer/">Medical Disclaimer</a></li>
        </ul>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   404 PAGE
   ============================================================ */
export function render404(): string {
  return `${renderHead("Page Not Found | Integrative Health Partners")}
<body data-page="404">
  ${renderNav(false)}

  <main class="page-top">
    <div class="page-404">
      <div>
        <div class="page-404__code">404</div>
        <h1 class="page-404__title">Page Not Found</h1>
        <p class="page-404__text">The page you're looking for doesn't exist or has been moved.</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:1rem">
          <a href="/" class="btn btn-primary">Go Home</a>
          <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} ${NAP.phone}</a>
        </div>
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   Functional Medicine Hub Page
   /functional-medicine-greenville-sc/
   ============================================================ */
export function renderFunctionalMedicineHub(): string {
  const hubFaqs = [
    {
      q: "What's the difference between functional medicine and naturopathic medicine?",
      a: "Both look for root causes rather than masking symptoms, but they differ in training and tools. Naturopathic doctors complete a 4-year naturopathic medical program. Dr. Hendry's training is in Oriental medicine (DAOM) combined with functional medicine principles and advanced diagnostics. His approach draws on traditional Chinese medicine's 2,000-year history of pattern-based diagnosis alongside modern laboratory testing — a combination naturopathic training doesn't typically include."
    },
    {
      q: "Do I need a referral to see a functional medicine practitioner in Greenville?",
      a: "No referral is needed. You can call (864) 365-6156 or email info@ihpgreenville.com to schedule directly. If you've been referred by a physician, we welcome the collaboration and will communicate with your referring provider as appropriate."
    },
    {
      q: "Does insurance cover functional medicine?",
      a: "Integrative Health Partners is a cash-pay practice. We don't bill insurance directly, but we provide itemized superbills you can submit for potential out-of-network reimbursement. Standard lab work ordered through functional medicine is often covered by insurance — the consultation fee typically is not. Many patients find the investment worthwhile given that addressing root causes tends to reduce total healthcare spending over time."
    },
    {
      q: "How long before I see results from functional medicine?",
      a: "It depends on the condition and how long it has been present. Most patients notice meaningful improvement in energy, cognitive clarity, and symptom burden within 6—10 weeks of following a complete protocol. Longstanding chronic conditions — autoimmune disease, hormone dysregulation, complex digestive dysfunction — typically require 3—6 months to shift substantially, with ongoing monitoring and protocol refinement along the way."
    },
    {
      q: "What lab tests does functional medicine use that my GP doesn't order?",
      a: "Standard annual labs screen for pathology. Functional medicine testing goes further: full thyroid panels (TSH, free T3, free T4, reverse T3, TPO and TG antibodies), fasting insulin and HOMA-IR, 4-point cortisol rhythm, complete sex hormone panels, advanced inflammatory markers (hs-CRP, homocysteine, ferritin), gut microbiome analysis, intestinal permeability testing, food sensitivity panels, and nutritional deficiency screening. Many patients have completely normal standard labs while having significant dysfunction that these functional markers reveal."
    },
    {
      q: "Is Dr. Hendry a medical doctor?",
      a: "Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) — the doctoral-level credential in Oriental medicine — not an MD degree. He is NCBAHM board-certified (#114498) and practiced with hospital privileges at Prisma Health for nine years, where he participated in clinical research on needle-based alternatives to opioids in the Emergency Department. He applies functional medicine diagnostic principles alongside his Oriental medicine training, giving him a distinctly broad clinical perspective that most single-modality practitioners don't have."
    },
    {
      q: "What is the downside of functional medicine?",
      a: "It's worth being honest about this. Functional medicine is almost always cash-pay — insurance does not cover the consultation, and while standard lab work may be reimbursable, specialty functional panels often are not. The time commitment is real: initial consultations run 60—90 minutes, follow-ups are regular, and meaningful improvement typically requires 3—6 months of consistent effort. This approach also demands active participation — dietary changes, sleep optimization, and lifestyle modifications are not optional extras but core to the protocol. And functional medicine is not appropriate for acute emergencies or conditions that require immediate medical or surgical intervention. If you're looking for a quick fix, this isn't it. If you're willing to invest in addressing the actual cause of what's been driving your symptoms, the outcomes tend to be more durable than symptom management alone."
    },
    {
      q: "What is the average cost of a functional medicine doctor?",
      a: "Integrative Health Partners is a cash-pay practice, so there are no insurance negotiations — what you see is what you pay. Initial new patient consultations are longer and more comprehensive than a standard office visit, reflecting the intake depth required to build an accurate root-cause picture. Follow-up appointments are shorter and priced accordingly. Lab costs vary depending on which panels are ordered — a basic functional panel runs differently than a full hormone, gut, and metabolic workup. We provide itemized superbills after each visit so you can submit for out-of-network reimbursement if you carry PPO coverage. Many patients find that resolving a chronic condition reduces total healthcare spending over time — fewer specialist co-pays, fewer prescriptions, fewer unresolved symptoms driving repeat visits. Call (864) 365-6156 for current pricing."
    },
    {
      q: "Do functional medicine doctors treat diabetes?",
      a: "Yes — type 2 diabetes and insulin resistance are among the conditions functional medicine is particularly well-suited to address, because both are driven by underlying factors that conventional care rarely targets directly: chronic inflammation, gut microbiome disruption, sleep dysregulation, nutrient insufficiencies (particularly magnesium, chromium, and vitamin D), and metabolic dysfunction that begins years before a diabetes diagnosis. At IHP, we look at fasting insulin and HOMA-IR alongside standard glucose and HbA1c — markers that reveal insulin resistance well before blood sugar becomes diagnostic. Protocols focus on restoring metabolic function through dietary intervention, targeted supplementation, and lifestyle modification. Berberine, for instance, has multiple published trials showing effects on blood glucose comparable to metformin. For patients already on metformin or other medications, functional medicine works alongside conventional treatment — we're not asking you to stop your medications; we're working to improve the underlying terrain. Type 1 diabetes is a different situation — autoimmune in origin — but even there, functional medicine can address the immune dysregulation and gut permeability factors that research associates with autoimmune progression."
    },
  ];

  const hubConditions = [
    { name: "Hormone Imbalance", slug: "hormone-imbalance" },
    { name: "Hashimoto's Thyroid", slug: "hashimotos" },
    { name: "Chronic Fatigue", slug: "chronic-fatigue" },
    { name: "IBS & Gut Issues", slug: "ibs-gut-issues" },
    { name: "Leaky Gut", slug: "leaky-gut" },
    { name: "PCOS", slug: "pcos" },
    { name: "Adrenal Fatigue", slug: "adrenal-fatigue" },
    { name: "Brain Fog", slug: "brain-fog" },
    { name: "Weight Issues", slug: "weight-issues" },
    { name: "Autoimmune Disease", slug: "autoimmune-disease" },
    { name: "Thyroid Issues", slug: "thyroid-issues" },
    { name: "Lyme Disease", slug: "lyme-disease" },
  ];

  const hubServices = [
    { name: "Functional Medicine Consultation", slug: "functional-medicine-consultation" },
    { name: "Functional Medicine Testing", slug: "functional-medicine-testing" },
    { name: "Integrative Medicine Consultation", slug: "integrative-medicine-consultation" },
    { name: "Holistic Health Assessment", slug: "holistic-health-assessment" },
    { name: "Hormone Testing", slug: "hormone-testing" },
    { name: "Thyroid Testing", slug: "thyroid-testing" },
    { name: "Adrenal Testing", slug: "adrenal-testing" },
    { name: "Gut Health Testing", slug: "gut-health-testing" },
  ];

  return `${renderHead(
    "Functional Medicine in Greenville, SC | Integrative Health Partners",
    "Root-cause functional and integrative medicine in Greenville, SC. Dr. William Hendry combines advanced lab testing, acupuncture, and herbal medicine to resolve chronic conditions. Call (864) 365-6156."
  )}
<body data-page="functional-medicine-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="page-hero page-hero--green">
      <div class="container">
        ${renderBreadcrumbs([{ name: "Functional Medicine in Greenville, SC" }])}
        <h1 class="page-hero__title font-display">Functional Medicine in Greenville, SC</h1>
        <p class="page-hero__subtitle">Root-cause diagnostics and integrative treatment for chronic conditions that conventional care manages but doesn't resolve</p>
      </div>
    </div>
    <div class="container section">
      <div class="main-sidebar">
        <div class="main-content">

          <section class="content-section">
            <h2>What Functional Medicine Actually Means Here</h2>
            <p>A lot of practices use the phrase "functional medicine" loosely. At Integrative Health Partners, it means something specific: when a patient arrives with fatigue, brain fog, weight that won't shift, and labs their GP called "normal" — Dr. Hendry doesn't start with a diagnosis and a matching treatment. He starts with a question: <em>what's actually driving this?</em></p>
            <p>The answer usually lives in the interconnections between systems that conventional medicine evaluates separately — how gut dysbiosis is affecting immune regulation, how subclinical thyroid dysfunction is slowing metabolism, how chronically elevated cortisol is disrupting sleep and creating insulin resistance, how nutritional deficiencies are impairing the enzymes behind neurotransmitter production. Standard lab panels miss most of this. Functional medicine testing is designed to find it.</p>
            <p><a href="/dr-hendry/" class="internal-link">Dr. William Hendry, DAOM</a> brings a perspective that is genuinely unusual in Upstate South Carolina: doctoral-level training in Oriental medicine — a system that has been identifying and treating patterns of systemic dysfunction for over 2,000 years — combined with modern functional medicine diagnostics, a full <a href="/services/chinese-herbal-medicine/" class="internal-link">in-house herbal pharmacy</a>, and the clinical background of nine years practicing alongside physicians at Prisma Health. Patients here aren't choosing between traditional and modern medicine. They get both.</p>
          </section>

          <section class="content-section">
            <h2>How This Differs From a Standard Primary Care Visit</h2>
            <p>The difference isn't which tests get ordered — it's what the results mean and what gets done with them. A TSH of 3.2 falls within the standard reference range, so a conventional provider marks it normal and moves on. A functional evaluation looks at free T3, free T4, reverse T3, and thyroid antibodies together — and recognizes that a TSH of 3.2 with low free T3, elevated reverse T3, and positive TPO antibodies tells a completely different story: early Hashimoto's autoimmune thyroid disease with impaired T4-to-T3 conversion. The patient has been symptomatic for years. The standard labs were "normal." Nothing was done.</p>
            <p>This pattern repeats across every functional system. Fasting glucose of 94 is technically normal; fasting insulin of 18 reveals insulin resistance years before glucose becomes a problem. A ferritin of 12 falls within the reference range; for a patient with brain fog and persistent fatigue, it explains exactly what's happening. Functional medicine uses the same diagnostic tools as conventional medicine — blood work, sometimes imaging — but interprets them through a different lens: not "is pathology present?" but "is this person's physiology working the way it should, and if not, exactly where and why?"</p>
            <p>The result is that patients who've spent years being told their tests are fine often leave their first follow-up appointment with a clear explanation for everything they've been experiencing — and a specific, logical plan to address it.</p>
          </section>

          <section class="content-section">
            <h2>What the Process Looks Like</h2>
            <ol style="padding-left:0;list-style:none">
              <li style="display:flex;gap:1rem;margin-bottom:1.25rem"><span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.875rem">1</span><div><strong>90-minute intake consultation</strong> — Dr. Hendry reviews your complete health history, symptom patterns, prior labs, medications, diet, sleep, stress, and environmental exposures. This is not a 15-minute appointment.</div></li>
              <li style="display:flex;gap:1rem;margin-bottom:1.25rem"><span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.875rem">2</span><div><strong>Targeted functional lab testing</strong> — Based on the intake findings, Dr. Hendry orders testing designed for your specific presentation using functional reference ranges — the range associated with optimal health, not merely the absence of diagnosed disease.</div></li>
              <li style="display:flex;gap:1rem;margin-bottom:1.25rem"><span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.875rem">3</span><div><strong>Results review and protocol delivery</strong> — At a dedicated follow-up appointment, Dr. Hendry walks through your results in plain language, explains the mechanisms behind what's found, and delivers a comprehensive, personalized treatment protocol.</div></li>
              <li style="display:flex;gap:1rem;margin-bottom:1.25rem"><span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.875rem">4</span><div><strong>Integrated treatment</strong> — The protocol typically combines dietary adjustments, targeted supplementation, <a href="/services/chinese-herbal-medicine/" class="internal-link">Chinese herbal medicine</a> from our in-house pharmacy, <a href="/services/acupuncture-therapy/" class="internal-link">acupuncture</a>, and lifestyle modifications calibrated to the specific lab findings and clinical picture.</div></li>
              <li style="display:flex;gap:1rem;margin-bottom:1.25rem"><span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.875rem">5</span><div><strong>Progress monitoring</strong> — Labs are repeated at 3—6 months to document objective changes and refine the protocol based on your response. The goal is measurable improvement, not indefinite management.</div></li>
            </ol>
            <p>The process begins with a <a href="/services/functional-medicine-consultation/" class="internal-link">functional medicine consultation</a>. Lab work is ordered through standard clinical labs — most basic panels are covered by insurance, and we provide documentation for submission of advanced panels.</p>
          </section>

          <section class="content-section">
            <h2>Conditions This Approach Addresses</h2>
            <p>Functional and integrative medicine is most valuable for conditions that fall between the cracks of conventional care — problems that are clearly real but don't show up cleanly on standard tests, or that have a diagnosis but no satisfying treatment. These often include hormonal dysfunction, chronic digestive disorders, immune dysregulation, fatigue-dominant presentations, and complex multi-system conditions where several physiological systems are disrupted simultaneously.</p>
            <div class="grid-auto sm:grid-2" style="margin-top:1.25rem">
              ${hubConditions.map(c => `
              <a href="/conditions/${c.slug}/" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${c.name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`).join("")}
            </div>
            <p style="margin-top:1rem;color:var(--color-muted)">These conditions frequently co-occur and share underlying drivers. A patient with PCOS often has insulin resistance, gut dysbiosis, adrenal dysfunction, and thyroid disruption simultaneously. Treating each in isolation rarely produces lasting results. Addressing them as a connected system does.</p>
          </section>

          <section class="content-section">
            <h2>Dr. Hendry's Background in Integrative Medicine</h2>
            <p>Dr. William Hendry holds the Doctor of Acupuncture and Oriental Medicine degree — the doctoral-level credential in the field — and is NCBAHM board-certified (#114498) with 25 years of clinical experience. He practiced with hospital privileges at Prisma Health for nine years, where he co-authored a landmark three-year study on needling techniques as alternatives to opioids in the Emergency Department. That research has been presented at national medical conferences and accumulated 54 citations in the clinical literature.</p>
            <p>His in-house herbal pharmacy is among the most complete in Upstate South Carolina — meaning patients receive same-day dispensing of professional-grade Chinese herbal formulas, not referrals to a health food store supplement aisle. His Injection Therapy certification allows him to administer high-dose nutrient injections as part of functional protocols — a service most integrative practices in the region don't offer.</p>
            <p>What this background produces is a clinician who can read the functional medicine literature critically, order and interpret advanced labs accurately, and build a treatment protocol that draws on the full spectrum of integrative medicine — acupuncture, Chinese herbs, targeted supplementation, and dietary intervention — rather than defaulting to a single tool.</p>
          </section>

          <section class="content-section">
            <h2>What the Evidence Shows</h2>
            <p>A 2019 study in the <em>Journal of Alternative and Complementary Medicine</em> compared outcomes for patients seen at a functional medicine center versus a primary care clinic within the same health system. At six months, functional medicine patients reported significantly greater improvement in health-related quality of life — a finding that held across diagnoses and patient demographics. The researchers attributed the difference to the comprehensive assessment model, time spent with patients, and the emphasis on root-cause intervention over symptom management alone.</p>
            <p>Acupuncture's role within integrative medicine is increasingly well-characterized: research published in journals including JAMA, the BMJ, and <em>Nature Reviews Neuroscience</em> shows acupuncture modulates inflammatory cytokines, HPA axis activity, gut motility, and autonomic nervous system tone — the same physiological systems that functional medicine protocols address through supplementation and dietary intervention. Using both approaches simultaneously targets the same dysfunction through complementary mechanisms, which is part of why the integrated model tends to produce more durable outcomes than either modality alone.</p>
          </section>

          <section class="content-section">
            <h2>Frequently Asked Questions</h2>
            ${hubFaqs.map(faq => `
            <div class="faq-item reveal">
              <button class="faq-btn" aria-expanded="false">${faq.q}<span class="faq-chevron" aria-hidden="true">${icons.chevronDown}</span></button>
              <div class="faq-body"><div class="faq-content">${faq.a}</div></div>
            </div>`).join("")}
          </section>

          <div style="margin-top:2rem">
            <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Related Services</h2>
            <div class="grid-auto sm:grid-2">
              ${hubServices.map(s => `
              <a href="/services/${s.slug}/" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${s.name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`).join("")}
            </div>
          </div>

          <div class="cta-box" style="margin-top:2.5rem">
            <h3 class="cta-box__title">Ready to find out what's actually going on?</h3>
            <p class="cta-box__text">A functional medicine consultation starts with a thorough history and ends with a clear, specific plan. Call to schedule with Dr. Hendry — new patients welcome.</p>
            <div class="cta-box__actions">
              <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Call ${NAP.phone}</a>
              <a href="/contact/" class="btn btn-secondary">Send a Message</a>
            </div>
          </div>

        </div>
        <aside class="sidebar">
          <div class="cta-box">
            <h3 class="cta-box__title">Schedule a Consultation</h3>
            <p class="cta-box__text">New patients welcome. No referral needed.</p>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-white btn-full">${icons.phone} ${NAP.phone}</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Why Dr. Hendry?</p>
            <div class="check-list">
              <div class="check-item">${icons.check}<span>25+ years clinical experience</span></div>
              <div class="check-item">${icons.check}<span>NCBAHM board-certified #114498</span></div>
              <div class="check-item">${icons.check}<span>Hospital privileges — Prisma Health (9 yrs)</span></div>
              <div class="check-item">${icons.check}<span>5 peer-reviewed research publications</span></div>
              <div class="check-item">${icons.check}<span>Full in-house herbal pharmacy</span></div>
              <div class="check-item">${icons.check}<span>Injection therapy certified</span></div>
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Conditions We Treat</p>
            ${conditionCategories.map(cc => `<a href="/conditions/${cc.slug}/" class="sidebar-link">${cc.shortName}</a>`).join("")}
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB PAGE 1: BACK & SPINE PAIN
   Consolidates: /conditions/back-pain, /conditions/sciatica
   URL: /conditions/back-and-spine-pain
   ============================================================ */
export function renderBackSpineHub(): string {
  const title = "Back Pain & Sciatica Treatment in Greenville, SC | IHP";
  const desc = "Acupuncture, dry needling, and functional medicine for back pain and sciatica in Greenville, SC. Dr. William Hendry, DAOM — 25+ years, Prisma Health credentials, evidence-based needle therapy. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/back-and-spine-pain/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can acupuncture actually help chronic back pain?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, with strong evidence behind it. The American College of Physicians recommends acupuncture as a first-line treatment for chronic low back pain — before prescription medications. The Acupuncture Trialists' Collaboration pooled data from 39 randomized trials (20,827 patients) and found acupuncture significantly outperforms sham treatment and no treatment for chronic back pain, with outcomes that hold at 12-month follow-up." } },
      { "@type": "Question", "name": "How many sessions will I need for back pain?", "acceptedAnswer": { "@type": "Answer", "text": "Acute back pain (under 6 weeks) typically responds in 4–6 sessions. Chronic back pain lasting more than 12 weeks usually requires 8–12 sessions for lasting improvement. Many patients continue monthly maintenance sessions. Dr. Hendry gives a realistic timeline estimate at the first appointment based on your specific presentation." } },
      { "@type": "Question", "name": "What causes sciatica and how is it different from back pain?", "acceptedAnswer": { "@type": "Answer", "text": "Sciatica is compression or irritation of the sciatic nerve — most often from a herniated disc at L4/L5 or L5/S1, spinal stenosis, or piriformis syndrome. The defining feature is radiating pain that travels from the lower back down through the buttock and leg, sometimes to the foot. Back pain without that radiation pattern typically originates in muscles, ligaments, or facet joints rather than nerve roots." } },
      { "@type": "Question", "name": "I've already had physical therapy and it didn't work — what's different here?", "acceptedAnswer": { "@type": "Answer", "text": "Physical therapy works on the structural contributors to back pain. Acupuncture addresses central sensitization — the neurological state in which the spinal cord and brain have amplified their pain response, generating pain even when the original structural injury has healed. Central sensitization is measurable and reversible, but it doesn't respond to manual therapy alone. Many patients who plateaued with PT see significant improvement with acupuncture because it targets the neurological driver of chronic pain." } },
      { "@type": "Question", "name": "How do you know if someone needs surgery vs. conservative care?", "acceptedAnswer": { "@type": "Answer", "text": "Red flags that require urgent surgical referral: progressive leg weakness, loss of bladder or bowel control, saddle anesthesia (numbness in the inner thighs and perineum), or foot drop. In the absence of those, conservative care — acupuncture, dry needling, functional medicine — is the appropriate first-line approach and succeeds in the majority of cases. Dr. Hendry performs a thorough assessment at every initial visit and refers when the clinical picture warrants it." } },
      { "@type": "Question", "name": "What is piriformis syndrome and how does it cause sciatica?", "acceptedAnswer": { "@type": "Answer", "text": "The piriformis muscle sits deep in the buttock, directly adjacent to the sciatic nerve. In piriformis syndrome, the muscle goes into sustained spasm — typically from prolonged sitting, overuse, or prior trauma — and presses on the nerve, mimicking disc herniation sciatica. It's frequently misdiagnosed. Dry needling into the piriformis is one of the most effective treatments for piriformis-related sciatica, often producing rapid, significant relief." } },
    ]
  };

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Back & Spine Pain" },
      ])}

      <div class="main-sidebar">
        <article>

          <!-- Hero -->
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Pain &amp; Musculoskeletal</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">Back Pain &amp; Sciatica Treatment in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Acupuncture, dry needling, and functional medicine for chronic back pain and sciatic nerve pain — treating the structural injury, the neurological driver, and the systemic factors keeping you from healing. Led by Dr. William Hendry, DAOM, with 25+ years of clinical experience and 5 peer-reviewed publications on needle-based pain management.
          </p>

          <!-- Dr. Hendry's opening — first person -->
          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">Most back pain patients who find their way to my clinic have already done the standard route: ibuprofen, physical therapy, maybe a cortisone injection. Some have had MRIs and been told their spine shows "degenerative changes" — a finding so common in adults over 40 that it's practically universal and nearly useless as a diagnosis. The imaging shows what's there. It doesn't explain why you're in pain when someone with identical imaging findings isn't.</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">I spent nine years on staff at Prisma Health, where I co-led a three-year Emergency Department study on needle-based alternatives to opioids for acute pain management — back pain was the primary presenting complaint. Five peer-reviewed publications, 54 citations. What that research confirmed, and what 25 years of clinical practice has reinforced, is that chronic back pain is almost never purely structural — and treating it as if it is produces exactly the outcomes most of these patients have already experienced.</p>
            <p style="color:var(--color-muted);line-height:1.8">The question I care about answering isn't where your back hurts. It's why it hasn't healed.</p>
          </div>

          <!-- Why chronic back pain persists -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Why Chronic Back Pain Doesn't Resolve on Its Own</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">The lumbar spine is designed to carry load and transmit force between the upper and lower body — five vertebrae stacked above the sacrum, cushioned by discs, stabilized by ligaments, and supported by a muscular system that coordinates across the entire lumbopelvic complex with every movement. When something in that system fails, pain-signaling nociceptors in the affected tissue fire. In an acute injury, that's appropriate and time-limited.</p>
            <p style="margin-bottom:1rem">The problem in chronic pain is central sensitization. After roughly three to six months of persistent pain signals, the spinal cord and brain begin to upregulate their sensitivity — a well-documented neuroplastic process in which the central nervous system essentially "turns up the volume" on incoming pain signals. A sensitized nervous system generates pain responses to stimuli that would normally be innocuous. An MRI cannot show central sensitization. Physical therapy does not reverse it. This is why so many chronic back pain patients plateau with conventional care: the treatment is aimed at the structure, but the driver of persistent pain has become neurological.</p>
            <p style="margin-bottom:1rem">Acupuncture directly addresses central sensitization. Needle insertion at specific anatomical points activates descending inhibitory pathways from the periaqueductal gray — the brain's endogenous pain-suppression system — releasing endorphins, serotonin, and norepinephrine into the dorsal horn of the spinal cord. This is not theoretical. The Acupuncture Trialists' Collaboration pooled individual patient data from 39 randomized trials representing 20,827 patients and concluded that acupuncture significantly outperforms both sham acupuncture and no-treatment controls for chronic low back pain, with effect sizes that hold at 12-month follow-up. The American College of Physicians now recommends acupuncture as a first-line treatment for chronic low back pain — before prescription medications.</p>
          </div>

          <!-- Sciatica section -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Sciatica: Nerve Compression vs. Nerve Sensitization</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">Sciatica is back pain's most recognizable presentation — that sharp, radiating pain that travels from the lower back through the buttock and down the leg, sometimes all the way to the foot. It follows the sciatic nerve, the longest in the body, originating at lumbar roots L4 through S3 and running through the buttock and down the posterior leg.</p>
            <p style="margin-bottom:1rem">The compression source matters clinically, and getting it right determines the treatment. A herniated disc at L5/S1 compresses the S1 nerve root and produces calf pain and weakness when standing on tiptoe. Piriformis syndrome — where the piriformis muscle, which sits directly adjacent to the sciatic nerve in the buttock, goes into sustained spasm — mimics disc herniation exactly but doesn't require the same treatment at all. Spinal stenosis, the narrowing of the spinal canal that compresses multiple roots simultaneously, produces a different picture: pain that worsens with walking and improves with sitting and forward flexion. These require orthopedic examination to distinguish, not just an MRI report.</p>
            <p style="margin-bottom:1rem">I screen every sciatic patient for red flags before proceeding with conservative care: progressive leg weakness, bladder or bowel changes, saddle anesthesia (numbness in the inner thighs and groin), foot drop. When those are present, this is not a situation for acupuncture — it's a surgical consult. When they're absent, which is the overwhelming majority of presentations, conservative care is not just appropriate — it's what the evidence supports as first-line treatment, and surgery is the option of last resort.</p>
            <p>I've had patients avoid sciatic surgery with the right combination of trigger point dry needling and acupuncture. I've also referred patients who didn't improve after an appropriate course of treatment — because nine years of hospital-level practice teaches you when conservative care has reached its ceiling. Knowing the difference is the clinical skill that matters.</p>
          </div>

          <!-- How IHP treats it -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">How We Treat Back Pain &amp; Sciatica at IHP</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Acupuncture</strong> — Precise point selection based on classical Bladder and Gallbladder channel pathways, which anatomically correspond to the paraspinal musculature and sciatic nerve distribution. Reduces central sensitization via descending inhibitory pathway activation. Most patients notice meaningful improvement within 4–6 sessions.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Dry Needling</strong> — Targeted deactivation of myofascial trigger points in the lumbar paraspinals, quadratus lumborum, piriformis, gluteus medius, and psoas major. These trigger points are a primary, frequently overlooked source of both back pain and sciatic radiation. A local twitch response confirms deactivation — many patients feel the referred pain pattern change during the session itself.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Electroacupuncture</strong> — For disc herniation cases with nerve root compression and for patients with significant central sensitization, I use frequency-specific electrical stimulation through the needles. Two Hz stimulates beta-endorphin release; higher frequencies modulate dynorphin and enkephalin. This is a pharmacological decision, not a setting I apply routinely — it's selected based on the neurological picture.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Cupping Therapy</strong> — Along the lumbar and sacral region, cupping decompresses tight fascial layers, improves circulation in hypoxic paraspinal tissue, and reduces the soft-tissue stiffness that limits spinal mobility. Particularly effective for patients who describe their back as feeling "locked" after sleeping or sitting.</p>
            <p><strong style="color:var(--color-text)">Prolotherapy</strong> — For patients with ligamentous laxity contributing to chronic instability — spondylolisthesis, recurring lumbar sprains that never fully resolve, SI joint hypermobility — prolotherapy injections of hypertonic dextrose into the affected ligament insertions stimulate collagen synthesis and structural tightening. This addresses a source of back pain that needling alone cannot resolve: mechanically unstable connective tissue.</p>
          </div>

          <!-- Functional medicine angle -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">The Systemic Factors Most Back Pain Clinics Miss</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">When a patient has had back pain for years and hasn't responded to every structural intervention, the question becomes: what's preventing the tissue from healing? The answer is usually systemic, and usually involves several of the following.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Chronic cortisol elevation</strong> from ongoing psychological stress directly suppresses tissue repair by downregulating growth factors and promoting a catabolic hormonal environment. A patient managing significant life stress isn't going to heal optimally no matter how good the manual care is.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Magnesium deficiency</strong> — present in over 50% of Americans — maintains elevated resting muscle tension and prevents the nervous system from down-regulating chronic pain signals. It's one of the most correctable factors in chronic pain, and one of the most consistently overlooked.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Gut dysbiosis and intestinal permeability</strong> generate systemic inflammatory cytokines — IL-6, TNF-alpha, IL-1beta — that sensitize pain pathways throughout the body, including in the spine. The gut-back pain connection is real, measurable, and underappreciated. Some of the most dramatic back pain recoveries I've seen came from patients who finally addressed their gut health.</p>
            <p>When appropriate, I order a comprehensive functional panel: inflammatory markers (hs-CRP, ESR, homocysteine), nutrient levels (magnesium, vitamin D, B12, omega-3 index), hormones (cortisol, DHEA, thyroid). Addressing what we find changes the healing environment — and then the acupuncture and dry needling can do what they're designed to do.</p>
          </div>

          <!-- What to expect -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">What to Expect at Your First Visit</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">Your first appointment runs 75–90 minutes. After a comprehensive intake covering your full health history — not just your back — Dr. Hendry performs an orthopedic assessment: range of motion, palpation of spinal segments and trigger points, neurological screening (reflexes, dermatomal sensation, straight leg raise). From this, he identifies which structures are generating your pain and which systemic factors are maintaining it.</p>
            <p style="margin-bottom:1rem">Treatment begins at the first appointment. Most acute presentations improve within 4–6 sessions. Chronic back pain or complex sciatica typically follows an 8–12 session arc, with measurable improvement at each interval. Dr. Hendry reassesses at sessions 4 and 8, adjusting the protocol based on your tissue response — this is not a fixed script.</p>
            <p>Bring any imaging you have (MRI, X-ray). It's useful context, but it's not required — many patients with "abnormal" findings on imaging do very well, and treatment decisions are based on clinical examination, not imaging alone.</p>
          </div>

          <!-- FAQ -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${[
              { q: "Can acupuncture actually help chronic back pain?", a: "Yes, and with strong evidence. The American College of Physicians recommends acupuncture as a first-line treatment for chronic low back pain before prescription medications. The Acupuncture Trialists' Collaboration pooled data from 39 randomized trials (20,827 patients) and found acupuncture significantly outperforms sham treatment and no-treatment controls — with outcomes maintained at 12-month follow-up." },
              { q: "How many sessions will I need?", a: "Acute back pain (under 6 weeks): 4–6 sessions. Chronic back pain (over 12 weeks): 8–12 sessions for lasting improvement, with monthly maintenance afterward. Sciatica from disc herniation typically requires 8–10 sessions; piriformis-related sciatica often resolves faster. Dr. Hendry gives a specific estimate at your first visit." },
              { q: "I've already had physical therapy and it didn't work — what's different here?", a: "Physical therapy addresses structural contributors. Acupuncture addresses central sensitization — the state in which the nervous system has amplified its pain response independently of the original injury. Central sensitization doesn't respond to manual therapy alone. Many patients who plateaued with PT see significant improvement with acupuncture and dry needling because the treatment is targeting a different mechanism." },
              { q: "What is piriformis syndrome and how is it diagnosed?", a: "Piriformis syndrome occurs when the piriformis muscle in the buttock compresses the adjacent sciatic nerve, producing sciatic-pattern pain that's indistinguishable by symptoms alone from disc herniation. The distinction requires orthopedic examination — specific provocation tests and palpation. Dry needling into the piriformis is one of the fastest and most effective treatments when piriformis syndrome is the correct diagnosis." },
              { q: "How do you know if someone needs surgery instead of conservative care?", a: "Red flags that require immediate surgical referral: progressive lower extremity weakness, loss of bladder or bowel control, saddle anesthesia, or foot drop. In the absence of those findings — which describes the vast majority of back pain and sciatica presentations — conservative care is the evidence-supported first-line approach. Dr. Hendry performs a thorough assessment at every new patient visit and refers promptly when the clinical picture warrants it." },
              { q: "Does prolotherapy help chronic back pain?", a: "For back pain driven by ligamentous laxity — spondylolisthesis, sacroiliac hypermobility, recurring sprains that never fully stabilize — prolotherapy addresses the structural instability that needling alone cannot resolve. Hypertonic dextrose injected into the affected ligament insertions stimulates collagen synthesis and tightening of the supporting structures. Not every back pain patient needs prolotherapy, but for the right clinical presentation, it produces outcomes that other conservative treatments don't." },
            ].map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <!-- Related Services -->
          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Treatments We Use for Back Pain &amp; Sciatica</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Dry Needling Therapy", "dry-needling-therapy"],
              ["Electroacupuncture", "electroacupuncture"],
              ["Prolotherapy", "prolotherapy"],
              ["Cupping Therapy", "cupping-therapy"],
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "9 Years Hospital Privileges — Prisma Health", "5 Peer-Reviewed Publications | 54 Citations", "Co-Investigator, ED Opioid Alternative Study", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Neck Pain", "neck-pain"], ["Hip Pain", "hip-pain"], ["Fibromyalgia", "fibromyalgia"], ["Neuropathy", "neuropathy"], ["Sports Injuries", "sports-injuries"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB 2: JOINT & MUSCLE PAIN
   Consolidates: neck-pain, knee-pain, hip-pain, shoulder-pain,
                 headaches-migraines, arthritis, sports-injuries
   URL: /conditions/joint-and-muscle-pain
   ============================================================ */
export function renderJointMuscleHub(): string {
  const title = "Joint & Muscle Pain Treatment in Greenville, SC | IHP";
  const desc = "Acupuncture, dry needling, and functional medicine for neck pain, knee pain, hip pain, shoulder pain, arthritis, headaches, and sports injuries. Dr. William Hendry, DAOM. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/joint-and-muscle-pain/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can acupuncture help with osteoarthritis of the knee or hip?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, with strong clinical evidence. Multiple randomized trials and systematic reviews confirm acupuncture provides significant pain reduction and functional improvement in knee and hip osteoarthritis — endorsed by major rheumatology organizations. It reduces synovial inflammation, improves joint lubrication factors, and addresses the central sensitization that makes arthritic joints hurt at rest." } },
      { "@type": "Question", "name": "What causes headaches to come from the neck?", "acceptedAnswer": { "@type": "Answer", "text": "Cervicogenic headaches originate in the cervical spine and suboccipital muscles. A tight suboccipital muscle can compress the greater occipital nerve and generate headaches that radiate from the base of the skull forward over the scalp. These are frequently misdiagnosed as tension or migraine headaches, and they respond dramatically to acupuncture and dry needling aimed at the cervical source rather than headache medications." } },
      { "@type": "Question", "name": "How many sessions does it take to see improvement in joint pain?", "acceptedAnswer": { "@type": "Answer", "text": "Acute joint injuries typically respond in 3–6 sessions. Chronic conditions like osteoarthritis or frozen shoulder usually require 8–12 sessions for lasting improvement. Dr. Hendry gives a specific timeline estimate at the first visit based on your presentation." } },
      { "@type": "Question", "name": "Is dry needling the same as acupuncture?", "acceptedAnswer": { "@type": "Answer", "text": "They use similar tools but different frameworks. Dry needling targets myofascial trigger points using a Western anatomical model. Acupuncture uses a Chinese medicine framework of channels, points, and systemic regulation. Dr. Hendry is trained in both and integrates them — using each where the clinical evidence is strongest." } },
      { "@type": "Question", "name": "Can frozen shoulder be treated without surgery?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Acupuncture is one of the most effective conservative treatments for frozen shoulder (adhesive capsulitis). Multiple clinical trials confirm it significantly speeds recovery compared to physical therapy alone. The natural untreated course is 18–24 months; patients treated with acupuncture often regain full mobility in 3–6 months without surgery." } },
      { "@type": "Question", "name": "What sports injuries respond best to acupuncture and dry needling?", "acceptedAnswer": { "@type": "Answer", "text": "Tendinopathies (Achilles, patellar, rotator cuff), hamstring and groin strains, ITB syndrome, plantar fasciitis, and chronic overuse conditions respond particularly well. Dry needling of trigger points that develop after injury provides rapid pain relief and restores normal movement patterns. Cupping accelerates recovery between training sessions." } },
    ]
  };

  const faqs = [
    { q: "Can acupuncture slow arthritis progression?", a: "For osteoarthritis, reducing systemic inflammation through diet, targeted supplementation, and acupuncture can slow cartilage degradation. For rheumatoid arthritis, functional medicine approaches that modulate the immune response — gut healing, elimination of dietary triggers, vitamin D optimization — may reduce long-term joint damage alongside conventional DMARD therapy." },
    { q: "What is the connection between neck pain and headaches?", a: "Cervicogenic headaches are extremely common and frequently misdiagnosed as tension headaches or migraines. Suboccipital muscle tightness compresses the greater occipital nerve; trigger points in the upper trapezius and sternocleidomastoid generate referred pain over the skull. Treating the neck directly often resolves headaches that haven't responded to any headache-specific treatment." },
    { q: "How do you treat frozen shoulder?", a: "I use a combination of acupuncture along Eight Extra Meridian protocols that dramatically speed adhesive capsulitis recovery, trigger point dry needling of the subscapularis and infraspinatus, and cupping along the upper back and posterior shoulder. Multiple clinical trials confirm acupuncture speeds frozen shoulder resolution from the natural 18–24 month course to 3–6 months in most patients." },
    { q: "Does acupuncture help migraine prevention?", a: "Yes. The Cochrane review on acupuncture for migraines (2016) concluded it is at least as effective as prophylactic drug treatments for reducing migraine frequency — with fewer side effects. Beyond acupuncture, I evaluate functional drivers: magnesium deficiency (present in the majority of migraine sufferers), mitochondrial CoQ10 deficiency, hormonal triggers, food sensitivities, and histamine intolerance." },
    { q: "Can sports injuries be prevented, not just treated?", a: "Yes, and preventive assessment is an important part of what I do. Identifying muscle imbalances, connective tissue deficiencies, and training load issues before they cause injury is the most effective strategy. Athletes with recurrent injuries at the same site almost always have a systemic or biomechanical contributing factor that standard treatment never addresses." },
  ];

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Joint & Muscle Pain" },
      ])}
      <div class="main-sidebar">
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Pain &amp; Musculoskeletal</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">Joint &amp; Muscle Pain Treatment in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Acupuncture, dry needling, and functional medicine for neck pain, knee pain, hip pain, shoulder pain, arthritis, headaches, and sports injuries — treating the mechanical source, the neurological driver, and the systemic factors determining recovery. Led by Dr. William Hendry, DAOM, with 25+ years of clinical experience and published research in needle-based pain management.
          </p>

          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">Every joint in the body is a mechanical problem sitting inside a biochemical environment. The mechanics — which structure is loaded, how it moves, where the dysfunction lives in the kinetic chain — matter enormously. But so does the biochemical environment the joint heals in: the inflammatory burden driven by diet and gut health, the cortisol pattern from chronic stress, the magnesium and vitamin D levels that determine whether connective tissue can repair between treatment sessions.</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">I don't treat the knee in isolation. I don't treat the shoulder without evaluating the thoracic spine and cervical nerve roots. When a patient comes in with frozen shoulder and I find they have poorly controlled diabetes, those two facts are not unrelated — frozen shoulder is four times more common in diabetics, and the joint won't recover well until the metabolic environment is addressed alongside the local treatment.</p>
            <p style="color:var(--color-muted);line-height:1.8">My Prisma Health research was on needle-based alternatives to opioids for acute pain — back and joint pain were the primary presentations. What I learned from three years of emergency medicine data is that the mechanical picture and the neurological picture are almost never separable, and that needle therapy addresses both simultaneously in a way that nothing else does.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Conditions Treated at This Hub</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Neck Pain</strong> — The neck carries a 12-pound head through hundreds of movements per hour. Most chronic neck pain is maintained by a combination of postural pattern, suboccipital trigger points, and cervical disc or facet dysfunction that generates referral into the upper trapezius and produces occipital headaches. Acupuncture at local cervical points plus distal points, cupping along the upper back, and trigger point dry needling into the suboccipitals and levator scapulae resolves most presentations. Cervical disc herniations causing radiculopathy into the arm respond well to electroacupuncture.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Knee Pain</strong> — The knee fails in the context of what's above and below it. Weak hip abductors allow valgus collapse. Overpronating feet increase tibial internal rotation. Tight hip flexors load the patellofemoral joint. I assess the full kinetic chain, then treat with acupuncture targeting synovial inflammation, cupping for swelling and stiffness, and dry needling of the quadriceps and ITB trigger points that compress the joint. For osteoarthritis, I combine local treatment with functional medicine evaluation of the systemic inflammatory drivers accelerating cartilage breakdown.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Hip Pain</strong> — True hip joint pain is felt in the groin. Pain on the outer hip is usually trochanteric bursitis or gluteus medius dysfunction. Buttock pain is often piriformis or SI joint. Getting the source right determines the treatment. Acupuncture along the Gallbladder and Liver channels, dry needling of the piriformis and gluteals, and cupping over the lateral hip address the musculoskeletal picture. Clinical trials in hip osteoarthritis confirm meaningful pain reduction and functional improvement.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Shoulder Pain</strong> — Rotator cuff tendinopathy, frozen shoulder (adhesive capsulitis), and subacromial bursitis make up the majority of shoulder presentations. Frozen shoulder responds remarkably well to acupuncture — the natural 18–24 month recovery course shortens to 3–6 months with appropriate needle therapy. For rotator cuff tendinopathy, electroacupuncture stimulates collagen synthesis and reduces the chronic tendon inflammation that manual therapy alone doesn't adequately address.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Headaches &amp; Migraines</strong> — Migraines are a disorder of central sensitization — the brain's threshold for triggering neuroinflammatory cascades has been lowered by nutrient deficiencies (magnesium in the majority of sufferers), mitochondrial energy deficits, hormonal fluctuations, or gut-derived histamine. Acupuncture for migraine prevention is validated in multiple Cochrane reviews as equivalent to prophylactic medication without side effects. Cervicogenic headaches — originating in the suboccipitals — require treatment at the neck, not headache medication.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Arthritis</strong> — Osteoarthritis is not simply wear and tear. It's cartilage degrading faster than it can repair, driven substantially by systemic inflammatory load. Visceral fat and gut dysbiosis produce cytokines that directly accelerate cartilage breakdown. Diet, metabolic function, and gut health are as important as local treatment. For rheumatoid arthritis, I work alongside rheumatologists addressing the gut-immune axis and dietary triggers that drive autoimmune activity.</p>
            <p><strong style="color:var(--color-text)">Sports Injuries</strong> — Acute injuries and overuse syndromes respond extremely well to acupuncture, dry needling of trigger points developed around the injury, and cupping for local circulation. What distinguishes athletes who recover quickly from those who don't is usually systemic: sleep, nutrition, inflammatory burden, and training load management. I evaluate and address the full picture.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">The Systemic Dimension of Joint Pain</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Magnesium deficiency</strong> — present in over 50% of Americans — maintains elevated resting muscle tension and prevents the nervous system from down-regulating chronic pain signals. One of the most correctable and most consistently overlooked factors in musculoskeletal care.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Chronic inflammation</strong> from gut dysbiosis, dietary load, or metabolic dysfunction generates cytokines (IL-6, TNF-alpha) that sensitize pain pathways, suppress tissue repair, and accelerate joint degeneration. Addressing the inflammatory source — not just the pain it produces — is what changes long-term outcomes.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Vitamin D deficiency</strong> impairs muscle function, reduces immune regulation, and is independently associated with increased pain sensitivity. Correcting to optimal levels (60–80 ng/mL) is one of the simplest high-impact interventions in musculoskeletal care.</p>
            <p>When appropriate, I add functional medicine testing to the local treatment protocol: inflammatory markers, nutrient status, cortisol rhythm, thyroid function. Addressing what we find changes the healing environment — and then the acupuncture and dry needling can do what they're designed to do.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${faqs.map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Treatments We Use for Joint &amp; Muscle Pain</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Dry Needling Therapy", "dry-needling-therapy"],
              ["Electroacupuncture", "electroacupuncture"],
              ["Cupping Therapy", "cupping-therapy"],
              ["Prolotherapy", "prolotherapy"],
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "9 Years Hospital Privileges — Prisma Health", "5 Peer-Reviewed Publications | 54 Citations", "Co-Investigator, ED Opioid Alternative Study", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Back & Spine Pain", "back-and-spine-pain"], ["Fibromyalgia", "fibromyalgia"], ["Autoimmune & Chronic Illness", "autoimmune-and-chronic-illness"], ["Fatigue, Brain & Nervous System", "fatigue-brain-nervous-system"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB 3: HORMONAL & THYROID HEALTH
   Consolidates: hashimotos, thyroid-issues, adrenal-fatigue,
                 pcos, menopause, perimenopause, hormone-imbalance
   URL: /conditions/hormonal-and-thyroid-health
   ============================================================ */
export function renderHormonalThyroidHub(): string {
  const title = "Hormonal & Thyroid Health in Greenville, SC | IHP";
  const desc = "Functional medicine for Hashimoto's, thyroid dysfunction, adrenal fatigue, PCOS, menopause, perimenopause, and hormone imbalance. Dr. William Hendry, DAOM. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/hormonal-and-thyroid-health/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Why do I still have symptoms when my TSH is normal?", "acceptedAnswer": { "@type": "Answer", "text": "TSH tells you the pituitary's signaling — not what the thyroid is actually producing, how efficiently T4 converts to active T3, or whether antibodies are silently destroying thyroid tissue. Many patients feel well only when TSH is between 1.0–2.0 and free T3 is in the upper third of its range. Standard testing misses this. Dr. Hendry runs a complete thyroid panel: TSH, free T3, free T4, reverse T3, TPO antibodies, and thyroglobulin antibodies." } },
      { "@type": "Question", "name": "Can Hashimoto's antibodies be reduced?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Strict gluten elimination, selenium supplementation (200mcg/day — multiple RCTs show 21–40% TPO antibody reduction), vitamin D optimization, and gut healing can significantly reduce TPO and thyroglobulin antibodies. Some patients achieve complete antibody normalization, protecting remaining thyroid tissue from further autoimmune destruction." } },
      { "@type": "Question", "name": "What drives PCOS if I'm not overweight?", "acceptedAnswer": { "@type": "Answer", "text": "Insulin resistance is the primary driver of PCOS in the majority of cases — including lean women. Elevated insulin stimulates the ovaries to produce excess testosterone and disrupts follicle maturation. Fasting insulin and HOMA-IR testing identify insulin resistance even when weight is normal. Treating the insulin resistance is what changes the underlying hormonal pattern." } },
      { "@type": "Question", "name": "Why is my mood so different in perimenopause?", "acceptedAnswer": { "@type": "Answer", "text": "Progesterone often declines a decade before estrogen does — quietly, while cycles are still regular. Low progesterone reduces GABA receptor sensitivity, producing anxiety, insomnia, and irritability with a clear hormonal explanation. This pattern is consistently missed because standard labs don't test progesterone outside of fertility workups." } },
      { "@type": "Question", "name": "What is the four-point cortisol test and why is it more useful than blood cortisol?", "acceptedAnswer": { "@type": "Answer", "text": "The four-point salivary cortisol test measures cortisol at waking, morning, afternoon, and evening — capturing the full diurnal curve. Single-point blood cortisol detects only extreme pathology (Addison's, Cushing's) and misses the dysregulated rhythm that produces HPA axis dysfunction. The curve reveals whether the problem is low morning cortisol, high evening cortisol, or both — each requiring different treatment." } },
      { "@type": "Question", "name": "Can acupuncture help with hot flashes?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Multiple randomized controlled trials confirm acupuncture significantly reduces hot flash frequency and severity by regulating hypothalamic thermoregulation through beta-endorphin pathways. It is particularly valuable for women who prefer not to use hormone therapy. Effects are sustained beyond the treatment period in most clinical trials." } },
    ]
  };

  const faqs = [
    { q: "What panel does Dr. Hendry run for thyroid evaluation?", a: "TSH, free T3, free T4, reverse T3, TPO antibodies, and thyroglobulin antibodies. TSH alone misses poor T4-T3 conversion, subclinical Hashimoto's before significant antibody accumulation, and the clinical state in which free T3 is inadequate despite a 'normal' TSH. I interpret against clinical optimal ranges — TSH 1.0–2.0, free T3 in the upper third — not population-derived lab reference ranges." },
    { q: "Should I avoid iodine with Hashimoto's?", a: "High-dose iodine supplementation can exacerbate Hashimoto's autoimmunity. Normal dietary iodine from food sources is generally fine. Selenium supplementation (200mcg/day) counterbalances iodine's potentially pro-inflammatory effects and is among the most evidence-backed interventions in integrative thyroid care." },
    { q: "What does adrenal testing actually involve?", a: "Four-point salivary cortisol, measured at waking, morning, afternoon, and evening — capturing the full diurnal curve that a single morning blood draw misses entirely. I also test DHEA-S, which reveals adrenal reserve that cortisol alone doesn't show. The pattern of the curve — not just absolute values — is the clinically informative finding." },
    { q: "How long does hormone balancing typically take?", a: "Hormonal systems recalibrate slowly. Most patients notice symptom improvement within 4–8 weeks, with hormones more fully optimized at 3–6 months. For Hashimoto's, antibody reduction requires 3–6 months of strict protocol adherence. Adrenal recovery from significant HPA dysregulation can take 6–12 months depending on severity." },
    { q: "Can PCOS be treated without birth control pills?", a: "Yes. Birth control pills suppress the hormonal cycle externally but don't address the insulin resistance driving androgen excess in most PCOS cases. My protocol corrects insulin resistance through dietary change, myo-inositol supplementation, and acupuncture — restoring ovulation naturally, particularly important for women trying to conceive." },
  ];

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Hormonal & Thyroid Health" },
      ])}
      <div class="main-sidebar">
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Hormonal &amp; Women's Health</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">Hormonal &amp; Thyroid Health in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Comprehensive functional medicine evaluation and treatment for Hashimoto's thyroiditis, thyroid dysfunction, adrenal fatigue, PCOS, menopause, perimenopause, and hormonal imbalance. The evaluations most patients have never had. The testing that actually answers the clinical question.
          </p>

          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">The most common sentence I hear from new hormonal patients is: "My doctor told me everything looks normal." TSH in range. Estradiol within normal limits. Cortisol came back fine on that one morning blood draw. Nothing actionable.</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">Those results aren't inaccurate — they're incomplete. TSH tells me the pituitary's signaling, not what the thyroid is producing or how efficiently T4 is converting to active T3. A single morning blood cortisol detects only extreme Addison's or Cushing's — it misses the dysregulated diurnal cortisol pattern that explains fatigue, insomnia, and poor stress tolerance in the majority of my adrenal patients.</p>
            <p style="color:var(--color-muted);line-height:1.8">My evaluation begins where the standard workup ends. The tests I order answer the actual clinical question — not just the easiest version of it.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">The Hormonal Conditions I Treat</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Hashimoto's Thyroiditis</strong> — The most common autoimmune disease in the developed world, affecting an estimated 14 million Americans. The immune system produces antibodies that progressively destroy thyroid tissue. Standard treatment replaces the hormone. It doesn't ask why the immune system is attacking the gland. My protocol addresses both: strict gluten elimination (reduces TPO antibodies in multiple RCTs), selenium supplementation at 200mcg/day, gut healing to remove the autoimmune trigger, and thyroid hormone optimization based on free T3.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Thyroid Dysfunction</strong> — TSH tells you the pituitary's request. Free T3 tells you what cells are actually receiving. Free T4 tells you what the thyroid is producing. Reverse T3 tells you if there's a conversion block. T4-to-T3 conversion requires selenium, zinc, and iron — and is impaired by chronic stress, gut dysbiosis, and low-calorie dieting. 'Normal' TSH misses all of this.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Adrenal Fatigue / HPA Axis Dysregulation</strong> — A signaling problem, not organ failure. The four-point salivary cortisol curve reveals whether someone has low morning cortisol causing fatigue, high evening cortisol disrupting sleep, or both. Adaptogens (ashwagandha, rhodiola, licorice root) are selected based on the specific cortisol pattern. Blood sugar stabilization removes the hypoglycemic cortisol spikes that perpetuate the cycle.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">PCOS</strong> — Affects 8–13% of reproductive-age women. In the majority of cases, including lean women, insulin resistance stimulates ovarian androgen excess and disrupts follicle maturation. A landmark Swedish study showed electroacupuncture normalizes LH levels and reduces testosterone in PCOS patients. My protocol uses myo-inositol (multiple RCTs), dietary modification, and acupuncture to correct the underlying physiology — not suppress symptoms with oral contraceptives.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Menopause &amp; Perimenopause</strong> — Perimenopause begins with progesterone decline, often a decade before estrogen follows — and that early progesterone deficiency explains the anxiety, worsening PMS, and sleep disruption that arrives years before hot flashes. Acupuncture reduces hot flash frequency and severity through hypothalamic thermoregulation. I discuss bioidentical hormone therapy candidly with every patient and coordinate with gynecologists when HRT is appropriate.</p>
            <p><strong style="color:var(--color-text)">Hormonal Imbalance</strong> — The hormonal system is deeply interconnected. Cortisol depletes progesterone precursors. Insulin resistance drives androgen excess in women and reduces testosterone in men. Gut dysbiosis impairs estrogen metabolism. My evaluation traces the upstream driver rather than simply adding hormones without asking why they dropped.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">What Comprehensive Hormonal Testing Looks Like</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Full thyroid panel:</strong> TSH, free T3, free T4, reverse T3, TPO and thyroglobulin antibodies — against clinical optimal ranges, not just lab reference ranges.</p>
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Sex hormones:</strong> Estradiol, progesterone (at cycle-appropriate timing), free and total testosterone, DHEA-S, SHBG — providing the full reproductive hormone picture.</p>
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Adrenal function:</strong> Four-point salivary cortisol capturing the full diurnal curve — the only method that identifies dysregulated patterns missed by single-point blood testing.</p>
            <p><strong style="color:var(--color-text)">Metabolic hormones:</strong> Fasting insulin, HOMA-IR, HbA1c — identifying insulin resistance before diabetes develops, relevant to PCOS and general hormonal complaints.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${faqs.map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Services for Hormonal &amp; Thyroid Health</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Chinese Herbal Medicine", "chinese-herbal-medicine"],
              ["Dry Needling Therapy", "dry-needling-therapy"],
              ["Electroacupuncture", "electroacupuncture"],
              ["Ozone Therapy", "ozone-therapy"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "9 Years Hospital Privileges — Prisma Health", "5 Peer-Reviewed Publications | 54 Citations", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Gut & Digestive Health", "gut-and-digestive-health"], ["Fertility & Women's Health", "fertility-and-womens-health"], ["Autoimmune & Chronic Illness", "autoimmune-and-chronic-illness"], ["Fatigue, Brain & Nervous System", "fatigue-brain-nervous-system"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB 4: GUT & DIGESTIVE HEALTH
   Consolidates: ibs-gut-issues, leaky-gut, food-sensitivities
   URL: /conditions/gut-and-digestive-health
   ============================================================ */
export function renderGutDigestiveHub(): string {
  const title = "IBS, Leaky Gut & Food Sensitivities in Greenville, SC | IHP";
  const desc = "Functional medicine for IBS, leaky gut, and food sensitivities in Greenville, SC. Dr. Hendry identifies SIBO, intestinal permeability, and dietary triggers with precision testing. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/gut-and-digestive-health/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is SIBO and how does it cause IBS symptoms?", "acceptedAnswer": { "@type": "Answer", "text": "Small intestinal bacterial overgrowth (SIBO) occurs when bacteria from the colon colonize the small intestine. These bacteria ferment food and produce hydrogen and methane gas — directly causing the bloating, abdominal pain, and altered bowel habits that define IBS. Research finds SIBO in up to 78% of IBS patients. It's diagnosed with a hydrogen/methane breath test and is highly treatable with herbal antimicrobials or targeted antibiotics." } },
      { "@type": "Question", "name": "Is leaky gut a real medical condition?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Intestinal permeability is documented in the peer-reviewed literature in celiac disease, IBD, IBS, type 1 diabetes, multiple sclerosis, and virtually every autoimmune condition studied. The underlying pathophysiology — loss of tight junction integrity allowing bacterial antigens and food proteins into the bloodstream — is scientifically well-established and measurable." } },
      { "@type": "Question", "name": "How is food sensitivity different from a food allergy?", "acceptedAnswer": { "@type": "Answer", "text": "Food allergies are immediate (minutes after eating), IgE-mediated, and can cause anaphylaxis. Food sensitivities are delayed (hours to days), IgG-mediated or permeability-driven, and cause chronic inflammatory symptoms — bloating, brain fog, joint pain — rather than acute reactions. Standard allergy tests don't detect food sensitivities." } },
      { "@type": "Question", "name": "What is the 5R gut restoration protocol?", "acceptedAnswer": { "@type": "Answer", "text": "The 5R protocol systematically addresses intestinal dysfunction: Remove offending foods and pathogens (including SIBO treatment); Replace digestive enzymes where deficient; Reinoculate with beneficial bacteria; Repair the gut lining with glutamine, zinc carnosine, collagen, and vitamin A; and Rebalance lifestyle factors including stress, sleep, and diet." } },
      { "@type": "Question", "name": "Can gut problems cause symptoms outside the digestive system?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — and this is one of the most clinically important points in functional medicine. Brain fog, joint pain, skin conditions (eczema, psoriasis, acne), anxiety, depression, autoimmune flares, and fatigue are all documented downstream manifestations of intestinal permeability and gut dysbiosis. The gut houses 70% of the immune system — when it's dysregulated, the effects are felt throughout the body." } },
      { "@type": "Question", "name": "How long does it take to heal leaky gut?", "acceptedAnswer": { "@type": "Answer", "text": "Mild to moderate intestinal permeability typically improves significantly within 8–12 weeks of a comprehensive gut healing protocol. Severe or long-standing permeability may take 6–12 months. Dr. Hendry uses zonulin and lactulose/mannitol testing to establish an objective baseline and track healing progress." } },
    ]
  };

  const faqs = [
    { q: "What testing does Dr. Hendry use for digestive conditions?", a: "SIBO hydrogen/methane breath test (run on essentially every IBS patient given the 78% prevalence data), intestinal permeability markers (zonulin and lactulose/mannitol ratio), IgG food sensitivity panel to guide the elimination protocol, comprehensive stool microbiome analysis, and inflammatory markers (hsCRP, calprotectin for IBD differentiation). This identifies the specific dysfunction driving each patient's presentation." },
    { q: "Is the low-FODMAP diet a long-term solution?", a: "No — it's a diagnostic and symptomatic tool, not a permanent diet. The low-FODMAP elimination phase identifies specific fermentable carbohydrate triggers. Systematic reintroduction clarifies which specific FODMAPs are problematic. Long-term FODMAP restriction impoverishes the gut microbiome and is not appropriate as an ongoing dietary pattern." },
    { q: "Can stress cause IBS flares?", a: "Yes, through the gut-brain axis. Psychological stress directly affects gut motility, permeability, and pain sensitivity via the enteric nervous system and vagus nerve. Acupuncture is clinically effective for IBS partly because it addresses the neural regulation of the gut alongside the structural gut dysfunction. Addressing both dimensions is required for lasting improvement." },
    { q: "What foods actually help heal the gut lining?", a: "Bone broth and collagen (glycine and proline support enterocyte repair), fermented foods (beneficial bacteria and short-chain fatty acids strengthen the mucosal lining), cooked vegetables (butyrate-producing fiber feeds colonocytes), and omega-3 fatty acids (reduce gut mucosal inflammation). Equally important: removing gluten, alcohol, NSAIDs, and excess sugar that directly damage the gut barrier." },
    { q: "Can acupuncture help IBS and gut issues?", a: "Yes. Multiple systematic reviews confirm acupuncture significantly improves abdominal pain, bloating, and bowel habit regularity in IBS. The mechanisms include enteric nervous system regulation, reduction of visceral hypersensitivity, gut-brain axis modulation, and direct effects on gut motility. Most patients notice improvement in pain and bloating from their first few sessions." },
  ];

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Gut & Digestive Health" },
      ])}
      <div class="main-sidebar">
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Digestive &amp; Immune Health</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">IBS, Leaky Gut &amp; Food Sensitivities in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Functional medicine and acupuncture for IBS, intestinal permeability, and food sensitivities — using precision testing to identify SIBO, gut dysbiosis, and specific dietary triggers, then addressing root causes with a systematic protocol. Not another generic fiber recommendation.
          </p>

          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">I run a SIBO breath test on essentially every IBS patient who comes through my door. The published research puts SIBO prevalence at up to 78% in IBS patients — too high to skip the test and go straight to a generic dietary recommendation. What I find shapes the entire protocol: methane-dominant SIBO is treated differently than hydrogen-dominant, and both require gut restoration after bacterial overgrowth is cleared.</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">The most frustrating clinical scenario in GI is a patient who's been told: "Your colonoscopy was normal, so it's IBS." SIBO doesn't show up on a colonoscopy. Intestinal permeability doesn't. Food sensitivities don't. None of the functional pathology that explains the majority of IBS presentations is visible on standard endoscopy. Functional testing is what answers the question.</p>
            <p style="color:var(--color-muted);line-height:1.8">The gut is also never a local problem. It's the source of 70% of the immune system. Gut dysbiosis drives neuroinflammation. Intestinal permeability underlies virtually every autoimmune condition. When I treat gut dysfunction, I'm also addressing the systemic conditions downstream — and that's where the most dramatic improvements often happen for patients who thought their brain fog, joint pain, or skin problems had nothing to do with their gut.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">IBS &amp; Gut Dysfunction: What the Colonoscopy Misses</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">IBS is 'functional' dysfunction — neurological and microbial, not structural — and it requires functional testing to identify. The relevant pathology doesn't appear on standard endoscopy.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">SIBO</strong> — Found in up to 78% of IBS patients. Hydrogen-dominant SIBO produces diarrhea-predominant IBS; methane-dominant SIBO (Intestinal Methanogen Overgrowth) produces constipation-predominant IBS. I use herbal antimicrobial protocols (berberine, oregano, allicin-based formulas) that are highly effective and gentler on the microbiome than rifaximin for most patients.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Gut dysbiosis</strong> — An imbalanced microbiome with insufficient beneficial species alters gut motility, intestinal permeability, and visceral pain sensitivity. Comprehensive stool analysis identifies dysbiotic patterns, pathogenic bacteria, and markers of gut inflammation.</p>
            <p><strong style="color:var(--color-text)">Post-infectious IBS</strong> — Developing after a GI infection, this involves enteric nervous system damage to the migrating motor complex that creates the conditions for SIBO. Many patients trace their IBS to a specific illness — which has specific treatment implications.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Leaky Gut: The Root of Systemic Inflammation</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">The gut wall is one cell layer thick in places, controlled by tight junction proteins. When those junctions open — triggered by gliadin (a gluten protein that directly activates zonulin), chronic NSAID use, alcohol, chronic stress, or gut infections — bacteria, toxins, and food proteins cross into circulation. The immune system responds.</p>
            <p style="margin-bottom:1rem">The result isn't always digestive. Brain fog. Joint pain. Skin conditions. Autoimmune flares. These are downstream presentations of intestinal permeability in organs with no obvious connection to the gut — driven by systemic immune activation. Intestinal permeability is documented in virtually every autoimmune condition studied.</p>
            <p>Dr. Hendry tests intestinal permeability with validated markers — zonulin and the lactulose/mannitol ratio — to establish objective baseline and track healing. The 5R gut restoration protocol addresses it systematically: Remove offending foods and pathogens, Replace digestive factors, Reinoculate the microbiome, Repair the lining with glutamine and zinc carnosine, and Rebalance lifestyle factors.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Food Sensitivities: The 72-Hour Delay</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">The 72-hour delay between eating a trigger food and its consequences is what makes food sensitivities so difficult to self-identify. Unlike food allergies — immediate IgE responses — food sensitivities are slow, IgG-mediated reactions that show up as bloating the next day, brain fog the day after, a headache two days later. Without systematic elimination and reintroduction, most patients never connect the dots.</p>
            <p style="margin-bottom:1rem">The most common triggers: gluten, dairy, eggs, soy, corn, nightshades. Gluten sensitivity distinct from celiac disease — non-celiac gluten sensitivity — is increasingly recognized as a real condition capable of causing neurological, gastrointestinal, and systemic symptoms through intestinal permeability and neuroinflammation.</p>
            <p>I use IgG food sensitivity testing as a map for the initial elimination phase, then walk patients through systematic reintroduction — one food every three days, tracking symptoms carefully. The elimination-reintroduction protocol is the gold standard. The goal is healing the underlying gut barrier — not permanent dietary restriction.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${faqs.map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Services for Gut &amp; Digestive Health</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Chinese Herbal Medicine", "chinese-herbal-medicine"],
              ["Biopuncture Therapy", "biopuncture-therapy"],
              ["Ozone Therapy", "ozone-therapy"],
              ["Dry Needling Therapy", "dry-needling-therapy"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "9 Years Hospital Privileges — Prisma Health", "5 Peer-Reviewed Publications | 54 Citations", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Autoimmune & Chronic Illness", "autoimmune-and-chronic-illness"], ["Hormonal & Thyroid Health", "hormonal-and-thyroid-health"], ["Fatigue, Brain & Nervous System", "fatigue-brain-nervous-system"], ["Back & Spine Pain", "back-and-spine-pain"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB 5: FATIGUE, BRAIN & NERVOUS SYSTEM
   Consolidates: chronic-fatigue, brain-fog, anxiety-stress,
                 depression, insomnia, ptsd, neuropathy, cognitive-decline
   URL: /conditions/fatigue-brain-nervous-system
   ============================================================ */
export function renderFatigueBrainHub(): string {
  const title = "Fatigue, Brain & Nervous System Conditions | Greenville, SC | IHP";
  const desc = "Functional medicine and acupuncture for chronic fatigue, brain fog, anxiety, depression, insomnia, PTSD, neuropathy, and cognitive decline. Dr. William Hendry, DAOM. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/fatigue-brain-nervous-system/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is post-exertional malaise and why does it matter?", "acceptedAnswer": { "@type": "Answer", "text": "Post-exertional malaise (PEM) is the hallmark of ME/CFS: a worsening of all symptoms 12–48 hours after even mild physical or cognitive exertion. It reflects abnormal cellular energy metabolism — mitochondria cannot meet the energy demand. This has a critical treatment implication: conventional graded exercise therapy is harmful in true ME/CFS because it repeatedly triggers PEM. Dr. Hendry uses a pacing-based approach that works within the current energy envelope." } },
      { "@type": "Question", "name": "Can Long COVID cause chronic fatigue?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Long COVID fatigue shares nearly identical features with ME/CFS — post-exertional malaise, unrefreshing sleep, brain fog, and orthostatic intolerance. It is driven by neuroinflammation, mitochondrial damage, gut microbiome disruption, and autonomic dysfunction. Dr. Hendry has developed specific Long COVID recovery protocols addressing each of these mechanisms." } },
      { "@type": "Question", "name": "Can acupuncture help with anxiety and panic attacks?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. A 2018 meta-analysis confirmed acupuncture significantly reduces anxiety compared to no treatment, medications, and psychotherapy. Acupuncture modulates amygdala fear-processing activity, increases GABA and serotonin availability, reduces cortisol, and activates the parasympathetic nervous system. Panic attack frequency and severity typically decrease significantly within 6–8 sessions." } },
      { "@type": "Question", "name": "What is Battlefield Acupuncture and how does it help PTSD?", "acceptedAnswer": { "@type": "Answer", "text": "Battlefield Acupuncture (BFA) is an auricular protocol using five specific ear points shown to rapidly reduce pain and stress. Developed by a U.S. Air Force physician and validated in military PTSD populations, it's incorporated into VA programs at multiple medical centers. Dr. Hendry combines BFA with body acupuncture targeting amygdala-calming points to reduce sympathetic hyperarousal without requiring verbal trauma processing." } },
      { "@type": "Question", "name": "Can acupuncture help neuropathy and nerve pain?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry co-authored research on acupuncture for taxane-induced peripheral neuropathy at Prisma Health. Electroacupuncture improves nerve conduction velocity, reduces pain scores, and promotes nerve regeneration by increasing nerve growth factor expression and improving microcirculation in peripheral nerves." } },
      { "@type": "Question", "name": "What drives cognitive decline and can it be addressed?", "acceptedAnswer": { "@type": "Answer", "text": "Alzheimer's and most dementias are driven by multiple converging biological factors: insulin resistance in the brain, neuroinflammation, hormonal decline, nutritional deficiencies (especially B12 and homocysteine from MTHFR variants), heavy metal burden, and sleep disruption impairing the glymphatic system. These are identifiable and addressable. The highest-leverage intervention window is in your 40s–60s, before structural changes are established." } },
    ]
  };

  const faqs = [
    { q: "What tests does Dr. Hendry run for unexplained fatigue?", a: "Beyond standard blood work: four-point salivary cortisol, comprehensive thyroid panel, B12/methylmalonic acid (functional B12 status), iron studies, vitamin D, organic acids (mitochondrial function), inflammatory markers (hsCRP, homocysteine), viral titers (EBV, CMV, HHV-6), and gut microbiome assessment. Standard CBC and metabolic panels miss the drivers of the majority of chronic fatigue cases." },
    { q: "What is causing my 2–3am waking?", a: "Early morning waking (2–4am) is most commonly associated with blood sugar drops triggering a cortisol response, or low progesterone in perimenopausal women (progesterone supports GABA-mediated sleep and is lowest in the early morning hours). High evening cortisol from HPA axis dysregulation also keeps the nervous system activated into the early morning. The cortisol rhythm, glucose regulation, and hormonal status together identify which mechanism is active." },
    { q: "Can depression have a physical cause?", a: "Very commonly. Hypothyroidism mimics depression and is one of the most commonly missed reversible causes. B12, omega-3, folate, iron, zinc, and vitamin D deficiencies are each independently associated with depressive symptoms. Neuroinflammation from gut dysbiosis disrupts serotonin synthesis and reduces BDNF. Testing and correcting these factors can resolve depression that hasn't responded to antidepressants." },
    { q: "Can neuropathy be reversed?", a: "Peripheral nerves regenerate slowly — approximately 1–2mm per day. The degree of recovery depends on type, mechanism, and severity of damage. Diabetic neuropathy requires blood sugar optimization alongside nerve support; B12 deficiency neuropathy resolves with repletion; chemotherapy-induced neuropathy responds to electroacupuncture. Early intervention gives the best prognosis." },
    { q: "How early should I address cognitive decline risk?", a: "The biology of Alzheimer's begins 15–20 years before symptoms appear. Most modifiable drivers — insulin resistance, sleep apnea, B12 deficiency, thyroid dysfunction, heavy metal burden — are identifiable and correctable now. The highest-impact intervention window is in your 40s through 60s. If you're noticing cognitive symptoms — even subtle ones — evaluation makes sense immediately." },
  ];

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Fatigue, Brain & Nervous System" },
      ])}
      <div class="main-sidebar">
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Neurological &amp; Mental Health</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">Fatigue, Brain &amp; Nervous System Conditions</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Functional medicine and acupuncture for chronic fatigue syndrome, Long COVID, brain fog, anxiety, depression, insomnia, PTSD, peripheral neuropathy, and cognitive decline. Comprehensive neurological and biological evaluation — with published research in heart rate variability biofeedback and needle-based neurological therapies behind the clinical protocols.
          </p>

          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">The brain and nervous system operate at the intersection of every other body system — hormonal, immunological, gut-based, mitochondrial. When neurological and fatigue conditions haven't responded to conventional treatment, it's almost always because the evaluation stopped too early. Standard labs found nothing. Nobody checked the cortisol rhythm, the mitochondrial function markers, the gut microbiome, or the viral titers. The biology that explains these conditions is real and measurable — it just requires looking for it.</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">My published research includes heart rate variability biofeedback for symptom management — which means I work with autonomic nervous system regulation as a clinical variable, not just a theoretical concept. HRV is a direct window into the balance between sympathetic activation and parasympathetic recovery — and it's measurably disrupted in anxiety, PTSD, chronic fatigue, and fibromyalgia. I use it as an objective treatment monitoring tool.</p>
            <p style="color:var(--color-muted);line-height:1.8">I co-authored research on acupuncture for taxane-induced peripheral neuropathy at Prisma Health. When a neuropathy patient comes in, I'm applying a research-developed protocol — not working from general principles.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Conditions Covered at This Hub</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Chronic Fatigue Syndrome / ME-CFS</strong> — Post-exertional malaise defines this condition: not tiredness, but a worsening of all symptoms 12–48 hours after even mild exertion. This reflects mitochondrial dysfunction, HPA axis dysregulation, NK cell impairment, neuroinflammation, and gut dysbiosis. Standard panels miss all of it. Organic acids, four-point cortisol, viral titers, and microbiome analysis identify the actual drivers. Pacing is fundamental; conventional graded exercise therapy is contraindicated.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Brain Fog</strong> — A symptom with many roots: neuroinflammation from gut dysbiosis or post-viral effects, thyroid dysfunction, blood sugar dysregulation, hormonal imbalance, B12 or iron deficiency, or mitochondrial impairment. Most brain fog has identifiable biological drivers — they appear on targeted testing. Post-COVID brain fog involves active neuroinflammation, endothelial dysfunction, and mitochondrial damage.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Anxiety &amp; Stress</strong> — Anxiety has a biology. HPA axis dysregulation, magnesium deficiency (in up to 70% of Americans), gut dysbiosis reducing GABA production, and thyroid dysfunction generate anxiety independently. Acupuncture modulates amygdala activity, increases GABA, reduces cortisol — results confirmed in multiple meta-analyses. I identify the physiological drivers rather than treating anxiety as a purely psychological condition.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Depression</strong> — Neuroinflammation is a central mechanism — inflammatory cytokines disrupt serotonin synthesis and reduce BDNF. The 'chemical imbalance' model has led generations of patients to antidepressants without checking their B12, vitamin D, thyroid, or inflammatory markers. I coordinate with psychiatrists, contributing biological substrate correction that makes the brain more responsive to all treatment.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Insomnia</strong> — Sleep requires specific physiology: declining cortisol, rising melatonin, parasympathetic dominance, stable blood sugar. My HRV research gives me an objective window into autonomic state — whether the sympathetic nervous system is still dominant at bedtime. Low progesterone, high evening cortisol, and nocturnal hypoglycemia explain most insomnia that doesn't respond to sleep hygiene.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">PTSD</strong> — A neurological state. The amygdala is hyperactivated; the prefrontal cortex can't reliably override it. Battlefield Acupuncture and body acupuncture reduce sympathetic hyperarousal at the physiological level — complementing psychological treatment by making the nervous system more accessible to therapeutic work. I work with trauma-informed awareness and adjust technique for touch-sensitive patients.</p>
            <p style="margin-bottom:1rem"><strong style="color:var(--color-text)">Peripheral Neuropathy</strong> — I co-authored research on taxane-induced peripheral neuropathy at Prisma Health. Electroacupuncture improves nerve conduction velocity and promotes nerve regeneration through NGF expression. For diabetic neuropathy, functional medicine addresses blood sugar optimization, mitochondrial support, and nutritional deficiencies (B12 in metformin users, alpha-lipoic acid, acetyl-L-carnitine).</p>
            <p><strong style="color:var(--color-text)">Cognitive Decline &amp; Alzheimer's Prevention</strong> — The biology of Alzheimer's begins 15–20 years before symptoms. Insulin resistance in the brain, neuroinflammation, hormonal decline, elevated homocysteine, heavy metals, and sleep disruption impairing glymphatic clearance are all identifiable and modifiable. My comprehensive evaluation identifies them specifically. Scalp acupuncture targeting the memory cortex has the most specific clinical evidence base for cognitive support.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${faqs.map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Services for Neurological &amp; Fatigue Conditions</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Electroacupuncture", "electroacupuncture"],
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
              ["Chinese Herbal Medicine", "chinese-herbal-medicine"],
              ["Dry Needling Therapy", "dry-needling-therapy"],
              ["Ozone Therapy", "ozone-therapy"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "Published Research — HRV Biofeedback", "Research — Taxane-Induced Neuropathy (Prisma)", "9 Years Hospital Privileges — Prisma Health", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Hormonal & Thyroid Health", "hormonal-and-thyroid-health"], ["Gut & Digestive Health", "gut-and-digestive-health"], ["Autoimmune & Chronic Illness", "autoimmune-and-chronic-illness"], ["Back & Spine Pain", "back-and-spine-pain"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB 6: FERTILITY & WOMEN'S HEALTH
   Consolidates: fertility, pcos
   URL: /conditions/fertility-and-womens-health
   ============================================================ */
export function renderFertilityWomensHub(): string {
  const title = "Fertility Support & PCOS Treatment in Greenville, SC | IHP";
  const desc = "Acupuncture and functional medicine for fertility support and PCOS in Greenville, SC. Dr. Hendry improves IVF outcomes, restores ovulation, and addresses hormonal root causes. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/fertility-and-womens-health/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Does acupuncture improve IVF success rates?", "acceptedAnswer": { "@type": "Answer", "text": "Multiple randomized trials show acupuncture performed on the day of embryo transfer increases implantation and live birth rates. The data on acupuncture throughout the IVF cycle — during ovarian stimulation and retrieval phases — is even more promising. Dr. Hendry is experienced working alongside fertility clinics to time treatment appropriately within IVF protocols." } },
      { "@type": "Question", "name": "What is causing my PCOS if I'm not overweight?", "acceptedAnswer": { "@type": "Answer", "text": "Insulin resistance is the primary driver of PCOS in the majority of cases — including lean women. Elevated insulin stimulates the ovaries to produce excess testosterone and disrupts follicle maturation. Fasting insulin and HOMA-IR testing identify insulin resistance before weight changes appear." } },
      { "@type": "Question", "name": "How early before trying to conceive should I start acupuncture?", "acceptedAnswer": { "@type": "Answer", "text": "Ideally 3–6 months before your target conception window. This allows time to optimize egg quality (a 90-day maturation process), regulate cycles, balance hormones, and address nutritional deficiencies that affect embryo viability. Acupuncture and functional medicine are beneficial at any stage of the fertility journey." } },
      { "@type": "Question", "name": "What does unexplained infertility actually mean?", "acceptedAnswer": { "@type": "Answer", "text": "Unexplained infertility means nothing actionable was found by the standard workup — not that nothing is wrong. Subclinical thyroid dysfunction (TSH above 2.5 is associated with reduced implantation), CoQ10 deficiency affecting oocyte mitochondrial energy, uterine inflammation from food sensitivities, and undertreated male factor are common findings in functional medicine evaluation." } },
      { "@type": "Question", "name": "Can PCOS be treated without birth control pills?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Birth control pills suppress the hormonal cycle externally but don't address the insulin resistance driving androgen excess in most PCOS cases. Dr. Hendry's protocol uses myo-inositol, berberine, dietary modification, and acupuncture to correct the insulin resistance and restore ovulation naturally." } },
      { "@type": "Question", "name": "Can you treat male factor infertility?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Male factor is involved in 40–50% of infertility cases, yet it's frequently undertreated. Acupuncture, Chinese herbal medicine, and targeted supplementation (CoQ10, vitamin C, zinc, selenium, carnitine) significantly improve sperm count, motility, and morphology. Dr. Hendry evaluates male factor as a standard component of every fertility consultation." } },
    ]
  };

  const faqs = [
    { q: "What tests does Dr. Hendry run for fertility evaluation?", a: "Beyond standard reproductive labs: thyroid function (TSH above 2.5 is independently associated with reduced implantation — yet most labs flag only values above 4–5 as abnormal), fasting insulin and HOMA-IR, vitamin D, CoQ10 markers, full hormone panel, and inflammatory markers. For PCOS: DHEA-S, free testosterone, SHBG, LH:FSH ratio, and fasting insulin." },
    { q: "Is acupuncture safe during the two-week wait after IVF?", a: "Yes, with specific point protocols. Dr. Hendry uses a conservative and evidence-informed approach during the two-week wait — supporting uterine circulation and reducing cortisol while avoiding points contraindicated in early pregnancy. Acupuncture in the days following embryo transfer has been shown to improve implantation rates in multiple clinical trials." },
    { q: "Can Chinese herbal medicine help fertility?", a: "Yes. Chinese herbal medicine has been used for menstrual regulation and fertility support for centuries, and contemporary research confirms specific formula components modulate the HPO axis, improve endometrial receptivity, and support ovarian function. Dr. Hendry's in-house herbal pharmacy formulates custom prescriptions based on each patient's TCM pattern and laboratory findings." },
    { q: "How does PCOS affect fertility and what can be done?", a: "PCOS is the leading cause of ovulatory infertility. Insulin resistance and androgen excess disrupt follicle maturation and prevent ovulation. Restoring ovulation is the primary fertility goal — achieved through insulin resistance correction (myo-inositol, dietary change, berberine), HPO axis regulation with acupuncture, and Chinese herbal medicine for cycle normalization. Many PCOS patients who haven't ovulated in years achieve natural conception with consistent treatment." },
    { q: "What supplements support egg quality?", a: "CoQ10 (600–800mg/day) is the most evidence-backed egg quality supplement — it supports mitochondrial energy production in oocytes, and egg quality is substantially determined by mitochondrial function. DHEA supplementation has evidence for improving ovarian reserve markers in poor responders. Methylfolate, vitamin D, omega-3s, and vitamin C round out the core egg quality protocol." },
  ];

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Fertility & Women's Health" },
      ])}
      <div class="main-sidebar">
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Hormonal &amp; Women's Health</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">Fertility Support &amp; PCOS Treatment in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Acupuncture and functional medicine for fertility support, IVF optimization, and PCOS treatment — addressing the hormonal, metabolic, and nutritional factors that determine fertility outcomes with precision testing and clinical depth.
          </p>

          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">Fertility consultations are some of the most complex and emotionally weighted appointments in my practice. The timeline pressure is real. The failed cycles carry their own weight. When someone comes in after two unsuccessful IVF attempts and an 'unexplained infertility' diagnosis, the clinical question I'm asking is: what did the standard workup not look for?</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">The answer is often the thyroid. A TSH of 3.0 is 'normal' by most lab standards but associated with significantly reduced implantation rates in fertility research — and I target 1.0–2.0 for patients trying to conceive. Or CoQ10 deficiency affecting oocyte mitochondrial energy. Or subclinical insulin resistance in a woman who isn't overweight and whose PCOS was never diagnosed. Standard fertility workups aren't designed to find these. Functional medicine evaluation is.</p>
            <p style="color:var(--color-muted);line-height:1.8">I've worked with couples who achieved pregnancy after two failed IVF cycles once the underlying thyroid dysfunction or nutritional deficiency was identified and addressed. That specificity is what makes the difference.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Fertility Support: What Standard Testing Misses</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Thyroid optimization:</strong> TSH above 2.5 mIU/L is associated with reduced conception rates and increased miscarriage risk — yet most labs flag only values above 4.5 as abnormal. I target TSH 1.0–2.0 for fertility patients and run free T3, free T4, and antibodies alongside TSH.</p>
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Egg quality:</strong> CoQ10 (600–800mg/day) supports mitochondrial energy production in maturing oocytes — and egg quality is substantially determined by mitochondrial function. DHEA improves ovarian reserve markers in poor responders. These require the 90-day egg maturation window, ideally started 3–4 months before retrieval.</p>
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Insulin resistance:</strong> Impairs ovulatory function in normal-weight women and is the primary driver of PCOS in most cases. Fasting insulin and HOMA-IR identify it before weight changes appear.</p>
            <p style="margin-bottom:0.75rem"><strong style="color:var(--color-text)">Uterine environment:</strong> Systemic inflammation from food sensitivities or gut dysbiosis impairs endometrial receptivity. Vitamin D deficiency — strongly associated with implantation failure — is correctable and commonly missed.</p>
            <p><strong style="color:var(--color-text)">Male factor:</strong> Involved in 40–50% of infertility cases. Sperm quality responds highly to CoQ10, vitamin C, zinc, selenium, and carnitine supplementation — and to addressing oxidative stress from poor sleep, smoking, and inflammatory diet.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Acupuncture for Fertility &amp; IVF</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">Acupuncture regulates the HPO axis, improves ovarian blood flow and follicular development, reduces uterine artery resistance to improve endometrial blood supply, and reduces stress hormones that suppress reproductive function.</p>
            <p style="margin-bottom:1rem">For IVF patients, my protocol includes sessions during ovarian stimulation, around egg retrieval, and on the day of embryo transfer — where multiple randomized trials show improved implantation and live birth rates. I coordinate timing precisely with the fertility clinic's protocol.</p>
            <p>Chinese herbal medicine formulas custom-prescribed for each patient's TCM pattern regulate the menstrual cycle, improve endometrial lining quality, and support luteal phase progesterone.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">PCOS: Addressing the Root Cause</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">PCOS affects 8–13% of reproductive-age women and is the leading cause of ovulatory infertility. In the majority of cases — including lean women — it's driven by insulin resistance: elevated insulin stimulates ovarian androgen production, disrupts follicle maturation, and creates the characteristic ultrasound appearance.</p>
            <p style="margin-bottom:1rem">The standard approach — birth control pills — regulates cycles by suppressing the hormonal system entirely. It doesn't address the insulin resistance driving androgen excess. When the pill is stopped, the pattern resumes.</p>
            <p>A landmark Swedish research program (led by Elisabet Stener-Victorin) found that repeated electroacupuncture normalized LH levels, improved menstrual regularity, and reduced testosterone in PCOS patients. I use this evidence base alongside myo-inositol and D-chiro-inositol (multiple RCTs supporting ovulation restoration), dietary modification, and berberine for metabolic PCOS.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${faqs.map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Services for Fertility &amp; Women's Health</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Chinese Herbal Medicine", "chinese-herbal-medicine"],
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
              ["Electroacupuncture", "electroacupuncture"],
              ["Dry Needling Therapy", "dry-needling-therapy"],
              ["Biopuncture Therapy", "biopuncture-therapy"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "9 Years Hospital Privileges — Prisma Health", "5 Peer-Reviewed Publications | 54 Citations", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Hormonal & Thyroid Health", "hormonal-and-thyroid-health"], ["Gut & Digestive Health", "gut-and-digestive-health"], ["Autoimmune & Chronic Illness", "autoimmune-and-chronic-illness"], ["Fatigue, Brain & Nervous System", "fatigue-brain-nervous-system"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ============================================================
   CONDITION HUB 7: AUTOIMMUNE & CHRONIC ILLNESS
   Consolidates: autoimmune-disease, fibromyalgia, chronic-illness,
                 weight-issues, lyme-disease
   URL: /conditions/autoimmune-and-chronic-illness
   ============================================================ */
export function renderAutoimmuneChronic(): string {
  const title = "Autoimmune Disease, Fibromyalgia & Chronic Illness | Greenville, SC | IHP";
  const desc = "Functional medicine and acupuncture for autoimmune disease, fibromyalgia, chronic illness, weight dysfunction, and Lyme disease in Greenville, SC. Dr. William Hendry, DAOM. Call (864) 365-6156.";
  const canonical = `${BASE_URL}/conditions/autoimmune-and-chronic-illness/`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is the connection between leaky gut and autoimmune disease?", "acceptedAnswer": { "@type": "Answer", "text": "Intestinal permeability is found in virtually every autoimmune condition studied. When the gut barrier is compromised, bacterial antigens and food proteins (particularly gliadin) enter the bloodstream. The immune response generated can cross-react with structurally similar self-tissues — molecular mimicry. Healing the gut lining removes the most consistent autoimmune trigger in the body." } },
      { "@type": "Question", "name": "Is fibromyalgia a real condition?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Fibromyalgia is a disorder of central sensitization — the spinal cord and brain have recalibrated their pain-processing threshold downward, amplifying normal sensory input into pain signals. This is measurable on functional MRI and in substance P levels. Dr. Hendry uses HRV monitoring as an objective marker of nervous system recalibration during treatment." } },
      { "@type": "Question", "name": "Can autoimmune disease go into remission?", "acceptedAnswer": { "@type": "Answer", "text": "Some autoimmune conditions can achieve remission — minimal or undetectable disease activity. For Hashimoto's, complete antibody normalization is achievable. For rheumatoid arthritis, significant reduction in disease activity is common when gut healing and dietary triggers are addressed alongside DMARD therapy." } },
      { "@type": "Question", "name": "What causes unexplained weight gain?", "acceptedAnswer": { "@type": "Answer", "text": "Insulin resistance is the most common metabolic barrier — elevated insulin is the body's primary fat-storage signal. Thyroid dysfunction slows resting metabolism. Cortisol from chronic stress drives central adiposity. Gut dysbiosis produces metabolic endotoxemia. Testing fasting insulin, HOMA-IR, and a full thyroid panel almost always identifies at least one specific, addressable driver." } },
      { "@type": "Question", "name": "Can functional medicine help when antibiotics haven't resolved Lyme symptoms?", "acceptedAnswer": { "@type": "Answer", "text": "When standard antibiotics haven't resolved symptoms, functional medicine investigates what they didn't address: co-infections (Babesia, Bartonella), biofilm communities, immune dysregulation, gut disruption from the antibiotics, and mitochondrial impairment. Herbal antimicrobials (Japanese knotweed, cat's claw, cryptolepis) have documented activity against Borrelia including persister cell forms." } },
      { "@type": "Question", "name": "Is vitamin D deficiency linked to autoimmune disease?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, significantly. Vitamin D deficiency is a major modifiable risk factor — autoimmune disease is more prevalent at higher latitudes. Vitamin D regulates T regulatory cell function that suppresses autoimmune reactivity. Maintaining optimal 25-OH vitamin D levels (60–80 ng/mL) is a core component of every autoimmune protocol at IHP." } },
    ]
  };

  const faqs = [
    { q: "I've seen multiple specialists and nobody has found what's wrong — can functional medicine help?", a: "This is among the most common presentations I see. Functional medicine asks different questions and uses different tests. The biological dysfunction driving most complex chronic illness — mitochondrial impairment, gut dysbiosis, HPA axis dysregulation, nutritional depletion, environmental toxin burden — doesn't appear on standard specialty panels. The evaluation that misses it is the one that doesn't look for it." },
    { q: "Do you work alongside conventional specialists?", a: "Yes, always. A rheumatoid arthritis patient on methotrexate still benefits enormously from gut healing, anti-inflammatory nutrition, and vitamin D optimization — those don't interfere with conventional treatment and often improve its effectiveness. I communicate with the patient's other providers and coordinate care explicitly." },
    { q: "How do you approach fibromyalgia treatment?", a: "I treat fibromyalgia as central sensitization — a real biological state with measurable neurological mechanisms, not a diagnosis handed out when nothing else fits. Electroacupuncture is particularly effective for modulating the CNS pathways disrupted in fibromyalgia. I use HRV monitoring as an objective treatment tracking tool. Mitochondrial support, sleep optimization, thyroid evaluation, gut restoration, and anti-inflammatory diet work synergistically with acupuncture." },
    { q: "What is the connection between weight gain and insulin resistance?", a: "Insulin resistance means cells stop responding to insulin's signal, causing the pancreas to produce excess insulin. High circulating insulin is the body's primary fat-storage signal and blocks lipolysis. No amount of caloric restriction fully overrides this mechanism. Berberine and inositol correct insulin resistance pharmacologically; a low-glycemic dietary pattern removes the substrate perpetuating it." },
    { q: "What herbal antimicrobials do you use for Lyme?", a: "My herbal Lyme protocols draw from published in vitro research: Japanese knotweed (resveratrol and stilbenes with documented anti-Borrelia activity), cat's claw (immunomodulatory and antimicrobial), cryptolepis (active against both Borrelia and Babesia), and andrographis (anti-inflammatory and antimicrobial). These are prescribed as structured protocols from my in-house herbal pharmacy, combined with biofilm-disrupting agents and rotation strategies." },
  ];

  return `${renderHead(title, desc, canonical, [faqSchema])}
<body data-page="condition-hub">
  ${renderNav(false)}
  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: "Conditions We Treat", href: "/conditions" },
        { name: "Autoimmune & Chronic Illness" },
      ])}
      <div class="main-sidebar">
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">Digestive &amp; Immune Health</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">Autoimmune Disease, Fibromyalgia &amp; Chronic Illness in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2.5rem" class="reveal reveal-delay-1">
            Functional medicine and acupuncture for autoimmune conditions, fibromyalgia, complex chronic illness, metabolic dysfunction, and Lyme disease. Addressing the biological drivers conventional medicine isn't designed to look for — with clinical depth from 25 years of integrative practice and published research.
          </p>

          <div class="cta-subtle reveal" style="margin-bottom:2.5rem">
            <h2 class="font-display" style="font-size:1.5rem;margin-bottom:0.875rem">${icons.award} A Note From Dr. Hendry</h2>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">The patients I see with autoimmune disease and complex chronic illness have usually been through the specialist circuit. Rheumatology found early indicators but nothing meeting diagnostic criteria. Gastroenterology diagnosed IBS and recommended fiber. Each specialist saw their piece. Nobody saw the whole thing — because the whole thing isn't organized by organ system.</p>
            <p style="color:var(--color-muted);line-height:1.8;margin-bottom:1rem">Chronic illness typically doesn't fit single-organ specialty medicine because it isn't a single-organ condition. It's the downstream result of overlapping biological failures: gut dysbiosis driving systemic inflammation, mitochondrial dysfunction impairing cellular energy, HPA axis dysregulation undermining stress resilience, accumulated nutrient depletion. These systems interact. Correcting them requires a framework that sees their interaction.</p>
            <p style="color:var(--color-muted);line-height:1.8">I work with rheumatologists and gastroenterologists, not around them. The immunology I address is the layer that the specialist isn't designed to address: why is this immune system activated? What's the gut permeability status? What's the vitamin D? These questions have answers that sometimes change everything.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">The Leaky Gut — Autoimmune Cascade</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">Twenty-three million Americans have an autoimmune disease. Most received a diagnosis, a prescription for an immunosuppressant, and an implicit message that management is the best they can hope for. The functional medicine question is different: why is the immune system attacking its own tissue? Not philosophically — clinically. Because there are identifiable, addressable biological drivers that conventional treatment is not designed to look for.</p>
            <p style="margin-bottom:1rem">Intestinal permeability is found in virtually every autoimmune condition studied — Hashimoto's, lupus, rheumatoid arthritis, type 1 diabetes, multiple sclerosis. When the gut barrier is compromised, bacterial antigens trigger immune responses that cross-react with structurally similar self-tissues through molecular mimicry. Healing the gut lining removes the most consistent autoimmune trigger in the body.</p>
            <p style="margin-bottom:1rem">Vitamin D deficiency reduces regulatory T-cell activity that holds autoimmune reactivity in check. EBV reactivation is firmly linked to multiple sclerosis, lupus, and Hashimoto's onset. Gliadin from gluten triggers intestinal permeability and serves as a molecular mimicry antigen for thyroid tissue. These are the drivers. Identifying and addressing them is what changes trajectory rather than just managing symptoms of a progressive disease.</p>
            <p>My 5R gut restoration protocol addresses intestinal permeability systematically: Remove offending foods and gut pathogens, Replace digestive factors, Reinoculate with targeted probiotic strains, Repair the gut lining with glutamine, zinc carnosine, and collagen, and Rebalance lifestyle factors. The autoimmune protocol builds on this foundation.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Fibromyalgia: Central Sensitization, Not Imagination</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">Fibromyalgia is a disorder of central sensitization — a measurable neuroplastic state in which the spinal cord and brain have recalibrated their pain-processing threshold downward. Normal sensory input is amplified into pain signals. This is documented on functional MRI, in cerebrospinal fluid substance P levels, and in functional studies of pain-processing networks.</p>
            <p style="margin-bottom:1rem">My published research includes work on heart rate variability biofeedback — direct investigation of autonomic nervous system regulation, measurably disrupted in fibromyalgia. I use HRV monitoring as an objective treatment tracking tool alongside subjective pain reporting. Patients receive education about the central sensitization mechanism — understanding the neuroscience consistently improves treatment engagement and outcomes.</p>
            <p>Electroacupuncture is particularly effective for fibromyalgia — modulating the CNS pathways disrupted in this condition by reducing substance P, improving sleep architecture, and normalizing autonomic balance. Combined with functional medicine protocols targeting the mitochondrial, hormonal, and gut factors that perpetuate the sensitized state, treatment produces meaningful, sustained improvement in most patients.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1rem">Weight Dysfunction: The Biological Barriers</h2>
          <div style="color:var(--color-muted);line-height:1.8;margin-bottom:2rem" class="reveal">
            <p style="margin-bottom:1rem">The patients who come in unable to lose weight have tried that. Some have tried it repeatedly over years. The issue is that the body's weight regulation system isn't a simple calorie equation — it's a complex hormonal and metabolic system with multiple failure points.</p>
            <p style="margin-bottom:1rem">Insulin resistance keeps circulating insulin chronically elevated — the body's primary fat-storage signal, blocking fat release. No sustained caloric restriction overrides this. Thyroid dysfunction slows resting metabolic rate. Cortisol from chronic stress drives central adiposity. Gut dysbiosis alters energy extraction from food and produces metabolic endotoxemia that worsens insulin resistance.</p>
            <p>My metabolic evaluation: fasting insulin, HOMA-IR, HbA1c, comprehensive thyroid panel, cortisol rhythm, sex hormones, gut microbiome, and inflammatory markers. One or more of these almost always reveals the specific barrier. Berberine and inositol for insulin resistance. Thyroid optimization when T4-to-T3 conversion is impaired. Adaptogenic herbs for cortisol dysregulation. The correction of underlying physiology often produces weight movement where years of dieting have not.</p>
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
          <div style="margin-bottom:2.5rem">
            ${faqs.map(faq => `
            <div class="faq-item reveal" style="border-bottom:1px solid var(--color-border);padding-bottom:1.25rem;margin-bottom:1.25rem">
              <h3 class="font-heading" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:var(--color-text)">${faq.q}</h3>
              <p style="color:var(--color-muted);line-height:1.75;margin:0">${faq.a}</p>
            </div>`).join("")}
          </div>

          <h2 class="font-heading reveal" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Services for Autoimmune &amp; Chronic Illness</h2>
          <div class="grid-auto sm:grid-2" style="margin-bottom:2.5rem">
            ${[
              ["Functional Medicine Consultation", "functional-medicine-consultation"],
              ["Acupuncture Therapy", "acupuncture-therapy"],
              ["Chinese Herbal Medicine", "chinese-herbal-medicine"],
              ["Ozone Therapy", "ozone-therapy"],
              ["Electroacupuncture", "electroacupuncture"],
              ["Biopuncture Therapy", "biopuncture-therapy"],
            ].map(([name, slug]) => `
            <a href="/services/${slug}/" class="related-card reveal">
              <div class="related-card__inner">
                <span class="related-card__name">${name}</span>
                <span class="related-card__arrow">${icons.arrowRight}</span>
              </div>
            </a>`).join("")}
          </div>

          ${renderBookingCTA()}
        </article>

        <aside class="sidebar">
          <div class="sidebar-card sidebar-card--primary">
            <p class="sidebar-card__title">Schedule a Consultation</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:1rem">Call or email to book your first appointment with Dr. Hendry.</p>
            <a href="tel:+18643656156" class="btn btn--primary" style="width:100%;margin-bottom:0.75rem;text-align:center">${icons.phone} (864) 365-6156</a>
            <a href="mailto:info@ihpgreenville.com" class="btn btn--outline" style="width:100%;text-align:center">${icons.mail} Email Us</a>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Dr. Hendry's Credentials</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${["DAOM — East West College of Natural Medicine", "NCBAHM Board Certified (Dipl. O.M. #114498)", "Published Research — HRV Biofeedback", "9 Years Hospital Privileges — Prisma Health", "5 Peer-Reviewed Publications | 54 Citations", "25+ Years Clinical Experience"].map(c => `<div class="check-item" style="font-size:0.875rem">${icons.checkCircle}<span style="color:var(--color-muted)">${c}</span></div>`).join("")}
            </div>
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Related Conditions</p>
            ${[["Gut & Digestive Health", "gut-and-digestive-health"], ["Hormonal & Thyroid Health", "hormonal-and-thyroid-health"], ["Fatigue, Brain & Nervous System", "fatigue-brain-nervous-system"], ["Back & Spine Pain", "back-and-spine-pain"]].map(([n, s]) => `<a href="/conditions/${s}/" class="sidebar-link">${n}</a>`).join("")}
          </div>
          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Location</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.5rem">${NAP.streetAddress}<br>${NAP.city}, ${NAP.state} ${NAP.postalCode}</p>
            <p style="font-size:0.9rem;color:var(--color-muted);margin-bottom:0.75rem">Mon—Fri, 9am—5pm</p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">Get Directions ${icons.externalLink}</a>
          </div>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script src="/js/main.js" defer></script>
</body>
</html>`;
}
