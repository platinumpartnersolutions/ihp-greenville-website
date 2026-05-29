import { serviceContentMap } from "./services-content";
import { conditions, conditionCategories, conditionCategoryMap, type ConditionData } from "./conditions";

const BASE_URL = process.env.BASE_URL || "https://www.ihpgreenville.com";

function trim160(desc: string): string {
  if (desc.length <= 160) return desc;
  const cut = desc.substring(0, 157);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.substring(0, lastSpace) : cut) + '...';
}

const NAP = {
  name: "Integrative Health Partners",
  streetAddress: "319 Wade Hampton Blvd, Ste A",
  city: "Greenville",
  state: "SC",
  postalCode: "29609",
  phone: "(864) 365-6156",
  phoneRaw: "+1-864-365-6156",
  email: "info@ihpgreenville.com",
  url: `${BASE_URL}/`,
  latitude: "34.862258",
  longitude: "-82.382482"
};

// Reusable LocalBusiness schema — injected into every service and condition page
// so Google sees the full NAP + geo entity on the ranking page itself, not just the homepage.
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "LocalBusiness"],
  "@id": `${BASE_URL}/#business`,
  "name": NAP.name,
  "url": NAP.url,
  "telephone": NAP.phoneRaw,
  "email": NAP.email,
  "image": `${BASE_URL}/images/dr-hendry.webp`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": NAP.streetAddress,
    "addressLocality": NAP.city,
    "addressRegion": NAP.state,
    "postalCode": NAP.postalCode,
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": parseFloat(NAP.latitude),
    "longitude": parseFloat(NAP.longitude)
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "$$"
};

interface ServiceData {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  categorySlug: string;
  gbpCategory: string;
}

interface CategoryData {
  slug: string;
  name: string;
  gbpCategory: string;
  metaTitle: string;
  metaDescription: string;
  isPrimary: boolean;
  serviceNames: string[];
  carePhrase: string;
}

const createSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

/* ============================================================
   CORE SERVICE PARENT MAP
   Defines which services are "children" of a core money page.
   Used to build 4-level breadcrumbs: Home â†’ Category â†’ Core â†’ Child
   ============================================================ */
export const coreServiceParents: Record<string, { slug: string; name: string }> = {
  // Acupuncture Therapy â†’ variants & specialty applications
  "electroacupuncture":              { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "medical-acupuncture":             { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "auricular-acupuncture":           { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "ear-acupuncture":                 { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "scalp-acupuncture":               { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "cosmetic-acupuncture":            { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "facial-rejuvenation-acupuncture": { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "fertility-acupuncture":           { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "prenatal-acupuncture":            { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "pregnancy-acupuncture":           { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupuncture-for-anxiety":         { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupuncture-for-stress-relief":   { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupuncture-for-insomnia":        { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupuncture-for-migraines":       { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupuncture-for-headaches":       { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "non-needle-acupuncture":          { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "laser-acupuncture":               { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupressure-therapy":             { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "acupuncture-treatment":           { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "traditional-chinese-acupuncture": { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },
  "electrical-stimulation-acupuncture": { slug: "acupuncture-therapy", name: "Acupuncture Therapy" },

  // Dry Needling Therapy â†’ variants
  "trigger-point-dry-needling":      { slug: "dry-needling-therapy", name: "Dry Needling Therapy" },
  "intramuscular-stimulation":       { slug: "dry-needling-therapy", name: "Dry Needling Therapy" },
  "trigger-point-therapy":           { slug: "dry-needling-therapy", name: "Dry Needling Therapy" },

  // Biopuncture Therapy â†’ variants
  "biopuncture-injections":          { slug: "biopuncture-therapy", name: "Biopuncture Therapy" },
  "acupuncture-injection-therapy":   { slug: "biopuncture-therapy", name: "Biopuncture Therapy" },

  // Chinese Herbal Medicine â†’ variants
  "chinese-herbal-formulas":         { slug: "chinese-herbal-medicine", name: "Chinese Herbal Medicine" },
  "custom-herbal-formulations":      { slug: "chinese-herbal-medicine", name: "Chinese Herbal Medicine" },
  "herbal-consultation":             { slug: "chinese-herbal-medicine", name: "Chinese Herbal Medicine" },
  "herbal-supplements":              { slug: "chinese-herbal-medicine", name: "Chinese Herbal Medicine" },
  "natural-medicine-consultation":   { slug: "chinese-herbal-medicine", name: "Chinese Herbal Medicine" },
  "herb-drug-interaction-consultation": { slug: "chinese-herbal-medicine", name: "Chinese Herbal Medicine" },

  // Cupping Therapy â†’ variants
  "chinese-cupping":                 { slug: "cupping-therapy", name: "Cupping Therapy" },
  "fire-cupping":                    { slug: "cupping-therapy", name: "Cupping Therapy" },
  "gua-sha-treatment":               { slug: "cupping-therapy", name: "Cupping Therapy" },
  "gua-sha-therapy":                 { slug: "cupping-therapy", name: "Cupping Therapy" },
  "moxibustion-therapy":             { slug: "cupping-therapy", name: "Cupping Therapy" },
  "moxa-treatment":                  { slug: "cupping-therapy", name: "Cupping Therapy" },

  // Functional Medicine Consultation â†’ testing & related intake services
  "functional-medicine-testing":     { slug: "functional-medicine-consultation", name: "Functional Medicine Consultation" },
  "functional-blood-chemistry-analysis": { slug: "functional-medicine-consultation", name: "Functional Medicine Consultation" },
  "comprehensive-blood-panel":       { slug: "functional-medicine-consultation", name: "Functional Medicine Consultation" },
  "root-cause-analysis":             { slug: "functional-medicine-consultation", name: "Functional Medicine Consultation" },
  "integrative-medicine-consultation": { slug: "functional-medicine-consultation", name: "Functional Medicine Consultation" },
  "holistic-health-assessment":      { slug: "functional-medicine-consultation", name: "Functional Medicine Consultation" },

  // Ozone Therapy â†’ variants & delivery methods
  "ozone-steam-sauna":               { slug: "ozone-therapy", name: "Ozone Therapy" },
  "ozone-sauna-therapy":             { slug: "ozone-therapy", name: "Ozone Therapy" },
  "medical-ozone-therapy":           { slug: "ozone-therapy", name: "Ozone Therapy" },
  "ozone-detoxification":            { slug: "ozone-therapy", name: "Ozone Therapy" },
  "infrared-sauna-therapy":          { slug: "ozone-therapy", name: "Ozone Therapy" },
};

const categoryDefinitions: CategoryData[] = [
  {
    slug: "acupuncturist-services",
    name: "Acupuncturist",
    gbpCategory: "Acupuncturist",
    metaTitle: "Acupuncturist Services in Greenville, SC | IHP",
    metaDescription: "Skilled acupuncturist in Greenville, SC. Dr. Hendry — 25+ years in acupuncture therapy and needle-based treatments. New patients welcome. Call (864) 365-6156.",
    isPrimary: true,
    carePhrase: "acupuncture",
    serviceNames: [
      "Acupuncture Therapy","Acupuncture Treatment","Traditional Chinese Acupuncture","Medical Acupuncture",
      "Auricular Acupuncture","Ear Acupuncture","Electroacupuncture","Electrical Stimulation Acupuncture",
      "Scalp Acupuncture","Cosmetic Acupuncture","Facial Rejuvenation Acupuncture","Fertility Acupuncture",
      "Prenatal Acupuncture","Pregnancy Acupuncture","Acupuncture for Anxiety","Acupuncture for Stress Relief",
      "Acupuncture for Insomnia","Acupuncture for Migraines","Acupuncture for Headaches","Non-Needle Acupuncture",
      "Laser Acupuncture","Acupressure Therapy","Dry Needling Therapy","Trigger Point Dry Needling",
      "Intramuscular Stimulation","Biopuncture Therapy","Biopuncture Injections","Acupuncture Injection Therapy","Prolotherapy"
    ]
  },
  {
    slug: "acupuncture-clinic-services",
    name: "Acupuncture Clinic",
    gbpCategory: "Acupuncture clinic",
    metaTitle: "Acupuncture Clinic Services in Greenville, SC | IHP",
    metaDescription: "Expert pain treatment at our acupuncture clinic in Greenville, SC. Back pain, sciatica, neck pain, sports injuries, fibromyalgia. Call (864) 365-6156.",
    isPrimary: false,
    carePhrase: "acupuncture and pain relief",
    serviceNames: [
      "Back Pain Treatment","Lower Back Pain Treatment","Upper Back Pain Treatment","Chronic Back Pain Treatment",
      "Sciatica Treatment","Sciatic Nerve Pain Treatment","Neck Pain Treatment","Shoulder Pain Treatment",
      "Frozen Shoulder Treatment","Knee Pain Treatment","Hip Pain Treatment","Joint Pain Treatment",
      "Arthritis Pain Treatment","Fibromyalgia Treatment","Chronic Pain Management","Neuropathy Treatment",
      "Peripheral Neuropathy Treatment","Plantar Fasciitis Treatment","Carpal Tunnel Treatment","TMJ Treatment",
      "TMJ Pain Relief","Sports Injury Treatment","Muscle Pain Treatment","Trigger Point Therapy"
    ]
  },
  {
    slug: "chinese-medicine-clinic-services",
    name: "Chinese Medicine Clinic",
    gbpCategory: "Chinese medicine clinic",
    metaTitle: "Chinese Medicine Clinic Services in Greenville, SC | IHP",
    metaDescription: "Authentic Chinese medicine clinic in Greenville, SC. Cupping, herbal medicine, moxibustion, and traditional TCM treatments. Call (864) 365-6156.",
    isPrimary: false,
    carePhrase: "Chinese herbal medicine and TCM",
    serviceNames: [
      "Cupping Therapy","Chinese Cupping","Fire Cupping","Gua Sha Treatment","Gua Sha Therapy",
      "Moxibustion Therapy","Moxa Treatment","Chinese Herbal Medicine","Chinese Herbal Formulas",
      "Custom Herbal Formulations","Herbal Consultation","Herbal Supplements","Natural Medicine Consultation",
      "Herb-Drug Interaction Consultation","Menstrual Pain Treatment","PMS Treatment","Menopause Treatment",
      "Hot Flash Treatment","Fertility Treatment","Infertility Treatment","Digestive Issues Treatment",
      "IBS Treatment","Acid Reflux Treatment","Allergy Treatment","Sinus Treatment","Insomnia Treatment",
      "Sleep Disorder Treatment","Natural Anxiety Treatment","Natural Depression Treatment","Stress Management",
      "Fatigue Treatment","Chronic Fatigue Treatment","Immune System Support"
    ]
  },
  {
    slug: "functional-medicine-services",
    name: "Functional Medicine",
    gbpCategory: "Holistic medicine practitioner",
    metaTitle: "Functional Medicine in Greenville, SC | Integrative Health Partners",
    metaDescription: "Functional medicine in Greenville, SC — root-cause lab testing, personalized protocols, and injection therapy. Dr. William Hendry, DAOM, identifies what standard medicine misses. Call (864) 365-6156.",
    isPrimary: false,
    carePhrase: "functional medicine",
    serviceNames: [
      "Functional Medicine Consultation","Functional Medicine Testing","Functional Blood Chemistry Analysis",
      "Comprehensive Blood Panel","Hormone Testing","Hormonal Imbalance Treatment","Thyroid Testing",
      "Thyroid Disorder Treatment","Adrenal Fatigue Treatment","Adrenal Testing","Inflammatory Marker Testing",
      "Food Sensitivity Testing","Nutritional Deficiency Testing","Gut Health Testing","Leaky Gut Treatment",
      "Digestive Health Treatment","Autoimmune Disease Treatment","Root Cause Analysis",
      "Integrative Medicine Consultation","Holistic Health Assessment","Brain Fog Treatment",
      "Weight Loss Support","Metabolism Support","High Blood Pressure Support","Blood Sugar Support",
      "Natural Diabetes Support","Long COVID Treatment","Post-COVID Recovery","Ozone Therapy",
      "Ozone Steam Sauna","Ozone Sauna Therapy","Medical Ozone Therapy","Ozone Detoxification",
      "Infrared Sauna Therapy","Detoxification Therapy","Heavy Metal Detox","Vitamin Therapy",
      "Vitamin Supplementation","Mineral Supplementation","Supplement Recommendations","Whole Food Supplements",
      "Professional-Grade Vitamins","Nutritional Supplements","Nutritional Counseling","Nutrition Therapy",
      "Whole Food Nutrition Counseling","Body Contour"
    ]
  }
];

const allServices: ServiceData[] = [];
const serviceMap = new Map<string, ServiceData>();
const categoryMap = new Map<string, CategoryData>();

const svcDescTemplates: Record<string, (name: string) => string> = {
  "acupuncturist-services":
    (n) => `${n} at IHP Greenville. Dr. Hendry, DAOM — NCBAHM-certified, 25+ yrs experience, hospital-credentialed. Call (864) 365-6156.`,
  "acupuncture-clinic-services":
    (n) => `${n} in Greenville, SC. Root-cause acupuncture + functional medicine. Dr. Hendry, DAOM, NCBAHM-certified. Call (864) 365-6156.`,
  "chinese-medicine-clinic-services":
    (n) => `${n} at IHP Greenville — TCM, in-house herbal pharmacy, functional medicine. Dr. Hendry, DAOM. Call (864) 365-6156.`,
  "functional-medicine-services":
    (n) => `${n} at IHP Greenville. Dr. Hendry, DAOM — functional medicine, root-cause diagnostics, personalized care. Call (864) 365-6156.`,
};

for (const cat of categoryDefinitions) {
  categoryMap.set(cat.slug, cat);
  for (const name of cat.serviceNames) {
    const slug = createSlug(name);
    const descFn = svcDescTemplates[cat.slug];
    const service: ServiceData = {
      slug,
      name,
      metaTitle: `${name} in Greenville, SC | IHP`,
      metaDescription: descFn ? descFn(name) : `${name} in Greenville, SC — ${cat.carePhrase} from Dr. Hendry, DAOM. Integrative Health Partners. Call (864) 365-6156.`,
      category: cat.name,
      categorySlug: cat.slug,
      gbpCategory: cat.gbpCategory
    };
    allServices.push(service);
    serviceMap.set(slug, service);
  }
}

/* â"€â"€â"€ Per-service SEO overrides â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
 * Applied after the category loop to differentiate pages that would otherwise
 * target identical keyword intent (cannibalization fix).
 * â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
{
  const holistic = serviceMap.get("holistic-health-assessment");
  if (holistic) {
    // Conflict Group 3 fix: differentiate from functional-medicine-consultation.
    // Old description said "functional medicine, root-cause diagnostics" — identical
    // phrasing to the consultation page. New description leads with TCM/constitutional
    // framing so Google clearly distinguishes the two intake options.
    holistic.metaTitle = "Holistic Health Assessment | Chinese Medicine — IHP Greenville";
    holistic.metaDescription = "Whole-person health evaluation using Chinese medical diagnosis (tongue, pulse, pattern analysis) with Dr. Hendry, DAOM. Greenville, SC. Call (864) 365-6156.";
  }
}
{
  /* Money-page SEO: strip "Consultation" from title/H1 so the page targets
     the broad commercial query "functional medicine greenville sc" rather than
     the narrow informational sub-query "functional medicine consultation". */
  const funcMed = serviceMap.get("functional-medicine-consultation");
  if (funcMed) {
    funcMed.metaTitle = "Functional Medicine in Greenville, SC | Dr. Hendry, DAOM | IHP";
    funcMed.metaDescription = "Functional medicine in Greenville, SC at Integrative Health Partners — root-cause lab testing, personalized protocols, and injection therapy led by Dr. William Hendry, DAOM. Call (864) 365-6156.";
  }
}

interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  schemas: object[];
}

function getHomeSEO(): PageSEO {
  return {
    title: "Functional Medicine & Injection Therapy | IHP Greenville SC",
    description: "Functional medicine, injection therapy & acupuncture in Greenville, SC. Dr. William Hendry, DAOM — board-certified, Prisma Health privileges, 25+ years experience. Call (864) 365-6156.",
    canonical: BASE_URL,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": ["MedicalBusiness", "LocalBusiness"],
        "@id": "https://www.ihpgreenville.com/#business",
        "name": "Integrative Health Partners",
        "url": "https://www.ihpgreenville.com",
        "telephone": "(864) 365-6156",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "319 Wade Hampton Blvd, Ste A",
          "addressLocality": "Greenville",
          "addressRegion": "SC",
          "postalCode": "29609",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 34.86488989304498,
          "longitude": -82.38281488216316
        },
        "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00" }],
        "areaServed": [
          { "@type": "City", "name": "Greenville", "sameAs": "https://en.wikipedia.org/wiki/Greenville,_South_Carolina" },
          { "@type": "City", "name": "Spartanburg", "sameAs": "https://en.wikipedia.org/wiki/Spartanburg,_South_Carolina" },
          { "@type": "City", "name": "Anderson", "sameAs": "https://en.wikipedia.org/wiki/Anderson,_South_Carolina" },
          { "@type": "AdministrativeArea", "name": "Upstate South Carolina" }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5.0",
          "reviewCount": "19",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Danny Pyatt" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2026-03-01", "reviewBody": "I have been going to Dr. Hendry for 2 months now, for Acupuncture and Supplements. After 2 months, this is the best I have felt in over 2 years. My energy is so much better, my gut and digestion is back to normal. I am working out at the gym everyday again. My Focus is so much better as well. Also all my back and neck pain is gone. His care truly feels like getting my life back. I strongly recommend Dr. Hendry and Integrative Health Partners." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Cam Norden" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2025-07-01", "reviewBody": "Dr. Hendry spent a long time going over my particular medical situation and explaining his recommendations for getting my immune system back on track. I received acupuncture and supplements to start my treatment. I'm very excited about getting healthy again and have every confidence in Dr. Hendry's approach and treatment plan." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Karen Hill" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2025-04-01", "reviewBody": "Dr Hendry has been working with me to heal my GI tract. 100% improvement in how I feel, taking 1/4 of my blood pressure meds, and am no longer taking cholesterol meds. After reading a book about natural salt I saw in his office, I have been using natural salt — it has eliminated my chronic headaches." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Calla Fanton" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2025-04-01", "reviewBody": "Dr. Hendry is so informative and truly listens to all of your concerns. Definitely steps away from normal western medicine. So excited to see where this journey takes me!" },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Diane Thoma" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2024-04-01", "reviewBody": "Dr. Hendry really takes the time to listen to why I'm seeking his help. He explains and shows me what muscles and bones have been affected by my injury. I love his calm demeanor. He asks what seems to be working and what's not before each treatment!" },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Gabriela Riveron" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2024-04-01", "reviewBody": "Dr. Hendry is the best, he has been the only one who has been able to help me alleviate my back pain." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Meagan McClaran" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2022-04-01", "reviewBody": "Getting acupuncture is the highlight of my week! I've learned more from Dr. Hendry than ANY medical professional. He is extremely knowledgeable at what he does! I could not recommend him and Integrative Health Partners more!" },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Spencer Hughes" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2022-04-01", "reviewBody": "I have bad arthritis and bone spurs in my knees and was referred to them by one of my friends. I could hardly walk when I started seeing him and now I am back to running with no pain at all. He is very informative when explaining the treatment." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Corey Coll" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2022-04-01", "reviewBody": "I was struggling with adductor and hamstring issues for years, stopping me from running. I tried this place as a last ditch effort and am glad I did. After a consultation it was decided to try a wet needling therapy — it saved my running career." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Katlyn Garcia" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2022-04-01", "reviewBody": "I drive past his office every day, I'm so glad a trusted friend referred me! Dr. Hendry and I are working on hormone overall balance and possible estrogen dominance. I love the results." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "R. McClaran" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2023-04-01", "reviewBody": "It's pretty amazing how you can get instant relief from chronic pains from Acupuncture. Doctor Hendry's knowledge of the human body never ceases to amaze me." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Laura Getty" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2023-04-01", "reviewBody": "I am so glad to find the peri-neural therapy here to help heal nerve damage. My pain level decreased significantly after my first treatment." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Tat V" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2020-04-01", "reviewBody": "I have to say that finding this clinic was a true miracle. At the beginning of 2019 I got to the low point of my health and landed in the ER. Medical doctors told me I just had a GI issue and should just take some meds for it. Dr. Hendry changed everything for me." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Brooks Smith" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2020-04-01", "reviewBody": "I can't express how awesome Dr. Hendry is! He keeps me on the road running lots and lots of miles. He is a joy to visit every 3 weeks with his own personal touch. His office staff is also very pleasant to deal with. Recommend his services to anyone that has any type of physical issues! In reality, 5 stars are not enough." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Margie Halley" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2015-04-01", "reviewBody": "Having Cancer and the side effects of the Medicine has made it difficult with the Joint Pain. However by receiving the treatments it has made my outlook and pain tolerable with the help of Dr. Hendry. Highly recommend this practice." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Stuart M." }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2015-04-01", "reviewBody": "I was referred to Dr. Will Hendry after spending thousands of dollars for medical doctors and procedures regarding a digestive issue. I will never forget the amount of time he spent with me on my first visit — something that had never happened with conventional medicine." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Catherine Hosack" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2015-04-01", "reviewBody": "I can't say enough good things about Dr. Hendry. He really listens to your experience and what you need to share about your situation, is patient, and takes the time to explain clearly what acupuncture is about." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Michael F. McLeod" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2015-04-01", "reviewBody": "Excellent. I was a skeptic and informed Dr. Hendry of such. I have a broken neck from a racing accident over 40 plus years ago. The results have been remarkable and I am a believer in acupuncture." },
          { "@type": "Review", "itemReviewed": { "@id": "https://www.ihpgreenville.com/#business" }, "author": { "@type": "Person", "name": "Mike Lo" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "datePublished": "2015-04-01", "reviewBody": "Great experience, will definitely come back again." }
        ],
        "employee": {
          "@type": "Person",
          "name": "Dr. William Hendry",
          "givenName": "William",
          "familyName": "Hendry",
          "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
          "description": "DAOM with 25 years of experience in Chinese herbal medicine and 16 years serving Greenville SC. Hospital privileges at Prisma Health. Co-author of a 3-year clinical study on acupuncture as an opioid alternative. NCBAHM Diplomate of Oriental Medicine.",
          "hasCredential": [
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "Doctor of Acupuncture and Oriental Medicine (DAOM)" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "certification", "name": "NCBAHM Diplomate of Oriental Medicine" }
          ],
          "worksFor": { "@type": "Organization", "name": "Integrative Health Partners" }
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Functional Medicine & Integrative Health Services",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Functional Medicine Consultation", "description": "90-minute root-cause consultation with advanced lab testing — full thyroid panels, cortisol rhythm, gut microbiome, food sensitivity, and nutritional deficiency screening. Personalized protocols combining diet, supplements, herbal medicine, and acupuncture.", "url": `${BASE_URL}/services/functional-medicine-consultation/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Prolotherapy & Injection Therapy", "description": "Regenerative prolotherapy, biopuncture, and perineural injection therapy for damaged joints, ligaments, tendons, and nerves. Evidence-based alternative to surgery or long-term pain medication for musculoskeletal conditions.", "url": `${BASE_URL}/services/prolotherapy/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Acupuncture Therapy", "description": "Traditional Chinese acupuncture and medical acupuncture for chronic pain, headaches, digestive disorders, hormone imbalance, anxiety, insomnia, and fertility. Dr. Hendry holds a DAOM and is NCBAHM board-certified.", "url": `${BASE_URL}/services/acupuncture-therapy/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Chinese Herbal Medicine", "description": "Customized classical Chinese herbal formulas dispensed from our in-house pharmacy. Pharmaceutical-grade concentrated granules third-party tested for purity. Herb-drug interaction screening included with every prescription.", "url": `${BASE_URL}/services/chinese-herbal-medicine/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Biopuncture Therapy", "description": "Homeopathic micro-injections into acupuncture points and trigger points for acute and chronic pain, inflammation, and tissue repair. Combines injection therapy precision with acupuncture point targeting.", "url": `${BASE_URL}/services/biopuncture-therapy/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ozone Sauna Therapy", "description": "Medical-grade ozone delivered through infrared sauna to boost immune function, enhance cellular detoxification, and support recovery from chronic fatigue, fibromyalgia, and immune disorders.", "url": `${BASE_URL}/services/ozone-therapy/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Dry Needling Therapy", "description": "Trigger point dry needling for chronic muscle tension, movement dysfunction, and persistent pain. Targets muscle memory patterns causing ongoing pain without medications.", "url": `${BASE_URL}/services/dry-needling-therapy/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Electroacupuncture", "description": "Therapeutic electrical stimulation at acupuncture points to accelerate healing, block pain signals, and stimulate nerve regeneration for neuropathy and chronic pain conditions.", "url": `${BASE_URL}/services/electroacupuncture/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hormone Testing & Treatment", "description": "Comprehensive hormone panels — sex hormones, thyroid (TSH, free T3/T4, reverse T3, antibodies), cortisol rhythm, DHEA — with functional reference ranges to identify sub-optimal function before pathology develops.", "url": `${BASE_URL}/services/hormone-testing/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gut Health Testing", "description": "Gut microbiome analysis, intestinal permeability testing, and food sensitivity panels to identify the root causes of IBS, SIBO, leaky gut, bloating, and immune dysregulation.", "url": `${BASE_URL}/services/gut-health-testing/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cupping Therapy", "description": "Traditional and modern cupping for muscle tension, myofascial restriction, respiratory conditions, and detoxification. Often combined with acupuncture for enhanced therapeutic effect.", "url": `${BASE_URL}/services/cupping-therapy/` } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nutritional Counseling", "description": "Evidence-based nutritional protocols tailored to your lab results and health goals. Addresses inflammatory diet patterns, metabolic dysfunction, and nutrient deficiencies identified through functional testing.", "url": `${BASE_URL}/services/nutritional-counseling/` } }
          ]
        },
        "sameAs": [
          "https://www.google.com/maps/place/Integrative+Health+Partners/",
          "https://www.facebook.com/ihpgreenville",
          "https://www.instagram.com/integrativehealthpartners",
          "https://www.yelp.com/biz/integrative-health-partners-greenville",
          "https://www.ratemds.com/doctor-ratings/3158719/WILLIAM+M.-HENDRY-Greenville-SC.html/",
          "https://npiregistry.cms.hhs.gov/provider-view/1417184045",
          "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Dr. William Hendry",
        "honorificPrefix": "Dr.",
        "honorificSuffix": "DAOM, Dipl. O.M. (NCBAHM)Â®",
        "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
        "worksFor": { "@type": "Organization", "name": NAP.name },
        "memberOf": [
          { "@type": "Organization", "name": "Prisma Health" },
          { "@type": "Organization", "name": "American Academy of Ozone Therapy" }
        ],
        "hasCredential": [
          { "@type": "EducationalOccupationalCredential", "name": "Doctor of Acupuncture and Oriental Medicine (DAOM)", "recognizedBy": { "@type": "Organization", "name": "East West College of Natural Medicine" } },
          { "@type": "EducationalOccupationalCredential", "name": "Diplomate of Oriental Medicine", "identifier": "114498", "recognizedBy": { "@type": "Organization", "name": "NCBAHM" } }
        ],
        "identifier": [
          { "@type": "PropertyValue", "name": "NPI", "value": "1417184045" },
          { "@type": "PropertyValue", "name": "SC License", "value": "ACUP141" },
          { "@type": "PropertyValue", "name": "FL License", "value": "AP2646" }
        ],
        "sameAs": [
          "https://npiregistry.cms.hhs.gov/provider-view/1417184045",
          "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx",
          "https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==",
          "https://www.ratemds.com/doctor-ratings/3158719/WILLIAM+M.-HENDRY-Greenville-SC.html/",
          "https://www.researchgate.net/profile/William-Hendry-4"
        ],
        "knowsAbout": ["Acupuncture","Functional Medicine","Chinese Herbal Medicine","Chronic Pain Treatment","Ozone Therapy","Injection Therapy"]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What conditions does acupuncture treat?", "acceptedAnswer": { "@type": "Answer", "text": "Acupuncture has clinical evidence for chronic pain (back pain, sciatica, neck pain), headaches and migraines, anxiety and stress, insomnia, digestive disorders, fertility challenges, hormonal imbalance, and more. Dr. Hendry combines acupuncture with functional medicine to address root causes, not just symptoms." } },
          { "@type": "Question", "name": "How many sessions will I need?", "acceptedAnswer": { "@type": "Answer", "text": "Acute conditions typically resolve in 3—6 sessions. Chronic conditions often require 8—12 sessions with ongoing maintenance. Dr. Hendry creates a personalized treatment plan at your initial consultation." } },
          { "@type": "Question", "name": "What is functional medicine?", "acceptedAnswer": { "@type": "Answer", "text": "Functional medicine identifies the root biological causes of chronic illness — gut dysbiosis, hormonal imbalances, nutritional deficiencies, inflammatory triggers — and addresses them directly. Dr. Hendry uses advanced testing and integrative protocols to resolve conditions that conventional medicine manages but doesn't cure." } },
          { "@type": "Question", "name": "Does acupuncture hurt?", "acceptedAnswer": { "@type": "Answer", "text": "Most patients experience little to no discomfort. Acupuncture needles are hair-thin and most people feel a mild tingling or warmth. Many patients fall asleep during treatment." } },
          { "@type": "Question", "name": "Is Dr. Hendry accepting new patients?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we are currently accepting new patients. Call (864) 365-6156 or email info@ihpgreenville.com to schedule your initial consultation with Dr. William Hendry at our Greenville, SC office." } },
          { "@type": "Question", "name": "What makes Integrative Health Partners different?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry holds 9-year hospital privileges at Prisma Health, co-authored a landmark 3-year study on needle-based alternatives to opioids in the Prisma ER, holds a DAOM doctoral degree (highest in the field), and maintains 5 peer-reviewed publications with 54 citations. Our practice also offers an in-house herbal pharmacy and a full range of integrative therapies under one roof." } },
          { "@type": "Question", "name": "Do you offer ozone therapy and injection therapy in Greenville, SC?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry is certified in Injection Therapy and is a member of the American Academy of Ozone Therapy (AAOT). We offer medical ozone therapy, biopuncture, and nutrient injection therapies that most clinics cannot provide." } },
          { "@type": "Question", "name": "Do you accept insurance for acupuncture?", "acceptedAnswer": { "@type": "Answer", "text": "Integrative Health Partners is a cash-pay practice and does not bill insurance directly. This allows Dr. Hendry to spend more quality time with each patient and deliver genuinely personalized care — free from insurance restrictions. We provide itemized superbills you can submit to your insurance for potential out-of-network reimbursement. Call (864) 365-6156 to discuss your situation." } }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Integrative Health Partners",
        "url": BASE_URL,
        "description": "Acupuncture & functional medicine in Greenville, SC — Dr. William Hendry, DAOM",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/blog/?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

function getCategorySEO(slug: string): PageSEO | null {
  const cat = categoryMap.get(slug);
  if (!cat) return null;

  const pageUrl = `${BASE_URL}/services/${slug}/`;
  const firstThreeServices = cat.serviceNames.slice(0, 3).map(s => s.toLowerCase()).join(", ");

  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    canonical: pageUrl,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": NAP.name,
        "image": `${BASE_URL}/favicon.svg`,
        "description": `${cat.name} services in Greenville, SC.`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": NAP.streetAddress,
          "addressLocality": NAP.city,
          "addressRegion": NAP.state,
          "postalCode": NAP.postalCode,
          "addressCountry": "US"
        },
        "geo": { "@type": "GeoCoordinates", "latitude": NAP.latitude, "longitude": NAP.longitude },
        "telephone": NAP.phoneRaw,
        "email": NAP.email,
        "url": NAP.url
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": `${BASE_URL}/services/` },
          { "@type": "ListItem", "position": 3, "name": `${cat.name} Services`, "item": pageUrl }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What ${cat.name.toLowerCase()} services do you offer in Greenville, SC?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `At Integrative Health Partners, we offer comprehensive ${cat.name.toLowerCase()} services including ${firstThreeServices}, and more. Dr. William Hendry has over 25 years of experience providing these treatments in Greenville.`
            }
          },
          {
            "@type": "Question",
            "name": `How do I schedule an appointment for ${cat.name.toLowerCase()} services?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `You can schedule an appointment by calling us at (864) 365-6156 or emailing info@ihpgreenville.com. We're located at 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609.`
            }
          }
        ]
      }
    ]
  };
}

function getServiceSEO(slug: string): PageSEO | null {
  const service = serviceMap.get(slug);
  if (!service) return null;

  const cat = categoryMap.get(service.categorySlug);
  if (!cat) return null;

  const pageUrl = `${BASE_URL}/services/${slug}/`;

  const baseSlug = slug.replace(/-greenville-sc$/, "");
  const content = serviceContentMap.get(baseSlug);

  const faqItems = content
    ? content.faqs
    : [
        { q: `How does ${service.name} work?`, a: `${service.name} is an evidence-based treatment offered at Integrative Health Partners in Greenville, SC. Dr. Hendry conducts a thorough assessment to understand your individual health needs and creates a customized treatment protocol.` },
        { q: `How many ${service.name} sessions will I need?`, a: `The number of sessions depends on your specific condition. Acute conditions typically require 3—6 sessions, while chronic conditions may need 8—12 or more sessions.` },
        { q: `Where is ${service.name} available in Greenville, SC?`, a: `${service.name} is available at Integrative Health Partners, 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156.` },
      ];

  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      "name": `${service.name} in Greenville, SC`,
      "url": pageUrl,
      "description": service.metaDescription,
      "howPerformed": `${service.name} performed by Dr. William Hendry, DAOM at Integrative Health Partners in Greenville, SC`,
      "bodyLocation": "Varies by condition",
      "procedureType": "https://schema.org/NoninvasiveProcedure"
    },
    (() => {
      const coreParent = coreServiceParents[baseSlug];
      const breadcrumbItems: Record<string, unknown>[] = [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": `${cat.name} Services`, "item": `${BASE_URL}/services/${cat.slug}/` },
      ];
      if (coreParent) {
        breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": coreParent.name, "item": `${BASE_URL}/services/${coreParent.slug}/` });
        breadcrumbItems.push({ "@type": "ListItem", "position": 4, "name": service.name, "item": pageUrl });
      } else {
        breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": service.name, "item": pageUrl });
      }
      return { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": breadcrumbItems };
    })(),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    },
    localBusinessSchema
  ];

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    canonical: pageUrl,
    ogType: "website",
    schemas
  };
}

function getBlogSEO(): PageSEO {
  return {
    title: "Integrative Health Blog | Greenville SC | IHP",
    description: "Health & wellness insights from Dr. Hendry in Greenville, SC. Root-cause medicine, functional testing, acupuncture, Chinese herbs — evidence-based articles.",
    canonical: `${BASE_URL}/blog/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog/` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Integrative Health Partners Blog",
        "description": "Expert health and wellness insights on acupuncture, functional medicine, Chinese medicine, and holistic health from Dr. William Hendry in Greenville, SC.",
        "url": `${BASE_URL}/blog/`,
        "author": { "@type": "Person", "name": "Dr. William Hendry", "honorificSuffix": "DAOM", "url": `${BASE_URL}/dr-hendry/` },
        "publisher": {
          "@type": "Organization",
          "name": NAP.name,
          "url": NAP.url
        }
      }
    ]
  };
}

function getBlogPostSEO(title: string, excerpt: string, slug: string, datePublished?: string, dateModified?: string): PageSEO {
  const today = new Date().toISOString().split('T')[0];
  return {
    title: (() => {
      const suffix = " | IHP Greenville";
      const withBrand = `${title}${suffix}`;
      if (withBrand.length <= 60) return withBrand;
      if (title.length <= 60) return title;
      return title.substring(0, 57) + "...";
    })(),
    description: excerpt.substring(0, 160),
    canonical: `${BASE_URL}/blog/${slug}/`,
    ogType: "article",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog/` },
          { "@type": "ListItem", "position": 3, "name": title, "item": `${BASE_URL}/blog/${slug}/` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": ["BlogPosting", "Article"],
        "headline": title,
        "description": excerpt.substring(0, 160),
        "url": `${BASE_URL}/blog/${slug}/`,
        ...(datePublished ? { "datePublished": datePublished } : {}),
        "dateModified": dateModified || datePublished || today,
        "image": `${BASE_URL}/images/dr-hendry.webp`,
        "author": {
          "@type": "Person",
          "name": "Dr. William Hendry",
          "honorificSuffix": "DAOM",
          "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
          "url": `${BASE_URL}/dr-hendry/`,
          "sameAs": ["https://www.researchgate.net/profile/William-Hendry-4"]
        },
        "publisher": {
          "@type": "Organization",
          "name": NAP.name,
          "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/assets/ihp-publisher-logo.svg`, "width": 300, "height": 52 }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}/` },
        "isPartOf": { "@type": "Blog", "url": `${BASE_URL}/blog/` },
        "about": { "@type": "Organization", "name": NAP.name, "url": NAP.url }
      }
    ]
  };
}

function getConditionsHubSEO(): PageSEO {
  return {
    title: "Conditions We Treat in Greenville, SC | IHP",
    description: "Functional & integrative medicine for 30+ conditions in Greenville, SC — pain, hormonal, neurological, gut & immune. Acupuncture + root-cause testing. Call (864) 365-6156.",
    canonical: `${BASE_URL}/conditions/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Conditions We Treat", "item": `${BASE_URL}/conditions/` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Conditions Treated at Integrative Health Partners",
        "itemListElement": conditions.map((c, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": c.name,
          "item": `${BASE_URL}/conditions/${c.slug}/`
        }))
      }
    ]
  };
}

const conditionCategoryFAQs: Record<string, { q: string; a: string }[]> = {
  "pain-and-musculoskeletal": [
    { q: "Can acupuncture help with chronic pain that hasn't responded to other treatments?", a: "Yes. Many of our pain patients have already tried physical therapy, medications, and injections. Acupuncture works through mechanisms that these approaches don't reach — specifically, it modulates central pain sensitization, resolves deep myofascial restrictions, and addresses systemic inflammatory drivers. Dr. Hendry's multi-modal approach combining acupuncture with dry needling and functional medicine is particularly effective for complex, multi-year pain cases." },
    { q: "What is dry needling and how does it differ from acupuncture?", a: "Dry needling targets specific myofascial trigger points using solid filiform needles to release muscle knots and restore normal neuromuscular function. Traditional acupuncture uses the same needles at mapped acupoints along meridian pathways to regulate the nervous system, reduce inflammation, and address systemic patterns. Dr. Hendry is trained in both and integrates them based on each patient's presentation — often using both modalities in a single treatment session for pain conditions." },
    { q: "How long until I see results for my pain condition?", a: "Most patients notice measurable improvement within 3—5 sessions. Acute conditions often respond more quickly. Chronic conditions — especially those involving central sensitization, fibromyalgia, or longstanding structural damage — typically require 8—12 sessions for significant, lasting improvement. Dr. Hendry will give you a clear, honest timeline at your first visit based on your specific condition history." },
    { q: "Do you treat sports injuries at Integrative Health Partners?", a: "Yes. We treat a wide range of sports and overuse injuries including rotator cuff issues, IT band syndrome, patellar tendinopathy, shin splints, plantar fasciitis, and muscle strains. Acupuncture and dry needling accelerate healing by improving local circulation, reducing inflammation, and releasing the neuromuscular tension patterns that develop around injury sites." },
  ],
  "neurological-mental-health": [
    { q: "Can acupuncture help with anxiety and insomnia without medication?", a: "Acupuncture has strong evidence for both anxiety and insomnia as a standalone or adjunct treatment. It regulates the HPA axis, reduces cortisol, promotes melatonin secretion, and modulates GABA signaling — directly addressing the biological underpinnings of both conditions. Many patients see measurable improvement in sleep quality within 3—5 sessions." },
    { q: "Is this treatment safe alongside medications for depression or anxiety?", a: "Yes. Acupuncture has an excellent safety profile and does not interact with psychiatric medications. Dr. Hendry communicates with your prescribing provider as appropriate and always prioritizes continuity of care. Herbal medicine requires more careful management alongside pharmaceuticals — Dr. Hendry performs a thorough herb-drug interaction assessment before recommending any herbal formulas." },
    { q: "What does brain fog treatment look like at IHP?", a: "Brain fog typically involves multiple overlapping factors: sleep dysregulation, HPA axis dysfunction, nutritional deficiencies (particularly B12, D3, and omega-3s), gut microbiome imbalance, thyroid function, and neuroinflammation. Dr. Hendry uses functional medicine testing to identify your specific pattern and creates a targeted protocol addressing the root causes of your cognitive symptoms." },
    { q: "Do you treat PTSD at Integrative Health Partners?", a: "Yes. Acupuncture has emerging clinical evidence for PTSD, particularly in regulating hyperarousal, improving sleep quality, and reducing autonomic nervous system dysregulation. Dr. Hendry's approach complements — and does not replace — trauma-focused psychotherapy. We coordinate with your mental health team to support nervous system regulation as part of a comprehensive care plan." },
    { q: "Can functional medicine help with cognitive decline and Alzheimer's prevention?", a: "Yes — this is an area where functional medicine has the most to offer. Research has established that Alzheimer's disease has identifiable, modifiable biological drivers: insulin resistance in the brain, neuroinflammation, hormonal decline, nutritional deficiencies (especially homocysteine elevation from B12/folate deficiency), heavy metal burden, and sleep disruption that impairs glymphatic clearance of amyloid proteins. Dr. Hendry performs comprehensive evaluation of all these drivers and builds a targeted protocol to address them. The Bredesen Protocol framework — a multi-modal functional medicine approach to cognitive decline — informs this evaluation. Acupuncture also has documented effects on cerebral blood flow and neuroinflammatory markers." },
  ],
  "hormonal-womens-health": [
    { q: "Can acupuncture help with fertility?", a: "Yes. Acupuncture has documented effects on fertility — regulating the HPO axis, improving uterine blood flow, supporting ovarian function, and reducing stress hormones that suppress fertility. Dr. Hendry integrates acupuncture with Chinese herbal medicine and functional medicine testing to build a comprehensive fertility support protocol." },
    { q: "What hormonal testing does Dr. Hendry offer that my primary care doctor doesn't?", a: "Dr. Hendry offers comprehensive functional hormone panels: full thyroid panels (including free T3, reverse T3, and thyroid antibodies), Dutch hormone testing for sex hormone metabolites, 4-point cortisol rhythm testing, and comprehensive nutrient testing that identifies deficiencies affecting hormonal synthesis and metabolism." },
    { q: "How does acupuncture help with menopause symptoms?", a: "Multiple clinical trials have documented acupuncture's effectiveness for hot flashes, sleep disturbance, mood instability, and joint pain associated with menopause. Acupuncture regulates thermoregulatory centers in the hypothalamus and modulates the autonomic nervous system patterns that drive menopausal hot flashes and sleep disruption." },
    { q: "Do you treat PCOS at Integrative Health Partners?", a: "Yes. PCOS is one of our core areas of expertise. Dr. Hendry's approach addresses the underlying insulin resistance, androgens, and inflammatory drivers of PCOS through functional medicine testing and targeted interventions — combined with acupuncture to regulate the HPO axis and menstrual cycle." },
  ],
  "digestive-immune": [
    { q: "Can acupuncture help with IBS and digestive issues?", a: "Yes. Clinical evidence supports acupuncture for irritable bowel syndrome, reducing both visceral pain and bowel habit dysregulation. Acupuncture regulates the enteric nervous system, reduces intestinal inflammation, and modulates the gut-brain axis signaling that drives many IBS symptoms. It works well alongside dietary and microbiome interventions to provide multi-mechanism digestive support." },
    { q: "What does a functional medicine gut evaluation look like at IHP?", a: "Dr. Hendry uses advanced testing including comprehensive stool analysis (microbiome, pathogen screening, digestive enzyme function), intestinal permeability assessment, SIBO breath testing, comprehensive food sensitivity panels, and inflammatory markers. The results inform a targeted protocol matched to your gut's actual biology." },
    { q: "How does Dr. Hendry treat autoimmune disease?", a: "Autoimmune conditions require identifying and removing the environmental triggers that activate immune dysregulation — common triggers include gut permeability, specific food antigens, microbial imbalances, heavy metal burden, and chronic low-grade infections. Dr. Hendry's root-cause approach often significantly reduces symptoms and inflammatory markers." },
    { q: "Do you treat Hashimoto's thyroiditis at Integrative Health Partners?", a: "Yes. Dr. Hendry uses comprehensive thyroid panels plus full functional gut evaluation to identify the autoimmune triggers underlying each patient's Hashimoto's. Treatment typically involves gut healing, dietary modifications, targeted supplementation, and acupuncture for thyroid regulation and immune modulation." },
  ],
};

function getConditionCategorySEO(slug: string, name: string, desc: string): PageSEO {
  const pageUrl = `${BASE_URL}/conditions/${slug}/`;
  const catData = conditionCategoryMap.get(slug);
  const catConditions = catData
    ? catData.conditionSlugs.map(cs => conditions.find(c => c.slug === cs)).filter(Boolean)
    : [];
  const faqs = conditionCategoryFAQs[slug] || [];

  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": "Conditions We Treat", "item": `${BASE_URL}/conditions/` },
        { "@type": "ListItem", "position": 3, "name": name, "item": pageUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${name} Conditions Treated in Greenville, SC`,
      "itemListElement": (catConditions as ConditionData[]).map((c, i: number) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": c.name,
        "item": `${BASE_URL}/conditions/${c.slug}/`
      }))
    }
  ];

  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": { "@type": "Answer", "text": faq.a }
      }))
    });
  }

  return {
    title: `${name} in Greenville, SC | IHP`,
    description: trim160(desc),
    canonical: pageUrl,
    ogType: "website",
    schemas
  };
}

function getConditionPageSEO(slug: string, name: string, desc: string, catSlug: string, catName: string, faqs: { q: string; a: string }[], metaTitleOverride?: string): PageSEO {
  const pageUrl = `${BASE_URL}/conditions/${slug}/`;
  const autoTitle = `${name}: Causes & Care | IHP Greenville`;
  const title = (metaTitleOverride && metaTitleOverride.length <= 65) ? metaTitleOverride : autoTitle;
  return {
    title,
    description: trim160(desc),
    canonical: pageUrl,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalCondition",
        "name": name,
        "url": pageUrl,
        "description": desc,
        "possibleTreatment": {
          "@type": "MedicalTherapy",
          "name": "Acupuncture and Functional Medicine",
          "description": `Dr. William Hendry uses acupuncture and functional medicine to address ${name} at Integrative Health Partners in Greenville, SC.`
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Conditions We Treat", "item": `${BASE_URL}/conditions/` },
          { "@type": "ListItem", "position": 3, "name": catName, "item": `${BASE_URL}/conditions/${catSlug}/` },
          { "@type": "ListItem", "position": 4, "name": name, "item": pageUrl }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a }
        }))
      },
      localBusinessSchema
    ]
  };
}

function getFunctionalMedicineSEO(): PageSEO {
  return {
    title: "Functional Medicine in Greenville, SC | IHP",
    description: "Functional & integrative medicine in Greenville, SC. Root-cause testing, acupuncture, herbal medicine. Dr. William Hendry, DAOM. Call (864) 365-6156.",
    canonical: `${BASE_URL}/functional-medicine-greenville-sc/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": NAP.name,
        "description": "Functional and integrative medicine practice offering root-cause diagnostics, acupuncture, and herbal medicine in Greenville, SC.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": NAP.streetAddress,
          "addressLocality": NAP.city,
          "addressRegion": NAP.state,
          "postalCode": NAP.postalCode,
          "addressCountry": "US"
        },
        "telephone": NAP.phoneRaw,
        "url": NAP.url
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Functional Medicine in Greenville, SC", "item": `${BASE_URL}/functional-medicine-greenville-sc/` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What's the difference between functional medicine and naturopathic medicine?", "acceptedAnswer": { "@type": "Answer", "text": "Both look for root causes rather than masking symptoms, but they differ in training and tools. Dr. Hendry's training is in Oriental medicine (DAOM) combined with functional medicine principles and advanced diagnostics, drawing on traditional Chinese medicine's 2,000-year history of pattern-based diagnosis alongside modern laboratory testing." } },
          { "@type": "Question", "name": "Do I need a referral to see a functional medicine practitioner in Greenville?", "acceptedAnswer": { "@type": "Answer", "text": "No referral is needed. You can call (864) 365-6156 or email info@ihpgreenville.com to schedule directly." } },
          { "@type": "Question", "name": "Does insurance cover functional medicine?", "acceptedAnswer": { "@type": "Answer", "text": "Integrative Health Partners is a cash-pay practice. We provide itemized superbills for potential out-of-network reimbursement. Standard lab work is often covered by insurance; the consultation fee typically is not." } },
          { "@type": "Question", "name": "How long before I see results from functional medicine?", "acceptedAnswer": { "@type": "Answer", "text": "Most patients notice meaningful improvement within 6—10 weeks of following a complete protocol. Longstanding chronic conditions typically require 3—6 months to shift substantially." } },
          { "@type": "Question", "name": "What lab tests does functional medicine use that my GP doesn't order?", "acceptedAnswer": { "@type": "Answer", "text": "Full thyroid panels (TSH, free T3, free T4, reverse T3, TPO and TG antibodies), fasting insulin and HOMA-IR, 4-point cortisol rhythm, complete sex hormone panels, advanced inflammatory markers, gut microbiome analysis, intestinal permeability testing, food sensitivity panels, and nutritional deficiency screening." } },
          { "@type": "Question", "name": "Is Dr. Hendry a medical doctor?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) — not an MD degree. He is NCBAHM board-certified (#114498) and practiced with hospital privileges at Prisma Health for nine years, participating in clinical research on needle-based alternatives to opioids." } },
          { "@type": "Question", "name": "What is the downside of functional medicine?", "acceptedAnswer": { "@type": "Answer", "text": "Functional medicine is almost always cash-pay — insurance does not cover the consultation, and specialty functional lab panels are often not reimbursable. The time commitment is real: initial consultations run 60—90 minutes, follow-ups are regular, and meaningful improvement typically requires 3—6 months of consistent effort. This approach also demands active participation — dietary changes, sleep optimization, and lifestyle modifications are core to the protocol, not optional extras. Functional medicine is not appropriate for acute emergencies or conditions requiring immediate medical or surgical intervention." } },
          { "@type": "Question", "name": "What is the average cost of a functional medicine doctor?", "acceptedAnswer": { "@type": "Answer", "text": "Integrative Health Partners is a cash-pay practice. Initial new patient consultations are longer and more comprehensive than a standard office visit; follow-up appointments are shorter and priced accordingly. Lab costs vary depending on which panels are ordered. We provide itemized superbills so you can submit for out-of-network reimbursement if you carry PPO coverage. Call (864) 365-6156 for current pricing." } },
          { "@type": "Question", "name": "Do functional medicine doctors treat diabetes?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — type 2 diabetes and insulin resistance are well-suited to the functional medicine approach, which targets underlying drivers: chronic inflammation, gut microbiome disruption, sleep dysregulation, and nutrient insufficiencies. We measure fasting insulin and HOMA-IR to detect insulin resistance before blood sugar becomes diagnostic. Protocols include dietary intervention, targeted supplementation, and lifestyle modification — often alongside conventional medications rather than in place of them. Type 1 diabetes has a different autoimmune origin, but functional medicine can still address immune and gut permeability factors associated with autoimmune progression." } }
        ]
      }
    ]
  };
}

function getAboutSEO(): PageSEO {
  return {
    title: "About IHP | Functional Medicine & Acupuncture Greenville SC",
    description: "Integrative Health Partners — Greenville SC's root-cause health practice. Functional medicine, acupuncture, in-house herbal pharmacy. Call (864) 365-6156.",
    canonical: `${BASE_URL}/about/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": NAP.name,
        "description": "Integrative functional medicine practice offering acupuncture, functional medicine, and natural treatments in Greenville, SC.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": NAP.streetAddress,
          "addressLocality": NAP.city,
          "addressRegion": NAP.state,
          "postalCode": NAP.postalCode,
          "addressCountry": "US"
        },
        "telephone": NAP.phoneRaw,
        "url": NAP.url
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "About", "item": `${BASE_URL}/about/` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What types of patients does Integrative Health Partners see?", "acceptedAnswer": { "@type": "Answer", "text": "We see patients of all ages with both acute and chronic conditions. Many of our patients have complex health issues that haven't resolved with conventional care alone — including chronic pain, autoimmune conditions, hormonal imbalances, digestive disorders, and neurological conditions. We also see patients seeking preventive care and health optimization." } },
          { "@type": "Question", "name": "Do I need a referral from my doctor to be seen?", "acceptedAnswer": { "@type": "Answer", "text": "No referral is needed. You can book directly by calling (864) 365-6156. If you have been referred by a physician, we welcome that collaboration and will communicate with your referring provider as appropriate." } },
          { "@type": "Question", "name": "What should I bring to my first appointment?", "acceptedAnswer": { "@type": "Answer", "text": "Bring a list of current medications and supplements, any recent lab work or imaging results, and a brief summary of your health history and current concerns. Wearing loose, comfortable clothing is recommended if acupuncture will be part of your initial visit." } },
          { "@type": "Question", "name": "How long is an initial consultation?", "acceptedAnswer": { "@type": "Answer", "text": "Your first visit typically lasts 60—90 minutes. This allows Dr. Hendry to conduct a thorough health history, perform diagnostic assessments (including tongue and pulse diagnosis), and begin developing your individualized treatment plan." } },
          { "@type": "Question", "name": "Do you accept insurance?", "acceptedAnswer": { "@type": "Answer", "text": "Integrative Health Partners is a cash-pay practice and does not bill insurance directly. This model allows Dr. Hendry to provide truly individualized, unhurried care without the constraints of insurance reimbursement schedules. We provide itemized superbills for potential out-of-network reimbursement submission. Call (864) 365-6156 to learn more." } },
          { "@type": "Question", "name": "What makes IHP different from other acupuncture clinics?", "acceptedAnswer": { "@type": "Answer", "text": "Three key differentiators: Dr. Hendry's 9-year hospital privileges at Prisma Health (rare for an acupuncturist), our full in-house herbal pharmacy for same-day dispensing, and Dr. Hendry's published research background (5 publications, 54 citations) ensuring every treatment decision is evidence-informed." } }
        ]
      }
    ]
  };
}

function getDrHendrySEO(): PageSEO {
  return {
    title: "Dr. William Hendry, DAOM | Integrative Medicine Greenville SC",
    description: "Dr. William Hendry, DAOM — NCBAHM #114498, 25+ yrs clinical exp. Co-author: Prisma Health opioid alternative ER study. Greenville, SC integrative medicine.",
    canonical: `${BASE_URL}/dr-hendry/`,
    ogType: "profile",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Dr. William Hendry",
        "honorificPrefix": "Dr.",
        "honorificSuffix": "DAOM, Dipl. O.M. (NCBAHM)Â®",
        "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
        "description": "Dr. William Hendry is a board-certified acupuncturist and functional medicine practitioner in Greenville, SC with 25+ years of clinical experience, hospital privileges at Prisma Health, and 5 peer-reviewed research publications.",
        "worksFor": {
          "@type": "MedicalBusiness",
          "name": NAP.name,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": NAP.streetAddress,
            "addressLocality": NAP.city,
            "addressRegion": NAP.state,
            "postalCode": NAP.postalCode,
            "addressCountry": "US"
          },
          "telephone": NAP.phoneRaw,
          "url": NAP.url
        },
        "hasCredential": [
          {
            "@type": "EducationalOccupationalCredential",
            "name": "Doctor of Acupuncture and Oriental Medicine (DAOM)",
            "credentialCategory": "degree",
            "recognizedBy": { "@type": "Organization", "name": "East West College of Natural Medicine" }
          },
          {
            "@type": "EducationalOccupationalCredential",
            "name": "Diplomate of Oriental Medicine (Dipl. O.M.)",
            "credentialCategory": "certification",
            "recognizedBy": { "@type": "Organization", "name": "NCBAHM", "url": "https://www.nccaom.org" },
            "identifier": "114498"
          }
        ],
        "identifier": [
          { "@type": "PropertyValue", "name": "NPI", "value": "1417184045" },
          { "@type": "PropertyValue", "name": "SC License", "value": "ACUP141" },
          { "@type": "PropertyValue", "name": "FL License", "value": "AP2646" },
          { "@type": "PropertyValue", "name": "NCBAHM", "value": "114498" }
        ],
        "memberOf": [
          { "@type": "Organization", "name": "Prisma Health" },
          { "@type": "Organization", "name": "American Academy of Ozone Therapy (AAOT)" }
        ],
        "sameAs": [
          "https://npiregistry.cms.hhs.gov/provider-view/1417184045",
          "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx",
          "https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==",
          "https://www.ratemds.com/doctor-ratings/3158719/WILLIAM+M.-HENDRY-Greenville-SC.html/",
          "https://www.researchgate.net/profile/William-Hendry-4"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Dr. William Hendry", "item": `${BASE_URL}/dr-hendry/` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What is Dr. Hendry's highest academic credential?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine, which is the highest academic degree available in the acupuncture and oriental medicine field. He graduated in December 2008." } },
          { "@type": "Question", "name": "Is Dr. Hendry board certified?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry holds NCBAHM (National Certification Board for Acupuncture and Herbal Medicine) board certification as a Diplomate of Oriental Medicine — certificate #114498. His certification is valid through August 31, 2029." } },
          { "@type": "Question", "name": "Has Dr. Hendry published research?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry has authored or co-authored 5 peer-reviewed research publications with a combined 54 citations. His research includes the Prisma Health opioid alternative study, HRV biofeedback for cancer survivors, and neurogenesis in integrative care." } },
          { "@type": "Question", "name": "What is Dr. Hendry's hospital experience?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry held hospital privileges at Prisma Health for 9 years — an exceptional distinction for an acupuncturist. During that time, he co-investigated a 3-year study using needling techniques as alternatives to opioid pain management in the Emergency Department." } },
          { "@type": "Question", "name": "Does Dr. Hendry offer injection therapies?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry is a certified Injection Therapy practitioner, enabling him to offer biopuncture and nutrient injection therapies. These treatments involve micro-injections of natural substances at specific points to support healing — a service unavailable at most acupuncture clinics." } },
          { "@type": "Question", "name": "How can I verify Dr. Hendry's credentials?", "acceptedAnswer": { "@type": "Answer", "text": "You can verify his NCBAHM certification via the official NCBAHM digital badge, his NPI number (1417184045) through the NPI database, and his South Carolina license (ACUP141) through the SC Department of Labor, Licensing and Regulation website." } }
        ]
      }
    ]
  };
}

function getContactSEO(): PageSEO {
  return {
    title: "Contact IHP | Book an Appointment in Greenville, SC",
    description: "Schedule an appointment with Integrative Health Partners. 319 Wade Hampton Blvd, Ste A, Greenville, SC 29609. Call (864) 365-6156. Mon—Fri 9am—5pm.",
    canonical: `${BASE_URL}/contact/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": ["MedicalBusiness", "LocalBusiness"],
        "name": NAP.name,
        "url": NAP.url,
        "telephone": NAP.phone,
        "email": NAP.email,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": NAP.streetAddress,
          "addressLocality": NAP.city,
          "addressRegion": NAP.state,
          "postalCode": NAP.postalCode,
          "addressCountry": "US"
        },
        "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00" }],
        "geo": { "@type": "GeoCoordinates", "latitude": NAP.latitude, "longitude": NAP.longitude }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${BASE_URL}/contact/` }
        ]
      }
    ]
  };
}

function getPrivacySEO(): PageSEO {
  return {
    title: "Privacy Policy | Integrative Health Partners Greenville, SC",
    description: "Privacy Policy for Integrative Health Partners — how we collect, use, and protect your personal information. Greenville, SC acupuncture practice.",
    canonical: `${BASE_URL}/privacy/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${BASE_URL}/privacy/` }
        ]
      }
    ]
  };
}

function getDisclaimerSEO(): PageSEO {
  return {
    title: "Medical Disclaimer | Integrative Health Partners Greenville, SC",
    description: "Medical disclaimer for Integrative Health Partners. This website is for informational purposes only and does not constitute medical advice or diagnosis.",
    canonical: `${BASE_URL}/disclaimer/`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Medical Disclaimer", "item": `${BASE_URL}/disclaimer/` }
        ]
      }
    ]
  };
}

export function getSEOForUrl(url: string): PageSEO | null {
  const path = url.split('?')[0].replace(/\/$/, '') || '/';

  if (path === '/' || path === '') {
    return getHomeSEO();
  }

  if (path === '/blog') {
    return getBlogSEO();
  }

  if (path === '/functional-medicine-greenville-sc') {
    return getFunctionalMedicineSEO();
  }

  if (path === '/about') {
    return getAboutSEO();
  }

  if (path === '/dr-hendry') {
    return getDrHendrySEO();
  }

  if (path === '/contact') {
    return getContactSEO();
  }

  if (path === '/privacy') {
    return getPrivacySEO();
  }

  if (path === '/disclaimer') {
    return getDisclaimerSEO();
  }

  if (path === '/sitemap.html' || path === '/sitemap') {
    return {
      title: "Site Map | Integrative Health Partners Greenville, SC",
      description: "HTML site map for Integrative Health Partners — all services, conditions, and pages for our acupuncture and functional medicine practice in Greenville, SC.",
      canonical: `${BASE_URL}/sitemap.html`,
      ogType: "website",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Site Map", "item": `${BASE_URL}/sitemap.html` }
          ]
        }
      ]
    };
  }

  if (path === '/services') {
    return {
      title: "Services | Functional Medicine & Acupuncture | IHP Greenville",
      description: "Functional medicine, acupuncture, Chinese herbs, and integrative therapies in Greenville, SC. Root-cause diagnostics and needle treatments. Call (864) 365-6156.",
      canonical: `${BASE_URL}/services/`,
      ogType: "website",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": `${BASE_URL}/services/` }
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Acupuncture & Functional Medicine Services — Integrative Health Partners",
          "description": "Complete list of acupuncture, Chinese medicine, and functional medicine services offered by Dr. William Hendry in Greenville, SC.",
          "url": `${BASE_URL}/services/`,
          "numberOfItems": allServices.length,
          "itemListElement": allServices.map((s, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": s.name,
            "item": `${BASE_URL}/services/${s.slug}/`
          }))
        }
      ]
    };
  }

  const serviceMatch = path.match(/^\/services\/(.+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    const catSeo = getCategorySEO(slug);
    if (catSeo) return catSeo;
    const svcSeo = getServiceSEO(slug);
    if (svcSeo) return svcSeo;
  }

  if (path === '/conditions') {
    return getConditionsHubSEO();
  }

  const condMatch = path.match(/^\/conditions\/(.+)$/);
  if (condMatch) {
    const slug = condMatch[1];
    const catData = conditionCategoryMap.get(slug);
    if (catData) {
      return getConditionCategorySEO(slug, catData.shortName, catData.metaDescription);
    }
    const condData = conditions.find(c => c.slug === slug);
    if (condData) {
      const parentCat = conditionCategories.find(cc => cc.conditionSlugs.includes(slug));
      return getConditionPageSEO(slug, condData.name, condData.metaDescription, parentCat?.slug || "", parentCat?.name || "", condData.content.faqs, condData.metaTitle);
    }
  }

  return null;
}

export { getConditionCategorySEO, getConditionPageSEO, getBlogPostSEO };

export function injectSEOIntoHTML(html: string, seo: PageSEO): string {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.title)}</title>`);

  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeAttr(seo.description)}" />`
  );

  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${escapeAttr(seo.canonical)}" />`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeAttr(seo.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeAttr(seo.description)}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${escapeAttr(seo.ogType)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${escapeAttr(seo.canonical)}" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeAttr(seo.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeAttr(seo.description)}" />`
  );

  if (seo.schemas.length > 0) {
    const existingSchemaRegex = /<script type="application\/ld\+json">[\s\S]*?<\/script>/g;
    html = html.replace(existingSchemaRegex, '');

    const schemaScripts = seo.schemas
      .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join('\n    ');

    html = html.replace('</head>', `    ${schemaScripts}\n  </head>`);
  }

  return html;
}

/* ============================================================
   SITEMAP — only index core money pages.
   The 121 standard service pages 301 to these targets; listing
   them in the sitemap would re-signal their existence to Google
   and undermine the consolidation.
   ============================================================ */
const SITEMAP_MONEY_SLUGS = [
  "acupuncture-therapy",
  "dry-needling-therapy",
  "electroacupuncture",
  "prolotherapy",
  "functional-medicine-consultation",
  "chinese-herbal-medicine",
  "ozone-therapy",
  "biopuncture-therapy",
  "cupping-therapy",
];

export function generateSitemapXML(conditionSlugs: string[] = [], conditionCatSlugs: string[] = []): string {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/services/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

  for (const cat of categoryDefinitions) {
    xml += `
  <url>
    <loc>${BASE_URL}/services/${cat.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  for (const slug of SITEMAP_MONEY_SLUGS) {
    xml += `
  <url>
    <loc>${BASE_URL}/services/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  /* Condition hub pages — consolidated replacements for individual condition pages */
  const CONDITION_HUB_SLUGS = [
    "back-and-spine-pain",
    "joint-and-muscle-pain",
    "hormonal-and-thyroid-health",
    "gut-and-digestive-health",
    "fatigue-brain-nervous-system",
    "fertility-and-womens-health",
    "autoimmune-and-chronic-illness",
  ];
  /* Individual condition pages consolidated into hubs (301'd — exclude from sitemap) */
  const CONSOLIDATED_CONDITIONS = new Set([
    "back-pain", "sciatica",
    "neck-pain", "knee-pain", "hip-pain", "shoulder-pain", "headaches-migraines", "arthritis", "sports-injuries",
    "hashimotos", "thyroid-issues", "adrenal-fatigue", "pcos", "menopause", "perimenopause", "hormone-imbalance",
    "ibs-gut-issues", "leaky-gut", "food-sensitivities",
    "chronic-fatigue", "brain-fog", "anxiety-stress", "depression", "insomnia", "ptsd", "neuropathy", "cognitive-decline",
    "fertility",
    "autoimmune-disease", "fibromyalgia", "chronic-illness", "weight-issues", "lyme-disease",
  ]);

  xml += `
  <url>
    <loc>${BASE_URL}/conditions/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

  for (const slug of CONDITION_HUB_SLUGS) {
    xml += `
  <url>
    <loc>${BASE_URL}/conditions/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>`;
  }

  for (const slug of conditionCatSlugs) {
    xml += `
  <url>
    <loc>${BASE_URL}/conditions/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  for (const slug of conditionSlugs) {
    if (CONSOLIDATED_CONDITIONS.has(slug)) continue; // now a 301 — exclude from sitemap
    xml += `
  <url>
    <loc>${BASE_URL}/conditions/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  xml += `
  <url>
    <loc>${BASE_URL}/about/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  xml += `
  <url>
    <loc>${BASE_URL}/dr-hendry/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  xml += `
  <url>
    <loc>${BASE_URL}/contact/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  xml += `
  <url>
    <loc>${BASE_URL}/blog/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

  xml += `
  <url>
    <loc>${BASE_URL}/privacy/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

  xml += `
  <url>
    <loc>${BASE_URL}/disclaimer/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

  xml += `
</urlset>`;

  return xml;
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml

# â"€â"€ AI / LLM crawlers — explicitly allowed for AI Overviews & LLM indexing â"€â"€
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-Web-Crawl
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: cohere-ai
Allow: /
`;
}

export { allServices, categoryDefinitions, serviceMap, categoryMap, NAP, BASE_URL };

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
