import { Pool } from "pg";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BLOG_410S } from "../server/blog-redirects";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_BLOG = path.resolve(__dirname, "../content/blog");

mkdirSync(CONTENT_BLOG, { recursive: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const result = await pool.query<{
  slug: string; title: string; link: string; pub_date: Date;
  creator: string; excerpt: string; content: string; categories: string[];
}>(`SELECT slug, title, link, pub_date, creator, excerpt, content, categories
    FROM blog_posts ORDER BY pub_date DESC`);

await pool.end();

let written = 0;
let skipped = 0;

for (const row of result.rows) {
  if (BLOG_410S.has(`/blog/${row.slug}`)) { skipped++; continue; }
  const json = JSON.stringify({
    slug:       row.slug,
    title:      row.title,
    link:       row.link || "",
    pubDate:    row.pub_date instanceof Date ? row.pub_date.toISOString() : row.pub_date,
    creator:    row.creator || "Integrative Health Partners",
    excerpt:    row.excerpt || "",
    content:    row.content || "",
    categories: row.categories || [],
  }, null, 2);
  writeFileSync(path.join(CONTENT_BLOG, `${row.slug}.json`), json, "utf8");
  written++;
}

console.log(`✓ Exported ${written} blog posts (${skipped} skipped — BLOG_410S)`);
console.log(`  Files written to: ${CONTENT_BLOG}`);
