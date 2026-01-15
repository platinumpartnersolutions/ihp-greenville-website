import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Parser from "rss-parser";
import type { InsertBlogPost } from "@shared/schema";

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

  return httpServer;
}
