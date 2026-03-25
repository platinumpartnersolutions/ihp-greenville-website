import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Parser from "rss-parser";
import type { InsertBlogPost } from "@shared/schema";
import { getSEOForUrl, injectSEOIntoHTML, generateSitemapXML, generateRobotsTxt, BASE_URL } from "./seo";
import { renderHome, renderCategory, renderService, renderBlogIndex, renderBlogPost, render404 } from "./renderer";

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

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const today = new Date().toISOString().split('T')[0];
      let sitemap = generateSitemapXML();
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

  app.get("/blog/:slug", async (req, res) => {
    try {
      await ensureBlogPostsSynced();
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).set("Content-Type", "text/html").send(render404());

      const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "").substring(0, 160) : "";
      const blogSEO = {
        title: `${post.title} | Integrative Health Partners`,
        description: cleanExcerpt,
        canonical: `${BASE_URL}/blog/${post.slug}`,
        ogType: "article",
        schemas: [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": `${BASE_URL}/blog/${post.slug}` }
            ]
          }
        ]
      };
      let html = renderBlogPost(post);
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
