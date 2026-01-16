import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Phone, ChevronRight, MapPin, Clock, Star, CheckCircle } from "lucide-react";
import { getServiceBySlug, getCategoryBySlug, NAP, categories } from "@/data/services";
import { Navigation } from "@/components/Navigation";
import { NAPFooter } from "@/components/NAPFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { OrganizationSchema, BreadcrumbSchema, ServiceSchema, FAQSchema } from "@/components/SchemaMarkup";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } }
};

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const service = getServiceBySlug(slug || "");
  const category = service ? getCategoryBySlug(service.categorySlug) : undefined;

  if (!service || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Service not found</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: category.name, href: `/services/${category.slug}` },
    { name: service.name, href: `/services/${service.slug}` }
  ];

  const breadcrumbSchema = [
    { name: "Home", url: NAP.url },
    { name: category.name, url: `${NAP.url}/services/${category.slug}` },
    { name: service.name, url: `${NAP.url}/services/${service.slug}` }
  ];

  const placeholderFAQs = [
    {
      question: `What is ${service.name.toLowerCase()} and how can it help me?`,
      answer: `${service.name} is a specialized treatment offered at our Greenville clinic. Dr. William Hendry uses this approach to address the underlying causes of your health concerns, providing personalized care based on your unique needs.`
    },
    {
      question: `How long does a ${service.name.toLowerCase()} session take?`,
      answer: `Treatment sessions typically last 45-60 minutes, though your first visit may be longer to allow for a comprehensive evaluation. Dr. Hendry will discuss your specific treatment plan during your consultation.`
    },
    {
      question: `Is ${service.name.toLowerCase()} safe?`,
      answer: `Yes, when performed by a qualified practitioner like Dr. Hendry, ${service.name.toLowerCase()} is very safe. Dr. Hendry is board-certified and maintains hospital privileges at Prisma Health, ensuring the highest standards of care.`
    }
  ];

  const relatedServices = category.services
    .filter(s => s.slug !== service.slug)
    .slice(0, 6);

  const generateNaturalH1 = () => {
    return `${service.name} in Greenville, SC`;
  };

  return (
    <>
      <SEOHead
        title={service.metaTitle}
        description={service.metaDescription}
        canonical={`${NAP.url}/services/${service.slug}`}
      />
      <OrganizationSchema />
      <BreadcrumbSchema items={breadcrumbSchema} />
      <ServiceSchema service={service} category={category} />
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
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <motion.div variants={fadeInUp} className="mb-8">
                    <Link
                      href={`/services/${category.slug}`}
                      className="inline-flex items-center gap-1 text-primary text-sm font-medium mb-4 hover:underline"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to {category.name} services
                    </Link>
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-4 md:mb-6">
                      {generateNaturalH1()}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                        ))}
                        <span className="ml-1">5.0 Rating</span>
                      </div>
                      <span>•</span>
                      <span>25+ Years Experience</span>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="prose prose-lg max-w-none mb-12">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      [Placeholder: Introduction to {service.name} services in Greenville. This content should 
                      explain what the treatment is, who it's for, and the benefits patients can expect. 
                      Include natural mentions of Greenville, SC throughout.]
                    </p>

                    <h2>What is {service.name}?</h2>
                    <p>
                      [Placeholder: Detailed explanation of {service.name}. Describe the treatment process, 
                      the conditions it addresses, and how Dr. Hendry's approach differs from typical care. 
                      This section should be comprehensive and include relevant keywords naturally.]
                    </p>

                    <h2>Benefits of {service.name}</h2>
                    <ul>
                      <li>[Placeholder: Benefit 1 - Specific outcome patients can expect]</li>
                      <li>[Placeholder: Benefit 2 - How it improves quality of life]</li>
                      <li>[Placeholder: Benefit 3 - Long-term health advantages]</li>
                      <li>[Placeholder: Benefit 4 - Why this approach is effective]</li>
                    </ul>

                    <h2>What to Expect During Your Visit</h2>
                    <p>
                      [Placeholder: Walk patients through the experience of receiving {service.name} at 
                      Integrative Health Partners. Include details about the initial consultation, 
                      treatment process, and follow-up care.]
                    </p>

                    <h2>Why Choose Dr. Hendry for {service.name} in Greenville?</h2>
                    <p>
                      [Placeholder: Highlight Dr. Hendry's qualifications, experience, and unique approach. 
                      Mention his 25+ years of experience, board certification, and hospital privileges at 
                      Prisma Health. Include a natural link back to{" "}
                      <Link href={`/services/${category.slug}`} className="text-primary hover:underline">
                        our {category.name.toLowerCase()} services
                      </Link>.]
                    </p>
                  </motion.div>

                  <motion.section variants={fadeInUp} className="mb-12">
                    <h2 className="font-display text-2xl text-foreground mb-6">
                      Frequently Asked Questions About {service.name}
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

                  <motion.section variants={fadeInUp} className="mb-12">
                    <h2 className="font-display text-2xl text-foreground mb-6">
                      Related {category.name} Services
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {relatedServices.map(relatedService => (
                        <Link
                          key={relatedService.slug}
                          href={`/services/${relatedService.slug}`}
                          className="block bg-card rounded-xl p-4 border border-border hover:border-primary/20 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                              {relatedService.name}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/services/${category.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-medium mt-6 hover:underline"
                    >
                      View all {category.name.toLowerCase()} services
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </motion.section>
                </div>

                <div className="lg:col-span-1">
                  <motion.div variants={fadeInUp} className="lg:sticky lg:top-28 space-y-4 md:space-y-6">
                    <div className="bg-primary text-white rounded-2xl p-5 md:p-6">
                      <h3 className="font-heading font-semibold text-xl mb-4">
                        Schedule Your Consultation
                      </h3>
                      <p className="text-white/80 text-sm mb-6">
                        Ready to experience {service.name.toLowerCase()} in Greenville? 
                        Call us today to schedule your appointment with Dr. Hendry.
                      </p>
                      <a
                        href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                        className="flex items-center justify-center gap-2 bg-white text-primary px-5 sm:px-6 py-3 rounded-full font-heading font-semibold w-full hover:bg-white/90 transition-colors min-h-[48px]"
                      >
                        <Phone className="w-5 h-5" />
                        {NAP.phone}
                      </a>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <h3 className="font-heading font-semibold mb-4">
                        Visit Our Greenville Clinic
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <p>
                            {NAP.streetAddress}<br />
                            {NAP.city}, {NAP.state} {NAP.postalCode}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                          <p>Mon - Fri: 9AM - 5PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <h3 className="font-heading font-semibold mb-4">
                        Why Patients Choose Us
                      </h3>
                      <div className="space-y-3">
                        {[
                          "25+ years of experience",
                          "Board-certified practitioner",
                          "Hospital privileges at Prisma Health",
                          "Personalized treatment plans",
                          "5.0 star Google rating"
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <h3 className="font-heading font-semibold mb-4">
                        Explore Other Categories
                      </h3>
                      <div className="space-y-2">
                        {categories.filter(c => c.slug !== category.slug).map(cat => (
                          <Link
                            key={cat.slug}
                            href={`/services/${cat.slug}`}
                            className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                          >
                            {cat.name} →
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <NAPFooter />
      </div>
    </>
  );
}
