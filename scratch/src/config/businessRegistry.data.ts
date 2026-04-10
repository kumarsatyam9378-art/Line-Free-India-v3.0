/* eslint-disable */
// AUTO-GENERATED - Strictly Limited to Beauty & Wellness OS
import type { BusinessCategory } from '../store/AppContext';

export interface BusinessRegistryGroup {
  id: string;
  label: string;
  labelHi: string;
  icon: string;
}

export const BUSINESS_REGISTRY_GROUPS: BusinessRegistryGroup[] = [
  {
    id: "beauty",
    label: "Beauty & Wellness",
    labelHi: "ब्यूटी और वेलनेस",
    icon: "✨"
  },
  {
    id: "healthcare",
    label: "Healthcare",
    labelHi: "स्वास्थ्य सेवा",
    icon: "🏥"
  },
  {
    id: "food",
    label: "Food & Dining",
    labelHi: "खाना और भोजन",
    icon: "🍽️"
  },
  {
    id: "fitness",
    label: "Fitness & Sports",
    labelHi: "फिटनेस और खेल",
    icon: "💪"
  },
  {
    id: "education",
    label: "Education & Coaching",
    labelHi: "शिक्षा और कोचिंग",
    icon: "📚"
  },
  {
    id: "services",
    label: "Professional Services",
    labelHi: "पेशेवर सेवाएं",
    icon: "⚖️"
  },
  {
    id: "creative",
    label: "Creative & Media",
    labelHi: "रचनात्मक और मीडिया",
    icon: "📸"
  },
  {
    id: "repairs",
    label: "Repairs & Maintenance",
    labelHi: "मरम्मत और रखरखाव",
    icon: "🔧"
  },
  {
    id: "other",
    label: "Other Services",
    labelHi: "अन्य सेवाएं",
    icon: "🏪"
  }
];

export interface BusinessNicheRow {
  id: string;
  groupId: string;
  label: string;
  labelHi: string;
  icon: string;
  template: BusinessCategory;
}

export const ALL_BUSINESS_NICHE_ROWS: BusinessNicheRow[] = [
  // Beauty & Wellness
  {
    "groupId": "beauty",
    "id": "mens_salon",
    "label": "Men's Salon / Barber Shop",
    "labelHi": "पुरुष सैलून / नाई की दुकान",
    "icon": "💈",
    "template": "men_salon"
  },
  {
    "groupId": "beauty",
    "id": "ladies_parlour",
    "label": "Ladies Beauty Parlour",
    "labelHi": "लेडीज़ ब्यूटी पार्लर",
    "icon": "👠",
    "template": "beauty_parlour"
  },
  {
    "groupId": "beauty",
    "id": "unisex_salon",
    "label": "Unisex Salon",
    "labelHi": "यूनिसेक्स सैलून",
    "icon": "✂️",
    "template": "unisex_salon"
  },
  {
    "groupId": "beauty",
    "id": "spa_center",
    "label": "Spa & Wellness Center",
    "labelHi": "स्पा और वेलनेस सेंटर",
    "icon": "🧖",
    "template": "spa"
  },
  // Healthcare
  {
    "groupId": "healthcare",
    "id": "clinic",
    "label": "Medical Clinic",
    "labelHi": "मेडिकल क्लिनिक",
    "icon": "🩺",
    "template": "clinic"
  },
  {
    "groupId": "healthcare",
    "id": "hospital",
    "label": "Hospital / Diagnostic Lab",
    "labelHi": "हॉस्पिटल / डायग्नोस्टिक लैब",
    "icon": "🏥",
    "template": "hospital"
  },
  {
    "groupId": "healthcare",
    "id": "pet_care",
    "label": "Pet Care / Veterinary",
    "labelHi": "पेट केयर / वेटरनरी",
    "icon": "🐾",
    "template": "pet_care"
  },
  // Food & Dining
  {
    "groupId": "food",
    "id": "restaurant",
    "label": "Restaurant",
    "labelHi": "रेस्टोरेंट",
    "icon": "🍽️",
    "template": "restaurant"
  },
  {
    "groupId": "food",
    "id": "cafe",
    "label": "Cafe / Bakery",
    "labelHi": "कैफे / बेकरी",
    "icon": "☕",
    "template": "cafe"
  },
  // Fitness & Sports
  {
    "groupId": "fitness",
    "id": "gym",
    "label": "Gym / Fitness Center",
    "labelHi": "जिम / फिटनेस सेंटर",
    "icon": "💪",
    "template": "gym"
  },
  // Education & Coaching
  {
    "groupId": "education",
    "id": "coaching",
    "label": "Coaching / Tuition Center",
    "labelHi": "कोचिंग / ट्यूशन सेंटर",
    "icon": "📚",
    "template": "coaching"
  },
  // Professional Services
  {
    "groupId": "services",
    "id": "law_firm",
    "label": "Law Firm / CA Services",
    "labelHi": "लॉ फर्म / CA सेवाएं",
    "icon": "⚖️",
    "template": "law_firm"
  },
  // Creative & Media
  {
    "groupId": "creative",
    "id": "photography",
    "label": "Photography Studio",
    "labelHi": "फोटोग्राफी स्टूडियो",
    "icon": "📸",
    "template": "photography"
  },
  // Repairs & Maintenance
  {
    "groupId": "repairs",
    "id": "repair_shop",
    "label": "Repair Shop",
    "labelHi": "रिपेयर शॉप",
    "icon": "🔧",
    "template": "repair_shop"
  },
  {
    "groupId": "repairs",
    "id": "laundry",
    "label": "Laundry Service",
    "labelHi": "लॉन्ड्री सर्विस",
    "icon": "👔",
    "template": "laundry"
  },
  // Other Services
  {
    "groupId": "other",
    "id": "event_planner",
    "label": "Event Planner",
    "labelHi": "इवेंट प्लैनर",
    "icon": "✨",
    "template": "event_planner"
  },
  {
    "groupId": "other",
    "id": "other_business",
    "label": "Other Business",
    "labelHi": "अन्य बिज़नेस",
    "icon": "🏪",
    "template": "other"
  }
];
