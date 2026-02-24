const BASE_URL = "https://www.ihpgreenville.com";

const NAP = {
  name: "Integrative Health Partners",
  streetAddress: "319 Wade Hampton Blvd, Suite A",
  city: "Greenville",
  state: "SC",
  postalCode: "29609",
  phone: "(864) 365-6156",
  phoneRaw: "+1-864-365-6156",
  email: "info@ihpgreenville.com",
  url: BASE_URL,
  latitude: "34.862258",
  longitude: "-82.382482"
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
}

const createSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const categoryDefinitions: CategoryData[] = [
  {
    slug: "acupuncturist-greenville-sc",
    name: "Acupuncturist",
    gbpCategory: "Acupuncturist",
    metaTitle: "Acupuncturist in Greenville, SC | Integrative Health Partners",
    metaDescription: "Looking for a skilled acupuncturist in Greenville, SC? Dr. William Hendry offers 25+ years of experience in acupuncture therapy and needle-based treatments. Call (864) 365-6156.",
    isPrimary: true,
    serviceNames: [
      "Acupuncture Therapy","Acupuncture Treatment","Traditional Chinese Acupuncture","Medical Acupuncture",
      "Auricular Acupuncture","Ear Acupuncture","Electroacupuncture","Electrical Stimulation Acupuncture",
      "Scalp Acupuncture","Cosmetic Acupuncture","Facial Rejuvenation Acupuncture","Fertility Acupuncture",
      "Prenatal Acupuncture","Pregnancy Acupuncture","Acupuncture for Anxiety","Acupuncture for Stress Relief",
      "Acupuncture for Insomnia","Acupuncture for Migraines","Acupuncture for Headaches","Non-Needle Acupuncture",
      "Laser Acupuncture","Acupressure Therapy","Dry Needling Therapy","Trigger Point Dry Needling",
      "Intramuscular Stimulation","Biopuncture Therapy","Biopuncture Injections"
    ]
  },
  {
    slug: "acupuncture-clinic-greenville-sc",
    name: "Acupuncture Clinic",
    gbpCategory: "Acupuncture clinic",
    metaTitle: "Acupuncture Clinic in Greenville, SC | Pain Treatment & Relief",
    metaDescription: "Visit our acupuncture clinic in Greenville, SC for expert pain treatment. We specialize in back pain, sciatica, neck pain, and sports injuries. Call (864) 365-6156.",
    isPrimary: false,
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
    slug: "chinese-medicine-clinic-greenville-sc",
    name: "Chinese Medicine Clinic",
    gbpCategory: "Chinese medicine clinic",
    metaTitle: "Chinese Medicine Clinic in Greenville, SC | TCM & Herbal Medicine",
    metaDescription: "Authentic Chinese medicine clinic in Greenville, SC offering cupping, herbal medicine, moxibustion, and traditional TCM treatments. Call (864) 365-6156 to schedule.",
    isPrimary: false,
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
    slug: "alternative-medicine-practitioner-greenville-sc",
    name: "Alternative Medicine Practitioner",
    gbpCategory: "Alternative medicine practitioner",
    metaTitle: "Alternative Medicine Practitioner in Greenville, SC | Functional Medicine",
    metaDescription: "Trusted alternative medicine practitioner in Greenville, SC. Dr. Hendry offers functional medicine, ozone therapy, detox treatments, and holistic health care. Call (864) 365-6156.",
    isPrimary: false,
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
      "Whole Food Nutrition Counseling"
    ]
  }
];

const allServices: ServiceData[] = [];
const serviceMap = new Map<string, ServiceData>();
const categoryMap = new Map<string, CategoryData>();

for (const cat of categoryDefinitions) {
  categoryMap.set(cat.slug, cat);
  for (const name of cat.serviceNames) {
    const slug = `${createSlug(name)}-greenville-sc`;
    const service: ServiceData = {
      slug,
      name,
      metaTitle: `${name} in Greenville, SC | Integrative Health Partners`,
      metaDescription: `Professional ${name.toLowerCase()} services in Greenville, SC. Dr. William Hendry provides expert ${cat.name.toLowerCase()} care. Call (864) 365-6156 to schedule.`,
      category: cat.name,
      categorySlug: cat.slug,
      gbpCategory: cat.gbpCategory
    };
    allServices.push(service);
    serviceMap.set(slug, service);
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
    title: "Acupuncturist in Greenville, SC | Integrative Health Partners",
    description: "Trusted acupuncturist in Greenville, SC. Dr. William Hendry offers acupuncture, Chinese medicine, and functional medicine treatments. 25+ years experience. Board-certified with hospital privileges at Prisma Health. Call (864) 365-6156.",
    canonical: BASE_URL,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": NAP.name,
        "image": `${NAP.url}/logo.png`,
        "description": "Integrative functional medicine practice offering acupuncture, functional medicine, and natural treatments in Greenville, SC.",
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
        "url": NAP.url,
        "priceRange": "$$",
        "hasMap": "https://www.google.com/maps/place/Integrative+Health+Partners",
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "100", "bestRating": "5", "worstRating": "1" },
        "medicalSpecialty": ["Acupuncture","Functional Medicine","Chinese Medicine","Integrative Medicine"],
        "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00" }],
        "sameAs": ["https://facebook.com/ihpgreenville","https://instagram.com/integrativehealthpartners"]
      },
      {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": "Dr. William Hendry",
        "honorificPrefix": "Dr.",
        "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
        "worksFor": { "@type": "MedicalBusiness", "name": NAP.name },
        "medicalSpecialty": ["Acupuncture","Oriental Medicine","Functional Medicine"],
        "memberOf": { "@type": "Organization", "name": "Prisma Health" },
        "knowsAbout": ["Acupuncture","Functional Medicine","Chinese Herbal Medicine","Chronic Pain Treatment","Digestive Health"]
      }
    ]
  };
}

function getCategorySEO(slug: string): PageSEO | null {
  const cat = categoryMap.get(slug);
  if (!cat) return null;

  const pageUrl = `${BASE_URL}/services/${slug}`;
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
        "image": `${NAP.url}/logo.png`,
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
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": cat.name, "item": pageUrl }
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
              "text": `You can schedule an appointment by calling us at (864) 365-6156 or emailing info@ihpgreenville.com. We're located at 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609.`
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

  const pageUrl = `${BASE_URL}/services/${slug}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    canonical: pageUrl,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalProcedure",
        "name": `${service.name} in Greenville, SC`,
        "description": service.metaDescription,
        "procedureType": "https://schema.org/TherapeuticProcedure",
        "howPerformed": `${service.name} performed by Dr. William Hendry at Integrative Health Partners`,
        "bodyLocation": "Varies by condition",
        "provider": {
          "@type": "MedicalBusiness",
          "name": NAP.name,
          "address": { "@type": "PostalAddress", "streetAddress": NAP.streetAddress, "addressLocality": NAP.city, "addressRegion": NAP.state, "postalCode": NAP.postalCode },
          "telephone": NAP.phoneRaw
        },
        "medicalSpecialty": service.gbpCategory
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": cat.name, "item": `${BASE_URL}/services/${cat.slug}` },
          { "@type": "ListItem", "position": 3, "name": service.name, "item": pageUrl }
        ]
      }
    ]
  };
}

function getBlogSEO(): PageSEO {
  return {
    title: "Health & Wellness Blog | Integrative Health Partners Greenville, SC",
    description: "Read the latest health and wellness insights from Integrative Health Partners in Greenville, SC. Expert articles on acupuncture, functional medicine, and holistic health.",
    canonical: `${BASE_URL}/blog`,
    ogType: "website",
    schemas: []
  };
}

function getBlogPostSEO(title: string, excerpt: string, slug: string): PageSEO {
  return {
    title: `${title} | Integrative Health Partners`,
    description: excerpt.substring(0, 160),
    canonical: `${BASE_URL}/blog/${slug}`,
    ogType: "article",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
          { "@type": "ListItem", "position": 3, "name": title, "item": `${BASE_URL}/blog/${slug}` }
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

  const serviceMatch = path.match(/^\/services\/(.+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    const catSeo = getCategorySEO(slug);
    if (catSeo) return catSeo;
    const svcSeo = getServiceSEO(slug);
    if (svcSeo) return svcSeo;
  }

  return null;
}

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

export function generateSitemapXML(): string {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const cat of categoryDefinitions) {
    xml += `
  <url>
    <loc>${BASE_URL}/services/${cat.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  for (const service of allServices) {
    xml += `
  <url>
    <loc>${BASE_URL}/services/${service.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

  xml += `
</urlset>`;

  return xml;
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ChatGPT-User
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
