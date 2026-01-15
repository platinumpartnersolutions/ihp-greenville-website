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
      "https://facebook.com/ihpgreenville",
      "https://instagram.com/integrativehealthpartners"
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
      "https://facebook.com/ihpgreenville",
      "https://instagram.com/integrativehealthpartners"
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
    "jobTitle": "Doctor of Acupuncture and Oriental Medicine",
    "worksFor": {
      "@type": "MedicalBusiness",
      "name": NAP.name
    },
    "medicalSpecialty": [
      "Acupuncture",
      "Oriental Medicine",
      "Functional Medicine"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Prisma Health"
    },
    "knowsAbout": [
      "Acupuncture",
      "Functional Medicine",
      "Chinese Herbal Medicine",
      "Chronic Pain Treatment",
      "Digestive Health"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
