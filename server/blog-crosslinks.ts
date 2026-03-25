/* ============================================================
   BLOG ↔ SERVICE/CONDITION CROSS-LINK MAP
   Maps every blog post slug → relevant service base slugs + condition slugs.
   Reverse lookups (service → blogs, condition → blogs) are derived automatically.
   ============================================================ */

interface BlogEntry {
  blogSlug: string;
  blogTitle: string;
  serviceBaseSlugs: string[];
  conditionSlugs: string[];
}

const blogEntries: BlogEntry[] = [

  /* ── PROLOTHERAPY / BIOPUNCTURE ──────────────────────────── */
  {
    blogSlug: "why-rotator-cuff-injuries-stop-healing-after-40",
    blogTitle: "Why Rotator Cuff Injuries Stop Healing After 40",
    serviceBaseSlugs: ["biopuncture-therapy", "dry-needling-therapy", "shoulder-pain-treatment"],
    conditionSlugs: ["shoulder-pain", "sports-injuries"],
  },
  {
    blogSlug: "what-is-prolotherapy-and-why-does-it-work",
    blogTitle: "What is Prolotherapy — and Why Does It Work?",
    serviceBaseSlugs: ["biopuncture-therapy", "biopuncture-injections", "joint-pain-treatment"],
    conditionSlugs: ["back-pain", "knee-pain", "arthritis"],
  },
  {
    blogSlug: "meniscus-degeneration-and-preventive-maintenance-for-knee-health",
    blogTitle: "Meniscus Degeneration and Preventive Maintenance for Knee Health",
    serviceBaseSlugs: ["biopuncture-therapy", "knee-pain-treatment", "acupuncture-therapy"],
    conditionSlugs: ["knee-pain", "arthritis"],
  },
  {
    blogSlug: "prolotherapy-for-spinal-ligament-tightening-and-spondylolisthesis-reversal",
    blogTitle: "Prolotherapy for Spinal Ligament Tightening and Spondylolisthesis Reversal",
    serviceBaseSlugs: ["biopuncture-therapy", "back-pain-treatment", "sciatica-treatment"],
    conditionSlugs: ["back-pain", "sciatica"],
  },
  {
    blogSlug: "what-is-prolotherapy-2",
    blogTitle: "What is Prolotherapy?",
    serviceBaseSlugs: ["biopuncture-therapy", "biopuncture-injections", "joint-pain-treatment"],
    conditionSlugs: ["back-pain", "arthritis", "knee-pain"],
  },
  {
    blogSlug: "what-is-prolotherapy",
    blogTitle: "What is Prolotherapy?",
    serviceBaseSlugs: ["biopuncture-therapy", "biopuncture-injections"],
    conditionSlugs: ["back-pain", "arthritis", "knee-pain"],
  },
  {
    blogSlug: "prolotherapy-joint-pain",
    blogTitle: "Prolotherapy & Joint Pain",
    serviceBaseSlugs: ["biopuncture-therapy", "joint-pain-treatment", "arthritis-pain-treatment"],
    conditionSlugs: ["arthritis", "back-pain", "knee-pain", "shoulder-pain"],
  },
  {
    blogSlug: "biopuncture-for-knee-pain",
    blogTitle: "Biopuncture for Knee Pain",
    serviceBaseSlugs: ["biopuncture-therapy", "biopuncture-injections", "knee-pain-treatment"],
    conditionSlugs: ["knee-pain", "arthritis"],
  },

  /* ── ACUPUNCTURE ─────────────────────────────────────────── */
  {
    blogSlug: "acupuncture-for-coronary-artery-disease-cad",
    blogTitle: "Acupuncture for Coronary Artery Disease (CAD)",
    serviceBaseSlugs: ["acupuncture-therapy", "electroacupuncture"],
    conditionSlugs: ["chronic-illness"],
  },
  {
    blogSlug: "acupuncture-for-back-pain",
    blogTitle: "Acupuncture for Back Pain",
    serviceBaseSlugs: ["acupuncture-therapy", "electroacupuncture", "back-pain-treatment"],
    conditionSlugs: ["back-pain", "sciatica"],
  },
  {
    blogSlug: "does-acupuncture-hurt",
    blogTitle: "Does Acupuncture Hurt?",
    serviceBaseSlugs: ["acupuncture-therapy", "dry-needling-therapy"],
    conditionSlugs: [],
  },
  {
    blogSlug: "us-military-using-acupuncture-to-reduce-stress-and-pain",
    blogTitle: "US Military Using Acupuncture to Reduce Stress and Pain",
    serviceBaseSlugs: ["acupuncture-therapy", "electroacupuncture", "acupuncture-for-stress-relief"],
    conditionSlugs: ["anxiety-stress", "back-pain"],
  },
  {
    blogSlug: "nausea-wristband-uses-acupuncture-point",
    blogTitle: "Nausea Wristband Uses Acupuncture Point",
    serviceBaseSlugs: ["acupuncture-therapy", "acupressure-therapy"],
    conditionSlugs: [],
  },
  {
    blogSlug: "dry-needling-and-acupuncture",
    blogTitle: "Dry Needling and Acupuncture",
    serviceBaseSlugs: ["dry-needling-therapy", "acupuncture-therapy", "trigger-point-dry-needling"],
    conditionSlugs: ["back-pain", "fibromyalgia", "sports-injuries"],
  },
  {
    blogSlug: "laser-acupuncture-rejuvenation",
    blogTitle: "Laser Acupuncture Rejuvenation",
    serviceBaseSlugs: ["laser-acupuncture", "cosmetic-acupuncture", "facial-rejuvenation-acupuncture"],
    conditionSlugs: [],
  },
  {
    blogSlug: "still-point-inducer",
    blogTitle: "Still Point Inducer",
    serviceBaseSlugs: ["acupuncture-therapy", "acupressure-therapy"],
    conditionSlugs: ["anxiety-stress", "insomnia"],
  },

  /* ── DERMAL NEEDLING / COSMETIC ──────────────────────────── */
  {
    blogSlug: "dermal-needling-for-scars-and-signs-of-aging",
    blogTitle: "Dermal Needling for Scars and Signs of Aging",
    serviceBaseSlugs: ["cosmetic-acupuncture", "facial-rejuvenation-acupuncture"],
    conditionSlugs: [],
  },
  {
    blogSlug: "what-is-dermal-needling",
    blogTitle: "What is Dermal Needling?",
    serviceBaseSlugs: ["cosmetic-acupuncture", "facial-rejuvenation-acupuncture", "dry-needling-therapy"],
    conditionSlugs: [],
  },

  /* ── CUPPING ─────────────────────────────────────────────── */
  {
    blogSlug: "cupping-how-does-it-work-what-is-it-good-for",
    blogTitle: "Cupping: How Does It Work? What Is It Good For?",
    serviceBaseSlugs: ["cupping-therapy", "acupuncture-therapy", "chinese-cupping"],
    conditionSlugs: ["back-pain", "fibromyalgia", "sports-injuries"],
  },

  /* ── OZONE / DETOX / IMMUNE ──────────────────────────────── */
  {
    blogSlug: "give-your-immune-system-a-200-boost-in-just-20-minutes",
    blogTitle: "Give Your Immune System a 200% Boost in Just 20 Minutes",
    serviceBaseSlugs: ["ozone-therapy", "ozone-sauna-therapy", "immune-system-support"],
    conditionSlugs: ["chronic-fatigue", "autoimmune-disease"],
  },
  {
    blogSlug: "ozone-therapy-demystified",
    blogTitle: "Ozone Therapy — Demystified",
    serviceBaseSlugs: ["ozone-therapy", "ozone-steam-sauna", "ozone-sauna-therapy", "medical-ozone-therapy"],
    conditionSlugs: ["chronic-fatigue", "autoimmune-disease", "chronic-illness"],
  },
  {
    blogSlug: "detoxification-for-health",
    blogTitle: "Detoxification for Health",
    serviceBaseSlugs: ["ozone-therapy", "detoxification-therapy", "heavy-metal-detox"],
    conditionSlugs: ["chronic-illness", "chronic-fatigue"],
  },
  {
    blogSlug: "is-detoxification-necessary",
    blogTitle: "Is Detoxification Necessary?",
    serviceBaseSlugs: ["detoxification-therapy", "ozone-therapy"],
    conditionSlugs: ["chronic-illness", "chronic-fatigue"],
  },
  {
    blogSlug: "why-detoxify",
    blogTitle: "Why Detoxify?",
    serviceBaseSlugs: ["detoxification-therapy", "ozone-therapy", "heavy-metal-detox"],
    conditionSlugs: ["chronic-illness", "chronic-fatigue"],
  },
  {
    blogSlug: "hidden-topical-toxins",
    blogTitle: "Hidden Topical Toxins",
    serviceBaseSlugs: ["functional-medicine-consultation", "detoxification-therapy"],
    conditionSlugs: ["chronic-illness", "food-sensitivities"],
  },
  {
    blogSlug: "arsenic-in-rice",
    blogTitle: "Arsenic in Rice",
    serviceBaseSlugs: ["functional-medicine-consultation", "detoxification-therapy"],
    conditionSlugs: ["food-sensitivities", "chronic-illness"],
  },

  /* ── STRESS / MENTAL HEALTH ──────────────────────────────── */
  {
    blogSlug: "threat-perception-and-physical-health-managing-the-feedback-loop",
    blogTitle: "Threat Perception and Physical Health: Managing the Feedback Loop",
    serviceBaseSlugs: ["acupuncture-therapy", "chinese-herbal-medicine", "acupuncture-for-stress-relief"],
    conditionSlugs: ["anxiety-stress", "depression"],
  },
  {
    blogSlug: "threat-perception-and-physical-health-how-to-manage-the-feedback-loop",
    blogTitle: "Threat Perception and Physical Health: How to Manage the Feedback Loop",
    serviceBaseSlugs: ["acupuncture-therapy", "chinese-herbal-medicine", "acupuncture-for-anxiety"],
    conditionSlugs: ["anxiety-stress", "depression"],
  },
  {
    blogSlug: "fish-in-a-bowl",
    blogTitle: "Fish in a Bowl",
    serviceBaseSlugs: ["acupuncture-for-anxiety", "natural-anxiety-treatment", "acupuncture-for-stress-relief"],
    conditionSlugs: ["anxiety-stress", "depression"],
  },
  {
    blogSlug: "gaba-for-relaxation",
    blogTitle: "GABA for Relaxation",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-supplements"],
    conditionSlugs: ["anxiety-stress", "insomnia"],
  },
  {
    blogSlug: "get-out-more",
    blogTitle: "Get Out More!",
    serviceBaseSlugs: ["functional-medicine-consultation"],
    conditionSlugs: ["anxiety-stress", "depression"],
  },
  {
    blogSlug: "health-habit-success",
    blogTitle: "Health Habit Success",
    serviceBaseSlugs: ["functional-medicine-consultation"],
    conditionSlugs: ["chronic-fatigue", "chronic-illness"],
  },

  /* ── HERBAL MEDICINE ─────────────────────────────────────── */
  {
    blogSlug: "chinese-herbs-viruses",
    blogTitle: "Chinese Herbs & Viruses",
    serviceBaseSlugs: ["chinese-herbal-medicine", "immune-system-support", "chinese-herbal-formulas"],
    conditionSlugs: ["autoimmune-disease", "chronic-illness"],
  },
  {
    blogSlug: "astragalus-immune-builder",
    blogTitle: "Astragalus, Immune Builder",
    serviceBaseSlugs: ["chinese-herbal-medicine", "immune-system-support"],
    conditionSlugs: ["autoimmune-disease", "chronic-fatigue"],
  },
  {
    blogSlug: "herbal-tale-of-caution",
    blogTitle: "Herbal Tale of Caution",
    serviceBaseSlugs: ["chinese-herbal-medicine", "herbal-consultation", "herb-drug-interaction-consultation"],
    conditionSlugs: [],
  },
  {
    blogSlug: "what-tea-is-right-for-me",
    blogTitle: "What Tea is Right for Me?",
    serviceBaseSlugs: ["chinese-herbal-medicine", "herbal-consultation"],
    conditionSlugs: [],
  },
  {
    blogSlug: "tea-time",
    blogTitle: "Tea Time",
    serviceBaseSlugs: ["chinese-herbal-medicine", "herbal-consultation"],
    conditionSlugs: [],
  },
  {
    blogSlug: "tea-for-brain-health",
    blogTitle: "Tea for Brain Health",
    serviceBaseSlugs: ["chinese-herbal-medicine", "functional-medicine-consultation"],
    conditionSlugs: ["brain-fog"],
  },
  {
    blogSlug: "how-to-treat-mold-illness-with-herbs-and-supplements",
    blogTitle: "How to Treat Mold Illness with Herbs and Supplements",
    serviceBaseSlugs: ["chinese-herbal-medicine", "functional-medicine-consultation", "herbal-supplements"],
    conditionSlugs: ["chronic-illness", "autoimmune-disease"],
  },
  {
    blogSlug: "monograph-black-seed-oil-nigella-sativa",
    blogTitle: "Monograph: Black Seed Oil (Nigella sativa)",
    serviceBaseSlugs: ["chinese-herbal-medicine", "herbal-supplements"],
    conditionSlugs: [],
  },
  {
    blogSlug: "caught-a-cold",
    blogTitle: "Caught a Cold?",
    serviceBaseSlugs: ["chinese-herbal-medicine", "immune-system-support"],
    conditionSlugs: [],
  },
  {
    blogSlug: "cold-and-flu-season",
    blogTitle: "Cold and Flu Season",
    serviceBaseSlugs: ["chinese-herbal-medicine", "immune-system-support"],
    conditionSlugs: [],
  },
  {
    blogSlug: "taking-chinese-herbs",
    blogTitle: "Taking Chinese Herbs",
    serviceBaseSlugs: ["chinese-herbal-medicine", "herbal-consultation", "custom-herbal-formulations"],
    conditionSlugs: [],
  },

  /* ── GUT HEALTH ──────────────────────────────────────────── */
  {
    blogSlug: "leaky-gut-made-simple",
    blogTitle: "Leaky Gut Made Simple",
    serviceBaseSlugs: ["functional-medicine-consultation", "leaky-gut-treatment", "gut-health-testing"],
    conditionSlugs: ["leaky-gut", "ibs-gut-issues", "food-sensitivities"],
  },
  {
    blogSlug: "covid-gut-bacteria",
    blogTitle: "Covid & Gut Bacteria",
    serviceBaseSlugs: ["functional-medicine-consultation", "gut-health-testing"],
    conditionSlugs: ["leaky-gut", "ibs-gut-issues", "autoimmune-disease"],
  },
  {
    blogSlug: "berberine-for-gut-health",
    blogTitle: "Berberine for Gut Health",
    serviceBaseSlugs: ["functional-medicine-consultation", "chinese-herbal-medicine", "gut-health-testing"],
    conditionSlugs: ["ibs-gut-issues", "leaky-gut", "weight-issues"],
  },
  {
    blogSlug: "our-microbiome-and-the-living-soil",
    blogTitle: "Our Microbiome and the Living Soil",
    serviceBaseSlugs: ["functional-medicine-consultation", "gut-health-testing"],
    conditionSlugs: ["leaky-gut", "ibs-gut-issues"],
  },
  {
    blogSlug: "weekly-digestive-health-tips",
    blogTitle: "Weekly Digestive Health Tips",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-health-treatment"],
    conditionSlugs: ["ibs-gut-issues", "leaky-gut"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-stress",
    blogTitle: "Weekly Digestive Health Tips (Stress)",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues", "anxiety-stress"],
  },
  {
    blogSlug: "weekly-digestive-health-blog-hydration",
    blogTitle: "Weekly Digestive Health Blog (Hydration)",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues", "chronic-fatigue"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-dietary-fiber",
    blogTitle: "Weekly Digestive Health Tips (Dietary Fiber)",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues", "leaky-gut"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-probiotics",
    blogTitle: "Weekly Digestive Health Tips (Probiotics)",
    serviceBaseSlugs: ["functional-medicine-consultation", "gut-health-testing"],
    conditionSlugs: ["ibs-gut-issues", "leaky-gut"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-2",
    blogTitle: "Weekly Digestive Health Tips",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-3",
    blogTitle: "Weekly Digestive Health Tips",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-4",
    blogTitle: "Weekly Digestive Health Tips",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues"],
  },
  {
    blogSlug: "weekly-digestive-health-tips-5",
    blogTitle: "Weekly Digestive Health Tips",
    serviceBaseSlugs: ["functional-medicine-consultation", "digestive-issues-treatment"],
    conditionSlugs: ["ibs-gut-issues"],
  },

  /* ── FUNCTIONAL MEDICINE / NUTRITION / SUPPLEMENTS ──────── */
  {
    blogSlug: "vitamin-ks-many-benefits",
    blogTitle: "Vitamin K's Many Benefits",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-counseling", "vitamin-therapy"],
    conditionSlugs: ["chronic-illness"],
  },
  {
    blogSlug: "obesity-and-cancer",
    blogTitle: "Obesity and Cancer",
    serviceBaseSlugs: ["functional-medicine-consultation", "weight-loss-support"],
    conditionSlugs: ["weight-issues", "chronic-illness"],
  },
  {
    blogSlug: "food-for-thought-meat",
    blogTitle: "Food for Thought: Meat",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-counseling"],
    conditionSlugs: ["chronic-illness"],
  },
  {
    blogSlug: "berberine-and-the-metabolic-master-switch",
    blogTitle: "Berberine and the Metabolic Master Switch",
    serviceBaseSlugs: ["functional-medicine-consultation", "chinese-herbal-medicine", "blood-sugar-support"],
    conditionSlugs: ["weight-issues", "ibs-gut-issues"],
  },
  {
    blogSlug: "b12-injections",
    blogTitle: "B12 Injections",
    serviceBaseSlugs: ["functional-medicine-consultation", "biopuncture-injections", "vitamin-therapy"],
    conditionSlugs: ["chronic-fatigue", "brain-fog", "neuropathy"],
  },
  {
    blogSlug: "collagen",
    blogTitle: "Collagen",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-supplements"],
    conditionSlugs: ["arthritis", "sports-injuries"],
  },
  {
    blogSlug: "paleo-caveman-diet",
    blogTitle: "Paleo Caveman Diet",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-counseling"],
    conditionSlugs: ["chronic-illness", "weight-issues"],
  },
  {
    blogSlug: "vitamin-d-for-health",
    blogTitle: "Vitamin D For Health",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-deficiency-testing", "vitamin-therapy"],
    conditionSlugs: ["chronic-fatigue", "autoimmune-disease"],
  },
  {
    blogSlug: "vitamin-d",
    blogTitle: "Vitamin D",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-deficiency-testing"],
    conditionSlugs: ["chronic-fatigue", "autoimmune-disease"],
  },
  {
    blogSlug: "covid-and-vitamin-d",
    blogTitle: "Covid and Vitamin D",
    serviceBaseSlugs: ["functional-medicine-consultation", "immune-system-support", "vitamin-therapy"],
    conditionSlugs: ["autoimmune-disease", "chronic-illness"],
  },
  {
    blogSlug: "red-wine-for-health",
    blogTitle: "Red Wine for Health?",
    serviceBaseSlugs: ["functional-medicine-consultation"],
    conditionSlugs: ["chronic-illness"],
  },
  {
    blogSlug: "sugar-blues-highs-and-lows",
    blogTitle: "Sugar Blues, Highs and Lows",
    serviceBaseSlugs: ["functional-medicine-consultation", "blood-sugar-support", "natural-diabetes-support"],
    conditionSlugs: ["weight-issues", "chronic-fatigue"],
  },
  {
    blogSlug: "magnesium-the-master-commander",
    blogTitle: "Magnesium, The Master Commander",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-supplements", "nutritional-deficiency-testing"],
    conditionSlugs: ["chronic-fatigue", "insomnia", "anxiety-stress"],
  },
  {
    blogSlug: "intermittent-fasting",
    blogTitle: "Intermittent Fasting",
    serviceBaseSlugs: ["functional-medicine-consultation", "weight-loss-support"],
    conditionSlugs: ["weight-issues", "chronic-fatigue"],
  },
  {
    blogSlug: "microbes-memory-aging",
    blogTitle: "Microbes, Memory, & Aging",
    serviceBaseSlugs: ["functional-medicine-consultation", "gut-health-testing"],
    conditionSlugs: ["brain-fog", "chronic-fatigue"],
  },
  {
    blogSlug: "what-is-in-your-fish-oil",
    blogTitle: "What Is In Your Fish Oil?",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-supplements", "supplement-recommendations"],
    conditionSlugs: ["chronic-illness"],
  },
  {
    blogSlug: "is-fish-oil-alone-enough",
    blogTitle: "Is Fish Oil Alone Enough?",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-supplements"],
    conditionSlugs: ["chronic-illness"],
  },
  {
    blogSlug: "how-is-your-vitamin-d-supplement-working-for-you",
    blogTitle: "How Is Your Vitamin D Supplement Working for You?",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-deficiency-testing"],
    conditionSlugs: ["chronic-fatigue", "autoimmune-disease"],
  },
  {
    blogSlug: "most-important-supplement-fact",
    blogTitle: "Most Important Supplement Fact",
    serviceBaseSlugs: ["functional-medicine-consultation", "supplement-recommendations"],
    conditionSlugs: [],
  },
  {
    blogSlug: "weekly-product-spotlight",
    blogTitle: "Weekly Product Spotlight",
    serviceBaseSlugs: ["functional-medicine-consultation", "supplement-recommendations"],
    conditionSlugs: [],
  },
  {
    blogSlug: "go-green",
    blogTitle: "Go Green!",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-counseling"],
    conditionSlugs: [],
  },
  {
    blogSlug: "got-rocks",
    blogTitle: "Got Rocks?",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-counseling"],
    conditionSlugs: ["chronic-fatigue"],
  },
  {
    blogSlug: "concerned-about-bone-loss",
    blogTitle: "Concerned About Bone Loss?",
    serviceBaseSlugs: ["functional-medicine-consultation", "nutritional-counseling", "hormonal-imbalance-treatment"],
    conditionSlugs: ["hormone-imbalance"],
  },
];

/* ── Reverse-lookup indices ─────────────────────────────────── */

const byBlogSlug = new Map<string, BlogEntry>(blogEntries.map(e => [e.blogSlug, e]));

const byServiceSlug = new Map<string, BlogEntry[]>();
const byConditionSlug = new Map<string, BlogEntry[]>();

for (const entry of blogEntries) {
  for (const svc of entry.serviceBaseSlugs) {
    if (!byServiceSlug.has(svc)) byServiceSlug.set(svc, []);
    byServiceSlug.get(svc)!.push(entry);
  }
  for (const cond of entry.conditionSlugs) {
    if (!byConditionSlug.has(cond)) byConditionSlug.set(cond, []);
    byConditionSlug.get(cond)!.push(entry);
  }
}

/* ── Public API ─────────────────────────────────────────────── */

export interface BlogRef {
  slug: string;
  title: string;
}

export interface SiteRef {
  slug: string;
  name: string;
  type: "service" | "condition";
}

/**
 * For a blog post page: returns up to `limit` service + condition links.
 */
export function getBlogRelatedServices(blogSlug: string, limit = 4): BlogRef[] {
  return [];
}

/**
 * For a blog post page: returns the matched entry (services + conditions).
 */
export function getBlogSiteLinks(blogSlug: string): { serviceBaseSlugs: string[]; conditionSlugs: string[] } {
  const entry = byBlogSlug.get(blogSlug);
  return entry
    ? { serviceBaseSlugs: entry.serviceBaseSlugs, conditionSlugs: entry.conditionSlugs }
    : { serviceBaseSlugs: [], conditionSlugs: [] };
}

/**
 * For a service page: returns up to `limit` blog posts that reference this service base slug.
 */
export function getServiceBlogLinks(serviceBaseSlug: string, limit = 4): BlogRef[] {
  const entries = byServiceSlug.get(serviceBaseSlug) ?? [];
  return entries.slice(0, limit).map(e => ({ slug: e.blogSlug, title: e.blogTitle }));
}

/**
 * For a condition page: returns up to `limit` blog posts that reference this condition slug.
 */
export function getConditionBlogLinks(conditionSlug: string, limit = 3): BlogRef[] {
  const entries = byConditionSlug.get(conditionSlug) ?? [];
  return entries.slice(0, limit).map(e => ({ slug: e.blogSlug, title: e.blogTitle }));
}
