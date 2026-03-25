import { serviceContentMap } from "./services-content";
import { conditions, conditionCategories, conditionCategoryMap, type ConditionData } from "./conditions";

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
    slug: "acupuncturist-services",
    name: "Acupuncturist",
    gbpCategory: "Acupuncturist",
    metaTitle: "Acupuncturist Services in Greenville, SC | Integrative Health Partners",
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
    slug: "acupuncture-clinic-services",
    name: "Acupuncture Clinic",
    gbpCategory: "Acupuncture clinic",
    metaTitle: "Acupuncture Clinic Services in Greenville, SC | Pain Treatment & Relief",
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
    slug: "chinese-medicine-clinic-services",
    name: "Chinese Medicine Clinic",
    gbpCategory: "Chinese medicine clinic",
    metaTitle: "Chinese Medicine Clinic Services in Greenville, SC | TCM & Herbal Medicine",
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
    slug: "alternative-medicine-practitioner-services",
    name: "Alternative Medicine Practitioner",
    gbpCategory: "Alternative medicine practitioner",
    metaTitle: "Alternative Medicine Practitioner Services in Greenville, SC | Functional Medicine",
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
    const slug = createSlug(name);
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
    title: "Integrative Functional Medicine & Acupuncture in Greenville, SC | IHP",
    description: "Integrative Health Partners — acupuncture, functional medicine & Chinese medicine in Greenville, SC. Dr. William Hendry, DAOM: 25+ years, Prisma Health hospital privileges, 5 research publications. New patients welcome. Call (864) 365-6156.",
    canonical: BASE_URL,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": NAP.name,
        "image": `${NAP.url}/favicon.png`,
        "description": "Integrative functional medicine and acupuncture practice offering root-cause care, Chinese herbal medicine, ozone therapy, and injection therapy in Greenville, SC.",
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
        "medicalSpecialty": ["Acupuncture","Functional Medicine","Chinese Medicine","Integrative Medicine"],
        "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00" }],
        "sameAs": ["https://facebook.com/ihpgreenville","https://instagram.com/integrativehealthpartners"]
      },
      {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": "Dr. William Hendry",
        "honorificPrefix": "Dr.",
        "honorificSuffix": "DAOM, Dipl. O.M. (NCCAOM)®",
        "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
        "worksFor": { "@type": "MedicalBusiness", "name": NAP.name },
        "medicalSpecialty": ["Acupuncture","Oriental Medicine","Functional Medicine","Integrative Medicine"],
        "memberOf": [
          { "@type": "Organization", "name": "Prisma Health" },
          { "@type": "Organization", "name": "American Academy of Ozone Therapy" }
        ],
        "hasCredential": [
          { "@type": "EducationalOccupationalCredential", "name": "Doctor of Acupuncture and Oriental Medicine (DAOM)", "recognizedBy": { "@type": "Organization", "name": "East West College of Natural Medicine" } },
          { "@type": "EducationalOccupationalCredential", "name": "Diplomate of Oriental Medicine", "identifier": "114498", "recognizedBy": { "@type": "Organization", "name": "NCCAOM" } }
        ],
        "identifier": [
          { "@type": "PropertyValue", "name": "NPI", "value": "1417184045" },
          { "@type": "PropertyValue", "name": "SC License", "value": "ACUP141" },
          { "@type": "PropertyValue", "name": "FL License", "value": "AP2646" }
        ],
        "knowsAbout": ["Acupuncture","Functional Medicine","Chinese Herbal Medicine","Chronic Pain Treatment","Ozone Therapy","Injection Therapy"]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What conditions does acupuncture treat?", "acceptedAnswer": { "@type": "Answer", "text": "Acupuncture has clinical evidence for chronic pain (back pain, sciatica, neck pain), headaches and migraines, anxiety and stress, insomnia, digestive disorders, fertility challenges, hormonal imbalance, and more. Dr. Hendry combines acupuncture with functional medicine to address root causes, not just symptoms." } },
          { "@type": "Question", "name": "How many sessions will I need?", "acceptedAnswer": { "@type": "Answer", "text": "Acute conditions typically resolve in 3–6 sessions. Chronic conditions often require 8–12 sessions with ongoing maintenance. Dr. Hendry creates a personalized treatment plan at your initial consultation." } },
          { "@type": "Question", "name": "What is functional medicine?", "acceptedAnswer": { "@type": "Answer", "text": "Functional medicine identifies the root biological causes of chronic illness — gut dysbiosis, hormonal imbalances, nutritional deficiencies, inflammatory triggers — and addresses them directly. Dr. Hendry uses advanced testing and integrative protocols to resolve conditions that conventional medicine manages but doesn't cure." } },
          { "@type": "Question", "name": "Does acupuncture hurt?", "acceptedAnswer": { "@type": "Answer", "text": "Most patients experience little to no discomfort. Acupuncture needles are hair-thin and most people feel a mild tingling or warmth. Many patients fall asleep during treatment." } },
          { "@type": "Question", "name": "Is Dr. Hendry accepting new patients?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we are currently accepting new patients. Call (864) 365-6156 or email info@ihpgreenville.com to schedule your initial consultation with Dr. William Hendry at our Greenville, SC office." } },
          { "@type": "Question", "name": "What makes Integrative Health Partners different?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry holds 9-year hospital privileges at Prisma Health, co-authored a landmark 3-year study on needle-based alternatives to opioids in the Prisma ER, holds a DAOM doctoral degree (highest in the field), and maintains 5 peer-reviewed publications with 52 citations. Our practice also offers an in-house herbal pharmacy and a full range of integrative therapies under one roof." } },
          { "@type": "Question", "name": "Do you offer ozone therapy and injection therapy in Greenville, SC?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry is certified in Injection Therapy and is a member of the American Academy of Ozone Therapy (AAOT). We offer medical ozone therapy, biopuncture, and nutrient injection therapies that most clinics cannot provide." } },
          { "@type": "Question", "name": "Do you accept insurance for acupuncture?", "acceptedAnswer": { "@type": "Answer", "text": "We recommend checking with your insurance provider about specific acupuncture benefits. Our staff can help you understand your coverage. We offer transparent self-pay rates and will work with you on a plan." } }
        ]
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
        "image": `${NAP.url}/favicon.png`,
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
          { "@type": "ListItem", "position": 2, "name": `${cat.name} Services`, "item": pageUrl }
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

  const baseSlug = slug.replace(/-greenville-sc$/, "");
  const content = serviceContentMap.get(baseSlug);

  const faqItems = content
    ? content.faqs
    : [
        { q: `How does ${service.name} work?`, a: `${service.name} is an evidence-based treatment offered at Integrative Health Partners in Greenville, SC. Dr. Hendry conducts a thorough assessment to understand your individual health needs and creates a customized treatment protocol.` },
        { q: `How many ${service.name} sessions will I need?`, a: `The number of sessions depends on your specific condition. Acute conditions typically require 3–6 sessions, while chronic conditions may need 8–12 or more sessions.` },
        { q: `Where is ${service.name} available in Greenville, SC?`, a: `${service.name} is available at Integrative Health Partners, 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609. Call (864) 365-6156.` },
      ];

  const schemas: Record<string, unknown>[] = [
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
        { "@type": "ListItem", "position": 2, "name": `${cat.name} Services`, "item": `${BASE_URL}/services/${cat.slug}` },
        { "@type": "ListItem", "position": 3, "name": service.name, "item": pageUrl }
      ]
    },
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
    }
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
    title: "Health & Wellness Blog | Integrative Health Partners Greenville, SC",
    description: "Read the latest health and wellness insights from Integrative Health Partners in Greenville, SC. Expert articles on acupuncture, functional medicine, and holistic health.",
    canonical: `${BASE_URL}/blog`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Integrative Health Partners Blog",
        "description": "Expert health and wellness insights on acupuncture, functional medicine, Chinese medicine, and holistic health from Dr. William Hendry in Greenville, SC.",
        "url": `${BASE_URL}/blog`,
        "publisher": {
          "@type": "MedicalBusiness",
          "name": NAP.name,
          "url": NAP.url
        }
      }
    ]
  };
}

function getBlogPostSEO(title: string, excerpt: string, slug: string, datePublished?: string): PageSEO {
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
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": excerpt.substring(0, 160),
        "url": `${BASE_URL}/blog/${slug}`,
        ...(datePublished ? { "datePublished": datePublished } : {}),
        "author": {
          "@type": "Person",
          "name": "Dr. William Hendry",
          "honorificSuffix": "DAOM",
          "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
          "url": `${BASE_URL}/dr-hendry`
        },
        "publisher": {
          "@type": "MedicalBusiness",
          "name": NAP.name,
          "url": NAP.url,
          "logo": { "@type": "ImageObject", "url": `${NAP.url}/favicon.png` }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}` }
      }
    ]
  };
}

function getConditionsHubSEO(): PageSEO {
  return {
    title: "Conditions We Treat | Integrative Health Partners Greenville, SC",
    description: "Integrative Health Partners treats 30+ health conditions with acupuncture and functional medicine in Greenville, SC. Pain, hormonal, neurological, and digestive conditions. Call (864) 365-6156.",
    canonical: `${BASE_URL}/conditions`,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Conditions We Treat", "item": `${BASE_URL}/conditions` }
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
          "url": `${BASE_URL}/conditions/${c.slug}`
        }))
      }
    ]
  };
}

function getConditionCategorySEO(slug: string, name: string, desc: string): PageSEO {
  const pageUrl = `${BASE_URL}/conditions/${slug}`;
  const catData = conditionCategoryMap.get(slug);
  const catConditions = catData
    ? catData.conditionSlugs.map(cs => conditions.find(c => c.slug === cs)).filter(Boolean)
    : [];

  return {
    title: `${name} Treatment in Greenville, SC | Integrative Health Partners`,
    description: desc,
    canonical: pageUrl,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Conditions We Treat", "item": `${BASE_URL}/conditions` },
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
          "url": `${BASE_URL}/conditions/${c.slug}`
        }))
      }
    ]
  };
}

function getConditionPageSEO(slug: string, name: string, desc: string, catSlug: string, catName: string, faqs: { q: string; a: string }[]): PageSEO {
  const pageUrl = `${BASE_URL}/conditions/${slug}`;
  return {
    title: `${name} Treatment in Greenville, SC | Integrative Health Partners`,
    description: desc,
    canonical: pageUrl,
    ogType: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "MedicalCondition",
        "name": name,
        "description": desc,
        "relevantSpecialty": { "@type": "MedicalSpecialty", "name": "Acupuncture" },
        "associatedAnatomy": { "@type": "AnatomicalSystem", "name": "Human body" }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Conditions We Treat", "item": `${BASE_URL}/conditions` },
          { "@type": "ListItem", "position": 3, "name": catName, "item": `${BASE_URL}/conditions/${catSlug}` },
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
      }
    ]
  };
}

function getAboutSEO(): PageSEO {
  return {
    title: "About Integrative Health Partners | Acupuncture & Functional Medicine Greenville, SC",
    description: "Learn about Integrative Health Partners — Greenville SC's trusted integrative health practice. Root-cause functional medicine, acupuncture, and in-house herbal pharmacy. Call (864) 365-6156.",
    canonical: `${BASE_URL}/about`,
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
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "About", "item": `${BASE_URL}/about` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What types of patients does Integrative Health Partners see?", "acceptedAnswer": { "@type": "Answer", "text": "We see patients of all ages with both acute and chronic conditions. Many of our patients have complex health issues that haven't resolved with conventional care alone — including chronic pain, autoimmune conditions, hormonal imbalances, digestive disorders, and neurological conditions. We also see patients seeking preventive care and health optimization." } },
          { "@type": "Question", "name": "Do I need a referral from my doctor to be seen?", "acceptedAnswer": { "@type": "Answer", "text": "No referral is needed. You can book directly by calling (864) 365-6156. If you have been referred by a physician, we welcome that collaboration and will communicate with your referring provider as appropriate." } },
          { "@type": "Question", "name": "What should I bring to my first appointment?", "acceptedAnswer": { "@type": "Answer", "text": "Bring a list of current medications and supplements, any recent lab work or imaging results, and a brief summary of your health history and current concerns. Wearing loose, comfortable clothing is recommended if acupuncture will be part of your initial visit." } },
          { "@type": "Question", "name": "How long is an initial consultation?", "acceptedAnswer": { "@type": "Answer", "text": "Your first visit typically lasts 60–90 minutes. This allows Dr. Hendry to conduct a thorough health history, perform diagnostic assessments (including tongue and pulse diagnosis), and begin developing your individualized treatment plan." } },
          { "@type": "Question", "name": "Do you accept insurance?", "acceptedAnswer": { "@type": "Answer", "text": "We recommend checking with your insurance provider about acupuncture and integrative medicine benefits. Our staff can help you understand your coverage options. We also offer transparent self-pay rates." } },
          { "@type": "Question", "name": "What makes IHP different from other acupuncture clinics?", "acceptedAnswer": { "@type": "Answer", "text": "Three key differentiators: Dr. Hendry's 9-year hospital privileges at Prisma Health (rare for an acupuncturist), our full in-house herbal pharmacy for same-day dispensing, and Dr. Hendry's published research background (5 publications, 52 citations) ensuring every treatment decision is evidence-informed." } }
        ]
      }
    ]
  };
}

function getDrHendrySEO(): PageSEO {
  return {
    title: "Dr. William Hendry, DAOM | Integrative Health Partners Greenville, SC",
    description: "Dr. William Hendry — DAOM, NCCAOM #114498, NPI 1417184045, 25+ years clinical experience. Co-author of landmark Prisma Health opioid alternative ER study. Greenville, SC acupuncturist.",
    canonical: `${BASE_URL}/dr-hendry`,
    ogType: "profile",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": "Dr. William Hendry",
        "honorificPrefix": "Dr.",
        "honorificSuffix": "DAOM, Dipl. O.M. (NCCAOM)®",
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
        "medicalSpecialty": ["Acupuncture", "Oriental Medicine", "Functional Medicine", "Integrative Medicine"],
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
            "recognizedBy": { "@type": "Organization", "name": "NCCAOM", "url": "https://www.nccaom.org" },
            "identifier": "114498"
          }
        ],
        "identifier": [
          { "@type": "PropertyValue", "name": "NPI", "value": "1417184045" },
          { "@type": "PropertyValue", "name": "SC License", "value": "ACUP141" },
          { "@type": "PropertyValue", "name": "FL License", "value": "AP2646" },
          { "@type": "PropertyValue", "name": "NCCAOM", "value": "114498" }
        ],
        "memberOf": [
          { "@type": "Organization", "name": "Prisma Health" },
          { "@type": "Organization", "name": "American Academy of Ozone Therapy (AAOT)" }
        ],
        "sameAs": ["https://www.researchgate.net/profile/William-Hendry-4", "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx"]
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Dr. William Hendry", "item": `${BASE_URL}/dr-hendry` }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What is Dr. Hendry's highest academic credential?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry holds a Doctor of Acupuncture and Oriental Medicine (DAOM) from East West College of Natural Medicine, which is the highest academic degree available in the acupuncture and oriental medicine field. He graduated in December 2008." } },
          { "@type": "Question", "name": "Is Dr. Hendry board certified?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry holds NCCAOM (National Certification Commission for Acupuncture and Oriental Medicine) board certification as a Diplomate of Oriental Medicine — certificate #114498. His certification is valid through August 31, 2029." } },
          { "@type": "Question", "name": "Has Dr. Hendry published research?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry has authored or co-authored 5 peer-reviewed research publications with a combined 52 citations. His research includes the Prisma Health opioid alternative study, HRV biofeedback for cancer survivors, and neurogenesis in integrative care." } },
          { "@type": "Question", "name": "What is Dr. Hendry's hospital experience?", "acceptedAnswer": { "@type": "Answer", "text": "Dr. Hendry held hospital privileges at Prisma Health for 9 years — an exceptional distinction for an acupuncturist. During that time, he co-investigated a 3-year study using needling techniques as alternatives to opioid pain management in the Emergency Department." } },
          { "@type": "Question", "name": "Does Dr. Hendry offer injection therapies?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dr. Hendry is a certified Injection Therapy practitioner, enabling him to offer biopuncture and nutrient injection therapies. These treatments involve micro-injections of natural substances at specific points to support healing — a service unavailable at most acupuncture clinics." } },
          { "@type": "Question", "name": "How can I verify Dr. Hendry's credentials?", "acceptedAnswer": { "@type": "Answer", "text": "You can verify his NCCAOM certification via the official NCCAOM digital badge, his NPI number (1417184045) through the NPI database, and his South Carolina license (ACUP141) through the SC Department of Labor, Licensing and Regulation website." } }
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

  if (path === '/about') {
    return getAboutSEO();
  }

  if (path === '/dr-hendry') {
    return getDrHendrySEO();
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
      return getConditionCategorySEO(slug, catData.name, catData.metaDescription);
    }
    const condData = conditions.find(c => c.slug === slug);
    if (condData) {
      const parentCat = conditionCategories.find(cc => cc.conditionSlugs.includes(slug));
      return getConditionPageSEO(slug, condData.name, condData.metaDescription, parentCat?.slug || "", parentCat?.name || "", condData.content.faqs);
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

export function generateSitemapXML(conditionSlugs: string[] = [], conditionCatSlugs: string[] = []): string {
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
    <loc>${BASE_URL}/conditions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  for (const slug of conditionCatSlugs) {
    xml += `
  <url>
    <loc>${BASE_URL}/conditions/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  for (const slug of conditionSlugs) {
    xml += `
  <url>
    <loc>${BASE_URL}/conditions/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  xml += `
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  xml += `
  <url>
    <loc>${BASE_URL}/dr-hendry</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

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
