import { Link } from "wouter";
import { NAP } from "@/data/services";
import { Phone, Mail, MapPin } from "lucide-react";

export function NAPFooter() {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">ihp</span>
              </div>
              <span className="font-heading font-semibold text-lg" itemProp="name">
                {NAP.name}
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Integrative functional medicine combining the best of Eastern tradition and Western science in Greenville, SC.
            </p>
          </div>

          <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <h3 className="font-heading font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-white/80 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <span itemProp="streetAddress">{NAP.streetAddress}</span><br />
                  <span itemProp="addressLocality">{NAP.city}</span>, <span itemProp="addressRegion">{NAP.state}</span> <span itemProp="postalCode">{NAP.postalCode}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href={`tel:${NAP.phone.replace(/[^0-9]/g, '')}`} className="hover:text-white transition-colors" itemProp="telephone">
                  {NAP.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href={`mailto:${NAP.email}`} className="hover:text-white transition-colors" itemProp="email">
                  {NAP.email}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-white/80 text-sm">
              <Link href="/services/acupuncturist-greenville-sc" className="block hover:text-white transition-colors">
                Acupuncturist Services
              </Link>
              <Link href="/services/acupuncture-clinic-greenville-sc" className="block hover:text-white transition-colors">
                Acupuncture Clinic
              </Link>
              <Link href="/services/chinese-medicine-clinic-greenville-sc" className="block hover:text-white transition-colors">
                Chinese Medicine
              </Link>
              <Link href="/services/alternative-medicine-practitioner-greenville-sc" className="block hover:text-white transition-colors">
                Alternative Medicine
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
          <p>© {new Date().getFullYear()} {NAP.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://facebook.com/ihpgreenville" className="hover:text-white transition-colors">Facebook</a>
            <a href="https://instagram.com/integrativehealthpartners" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
