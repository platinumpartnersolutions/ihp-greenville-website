import { categoryDefinitions, allServices, serviceMap, categoryMap, NAP, BASE_URL } from "./seo";
import type { BlogPost } from "@shared/schema";

const createSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ============================================================
   SVG Icons (inline, no external dependency)
   ============================================================ */
const icons = {
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.05 1.19 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.82 21C6.38 21 9 20.62 10.5 20C13 19 15 17 15.5 14C16 11 17 8 22 6c0 5-2 8-5 10s-5 4.5-5 6"/></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  anchor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
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
        <div class="nav__dropdown-menu" role="menu">
          <a href="/services/acupuncturist-greenville-sc" class="nav__dropdown-item nav__dropdown-item--primary" role="menuitem">Acupuncturist Services</a>
          <a href="/services/acupuncture-clinic-greenville-sc" class="nav__dropdown-item" role="menuitem">Acupuncture Clinic Services</a>
          <a href="/services/chinese-medicine-clinic-greenville-sc" class="nav__dropdown-item" role="menuitem">Chinese Medicine Clinic Services</a>
          <a href="/services/alternative-medicine-practitioner-greenville-sc" class="nav__dropdown-item" role="menuitem">Alternative Medicine Practitioner Services</a>
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
  <a href="/services/acupuncturist-greenville-sc" class="nav__mobile-sublink">Acupuncturist Services</a>
  <a href="/services/acupuncture-clinic-greenville-sc" class="nav__mobile-sublink">Acupuncture Clinic Services</a>
  <a href="/services/chinese-medicine-clinic-greenville-sc" class="nav__mobile-sublink">Chinese Medicine Clinic Services</a>
  <a href="/services/alternative-medicine-practitioner-greenville-sc" class="nav__mobile-sublink">Alternative Medicine Practitioner Services</a>

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
          <div class="footer__contact-row">${icons.mapPin}<span>319 Wade Hampton Blvd, Suite A<br>Greenville, SC 29609</span></div>
          <div class="footer__contact-row">${icons.phone}<a href="tel:${NAP.phoneRaw}" class="footer__contact-link">${NAP.phone}</a></div>
          <div class="footer__contact-row">${icons.mail}<a href="mailto:${NAP.email}" class="footer__contact-link">${NAP.email}</a></div>
          <div class="footer__contact-row">${icons.clock}<span>Mon–Fri 9am–5pm</span></div>
        </div>
      </div>

      <div>
        <p class="footer__col-title">Services</p>
        <div class="footer__links">
          <a href="/services/acupuncturist-greenville-sc" class="footer__link">Acupuncturist Services</a>
          <a href="/services/acupuncture-clinic-greenville-sc" class="footer__link">Acupuncture Clinic Services</a>
          <a href="/services/chinese-medicine-clinic-greenville-sc" class="footer__link">Chinese Medicine Clinic Services</a>
          <a href="/services/alternative-medicine-practitioner-greenville-sc" class="footer__link">Alternative Medicine Practitioner Services</a>
          <a href="/blog" class="footer__link">Health Blog</a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <p>&copy; ${new Date().getFullYear()} Integrative Health Partners. All rights reserved.</p>
      <p>319 Wade Hampton Blvd Suite A, Greenville, SC 29609 &nbsp;&bull;&nbsp; <a href="tel:${NAP.phoneRaw}" style="color:inherit">${NAP.phone}</a></p>
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
    { name: "Acupuncture Therapy", slug: "acupuncture-therapy-greenville-sc", icon: icons.leaf, text: "Traditional needle-based therapy that stimulates the body's natural healing systems to relieve pain, reduce stress, and restore balance." },
    { name: "Cupping Therapy", slug: "cupping-therapy-greenville-sc", icon: icons.activity, text: "Ancient Chinese technique using suction cups to increase circulation, release muscle tension, and promote tissue healing." },
    { name: "Chinese Herbal Medicine", slug: "chinese-herbal-medicine-greenville-sc", icon: icons.leaf, text: "Custom herbal formulas rooted in 2,000+ years of tradition, prescribed to address the root cause of your health concerns." },
    { name: "Functional Medicine", slug: "alternative-medicine-practitioner-greenville-sc", icon: icons.activity, text: "Comprehensive, systems-based approach to find and treat the underlying causes of chronic illness and disease." },
    { name: "Dry Needling Therapy", slug: "dry-needling-therapy-greenville-sc", icon: icons.activity, text: "Targets trigger points and myofascial pain to release muscle tension, reduce pain, and restore normal movement patterns." },
    { name: "Ozone Therapy", slug: "ozone-therapy-greenville-sc", icon: icons.shield, text: "Medical-grade ozone treatment that stimulates the immune system, reduces inflammation, and promotes cellular regeneration." },
  ];

  const testimonials = [
    { text: "Dr. Hendry has been absolutely life-changing for me. After years of chronic back pain and failed conventional treatments, acupuncture finally gave me my life back. His expertise and compassion are unmatched.", author: "Sarah M." },
    { text: "I was skeptical about acupuncture at first, but after just 6 sessions with Dr. Hendry, my migraines have reduced dramatically. The team is professional, caring, and genuinely invested in your recovery.", author: "James T." },
    { text: "I came to Integrative Health Partners for fertility support after years of trying. Dr. Hendry's integrative approach — combining acupuncture with Chinese herbs — made all the difference. Forever grateful.", author: "Maria L." },
  ];

  const homeFAQs = [
    { q: "What conditions does acupuncture treat?", a: "Acupuncture has been shown to effectively treat a wide range of conditions including chronic pain (back pain, neck pain, sciatica), headaches and migraines, stress and anxiety, insomnia, digestive disorders, fertility issues, and more. Dr. Hendry will conduct a comprehensive evaluation to determine the best treatment approach for your specific needs." },
    { q: "How many acupuncture sessions will I need?", a: "The number of sessions varies depending on your condition, its severity, and how long you've had it. Acute conditions may resolve in 3–6 sessions, while chronic conditions often require 8–12 sessions or ongoing maintenance care. Dr. Hendry will create a personalized treatment plan during your initial consultation." },
    { q: "Does acupuncture hurt?", a: "Most patients experience little to no discomfort during acupuncture. The needles used are very thin — much finer than hypodermic needles — and most people feel a mild tingling or warmth at the insertion sites. Many patients report feeling deeply relaxed during and after treatment." },
    { q: "Is Integrative Health Partners accepting new patients?", a: "Yes, we are currently accepting new patients. Call us at (864) 365-6156 or email info@ihpgreenville.com to schedule your initial consultation with Dr. William Hendry." },
    { q: "Do you accept insurance for acupuncture?", a: "We recommend checking with your insurance provider about your specific acupuncture benefits. Our staff is happy to help you understand your coverage options. We also offer transparent self-pay rates and will work with you on a payment plan if needed." },
  ];

  return `${renderHead()}
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
        <p class="hero__eyebrow reveal">Greenville, SC's Trusted Integrative Health Practice</p>
        <h1 class="hero__h1 reveal reveal-delay-1 font-display">
          <em>Acupuncturist</em><br>in Greenville, SC
        </h1>
        <p class="hero__subtitle reveal reveal-delay-2">
          Evidence-based acupuncture, functional medicine &amp; Chinese medicine — helping Greenville patients heal naturally since 2009.
        </p>
        <div class="hero__stars reveal reveal-delay-3">
          <div class="hero__star-row" aria-label="5 star rating">${starRow()}</div>
          <span class="hero__rating">5.0 Google Rating &middot; 100+ Reviews</span>
        </div>
        <div class="reveal reveal-delay-3" style="display:flex;justify-content:center;">
          <a href="tel:${NAP.phoneRaw}" class="btn btn-white btn-lg">${icons.phone} Call (864) 365-6156</a>
        </div>
      </div>
      <div class="hero__scroll" aria-hidden="true">
        <div class="hero__scroll-mouse"><div class="hero__scroll-dot"></div></div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section" aria-labelledby="categories-heading">
      <div class="container">
        <div class="text-center" style="margin-bottom:3rem">
          <span class="section-label reveal">Our Specialties</span>
          <h2 class="section-title reveal reveal-delay-1" id="categories-heading">Comprehensive Integrative Health Services</h2>
          <p class="section-sub reveal reveal-delay-2" style="max-width:44rem;margin-inline:auto">
            Integrative Health Partners offers four distinct service categories, each guided by Dr. William Hendry's
            25+ years of clinical expertise and advanced NCCAOM certification.
          </p>
        </div>
        <div class="grid-auto md:grid-2 lg:grid-4">
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
      </div>
    </section>

    <!-- Approach -->
    <section class="section section--card" aria-labelledby="approach-heading">
      <div class="container">
        <div class="two-col">
          <div>
            <span class="section-label reveal">Our Philosophy</span>
            <h2 class="section-title reveal reveal-delay-1" id="approach-heading">Treating Root Causes, Not Just Symptoms</h2>
            <p style="color:var(--color-muted);line-height:1.75;margin:1.25rem 0 1.75rem" class="reveal reveal-delay-2">
              At Integrative Health Partners, Dr. Hendry takes a whole-person approach to health — combining the
              time-tested wisdom of Traditional Chinese Medicine with modern functional medicine to address the root
              causes of illness rather than just managing symptoms.
            </p>
            <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem">
              ${["Personalized treatment plans tailored to your unique health history",
                "Evidence-based integrative protocols combining Eastern and Western medicine",
                "Continuous progress monitoring with adjustments at every visit",
                "Education and lifestyle guidance for lasting results"].map(item => `
              <div class="check-item reveal"><span>${icons.checkCircle}</span><span>${item}</span></div>`).join("")}
            </div>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-primary reveal">${icons.phone} Schedule a Consultation</a>
          </div>
          <div class="reveal reveal-delay-2">
            <div class="approach-visual">
              <div style="text-align:center;width:100%">
                <div class="approach-icon-wrap">${icons.leaf}</div>
                <h3 class="font-display" style="font-size:1.5rem;margin-bottom:0.25rem">Integrative Healing</h3>
                <p style="color:var(--color-muted);margin-bottom:2rem">East meets West for whole-person care</p>
                <div class="stats-grid">
                  <div class="stat-box"><div class="stat-box__num stat-box__num--primary">25+</div><div class="stat-box__label">Years Experience</div></div>
                  <div class="stat-box"><div class="stat-box__num stat-box__num--secondary">130+</div><div class="stat-box__label">Services Offered</div></div>
                  <div class="stat-box"><div class="stat-box__num stat-box__num--primary">5</div><div class="stat-box__label">Research Publications</div></div>
                  <div class="stat-box"><div class="stat-box__num stat-box__num--secondary">9yr</div><div class="stat-box__label">Prisma Health Privileges</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Services -->
    <section class="section" aria-labelledby="services-heading">
      <div class="container">
        <div class="text-center" style="margin-bottom:3rem">
          <span class="section-label reveal">What We Treat</span>
          <h2 class="section-title reveal reveal-delay-1" id="services-heading">Popular Services at Our Greenville Practice</h2>
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
        <div class="text-center reveal">
          <a href="/services/acupuncturist-greenville-sc" class="btn btn-primary">View All Services ${icons.arrowRight}</a>
        </div>
      </div>
    </section>

    <!-- Provider / Dr. Hendry -->
    <section class="section section--card" aria-labelledby="provider-heading">
      <div class="container">
        <div class="two-col">
          <div class="provider-img-wrap reveal">
            <img src="/assets/take_this_small_blurry_photograph_and_create_1768153917878.jpg"
              alt="Dr. William Hendry, DAOM — Acupuncturist and Functional Medicine Practitioner in Greenville, SC"
              class="provider-img" width="480" height="600" loading="lazy" />
            <div class="provider-badge-overlay" aria-label="Dr. Hendry's degree">
              <div class="provider-badge-overlay__degree">DAOM</div>
              <div class="provider-badge-overlay__sub">Doctor of Acupuncture<br>&amp; Oriental Medicine</div>
            </div>
          </div>
          <div>
            <span class="section-label reveal">Meet Your Practitioner</span>
            <h2 class="section-title reveal reveal-delay-1" id="provider-heading">Dr. William Hendry</h2>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin:0.875rem 0 1.25rem" class="reveal reveal-delay-2">
              <span class="provider-cred-tag">Dipl. O.M. (NCCAOM)®</span>
              <span class="provider-cred-tag">NCCAOM #114498</span>
              <span class="provider-cred-tag">SC ACUP141</span>
            </div>
            <p style="color:var(--color-muted);line-height:1.75;margin-bottom:1rem" class="reveal reveal-delay-2">
              Dr. Hendry is a board-certified Doctor of Acupuncture and Oriental Medicine with over 25 years of clinical experience. 
              A graduate of East West College of Natural Medicine (DAOM, 2008), he holds hospital privileges at Prisma Health — 
              a distinction that reflects the highest standard of clinical competency in integrative medicine.
            </p>
            <p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.75rem" class="reveal reveal-delay-2">
              His research at Prisma's Emergency Department on needling techniques as alternatives to opioids has been
              published across 5 studies with 52 citations. He is a member of the American Academy of Ozone Therapy and
              a featured speaker in Acupuncture Today webinars.
            </p>
            <div style="display:flex;flex-direction:column;gap:0.875rem;margin-bottom:2rem">
              ${[
                "Hospital privileges at Prisma Health (9 years)",
                "5 research publications, 52 citations",
                "NCCAOM board-certified Diplomat of Oriental Medicine",
                "SC License ACUP141 (Valid through Sept. 30, 2027)"
              ].map(item => `
              <div class="check-item reveal"><span>${icons.checkCircle}</span><span>${item}</span></div>`).join("")}
            </div>
            <a href="tel:${NAP.phoneRaw}" class="btn btn-primary reveal">${icons.phone} Book an Appointment</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section section--primary" aria-labelledby="testimonials-heading">
      <div class="container">
        <div style="max-width:48rem;margin-inline:auto;text-align:center">
          <span class="section-label section-label--white reveal">Patient Stories</span>
          <h2 class="section-title section-title--white reveal reveal-delay-1" id="testimonials-heading">What Our Patients Say</h2>
          <p class="section-sub section-sub--white reveal reveal-delay-2" style="margin-bottom:3rem">Real stories from real patients who found relief through integrative care.</p>

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
        </div>
      </div>
    </section>

    <!-- Contact + Location -->
    <section class="section" id="contact" aria-labelledby="contact-heading">
      <div class="container">
        <div class="two-col">
          <div>
            <span class="section-label reveal">Get In Touch</span>
            <h2 class="section-title reveal reveal-delay-1" id="contact-heading">Visit Our Greenville, SC Office</h2>
            <p style="color:var(--color-muted);line-height:1.75;margin:1.25rem 0 2rem" class="reveal reveal-delay-2">
              Ready to experience the benefits of integrative medicine? Reach out to schedule your first consultation.
              New patients are always welcome.
            </p>
            <div style="display:flex;flex-direction:column;gap:1.5rem">
              <div class="info-row reveal">
                <div class="info-icon">${icons.mapPin}</div>
                <div>
                  <div class="info-label">Office Address</div>
                  <div class="info-value">319 Wade Hampton Blvd, Suite A<br>Greenville, SC 29609</div>
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
          </div>
          <div class="reveal reveal-delay-2">
            <div class="map-wrap">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.4!2d-82.382482!3d34.862258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDUxJzQ0LjEiTiA4MsKwMjInNTcuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="600" height="400" style="border:0;width:100%;height:320px" allowfullscreen loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Integrative Health Partners location map"></iframe>
            </div>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer"
              class="btn btn-primary btn-full" style="margin-top:1rem;justify-content:center">
              ${icons.mapPin} Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
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
    slug: `${createSlug(name)}-greenville-sc`,
  }));

  const otherCats = categoryDefinitions.filter(c => c.slug !== catSlug);

  const faqItems = [
    {
      q: `What ${cat.name.toLowerCase()} services do you offer in Greenville, SC?`,
      a: `At Integrative Health Partners, we offer ${cat.serviceNames.length} ${cat.name.toLowerCase()} services including ${cat.serviceNames.slice(0, 5).join(", ")}, and more. Dr. William Hendry has over 25 years of experience providing these treatments.`,
    },
    {
      q: `How do I schedule a ${cat.name.toLowerCase()} appointment?`,
      a: `Call us at (864) 365-6156 or email info@ihpgreenville.com. We're located at 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609. New patients are always welcome.`,
    },
    {
      q: `Does Dr. Hendry accept insurance for ${cat.name.toLowerCase()} services?`,
      a: `We recommend checking with your insurance provider about your specific coverage. Our staff is happy to help you understand your benefits. We also offer transparent self-pay rates.`,
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

  const relatedServices = allServices
    .filter(s => s.categorySlug === service.categorySlug && s.slug !== svcSlug)
    .slice(0, 8);

  const whatToExpectItems = [
    "An in-depth health history and lifestyle consultation",
    "A comprehensive assessment of your chief complaint and related symptoms",
    "Development of a personalized treatment plan",
    "A comfortable and professional treatment session",
    "Post-treatment guidance and self-care recommendations",
  ];

  const faqItems = [
    {
      q: `How does ${service.name} work?`,
      a: `${service.name} is an evidence-based treatment offered at Integrative Health Partners in Greenville, SC. Dr. Hendry conducts a thorough assessment to understand your individual health needs and creates a customized treatment protocol to address the root cause of your condition.`,
    },
    {
      q: `How many ${service.name} sessions will I need?`,
      a: `The number of sessions depends on your specific condition and its chronicity. Acute conditions typically require 3–6 sessions, while chronic conditions may need 8–12 or more sessions. Dr. Hendry will outline a recommended treatment schedule during your initial consultation.`,
    },
    {
      q: `Where is ${service.name} available in Greenville, SC?`,
      a: `${service.name} is available at Integrative Health Partners, located at 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609. Call (864) 365-6156 to schedule your appointment with Dr. William Hendry.`,
    },
  ];

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
        <!-- Main Content -->
        <article>
          <span class="tag" style="margin-bottom:1rem;display:inline-block">${cat.name} Services</span>
          <h1 class="section-title reveal" style="margin-bottom:1.25rem">${service.name} in Greenville, SC</h1>
          <p style="color:var(--color-muted);font-size:1.0625rem;line-height:1.75;margin-bottom:2rem" class="reveal reveal-delay-1">
            ${service.metaDescription}
          </p>

          <div class="placeholder-notice reveal">
            <strong>Note:</strong> Detailed content for this service page is coming soon. 
            Please call us at (864) 365-6156 for complete information about our ${service.name} treatments.
          </div>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-top:2rem;margin-bottom:1rem">About ${service.name}</h2>
          <p style="color:var(--color-muted);line-height:1.75;margin-bottom:1.5rem" class="reveal">
            At Integrative Health Partners in Greenville, SC, Dr. William Hendry provides expert ${service.name} 
            as part of our comprehensive ${cat.name.toLowerCase()} services. Every treatment is personalized to 
            your unique health history and therapeutic goals. Dr. Hendry draws on 25+ years of clinical experience 
            and ongoing research to deliver the highest standard of integrative care.
          </p>
          <p style="color:var(--color-muted);line-height:1.75;margin-bottom:2rem" class="reveal">
            As a board-certified NCCAOM Diplomate of Oriental Medicine and holder of hospital privileges at 
            Prisma Health, Dr. Hendry integrates the best of Traditional Chinese Medicine and modern functional 
            medicine to create treatment plans that achieve lasting results.
          </p>

          <h2 class="font-display reveal" style="font-size:1.75rem;margin-top:2rem;margin-bottom:1rem">What to Expect at Your Appointment</h2>
          <div style="display:flex;flex-direction:column;gap:0.875rem;margin-bottom:2rem">
            ${whatToExpectItems.map(item => `
            <div class="check-item reveal">${icons.checkCircle}<span>${item}</span></div>`).join("")}
          </div>

          <!-- FAQ -->
          <h2 class="font-display reveal" style="font-size:1.75rem;margin-top:2rem;margin-bottom:1.5rem">Frequently Asked Questions</h2>
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

          <!-- Related Services -->
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
        </article>

        <!-- Sidebar -->
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
              319 Wade Hampton Blvd, Suite A<br>Greenville, SC 29609
            </p>
            <a href="https://maps.google.com/maps?q=319+Wade+Hampton+Blvd+Greenville+SC" target="_blank" rel="noopener noreferrer" class="sidebar-link">
              ${icons.mapPin} Get Directions
            </a>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card__title">Browse ${cat.name} Services</p>
            ${cat.serviceNames.slice(0, 8).map(svcName => {
              const svcSl = `${createSlug(svcName)}-greenville-sc`;
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
        ${post.content || `<p>${excerpt}</p>`}
      </div>

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
