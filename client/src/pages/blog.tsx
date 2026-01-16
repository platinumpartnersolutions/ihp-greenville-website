import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, ChevronRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { NAPFooter } from "@/components/NAPFooter";
import { SEOHead } from "@/components/SEOHead";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/SchemaMarkup";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NAP } from "@/data/services";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

interface BlogPost {
  title: string;
  slug: string;
  link: string;
  pubDate: string;
  creator: string;
  excerpt: string;
  categories: string[];
}

interface BlogFeed {
  title: string;
  description: string;
  posts: BlogPost[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export default function BlogPage() {
  const { data, isLoading, error } = useQuery<BlogFeed>({
    queryKey: ['/api/blog'],
    queryFn: async () => {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      return res.json();
    },
  });

  const breadcrumbItems = [
    { name: "Blog", href: "/blog" }
  ];

  const breadcrumbSchema = [
    { name: "Home", url: NAP.url },
    { name: "Blog", url: `${NAP.url}/blog` }
  ];

  return (
    <>
      <SEOHead
        title="Health & Wellness Blog | Integrative Health Partners"
        description="Explore articles about acupuncture, functional medicine, Chinese medicine, and holistic health from Dr. William Hendry in Greenville, SC."
        canonical={`${NAP.url}/blog`}
      />
      <OrganizationSchema />
      <BreadcrumbSchema items={breadcrumbSchema} />

      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Breadcrumbs items={breadcrumbItems} />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="py-12"
            >
              <motion.div variants={fadeInUp} className="max-w-3xl mb-12">
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-tight mb-4 md:mb-6">
                  Health & Wellness Blog
                </h1>
                <p className="font-sans text-lg text-muted-foreground leading-relaxed">
                  Insights on acupuncture, functional medicine, and natural health from Dr. William Hendry 
                  and the team at Integrative Health Partners in Greenville, SC.
                </p>
              </motion.div>

              {isLoading && (
                <motion.div variants={fadeInUp} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                      <div className="h-6 bg-muted rounded w-full mb-3" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </motion.div>
              )}

              {error && (
                <motion.div variants={fadeInUp} className="bg-destructive/10 text-destructive rounded-xl p-6">
                  <p>Unable to load blog posts. Please try again later.</p>
                </motion.div>
              )}

              {data && data.posts && (
                <motion.div 
                  variants={stagger}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {data.posts.map((post, index) => (
                    <motion.article
                      key={post.slug}
                      variants={fadeInUp}
                      className="group"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block bg-card rounded-2xl p-5 sm:p-6 border border-transparent hover:border-primary/20 hover:shadow-xl transition-all h-full"
                        data-testid={`link-blog-post-${index}`}
                      >
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.pubDate)}
                          </span>
                          {post.creator && (
                            <span className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              {post.creator}
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                          {stripHtml(post.excerpt)}
                        </p>

                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.categories.slice(0, 3).map((cat, i) => (
                              <span 
                                key={i} 
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="w-4 h-4" />
                        </span>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              )}

              {data && (!data.posts || data.posts.length === 0) && (
                <motion.div variants={fadeInUp} className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No blog posts available yet.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>

        <NAPFooter />
      </div>
    </>
  );
}
