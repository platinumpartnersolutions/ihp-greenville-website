import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Phone } from "lucide-react";
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
  content: string;
  categories: string[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function ArticleSchema({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "datePublished": post.pubDate,
    "dateModified": post.pubDate,
    "author": {
      "@type": "Person",
      "name": post.creator || "Dr. William Hendry"
    },
    "publisher": {
      "@type": "Organization",
      "name": NAP.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${NAP.url}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${NAP.url}/blog/${post.slug}`
    },
    "articleSection": post.categories?.join(", ") || "Health"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog', slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch blog post');
      return res.json();
    },
    enabled: !!slug,
  });

  const breadcrumbItems = [
    { name: "Blog", href: "/blog" },
    { name: post?.title || "Loading...", href: `/blog/${slug}` }
  ];

  const breadcrumbSchema = [
    { name: "Home", url: NAP.url },
    { name: "Blog", url: `${NAP.url}/blog` },
    { name: post?.title || "", url: `${NAP.url}/blog/${slug}` }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-8" />
              <div className="h-10 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/3 mb-8" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
        <NAPFooter />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <h1 className="font-display text-3xl text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog" className="text-primary font-medium hover:underline">
              Back to Blog
            </Link>
          </div>
        </main>
        <NAPFooter />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} | Integrative Health Partners Blog`}
        description={post.excerpt?.substring(0, 160) || `Read ${post.title} on the Integrative Health Partners blog.`}
        canonical={`${NAP.url}/blog/${post.slug}`}
      />
      <OrganizationSchema />
      <BreadcrumbSchema items={breadcrumbSchema} />
      <ArticleSchema post={post} />

      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-24">
          <article className="max-w-4xl mx-auto px-6">
            <Breadcrumbs items={breadcrumbItems} />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="py-12"
            >
              <motion.div variants={fadeInUp}>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-6 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
              </motion.div>

              <motion.header variants={fadeInUp} className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.categories.map((cat, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </motion.header>

              <motion.div 
                variants={fadeInUp}
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-border">
                <div className="bg-primary/5 rounded-2xl p-8">
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Ready to Take the Next Step?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    If you're interested in learning more about how acupuncture and functional medicine 
                    can help you, schedule a consultation with Dr. Hendry today.
                  </p>
                  <a
                    href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-heading font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call {NAP.phone}
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </article>
        </main>

        <NAPFooter />
      </div>
    </>
  );
}
