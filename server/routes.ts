import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

const RSS_FEED_URL = "https://www.ihpgreenville.com/feed/rss2";

let cachedFeed: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/blog", async (req, res) => {
    try {
      const now = Date.now();
      
      if (cachedFeed && (now - cacheTimestamp) < CACHE_DURATION) {
        return res.json(cachedFeed);
      }

      const feed = await parser.parseURL(RSS_FEED_URL);
      
      const posts = feed.items.map((item: any) => {
        const slug = item.link 
          ? item.link.split('/').filter(Boolean).pop() || ''
          : item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
        
        return {
          title: item.title || '',
          slug,
          link: item.link || '',
          pubDate: item.pubDate || '',
          creator: item.creator || item['dc:creator'] || 'Integrative Health Partners',
          excerpt: item.contentSnippet || (item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : ''),
          content: item.contentEncoded || item['content:encoded'] || item.content || '',
          categories: item.categories || [],
        };
      });

      cachedFeed = { 
        title: feed.title,
        description: feed.description,
        posts 
      };
      cacheTimestamp = now;

      res.json(cachedFeed);
    } catch (error) {
      console.error("RSS fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const now = Date.now();
      
      if (!cachedFeed || (now - cacheTimestamp) >= CACHE_DURATION) {
        const feed = await parser.parseURL(RSS_FEED_URL);
        
        const posts = feed.items.map((item: any) => {
          const postSlug = item.link 
            ? item.link.split('/').filter(Boolean).pop() || ''
            : item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
          
          return {
            title: item.title || '',
            slug: postSlug,
            link: item.link || '',
            pubDate: item.pubDate || '',
            creator: item.creator || item['dc:creator'] || 'Integrative Health Partners',
            excerpt: item.contentSnippet || (item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : ''),
            content: item.contentEncoded || item['content:encoded'] || item.content || '',
            categories: item.categories || [],
          };
        });

        cachedFeed = { 
          title: feed.title,
          description: feed.description,
          posts 
        };
        cacheTimestamp = now;
      }

      const post = cachedFeed.posts.find((p: any) => p.slug === slug);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("RSS fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  return httpServer;
}
