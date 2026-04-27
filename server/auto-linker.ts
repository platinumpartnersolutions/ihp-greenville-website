/* ============================================================
   AUTO-LINKER
   Injects contextual anchor links into HTML prose sections.
   Applied to: blog post content, service page prose, condition page prose.

   Rules:
   - Only processes text nodes — never modifies HTML tag attributes
   - Tracks <a>...</a> depth: will not nest links
   - Links each phrase only ONCE per page (first occurrence)
   - Skips linking if the target URL matches the current page
   - Phrases ordered from most specific → most generic
   ============================================================ */

const LINK_MAP: [RegExp, string][] = [

  /* ── SERVICES — most specific first ───────────────────────── */

  // Specific acupuncture modalities
  [/\bdry[- ]needling\b/gi,                      "/services/dry-needling-therapy"],
  [/\belectroacupuncture\b/gi,                   "/services/electroacupuncture"],
  [/\bcosmetic acupuncture\b/gi,                 "/services/cosmetic-acupuncture"],
  [/\bfacial rejuvenation acupuncture\b/gi,      "/services/facial-rejuvenation-acupuncture"],
  [/\blaser acupuncture\b/gi,                    "/services/laser-acupuncture"],
  [/\bauricular acupuncture\b/gi,                "/services/auricular-acupuncture"],
  [/\bear acupuncture\b/gi,                      "/services/ear-acupuncture"],
  [/\bscalp acupuncture\b/gi,                    "/services/scalp-acupuncture"],
  [/\bmedical acupuncture\b/gi,                  "/services/medical-acupuncture"],
  [/\bacupuncture injection therapy\b/gi,         "/services/biopuncture-therapy"],
  [/\bAIT\b/g,                                   "/services/biopuncture-therapy"],

  // Herbal medicine
  [/\bChinese herbal medicine\b/gi,              "/services/chinese-herbal-medicine"],
  [/\bChinese herbal formula\w*\b/gi,            "/services/chinese-herbal-formulas"],
  [/\bcustom herbal formula\w*\b/gi,             "/services/custom-herbal-formulations"],
  [/\bChinese herbs?\b/gi,                       "/services/chinese-herbal-medicine"],
  [/\bherbal medicine\b/gi,                      "/services/chinese-herbal-medicine"],
  [/\bherbal formula\w*\b/gi,                    "/services/chinese-herbal-formulas"],
  [/\bherbal consultation\b/gi,                  "/services/herbal-consultation"],
  [/\bherbal supplement\w*\b/gi,                 "/services/herbal-supplements"],

  // Prolotherapy / Biopuncture
  [/\bprolotherapy\b/gi,                         "/services/prolotherapy"],
  [/\bbiopuncture injections?\b/gi,              "/services/biopuncture-injections"],
  [/\bbiopuncture\b/gi,                          "/services/biopuncture-therapy"],
  [/\bregenerative joint therapy\b/gi,           "/services/biopuncture-therapy"],

  // Ozone
  [/\bozone steam sauna\b/gi,                    "/services/ozone-steam-sauna"],
  [/\bozone sauna therapy\b/gi,                  "/services/ozone-sauna-therapy"],
  [/\bozone sauna\b/gi,                          "/services/ozone-sauna-therapy"],
  [/\bmedical ozone therapy\b/gi,                "/services/medical-ozone-therapy"],
  [/\bozone therapy\b/gi,                        "/services/ozone-therapy"],
  [/\bozone detoxification\b/gi,                 "/services/ozone-detoxification"],

  // Cupping, Moxa, Gua Sha
  [/\bcupping therapy\b/gi,                      "/services/cupping-therapy"],
  [/\bfire cupping\b/gi,                         "/services/fire-cupping"],
  [/\bchinese cupping\b/gi,                      "/services/chinese-cupping"],
  [/\bcupping\b/gi,                              "/services/cupping-therapy"],
  [/\bmoxibustion therapy\b/gi,                  "/services/moxibustion-therapy"],
  [/\bmoxibustion\b/gi,                          "/services/moxibustion-therapy"],
  [/\bmoxa\b/gi,                                 "/services/moxa-treatment"],
  [/\bgua[- ]sha therapy\b/gi,                   "/services/gua-sha-therapy"],
  [/\bgua[- ]sha\b/gi,                           "/services/gua-sha-treatment"],

  // Other physical modalities
  [/\bacupressure therapy\b/gi,                  "/services/acupressure-therapy"],
  [/\bacupressure\b/gi,                          "/services/acupressure-therapy"],
  [/\btrigger[- ]point dry needling\b/gi,        "/services/trigger-point-dry-needling"],
  [/\btrigger[- ]point therapy\b/gi,             "/services/trigger-point-therapy"],
  [/\bintramuscular stimulation\b/gi,            "/services/intramuscular-stimulation"],
  [/\binfrared sauna\b/gi,                       "/services/infrared-sauna-therapy"],

  // Functional medicine and testing
  [/\bfunctional medicine consultation\b/gi,     "/services/functional-medicine-consultation"],
  [/\bfunctional medicine\b/gi,                  "/services/functional-medicine-consultation"],
  [/\broot[- ]cause analysis\b/gi,               "/services/root-cause-analysis"],
  [/\bfunctional blood chemistry\b/gi,           "/services/functional-blood-chemistry-analysis"],
  [/\bcomprehensive blood panel\b/gi,            "/services/comprehensive-blood-panel"],
  [/\bhormone testing\b/gi,                      "/services/hormone-testing"],
  [/\bthyroid testing\b/gi,                      "/services/thyroid-testing"],
  [/\badrenal testing\b/gi,                      "/services/adrenal-testing"],
  [/\bgut health testing\b/gi,                   "/services/gut-health-testing"],
  [/\bfood sensitivity testing\b/gi,             "/services/food-sensitivity-testing"],
  [/\bnutritional deficiency testing\b/gi,       "/services/nutritional-deficiency-testing"],
  [/\binflammatory marker testing\b/gi,          "/services/inflammatory-marker-testing"],

  // Nutrition and supplements
  [/\bnutritional counseling\b/gi,               "/services/nutritional-counseling"],
  [/\bnutrition therapy\b/gi,                    "/services/nutrition-therapy"],
  [/\bwhole[- ]food supplements?\b/gi,           "/services/whole-food-supplements"],
  [/\bprofessional[- ]grade vitamins?\b/gi,      "/services/professional-grade-vitamins"],
  [/\bvitamin therapy\b/gi,                      "/services/vitamin-therapy"],
  [/\bmineral supplementation\b/gi,              "/services/mineral-supplementation"],
  [/\bsupplement recommendations?\b/gi,          "/services/supplement-recommendations"],

  // Detox and specific treatments
  [/\bheavy metal detox\b/gi,                    "/services/heavy-metal-detox"],
  [/\bdetoxification therapy\b/gi,               "/services/detoxification-therapy"],
  [/\bdetoxification\b/gi,                       "/services/detoxification-therapy"],
  [/\bimmune system support\b/gi,                "/services/immune-system-support"],
  [/\bblood sugar support\b/gi,                  "/services/blood-sugar-support"],
  [/\bmetabolism support\b/gi,                   "/services/metabolism-support"],
  [/\bweight[- ]loss support\b/gi,               "/services/weight-loss-support"],
  [/\bleaky[- ]gut treatment\b/gi,               "/services/leaky-gut-treatment"],
  [/\bdigestive health treatment\b/gi,           "/services/digestive-health-treatment"],

  // Specific condition-named treatments
  [/\bautoimmune disease treatment\b/gi,         "/services/autoimmune-disease-treatment"],
  [/\bbrain[- ]fog treatment\b/gi,               "/services/brain-fog-treatment"],
  [/\bchronic fatigue treatment\b/gi,            "/services/chronic-fatigue-treatment"],
  [/\bneuropathy treatment\b/gi,                 "/services/neuropathy-treatment"],
  [/\bperipheral neuropathy treatment\b/gi,      "/services/peripheral-neuropathy-treatment"],
  [/\bfibromyalgia treatment\b/gi,               "/services/fibromyalgia-treatment"],
  [/\bthyroid disorder treatment\b/gi,           "/services/thyroid-disorder-treatment"],
  [/\badrenal fatigue treatment\b/gi,            "/services/adrenal-fatigue-treatment"],
  [/\bfertility treatment\b/gi,                  "/services/fertility-treatment"],
  [/\bfertility acupuncture\b/gi,               "/services/fertility-acupuncture"],
  [/\binfertility treatment\b/gi,                "/services/infertility-treatment"],
  [/\bmenopause treatment\b/gi,                  "/services/menopause-treatment"],
  [/\binsomnia treatment\b/gi,                   "/services/insomnia-treatment"],
  [/\bchronic pain management\b/gi,              "/services/chronic-pain-management"],
  [/\bback[- ]pain treatment\b/gi,               "/services/back-pain-treatment"],
  [/\bsciatica treatment\b/gi,                   "/services/sciatica-treatment"],
  [/\bneck[- ]pain treatment\b/gi,               "/services/neck-pain-treatment"],
  [/\bknee[- ]pain treatment\b/gi,               "/services/knee-pain-treatment"],
  [/\bshoulder[- ]pain treatment\b/gi,           "/services/shoulder-pain-treatment"],
  [/\bsports[- ]injury treatment\b/gi,           "/services/sports-injury-treatment"],

  // Long-covid
  [/\blong[- ]?covid\b/gi,                       "/services/long-covid-treatment"],
  [/\bpost[- ]?covid recovery\b/gi,              "/services/post-covid-recovery"],

  // Generic — acupuncture last (most likely to over-match)
  [/\bacupuncture\b/gi,                          "/services/acupuncture-therapy"],

  /* ── BLOG POSTS — specific high-value posts ───────────────── */

  [/\bresveratrol\b/gi,                           "/blog/red-wine-for-health"],
  [/\bCIRS\b/g,                                   "/blog/how-to-treat-mold-illness-with-herbs-and-supplements"],
  [/\bmold illness\b/gi,                          "/blog/how-to-treat-mold-illness-with-herbs-and-supplements"],
  [/\bmycotoxin\w*\b/gi,                          "/blog/how-to-treat-mold-illness-with-herbs-and-supplements"],

  /* ── CONDITIONS — most specific first ─────────────────────── */

  [/\bHashimoto'?s?\b/gi,                        "/conditions/hashimotos"],
  [/\bPCOS\b/g,                                  "/conditions/pcos"],
  [/\bPTSD\b/g,                                  "/conditions/ptsd"],
  [/\birritable bowel syndrome\b/gi,             "/conditions/ibs-gut-issues"],
  [/\bIBS\b/g,                                   "/conditions/ibs-gut-issues"],
  [/\bleaky gut\b/gi,                            "/conditions/leaky-gut"],
  [/\bchronic fatigue syndrome\b/gi,             "/conditions/chronic-fatigue"],
  [/\bchronic fatigue\b/gi,                      "/conditions/chronic-fatigue"],
  [/\badrenal fatigue\b/gi,                      "/conditions/adrenal-fatigue"],
  [/\bbrain fog\b/gi,                            "/conditions/brain-fog"],
  [/\bhormonal? imbalanc\w*\b/gi,               "/conditions/hormone-imbalance"],
  [/\bautoimmune (?:disease|condition|disorder)\b/gi, "/conditions/autoimmune-disease"],
  [/\bfibromyalgia\b/gi,                         "/conditions/fibromyalgia"],
  [/\bperipheral neuropathy\b/gi,                "/conditions/neuropathy"],
  [/\bneuropathy\b/gi,                           "/conditions/neuropathy"],
  [/\bfood sensitivit\w*\b/gi,                   "/conditions/food-sensitivities"],
  [/\bback pain\b/gi,                            "/conditions/back-pain"],
  [/\bsciatica\b/gi,                             "/conditions/sciatica"],
  [/\bknee pain\b/gi,                            "/conditions/knee-pain"],
  [/\bshoulder pain\b/gi,                        "/conditions/shoulder-pain"],
  [/\bneck pain\b/gi,                            "/conditions/neck-pain"],
  [/\bhip pain\b/gi,                             "/conditions/hip-pain"],
  [/\brheumatoid arthritis\b/gi,                 "/conditions/arthritis"],
  [/\bosteoarthritis\b/gi,                       "/conditions/arthritis"],
  [/\barthritis\b/gi,                            "/conditions/arthritis"],
  [/\binsomnia\b/gi,                             "/conditions/insomnia"],
  [/\bmigraine\w*\b/gi,                          "/conditions/headaches-migraines"],
  [/\btension headache\w*\b/gi,                  "/conditions/headaches-migraines"],
  [/\bperimenopause\b/gi,                        "/conditions/perimenopause"],
  [/\bmenopause\b/gi,                            "/conditions/menopause"],
  [/\bthyroid\b/gi,                              "/conditions/thyroid-issues"],
  [/\banxiety\b/gi,                              "/conditions/anxiety-stress"],
  [/\bchronic stress\b/gi,                       "/conditions/anxiety-stress"],
  [/\bsports injur\w*\b/gi,                      "/conditions/sports-injuries"],
  [/\bchronic illness\b/gi,                      "/conditions/chronic-illness"],
  [/\bweight (?:loss|gain|issues?|management)\b/gi, "/conditions/weight-issues"],
  [/\bfertility\b/gi,                            "/conditions/fertility"],
  [/\binfertility\b/gi,                          "/conditions/fertility"],
];

/**
 * Processes an HTML string and injects contextual anchor links.
 * @param html        Raw HTML content to process.
 * @param currentUrl  The current page's URL path — prevents self-linking.
 * @returns           HTML with inline links injected.
 */
export function autoLink(html: string, currentUrl = ""): string {
  if (!html) return html;

  const used = new Set<string>();
  let insideAnchor = 0;

  return html.replace(
    /(<a[\s>][^>]*>|<\/a>|<[^>]+>)|([^<]+)/gi,
    (match, tag: string | undefined, text: string | undefined) => {
      if (tag !== undefined) {
        if (/^<a[\s>]/i.test(tag)) insideAnchor++;
        else if (/^<\/a>/i.test(tag)) insideAnchor = Math.max(0, insideAnchor - 1);
        return tag;
      }
      if (!text || insideAnchor > 0) return match;

      let result = text;
      for (const [pattern, url] of LINK_MAP) {
        if (used.has(url)) continue;
        if (url === currentUrl) continue;
        let linked = false;
        // Apply pattern only to text nodes within result — never inside HTML tags or attributes
        result = result.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => {
          if (tag !== undefined) return tag;
          if (!txt) return m;
          return txt.replace(pattern, (match) => {
            if (linked || used.has(url)) return match;
            linked = true;
            used.add(url);
            return `<a href="${url}" class="prose-link">${match}</a>`;
          });
        });
      }
      return result;
    }
  );
}
