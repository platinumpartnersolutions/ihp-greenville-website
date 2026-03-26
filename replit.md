# Integrative Health Partners Website

## Overview
This project involves developing a local SEO-focused website for Integrative Health Partners, a functional medicine and acupuncture practice in Greenville, SC. The website is designed to align with their Google Business Profile structure, featuring 4 GBP category pages and 130 individual service pages. The primary goal is to enhance online visibility, attract local clients, and provide comprehensive information about the practice's services and conditions treated. The site aims for high search engine rankings through meticulous SEO practices, including rich schema markup, optimized content, and a robust internal linking strategy.

## User Preferences
The user prefers a clean, modern design with a focus on intuitive navigation. They want the site to load quickly and be fully responsive across all devices. Content should be easily updateable, and the site should prominently feature Dr. Hendry's credentials and expertise. The user expects the AI to prioritize SEO best practices in all development aspects, from content structure to technical implementation. They also emphasize the importance of accurate and comprehensive schema markup for all page types.

## System Architecture

### UI/UX Decisions
The design system utilizes a primary color of `#2F814A` (green) and a secondary/accent color of `#68CCD1` (teal). Typography includes Playfair Display for display text, Montserrat for headings, and Source Sans 3 for body text. The site features a video hero with hardware-accelerated animations for performance. The navigation includes a 3-column dropdown for conditions.

### Technical Implementations
The website is built with vanilla HTML, CSS, and JavaScript, served by an Express.js backend. All pages are server-side rendered via `server/renderer.ts`, eliminating the need for a client-side framework like React/Vite. There is no build step required, as CSS (`public/css/style.css`) and JS (`public/js/main.js`) are served as static files. Static assets are served from the `public/` directory, and `attached_assets/` (video, images) are served at the `/assets/` path.

### Feature Specifications
- **URL Structure**:
    - Home: `/`
    - Categories: `/services/[category-slug]-greenville-sc`
    - Services: `/services/[service-slug]-greenville-sc`
    - Conditions Hub: `/conditions`
    - Condition Categories: `/conditions/[category-slug]`
    - Individual Conditions: `/conditions/[condition-slug]`
- **GBP Categories**: Four main categories: Acupuncturist, Acupuncture Clinic, Chinese Medicine Clinic, Alternative Medicine Practitioner.
- **Content Management**:
    - 130 unique service pages, with 9 core pages having extensive content (1500-2500 words) and 121 standard pages (800+ words). Content for services is managed via `server/services-content.ts`.
    - 30 individual condition pages with detailed content (definitions, symptoms, root causes, treatment, Dr. Hendry's approach, FAQs), managed via `server/conditions.ts`.
    - Blog section with posts stored in a database, automatically synced from a WordPress RSS feed every 30 minutes, with manual sync available.
- **SEO**:
    - Server-side SEO injection for meta tags, canonical URLs, OG tags, and JSON-LD schema.
    - Server-generated `sitemap.xml` including all service pages, categories, conditions, and blog posts.
    - `robots.txt` configured to allow GPTBot, Google-Extended, and ChatGPT-User crawlers.
    - Title tags are optimized to be ≤60 characters, using "IHP" as the brand suffix for service/condition pages.
    - Comprehensive schema markup implemented for various page types: Organization, LocalBusiness, Service, Breadcrumb, FAQ, Physician, MedicalProcedure, MedicalCondition, ItemList, Blog, Article, EducationalOccupationalCredential.
    - Internal linking strategy with descriptive anchor text, cross-linking between related services and conditions.

### System Design Choices
- **Server-Side Rendering (SSR)**: Chosen to ensure all content is available to search engine crawlers without JavaScript execution, improving SEO.
- **Vanilla Stack**: Reduces complexity and overhead associated with client-side frameworks and build processes.
- **Dynamic Routing**: Handles a large number of service and condition pages efficiently from centralized data files.
- **Dedicated Contact Page**: Includes canonical NAP block, Google Maps iframe, driving directions, Google review link, office hours, and directory links.
- **Email Obfuscation**: Uses `<!--email_off-->...<!--/email_off-->` to prevent Cloudflare from corrupting `mailto:` links.

## External Dependencies
- **WordPress RSS Feed**: Used for syncing blog posts into the site's database.
- **Google Maps**: Integrated via an iframe on the contact page for location display and driving directions.
- **Google My Business Profile**: The website's structure and content are designed to align with the GBP categories and information.
- **Cloudflare**: Utilized for email obfuscation.
- **NCCAOM (National Certification Commission for Acupuncture and Oriental Medicine)**: Credentials and badge linked for Dr. Hendry.
- **NPI Registry**: Used for verifying Dr. Hendry's National Provider Identifier.
- **South Carolina LLR (Department of Labor, Licensing and Regulation)**: Linked for state license verification.
- **ResearchGate**: Profile linked for Dr. Hendry's research and publications.