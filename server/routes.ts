import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Parser from "rss-parser";
import type { InsertBlogPost } from "@shared/schema";
import { getSEOForUrl, injectSEOIntoHTML, generateSitemapXML, generateRobotsTxt, getBlogPostSEO, BASE_URL } from "./seo";
import { renderHome, renderCategory, renderService, renderBlogIndex, renderBlogPost, render404, renderConditionsHub, renderConditionCategory, renderCondition, renderAbout, renderDrHendry, renderContact } from "./renderer";
import { conditions, conditionCategories } from "./conditions";

interface LinkableItem {
  name: string;
  slug: string;
  keywords: string[];
}

const categories: LinkableItem[] = [
  { name: "Acupuncturist", slug: "acupuncturist-services", keywords: ["acupuncturist", "acupuncture specialist"] },
  { name: "Acupuncture Clinic", slug: "acupuncture-clinic-services", keywords: ["acupuncture clinic", "acupuncture center"] },
  { name: "Chinese Medicine Clinic", slug: "chinese-medicine-clinic-services", keywords: ["chinese medicine", "traditional chinese medicine", "tcm"] },
  { name: "Alternative Medicine Practitioner", slug: "alternative-medicine-practitioner-services", keywords: ["alternative medicine", "functional medicine", "integrative medicine", "holistic medicine"] },
];

const services: LinkableItem[] = [
  { name: "Acupuncture Therapy", slug: "acupuncture-therapy", keywords: ["acupuncture therapy", "acupuncture treatment"] },
  { name: "Cupping Therapy", slug: "cupping-therapy", keywords: ["cupping therapy", "cupping", "chinese cupping"] },
  { name: "Gua Sha Treatment", slug: "gua-sha-treatment", keywords: ["gua sha", "gua sha treatment", "gua sha therapy"] },
  { name: "Moxibustion Therapy", slug: "moxibustion-therapy", keywords: ["moxibustion", "moxa", "moxa treatment"] },
  { name: "Chinese Herbal Medicine", slug: "chinese-herbal-medicine", keywords: ["chinese herbal medicine", "chinese herbs", "herbal medicine", "herbal formulas"] },
  { name: "Dry Needling Therapy", slug: "dry-needling-therapy", keywords: ["dry needling", "trigger point needling"] },
  { name: "Electroacupuncture", slug: "electroacupuncture", keywords: ["electroacupuncture", "electrical stimulation acupuncture"] },
  { name: "Back Pain Treatment", slug: "back-pain-treatment", keywords: ["back pain", "lower back pain", "upper back pain"] },
  { name: "Sciatica Treatment", slug: "sciatica-treatment", keywords: ["sciatica", "sciatic pain", "sciatic nerve"] },
  { name: "Neck Pain Treatment", slug: "neck-pain-treatment", keywords: ["neck pain"] },
  { name: "Chronic Pain Management", slug: "chronic-pain-management", keywords: ["chronic pain"] },
  { name: "Fibromyalgia Treatment", slug: "fibromyalgia-treatment", keywords: ["fibromyalgia"] },
  { name: "Neuropathy Treatment", slug: "neuropathy-treatment", keywords: ["neuropathy", "peripheral neuropathy"] },
  { name: "Digestive Issues Treatment", slug: "digestive-issues-treatment", keywords: ["digestive issues", "digestive health", "digestion", "digestive tract", "gi tract"] },
  { name: "IBS Treatment", slug: "ibs-treatment", keywords: ["ibs", "irritable bowel"] },
  { name: "Stress Management", slug: "stress-management", keywords: ["stress management", "stress relief"] },
  { name: "Acupuncture for Anxiety", slug: "acupuncture-for-anxiety", keywords: ["anxiety"] },
  { name: "Insomnia Treatment", slug: "insomnia-treatment", keywords: ["insomnia", "sleep issues", "sleep problems"] },
  { name: "Fertility Treatment", slug: "fertility-treatment", keywords: ["fertility", "infertility"] },
  { name: "Menopause Treatment", slug: "menopause-treatment", keywords: ["menopause", "hot flashes"] },
  { name: "Detoxification Therapy", slug: "detoxification-therapy", keywords: ["detoxification", "detox", "detoxify"] },
  { name: "Ozone Therapy", slug: "ozone-therapy", keywords: ["ozone therapy", "ozone treatment"] },
  { name: "Laser Acupuncture", slug: "laser-acupuncture", keywords: ["laser acupuncture", "cold laser", "laser therapy", "lllt", "low level light therapy"] },
  { name: "Cosmetic Acupuncture", slug: "cosmetic-acupuncture", keywords: ["cosmetic acupuncture", "facial acupuncture", "facial rejuvenation"] },
  { name: "Allergy Treatment", slug: "allergy-treatment", keywords: ["allergy", "allergies"] },
  { name: "Immune System Support", slug: "immune-system-support", keywords: ["immune system", "immune support", "immunity"] },
  { name: "Fatigue Treatment", slug: "fatigue-treatment", keywords: ["fatigue", "chronic fatigue", "tiredness"] },
  { name: "Hormone Testing", slug: "hormone-testing", keywords: ["hormone testing", "hormonal imbalance"] },
  { name: "Thyroid Disorder Treatment", slug: "thyroid-disorder-treatment", keywords: ["thyroid"] },
  { name: "Nutritional Counseling", slug: "nutritional-counseling", keywords: ["nutritional counseling", "nutrition therapy", "nutrition"] },
  { name: "Arthritis Pain Treatment", slug: "arthritis-pain-treatment", keywords: ["arthritis"] },
  { name: "Joint Pain Treatment", slug: "joint-pain-treatment", keywords: ["joint pain", "joints"] },
];

function addInternalLinks(content: string): { content: string; linksAdded: string[] } {
  const linksAdded: string[] = [];
  let modifiedContent = content;
  const linkedKeywords = new Set<string>();

  const allItems = [...categories, ...services];
  
  allItems.sort((a, b) => {
    const maxA = Math.max(...a.keywords.map(k => k.length));
    const maxB = Math.max(...b.keywords.map(k => k.length));
    return maxB - maxA;
  });

  for (const item of allItems) {
    for (const keyword of item.keywords) {
      if (linkedKeywords.has(keyword.toLowerCase())) continue;
      
      const regex = new RegExp(`(?<![<\\/a-zA-Z])\\b(${keyword})\\b(?![^<]*>)(?![^<]*<\\/a>)`, 'gi');
      
      const match = modifiedContent.match(regex);
      if (match) {
        modifiedContent = modifiedContent.replace(regex, (matched) => {
          if (linkedKeywords.has(keyword.toLowerCase())) return matched;
          linkedKeywords.add(keyword.toLowerCase());
          linksAdded.push(`${keyword} -> /services/${item.slug}`);
          return `<a href="/services/${item.slug}" class="internal-link">${matched}</a>`;
        });
        break;
      }
    }
  }

  return { content: modifiedContent, linksAdded };
}

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

const RSS_FEED_URL = "https://www.ihpgreenville.com/feed/rss2";

let lastSyncTime = 0;
const SYNC_INTERVAL = 30 * 60 * 1000;

async function syncBlogPostsFromRSS(): Promise<number> {
  const feed = await parser.parseURL(RSS_FEED_URL);
  
  const posts: InsertBlogPost[] = feed.items.map((item: any) => {
    const slug = item.link 
      ? item.link.split('/').filter(Boolean).pop() || ''
      : item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
    
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
    
    return {
      title: item.title || '',
      slug,
      link: item.link || '',
      pubDate,
      creator: item.creator || item['dc:creator'] || 'Integrative Health Partners',
      excerpt: item.contentSnippet || (item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : ''),
      content: item.contentEncoded || item['content:encoded'] || item.content || '',
      categories: item.categories || [],
    };
  });

  return await storage.syncBlogPosts(posts);
}

async function ensureBlogPostsSynced(): Promise<void> {
  const now = Date.now();
  if (now - lastSyncTime >= SYNC_INTERVAL) {
    try {
      await syncBlogPostsFromRSS();
      lastSyncTime = now;
      console.log("Blog posts synced from RSS feed");
    } catch (error) {
      console.error("Failed to sync blog posts:", error);
    }
  }
}

/* ============================================================
   Old -greenville-sc URL redirects (301) — maps every legacy
   URL to the new clean slug format so existing Google rankings
   and backlinks are preserved.
   ============================================================ */
const CATEGORY_SLUG_REDIRECTS: Record<string, string> = {
  "acupuncturist-greenville-sc": "acupuncturist-services",
  "acupuncture-clinic-greenville-sc": "acupuncture-clinic-services",
  "chinese-medicine-clinic-greenville-sc": "chinese-medicine-clinic-services",
  "alternative-medicine-practitioner-greenville-sc": "alternative-medicine-practitioner-services",
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await syncBlogPostsFromRSS().then(() => {
    lastSyncTime = Date.now();
    console.log("Initial blog posts sync completed");
  }).catch(err => {
    console.error("Initial sync failed:", err);
  });

  /* 301 redirect middleware for old -greenville-sc URLs */
  app.use((req, res, next) => {
    const m = req.path.match(/^\/services\/(.+)-greenville-sc$/);
    if (m) {
      const fullOldSlug = `${m[1]}-greenville-sc`;
      const newSlug = CATEGORY_SLUG_REDIRECTS[fullOldSlug] ?? m[1];
      return res.redirect(301, `/services/${newSlug}`);
    }
    next();
  });

  /* ── Conditions Section ── */
  app.get("/conditions", (req, res) => {
    let html = renderConditionsHub();
    const seo = getSEOForUrl(req.originalUrl);
    if (seo) html = injectSEOIntoHTML(html, seo);
    res.set("Content-Type", "text/html; charset=utf-8").send(html);
  });

  app.get("/conditions/:slug", (req, res, next) => {
    const { slug } = req.params;

    const catHtml = renderConditionCategory(slug);
    if (catHtml) {
      const seo = getSEOForUrl(req.originalUrl);
      let html = catHtml;
      if (seo) html = injectSEOIntoHTML(html, seo);
      return res.set("Content-Type", "text/html; charset=utf-8").send(html);
    }

    const condHtml = renderCondition(slug);
    if (condHtml) {
      const seo = getSEOForUrl(req.originalUrl);
      let html = condHtml;
      if (seo) html = injectSEOIntoHTML(html, seo);
      return res.set("Content-Type", "text/html; charset=utf-8").send(html);
    }

    next();
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const today = new Date().toISOString().split('T')[0];
      const conditionSlugs = conditions.map(c => c.slug);
      const conditionCatSlugs = conditionCategories.map(c => c.slug);
      let sitemap = generateSitemapXML(conditionSlugs, conditionCatSlugs);
      const blogPostUrls = posts.map(post => {
        const lastmod = post.pubDate ? new Date(post.pubDate).toISOString().split('T')[0] : today;
        return `\n  <url>\n    <loc>${BASE_URL}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
      }).join('');
      sitemap = sitemap.replace('</urlset>', `${blogPostUrls}\n</urlset>`);
      res.set("Content-Type", "application/xml").send(sitemap);
    } catch (error) {
      res.set("Content-Type", "application/xml").send(generateSitemapXML());
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain").send(generateRobotsTxt());
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/vite-hmr") || req.path.includes(".")) {
      return next();
    }

    const originalEnd = res.end.bind(res);
    (res as any).end = function (chunk?: any, encoding?: any, callback?: any) {
      const contentType = res.getHeader("content-type");
      if (contentType && typeof contentType === "string" && contentType.includes("text/html") && chunk) {
        let html = typeof chunk === "string" ? chunk : Buffer.isBuffer(chunk) ? chunk.toString("utf-8") : String(chunk);
        const seo = getSEOForUrl(req.originalUrl);
        if (seo) {
          html = injectSEOIntoHTML(html, seo);
        }
        const buffer = Buffer.from(html, "utf-8");
        res.setHeader("content-length", buffer.length);
        return originalEnd(buffer, "utf-8", callback);
      }
      return originalEnd(chunk, encoding, callback);
    };

    next();
  });

  app.get("/api/blog", async (req, res) => {
    try {
      await ensureBlogPostsSynced();
      
      const posts = await storage.getAllBlogPosts();
      
      res.json({ 
        title: "Integrative Health Partners Blog",
        description: "Health and wellness insights from Integrative Health Partners",
        posts 
      });
    } catch (error) {
      console.error("Blog fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      await ensureBlogPostsSynced();
      
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Blog post fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog/sync", async (req, res) => {
    try {
      const count = await syncBlogPostsFromRSS();
      lastSyncTime = Date.now();
      res.json({ success: true, syncedCount: count, message: `Synced ${count} blog posts from RSS feed` });
    } catch (error) {
      console.error("Blog sync error:", error);
      res.status(500).json({ error: "Failed to sync blog posts" });
    }
  });

  app.post("/api/blog/add-internal-links", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const results: { slug: string; linksAdded: string[] }[] = [];
      
      for (const post of posts) {
        const { content, linksAdded } = addInternalLinks(post.content);
        
        if (linksAdded.length > 0) {
          await storage.updateBlogPostContent(post.slug, content);
          results.push({ slug: post.slug, linksAdded });
        }
      }

      const totalLinks = results.reduce((sum, r) => sum + r.linksAdded.length, 0);
      res.json({ 
        success: true, 
        postsUpdated: results.length, 
        totalLinksAdded: totalLinks,
        details: results 
      });
    } catch (error) {
      console.error("Add internal links error:", error);
      res.status(500).json({ error: "Failed to add internal links" });
    }
  });

  /* ============================================================
     Page Routes (server-rendered HTML with explicit SEO injection)
     ============================================================ */

  function sendPage(res: any, html: string, url: string, status = 200): void {
    const seo = getSEOForUrl(url);
    if (seo) html = injectSEOIntoHTML(html, seo);
    res.status(status).set("Content-Type", "text/html").send(html);
  }

  app.get("/", (req, res) => {
    sendPage(res, renderHome(), req.originalUrl);
  });

  app.get("/services/:slug", (req, res) => {
    const { slug } = req.params;
    const catHtml = renderCategory(slug);
    if (catHtml) return sendPage(res, catHtml, req.originalUrl);
    const svcHtml = renderService(slug);
    if (svcHtml) return sendPage(res, svcHtml, req.originalUrl);
    return res.status(404).set("Content-Type", "text/html").send(render404());
  });

  app.get("/blog", async (req, res) => {
    try {
      await ensureBlogPostsSynced();
      const posts = await storage.getAllBlogPosts();
      sendPage(res, renderBlogIndex(posts), req.originalUrl);
    } catch (error) {
      console.error("Blog index error:", error);
      sendPage(res, renderBlogIndex([]), req.originalUrl);
    }
  });

  app.get("/about", (req, res) => {
    sendPage(res, renderAbout(), req.originalUrl);
  });

  app.get("/dr-hendry", (req, res) => {
    sendPage(res, renderDrHendry(), req.originalUrl);
  });

  app.get("/contact", (req, res) => {
    sendPage(res, renderContact(), req.originalUrl);
  });

  app.get("/llms.txt", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const allServicesList = [
        "Acupuncture Therapy","Acupuncture Treatment","Traditional Chinese Acupuncture","Medical Acupuncture",
        "Auricular Acupuncture","Ear Acupuncture","Electroacupuncture","Electrical Stimulation Acupuncture",
        "Scalp Acupuncture","Cosmetic Acupuncture","Facial Rejuvenation Acupuncture","Fertility Acupuncture",
        "Prenatal Acupuncture","Pregnancy Acupuncture","Acupuncture for Anxiety","Acupuncture for Stress Relief",
        "Acupuncture for Insomnia","Acupuncture for Migraines","Acupuncture for Headaches","Non-Needle Acupuncture",
        "Laser Acupuncture","Acupressure Therapy","Dry Needling Therapy","Trigger Point Dry Needling",
        "Intramuscular Stimulation","Biopuncture Therapy","Biopuncture Injections",
        "Back Pain Treatment","Lower Back Pain Treatment","Upper Back Pain Treatment","Chronic Back Pain Treatment",
        "Sciatica Treatment","Sciatic Nerve Pain Treatment","Neck Pain Treatment","Shoulder Pain Treatment",
        "Frozen Shoulder Treatment","Knee Pain Treatment","Hip Pain Treatment","Joint Pain Treatment",
        "Arthritis Pain Treatment","Fibromyalgia Treatment","Chronic Pain Management","Neuropathy Treatment",
        "Peripheral Neuropathy Treatment","Plantar Fasciitis Treatment","Carpal Tunnel Treatment","TMJ Treatment",
        "TMJ Pain Relief","Sports Injury Treatment","Muscle Pain Treatment","Trigger Point Therapy",
        "Cupping Therapy","Chinese Cupping","Fire Cupping","Gua Sha Treatment","Gua Sha Therapy",
        "Moxibustion Therapy","Moxa Treatment","Chinese Herbal Medicine","Chinese Herbal Formulas",
        "Custom Herbal Formulations","Herbal Consultation","Herbal Supplements","Natural Medicine Consultation",
        "Herb-Drug Interaction Consultation","Menstrual Pain Treatment","PMS Treatment","Menopause Treatment",
        "Hot Flash Treatment","Fertility Treatment","Infertility Treatment","Digestive Issues Treatment",
        "IBS Treatment","Acid Reflux Treatment","Allergy Treatment","Sinus Treatment","Insomnia Treatment",
        "Sleep Disorder Treatment","Natural Anxiety Treatment","Natural Depression Treatment","Stress Management",
        "Fatigue Treatment","Chronic Fatigue Treatment","Immune System Support",
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
      ];

      const conditionNames = [
        "Back Pain","Neck Pain","Knee Pain","Hip Pain","Shoulder Pain","Sciatica",
        "Headaches & Migraines","Fibromyalgia","Neuropathy","Sports Injuries",
        "Anxiety & Stress","Depression","Insomnia","PTSD","Brain Fog",
        "Fertility","PCOS","Menopause","Hormone Imbalance","Perimenopause",
        "IBS & Gut Issues","Chronic Fatigue","Autoimmune Disease","Hashimoto's",
        "Thyroid Issues","Food Sensitivities","Leaky Gut","Adrenal Fatigue",
        "Chronic Illness","Weight Issues"
      ];

      const conditionSlugs = [
        "back-pain","neck-pain","knee-pain","hip-pain","shoulder-pain","sciatica",
        "headaches-migraines","fibromyalgia","neuropathy","sports-injuries",
        "anxiety-stress","depression","insomnia","ptsd","brain-fog",
        "fertility","pcos","menopause","hormone-imbalance","perimenopause",
        "ibs-gut-issues","chronic-fatigue","autoimmune-disease","hashimotos",
        "thyroid-issues","food-sensitivities","leaky-gut","adrenal-fatigue",
        "chronic-illness","weight-issues"
      ];

      const createServiceSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      let txt = `# Integrative Health Partners — AI Site Index (llms.txt)
# Generated: ${new Date().toISOString().split('T')[0]}
# Site: https://www.ihpgreenville.com

## About This Practice

Integrative Health Partners is a functional medicine and acupuncture clinic located at 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609.
Phone: (864) 365-6156 | Email: info@ihpgreenville.com | Hours: Mon–Fri 9am–5pm

Led by Dr. William Hendry, DAOM — a board-certified acupuncturist with 25+ years of clinical experience, NCCAOM Diplomate of Oriental Medicine (Cert. #114498), NPI 1417184045, SC License ACUP141. Dr. Hendry holds hospital privileges at Prisma Health (9 years) and is co-author of a landmark 3-year Prisma Health Emergency Department study on needle-based alternatives to opioids ("Alternatives to Opiates"). He has 5 peer-reviewed publications and 52 citations. ResearchGate: https://www.researchgate.net/profile/William-Hendry-4

Services include acupuncture, cupping, gua sha, moxibustion, Chinese herbal medicine, dry needling, electroacupuncture, functional medicine, ozone therapy, injection therapy, and nutritional counseling. In-house professional herbal pharmacy on site.

## Core Pages

${BASE_URL}
Home page. Overview of Integrative Health Partners: acupuncturist and functional medicine clinic in Greenville, SC. Features Dr. Hendry credentials, services summary, testimonials, and FAQs.

${BASE_URL}/about
About Integrative Health Partners. Practice history, root-cause philosophy, in-house herbal pharmacy, and what makes IHP different from conventional care. Links to Dr. Hendry page and contact.

${BASE_URL}/dr-hendry
Dr. William Hendry biography and credentials page. Full credential verification (DAOM, NCCAOM #114498, NPI 1417184045, SC ACUP141, FL AP2646). Features the Prisma Health 3-year opioid alternative ER study, 5 peer-reviewed publications, hospital privileges, and philosophy of care.

${BASE_URL}/blog
Health and wellness blog. Expert articles on acupuncture, functional medicine, Chinese medicine, and integrative health.

${BASE_URL}/contact
Contact page. Schedule an appointment with Dr. William Hendry at Integrative Health Partners. Address: 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609. Phone: (864) 365-6156. Email: info@ihpgreenville.com.

## Service Category Pages

${BASE_URL}/services/acupuncturist-services
Acupuncturist services hub. 27 acupuncture services including acupuncture therapy, electroacupuncture, laser acupuncture, dry needling, biopuncture, and fertility acupuncture. Greenville SC.

${BASE_URL}/services/acupuncture-clinic-services
Acupuncture clinic services hub. 24 pain treatment services including back pain, sciatica, neck pain, shoulder pain, knee pain, fibromyalgia, and neuropathy treatment. Greenville SC.

${BASE_URL}/services/chinese-medicine-clinic-services
Chinese medicine clinic services hub. 33 TCM services including cupping, gua sha, moxibustion, Chinese herbal medicine, menopause treatment, IBS treatment, and stress management. Greenville SC.

${BASE_URL}/services/alternative-medicine-practitioner-services
Alternative medicine practitioner services hub. 46 functional medicine services including ozone therapy, hormone testing, thyroid treatment, autoimmune disease treatment, and nutritional counseling. Greenville SC.

## Individual Service Pages (130 total)

`;

      const svcCatContext: Record<string, string> = {
        "Acupuncture Therapy": "Full-spectrum acupuncture using classical point selection and Dr. Hendry's 25+ years of diagnostic expertise. Addresses pain, chronic illness, and functional health.",
        "Dry Needling Therapy": "Trigger-point dry needling targets myofascial pain and muscle dysfunction. Dr. Hendry holds dual expertise in traditional acupuncture and Western dry needling.",
        "Electroacupuncture": "Electrical stimulation combined with acupuncture enhances therapeutic effect for neuropathy, chronic pain, and nerve regeneration.",
        "Functional Medicine Consultation": "Advanced root-cause diagnostics: nutrient panels, hormone testing, food sensitivity, and gut health analysis interpreted through an integrative lens.",
        "Chinese Herbal Medicine": "Custom herbal formulas dispensed same-day from our in-house professional pharmacy. Classical formulas, granule extracts, and single-herb preparations.",
        "Ozone Therapy": "Medical-grade ozone delivered via infrared sauna protocols. Supports immune function, detoxification, and recovery from chronic fatigue and fibromyalgia.",
        "Cupping Therapy": "Traditional cupping stimulates blood flow and releases fascial tension. Effective for musculoskeletal pain, respiratory conditions, and recovery.",
        "Gua Sha Treatment": "Gua sha scraping technique reduces inflammation, improves circulation, and addresses chronic muscle tension and systemic qi stagnation.",
        "Moxibustion Therapy": "Heat applied via burning moxa warms meridians, supports immune function, and addresses cold-type conditions including menstrual pain and digestive weakness.",
      };
      for (const name of allServicesList) {
        const slug = createServiceSlug(name);
        const extra = svcCatContext[name] || "Part of IHP's integrative approach combining acupuncture, Chinese medicine, and functional medicine under Dr. William Hendry, DAOM.";
        txt += `${BASE_URL}/services/${slug}\n${name} in Greenville, SC. ${extra} Integrative Health Partners: (864) 365-6156.\n\n`;
      }

      txt += `## Conditions We Treat

${BASE_URL}/conditions
Conditions hub page. Overview of 30 health conditions treated with acupuncture and functional medicine at Integrative Health Partners in Greenville, SC.

${BASE_URL}/conditions/pain-and-musculoskeletal
Pain & Musculoskeletal conditions category. Includes back pain, sciatica, fibromyalgia, neuropathy, sports injuries, and joint pain treatment.

${BASE_URL}/conditions/neurological-mental-health
Neurological & Mental Health category. Includes anxiety, depression, insomnia, PTSD, and brain fog treatment with acupuncture.

${BASE_URL}/conditions/hormonal-womens-health
Hormonal & Women's Health category. Includes fertility support, PCOS, menopause, perimenopause, and hormone imbalance treatment.

${BASE_URL}/conditions/digestive-immune
Digestive & Immune Health category. Includes IBS, leaky gut, food sensitivities, autoimmune disease, Hashimoto's, and adrenal fatigue treatment.

`;

      for (let i = 0; i < conditionSlugs.length; i++) {
        txt += `${BASE_URL}/conditions/${conditionSlugs[i]}\n${conditionNames[i]} treatment in Greenville, SC. Acupuncture and functional medicine approach by Dr. William Hendry at Integrative Health Partners.\n\n`;
      }

      txt += `## Blog Posts\n\n`;
      for (const post of posts) {
        const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]*>/g, '').substring(0, 200) : '';
        txt += `${BASE_URL}/blog/${post.slug}\n${post.title}. ${cleanExcerpt}\n\n`;
      }

      txt += `## Location & Service Area

Primary location: 319 Wade Hampton Blvd, Suite A, Greenville, SC 29609
Service area: Greenville, Taylors, Travelers Rest, Mauldin, Simpsonville, Greer, Spartanburg, and greater Upstate South Carolina.

## Key Differentiators

- Dr. Hendry holds hospital privileges at Prisma Health (9 years) — rare for an acupuncturist
- Co-author of 3-year Prisma Emergency Department opioid alternative study
- DAOM degree from East West College of Natural Medicine (highest academic credential in field)
- NCCAOM board-certified since August 6, 2009 (valid through August 31, 2029)
- 5 peer-reviewed publications, 52 citations
- Member: American Academy of Ozone Therapy (AAOT)
- In-house professional-grade herbal pharmacy
- Injection therapy certified
- Active SC License ACUP141, FL License AP2646
`;

      res.set("Content-Type", "text/plain; charset=utf-8").send(txt);
    } catch (error) {
      console.error("llms.txt generation error:", error);
      res.status(500).set("Content-Type", "text/plain").send("Error generating llms.txt");
    }
  });

  app.get("/blog/:slug", async (req, res) => {
    try {
      await ensureBlogPostsSynced();
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).set("Content-Type", "text/html").send(render404());

      let html = renderBlogPost(post);
      const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "").substring(0, 160) : "";
      const dateStr = post.pubDate ? (typeof post.pubDate === "string" ? post.pubDate : post.pubDate.toISOString()) : undefined;
      const blogSEO = getBlogPostSEO(post.title, cleanExcerpt, post.slug, dateStr);
      html = injectSEOIntoHTML(html, blogSEO);
      res.set("Content-Type", "text/html").send(html);
    } catch (error) {
      console.error("Blog post error:", error);
      res.status(500).set("Content-Type", "text/html").send(render404());
    }
  });

  app.use((_req, res) => {
    res.status(404).set("Content-Type", "text/html").send(render404());
  });

  return httpServer;
}
