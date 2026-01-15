import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Parser from "rss-parser";
import type { InsertBlogPost } from "@shared/schema";

interface LinkableItem {
  name: string;
  slug: string;
  keywords: string[];
}

const categories: LinkableItem[] = [
  { name: "Acupuncturist", slug: "acupuncturist-greenville-sc", keywords: ["acupuncturist", "acupuncture specialist"] },
  { name: "Acupuncture Clinic", slug: "acupuncture-clinic-greenville-sc", keywords: ["acupuncture clinic", "acupuncture center"] },
  { name: "Chinese Medicine Clinic", slug: "chinese-medicine-clinic-greenville-sc", keywords: ["chinese medicine", "traditional chinese medicine", "tcm"] },
  { name: "Alternative Medicine Practitioner", slug: "alternative-medicine-practitioner-greenville-sc", keywords: ["alternative medicine", "functional medicine", "integrative medicine", "holistic medicine"] },
];

const services: LinkableItem[] = [
  { name: "Acupuncture Therapy", slug: "acupuncture-therapy-greenville-sc", keywords: ["acupuncture therapy", "acupuncture treatment"] },
  { name: "Cupping Therapy", slug: "cupping-therapy-greenville-sc", keywords: ["cupping therapy", "cupping", "chinese cupping"] },
  { name: "Gua Sha Treatment", slug: "gua-sha-treatment-greenville-sc", keywords: ["gua sha", "gua sha treatment", "gua sha therapy"] },
  { name: "Moxibustion Therapy", slug: "moxibustion-therapy-greenville-sc", keywords: ["moxibustion", "moxa", "moxa treatment"] },
  { name: "Chinese Herbal Medicine", slug: "chinese-herbal-medicine-greenville-sc", keywords: ["chinese herbal medicine", "chinese herbs", "herbal medicine", "herbal formulas"] },
  { name: "Dry Needling Therapy", slug: "dry-needling-therapy-greenville-sc", keywords: ["dry needling", "trigger point needling"] },
  { name: "Electroacupuncture", slug: "electroacupuncture-greenville-sc", keywords: ["electroacupuncture", "electrical stimulation acupuncture"] },
  { name: "Back Pain Treatment", slug: "back-pain-treatment-greenville-sc", keywords: ["back pain", "lower back pain", "upper back pain"] },
  { name: "Sciatica Treatment", slug: "sciatica-treatment-greenville-sc", keywords: ["sciatica", "sciatic pain", "sciatic nerve"] },
  { name: "Neck Pain Treatment", slug: "neck-pain-treatment-greenville-sc", keywords: ["neck pain"] },
  { name: "Chronic Pain Management", slug: "chronic-pain-management-greenville-sc", keywords: ["chronic pain"] },
  { name: "Fibromyalgia Treatment", slug: "fibromyalgia-treatment-greenville-sc", keywords: ["fibromyalgia"] },
  { name: "Neuropathy Treatment", slug: "neuropathy-treatment-greenville-sc", keywords: ["neuropathy", "peripheral neuropathy"] },
  { name: "Digestive Issues Treatment", slug: "digestive-issues-treatment-greenville-sc", keywords: ["digestive issues", "digestive health", "digestion", "digestive tract", "gi tract"] },
  { name: "IBS Treatment", slug: "ibs-treatment-greenville-sc", keywords: ["ibs", "irritable bowel"] },
  { name: "Stress Management", slug: "stress-management-greenville-sc", keywords: ["stress management", "stress relief"] },
  { name: "Acupuncture for Anxiety", slug: "acupuncture-for-anxiety-greenville-sc", keywords: ["anxiety"] },
  { name: "Insomnia Treatment", slug: "insomnia-treatment-greenville-sc", keywords: ["insomnia", "sleep issues", "sleep problems"] },
  { name: "Fertility Treatment", slug: "fertility-treatment-greenville-sc", keywords: ["fertility", "infertility"] },
  { name: "Menopause Treatment", slug: "menopause-treatment-greenville-sc", keywords: ["menopause", "hot flashes"] },
  { name: "Detoxification Therapy", slug: "detoxification-therapy-greenville-sc", keywords: ["detoxification", "detox", "detoxify"] },
  { name: "Ozone Therapy", slug: "ozone-therapy-greenville-sc", keywords: ["ozone therapy", "ozone treatment"] },
  { name: "Laser Acupuncture", slug: "laser-acupuncture-greenville-sc", keywords: ["laser acupuncture", "cold laser", "laser therapy", "lllt", "low level light therapy"] },
  { name: "Cosmetic Acupuncture", slug: "cosmetic-acupuncture-greenville-sc", keywords: ["cosmetic acupuncture", "facial acupuncture", "facial rejuvenation"] },
  { name: "Allergy Treatment", slug: "allergy-treatment-greenville-sc", keywords: ["allergy", "allergies"] },
  { name: "Immune System Support", slug: "immune-system-support-greenville-sc", keywords: ["immune system", "immune support", "immunity"] },
  { name: "Fatigue Treatment", slug: "fatigue-treatment-greenville-sc", keywords: ["fatigue", "chronic fatigue", "tiredness"] },
  { name: "Hormone Testing", slug: "hormone-testing-greenville-sc", keywords: ["hormone testing", "hormonal imbalance"] },
  { name: "Thyroid Disorder Treatment", slug: "thyroid-disorder-treatment-greenville-sc", keywords: ["thyroid"] },
  { name: "Nutritional Counseling", slug: "nutritional-counseling-greenville-sc", keywords: ["nutritional counseling", "nutrition therapy", "nutrition"] },
  { name: "Arthritis Pain Treatment", slug: "arthritis-pain-treatment-greenville-sc", keywords: ["arthritis"] },
  { name: "Joint Pain Treatment", slug: "joint-pain-treatment-greenville-sc", keywords: ["joint pain", "joints"] },
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

  return httpServer;
}
