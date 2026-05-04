import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Phone, Star, ChevronLeft, ChevronRight, Leaf, Heart, Zap, Droplets, Flame, Sparkles, MapPin, Mail, ArrowRight, Navigation as NavigationIcon } from "lucide-react";
import heroVideo from "@assets/Untitled_design_1768148669244.mp4";
import doctorImage from "@assets/take_this_small_blurry_photograph_and_create_1768153917878.jpg";
import { Navigation } from "@/components/Navigation";
import { NAPFooter } from "@/components/NAPFooter";
import { LocalBusinessSchema, PhysicianSchema, FAQSchema } from "@/components/SchemaMarkup";
import { CredentialsBadge, CredentialSchema } from "@/components/CredentialsBadge";
import { categories, NAP } from "@/data/services";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const homeServices = [
  { icon: Sparkles, title: "Functional Medicine", link: "/services/functional-medicine-greenville-sc", description: "Root cause diagnostics with advanced lab testing and 90-minute initial consultations. Find out why your body isn't functioning — not just what to mask." },
  { icon: Zap, title: "Injection Therapy", link: "/services/biopuncture-therapy-greenville-sc", description: "Prolotherapy and biopuncture for joint pain, ligament injuries, and chronic musculoskeletal conditions. Regenerative, non-surgical alternatives." },
  { icon: Leaf, title: "Acupuncture", link: "/services/acupuncture-therapy-greenville-sc", description: "25+ years of expertise combining traditional Chinese acupuncture with modern evidence-based practice for pain, stress, and systemic conditions." },
  { icon: Heart, title: "Pain Treatment", link: "/services/acupuncture-clinic-greenville-sc", description: "Integrative care for back pain, sciatica, sports injuries, and chronic pain — using acupuncture, dry needling, and injection therapy together." },
  { icon: Flame, title: "Chinese Medicine", link: "/services/chinese-medicine-clinic-greenville-sc", description: "Cupping, Chinese herbal formulas, moxibustion, and traditional TCM therapies." },
  { icon: Droplets, title: "Ozone & Detox", link: "/services/ozone-therapy-greenville-sc", description: "Ozone therapy, infrared sauna, and natural detoxification protocols supporting immune and metabolic health." }
];

const testimonials = [
  { name: "Sarah M.", text: "After years of unexplained fatigue, Dr. Hendry finally found the root cause. I feel like myself again for the first time in a decade.", rating: 5 },
  { name: "James L.", text: "The personalized approach here is unlike anything I've experienced. They actually listen and create a plan that works for YOUR body.", rating: 5 },
  { name: "Michelle R.", text: "I was skeptical of acupuncture, but after just a few sessions my chronic back pain has improved dramatically. Life-changing.", rating: 5 }
];

const homeFaqs = [
  {
    question: "What is functional medicine and how is it different from conventional medicine?",
    answer: "Functional medicine identifies the root cause of your symptoms rather than just treating them. Dr. Hendry uses advanced lab testing — hormones, gut microbiome, inflammatory markers, nutrient panels — to build a complete picture of why your body is struggling. Initial consultations are 90 minutes to allow for thorough evaluation."
  },
  {
    question: "What conditions does injection therapy (prolotherapy and biopuncture) treat?",
    answer: "Prolotherapy and biopuncture treat chronic joint pain, ligament laxity, tendon injuries, low back pain, knee pain, shoulder injuries, and sports injuries. Prolotherapy uses dextrose injections to stimulate connective tissue repair. Biopuncture uses homeopathic injectables for localized anti-inflammatory effects. Both are non-surgical and performed by Dr. Hendry, who holds Injection Therapy certification."
  },
  {
    question: "How do I schedule a consultation with Dr. Hendry in Greenville, SC?",
    answer: `Call us at ${NAP.phone} to schedule your consultation. We're located at ${NAP.streetAddress}, ${NAP.city}, ${NAP.state} ${NAP.postalCode}, with ample free parking just east of downtown Greenville. Dr. Hendry sees patients Monday through Friday.`
  }
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-x-hidden" itemScope itemType="https://schema.org/MedicalBusiness">
      <LocalBusinessSchema aggregateRating={{ ratingValue: "5.0", reviewCount: "19" }} />
      <PhysicianSchema />
      <FAQSchema faqs={homeFaqs} />
      <CredentialSchema />

      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden" aria-label="Hero section">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            <motion.h1
              variants={fadeInUp}
              className="font-heading text-white text-lg md:text-xl tracking-wide"
              itemProp="name"
            >
              Functional Medicine &amp; Injection Therapy in Greenville, SC
            </motion.h1>

            <motion.h2
              variants={fadeInUp}
              className="font-display text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[1.1] text-balance"
            >
              Restore Your Body to <span className="italic text-secondary">Optimum</span> Health
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="font-sans text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-2"
              itemProp="description"
            >
              Dr. William Hendry combines 25+ years of acupuncture expertise with functional medicine 
              to uncover the root cause of your symptoms and restore optimum health.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 text-white/90">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>
              <span className="font-heading text-sm font-medium ml-2">5.0 Star Rating on Google</span>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.a
                href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-heading font-semibold text-sm sm:text-base shadow-2xl hover:shadow-primary/25 transition-all min-h-[48px]"
                data-testid="button-schedule"
              >
                <Phone className="w-5 h-5" />
                Schedule Consultation
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Category Links Section - Primary Navigation */}
      <section className="py-12 md:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeInUp} className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-4">
              Our Specialties
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl text-foreground">
              Comprehensive Care in Greenville
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((category, index) => (
              <motion.div key={category.slug} variants={fadeInUp}>
                <Link
                  href={`/services/${category.slug}`}
                  className="block bg-background rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 group h-full"
                  data-testid={`link-category-${index}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-block text-xs font-heading font-semibold px-3 py-1 rounded-full ${
                      category.isPrimary ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {category.isPrimary ? "Primary" : "Secondary"}
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {category.name} Services
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.services.length} specialized services
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {category.slug === "acupuncturist-greenville-sc" && "Needle-based treatments, traditional and modern acupuncture techniques"}
                    {category.slug === "acupuncture-clinic-greenville-sc" && "Pain conditions, injuries, and musculoskeletal treatments"}
                    {category.slug === "chinese-medicine-clinic-greenville-sc" && "TCM modalities, herbal medicine, and holistic therapies"}
                    {category.slug === "functional-medicine-greenville-sc" && "Functional medicine, injection therapy, and integrative diagnostics"}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section id="approach" className="py-16 md:py-24 lg:py-32 bg-background" aria-labelledby="approach-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="space-y-6 md:space-y-8">
              <div>
                <p className="font-heading text-primary text-xs sm:text-sm tracking-[0.2em] uppercase mb-3 md:mb-4">Our Philosophy</p>
                <h2 id="approach-heading" className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight">
                  Medicine Should <span className="italic text-primary">Restore</span>, Not Just Mask
                </h2>
              </div>
              <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                The highest purpose of medicine should be to restore your body to optimum function, 
                not just mask symptoms. Eastern traditions have long operated from this position—now 
                this idea is gaining ground in the West as Functional Medicine.
              </p>
              <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                At Integrative Health Partners, we integrate the best of science and tradition. Whether you need{" "}
                <a href="/services/functional-medicine-consultation/" className="text-primary hover:underline">
                  functional medicine testing
                </a>,{" "}
                <a href="/services/prolotherapy/" className="text-primary hover:underline">
                  injection therapy for joint pain
                </a>, or{" "}
                <a href="/services/acupuncture-therapy/" className="text-primary hover:underline">
                  acupuncture for chronic conditions
                </a>, Dr. Hendry's personalized approach helps you restore and maintain optimum health.
              </p>
              <a
                href="/services/functional-medicine-consultation/"
                className="font-heading text-primary font-semibold flex items-center gap-2 group"
                data-testid="button-explore-services"
              >
                Explore functional medicine &amp; injection therapy
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-8 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-2xl text-foreground">Finding Your Root Cause</p>
                    <p className="font-sans text-muted-foreground">is Personal</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="font-heading text-3xl font-bold text-primary">25+</p>
                      <p className="font-sans text-sm text-muted-foreground">Years Experience</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="font-heading text-3xl font-bold text-secondary">130+</p>
                      <p className="font-sans text-sm text-muted-foreground">Services Offered</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section id="services" className="py-16 md:py-24 lg:py-32 bg-card" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-4">
              What We Offer
            </motion.p>
            <motion.h2 id="services-heading" variants={fadeInUp} className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground">
              Integrative Medicine & Wellness Services in Greenville
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {homeServices.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <Link
                  href={service.link}
                  className="block bg-background rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 h-full"
                  data-testid={`card-service-${index}`}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Link
              href="/services/acupuncturist-greenville-sc"
              className="inline-flex items-center gap-2 text-primary font-heading font-semibold hover:underline"
            >
              View all 130+ services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quality Nodes — Deep Topical Authority Links */}
      <section className="py-12 md:py-16 bg-background border-t border-border" aria-label="Conditions and conditions we treat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-8"
          >
            <motion.p variants={fadeInUp} className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-3">
              Conditions We Treat
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-2xl md:text-3xl text-foreground">
              Integrative Care for Complex Health Challenges
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Pain & Musculoskeletal Conditions", sub: "Back pain, sciatica, fibromyalgia, arthritis", href: "/conditions/pain-and-musculoskeletal/" },
              { label: "Neurological & Mental Health", sub: "Anxiety, depression, brain fog, insomnia, PTSD", href: "/conditions/neurological-mental-health/" },
              { label: "Hormonal & Women's Health", sub: "PCOS, fertility, menopause, hormone imbalance", href: "/conditions/hormonal-womens-health/" },
              { label: "Digestive & Immune Health", sub: "IBS, Crohn's, leaky gut, chronic infections", href: "/conditions/digestive-immune/" },
            ].map((node) => (
              <motion.div key={node.href} variants={fadeInUp}>
                <a
                  href={node.href}
                  className="block bg-card rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary/20 group h-full"
                >
                  <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {node.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{node.sub}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-heading font-medium mt-3 group-hover:underline">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Provider Section */}
      <section id="provider" className="py-16 md:py-24 lg:py-32 bg-background" aria-labelledby="provider-heading" itemScope itemType="https://schema.org/Physician">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="order-2 md:order-1">
              <p className="font-heading text-primary text-xs sm:text-sm tracking-[0.2em] uppercase mb-3 md:mb-4">Functional Medicine &amp; Integrative Health, Greenville SC</p>
              <h2 id="provider-heading" className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 md:mb-6" itemProp="name">
                Dr. William Hendry
              </h2>
              <div className="space-y-3 md:space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed" itemProp="description">
                <p>
                  Dr. William Hendry holds a <span itemProp="qualifications">Doctor of Acupuncture and Oriental Medicine degree</span>, 
                  is nationally board-certified, and maintains active hospital privileges at <span itemProp="memberOf">Prisma Health</span>.
                </p>
                <p>
                  With over 25 years of clinical experience, Dr. Hendry specializes in{" "}
                  <a href="/services/functional-medicine-consultation/" className="text-primary hover:underline">
                    functional medicine
                  </a>{" "}and{" "}
                  <a href="/services/prolotherapy/" className="text-primary hover:underline">
                    injection therapy
                  </a>{" "}— identifying the root cause of chronic illness and pain through advanced diagnostics and regenerative treatments.
                </p>
                <p>
                  He also brings 25+ years of acupuncture and Chinese medicine expertise, making Integrative Health Partners uniquely positioned to address complex, multi-system health problems that conventional medicine hasn't resolved.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="bg-card rounded-lg px-4 py-2 shadow-sm">
                  <p className="font-heading text-sm font-semibold text-foreground">Board Certified</p>
                </div>
                <div className="bg-card rounded-lg px-4 py-2 shadow-sm">
                  <p className="font-heading text-sm font-semibold text-foreground">Prisma Health Privileges</p>
                </div>
                <div className="bg-card rounded-lg px-4 py-2 shadow-sm">
                  <p className="font-heading text-sm font-semibold text-foreground">25+ Years Experience</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={doctorImage}
                    alt="Dr. William Hendry, Doctor of Acupuncture and Oriental Medicine at Integrative Health Partners in Greenville, SC"
                    className="w-full h-full object-cover"
                    itemProp="image"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary text-white rounded-2xl p-6 shadow-xl">
                  <p className="font-heading font-bold text-2xl">DAOM</p>
                  <p className="font-sans text-sm text-white/80">Doctor of Acupuncture<br />& Oriental Medicine</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mt-16"
          >
            <CredentialsBadge />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-primary text-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeInUp} className="font-heading text-secondary text-sm tracking-[0.2em] uppercase mb-4">
              Patient Stories
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-4xl md:text-5xl mb-16">
              What Our Greenville Patients Say
            </motion.h2>

            <motion.div variants={fadeInUp} className="relative min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <blockquote className="font-display text-2xl md:text-3xl italic leading-relaxed mb-6">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <p className="font-heading font-semibold text-lg">
                    {testimonials[currentTestimonial].name}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-3 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                data-testid="button-prev-testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentTestimonial ? "bg-secondary w-6" : "bg-white/30"
                    }`}
                    data-testid={`button-testimonial-dot-${i}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="p-3 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                data-testid="button-next-testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-card" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid lg:grid-cols-2 gap-16"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <div>
                <p className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-4">Get In Touch</p>
                <h2 id="contact-heading" className="font-display text-4xl md:text-5xl text-foreground mb-6">
                  Visit Our Greenville Integrative Health Clinic
                </h2>
                <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                  Centrally located with ample free parking. We're just a few minutes east of downtown, 
                  conveniently close to Bob Jones University and easy to reach from North Main, 
                  Overbrook, and Northwood Hills.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <p className="font-heading font-semibold text-foreground mb-1">Address</p>
                    <p className="font-sans text-muted-foreground">
                      <span itemProp="streetAddress">{NAP.streetAddress}</span><br />
                      <span itemProp="addressLocality">{NAP.city}</span>, <span itemProp="addressRegion">{NAP.state}</span> <span itemProp="postalCode">{NAP.postalCode}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground mb-1">Phone</p>
                    <a
                      href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                      className="font-sans text-primary hover:underline"
                      data-testid="link-phone"
                      itemProp="telephone"
                    >
                      {NAP.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${NAP.email}`}
                      className="font-sans text-primary hover:underline"
                      data-testid="link-email"
                      itemProp="email"
                    >
                      {NAP.email}
                    </a>
                  </div>
                </div>
              </div>

              <motion.a
                href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-heading font-semibold shadow-lg hover:shadow-xl transition-shadow"
                data-testid="button-contact-call"
              >
                <Phone className="w-5 h-5" />
                Schedule Your Consultation
              </motion.a>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col">
              <div className="rounded-3xl overflow-hidden shadow-xl h-[400px] lg:h-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3278.8897307449716!2d-82.38456492408577!3d34.86225437286937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88582ccc33ed5c35%3A0x1b4fdd2a2f7c50e5!2sIntegrative%20Health%20Partners!5e0!3m2!1sen!2sus!4v1704912345678!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
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
                className="mt-4 inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-heading font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
                data-testid="button-get-directions"
              >
                <NavigationIcon className="w-5 h-5" />
                Get Directions
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <NAPFooter />
    </div>
  );
}
