import { users, blogPosts, type User, type InsertUser, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  upsertBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  syncBlogPosts(posts: InsertBlogPost[]): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.pubDate));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async upsertBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [upserted] = await db
      .insert(blogPosts)
      .values(post)
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          title: post.title,
          link: post.link,
          pubDate: post.pubDate,
          creator: post.creator,
          excerpt: post.excerpt,
          content: post.content,
          categories: post.categories,
        },
      })
      .returning();
    return upserted;
  }

  async syncBlogPosts(posts: InsertBlogPost[]): Promise<number> {
    let syncedCount = 0;
    for (const post of posts) {
      await this.upsertBlogPost(post);
      syncedCount++;
    }
    return syncedCount;
  }
}

export const storage = new DatabaseStorage();
