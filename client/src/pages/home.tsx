import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, MapPin, Star, ChevronLeft, ChevronRight, Leaf, Heart, Zap, Droplets, Flame, Sparkles } from "lucide-react";
import heroVideo from "@assets/Untitled_design_1768148669244.mp4";
import doctorImage from "@assets/take_this_small_blurry_photograph_and_create_1768153917878.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const services = [
  { icon: Leaf, title: "Integrative Functional Medicine", description: "Find the root cause of your symptoms with personalized, evidence-based care that treats the whole person." },
  { icon: Heart, title: "Acupuncture", description: "25 years of expertise combining traditional Chinese methods with modern understanding for lasting relief." },
  { icon: Zap, title: "Dry Needling Therapy", description: "Target specific trigger points to release chronic muscle tension and restore normal movement patterns." },
  { icon: Sparkles, title: "Electroacupuncture", description: "Enhanced technique with therapeutic electrical frequencies for faster, longer-lasting pain relief." },
  { icon: Droplets, title: "Acupuncture Injection Therapy", description: "Combines acupuncture precision with therapeutic injections for severe pain and chronic illness." },
  { icon: Flame, title: "Ozone Sauna Therapy", description: "Boost immune function, enhance detoxification, and accelerate recovery with medical-grade ozone protocols." }
];

const testimonials = [
  { name: "Sarah M.", text: "After years of unexplained fatigue, Dr. Hendry finally found the root cause. I feel like myself again for the first time in a decade.", rating: 5 },
  { name: "James L.", text: "The personalized approach here is unlike anything I've experienced. They actually listen and create a plan that works for YOUR body.", rating: 5 },
  { name: "Michelle R.", text: "I was skeptical of acupuncture, but after just a few sessions my chronic back pain has improved dramatically. Life-changing.", rating: 5 }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-x-hidden" itemScope itemType="https://schema.org/MedicalBusiness">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.a
            href="#"
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            data-testid="link-home"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">ihp</span>
            </div>
            <span className={`font-heading font-semibold text-lg hidden sm:block transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>
              Integrative Health Partners
            </span>
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {["Services", "Approach", "Provider", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`font-heading text-sm font-medium tracking-wide transition-all hover:text-primary ${
                  scrolled ? "text-foreground" : "text-white"
                }`}
                data-testid={`link-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
            <motion.a
              href="tel:8643656156"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-heading text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
              data-testid="button-call"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </motion.a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-foreground" : "text-white"}`}
            data-testid="button-menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/10"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {["Services", "Approach", "Provider", "Contact"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="font-heading text-base font-medium text-foreground py-2 text-left hover:text-primary transition-colors"
                    data-testid={`link-mobile-${item.toLowerCase()}`}
                  >
                    {item}
                  </button>
                ))}
                <a
                  href="tel:8643656156"
                  className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-heading text-sm font-semibold justify-center mt-2"
                  data-testid="button-mobile-call"
                >
                  <Phone className="w-4 h-4" />
                  (864) 365-6156
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden" aria-label="Hero section">
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

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            <motion.p
              variants={fadeInUp}
              className="font-heading text-secondary text-sm md:text-base tracking-[0.3em] uppercase"
            >
              Greenville, South Carolina
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="font-display text-white text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] text-balance"
              itemProp="description"
            >
              Restore Your Body to{" "}
              <span className="italic text-secondary">Optimum</span> Function
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="font-sans text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Integrative Functional Medicine combines the best of Eastern tradition 
              and Western science to uncover the root cause of your symptoms.
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection("contact")}
                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-heading font-semibold text-base shadow-2xl hover:shadow-primary/25 transition-all"
                data-testid="button-schedule"
              >
                Schedule Consultation
              </motion.button>
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

      {/* Approach Section */}
      <section id="approach" className="py-24 md:py-32 bg-card noise" aria-labelledby="approach-heading">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <div>
                <p className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-4">Our Philosophy</p>
                <h2 id="approach-heading" className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                  Medicine Should <span className="italic text-primary">Restore</span>, Not Just Mask
                </h2>
              </div>
              <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                The highest purpose of medicine should be to restore your body to optimum function, 
                not just mask symptoms. Eastern traditions have long operated from this position—now 
                this idea is gaining ground in the West as Functional Medicine.
              </p>
              <p className="font-sans text-muted-foreground text-lg leading-relaxed">
                By combining these complementary approaches, we integrate the best of science and 
                tradition to help you restore and maintain optimum health. We call this 
                <span className="font-semibold text-foreground"> Integrative Functional Medicine</span>.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("services")}
                className="font-heading text-primary font-semibold flex items-center gap-2 group"
                data-testid="button-explore-services"
              >
                Explore Our Services
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
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
                      <p className="font-heading text-3xl font-bold text-secondary">1000+</p>
                      <p className="font-sans text-sm text-muted-foreground">Patients Helped</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32 bg-background" aria-labelledby="services-heading" itemProp="hasOfferCatalog" itemScope itemType="https://schema.org/OfferCatalog">
        <div className="max-w-7xl mx-auto px-6">
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
            <motion.h2 id="services-heading" variants={fadeInUp} className="font-display text-4xl md:text-5xl text-foreground" itemProp="name">
              Our Services
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20"
                data-testid={`card-service-${index}`}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Provider Section */}
      <section id="provider" className="py-24 md:py-32 bg-card noise" aria-labelledby="provider-heading" itemScope itemType="https://schema.org/Physician">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="order-2 md:order-1">
              <p className="font-heading text-primary text-sm tracking-[0.2em] uppercase mb-4">Meet Your Provider</p>
              <h2 id="provider-heading" className="font-display text-4xl md:text-5xl text-foreground mb-6" itemProp="name">
                Dr. William Hendry
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed" itemProp="description">
                <p>
                  Dr. William Hendry holds a <span itemProp="qualifications">Doctor of Acupuncture and Oriental Medicine degree</span>, 
                  is nationally board-certified, and maintains active hospital privileges at <span itemProp="memberOf">Prisma Health</span>.
                </p>
                <p>
                  With over 25 years of experience in Chinese medicine and functional medicine training, 
                  he provides Greenville patients with trusted, straightforward care for pain, sports 
                  injuries, fatigue, and digestive health.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <p className="font-heading text-sm font-semibold text-foreground">Board Certified</p>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <p className="font-heading text-sm font-semibold text-foreground">Prisma Health Privileges</p>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
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
              What Our Patients Say
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
      <section id="contact" className="py-24 md:py-32 bg-background" aria-labelledby="contact-heading">
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
                  Visit Our Greenville Clinic
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
                      <span itemProp="streetAddress">319 Wade Hampton Blvd, Suite A</span><br />
                      <span itemProp="addressLocality">Greenville</span>, <span itemProp="addressRegion">SC</span> <span itemProp="postalCode">29609</span>
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
                      href="tel:8643656156"
                      className="font-sans text-primary hover:underline"
                      data-testid="link-phone"
                      itemProp="telephone"
                    >
                      (864) 365-6156
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
                      href="mailto:info@ihpgreenville.com"
                      className="font-sans text-primary hover:underline"
                      data-testid="link-email"
                      itemProp="email"
                    >
                      info@ihpgreenville.com
                    </a>
                  </div>
                </div>
              </div>

              <motion.a
                href="tel:8643656156"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-heading font-semibold shadow-lg hover:shadow-xl transition-shadow"
                data-testid="button-contact-call"
              >
                <Phone className="w-5 h-5" />
                Schedule Your Consultation
              </motion.a>
            </motion.div>

            <motion.div variants={fadeInUp} className="rounded-3xl overflow-hidden shadow-xl h-[400px] lg:h-auto">
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">ihp</span>
              </div>
              <span className="font-heading font-semibold text-lg">
                Integrative Health Partners
              </span>
            </div>

            <div className="flex items-center gap-8 text-white/60">
              <a href="https://facebook.com/ihpgreenville" className="hover:text-white transition-colors" data-testid="link-facebook">Facebook</a>
              <a href="https://instagram.com/integrativehealthpartners" className="hover:text-white transition-colors" data-testid="link-instagram">Instagram</a>
              <a href="mailto:info@ihpgreenville.com" className="hover:text-white transition-colors" data-testid="link-footer-email">Email</a>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
            <p>© {new Date().getFullYear()} Integrative Health Partners. All rights reserved.</p>
            <p className="mt-2">319 Wade Hampton Blvd, Suite A, Greenville, SC 29609</p>
          </div>
        </div>
      </footer>
    </div>
  );
}