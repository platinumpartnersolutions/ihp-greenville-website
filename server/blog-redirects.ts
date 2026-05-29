/**
 * Duplicate blog posts to consolidate.
 * Key  = canonical-less slug path (e.g. "/blog/old-slug")
 * Value = destination URL WITH trailing slash
 *
 * These slugs are filtered out of the static build and receive 301 redirects.
 */
export const BLOG_301S: Record<string, string> = {
  // Prolotherapy — two thin duplicate posts → longer authoritative version
  "/blog/what-is-prolotherapy":   "/blog/what-is-prolotherapy-and-why-does-it-work/",
  "/blog/what-is-prolotherapy-2": "/blog/what-is-prolotherapy-and-why-does-it-work/",

  // Vitamin D — two thin duplicates → original full-length post
  "/blog/vitamin-d-for-health":                            "/blog/vitamin-d/",
  "/blog/how-is-your-vitamin-d-supplement-working-for-you": "/blog/vitamin-d/",
};

export const BLOG_410S = new Set<string>([
  // AI-generated posts — low contentEffort, no clinical voice, placeholder citations
  "/blog/prolotherapy-for-spinal-ligament-tightening-and-spondylolisthesis-reversal",
  "/blog/threat-perception-and-physical-health-how-to-manage-the-feedback-loop",
  "/blog/threat-perception-and-physical-health-managing-the-feedback-loop",
  "/blog/weekly-digestive-health-tips",
  "/blog/weekly-digestive-health-tips-dietary-fiber",
  "/blog/weekly-digestive-health-tips-stress",
  "/blog/weekly-digestive-health-tips-2",
  "/blog/weekly-digestive-health-tips-3",
  "/blog/weekly-digestive-health-tips-4",
  "/blog/weekly-digestive-health-tips-5",
  "/blog/weekly-digestive-health-blog-hydration",
  "/blog/weekly-digestive-health-tips-probiotics",
  "/blog/weekly-product-spotlight",
  "/blog/go-green",
  "/blog/fish-in-a-bowl",
  "/blog/tea-time",
  "/blog/get-out-more",
  "/blog/what-tea-is-right-for-me",
  "/blog/tea-for-brain-health",
  "/blog/nausea-wristband-uses-acupuncture-point",
  "/blog/still-point-inducer",
  "/blog/what-is-in-your-fish-oil",
  "/blog/arsenic-in-rice",
  "/blog/caught-a-cold",
  "/blog/most-important-supplement-fact",
  "/blog/cold-and-flu-season",
  "/blog/health-habit-success",
  "/blog/is-fish-oil-alone-enough",
  "/blog/got-rocks",
]);
