import { categoryDefinitions, allServices, serviceMap, categoryMap, NAP, BASE_URL, getConditionCategorySEO, getConditionPageSEO, injectSEOIntoHTML } from "./seo";
import { conditions, conditionCategories, conditionMap, conditionCategoryMap } from "./conditions";
import { serviceContentMap } from "./services-content";
import { getBlogSiteLinks, getServiceBlogLinks, getConditionBlogLinks } from "./blog-crosslinks";
import { autoLink } from "./auto-linker";
import type { BlogPost } from "@shared/schema";

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
function renderHead(title = "Integrative Health Partners | Greenville, SC", desc = "Expert acupuncture and functional medicine in Greenville, SC. Call (864) 365-6156."): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${BASE_URL}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${BASE_URL}" />
  <meta property="og:image" content="${BASE_URL}/assets/ogImage.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${BASE_URL}/assets/ogImage.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="/css/style.css" />
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
      <div class="nav__logo-icon" aria-hidden="true"><span>IHP</span></div>
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
              <a href="/services/acupuncture-therapy" class="nav__dropdown-item" role="menuitem">Acupuncture Therapy</a>
              <a href="/services/dry-needling-therapy" class="nav__dropdown-item" role="menuitem">Dry Needling</a>
              <a href="/services/electroacupuncture" class="nav__dropdown-item" role="menuitem">Electroacupuncture</a>
              <a href="/services/medical-acupuncture" class="nav__dropdown-item" role="menuitem">Medical Acupuncture</a>
              <a href="/services/auricular-acupuncture" class="nav__dropdown-item" role="menuitem">Auricular Acupuncture</a>
              <a href="/services/scalp-acupuncture" class="nav__dropdown-item" role="menuitem">Scalp Acupuncture</a>
              <a href="/services/fertility-acupuncture" class="nav__dropdown-item" role="menuitem">Fertility Acupuncture</a>
              <a href="/services/acupuncture-for-anxiety" class="nav__dropdown-item" role="menuitem">Acupuncture for Anxiety</a>
              <a href="/services/acupuncture-for-migraines" class="nav__dropdown-item" role="menuitem">Acupuncture for Migraines</a>
              <a href="/services/biopuncture-therapy" class="nav__dropdown-item" role="menuitem">Biopuncture Therapy</a>
            </div>
            <div class="nav__dropdown-col nav__dropdown-col--divider">
              <span class="nav__dropdown-col-label">Body &amp; Pain</span>
              <a href="/services/back-pain-treatment" class="nav__dropdown-item" role="menuitem">Back Pain Treatment</a>
              <a href="/services/neck-pain-treatment" class="nav__dropdown-item" role="menuitem">Neck Pain Treatment</a>
              <a href="/services/knee-pain-treatment" class="nav__dropdown-item" role="menuitem">Knee Pain Treatment</a>
              <a href="/services/sciatica-treatment" class="nav__dropdown-item" role="menuitem">Sciatica Treatment</a>
              <a href="/services/shoulder-pain-treatment" class="nav__dropdown-item" role="menuitem">Shoulder Pain Treatment</a>
              <a href="/services/hip-pain-treatment" class="nav__dropdown-item" role="menuitem">Hip Pain Treatment</a>
              <a href="/services/fibromyalgia-treatment" class="nav__dropdown-item" role="menuitem">Fibromyalgia Treatment</a>
              <a href="/services/neuropathy-treatment" class="nav__dropdown-item" role="menuitem">Neuropathy Treatment</a>
              <a href="/services/sports-injury-treatment" class="nav__dropdown-item" role="menuitem">Sports Injury Treatment</a>
              <a href="/services/trigger-point-therapy" class="nav__dropdown-item" role="menuitem">Trigger Point Therapy</a>
            </div>
            <div class="nav__dropdown-col nav__dropdown-col--divider">
              <span class="nav__dropdown-col-label">Chinese Medicine</span>
              <a href="/services/cupping-therapy" class="nav__dropdown-item" role="menuitem">Cupping Therapy</a>
              <a href="/services/gua-sha-treatment" class="nav__dropdown-item" role="menuitem">Gua Sha</a>
              <a href="/services/moxibustion-therapy" class="nav__dropdown-item" role="menuitem">Moxibustion</a>
              <a href="/services/chinese-herbal-medicine" class="nav__dropdown-item" role="menuitem">Chinese Herbal Medicine</a>
              <a href="/services/custom-herbal-formulations" class="nav__dropdown-item" role="menuitem">Custom Herbal Formulations</a>
              <a href="/services/herbal-consultation" class="nav__dropdown-item" role="menuitem">Herbal Consultation</a>
              <a href="/services/herb-drug-interaction-consultation" class="nav__dropdown-item" role="menuitem">Herb-Drug Consultation</a>
              <a href="/services/ibs-treatment" class="nav__dropdown-item" role="menuitem">IBS Treatment</a>
              <a href="/services/natural-anxiety-treatment" class="nav__dropdown-item" role="menuitem">Natural Anxiety Treatment</a>
              <a href="/services/insomnia-treatment" class="nav__dropdown-item" role="menuitem">Insomnia Treatment</a>
            </div>
            <div class="nav__dropdown-col">
              <span class="nav__dropdown-col-label">Functional Medicine</span>
              <a href="/services/functional-medicine-consultation" class="nav__dropdown-item" role="menuitem">Functional Medicine</a>
              <a href="/services/hormone-testing" class="nav__dropdown-item" role="menuitem">Hormone Testing</a>
              <a href="/services/thyroid-testing" class="nav__dropdown-item" role="menuitem">Thyroid Testing</a>
              <a href="/services/adrenal-fatigue-treatment" class="nav__dropdown-item" role="menuitem">Adrenal Fatigue Treatment</a>
              <a href="/services/gut-health-testing" class="nav__dropdown-item" role="menuitem">Gut Health Testing</a>
              <a href="/services/food-sensitivity-testing" class="nav__dropdown-item" role="menuitem">Food Sensitivity Testing</a>
              <a href="/services/leaky-gut-treatment" class="nav__dropdown-item" role="menuitem">Leaky Gut Treatment</a>
              <a href="/services/ozone-therapy" class="nav__dropdown-item" role="menuitem">Ozone Therapy</a>
              <a href="/services/infrared-sauna-therapy" class="nav__dropdown-item" role="menuitem">Infrared Sauna Therapy</a>
              <a href="/services/nutritional-counseling" class="nav__dropdown-item" role="menuitem">Nutritional Counseling</a>
            </div>
          </div>
          <a href="/services/" class="nav__dropdown-item nav__dropdown-item--cta" role="menuitem" style="display:block;text-align:center;margin-top:0.25rem">→ View All Services</a>
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
              <a href="/conditions/back-pain" class="nav__dropdown-item" role="menuitem">Back Pain</a>
              <a href="/conditions/neck-pain" class="nav__dropdown-item" role="menuitem">Neck Pain</a>
              <a href="/conditions/knee-pain" class="nav__dropdown-item" role="menuitem">Knee Pain</a>
              <a href="/conditions/hip-pain" class="nav__dropdown-item" role="menuitem">Hip Pain</a>
              <a href="/conditions/shoulder-pain" class="nav__dropdown-item" role="menuitem">Shoulder Pain</a>
              <a href="/conditions/sciatica" class="nav__dropdown-item" role="menuitem">Sciatica</a>
              <a href="/conditions/headaches-migraines" class="nav__dropdown-item" role="menuitem">Headaches &amp; Migraines</a>
              <a href="/conditions/fibromyalgia" class="nav__dropdown-item" role="menuitem">Fibromyalgia</a>
              <a href="/conditions/neuropathy" class="nav__dropdown-item" role="menuitem">Neuropathy</a>
              <a href="/conditions/sports-injuries" class="nav__dropdown-item" role="menuitem">Sports Injuries</a>
            </div>
            <div class="nav__dropdown-col">
              <a href="/conditions/anxiety-stress" class="nav__dropdown-item" role="menuitem">Anxiety &amp; Stress</a>
              <a href="/conditions/depression" class="nav__dropdown-item" role="menuitem">Depression</a>
              <a href="/conditions/insomnia" class="nav__dropdown-item" role="menuitem">Insomnia</a>
              <a href="/conditions/ptsd" class="nav__dropdown-item" role="menuitem">PTSD</a>
              <a href="/conditions/brain-fog" class="nav__dropdown-item" role="menuitem">Brain Fog</a>
              <a href="/conditions/fertility" class="nav__dropdown-item" role="menuitem">Fertility Support</a>
              <a href="/conditions/pcos" class="nav__dropdown-item" role="menuitem">PCOS</a>
              <a href="/conditions/menopause" class="nav__dropdown-item" role="menuitem">Menopause</a>
              <a href="/conditions/hormone-imbalance" class="nav__dropdown-item" role="menuitem">Hormone Imbalance</a>
              <a href="/conditions/perimenopause" class="nav__dropdown-item" role="menuitem">Perimenopause</a>
            </div>
            <div class="nav__dropdown-col">
              <a href="/conditions/ibs-gut-issues" class="nav__dropdown-item" role="menuitem">IBS &amp; Gut Issues</a>
              <a href="/conditions/chronic-fatigue" class="nav__dropdown-item" role="menuitem">Chronic Fatigue</a>
              <a href="/conditions/autoimmune-disease" class="nav__dropdown-item" role="menuitem">Autoimmune Disease</a>
              <a href="/conditions/hashimotos" class="nav__dropdown-item" role="menuitem">Hashimoto's</a>
              <a href="/conditions/thyroid-issues" class="nav__dropdown-item" role="menuitem">Thyroid Issues</a>
              <a href="/conditions/food-sensitivities" class="nav__dropdown-item" role="menuitem">Food Sensitivities</a>
              <a href="/conditions/leaky-gut" class="nav__dropdown-item" role="menuitem">Leaky Gut</a>
              <a href="/conditions/adrenal-fatigue" class="nav__dropdown-item" role="menuitem">Adrenal Fatigue</a>
              <a href="/conditions/chronic-illness" class="nav__dropdown-item" role="menuitem">Chronic Illness</a>
              <a href="/conditions/weight-issues" class="nav__dropdown-item" role="menuitem">Weight Issues</a>
            </div>
          </div>
          <a href="/conditions" class="nav__dropdown-item nav__dropdown-item--cta" role="menuitem" style="display:block;text-align:center;margin-top:0.25rem">→ View All Conditions</a>
        </div>
      </div>

      <div class="nav__dropdown" role="listitem">
        <button class="nav__dropdown-btn" aria-haspopup="true" aria-expanded="false">
          About
          <span class="nav__dropdown-chevron">${icons.chevronDown}</span>
        </button>
        <div class="nav__dropdown-menu" role="menu">
          <a href="/about" class="nav__dropdown-item nav__dropdown-item--primary" role="menuitem">About Integrative Health Partners</a>
          <a href="/dr-hendry" class="nav__dropdown-item" role="menuitem">Dr. William Hendry, DAOM</a>
        </div>
      </div>

      <a href="/blog" class="nav__link" role="listitem">Blog</a>
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
  <a href="/blog" class="nav__mobile-link">Blog</a>

  <div class="nav__mobile-section">Services</div>
  <a href="/services/acupuncture-therapy" class="nav__mobile-sublink">Acupuncture Therapy</a>
  <a href="/services/dry-needling-therapy" class="nav__mobile-sublink">Dry Needling</a>
  <a href="/services/electroacupuncture" class="nav__mobile-sublink">Electroacupuncture</a>
  <a href="/services/medical-acupuncture" class="nav__mobile-sublink">Medical Acupuncture</a>
  <a href="/services/auricular-acupuncture" class="nav__mobile-sublink">Auricular Acupuncture</a>
  <a href="/services/scalp-acupuncture" class="nav__mobile-sublink">Scalp Acupuncture</a>
  <a href="/services/fertility-acupuncture" class="nav__mobile-sublink">Fertility Acupuncture</a>
  <a href="/services/acupuncture-for-anxiety" class="nav__mobile-sublink">Acupuncture for Anxiety</a>
  <a href="/services/acupuncture-for-migraines" class="nav__mobile-sublink">Acupuncture for Migraines</a>
  <a href="/services/biopuncture-therapy" class="nav__mobile-sublink">Biopuncture Therapy</a>
  <a href="/services/back-pain-treatment" class="nav__mobile-sublink">Back Pain Treatment</a>
  <a href="/services/neck-pain-treatment" class="nav__mobile-sublink">Neck Pain Treatment</a>
  <a href="/services/knee-pain-treatment" class="nav__mobile-sublink">Knee Pain Treatment</a>
  <a href="/services/sciatica-treatment" class="nav__mobile-sublink">Sciatica Treatment</a>
  <a href="/services/shoulder-pain-treatment" class="nav__mobile-sublink">Shoulder Pain Treatment</a>
  <a href="/services/hip-pain-treatment" class="nav__mobile-sublink">Hip Pain Treatment</a>
  <a href="/services/fibromyalgia-treatment" class="nav__mobile-sublink">Fibromyalgia Treatment</a>
  <a href="/services/neuropathy-treatment" class="nav__mobile-sublink">Neuropathy Treatment</a>
  <a href="/services/sports-injury-treatment" class="nav__mobile-sublink">Sports Injury Treatment</a>
  <a href="/services/trigger-point-therapy" class="nav__mobile-sublink">Trigger Point Therapy</a>
  <a href="/services/cupping-therapy" class="nav__mobile-sublink">Cupping Therapy</a>
  <a href="/services/gua-sha-treatment" class="nav__mobile-sublink">Gua Sha</a>
  <a href="/services/moxibustion-therapy" class="nav__mobile-sublink">Moxibustion</a>
  <a href="/services/chinese-herbal-medicine" class="nav__mobile-sublink">Chinese Herbal Medicine</a>
  <a href="/services/custom-herbal-formulations" class="nav__mobile-sublink">Custom Herbal Formulations</a>
  <a href="/services/herbal-consultation" class="nav__mobile-sublink">Herbal Consultation</a>
  <a href="/services/herb-drug-interaction-consultation" class="nav__mobile-sublink">Herb-Drug Consultation</a>
  <a href="/services/ibs-treatment" class="nav__mobile-sublink">IBS Treatment</a>
  <a href="/services/natural-anxiety-treatment" class="nav__mobile-sublink">Natural Anxiety Treatment</a>
  <a href="/services/insomnia-treatment" class="nav__mobile-sublink">Insomnia Treatment</a>
  <a href="/services/functional-medicine-consultation" class="nav__mobile-sublink">Functional Medicine</a>
  <a href="/services/hormone-testing" class="nav__mobile-sublink">Hormone Testing</a>
  <a href="/services/thyroid-testing" class="nav__mobile-sublink">Thyroid Testing</a>
  <a href="/services/adrenal-fatigue-treatment" class="nav__mobile-sublink">Adrenal Fatigue Treatment</a>
  <a href="/services/gut-health-testing" class="nav__mobile-sublink">Gut Health Testing</a>
  <a href="/services/food-sensitivity-testing" class="nav__mobile-sublink">Food Sensitivity Testing</a>
  <a href="/services/leaky-gut-treatment" class="nav__mobile-sublink">Leaky Gut Treatment</a>
  <a href="/services/ozone-therapy" class="nav__mobile-sublink">Ozone Therapy</a>
  <a href="/services/infrared-sauna-therapy" class="nav__mobile-sublink">Infrared Sauna Therapy</a>
  <a href="/services/nutritional-counseling" class="nav__mobile-sublink">Nutritional Counseling</a>
  <a href="/services/" class="nav__mobile-sublink">→ View All Services</a>

  <div class="nav__mobile-section">Conditions We Treat</div>
  <a href="/conditions/back-pain" class="nav__mobile-sublink">Back Pain</a>
  <a href="/conditions/neck-pain" class="nav__mobile-sublink">Neck Pain</a>
  <a href="/conditions/knee-pain" class="nav__mobile-sublink">Knee Pain</a>
  <a href="/conditions/hip-pain" class="nav__mobile-sublink">Hip Pain</a>
  <a href="/conditions/shoulder-pain" class="nav__mobile-sublink">Shoulder Pain</a>
  <a href="/conditions/sciatica" class="nav__mobile-sublink">Sciatica</a>
  <a href="/conditions/headaches-migraines" class="nav__mobile-sublink">Headaches &amp; Migraines</a>
  <a href="/conditions/fibromyalgia" class="nav__mobile-sublink">Fibromyalgia</a>
  <a href="/conditions/neuropathy" class="nav__mobile-sublink">Neuropathy</a>
  <a href="/conditions/sports-injuries" class="nav__mobile-sublink">Sports Injuries</a>
  <a href="/conditions/anxiety-stress" class="nav__mobile-sublink">Anxiety &amp; Stress</a>
  <a href="/conditions/depression" class="nav__mobile-sublink">Depression</a>
  <a href="/conditions/insomnia" class="nav__mobile-sublink">Insomnia</a>
  <a href="/conditions/ptsd" class="nav__mobile-sublink">PTSD</a>
  <a href="/conditions/brain-fog" class="nav__mobile-sublink">Brain Fog</a>
  <a href="/conditions/fertility" class="nav__mobile-sublink">Fertility Support</a>
  <a href="/conditions/pcos" class="nav__mobile-sublink">PCOS</a>
  <a href="/conditions/menopause" class="nav__mobile-sublink">Menopause</a>
  <a href="/conditions/hormone-imbalance" class="nav__mobile-sublink">Hormone Imbalance</a>
  <a href="/conditions/perimenopause" class="nav__mobile-sublink">Perimenopause</a>
  <a href="/conditions/ibs-gut-issues" class="nav__mobile-sublink">IBS &amp; Gut Issues</a>
  <a href="/conditions/chronic-fatigue" class="nav__mobile-sublink">Chronic Fatigue</a>
  <a href="/conditions/autoimmune-disease" class="nav__mobile-sublink">Autoimmune Disease</a>
  <a href="/conditions/hashimotos" class="nav__mobile-sublink">Hashimoto's</a>
  <a href="/conditions/thyroid-issues" class="nav__mobile-sublink">Thyroid Issues</a>
  <a href="/conditions/food-sensitivities" class="nav__mobile-sublink">Food Sensitivities</a>
  <a href="/conditions/leaky-gut" class="nav__mobile-sublink">Leaky Gut</a>
  <a href="/conditions/adrenal-fatigue" class="nav__mobile-sublink">Adrenal Fatigue</a>
  <a href="/conditions/chronic-illness" class="nav__mobile-sublink">Chronic Illness</a>
  <a href="/conditions/weight-issues" class="nav__mobile-sublink">Weight Issues</a>
  <a href="/conditions" class="nav__mobile-sublink">→ View All Conditions</a>

  <div class="nav__mobile-section">About</div>
  <a href="/about" class="nav__mobile-sublink">About Integrative Health Partners</a>
  <a href="/dr-hendry" class="nav__mobile-sublink">Dr. William Hendry, DAOM</a>

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
          <div class="footer__logo-icon"><span>IHP</span></div>
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
          <div class="footer__contact-row">${icons.clock}<span>Mon–Fri 9am–5pm</span></div>
        </div>
      </div>

      <div>
        <p class="footer__col-title">Services</p>
        <div class="footer__links">
          <a href="/services/acupuncturist-services" class="footer__link">Acupuncturist Services</a>
          <a href="/services/acupuncture-clinic-services" class="footer__link">Acupuncture Clinic Services</a>
          <a href="/services/chinese-medicine-clinic-services" class="footer__link">Chinese Medicine Clinic Services</a>
          <a href="/services/alternative-medicine-practitioner-services" class="footer__link">Alternative Medicine Practitioner Services</a>
          <a href="/blog" class="footer__link">Health Blog</a>
        </div>
      </div>

      <div>
        <p class="footer__col-title">About</p>
        <div class="footer__links">
          <a href="/about" class="footer__link">About Our Practice</a>
          <a href="/dr-hendry" class="footer__link">Dr. William Hendry</a>
          <a href="/contact" class="footer__link">Contact &amp; Directions</a>
          <a href="https://share.google/TYarboIHpqlhU6odK" target="_blank" rel="noopener noreferrer" class="footer__link">⭐ Leave a Google Review</a>
        </div>
      </div>

      <div>
        <p class="footer__col-title">Conditions We Treat</p>
        <div class="footer__links">
          <a href="/conditions/pain-and-musculoskeletal" class="footer__link">Pain &amp; Musculoskeletal</a>
          <a href="/conditions/neurological-mental-health" class="footer__link">Neurological &amp; Mental Health</a>
          <a href="/conditions/hormonal-womens-health" class="footer__link">Hormonal &amp; Women's Health</a>
          <a href="/conditions/digestive-immune" class="footer__link">Digestive &amp; Immune</a>
          <a href="/conditions" class="footer__link">View All Conditions</a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <p>&copy; ${new Date().getFullYear()} Integrative Health Partners. All rights reserved.</p>
      <p>319 Wade Hampton Blvd, Ste A, Greenville, SC 29609 &nbsp;&bull;&nbsp; <a href="tel:${NAP.phoneRaw}" style="color:inherit">${NAP.phone}</a></p>
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
    { name: "Acupuncture Therapy", slug: "acupuncture-therapy", icon: icons.leaf, text: "Precise needle placement guided by Dr. Hendry's 25 years of expertise in traditional Chinese diagnostic methods to relieve acute and chronic pain, restore nervous system balance, and address root causes rather than symptoms alone." },
    { name: "Dry Needling Therapy", slug: "dry-needling-therapy", icon: icons.activity, text: "Dr. Hendry targets specific trigger points with specialized needles to release chronic muscle tension and restore normal movement patterns. This technique addresses muscle memory problems that cause persistent pain and stiffness — without medications." },
    { name: "Chinese Herbal Medicine", slug: "chinese-herbal-medicine", icon: icons.leaf, text: "Customized herbal protocols combining traditional Chinese formulas with standardized Western botanical extracts. All herbs are third-party tested for purity and potency — dispensed from our in-house pharmacy, same day." },
    { name: "Integrative Functional Medicine", slug: "functional-medicine-consultation", icon: icons.activity, text: "Advanced testing — nutrient levels, hormones, food reactions — to uncover what traditional labs miss. No one-size-fits-all plans. Dr. Hendry starts by listening to your whole health story, then builds a step-by-step plan unique to your body." },
    { name: "Ozone Sauna Therapy", slug: "ozone-therapy", icon: icons.shield, text: "Medical-grade ozone protocols delivered through infrared saunas that boost immune function, enhance detoxification, increase cellular energy production, and accelerate recovery from chronic fatigue, fibromyalgia, and immune disorders." },
    { name: "Electroacupuncture", slug: "electroacupuncture", icon: icons.activity, text: "Dr. Hendry adds therapeutic electrical frequencies to acupuncture points to accelerate healing and block pain signals more effectively — stimulating nerve regeneration for conditions like neuropathy and chronic pain." },
  ];

  const testimonials = [
    { text: "Dr. Hendry is so informative and truly listens to all of your concerns. Definitely steps away from normal western medicine. So excited to see where this journey takes me!", author: "C. Fanton" },
    { text: "It's pretty amazing how you can get instant relief from chronic pains from Acupuncture. Doctor Hendry's knowledge of the human body never ceases to amaze me.", author: "R. McClaran" },
    { text: "Dr Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds. After reading a book about natural salt I saw in his office, I have been using natural salt, it has eliminated my chronic headaches.", author: "K. Hill" },
    { text: "I am so glad to find the peri-neural therapy here to help heal nerve damage. My pain level decreased significantly after my first treatment.", author: "L. Getty" },
  ];

  const homeFAQs = [
    { q: "What conditions does Dr. Hendry treat?", a: "Dr. Hendry treats chronic pain, headaches, digestive problems, hormone imbalances, autoimmune conditions, chronic fatigue, fibromyalgia, and unexplained symptoms that haven't responded to conventional treatments. His 25 years of Chinese medicine experience and functional medicine training help address root causes rather than just symptoms. Each person's situation is different, so results vary." },
    { q: "What is functional medicine and how does it work with acupuncture?", a: "Functional medicine uses advanced lab testing to find hidden causes of chronic illness like nutrient deficiencies, hormone imbalances, and food sensitivities that regular blood work misses. When combined with acupuncture, we can treat both the underlying biochemical problems and energy blockages, giving you faster and more complete healing." },
    { q: "Does acupuncture hurt?", a: "Most people are surprised that acupuncture is virtually painless. We use hair-thin needles that are much smaller than injection needles. You might feel a tiny pinch when the needle goes in, followed by a dull ache or tingling sensation that means the treatment is working. Many patients find acupuncture so relaxing they fall asleep during treatment. Everyone's pain tolerance is different." },
    { q: "How quickly will I see results?", a: "Some patients notice improvements within the first few treatments, while others take several weeks. Acute conditions often respond faster than chronic problems you've had for years. Dr. Hendry monitors your progress and adjusts treatment as needed. Results vary based on individual conditions." },
    { q: "How is this different from regular medical care?", a: "Regular medicine often focuses on managing symptoms with medications. Dr. Hendry combines traditional Chinese medicine with functional medicine to find underlying causes — like nutrient deficiencies, hormone imbalances, or toxin exposure — that standard tests might miss. His approach works alongside your current medical care, not instead of it." },
    { q: "What is Ozone Sauna Therapy?", a: "Ozone sauna therapy combines medical-grade ozone gas with infrared heat to boost your immune system and help your body detoxify naturally. You sit in a sauna while ozone is delivered around your body (not inhaled), which increases oxygen levels in your tissues, fights infections, and reduces inflammation. It's particularly helpful for chronic fatigue, fibromyalgia, immune disorders, and recovery from illness. Sessions last 20–30 minutes and most people feel energized and relaxed afterward." },
    { q: "Are you accepting new patients?", a: "Yes, Dr. Hendry is currently accepting new patients. New patient appointments include initial consultations that last 60–90 minutes. Call (864) 365-6156 to schedule your comprehensive evaluation." },
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

  return `${renderHead("Acupuncture & Functional Medicine in Greenville, SC | IHP", "Integrative Health Partners — acupuncture, functional medicine & Chinese medicine in Greenville, SC. Dr. William Hendry, DAOM: 25+ years, Prisma Health hospital privileges. Call (864) 365-6156.")}
<body data-page="home">
  ${renderNav(true)}

  <main>
    <!-- Hero -->
    <section class="hero" aria-label="Welcome to Integrative Health Partners">
      <div class="hero__bg">
        <video class="hero__video" autoplay muted loop playsinline preload="none" aria-hidden="true">
          <source src="/assets/Untitled_design_1768148669244.mp4" type="video/mp4" />
        </video>
        <div class="hero__overlay" aria-hidden="true"></div>
      </div>
      <div class="hero__content">
        <p class="hero__eyebrow reveal">Serving Greenville, Spartanburg, Anderson &amp; Upstate SC</p>
        <h1 class="hero__h1 reveal reveal-delay-1 font-display">
          Acupuncture &amp; <em>Functional Medicine</em><br>in Greenville, SC
        </h1>
        <p class="hero__subtitle reveal reveal-delay-2">
          Greenville's most credentialed integrative health practice — acupuncture, Chinese herbal medicine, and root-cause functional medicine. Led by Dr. William Hendry, DAOM, with hospital privileges at Prisma Health and 5 peer-reviewed publications.
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
        <div class="two-col provider-section-grid">
          <div class="provider-img-wrap reveal">
            <img src="/images/dr-hendry.jpg"
              alt="Dr. William Hendry, DAOM — Board-Certified Acupuncturist and Functional Medicine Practitioner in Greenville, SC"
              class="provider-img" width="170" height="170" loading="lazy" />
            <div class="provider-badge-overlay" aria-label="Dr. Hendry's degree">
              <div class="provider-badge-overlay__degree">DAOM</div>
              <div class="provider-badge-overlay__sub">Doctor of Acupuncture &amp; Oriental Medicine</div>
            </div>
          </div>
          <div>
            <span class="section-label reveal">Meet Your Provider</span>
            <h2 class="section-title reveal reveal-delay-1" id="credentials-heading">Dr. William Hendry, DAOM</h2>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin:0.875rem 0 1.25rem" class="reveal reveal-delay-2">
              <span class="provider-cred-tag">Dipl. O.M. (NCCAOM)®</span>
              <span class="provider-cred-tag">NCCAOM #114498</span>
              <span class="provider-cred-tag">SC ACUP141</span>
              <span class="provider-cred-tag">NPI 1417184045</span>
            </div>

            <div class="highlight-box highlight-box--compact reveal reveal-delay-2">
              <strong>${icons.award} Prisma Health — 3-Year Opioid Alternative Study</strong>
              <p style="margin:0.5rem 0 0;font-size:0.9375rem;line-height:1.65">
                Dr. Hendry co-authored a landmark 3-year Emergency Department study at Prisma Health on needling techniques as non-opioid alternatives for acute pain management — earning 9 years of hospital privileges, a distinction extremely rare among acupuncturists.
              </p>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.875rem;margin:1.5rem 0 2rem">
              ${[
                "25+ years clinical experience in acupuncture and integrative medicine",
                "5 peer-reviewed research publications, 52 citations",
                "NCCAOM board-certified Diplomate of Oriental Medicine",
                "Injection Therapy certified · AAOT member",
                "In-house professional herbal pharmacy on site"
              ].map(item => `
              <div class="check-item reveal"><span>${icons.checkCircle}</span><span>${item}</span></div>`).join("")}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1rem" class="reveal">
              <a href="tel:${NAP.phoneRaw}" class="btn btn-primary">${icons.phone} Schedule a Consultation</a>
              <a href="/dr-hendry" class="btn btn-outline">Full Credentials</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Philosophy / Approach Section -->
    <section class="section" aria-labelledby="approach-heading">
      <div class="container">
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
            <a href="/services/functional-medicine-consultation" class="btn btn-primary">Learn About Functional Medicine ${icons.arrowRight}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Conditions We Treat -->
    <section class="section" aria-labelledby="conditions-heading">
      <div class="container">
        <div class="text-center" style="margin-bottom:3rem">
          <span class="section-label reveal">What We Help With</span>
          <h2 class="section-title reveal reveal-delay-1" id="conditions-heading">Conditions We Treat in Greenville, SC</h2>
          <p class="section-sub reveal reveal-delay-2" style="max-width:44rem;margin-inline:auto">
            Dr. Hendry uses acupuncture, functional medicine diagnostics, and Chinese herbal medicine to address 30+ conditions
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
            <a href="/conditions/${cat.slug}" class="cat-card">
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
            <a href="/conditions/${c.slug}" class="svc-list-link">
              <div class="svc-list-link__inner">
                <span class="svc-list-link__name">${c.name}</span>
                <span class="svc-list-link__arrow">${icons.arrowRight}</span>
              </div>
            </a>
          </div>`).join("")}
        </div>

        <div class="text-center reveal">
          <a href="/conditions" class="btn btn-primary">View All 30+ Conditions ${icons.arrowRight}</a>
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
            <a href="/services/${cat.slug}" class="cat-card">
              <div class="cat-card__header">
                <span class="cat-card__badge ${cat.isPrimary ? "cat-card__badge--primary" : "cat-card__badge--secondary"}">${cat.isPrimary ? "Primary" : "Specialty"}</span>
                <span class="cat-card__arrow">${icons.arrowRight}</span>
              </div>
              <h3 class="cat-card__title">${cat.name} Services</h3>
              <p class="cat-card__count">${cat.serviceNames.length} services</p>
              <p class="cat-card__desc">${cat.metaDescription.substring(0, 100)}…</p>
            </a>
          </div>`).join("")}
        </div>

        <div class="text-center" style="margin-bottom:1rem">
          <h3 class="font-heading" style="font-size:1rem;font-weight:600;color:var(--color-muted);margin-bottom:1.25rem">Popular Services</h3>
        </div>
        <div class="grid-auto md:grid-2 lg:grid-3" style="margin-bottom:2.5rem">
          ${featuredServices.map((svc, i) => `
          <div class="reveal" style="transition-delay:${i * 0.07}s">
            <a href="/services/${svc.slug}" class="svc-overview-card">
              <div class="svc-overview-card__icon">${svc.icon}</div>
              <h3 class="svc-overview-card__title">${svc.name}</h3>
              <p class="svc-overview-card__text">${svc.text}</p>
            </a>
          </div>`).join("")}
        </div>
      </div>
    </section>

    <!-- Section 4: Why Choose IHP -->
    <section class="section section--primary" aria-labelledby="why-heading">
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
              { icon: icons.shield, title: "Published Opioid Alternative Research", body: "Co-author of a 3-year Prisma Health ER study examining needling as a non-opioid pain solution. 5 peer-reviewed publications and 52 citations across acupuncture, HRV biofeedback, and integrative oncology." },
              { icon: icons.leaf, title: "Doctoral Training + NCCAOM Certification", body: "Dr. Hendry's DAOM (East West College of Natural Medicine, 2008) represents the highest academic credential in acupuncture. NCCAOM board-certified (Cert. #114498), valid through August 2029." },
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

        <!-- Testimonials -->
        <div style="max-width:48rem;margin-inline:auto">
          <h3 class="section-title section-title--white reveal" style="text-align:center;margin-bottom:0.5rem">Patient Stories</h3>
          <p class="section-sub section-sub--white reveal" style="text-align:center;margin-bottom:2rem">Real outcomes from real Greenville patients.</p>

          <div class="testimonials__carousel" aria-live="polite">
            ${testimonials.map((t, i) => `
            <div class="testimonial${i === 0 ? " active" : ""}" role="article" aria-label="Testimonial from ${t.author}">
              <div class="testimonial__stars" aria-label="5 stars">${starRow()}</div>
              <blockquote class="testimonial__text">"${t.text}"</blockquote>
              <p class="testimonial__author">— ${t.author}</p>
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
              style="font-family:var(--font-heading);font-size:0.9375rem;font-weight:600;color:rgba(255,255,255,0.85);text-decoration:underline;text-underline-offset:3px">
              Check out more reviews on Google ${icons.externalLink}
            </a>
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
                  <div class="info-value">Monday – Friday: 9:00 AM – 5:00 PM</div>
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
    "alternative-medicine-practitioner-greenville-sc": { src: "/images/clinic/products.jpg", alt: "Ozone therapy, Perfect Amino, and integrative wellness products available at IHP Greenville" },
  };
  const catPhoto = catPhotos[catSlug];

  const faqItems = [
    {
      q: `What ${cat.name.toLowerCase()} services do you offer in Greenville, SC?`,
      a: `At Integrative Health Partners, we offer ${cat.serviceNames.length} ${cat.name.toLowerCase()} services including ${cat.serviceNames.slice(0, 5).join(", ")}, and more. Dr. William Hendry has over 25 years of experience providing these treatments.`,
    },
    {
      q: `How do I schedule a ${cat.name.toLowerCase()} appointment?`,
      a: `Call us at (864) 365-6156 or email info@ihpgreenville.com. We're located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. New patients are always welcome.`,
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
        ${renderBreadcrumbs([{ name: `${cat.name} Services` }])}

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
            <a href="/services/${svc.slug}" class="svc-list-link">
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
            <a href="/services/${oc.slug}" class="other-cat-card reveal">
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
        { q: `How many ${service.name} sessions will I need?`, a: `The number of sessions depends on your specific condition and its chronicity. Acute conditions typically require 3–6 sessions, while chronic conditions may need 8–12 or more sessions. Dr. Hendry will outline a recommended treatment schedule during your initial consultation.` },
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

  return `${renderHead(service.metaTitle, service.metaDescription)}
<body data-page="service">
  ${renderNav(false)}

  <main class="page-top">
    <div class="container" style="padding-top:1.5rem;padding-bottom:4rem">
      ${renderBreadcrumbs([
        { name: `${cat.name} Services`, href: `/services/${cat.slug}` },
        { name: service.name },
      ])}

      <div class="main-sidebar">
        <article>
          <a href="/services/${cat.slug}" class="tag tag--link" style="margin-bottom:1rem;display:inline-block">${cat.name} Services</a>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">${service.name} in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2rem" class="reveal reveal-delay-1">
            ${service.metaDescription}
          </p>

          ${openingHtml}
          ${howItWorksHtml}
          ${conditionsLinksHtml}
          ${comparisonHtml}
          ${researchHtml}
          ${costHtml}
          ${timelineHtml}
          ${firstApptHtml}
          ${whyDrHendryHtml}

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
              <a href="/services/${rs.slug}" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${rs.name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`).join("")}
            </div>
          </div>` : ""}

          ${(() => {
            const blogLinks = getServiceBlogLinks(baseSlug, 4);
            if (blogLinks.length === 0) return "";
            return `
          <div style="margin-top:3rem" class="reveal">
            <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              ${icons.leaf} From the IHP Blog
            </h2>
            <div style="display:flex;flex-direction:column;gap:0.625rem">
              ${blogLinks.map(b => `
              <a href="/blog/${b.slug}" style="display:flex;align-items:center;gap:0.625rem;font-size:0.9375rem;color:var(--color-primary);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--color-border)" class="blog-cross-link">
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
              <div class="check-item">${icons.check}<span>NCCAOM board-certified</span></div>
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
              return `<a href="/services/${svcSl}" class="sidebar-link">${svcName}</a>`;
            }).join("")}
            <a href="/services/${cat.slug}" class="text-link" style="font-size:0.875rem;font-weight:500;display:block;margin-top:0.75rem">
              View all ${cat.serviceNames.length} services →
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
  return `${renderHead("Health & Wellness Blog | Integrative Health Partners Greenville, SC", "Read the latest health and wellness insights from Integrative Health Partners in Greenville, SC. Expert articles on acupuncture, functional medicine, and holistic health.")}
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
            <a href="/blog/${post.slug}" class="blog-card">
              <div class="blog-card__meta">
                <span>${icons.calendar} ${formatDate(post.pubDate)}</span>
                ${post.creator ? `<span>${icons.user} ${post.creator}</span>` : ""}
              </div>
              <h2 class="blog-card__title">${post.title}</h2>
              ${excerpt ? `<p class="blog-card__excerpt">${excerpt}…</p>` : ""}
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
  return `${renderHead(`${post.title} | Integrative Health Partners`, excerpt)}
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

      <div class="prose blog-post-content">
        ${autoLink(post.content || `<p>${excerpt}</p>`, `/blog/${post.slug}`)}
      </div>

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
        <a href="/blog" class="back-link">${icons.arrowLeft} Back to Blog</a>
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
  const allConditions = conditions;
  const hubFAQs = [
    { q: "What conditions does acupuncture treat?", a: "Acupuncture has demonstrated clinical efficacy for a broad range of conditions including chronic pain, anxiety, insomnia, digestive disorders, hormonal imbalances, and more. At Integrative Health Partners, Dr. Hendry uses acupuncture as part of a comprehensive integrative protocol tailored to each patient's unique presentation." },
    { q: "How is functional medicine different from conventional medicine for chronic conditions?", a: "Functional medicine seeks to identify and address the root biological causes of chronic conditions — gut dysbiosis, hormonal imbalances, nutritional deficiencies, systemic inflammation — rather than managing symptoms with medication. This approach often produces more durable results for complex, multi-system chronic conditions." },
    { q: "Do you treat patients who are already seeing other doctors?", a: "Absolutely. Dr. Hendry works collaboratively with your existing healthcare team. Many patients come to us while under the care of other specialists, using integrative medicine to complement their conventional treatment and address the root causes that conventional care may not be reaching." },
    { q: "Is integrative medicine evidence-based?", a: "Yes. Dr. Hendry's approach draws on peer-reviewed research in acupuncture, functional medicine, and nutritional science. He holds 5 research publications and 52 citations, and his clinical protocols are informed by the best available evidence across both Eastern and Western medical traditions." },
  ];

  return `${renderHead("Conditions We Treat | Integrative Health Partners Greenville, SC", "Integrative Health Partners treats 30+ conditions with acupuncture and functional medicine in Greenville, SC. Find your condition and learn how we can help.")}
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
            At Integrative Health Partners, Dr. William Hendry treats more than 30 conditions using a combination of
            acupuncture, functional medicine, and Traditional Chinese Medicine. Rather than managing symptoms in isolation,
            we identify and address the root causes of your health challenges — creating lasting improvement across
            pain, neurological, hormonal, and digestive health.
          </p>
        </div>

        <!-- Category Cards -->
        <div class="grid-auto md:grid-2 lg:grid-4" style="margin-bottom:4rem">
          ${conditionCategories.map((cat, i) => `
          <div class="reveal" style="transition-delay:${i * 0.08}s">
            <a href="/conditions/${cat.slug}" class="cat-card">
              <div class="cat-card__header">
                <span class="cat-card__badge cat-card__badge--secondary">Conditions</span>
                <span class="cat-card__arrow">${icons.arrowRight}</span>
              </div>
              <h2 class="cat-card__title">${cat.shortName}</h2>
              <p class="cat-card__count">${cat.conditionSlugs.length} conditions</p>
              <p class="cat-card__desc">${cat.metaDescription.substring(0, 100)}…</p>
            </a>
          </div>`).join("")}
        </div>

        <!-- All Conditions List -->
        <div style="margin-bottom:4rem">
          <h2 class="section-title reveal" style="margin-bottom:2rem">All Conditions We Treat</h2>
          <div class="grid-auto sm:grid-2 md:grid-3 lg:grid-4">
            ${allConditions.map((cond, i) => `
            <div class="reveal" style="transition-delay:${Math.min(i * 0.03, 0.5)}s">
              <a href="/conditions/${cond.slug}" class="svc-list-link">
                <div class="svc-list-link__inner">
                  <span class="svc-list-link__name">${cond.name}</span>
                  <span class="svc-list-link__arrow">${icons.arrowRight}</span>
                </div>
              </a>
            </div>`).join("")}
          </div>
        </div>

        <!-- Why IHP -->
        <div class="cta-subtle reveal" style="margin-bottom:4rem">
          <div style="max-width:44rem;margin-inline:auto;text-align:center">
            <h2 class="font-display" style="font-size:1.75rem;margin-bottom:1rem">Why Integrative Health Partners?</h2>
            <p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.5rem">
              Dr. William Hendry brings 25+ years of clinical experience, NCCAOM board certification,
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
<p style="color:var(--color-muted);line-height:1.75;margin-bottom:0">Treatment timelines vary: acute injuries typically resolve in 4–8 sessions. Longstanding chronic pain requires 10–14 sessions for significant improvement, with monthly maintenance thereafter. At your first appointment, Dr. Hendry will assess your specific presentation and give you a realistic, personalized treatment timeline.</p>`,
    faqs: [
      { q: "Can acupuncture help with chronic pain that hasn't responded to other treatments?", a: "Yes. Many of our pain patients have already tried physical therapy, medications, and injections. Acupuncture works through mechanisms that these approaches don't reach — specifically, it modulates central pain sensitization, resolves deep myofascial restrictions, and addresses systemic inflammatory drivers. Dr. Hendry's multi-modal approach combining acupuncture with dry needling and functional medicine is particularly effective for complex, multi-year pain cases." },
      { q: "What is dry needling and how does it differ from acupuncture?", a: "Dry needling targets specific myofascial trigger points using solid filiform needles to release muscle knots and restore normal neuromuscular function. Traditional acupuncture uses the same needles at mapped acupoints along meridian pathways to regulate the nervous system, reduce inflammation, and address systemic patterns. Dr. Hendry is trained in both and integrates them based on each patient's presentation — often using both modalities in a single treatment session for pain conditions." },
      { q: "How long until I see results for my pain condition?", a: "Most patients notice measurable improvement within 3–5 sessions. Acute conditions (recent injuries, post-surgical recovery) often respond more quickly. Chronic conditions — especially those involving central sensitization, fibromyalgia, or longstanding structural damage — typically require 8–12 sessions for significant, lasting improvement. Dr. Hendry will give you a clear, honest timeline at your first visit based on your specific condition history." },
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
      { q: "Can acupuncture help with anxiety and insomnia without medication?", a: "Acupuncture has strong evidence for both anxiety and insomnia as a standalone or adjunct treatment. It regulates the HPA axis, reduces cortisol, promotes melatonin secretion, and modulates GABA signaling — directly addressing the biological underpinnings of both conditions. Many patients see measurable improvement in sleep quality within 3–5 sessions. We also assess and address nutritional factors (magnesium, B vitamins) and gut-brain axis imbalances that perpetuate anxiety and sleep disruption." },
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
            <a href="/conditions/${cond.slug}" class="svc-list-link">
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
            <a href="/conditions/${oc.slug}" class="other-cat-card reveal">
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
              <a href="/services/${s}" class="related-card reveal">
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
              <a href="/conditions/${rc.slug}" class="related-card reveal">
                <div class="related-card__inner">
                  <span class="related-card__name">${rc.name}</span>
                  <span class="related-card__arrow">${icons.arrowRight}</span>
                </div>
              </a>`).join("")}
            </div>
          </div>` : ""}

          ${(() => {
            const blogLinks = getConditionBlogLinks(condSlug, 3);
            if (blogLinks.length === 0) return "";
            return `
          <div style="margin-top:3rem" class="reveal">
            <h2 class="font-heading" style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">
              ${icons.leaf} From the IHP Blog
            </h2>
            <div style="display:flex;flex-direction:column;gap:0.625rem">
              ${blogLinks.map(b => `
              <a href="/blog/${b.slug}" style="display:flex;align-items:center;gap:0.625rem;font-size:0.9375rem;color:var(--color-primary);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--color-border)" class="blog-cross-link">
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
              <div class="check-item">${icons.check}<span>NCCAOM board-certified</span></div>
              <div class="check-item">${icons.check}<span>Hospital privileges — Prisma Health</span></div>
              <div class="check-item">${icons.check}<span>5 research publications</span></div>
              <div class="check-item">${icons.check}<span>Dual Oriental &amp; functional medicine training</span></div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Explore All Conditions</p>
            ${conditionCategories.map(cc => `
            <a href="/conditions/${cc.slug}" class="sidebar-link">${cc.shortName}</a>`).join("")}
            <a href="/conditions" class="text-link" style="font-size:0.875rem;font-weight:500;display:block;margin-top:0.75rem">
              View all conditions →
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
  const html = `${renderHead("About Integrative Health Partners | Acupuncture & Functional Medicine Greenville, SC", "Learn about Integrative Health Partners — Greenville SC's trusted integrative health practice. Root-cause functional medicine, acupuncture, and in-house herbal pharmacy. Call (864) 365-6156.")}
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
            <p>Led by <a href="/dr-hendry" class="internal-link">Dr. William Hendry, DAOM</a>, our practice blends traditional Chinese medicine — refined over 2,000 years — with modern functional medicine diagnostics. The result is a comprehensive, patient-centered approach that addresses not just what you feel, but <em>why</em> you feel it.</p>
          </section>

          <section class="content-section">
            <h2>Our Philosophy of Care</h2>
            <p>Conventional medicine excels at crisis care. Functional and integrative medicine excels at <em>chronic care</em> — the persistent conditions that don't resolve with a pill or a procedure. At Integrative Health Partners, we use both lenses.</p>
            <p>Every new patient begins with a thorough intake that explores not just their chief complaint, but their entire health history: diet, sleep, stress, environment, medications, and prior treatments. From this foundation, Dr. Hendry builds an individualized treatment plan that may include <a href="/services/acupuncture-therapy" class="internal-link">acupuncture therapy</a>, <a href="/services/chinese-herbal-medicine" class="internal-link">Chinese herbal medicine</a>, <a href="/services/functional-medicine-consultation" class="internal-link">functional medicine consultation</a>, and targeted nutritional support.</p>
            <p>We believe in transparency. You will always understand what we are doing and why — and we will track your progress with measurable outcomes at every step.</p>
          </section>

          <section class="content-section">
            <h2>In-House Herbal Pharmacy</h2>
            <p>One of the most distinctive features of our practice is our full in-house herbal pharmacy. Many acupuncture clinics refer patients elsewhere for Chinese herbal formulas, creating delays and gaps in care. We stock an extensive formulary of professional-grade, tested herbal medicines on site.</p>
            <p>Dr. Hendry prescribes custom herbal formulations tailored to each patient's constitution and condition — not a one-size-fits-all supplement. Our pharmacy includes classical formulas, granule extracts, and single-herb preparations. Every product meets rigorous quality standards for purity and potency. For patients managing complex conditions like <a href="/conditions/autoimmune-disease" class="internal-link">autoimmune disease</a>, <a href="/conditions/hormone-imbalance" class="internal-link">hormone imbalance</a>, or <a href="/conditions/chronic-fatigue" class="internal-link">chronic fatigue</a>, the herbal pharmacy is an essential component of the healing process.</p>
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
              <li>${icons.checkCircle} <strong>Published researcher:</strong> With 5 peer-reviewed publications and 52 citations, Dr. Hendry brings an evidence base to every clinical decision. Learn more on the <a href="/dr-hendry" class="internal-link">Dr. Hendry page</a>.</li>
              <li>${icons.checkCircle} <strong>Full-spectrum integrative care:</strong> Acupuncture, herbal medicine, functional medicine diagnostics, <a href="/services/ozone-therapy" class="internal-link">ozone therapy</a>, injection therapy, and nutritional counseling — all under one roof.</li>
              <li>${icons.checkCircle} <strong>In-house herbal pharmacy:</strong> Professional-grade herbs dispensed at the time of your appointment — no waiting, no third-party sourcing.</li>
            </ul>
          </section>

          <section class="content-section">
            <h2>Our Location</h2>
            <p>We are conveniently located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609 — easily accessible from Spartanburg, Anderson, North Greenville, Travelers Rest, Taylors, Mauldin, Simpsonville, and the greater Upstate South Carolina area. We serve patients throughout Upstate SC.</p>
            <p>We see patients Monday through Friday, 9am–5pm. New patients are always welcome. Call us at <a href="tel:+1-864-365-6156" class="internal-link">(864) 365-6156</a> or email <a href="mailto:info@ihpgreenville.com" class="internal-link">info@ihpgreenville.com</a> to schedule your initial consultation.</p>
          </section>

          <section class="content-section">
            <h2>Frequently Asked Questions About Our Practice</h2>
            ${[
              { q: "What types of patients does Integrative Health Partners see?", a: "We see patients of all ages with both acute and chronic conditions. Many of our patients have complex health issues that haven't resolved with conventional care alone — including chronic pain, autoimmune conditions, hormonal imbalances, digestive disorders, and neurological conditions. We also see patients seeking preventive care and health optimization." },
              { q: "Do I need a referral from my doctor to be seen?", a: "No referral is needed. You can book directly by calling (864) 365-6156. If you have been referred by a physician, we welcome that collaboration and will communicate with your referring provider as appropriate." },
              { q: "What should I bring to my first appointment?", a: "Bring a list of current medications and supplements, any recent lab work or imaging results, and a brief summary of your health history and current concerns. Wearing loose, comfortable clothing is recommended if acupuncture will be part of your initial visit." },
              { q: "How long is an initial consultation?", a: "Your first visit typically lasts 60–90 minutes. This allows Dr. Hendry to conduct a thorough health history, perform diagnostic assessments (including tongue and pulse diagnosis), and begin developing your individualized treatment plan." },
              { q: "Do you accept insurance?", a: "Integrative Health Partners is a cash-pay practice and does not bill insurance directly. We provide itemized superbills that you can submit to your insurance for potential out-of-network reimbursement. Call (864) 365-6156 to learn more." },
              { q: "What makes IHP different from other acupuncture clinics?", a: "Three key differentiators: Dr. Hendry's 9-year hospital privileges at Prisma Health (rare for an acupuncturist), our full in-house herbal pharmacy for same-day dispensing, and Dr. Hendry's published research background (5 publications, 52 citations) ensuring every treatment decision is evidence-informed." },
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
              <a href="/dr-hendry" class="btn btn-outline">Meet Dr. Hendry</a>
            </div>
          </div>

          <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-muted)">
            Have questions before booking? <a href="mailto:${NAP.email}" class="internal-link">Contact us at ${NAP.email}</a>.
          </p>

        </div>

        <aside class="sidebar">
          <div class="sidebar-card" style="padding:0;overflow:hidden">
            <div class="sidebar-photo">
              <img src="/images/clinic/waiting.jpg" alt="Waiting area at Integrative Health Partners — peaceful setting with traditional Chinese landscape art" loading="lazy" width="400" height="180" />
            </div>
            <div style="padding:0.875rem 1.25rem">
              <p style="font-size:0.875rem;color:var(--color-muted);margin:0;line-height:1.6">Our welcoming waiting area at 319 Wade Hampton Blvd, Ste A, Greenville, SC.</p>
            </div>
          </div>

          <div class="sidebar-card" style="text-align:center">
            <img src="/images/dr-hendry.jpg"
              alt="Dr. William Hendry, DAOM — Acupuncturist and Functional Medicine Practitioner, Greenville SC"
              class="dr-headshot" loading="lazy" />
            <p class="sidebar-card__title" style="margin-top:0.75rem">Meet Dr. Hendry</p>
            <p style="font-size:0.9375rem;color:var(--color-muted);line-height:1.65;margin-bottom:0.75rem">
              Dr. William Hendry, DAOM holds a doctorate in acupuncture and oriental medicine and is NCCAOM board-certified with 25+ years of clinical experience.
            </p>
            <a href="/dr-hendry" class="sidebar-link">${icons.arrowRight} Full Credentials &amp; Biography</a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Contact &amp; Location</p>
            <div class="footer__contact-list" style="gap:0.625rem">
              <div class="footer__contact-row">${icons.mapPin}<span>319 Wade Hampton Blvd<br>Ste A, Greenville, SC 29609</span></div>
              <div class="footer__contact-row">${icons.phone}<a href="tel:${NAP.phoneRaw}" class="footer__contact-link">${NAP.phone}</a></div>
              <div class="footer__contact-row">${icons.mail}<a href="mailto:${NAP.email}" class="footer__contact-link">${NAP.email}</a></div>
              <div class="footer__contact-row">${icons.clock}<span>Mon–Fri 9am–5pm</span></div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Our Services</p>
            <div class="footer__links" style="gap:0.375rem">
              <a href="/services/acupuncturist-services" class="sidebar-link">${icons.arrowRight} Acupuncturist Services</a>
              <a href="/services/acupuncture-clinic-services" class="sidebar-link">${icons.arrowRight} Acupuncture Clinic</a>
              <a href="/services/chinese-medicine-clinic-services" class="sidebar-link">${icons.arrowRight} Chinese Medicine</a>
              <a href="/services/alternative-medicine-practitioner-services" class="sidebar-link">${icons.arrowRight} Alternative Medicine</a>
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
      title: "Evaluating the Effects of Acupuncture in the Treatment of Taxane Induced Peripheral Neuropathy",
      venue: "Prisma Health Patient Engagement Studio",
      url: "https://academics.prismahealth.org/research-and-innovation/research-development/resources/patient-engagement-studio/main-studio"
    },
    {
      title: "Symptom Management Among Cancer Survivors: HRV Biofeedback",
      venue: "Peer-Reviewed Journal — June 2020",
      url: "https://www.researchgate.net/profile/William-Hendry-4"
    },
    {
      title: "Use of HRV Biofeedback for Symptom Management Among Cancer Survivors",
      venue: "Peer-Reviewed Journal — May 2017",
      url: "https://www.researchgate.net/profile/William-Hendry-4"
    },
    {
      title: "HRV Training for Symptom Control in Cancer Survivors",
      venue: "Peer-Reviewed Journal — February 2017",
      url: "https://www.researchgate.net/profile/William-Hendry-4"
    },
    {
      title: "Neurogenesis: Implications for Integrative Care of Neurological Conditions",
      venue: "Peer-Reviewed Journal — November 2013",
      url: "https://www.researchgate.net/profile/William-Hendry-4"
    }
  ];

  const credentials = [
    { label: "Degree", value: "Doctor of Acupuncture and Oriental Medicine (DAOM)" },
    { label: "Institution", value: "East West College of Natural Medicine (Graduated December 2008)" },
    { label: "NCCAOM Certification", value: "Dipl. O.M. (NCCAOM)® — Certificate #114498" },
    { label: "NCCAOM Valid Through", value: "August 31, 2029" },
    { label: "NPI Number", value: "1417184045 (Active since June 22, 2009)" },
    { label: "SC License", value: "ACUP141 (Expires September 30, 2027)" },
    { label: "FL License", value: "AP2646" },
    { label: "Additional Certification", value: "Injection Therapy Certified" },
    { label: "Hospital Privileges", value: "Prisma Health — 9 Years" },
    { label: "Professional Membership", value: "American Academy of Ozone Therapy (AAOT)" },
    { label: "Research Publications", value: "5 peer-reviewed studies | 52 citations" },
  ];

  const html = `${renderHead("Dr. William Hendry, DAOM | Integrative Health Partners Greenville, SC", "Dr. William Hendry — DAOM, NCCAOM #114498, NPI 1417184045, 25+ years clinical experience. Co-author of landmark Prisma Health opioid alternative ER study. Greenville, SC acupuncturist.")}
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
              <a href="https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==" target="_blank" rel="noopener noreferrer" class="internal-link">Verify NCCAOM Badge ${icons.externalLink}</a>
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
              <p><a href="https://academics.prismahealth.org/research-and-innovation/research-development/resources/patient-engagement-studio/main-studio" target="_blank" rel="noopener noreferrer" class="internal-link">View Prisma Health Research ${icons.externalLink}</a></p>
            </div>
          </section>

          <section class="content-section">
            <h2>25+ Years of Clinical Excellence</h2>
            <p>Dr. Hendry began his formal training in acupuncture and oriental medicine in the late 1990s and graduated with his Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine in December 2008 — completing the highest academic credential available in the field. He passed his NCCAOM board examinations and has maintained active board certification ever since, with his current certification valid through August 2029.</p>
            <p>Over more than 25 years, Dr. Hendry has treated thousands of patients across a wide range of conditions — from <a href="/conditions/back-pain" class="internal-link">chronic back pain</a> and <a href="/conditions/fibromyalgia" class="internal-link">fibromyalgia</a> to <a href="/conditions/fertility" class="internal-link">fertility challenges</a>, <a href="/conditions/anxiety-stress" class="internal-link">anxiety and stress</a>, and complex chronic illnesses. His approach is both disciplined and creative: grounded in the classical literature of Chinese medicine, yet continuously informed by the latest functional medicine research.</p>
            <p>He holds active licenses in both South Carolina (ACUP141) and Florida (AP2646), and is a certified Injection Therapy practitioner — enabling him to offer biopuncture and nutrient injection therapies unavailable at most acupuncture clinics.</p>
          </section>

          <section class="content-section">
            <h2>Research &amp; Publications</h2>
            <p>Dr. Hendry has authored or co-authored 5 peer-reviewed research publications with a combined 52 citations. His research spans acupuncture for chemotherapy-induced neuropathy, HRV biofeedback for cancer survivor symptom management, and the neuroscience of integrative care.</p>
            <div class="publications-list">
              ${publications.map((pub, i) => `
              <div class="publication-item">
                <span class="publication-number">${i + 1}</span>
                <div class="publication-content">
                  <p class="publication-title"><a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="internal-link">${pub.title} ${icons.externalLink}</a></p>
                  <p class="publication-venue">${pub.venue}</p>
                </div>
              </div>`).join('')}
            </div>
            <p style="margin-top:1.25rem">
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
            <p>He is equally at home working with a patient navigating <a href="/conditions/autoimmune-disease" class="internal-link">autoimmune disease</a> as he is treating a high-performance athlete recovering from a <a href="/conditions/sports-injuries" class="internal-link">sports injury</a>. Whether prescribing a classical herbal formula or interpreting functional blood chemistry, Dr. Hendry brings the same rigor, curiosity, and compassion to every patient encounter.</p>
            <p>His membership in the <strong>American Academy of Ozone Therapy (AAOT)</strong> reflects his commitment to staying at the frontier of integrative medicine, including emerging therapies like <a href="/services/ozone-therapy" class="internal-link">medical ozone therapy</a> that are gaining traction in evidence-based circles.</p>
          </section>

          <section class="content-section">
            <h2>Frequently Asked Questions About Dr. Hendry</h2>
            ${[
              { q: "What is Dr. Hendry's highest academic credential?", a: "Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine, which is the highest academic degree available in the acupuncture and oriental medicine field. He graduated in December 2008." },
              { q: "Is Dr. Hendry board certified?", a: "Yes. Dr. Hendry holds NCCAOM (National Certification Commission for Acupuncture and Oriental Medicine) board certification as a Diplomate of Oriental Medicine — certificate #114498. His certification is valid through August 31, 2029." },
              { q: "Has Dr. Hendry published research?", a: "Yes. Dr. Hendry has authored or co-authored 5 peer-reviewed research publications with a combined 52 citations. His research includes the Prisma Health opioid alternative study, HRV biofeedback for cancer survivors, and neurogenesis in integrative care." },
              { q: "What is Dr. Hendry's hospital experience?", a: "Dr. Hendry held hospital privileges at Prisma Health for 9 years — an exceptional distinction for an acupuncturist. During that time, he co-investigated a 3-year study using needling techniques as alternatives to opioid pain management in the Emergency Department." },
              { q: "Does Dr. Hendry offer injection therapies?", a: "Yes. Dr. Hendry is a certified Injection Therapy practitioner, enabling him to offer biopuncture and nutrient injection therapies. These treatments involve micro-injections of natural substances at specific points to support healing — a service unavailable at most acupuncture clinics." },
              { q: "How can I verify Dr. Hendry's credentials?", a: "You can verify his NCCAOM certification via the official NCCAOM digital badge, his NPI number (1417184045) through the NPI database, and his South Carolina license (ACUP141) through the SC Department of Labor, Licensing and Regulation website." },
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
              <a href="/about" class="btn btn-outline">About Our Practice</a>
            </div>
          </div>

        </div>

        <aside class="sidebar">
          <div class="sidebar-card" style="text-align:center">
            <img src="/images/dr-hendry.jpg"
              alt="Dr. William Hendry, DAOM — Acupuncturist and Functional Medicine Practitioner, Greenville SC"
              class="dr-headshot" loading="lazy" />
            <p style="font-family:var(--font-heading);font-weight:700;font-size:1rem;color:var(--color-foreground);margin-top:0.75rem">Dr. William Hendry</p>
            <p style="font-size:0.8125rem;color:var(--color-muted);margin-top:0.25rem">DAOM, Dipl. O.M. (NCCAOM)®</p>
            <p style="font-size:0.75rem;color:var(--color-muted);margin-top:0.125rem">Greenville, SC</p>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Board Certifications</p>
            <div class="footer__links" style="gap:0.5rem">
              <div class="sidebar-cred">${icons.award} NCCAOM Dipl. O.M. #114498</div>
              <div class="sidebar-cred">${icons.shield} SC License ACUP141</div>
              <div class="sidebar-cred">${icons.shield} FL License AP2646</div>
              <div class="sidebar-cred">${icons.check} Injection Therapy Certified</div>
              <div class="sidebar-cred">${icons.check} NPI 1417184045</div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Verify Credentials</p>
            <div class="footer__links" style="gap:0.5rem">
              <a href="https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} NCCAOM Badge</a>
              <a href="https://directory.ncbahm.org/FAP/PractitionerDetail?AgencyClientId=ssLe-Z5Nnck=&d=4.8" target="_blank" rel="noopener noreferrer" class="sidebar-link">${icons.externalLink} NCCAOM Directory</a>
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
  const html = `${renderHead("Contact IHP | Acupuncture Appointment Greenville, SC", "Schedule an appointment with Integrative Health Partners. 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156. Mon–Fri 9am–5pm.")}
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
            Ready to schedule with Dr. William Hendry? Call us directly at <a href="tel:${NAP.phoneRaw}" style="color:var(--color-primary);font-weight:600">${NAP.phone}</a> or email <a href="mailto:${NAP.email}" style="color:var(--color-primary)">${NAP.email}</a>. New patients are welcome. We see patients Monday through Friday, 9am–5pm.
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
                <span itemprop="openingHours" content="Mo-Fr 09:00-17:00"><strong>Hours:</strong> Monday–Friday, 9:00am–5:00pm</span>
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

          <!-- Clinic Photo -->
          <figure class="clinic-photo-card reveal" style="margin-bottom:2rem">
            <img src="/images/clinic/waiting.jpg" alt="Waiting area at Integrative Health Partners — comfortable and decorated with traditional Chinese landscape art" loading="lazy" width="800" height="260" />
            <figcaption>Our welcoming waiting area — a peaceful environment to begin your healing journey at Integrative Health Partners, Greenville, SC.</figcaption>
          </figure>

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

          <!-- Review Link -->
          <div style="background:linear-gradient(135deg,var(--color-primary),var(--color-accent));border-radius:0.75rem;padding:1.75rem;margin-bottom:2rem;color:#fff;text-align:center" class="reveal">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:0.75rem;color:#fff">Enjoyed Your Visit?</h2>
            <p style="opacity:0.9;margin-bottom:1.25rem;line-height:1.65">Your Google review helps other Greenville-area patients find quality integrative care. It takes less than 2 minutes.</p>
            <a href="https://share.google/TYarboIHpqlhU6odK" target="_blank" rel="noopener noreferrer"
              style="background:#fff;color:var(--color-primary);font-weight:700;padding:0.75rem 1.5rem;border-radius:0.5rem;text-decoration:none;display:inline-block">
              ⭐ Leave Us a Google Review
            </a>
          </div>

          <!-- Directory Listings -->
          <div style="margin-bottom:2rem" class="reveal">
            <h2 class="font-display" style="font-size:1.375rem;margin-bottom:1rem">Find Us Online</h2>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
              <a href="https://www.google.com/maps/place/Integrative+Health+Partners" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Google Business Profile</a>
              <a href="https://www.healthgrades.com" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Healthgrades</a>
              <a href="https://www.yelp.com" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Yelp</a>
              <a href="https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">NCCAOM Verification</a>
            </div>
          </div>
        </article>

        <!-- Sidebar -->
        <aside>
          <!-- CTA Card -->
          <div class="sidebar-cta" style="margin-bottom:1.5rem">
            <p class="sidebar-cta__label">New Patients Welcome</p>
            <h2 class="sidebar-cta__title">Schedule Your Consultation</h2>
            <p class="sidebar-cta__body">Call Dr. Hendry's office directly to book your comprehensive initial evaluation. Appointments typically last 60–90 minutes.</p>
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
                <span style="color:var(--color-primary)">9:00am – 5:00pm</span>
              </div>`).join("")}
              <div style="display:flex;justify-content:space-between">
                <span style="font-weight:500">Saturday–Sunday</span>
                <span style="color:var(--color-muted)">Closed</span>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:0.75rem;padding:1.5rem;margin-bottom:1.5rem">
            <h3 class="font-display" style="font-size:1.125rem;margin-bottom:0.875rem">About Our Practice</h3>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              <a href="/about" class="internal-link">About Integrative Health Partners</a>
              <a href="/dr-hendry" class="internal-link">Dr. William Hendry, DAOM</a>
              <a href="/conditions" class="internal-link">Conditions We Treat</a>
              <a href="/services/acupuncturist-services" class="internal-link">Acupuncturist Services</a>
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
    description: "Schedule an appointment with Integrative Health Partners. 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156. Mon–Fri 9am–5pm.",
    canonical: `${process.env.BASE_URL || "https://www.ihpgreenville.com"}/contact`,
    ogType: "website",
    schemas: []
  };
  return injectSEOIntoHTML(html, seo);
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
