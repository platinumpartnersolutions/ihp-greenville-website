import { NAP, Category, Service } from "@/data/services";

interface OrganizationSchemaProps {}

export function OrganizationSchema({}: OrganizationSchemaProps) {
  const schema = {
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
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": NAP.latitude,
      "longitude": NAP.longitude
    },
    "telephone": NAP.phoneRaw,
    "email": NAP.email,
    "url": NAP.url,
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [
      "https://www.google.com/maps/place/Integrative+Health+Partners/",
      "https://www.facebook.com/ihpgreenville",
      "https://www.instagram.com/integrativehealthpartners",
      "https://www.yelp.com/biz/integrative-health-partners-greenville",
      "https://www.ratemds.com/doctor-ratings/3158719/WILLIAM+M.-HENDRY-Greenville-SC.html/",
      "https://npiregistry.cms.hhs.gov/provider-view/1417184045",
      "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  aggregateRating?: { ratingValue: string; reviewCount: string };
}

export function LocalBusinessSchema({ aggregateRating }: LocalBusinessSchemaProps) {
  const schema = {
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
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": NAP.latitude,
      "longitude": NAP.longitude
    },
    "telephone": NAP.phoneRaw,
    "email": NAP.email,
    "url": NAP.url,
    "priceRange": "$$",
    "hasMap": "https://www.google.com/maps/place/Integrative+Health+Partners",
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    "medicalSpecialty": [
      "Acupuncture",
      "Functional Medicine",
      "Chinese Medicine",
      "Integrative Medicine"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [
      "https://www.google.com/maps/place/Integrative+Health+Partners/",
      "https://www.facebook.com/ihpgreenville",
      "https://www.instagram.com/integrativehealthpartners",
      "https://www.yelp.com/biz/integrative-health-partners-greenville",
      "https://www.ratemds.com/doctor-ratings/3158719/WILLIAM+M.-HENDRY-Greenville-SC.html/",
      "https://npiregistry.cms.hhs.gov/provider-view/1417184045",
      "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ServiceSchemaProps {
  service: Service;
  category: Category;
}

export function ServiceSchema({ service, category }: ServiceSchemaProps) {
  const schema = {
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
      "address": {
        "@type": "PostalAddress",
        "streetAddress": NAP.streetAddress,
        "addressLocality": NAP.city,
        "addressRegion": NAP.state,
        "postalCode": NAP.postalCode
      },
      "telephone": NAP.phoneRaw
    },
    "medicalSpecialty": category.gbpCategory
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: { question: string; answer: string }[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface PhysicianSchemaProps {}

export function PhysicianSchema({}: PhysicianSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "Dr. William Hendry",
    "honorificPrefix": "Dr.",
    "honorificSuffix": "DAOM, Dipl. O.M. (NCBAHM)®",
    "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
    "description": "Dr. William Hendry is a board-certified functional medicine and injection therapy practitioner in Greenville, SC with 25+ years of clinical experience, hospital privileges at Prisma Health, and 5 peer-reviewed research publications.",
    "worksFor": {
      "@type": "MedicalBusiness",
      "name": NAP.name
    },
    "medicalSpecialty": [
      "Acupuncture",
      "Oriental Medicine",
      "Functional Medicine",
      "Injection Therapy"
    ],
    "memberOf": [
      { "@type": "Organization", "name": "Prisma Health" },
      { "@type": "Organization", "name": "American Academy of Ozone Therapy (AAOT)" }
    ],
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Doctor of Acupuncture and Oriental Medicine (DAOM)",
        "recognizedBy": { "@type": "Organization", "name": "East West College of Natural Medicine" }
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Diplomate of Oriental Medicine",
        "identifier": "114498",
        "recognizedBy": { "@type": "Organization", "name": "NCBAHM" }
      }
    ],
    "identifier": [
      { "@type": "PropertyValue", "name": "NPI", "value": "1417184045" },
      { "@type": "PropertyValue", "name": "SC License", "value": "ACUP141" }
    ],
    "knowsAbout": [
      "Functional Medicine",
      "Injection Therapy",
      "Prolotherapy",
      "Biopuncture",
      "Acupuncture",
      "Chinese Herbal Medicine",
      "Ozone Therapy",
      "Chronic Pain Treatment",
      "Digestive Health"
    ],
    "sameAs": [
      "https://npiregistry.cms.hhs.gov/provider-view/1417184045",
      "https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx",
      "https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==",
      "https://www.ratemds.com/doctor-ratings/3158719/WILLIAM+M.-HENDRY-Greenville-SC.html/",
      "https://www.researchgate.net/profile/William-Hendry-4"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
