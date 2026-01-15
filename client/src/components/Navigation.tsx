import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { categories, NAP } from "@/data/services";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [location]);

  const textColor = isHome && !scrolled ? "text-white" : "text-foreground";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome ? "glass shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">ihp</span>
          </div>
          <span className={`font-heading font-semibold text-lg hidden sm:block transition-colors ${textColor}`}>
            {NAP.name}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <div 
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className={`font-heading text-sm font-medium tracking-wide transition-all hover:text-primary flex items-center gap-1 ${textColor}`}
              data-testid="link-services"
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-border p-2"
                >
                  {categories.map(category => (
                    <Link
                      key={category.slug}
                      href={`/services/${category.slug}`}
                      className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-heading text-sm font-medium text-foreground block">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {category.services.length} services
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/#approach"
            className={`font-heading text-sm font-medium tracking-wide transition-all hover:text-primary ${textColor}`}
          >
            About
          </Link>

          <Link
            href="/#provider"
            className={`font-heading text-sm font-medium tracking-wide transition-all hover:text-primary ${textColor}`}
          >
            Dr. Hendry
          </Link>

          <Link
            href="/#contact"
            className={`font-heading text-sm font-medium tracking-wide transition-all hover:text-primary ${textColor}`}
          >
            Contact
          </Link>

          <Link
            href="/blog"
            className={`font-heading text-sm font-medium tracking-wide transition-all hover:text-primary ${textColor}`}
          >
            Blog
          </Link>

          <a
            href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-heading text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
            data-testid="button-call"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${textColor}`}
          data-testid="button-menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <div className="border-b border-border pb-4">
                <p className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-3">Services</p>
                {categories.map(category => (
                  <Link
                    key={category.slug}
                    href={`/services/${category.slug}`}
                    className="block font-heading text-sm font-medium text-foreground py-2 hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <Link href="/#approach" className="font-heading text-base font-medium text-foreground py-2 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/#provider" className="font-heading text-base font-medium text-foreground py-2 hover:text-primary transition-colors">
                Dr. Hendry
              </Link>
              <Link href="/#contact" className="font-heading text-base font-medium text-foreground py-2 hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/blog" className="font-heading text-base font-medium text-foreground py-2 hover:text-primary transition-colors">
                Blog
              </Link>

              <a
                href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-heading text-sm font-semibold justify-center mt-2"
              >
                <Phone className="w-4 h-4" />
                {NAP.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
