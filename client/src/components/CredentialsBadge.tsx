import { motion } from "framer-motion";
import { ExternalLink, Award, Shield, GraduationCap, Building2, Users, BookOpen } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const credentials = {
  nccaom: {
    certificationNumber: "114498",
    designation: "Dipl. O.M. (NCCAOM)®",
    certifiedSince: "August 6, 2009",
    expirationDate: "August 31, 2029",
    badgeUrl: "https://digitalbadge.ncbahm.org/DiplomateBadgeProfile/LuHp7SJvVWPt5Uc3pVf6LQ==",
    directoryUrl: "https://directory.ncbahm.org/FAP/PractitionerDetail?AgencyClientId=ssLe-Z5Nnck=&d=4.8"
  },
  scLicense: {
    boardUrl: "https://llr.sc.gov/med/",
    boardName: "SC Board of Medical Examiners"
  },
  education: {
    degree: "DAOM",
    fullDegree: "Doctor of Acupuncture and Oriental Medicine",
    school: "East West College of Natural Medicine",
    graduationDate: "December 2008"
  },
  scLicenseNumber: "141",
  scLicenseExpiration: "September 30, 2027",
  specialty: "Injection Therapy Certification"
};

const achievements = {
  hospitalPrivileges: {
    hospital: "Prisma Health",
    years: 9
  },
  membership: {
    organization: "American Academy of Ozone Therapy",
    abbreviation: "AAOT"
  },
  research: {
    publicationCount: 5,
    citations: 52,
    institution: "Prisma Health System",
    researchGateUrl: "https://www.researchgate.net/profile/William-Hendry-4",
    highlights: [
      "Acupuncture for Taxane-Induced Peripheral Neuropathy",
      "Symptom Management Among Cancer Survivors (HRV Biofeedback)",
      "Neurogenesis & Integrative Care of Neurological Conditions"
    ]
  }
};

export function CredentialsBadge() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={stagger}
      className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Credentials & Achievements</h3>
          <p className="text-sm text-muted-foreground">Verified certifications and professional accomplishments</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.div variants={fadeInUp} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground mb-1">NCCAOM Certification</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">{credentials.nccaom.designation}</span>
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Certification #: <span className="font-medium text-foreground">{credentials.nccaom.certificationNumber}</span></p>
                <p>Certified Since: {credentials.nccaom.certifiedSince}</p>
                <p>Valid Through: {credentials.nccaom.expirationDate}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={credentials.nccaom.badgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  data-testid="link-nccaom-badge"
                >
                  View Digital Badge <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-muted-foreground">|</span>
                <a
                  href={credentials.nccaom.directoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  data-testid="link-nccaom-directory"
                >
                  NCCAOM Directory <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground mb-1">Education</h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{credentials.education.degree}</span> - {credentials.education.fullDegree}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {credentials.education.school} ({credentials.education.graduationDate})
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground mb-1">South Carolina State License</h4>
              <div className="text-sm text-muted-foreground mb-2">
                <p>Licensed Acupuncturist - State of South Carolina</p>
                <div className="text-xs mt-2 space-y-1">
                  <p>License #: <span className="font-medium text-foreground">{credentials.scLicenseNumber}</span></p>
                  <p>Expires: {credentials.scLicenseExpiration}</p>
                  <p>Specialty: {credentials.specialty}</p>
                </div>
              </div>
              <a
                href={credentials.scLicense.boardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                data-testid="link-sc-license-verify"
              >
                Verify at {credentials.scLicense.boardName} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={fadeInUp} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground mb-1">Hospital Privileges</h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{achievements.hospitalPrivileges.hospital}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Active hospital privileges for {achievements.hospitalPrivileges.years} years
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground mb-1">Professional Membership</h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{achievements.membership.organization}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member of {achievements.membership.abbreviation}
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground mb-1">Research & Publications</h4>
              <div className="flex gap-4 mb-2">
                <div className="text-center">
                  <p className="font-heading font-bold text-lg text-primary">{achievements.research.publicationCount}</p>
                  <p className="text-xs text-muted-foreground">Publications</p>
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold text-lg text-secondary">{achievements.research.citations}</p>
                  <p className="text-xs text-muted-foreground">Citations</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Research conducted at {achievements.research.institution}
              </p>
              <a
                href={achievements.research.researchGateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                data-testid="link-researchgate"
              >
                View Publications on ResearchGate <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div variants={fadeInUp} className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Dr. Hendry meets all requirements set by the Acupuncture Act of South Carolina, which requires 
          NCCAOM Diplomate-level certification to practice acupuncture in the state.
        </p>
      </motion.div>
    </motion.div>
  );
}

export function CredentialSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    "name": "Diplomate of Oriental Medicine",
    "credentialCategory": "Professional Certification",
    "recognizedBy": {
      "@type": "Organization",
      "name": "National Certification Commission for Acupuncture and Oriental Medicine (NCCAOM)",
      "url": "https://www.nccaom.org"
    },
    "validIn": {
      "@type": "AdministrativeArea",
      "name": "United States"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
