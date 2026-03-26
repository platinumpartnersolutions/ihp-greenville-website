const { Pool } = require("pg");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows } = await pool.query(`
      SELECT
        slug,
        title,
        excerpt,
        content,
        pub_date,
        link,
        creator AS author,
        categories
      FROM blog_posts
      ORDER BY pub_date DESC NULLS LAST
    `);
    process.stdout.write(JSON.stringify(rows, null, 2));
    process.stderr.write(`\n--- EXPORT SUMMARY: ${rows.length} posts ---\n`);
  } finally {
    await pool.end();
  }
}
main().catch(e => { process.stderr.write(String(e) + "\n"); process.exit(1); });
