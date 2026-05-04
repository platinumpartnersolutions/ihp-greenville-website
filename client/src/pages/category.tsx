import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Phone, ChevronRight, MapPin, Clock, Star, Navigation as NavigationIcon } from "lucide-react";
import { getCategoryBySlug, NAP, categories } from "@/data/services";
import { Navigation } from "@/components/Navigation";
import { NAPFooter } from "@/components/NAPFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { OrganizationSchema, BreadcrumbSchema, FAQSchema } from "@/components/SchemaMarkup";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } }
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Category not found</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: "Services", href: "/#services" },
    { name: category.name, href: `/services/${category.slug}` }
  ];

  const breadcrumbSchema = [
    { name: "Home", url: NAP.url },
    { name: category.name, url: `${NAP.url}/services/${category.slug}` }
  ];

  const placeholderFAQs = [
    {
      question: `What ${category.name.toLowerCase()} services do you offer in Greenville, SC?`,
      answer: `At Integrative Health Partners, we offer comprehensive ${category.name.toLowerCase()} services including ${category.services.slice(0, 3).map(s => s.name.toLowerCase()).join(", ")}, and more. Dr. William Hendry has over 25 years of experience providing these treatments in Greenville.`
    },
    {
      question: `How do I schedule an appointment for ${category.name.toLowerCase()} services?`,
      answer: `You can schedule an appointment by calling our office at ${NAP.phone}. We're located at ${NAP.streetAddress}, ${NAP.city}, ${NAP.state} ${NAP.postalCode}.`
    },
    {
      question: `What should I expect during my first ${category.name.toLowerCase()} visit?`,
      answer: `Your first visit typically lasts 60-90 minutes and includes a comprehensive health history review, examination, and personalized treatment plan. Dr. Hendry takes time to understand your unique health concerns.`
    }
  ];

  const generateNaturalH1 = () => {
    if (category.isPrimary) {
      return `Trusted Acupuncturist in Greenville, SC`;
    }
    switch (category.slug) {
      case "acupuncture-clinic-greenville-sc":
        return `Greenville's Premier Acupuncture Clinic`;
      case "chinese-medicine-clinic-greenville-sc":
        return `Authentic Chinese Medicine Clinic in Greenville`;
      case "functional-medicine-greenville-sc":
        return `Functional Medicine Practitioner in Greenville, SC`;
      default:
        return `${category.name} in Greenville, SC`;
    }
  };

  const generateIntroText = () => {
    if (category.isPrimary) {
      return `Looking for an experienced acupuncturist in Greenville? Dr. William Hendry brings over 25 years of expertise in acupuncture and needle-based therapies to help you find lasting relief and restored wellness.`;
    }
    switch (category.slug) {
      case "acupuncture-clinic-greenville-sc":
        return `Our acupuncture clinic in Greenville specializes in treating pain conditions, injuries, and musculoskeletal issues. Whether you're dealing with chronic back pain or recovering from a sports injury, we provide targeted treatments that address the root cause.`;
      case "chinese-medicine-clinic-greenville-sc":
        return `Experience authentic Traditional Chinese Medicine in Greenville. From cupping and gua sha to custom herbal formulations, our Chinese medicine clinic offers time-tested therapies backed by modern understanding.`;
      case "functional-medicine-greenville-sc":
        return `As a functional medicine practitioner in Greenville, Dr. Hendry uses advanced lab diagnostics to identify the root causes of chronic illness, hormone imbalance, digestive disorders, and fatigue — then builds personalized treatment plans that actually resolve the underlying problem.`;
      default:
        return `Discover our comprehensive ${category.name.toLowerCase()} services in Greenville, SC.`;
    }
  };

  return (
    <>
      <SEOHead
        title={category.metaTitle}
        description={category.metaDescription}
        canonical={`${NAP.url}/services/${category.slug}`}
      />
      <OrganizationSchema />
      <BreadcrumbSchema items={breadcrumbSchema} />
      <FAQSchema faqs={placeholderFAQs} />

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
                {category.isPrimary && (
                  <span className="inline-block bg-primary/10 text-primary font-heading text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Primary Service
                  </span>
                )}
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-tight mb-4 md:mb-6">
                  {generateNaturalH1()}
                </h1>
                <p className="font-sans text-lg text-muted-foreground leading-relaxed">
                  {generateIntroText()}
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-16">
                <a
                  href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 sm:px-6 py-3 rounded-full font-heading font-semibold shadow-lg hover:shadow-xl transition-all min-h-[48px] text-sm sm:text-base"
                >
                  <Phone className="w-5 h-5" />
                  Schedule Your Consultation
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <span className="text-sm">5.0 on Google</span>
                </div>
              </motion.div>

              <motion.section variants={fadeInUp} className="mb-16">
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
                  Our {category.name} Services
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.services.map((service, index) => (
                    <motion.div
                      key={service.slug}
                      variants={fadeInUp}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Link
                        href={`/services/${service.slug}`}
                        className="block bg-card rounded-xl p-5 border border-transparent hover:border-primary/20 hover:shadow-lg transition-all"
                        data-testid={`link-service-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                            {service.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={fadeInUp} className="bg-card rounded-2xl p-5 sm:p-8 md:p-12 mb-12 md:mb-16">
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
                  Why Choose Our {category.name} Services in Greenville?
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p>
                    [Placeholder: Detailed content about why patients should choose your {category.name.toLowerCase()} services. 
                    This section should include natural internal links to specific services mentioned in the content, 
                    using varied anchor text that describes the destination page.]
                  </p>
                  <p>
                    At Integrative Health Partners, Dr. William Hendry combines 25+ years of clinical experience with 
                    a personalized approach to each patient. Whether you're seeking relief from chronic conditions or 
                    looking to optimize your overall health, our {category.name.toLowerCase()} services are designed 
                    to address the root cause, not just mask symptoms.
                  </p>
                  <p>
                    [Placeholder: Additional content with embedded links to services like{" "}
                    {category.services.slice(0, 3).map((s, i) => (
                      <span key={s.slug}>
                        <Link href={`/services/${s.slug}`} className="text-primary hover:underline">
                          {s.name.toLowerCase()} treatment options
                        </Link>
                        {i < 2 ? ", " : ""}
                      </span>
                    ))}
                    , and more.]
                  </p>
                </div>
              </motion.section>

              <motion.section variants={fadeInUp} className="mb-16">
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {placeholderFAQs.map((faq, index) => (
                    <div key={index} className="bg-card rounded-xl p-6 border border-border">
                      <h3 className="font-heading font-semibold text-foreground mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={fadeInUp} className="bg-primary/5 rounded-2xl p-5 sm:p-8 md:p-12 mb-12 md:mb-16">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                      Visit Our Greenville Clinic
                    </h2>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                        <p>
                          {NAP.streetAddress}<br />
                          {NAP.city}, {NAP.state} {NAP.postalCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                        <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                        <a href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`} className="text-primary hover:underline font-medium">
                          {NAP.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="rounded-xl overflow-hidden h-64 shadow-lg">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3278.8897307449716!2d-82.38456492408577!3d34.86225437286937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88582ccc33ed5c35%3A0x1b4fdd2a2f7c50e5!2sIntegrative%20Health%20Partners!5e0!3m2!1sen!2sus!4v1704912345678!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Integrative Health Partners Location"
                      />
                    </div>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=319+Wade+Hampton+Blvd+Suite+A+Greenville+SC+29609"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-heading font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
                      data-testid="button-get-directions"
                    >
                      <NavigationIcon className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={fadeInUp} className="mb-16">
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
                  Explore Our Other Services
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {categories.filter(c => c.slug !== category.slug).map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/services/${cat.slug}`}
                      className="block bg-card rounded-xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all group"
                    >
                      <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {cat.name} Services
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {cat.services.length} services available
                      </p>
                      <span className="text-primary text-sm font-medium flex items-center gap-1">
                        View services <ChevronRight className="w-4 h-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          </div>
        </main>

        <NAPFooter />
      </div>
    </>
  );
}
