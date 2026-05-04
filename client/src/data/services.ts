export interface Service {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  categorySlug: string;
}

export interface Category {
  slug: string;
  name: string;
  gbpCategory: string;
  metaTitle: string;
  metaDescription: string;
  isPrimary: boolean;
  services: Service[];
}

const createSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const createServiceMetaTitle = (name: string): string => {
  return `${name} in Greenville, SC | Integrative Health Partners`;
};

const createServiceMetaDescription = (name: string, category: string): string => {
  return `Professional ${name.toLowerCase()} services in Greenville, SC. Dr. William Hendry provides expert ${category.toLowerCase()} care. Call (864) 365-6156 to schedule.`;
};

const acupuncturistServices: string[] = [
  "Acupuncture Therapy",
  "Acupuncture Treatment",
  "Traditional Chinese Acupuncture",
  "Medical Acupuncture",
  "Auricular Acupuncture",
  "Ear Acupuncture",
  "Electroacupuncture",
  "Electrical Stimulation Acupuncture",
  "Scalp Acupuncture",
  "Cosmetic Acupuncture",
  "Facial Rejuvenation Acupuncture",
  "Fertility Acupuncture",
  "Prenatal Acupuncture",
  "Pregnancy Acupuncture",
  "Acupuncture for Anxiety",
  "Acupuncture for Stress Relief",
  "Acupuncture for Insomnia",
  "Acupuncture for Migraines",
  "Acupuncture for Headaches",
  "Non-Needle Acupuncture",
  "Laser Acupuncture",
  "Acupressure Therapy",
  "Dry Needling Therapy",
  "Trigger Point Dry Needling",
  "Intramuscular Stimulation",
  "Biopuncture Therapy",
  "Biopuncture Injections"
];

const acupunctureClinicServices: string[] = [
  "Back Pain Treatment",
  "Lower Back Pain Treatment",
  "Upper Back Pain Treatment",
  "Chronic Back Pain Treatment",
  "Sciatica Treatment",
  "Sciatic Nerve Pain Treatment",
  "Neck Pain Treatment",
  "Shoulder Pain Treatment",
  "Frozen Shoulder Treatment",
  "Knee Pain Treatment",
  "Hip Pain Treatment",
  "Joint Pain Treatment",
  "Arthritis Pain Treatment",
  "Fibromyalgia Treatment",
  "Chronic Pain Management",
  "Neuropathy Treatment",
  "Peripheral Neuropathy Treatment",
  "Plantar Fasciitis Treatment",
  "Carpal Tunnel Treatment",
  "TMJ Treatment",
  "TMJ Pain Relief",
  "Sports Injury Treatment",
  "Muscle Pain Treatment",
  "Trigger Point Therapy"
];

const chineseMedicineServices: string[] = [
  "Cupping Therapy",
  "Chinese Cupping",
  "Fire Cupping",
  "Gua Sha Treatment",
  "Gua Sha Therapy",
  "Moxibustion Therapy",
  "Moxa Treatment",
  "Chinese Herbal Medicine",
  "Chinese Herbal Formulas",
  "Custom Herbal Formulations",
  "Herbal Consultation",
  "Herbal Supplements",
  "Natural Medicine Consultation",
  "Herb-Drug Interaction Consultation",
  "Menstrual Pain Treatment",
  "PMS Treatment",
  "Menopause Treatment",
  "Hot Flash Treatment",
  "Fertility Treatment",
  "Infertility Treatment",
  "Digestive Issues Treatment",
  "IBS Treatment",
  "Acid Reflux Treatment",
  "Allergy Treatment",
  "Sinus Treatment",
  "Insomnia Treatment",
  "Sleep Disorder Treatment",
  "Natural Anxiety Treatment",
  "Natural Depression Treatment",
  "Stress Management",
  "Fatigue Treatment",
  "Chronic Fatigue Treatment",
  "Immune System Support"
];

const alternativeMedicineServices: string[] = [
  "Functional Medicine Consultation",
  "Functional Medicine Testing",
  "Functional Blood Chemistry Analysis",
  "Comprehensive Blood Panel",
  "Hormone Testing",
  "Hormonal Imbalance Treatment",
  "Thyroid Testing",
  "Thyroid Disorder Treatment",
  "Adrenal Fatigue Treatment",
  "Adrenal Testing",
  "Inflammatory Marker Testing",
  "Food Sensitivity Testing",
  "Nutritional Deficiency Testing",
  "Gut Health Testing",
  "Leaky Gut Treatment",
  "Digestive Health Treatment",
  "Autoimmune Disease Treatment",
  "Root Cause Analysis",
  "Integrative Medicine Consultation",
  "Holistic Health Assessment",
  "Brain Fog Treatment",
  "Weight Loss Support",
  "Metabolism Support",
  "High Blood Pressure Support",
  "Blood Sugar Support",
  "Natural Diabetes Support",
  "Long COVID Treatment",
  "Post-COVID Recovery",
  "Ozone Therapy",
  "Ozone Steam Sauna",
  "Ozone Sauna Therapy",
  "Medical Ozone Therapy",
  "Ozone Detoxification",
  "Infrared Sauna Therapy",
  "Detoxification Therapy",
  "Heavy Metal Detox",
  "Vitamin Therapy",
  "Vitamin Supplementation",
  "Mineral Supplementation",
  "Supplement Recommendations",
  "Whole Food Supplements",
  "Professional-Grade Vitamins",
  "Nutritional Supplements",
  "Nutritional Counseling",
  "Nutrition Therapy",
  "Whole Food Nutrition Counseling"
];

const buildServices = (serviceNames: string[], categoryName: string, categorySlug: string): Service[] => {
  return serviceNames.map(name => ({
    slug: `${createSlug(name)}-greenville-sc`,
    name,
    metaTitle: createServiceMetaTitle(name),
    metaDescription: createServiceMetaDescription(name, categoryName),
    category: categoryName,
    categorySlug
  }));
};

export const categories: Category[] = [
  {
    slug: "acupuncturist-greenville-sc",
    name: "Acupuncturist",
    gbpCategory: "Acupuncturist",
    metaTitle: "Acupuncturist in Greenville, SC | Integrative Health Partners",
    metaDescription: "Looking for a skilled acupuncturist in Greenville, SC? Dr. William Hendry offers 25+ years of experience in acupuncture therapy and needle-based treatments. Call (864) 365-6156.",
    isPrimary: true,
    services: buildServices(acupuncturistServices, "Acupuncturist", "acupuncturist-greenville-sc")
  },
  {
    slug: "acupuncture-clinic-greenville-sc",
    name: "Acupuncture Clinic",
    gbpCategory: "Acupuncture clinic",
    metaTitle: "Acupuncture Clinic in Greenville, SC | Pain Treatment & Relief",
    metaDescription: "Visit our acupuncture clinic in Greenville, SC for expert pain treatment. We specialize in back pain, sciatica, neck pain, and sports injuries. Call (864) 365-6156.",
    isPrimary: false,
    services: buildServices(acupunctureClinicServices, "Acupuncture Clinic", "acupuncture-clinic-greenville-sc")
  },
  {
    slug: "chinese-medicine-clinic-greenville-sc",
    name: "Chinese Medicine Clinic",
    gbpCategory: "Chinese medicine clinic",
    metaTitle: "Chinese Medicine Clinic in Greenville, SC | TCM & Herbal Medicine",
    metaDescription: "Authentic Chinese medicine clinic in Greenville, SC offering cupping, herbal medicine, moxibustion, and traditional TCM treatments. Call (864) 365-6156 to schedule.",
    isPrimary: false,
    services: buildServices(chineseMedicineServices, "Chinese Medicine Clinic", "chinese-medicine-clinic-greenville-sc")
  },
  {
    slug: "functional-medicine-greenville-sc",
    name: "Functional Medicine",
    gbpCategory: "Holistic medicine practitioner",
    metaTitle: "Functional Medicine in Greenville, SC | Integrative Health Partners",
    metaDescription: "Functional medicine in Greenville, SC. Dr. Hendry uses advanced diagnostics to find the root cause of chronic illness, hormone imbalance, fatigue, and digestive issues. Call (864) 365-6156.",
    isPrimary: false,
    services: buildServices(alternativeMedicineServices, "Functional Medicine", "functional-medicine-greenville-sc")
  }
];

export const getAllServices = (): Service[] => {
  return categories.flatMap(cat => cat.services);
};

export const getServiceBySlug = (slug: string): Service | undefined => {
  return getAllServices().find(s => s.slug === slug);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(c => c.slug === slug);
};

export const getServicesByCategory = (categorySlug: string): Service[] => {
  const category = getCategoryBySlug(categorySlug);
  return category ? category.services : [];
};

export const NAP = {
  name: "Integrative Health Partners",
  streetAddress: "319 Wade Hampton Blvd, Ste A",
  city: "Greenville",
  state: "SC",
  postalCode: "29609",
  phone: "(864) 365-6156",
  phoneRaw: "+1-864-365-6156",
  email: "info@ihpgreenville.com",
  url: "https://www.ihpgreenville.com",
  latitude: "34.862258",
  longitude: "-82.382482"
};
