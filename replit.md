# Integrative Health Partners Website

## Overview
Local SEO-focused website for Integrative Health Partners, a functional medicine and acupuncture practice in Greenville, SC. The site aligns with their Google Business Profile structure, featuring 4 GBP category pages and 130 individual service pages.

## Recent Changes (January 2026)
- Implemented complete URL structure: `/services/[service-name]-greenville-sc`
- Created 4 category pages matching GBP categories
- Built dynamic routing for 130 service pages
- Added comprehensive schema markup (Organization, LocalBusiness, Service, Breadcrumb, FAQ)
- Updated home page H1 to focus on primary category: "Acupuncturist in Greenville, SC"
- Implemented internal linking with varied, descriptive anchor text
- Added blog section with database storage for posts imported from WordPress RSS feed
- Blog posts sync automatically every 30 minutes from WordPress RSS feed
- Manual sync available via POST /api/blog/sync endpoint

## Site Architecture

### GBP Categories (4 total)
1. **Acupuncturist** (Primary) - 27 services - `/services/acupuncturist-greenville-sc`
2. **Acupuncture Clinic** - 24 services - `/services/acupuncture-clinic-greenville-sc`
3. **Chinese Medicine Clinic** - 33 services - `/services/chinese-medicine-clinic-greenville-sc`
4. **Alternative Medicine Practitioner** - 46 services - `/services/alternative-medicine-practitioner-greenville-sc`

### URL Structure
- Home: `/`
- Categories: `/services/[category-slug]-greenville-sc`
- Services: `/services/[service-slug]-greenville-sc`

### Key Files
- `client/src/data/services.ts` - All 130 services organized by category with slugs, meta info
- `client/src/pages/home.tsx` - Landing page with LocalBusiness schema
- `client/src/pages/service-router.tsx` - Route handler that directs to category or service page
- `client/src/pages/category.tsx` - Category page template
- `client/src/pages/service.tsx` - Service page template
- `client/src/components/SchemaMarkup.tsx` - Schema components
- `client/src/components/Navigation.tsx` - Site navigation with service dropdown
- `client/src/components/NAPFooter.tsx` - Consistent NAP footer
- `client/src/components/Breadcrumbs.tsx` - Breadcrumb navigation
- `client/src/components/SEOHead.tsx` - Dynamic meta tag updates

## NAP Information
- Name: Integrative Health Partners
- Address: 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609
- Phone: (864) 365-6156
- Email: info@ihpgreenville.com
- URL: https://www.ihpgreenville.com

## Schema Markup Implementation
- **Organization Schema** - Every page (via component)
- **LocalBusiness Schema** - Home page only (GBP landing)
- **Service Schema** - All 130 service pages
- **Breadcrumb Schema** - Category and service pages
- **FAQ Schema** - Category, service, and home pages
- **Physician Schema** - Home page (Dr. Hendry)
- **EducationalOccupationalCredential Schema** - Home page (NCCAOM certification)

## Dr. Hendry Credentials
- **NCCAOM Certification #:** 114498
- **NCCAOM Designation:** Dipl. O.M. (NCCAOM)®
- **Certified Since:** August 6, 2009
- **Certification Valid Through:** August 31, 2029
- **NCCAOM Badge URL:** https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==
- **NCCAOM Directory:** https://directory.ncbahm.org/FAP/PractitionerDetail?AgencyClientId=ssLe-Z5Nnck=&d=4.8
- **State License Verification:** https://llr.sc.gov/med/
- **DAOM School:** East West College of Natural Medicine (Graduated December 2008)
- **NPI Number:** 1417184045 (Active since June 22, 2009)
- **NPI Verification:** https://npidb.org/doctors/other_service/acupuncturist_171100000x/1417184045.aspx
- **SC Acupuncture License #:** ACUP141 (Expires: September 30, 2027)
- **FL Acupuncture License #:** AP2646
- **Specialty:** Injection Therapy Certification

## Dr. Hendry Achievements
- **Hospital Privileges:** Prisma Health (9 years)
- **Professional Membership:** American Academy of Ozone Therapy (AAOT)
- **Speaking:** Acupuncture Today webinar "Medicating Our Microbes: Herbs, Supplements and the Microbiome" (Nov 2016), sponsored by Biotics Research Corporation
- **Acupuncture Today Webinar:** https://acupuncturetoday.com/webinars/detail/medicating-our-microbes-herbs-supplements-and-the-microbiome
- **Research:** Co-author of "Alternatives to Opiates" - 3-year study at Prisma Emergency Department on needling techniques as opioid alternatives
- **Publications:** 5 research studies/publications, 52 citations
- **ResearchGate Profile:** https://www.researchgate.net/profile/William-Hendry-4
- **Prisma Health Research:** https://academics.prismahealth.org/research-and-innovation/research-development/resources/patient-engagement-studio/main-studio
- **Key Publications:**
  - Evaluating the Effects of Acupuncture in the Treatment of Taxane Induced Peripheral Neuropathy (Patient Engagement Studio)
  - Symptom Management Among Cancer Survivors: HRV Biofeedback (Jun 2020)
  - Use of HRV biofeedback for symptom management among cancer survivors (May 2017)
  - HRV training for symptom control in cancer survivors (Feb 2017)
  - Neurogenesis: Implications for Integrative Care of Neurological Conditions (Nov 2013)

## Design System
- **Primary Color:** #2F814A (green)
- **Secondary/Accent:** #68CCD1 (teal)
- **Typography:** Playfair Display (display), Montserrat (headings), Source Sans 3 (body)

## Internal Linking Strategy
- Unique, descriptive anchor text for each link
- Natural keyword integration
- Links placed in body content
- Category pages link to all their services
- Service pages link back to parent category
- Home page links to all 4 categories
- Cross-linking between related services

## Development Notes
- All service pages have placeholder content (user will provide real content)
- Dynamic routing handles all 130 services from centralized data file
- Video hero with hardware-accelerated animations for performance
