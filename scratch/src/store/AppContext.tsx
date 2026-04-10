import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
  onAuthStateChanged, signInWithPopup, signOut as fbSignOut,
  deleteUser, reauthenticateWithPopup, setPersistence, browserLocalPersistence, User,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from 'firebase/auth';
import { getToken as getFCMToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
  updateDoc, addDoc, onSnapshot, deleteDoc
} from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';

export type Lang = 'en' | 'hi';
export type Role = 'customer' | 'business';

// ── Business Categories ──
export type BusinessCategory =
  | 'men_salon'
  | 'beauty_parlour'
  | 'unisex_salon'
  | 'clinic'
  | 'hospital'
  | 'restaurant'
  | 'cafe'
  | 'gym'
  | 'spa'
  | 'pet_care'
  | 'coaching'
  | 'law_firm'
  | 'photography'
  | 'repair_shop'
  | 'laundry'
  | 'event_planner'
  | 'other';

export interface Terminology {
  provider: string; // e.g. 'Barber', 'Doctor', 'Chef'
  action: string;   // e.g. 'Get Token', 'Book Table'
  noun: string;     // e.g. 'Queue', 'Appointment', 'Reservation'
  item: string;     // e.g. 'Service', 'Treatment', 'Dish'
  unit: string;     // e.g. 'min', 'days'
}

export interface BusinessCategoryInfo {
  id: BusinessCategory;
  icon: string;
  label: string;
  labelHi: string;
  terminology: Terminology;
  defaultServices: ServiceItem[];
  // Feature flags
  hasTimedSlots?: boolean;      // Uses time-slot appointments (clinics, spa) vs open queue
  hasMenu?: boolean;            // Has a digital menu (restaurant, cafe)
  hasEmergencySlot?: boolean;   // Supports emergency priority (clinic, hospital, pet)
  hasHomeService?: boolean;     // Offers home visit option (beauty, laundry, repair)
  hasVideoConsult?: boolean;    // Supports video consultation
  supportsGroupBooking?: boolean; // Multi-person bookings
  hasCapacityLimit?: boolean;     // Auto-pausing queues when capacity is hit
  defaultWorkingHours?: { open: string, close: string };
}

export const BUSINESS_CATEGORIES: BusinessCategoryInfo[] = [
  {
    id: 'men_salon', icon: '💈', label: "Men's Salon", labelHi: 'बार्बर / सैलून',
    terminology: { provider: 'Barber', action: 'Join Queue', noun: 'Queue', item: 'Service', unit: 'min' },
    hasHomeService: false, supportsGroupBooking: true, hasCapacityLimit: true, defaultWorkingHours: { open: '09:00', close: '21:00' },
    defaultServices: [
      { id: '1', name: 'Hair Cut', price: 100, avgTime: 20 },
      { id: '2', name: 'Beard Trim', price: 50, avgTime: 15 },
      { id: '3', name: 'Hair Cut + Beard', price: 140, avgTime: 30 },
      { id: '4', name: 'Clean Shave', price: 60, avgTime: 15 },
      { id: '5', name: 'Head Massage', price: 80, avgTime: 20 },
      { id: '6', name: 'Hair Wash + Blow Dry', price: 120, avgTime: 25 },
      { id: '7', name: 'Hair Color (Full)', price: 600, avgTime: 60 },
      { id: '8', name: 'D-Tan Face Pack', price: 150, avgTime: 20 },
      { id: '9', name: 'Facial (Gents)', price: 300, avgTime: 40 },
      { id: '10', name: 'Kids Hair Cut', price: 70, avgTime: 15 },
      { id: '11', name: 'Hair Straightening', price: 1200, avgTime: 90 },
      { id: '12', name: 'Highlights', price: 800, avgTime: 75 },
    ],
  },
  {
    id: 'beauty_parlour', icon: '💅', label: 'Beauty Parlour', labelHi: 'ब्यूटी पार्लर',
    terminology: { provider: 'Stylist', action: 'Join Queue', noun: 'Queue', item: 'Service', unit: 'min' },
    hasHomeService: true, supportsGroupBooking: true, hasCapacityLimit: true, defaultWorkingHours: { open: '10:00', close: '20:00' },
    defaultServices: [
      { id: '1', name: 'Eyebrow Threading', price: 40, avgTime: 10 },
      { id: '2', name: 'Upper Lip Threading', price: 20, avgTime: 5 },
      { id: '3', name: 'Full Face Threading', price: 100, avgTime: 20 },
      { id: '4', name: 'Gold Facial', price: 700, avgTime: 50 },
      { id: '5', name: 'Basic Cleanup', price: 250, avgTime: 30 },
      { id: '6', name: 'Full Arms Waxing', price: 200, avgTime: 25 },
      { id: '7', name: 'Full Legs Waxing', price: 300, avgTime: 35 },
      { id: '8', name: 'Manicure', price: 300, avgTime: 30 },
      { id: '9', name: 'Pedicure', price: 400, avgTime: 40 },
      { id: '10', name: 'Bridal Makeup', price: 5000, avgTime: 120 },
      { id: '11', name: 'Party Makeup', price: 1500, avgTime: 60 },
      { id: '12', name: 'Mehndi (Bridal Full)', price: 2500, avgTime: 90 },
      { id: '13', name: 'Hair Color (Global)', price: 1200, avgTime: 90 },
      { id: '14', name: 'Keratin Treatment', price: 2500, avgTime: 120 },
      { id: '15', name: 'Nail Art (per hand)', price: 400, avgTime: 45 },
    ],
  },
  {
    id: 'unisex_salon', icon: '✂️', label: 'Unisex Salon', labelHi: 'यूनिसेक्स सैलून',
    terminology: { provider: 'Stylist', action: 'Join Queue', noun: 'Queue', item: 'Service', unit: 'min' },
    supportsGroupBooking: true, hasCapacityLimit: true, defaultWorkingHours: { open: '09:00', close: '21:00' },
    defaultServices: [
      { id: '1', name: 'Ladies Hair Cut', price: 250, avgTime: 30 },
      { id: '2', name: 'Gents Hair Cut', price: 120, avgTime: 20 },
      { id: '3', name: 'Hair Spa', price: 1000, avgTime: 60 },
      { id: '4', name: 'Keratin Treatment', price: 3000, avgTime: 120 },
      { id: '5', name: 'Hair Smoothening', price: 2500, avgTime: 120 },
      { id: '6', name: 'Global Hair Color', price: 1500, avgTime: 90 },
      { id: '7', name: 'Balayage / Highlights', price: 3000, avgTime: 120 },
      { id: '8', name: 'Threading', price: 40, avgTime: 10 },
      { id: '9', name: 'Facial (Premium)', price: 800, avgTime: 50 },
      { id: '10', name: 'Couple Package', price: 1500, avgTime: 60 },
      { id: '11', name: 'Hair Wash + Blow Dry', price: 300, avgTime: 30 },
      { id: '12', name: 'Scalp Treatment', price: 700, avgTime: 45 },
    ],
  },
  {
    id: 'clinic', icon: '🩺', label: 'Clinic / Doctor', labelHi: 'क्लिनिक / डॉक्टर',
    terminology: { provider: 'Doctor', action: 'Book Appt.', noun: 'Appointment', item: 'Consultation', unit: 'min' },
    hasTimedSlots: true, hasEmergencySlot: true, hasVideoConsult: true, hasCapacityLimit: true, defaultWorkingHours: { open: '09:00', close: '19:00' },
    defaultServices: [
      { id: '1', name: 'General Consultation', price: 400, avgTime: 15 },
      { id: '2', name: 'Follow-up Visit', price: 200, avgTime: 10 },
      { id: '3', name: 'Pediatric Consult', price: 500, avgTime: 15 },
      { id: '4', name: 'Dermatology Consult', price: 700, avgTime: 20 },
      { id: '5', name: 'Gynecology Consult', price: 700, avgTime: 20 },
      { id: '6', name: 'Ophthalmology (Eye)', price: 600, avgTime: 20 },
      { id: '7', name: 'ENT Consultation', price: 600, avgTime: 20 },
      { id: '8', name: 'Psychiatric Consult', price: 1000, avgTime: 30 },
      { id: '9', name: 'Senior Citizen Consult', price: 300, avgTime: 20 },
      { id: '10', name: 'Video Consultation', price: 350, avgTime: 15 },
      { id: '11', name: 'Fitness / Medical Certificate', price: 200, avgTime: 10 },
    ],
  },
  {
    id: 'hospital', icon: '🏥', label: 'Hospital / Lab', labelHi: 'हॉस्पिटल / लैब',
    terminology: { provider: 'Specialist', action: 'Book Appt.', noun: 'Appointment', item: 'Test', unit: 'min' },
    hasTimedSlots: true, hasEmergencySlot: true, hasVideoConsult: true, hasHomeService: true, hasCapacityLimit: false, defaultWorkingHours: { open: '00:00', close: '23:59' },
    defaultServices: [
      { id: '1', name: 'OPD Consultation', price: 800, avgTime: 20 },
      { id: '2', name: 'Complete Blood Count (CBC)', price: 300, avgTime: 10 },
      { id: '3', name: 'Blood Sugar (Fasting)', price: 150, avgTime: 10 },
      { id: '4', name: 'Thyroid Profile (T3/T4/TSH)', price: 700, avgTime: 10 },
      { id: '5', name: 'Lipid Profile', price: 600, avgTime: 10 },
      { id: '6', name: 'Liver Function Test (LFT)', price: 500, avgTime: 10 },
      { id: '7', name: 'Chest X-Ray', price: 350, avgTime: 15 },
      { id: '8', name: 'ECG', price: 200, avgTime: 15 },
      { id: '9', name: 'Ultrasound (Abdomen)', price: 800, avgTime: 30 },
      { id: '10', name: 'Full Body Checkup Package', price: 2500, avgTime: 60 },
      { id: '11', name: 'Urine Routine & Microscopy', price: 150, avgTime: 10 },
      { id: '12', name: 'MRI Brain (Referral)', price: 8000, avgTime: 45 },
      { id: '13', name: 'Home Sample Collection', price: 200, avgTime: 30 },
    ],
  },
  {
    id: 'restaurant', icon: '🍽️', label: 'Restaurant', labelHi: 'रेस्टोरेंट',
    terminology: { provider: 'Chef', action: 'Reserve Table', noun: 'Reservation', item: 'Package', unit: 'min' },
    hasMenu: true, hasTimedSlots: true, supportsGroupBooking: true, hasCapacityLimit: true, defaultWorkingHours: { open: '11:00', close: '23:00' },
    defaultServices: [
      { id: '1', name: 'Table for 2 (45 min)', price: 0, avgTime: 45 },
      { id: '2', name: 'Table for 4 (60 min)', price: 0, avgTime: 60 },
      { id: '3', name: 'Table for 6 (90 min)', price: 0, avgTime: 90 },
      { id: '4', name: 'Private Dining Room (4 hr)', price: 2000, avgTime: 240 },
      { id: '5', name: 'Birthday Party Setup', price: 1500, avgTime: 180 },
      { id: '6', name: 'Candlelight Dinner Package', price: 2500, avgTime: 120 },
      { id: '7', name: 'Corporate Lunch (10 pax)', price: 5000, avgTime: 90 },
      { id: '8', name: 'Terrace / Outdoor Table', price: 200, avgTime: 60 },
      { id: '9', name: 'Buffet Slot (1 person)', price: 599, avgTime: 60 },
      { id: '10', name: 'Takeaway Pre-Order Slot', price: 0, avgTime: 20 },
    ],
  },
  {
    id: 'cafe', icon: '☕', label: 'Cafe / Bakery', labelHi: 'कैफे / बेकरी',
    terminology: { provider: 'Barista', action: 'Reserve Table', noun: 'Reservation', item: 'Item', unit: 'min' },
    hasMenu: true, hasTimedSlots: true, supportsGroupBooking: true, hasCapacityLimit: true, defaultWorkingHours: { open: '08:00', close: '22:00' },
    defaultServices: [
      { id: '1', name: 'Table Booking (30 min)', price: 0, avgTime: 30 },
      { id: '2', name: 'Table Booking (1 hour)', price: 0, avgTime: 60 },
      { id: '3', name: 'Co-Working Desk (Half Day)', price: 299, avgTime: 240 },
      { id: '4', name: 'Co-Working Desk (Full Day)', price: 499, avgTime: 480 },
      { id: '5', name: 'Private Study Room (2 hr)', price: 399, avgTime: 120 },
      { id: '6', name: 'Birthday Celebration Table', price: 800, avgTime: 90 },
      { id: '7', name: 'Custom Cake Order (3 days advance)', price: 1200, avgTime: 0 },
      { id: '8', name: 'Couple Brunch Package', price: 999, avgTime: 90 },
      { id: '9', name: 'Team Event (10 pax)', price: 3500, avgTime: 120 },
      { id: '10', name: 'Takeaway Pre-Order', price: 0, avgTime: 15 },
    ],
  },
  {
    id: 'gym', icon: '💪', label: 'Gym / Fitness', labelHi: 'जिम / फिटनेस',
    terminology: { provider: 'Trainer', action: 'Book Slot', noun: 'Session', item: 'Plan', unit: 'min' },
    hasTimedSlots: true, supportsGroupBooking: false, hasCapacityLimit: true, defaultWorkingHours: { open: '05:00', close: '22:00' },
    defaultServices: [
      { id: '1', name: 'Daily Pass', price: 150, avgTime: 60 },
      { id: '2', name: 'Weekly Pass', price: 600, avgTime: 60 },
      { id: '3', name: 'Monthly Membership', price: 1200, avgTime: 60 },
      { id: '4', name: 'Quarterly Membership', price: 3000, avgTime: 60 },
      { id: '5', name: 'Annual Membership', price: 9999, avgTime: 60 },
      { id: '6', name: 'Personal Training (1 session)', price: 800, avgTime: 60 },
      { id: '7', name: 'Personal Training (10 sessions)', price: 6000, avgTime: 60 },
      { id: '8', name: 'Yoga Class', price: 300, avgTime: 60 },
      { id: '9', name: 'Zumba Class', price: 300, avgTime: 45 },
      { id: '10', name: 'Aerobics Class', price: 300, avgTime: 45 },
      { id: '11', name: 'HIIT Class', price: 400, avgTime: 45 },
      { id: '12', name: 'Diet + Fitness Consultation', price: 1500, avgTime: 45 },
      { id: '13', name: 'Body Composition Analysis', price: 500, avgTime: 30 },
    ],
  },
  {
    id: 'spa', icon: '🧖', label: 'Spa / Wellness', labelHi: 'स्पा / वेलनेस',
    terminology: { provider: 'Therapist', action: 'Book Session', noun: 'Session', item: 'Therapy', unit: 'min' },
    hasTimedSlots: true, supportsGroupBooking: true, hasCapacityLimit: true, defaultWorkingHours: { open: '10:00', close: '21:00' },
    defaultServices: [
      { id: '1', name: 'Swedish Full Body Massage (60 min)', price: 1500, avgTime: 60 },
      { id: '2', name: 'Deep Tissue Massage (60 min)', price: 1800, avgTime: 60 },
      { id: '3', name: 'Hot Stone Therapy (90 min)', price: 2500, avgTime: 90 },
      { id: '4', name: 'Aromatherapy Massage (60 min)', price: 2000, avgTime: 60 },
      { id: '5', name: 'Head + Neck + Shoulder (30 min)', price: 700, avgTime: 30 },
      { id: '6', name: 'Foot Reflexology (45 min)', price: 900, avgTime: 45 },
      { id: '7', name: 'Couple\'s Massage (60 min)', price: 3500, avgTime: 60 },
      { id: '8', name: 'Body Scrub + Wrap (90 min)', price: 2200, avgTime: 90 },
      { id: '9', name: 'Hydrafacial', price: 3000, avgTime: 60 },
      { id: '10', name: 'Thai Massage (60 min)', price: 1600, avgTime: 60 },
      { id: '11', name: 'Prenatal Massage (45 min)', price: 1400, avgTime: 45 },
      { id: '12', name: 'Spa Day Package (4 hr)', price: 6000, avgTime: 240 },
    ],
  },
  {
    id: 'coaching', icon: '📚', label: 'Coaching / Tutors', labelHi: 'कोचिंग / ट्यूशन',
    terminology: { provider: 'Tutor', action: 'Enroll', noun: 'Class', item: 'Course', unit: 'min' },
    hasTimedSlots: true, hasVideoConsult: true, hasCapacityLimit: true, defaultWorkingHours: { open: '15:00', close: '21:00' },
    defaultServices: [
      { id: '1', name: 'Demo / Trial Class (Free)', price: 0, avgTime: 45 },
      { id: '2', name: 'Mathematics (Monthly)', price: 2000, avgTime: 60 },
      { id: '3', name: 'Physics (Monthly)', price: 2000, avgTime: 60 },
      { id: '4', name: 'Chemistry (Monthly)', price: 2000, avgTime: 60 },
      { id: '5', name: 'English / Communication', price: 1500, avgTime: 60 },
      { id: '6', name: 'UPSC Foundation (Monthly)', price: 5000, avgTime: 90 },
      { id: '7', name: 'CA Foundation (Monthly)', price: 4000, avgTime: 90 },
      { id: '8', name: 'JEE / NEET Crash Course', price: 8000, avgTime: 120 },
      { id: '9', name: '1-on-1 Doubt Clearing (1 hr)', price: 500, avgTime: 60 },
      { id: '10', name: 'Spoken English (Monthly)', price: 3000, avgTime: 60 },
      { id: '11', name: 'Computer / Coding Basics', price: 2500, avgTime: 60 },
      { id: '12', name: 'Music Lessons (Monthly)', price: 3000, avgTime: 45 },
    ],
  },
  {
    id: 'pet_care', icon: '🐾', label: 'Pet Care / Vet', labelHi: 'पेट केयर / वेट',
    terminology: { provider: 'Vet', action: 'Book Appt.', noun: 'Appointment', item: 'Service', unit: 'min' },
    hasTimedSlots: true, hasEmergencySlot: true, hasCapacityLimit: true, defaultWorkingHours: { open: '09:00', close: '20:00' },
    defaultServices: [
      { id: '1', name: 'Vet General Consultation', price: 500, avgTime: 20 },
      { id: '2', name: 'Vaccination (Single)', price: 400, avgTime: 15 },
      { id: '3', name: 'Deworming', price: 200, avgTime: 10 },
      { id: '4', name: 'Bath + Grooming (Small Dog)', price: 600, avgTime: 45 },
      { id: '5', name: 'Bath + Grooming (Large Dog)', price: 1000, avgTime: 60 },
      { id: '6', name: 'Cat Grooming', price: 500, avgTime: 40 },
      { id: '7', name: 'Nail Trimming', price: 150, avgTime: 15 },
      { id: '8', name: 'Dental Cleaning', price: 800, avgTime: 30 },
      { id: '9', name: 'Tick & Flea Treatment', price: 400, avgTime: 20 },
      { id: '10', name: 'Microchipping', price: 700, avgTime: 15 },
      { id: '11', name: 'Pet X-Ray', price: 1500, avgTime: 20 },
      { id: '12', name: 'Pet Boarding (per day)', price: 500, avgTime: 1440 },
      { id: '13', name: 'Post-Surgery Follow-up', price: 300, avgTime: 15 },
    ],
  },
  {
    id: 'law_firm', icon: '⚖️', label: 'Law Firm / CA', labelHi: 'लॉ फर्म / CA',
    terminology: { provider: 'Consultant', action: 'Consult Now', noun: 'Consultation', item: 'Service', unit: 'min' },
    hasTimedSlots: true, hasVideoConsult: true, hasCapacityLimit: false, defaultWorkingHours: { open: '09:00', close: '18:00' },
    defaultServices: [
      { id: '1', name: 'Legal Consultation (30 min)', price: 1000, avgTime: 30 },
      { id: '2', name: 'Legal Consultation (60 min)', price: 1800, avgTime: 60 },
      { id: '3', name: 'Property Dispute Consult', price: 2000, avgTime: 60 },
      { id: '4', name: 'Divorce / Family Law Consult', price: 2000, avgTime: 60 },
      { id: '5', name: 'Company Incorporation', price: 10000, avgTime: 90 },
      { id: '6', name: 'GST Registration', price: 3000, avgTime: 60 },
      { id: '7', name: 'ITR Filing (Individual)', price: 1500, avgTime: 45 },
      { id: '8', name: 'ITR Filing (Business)', price: 5000, avgTime: 90 },
      { id: '9', name: 'Rent Agreement Drafting', price: 1200, avgTime: 45 },
      { id: '10', name: 'Trademark Registration', price: 8000, avgTime: 90 },
      { id: '11', name: 'FSSAI / MSME License', price: 4000, avgTime: 60 },
      { id: '12', name: 'Video Consultation (30 min)', price: 800, avgTime: 30 },
    ],
  },
  {
    id: 'photography', icon: '📸', label: 'Photo Studio', labelHi: 'फोटोग्राफी स्टूडियो',
    terminology: { provider: 'Photographer', action: 'Book Shoot', noun: 'Booking', item: 'Package', unit: 'min' },
    hasTimedSlots: true, supportsGroupBooking: true, hasCapacityLimit: false, defaultWorkingHours: { open: '10:00', close: '20:00' },
    defaultServices: [
      { id: '1', name: 'Passport / ID Photo', price: 100, avgTime: 10 },
      { id: '2', name: 'LinkedIn / Professional Headshot', price: 800, avgTime: 30 },
      { id: '3', name: 'Portfolio Shoot (1 hr)', price: 3000, avgTime: 60 },
      { id: '4', name: 'Baby / Newborn Shoot', price: 5000, avgTime: 120 },
      { id: '5', name: 'Maternity Shoot', price: 4000, avgTime: 90 },
      { id: '6', name: 'Pre-Wedding Shoot (Half Day)', price: 15000, avgTime: 240 },
      { id: '7', name: 'Pre-Wedding Shoot (Full Day)', price: 25000, avgTime: 480 },
      { id: '8', name: 'Wedding Day Coverage', price: 40000, avgTime: 600 },
      { id: '9', name: 'Product / E-commerce Shoot', price: 5000, avgTime: 120 },
      { id: '10', name: 'Corporate Event Coverage', price: 12000, avgTime: 240 },
      { id: '11', name: 'Real Estate Photography', price: 3500, avgTime: 90 },
      { id: '12', name: 'Photo Booth (3 hr event)', price: 8000, avgTime: 180 },
    ],
  },
  {
    id: 'repair_shop', icon: '🔧', label: 'Repair Shop', labelHi: 'रिपेयर शॉप',
    terminology: { provider: 'Technician', action: 'Drop Off', noun: 'Repair', item: 'Fix', unit: 'min' },
    hasHomeService: true, hasCapacityLimit: true, defaultWorkingHours: { open: '10:00', close: '21:00' },
    defaultServices: [
      { id: '1', name: 'Mobile Screen Replacement', price: 1800, avgTime: 60 },
      { id: '2', name: 'Battery Replacement', price: 600, avgTime: 30 },
      { id: '3', name: 'Charging Port Repair', price: 500, avgTime: 45 },
      { id: '4', name: 'Back Glass Replacement', price: 800, avgTime: 45 },
      { id: '5', name: 'Speaker / Mic Repair', price: 400, avgTime: 30 },
      { id: '6', name: 'Laptop Screen Replacement', price: 4500, avgTime: 120 },
      { id: '7', name: 'Laptop Battery Replacement', price: 1800, avgTime: 60 },
      { id: '8', name: 'OS Install / Format', price: 700, avgTime: 90 },
      { id: '9', name: 'Virus Removal', price: 500, avgTime: 60 },
      { id: '10', name: 'Data Recovery', price: 2500, avgTime: 120 },
      { id: '11', name: 'TV Repair (Diagnosis + Service)', price: 600, avgTime: 60 },
      { id: '12', name: 'AC Gas Refill', price: 1500, avgTime: 60 },
      { id: '13', name: 'Home Appliance Service Call', price: 400, avgTime: 45 },
    ],
  },
  {
    id: 'laundry', icon: '👔', label: 'Laundry', labelHi: 'लॉन्ड्री',
    terminology: { provider: 'Cleaner', action: 'Drop Clothes', noun: 'Service', item: 'Wash', unit: 'pieces' },
    hasHomeService: true, hasCapacityLimit: true, defaultWorkingHours: { open: '08:00', close: '21:00' },
    defaultServices: [
      { id: '1', name: 'Shirt — Wash + Iron', price: 35, avgTime: 30 },
      { id: '2', name: 'Trouser / Jeans — Wash + Iron', price: 50, avgTime: 30 },
      { id: '3', name: 'T-Shirt — Wash + Fold', price: 25, avgTime: 20 },
      { id: '4', name: 'Saree — Wash + Iron', price: 80, avgTime: 45 },
      { id: '5', name: 'Suit Dry Clean', price: 300, avgTime: 60 },
      { id: '6', name: 'Blanket Wash', price: 250, avgTime: 60 },
      { id: '7', name: 'Curtain Wash (per pair)', price: 200, avgTime: 60 },
      { id: '8', name: 'Carpet Dry Clean (per sq ft)', price: 50, avgTime: 90 },
      { id: '9', name: 'Leather / Jacket Dry Clean', price: 500, avgTime: 90 },
      { id: '10', name: 'Bedsheet Set (3 pcs)', price: 150, avgTime: 45 },
      { id: '11', name: 'Monthly Plan (30 shirts)', price: 900, avgTime: 30 },
      { id: '12', name: 'Express 6-Hour Turnaround', price: 150, avgTime: 360 },
    ],
  },
  {
    id: 'event_planner', icon: '✨', label: 'Event Planner', labelHi: 'इवेंट प्लैनर',
    terminology: { provider: 'Planner', action: 'Book Event', noun: 'Event', item: 'Service', unit: 'Days' },
    hasTimedSlots: false, hasVideoConsult: true, hasCapacityLimit: false, defaultWorkingHours: { open: '09:00', close: '20:00' },
    defaultServices: [
      { id: '1', name: 'Wedding Planning (Full)', price: 50000, avgTime: 1440 },
      { id: '2', name: 'Birthday Party Setup', price: 15000, avgTime: 240 },
      { id: '3', name: 'Corporate Event', price: 30000, avgTime: 480 },
      { id: '4', name: 'Consultation (1 hr)', price: 1000, avgTime: 60 },
    ],
  },
  {
    id: 'other', icon: '🏪', label: 'Other Business', labelHi: 'अन्य बिज़नेस',
    terminology: { provider: 'Staff', action: 'Request Service', noun: 'Request', item: 'Service', unit: 'min' },
    defaultWorkingHours: { open: '09:00', close: '18:00' },
    defaultServices: [
      { id: '1', name: 'General Service', price: 100, avgTime: 15 },
      { id: '2', name: 'Consultation / Advice', price: 200, avgTime: 30 },
    ],
  },
];

export const getCategoryInfo = (cat: BusinessCategory): BusinessCategoryInfo =>
  BUSINESS_CATEGORIES.find(c => c.id === cat) || BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1];

export interface ServiceItem { id: string; name: string; price: number; avgTime: number; priceType?: 'fixed' | 'variable'; }

export interface ReviewEntry {
  id?: string; salonId: string; customerId: string; customerName: string;
  customerPhoto: string; rating: number; comment: string; createdAt: any; images?: string[];
  staffId?: string; staffName?: string;
}

export interface NotificationEntry {
  id?: string; userId: string; title: string; body: string;
  type: 'token_ready' | 'token_called' | 'salon_open' | 'review' | 'general';
  data?: any; read: boolean; createdAt: number;
}

export interface Story {
  url: string;
  expiresAt: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  calories?: number;
  photoUrl?: string;
  description?: string;
  isAvailable: boolean;
}

export interface TableItem {
  id: string;
  seats: number;
  x: number;
  y: number;
  isReserved: boolean;
  label: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
}

export interface HospitalDepartment {
  id: string;
  name: string;
  doctorIds: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  includedServiceIds: string[];
  price: number;
  originalPrice?: number;
  durationMinutes: number;
  imageURL?: string;
}

export interface UserMembership {
  id: string;
  gymId: string;
  gymName: string;
  planName: string;
  expiresAt: number;
  qrCode: string; // Usually their uid + gymId
}

export interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed: string;
  lastVaccine: number;
  info: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  phone: string;
  batchIds: string[];
  joinedAt: number;
}

export interface PetHealthLog {
  weight: string;
  temperature: string;
  vaccinesGiven: string[];
  diagnosis: string;
  notes: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  timestamp: number;
}

export interface CoachingBatch {
  id: string;
  name: string;
  subject: string;
  timings: string;
  maxStudents: number;
  currentStudents: number;
}

export interface GroupClass {
  id: string;
  name: string; // e.g. Zumba, Yoga
  instructor: string;
  timings: string; // e.g. "Mon, Wed, Fri 08:00 AM"
  maxCapacity: number;
  enrolledUserIds: string[];
}

export interface PortfolioItem {
  id: string;
  url: string;
  title: string;
  category: string;
  size: 'small' | 'medium' | 'large';
  colorType: 'black_work' | 'color';
  estimatedPrice?: number;
}

export interface EventBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  eventType: string; // e.g. Bridal, Party, Corporate
  eventDate: string; // YYYY-MM-DD
  guestCount: number;
  assignedStaffIds: string[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice?: number;
  advancePaid?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  isAvailable: boolean;
  serviceIds?: string[];
  role?: string;
  targetEarnings?: number;
  earningsToday?: number;
}

export interface TaxSettings {
  isEnabled: boolean;
  taxName: string; // e.g. GST, VAT
  percentage: number;
  isIncludedInPrice: boolean;
  taxId?: string; // e.g. GSTIN
}

export interface MockTest {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  totalSeats: number;
  bookedSeats: number;
  subject: string;
  batchesAllowed: string[]; // batch IDs
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  shifts: { day: string; startTime: string; endTime: string }[];
  isAvailable: boolean;
  contact?: string;
}

export interface PatientRecord {
  id: string;
  patientName: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  lastVisit: string; // YYYY-MM-DD
  notes: string;
  documents: { title: string; url: string; date: string }[];
}

export interface KundaliChart {
  id: string;
  clientName: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  pob: string; // Place of birth
  zodiacSign: string;
  notes: string;
}

export interface Muhurat {
  id: string;
  title: string;
  date: string;
  timeRanges: string[];
  notes: string;
}

export interface HomeTuitionStudent {
  id: string;
  name: string;
  parentPhone: string;
  address: string;
  coordinates?: { lat: number; lng: number }; 
  subject: string;
  schedule: string;
  feeStatus: 'Paid' | 'Pending';
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  batchName: string;
  description: string;
  totalStudents: number;
  submittedStudents: string[]; // List of student names who submitted
}

export interface CarWashBay {
  id: string; // e.g., 'Bay 1', 'Bay 2'
  status: 'Available' | 'In Progress' | 'Maintenance';
  currentVehicle: string;
  serviceType: string;
  startTime: string; // ISO string
  estimatedDuration: number; // in mins
}

export interface WashPass {
  id: string;
  customerName: string;
  vehicleNumber: string;
  planType: 'Basic' | 'Premium' | 'Unlimited';
  startDate: string;
  expiryDate: string;
  washesUsed: number;
  totalWashes: number;
  isActive: boolean;
}

export interface BridalPackage {
  id: string;
  clientName: string;
  eventDate: string;
  brideStyle: string;
  brideHands: number;
  bridePrice: number;
  guestCount: number;
  guestPricePerPerson: number;
  travelFee: number;
  totalQuote: number;
  status: 'Draft' | 'Sent' | 'Booked';
}

export interface FeedbackRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceProvided: string;
  date: string;
  status: 'Pending' | 'Sent' | 'Completed';
  rating?: number;
  reviewText?: string;
}

export interface MeasurementProfile {
  id: string;
  customerName: string;
  phone: string;
  gender: 'M' | 'F' | 'Other';
  chest: number;
  waist: number;
  hips: number;
  inseam: number;
  shoulder: number;
  armLength: number;
  neck: number;
  notes: string;
  lastUpdated: string;
}

export interface FabricStock {
  id: string;
  name: string;
  color: string;
  totalMeters: number;
  usedMeters: number;
  costPerMeter: number;
  supplier: string;
  lastRestocked: string;
}

export interface SparePartItem {
  id: string;
  partNumber: string;
  name: string;
  category: 'OEM' | 'Aftermarket' | 'Consumable' | 'Other';
  stockCount: number;
  priceRaw: number;
  priceRetail: number;
  compatibilityTags: string[];
}

export interface VehicleServiceRecord {
  id: string;
  vehicleNo: string;
  makeModel: string;
  customerName: string;
  phone: string;
  odometer: number;
  date: string;
  servicesDone: string[];
  totalCost: number;
  nextServiceDate: string;
}

export interface CaseFileItem {
  id: string;
  caseName: string;
  clientName: string;
  caseType: 'Civil' | 'Criminal' | 'Corporate' | 'Family' | 'Other';
  status: 'Open' | 'Closed' | 'Appealed' | 'On Hold';
  externalDriveLink: string;
  dateOpened: string;
  notes: string;
}

export interface CourtHearingItem {
  id: string;
  caseName: string;
  clientName: string;
  courtName: string;
  judgeName: string;
  hearingDate: string;
  hearingTime: string;
  purpose: string;
  status: 'Scheduled' | 'Completed' | 'Adjourned' | 'Cancelled';
  notes: string;
}

export interface ConsultationBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  topic: string;
  date: string;
  time: string;
  durationMinutes: number;
  fee: number;
  meetingLink: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface MaintenanceContract {
  id: string;
  clientName: string;
  phone: string;
  address: string;
  startDate: string;
  endDate: string;
  unitsCovered: number;
  servicesPerYear: number;
  servicesCompleted: number;
  contractValue: number;
  status: 'Active' | 'Expired' | 'Renewed';
  notes: string;
}

export interface TechnicianDispatch {
  id: string;
  technicianName: string;
  clientName: string;
  phone: string;
  address: string;
  issue: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Assigned' | 'En Route' | 'Working' | 'Resolved' | 'Requires Spares';
  notes: string;
}

export interface ReferralSettings {
  isEnabled: boolean;
  pointsPerReferral: number;
  refereeDiscount: number; 
}

export interface VaccinationRecord {
  id: string;
  patientName: string;
  parentPhone: string;
  vaccineName: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  completedDate?: string;
  notes: string;
}

export interface DigitalRx {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; duration: string }[];
  advice: string;
}

export interface KundaliRecord {
  id: string;
  clientName: string;
  dob: string;
  tob: string;
  pob: string;
  notes: string;
  chartData?: any; 
}

export interface MuhuratRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  eventType: string;
  suggestedDates: { date: string; time: string; reason: string }[];
  notes: string;
}

export interface TestScore {
  date: string;
  topic: string;
  score: number;
  maxScore: number;
}

export interface StudentProgress {
  id: string;
  studentName: string;
  parentPhone: string;
  subject: string;
  scores: TestScore[];
  notes: string;
}

export interface BatchSchedule {
  id: string;
  batchName: string;
  subject: string;
  schedule: string;
  studentsCount: number;
  meetingLink?: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string; // ml, kg, pieces
  price?: number;
  alertThreshold: number;
  lastRestocked: string;
}

export interface DynamicPricingRule {
  id: string;
  ruleName: string;
  isActive: boolean;
  type: 'surge' | 'discount';
  percentage: number;
  condition: string; // 'weekend', 'festival', 'custom'
  appliesTo: 'all' | 'specific_services';
  specificServices?: string[];
}

export interface WaitlistEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  addedAt: number;
  estimatedWaitMins: number;
  status: 'waiting' | 'seated' | 'cancelled';
  notes: string;
}

export interface SpaRoom {
  id: string;
  roomName: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentClient?: string;
  assignedTherapist?: string;
  occupiedUntil?: number; // timestamp
  notes: string;
}

export interface ConsentFormRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  dateSigned: string;
  medicalNotes: string;
  hasAllergies: boolean;
  signatureImage?: string;
  status: 'signed' | 'pending';
}

export interface TailorOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  measurementProfileId?: string;
  garmentType: string;
  receivedDate: string;
  dueDate: string;
  fabricDetails: string;
  totalAmount: number;
  advancePaid: number;
  status: 'pending' | 'cutting' | 'stitching' | 'trial_ready' | 'completed' | 'delivered';
  notes: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  type: 'part' | 'labor';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RepairEstimate {
  id: string;
  clientName: string;
  clientPhone: string;
  vehicleInfo: string;
  dateCreated: string;
  items: EstimateItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
  notes: string;
  issueImages?: string[];
}

export interface RetailSaleItem {
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RetailSale {
  id: string;
  dateStr: string;
  clientName?: string;
  clientPhone?: string;
  items: RetailSaleItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface BusinessProfile {
  uid: string; name: string; businessName: string; businessType: BusinessCategory;
  location: string; phone: string;
  photoURL: string; bannerImageURL: string; services: ServiceItem[];
  isOpen: boolean; isBreak: boolean; isStopped: boolean;
  currentToken: number; totalTokensToday: number; breakStartTime: number | null;
  createdAt: any; rating?: number; totalReviews?: number; totalEarnings?: number;
  subscription?: string | null; subscriptionExpiry?: number | null;
  upiId?: string; businessHours?: string; bio?: string; instagram?: string;
  website?: string;
  referralCode?: string; totalCustomersAllTime?: number; lat?: number; lng?: number;
  fcmToken?: string; queueDelayMinutes?: number;
  staffMembers?: StaffMember[];
  taxSettings?: TaxSettings[];
  blockedDates?: string[];
  products?: { id: string; name: string; price: number; stock?: number }[];
  promoCodes?: { code: string; type: 'percentage' | 'flat'; value: number; active: boolean }[];
  maxCapacity?: number; // Auto-pause limit for queues
  franchiseId?: string;
  stories?: Story[];
  menuItems?: MenuItem[];
  tableLayout?: TableItem[];
  memberships?: PricingPlan[]; // For gyms
  gymMembers?: UserMembership[]; // For gyms (Phase 49)
  coachingBatches?: CoachingBatch[]; // For tutors/coaching
  mockTests?: MockTest[]; // For coaching/tutors (Phase 50)
  doctors?: DoctorProfile[]; // For hospitals (Phase 51)
  patientRecords?: PatientRecord[]; // For hospitals (Phase 52)
  kundaliCharts?: KundaliChart[]; // For astrologers (Phase 53)
  savedMuhurats?: Muhurat[]; // For astrologers (Phase 54)
  homeTuitionStudents?: HomeTuitionStudent[]; // For tutors (Phase 55)
  assignments?: Assignment[]; // For tutors (Phase 56)
  carWashBats?: CarWashBay[]; // For Car Wash (Phase 57)
  washPasses?: WashPass[]; // For Car Wash (Phase 58)
  bridalPackages?: BridalPackage[]; // For Mehendi (Phase 59)
  feedbackRequests?: FeedbackRequest[]; // For Core (Phase 60)
  tailorMeasurements?: MeasurementProfile[]; // For Tailors (Phase 61)
  tailorFabrics?: FabricStock[]; // For Tailors (Phase 62)
  mechanicSpareParts?: SparePartItem[]; // For Mechanics (Phase 63)
  mechanicServiceHistory?: VehicleServiceRecord[]; // For Mechanics (Phase 64)
  lawyerCaseFiles?: CaseFileItem[]; // For Lawyers (Phase 65)
  lawyerHearings?: CourtHearingItem[]; // For Lawyers (Phase 66)
  consultantBookings?: ConsultationBooking[]; // For Consultants (Phase 67)
  acRepairAMCs?: MaintenanceContract[]; // For AC Repair (Phase 68)
  acRepairDispatches?: TechnicianDispatch[]; // For AC Repair (Phase 69)
  referralSettings?: ReferralSettings; // Phase 70
  clinicVaccinations?: VaccinationRecord[]; // For Clinics/Pets (Phase 71)
  clinicPrescriptions?: DigitalRx[]; // For Clinics (Phase 72)
  astrologyKundalis?: KundaliRecord[]; // For Astrologers (Phase 73)
  astrologyMuhurats?: MuhuratRecord[]; // For Astrologers (Phase 74)
  tutorStudents?: StudentProgress[]; // For Tutors (Phase 75)
  tutorBatches?: BatchSchedule[]; // For Tutors (Phase 76)
  inventory?: InventoryItem[]; // Core (Phase 77)
  pricingRules?: DynamicPricingRule[]; // Core (Phase 78)
  waitlist?: WaitlistEntry[]; // Core (Phase 79)
  spaRooms?: SpaRoom[]; // For Spas (Phase 80)
  consentForms?: ConsentFormRecord[]; // Spa/Tattoo (Phase 81)
  tailorOrders?: TailorOrder[]; // For Tailors (Phase 82)
  repairEstimates?: RepairEstimate[]; // Mechanics (Phase 83)
  retailSales?: RetailSale[]; // Beauty & Salon (Phase 84)
  portfolioImages?: string[]; // Legacy
  portfolioItems?: PortfolioItem[]; // For Tattoo/Mehendi (Phase 44)
  eventBookings?: EventBooking[]; // For Mehendi/Event Management (Phase 45)
  departments?: HospitalDepartment[]; // For hospitals (Phase 34)
  packages?: ServicePackage[]; // Bundled services like Bridal Packages (Phase 37)
  rooms?: { id: string; name: string; capacity?: number }[]; // For Spas (Phase 38)
  students?: StudentProfile[]; // For Coaching (Phase 39)
  attendance?: AttendanceRecord[]; // For Coaching (Phase 39)
  groupClasses?: GroupClass[]; // For Gyms (Phase 40)
  announcement?: string; // Phase 79: Marquee text
  isPaused?: boolean;      // Section 3: Smart Business Toolkit
  customServices?: ServiceItem[]; // Section 3: Service Menu Builder
  blockedCustomerIds?: string[]; // Section 3: Smart Business Toolkit
  // Legacy compat
  salonName?: string;
  salonImageURL?: string;
}

// Legacy alias — so old imports like `import { BarberProfile }` still work
export type BarberProfile = BusinessProfile;

export interface CustomerProfile {
  uid: string; name: string; phone: string; location: string; photoURL: string;
  favoriteSalons: string[]; subscription: string | null; createdAt: any;
  referralCode?: string; totalVisits?: number; referredBy?: string;
  fcmToken?: string; totalNoShows?: number;
  lat?: number; lng?: number;
  activeMemberships?: UserMembership[];
  pets?: PetProfile[];
  loyaltyPoints?: number;
  currentStreak?: number;
  notiPush?: boolean;
  notiWhatsapp?: boolean;
  notiQuiet?: boolean;
  following?: string[];
  referralCode?: string;
  referralPoints?: number;
  noShowStrikes?: number; // Section 3: Smart Business Toolkit
}

export interface Prescription {
  symptoms: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; days: string }[];
  notes?: string;
}

export interface TokenEntry {
  id?: string; salonId: string; salonName: string; customerId: string;
  customerName: string; customerPhone: string; tokenNumber: number;
  selectedServices: ServiceItem[]; totalTime: number; totalPrice: number;
  estimatedWaitMinutes: number; status: 'waiting' | 'serving' | 'done' | 'cancelled' | 'no-show';
  createdAt: any; date: string; isAdvanceBooking: boolean; advanceDate?: string; rating?: number;
  assignedStaffId?: string;
  isTatkal?: boolean;
  tatkalFee?: number;
  groupSize?: number;
  promoCode?: string;
  discountAmount?: number;
  specialInstructions?: string;
  tipAmount?: number;
  repairStatus?: 'Received' | 'Diagnosed' | 'Parts Ordered' | 'Ready'; // Phase 31
  caseStatus?: 'Consultation' | 'Filing' | 'Hearing' | 'Closed'; // Phase 33
  photographyStatus?: 'Scheduled' | 'Shooting' | 'Editing' | 'Delivered'; // Phase 35
  deliveryLink?: string; // Phase 35
  prescription?: Prescription; // Phase 36
  assignedRoomId?: string; // Phase 38
  petHealthLog?: PetHealthLog; // Phase 41
  isPaused?: boolean;     // Section 1: Hold Spot / Re-queue
  transferredTo?: string; // Section 1: Token Transfer
  aiWaitPrediction?: number; // Section 1: AI Predictor
  internalNotes?: string;   // Section 3: Smart Business Toolkit
}

export interface MessageEntry {
  id?: string; salonId: string; salonName: string;
  senderId: string; senderName: string; senderPhoto: string;
  senderRole: 'customer' | 'business';
  customerId?: string; customerName?: string; customerPhoto?: string;
  message: string; createdAt: any; read: boolean;
}

export interface DayStat { date: string; dayName: string; count: number; revenue: number; cancelled: number; staffRevenue?: Record<string, number>; }

const OWNER_EMAIL = 'satyamkumar56021@gmail.com';

interface AppContextType {
  lang: Lang; setLang: (l: Lang) => void;
  role: Role | null; setRole: (r: Role | null) => void;
  user: User | null; loading: boolean;
  isOwner: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string) => Promise<any>;
  signOutUser: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  customerProfile: CustomerProfile | null;
  setCustomerProfile: (p: CustomerProfile | null) => void;
  saveCustomerProfile: (p: CustomerProfile) => Promise<void>;
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (p: BusinessProfile | null) => void;
  saveBusinessProfile: (p: BusinessProfile) => Promise<boolean>;
  retrySyncBusinessProfile: () => Promise<boolean>;
  syncPending: boolean;
  uploadPhoto: (file: File, folder: string) => Promise<string>;
  getToken: (token: Omit<TokenEntry, 'id'>) => Promise<string | null>;
  cancelToken: (tokenId: string) => Promise<void>;
  pauseToken: (tokenId: string) => Promise<void>;
  resumeToken: (tokenId: string) => Promise<void>;
  transferToken: (tokenId: string, newCustomerPhone: string, newCustomerName: string) => Promise<void>;
  addWalkInCustomer: (customerName: string, selectedServices: ServiceItem[]) => Promise<string | null>;
  markNoShow: (tokenId: string, customerId: string) => Promise<void>;
  setQueueDelay: (minutes: number) => Promise<void>;
  assignTokenToStaff: (tokenId: string, staffId: string) => Promise<void>;
  rateToken: (tokenId: string, rating: number) => Promise<void>;
  searchBusinesses: (q: string) => Promise<BusinessProfile[]>;
  getBusinessById: (id: string) => Promise<BusinessProfile | null>;
  getSalonTokens: (salonId: string, date: string) => Promise<TokenEntry[]>;
  getCustomerTokens: (customerId: string) => Promise<TokenEntry[]>;
  getCustomerFullHistory: (customerId: string) => Promise<TokenEntry[]>;
  allBusinesses: BusinessProfile[];
  nextCustomer: () => Promise<void>;
  toggleSalonOpen: () => Promise<void>;
  toggleSalonBreak: () => Promise<void>;
  toggleSalonStop: () => Promise<void>;
  continueTokens: () => Promise<void>;
  getBusinessFullStats: (days: number) => Promise<DayStat[]>;
  getBusinessTrialDaysLeft: () => number;
  toggleQueuePause: (paused: boolean) => Promise<void>;
  updateTokenNotes: (tokenId: string, notes: string) => Promise<void>;
  blockCustomer: (customerId: string) => Promise<void>;
  unblockCustomer: (customerId: string) => Promise<void>;
  updateBusinessServices: (services: ServiceItem[]) => Promise<void>;
  isBusinessTrialActive: () => boolean;
  isBusinessSubscribed: () => boolean;
  addReview: (review: Omit<ReviewEntry, 'id'>) => Promise<void>;
  getSalonReviews: (salonId: string) => Promise<ReviewEntry[]>;
  getTodayEarnings: () => Promise<number>;
  sendMessage: (msg: Omit<MessageEntry, 'id'>) => Promise<void>;
  useChatMessages: (salonId: string) => MessageEntry[];
  notifications: NotificationEntry[]; unreadCount: number;
  pushNotification: (userId: string, notif: Omit<NotificationEntry, 'id' | 'userId' | 'read' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  toggleFavorite: (salonId: string) => void;
  isFavorite: (salonId: string) => boolean;
  getUserLocation: () => Promise<{ lat: number; lng: number } | null>;
  requestNotificationPermission: () => Promise<void>;
  t: (key: string) => string;
  theme: 'dark' | 'light'; toggleTheme: () => void;
  // ── Legacy backward-compat aliases ──
  allSalons: BusinessProfile[];
  barberProfile: BusinessProfile | null;
  saveBarberProfile: (p: BusinessProfile) => Promise<boolean>;
  getSalonById: (id: string) => Promise<BusinessProfile | null>;
  searchSalons: (query: string) => Promise<BusinessProfile[]>;
  getBarberFullStats: (days: number) => Promise<DayStat[]>;
  isBarberTrialActive: () => boolean;
  getBarberTrialDaysLeft: () => number;
  isBarberSubscribed: () => boolean;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

const translations: Record<string, Record<Lang, string>> = {
  'app.name': { en: 'Line Free India', hi: 'लाइन फ्री इंडिया' },
  'app.tagline': { en: 'India\'s #1 Beauty & Wellness SuperApp', hi: 'भारत का #1 ब्यूटी और वेलनेस ऐप' },
  'lang.select': { en: 'Select Language', hi: 'भाषा चुनें' },
  'role.select': { en: 'Continue as', hi: 'के रूप में जारी रखें' },
  'role.customer': { en: 'Customer', hi: 'ग्राहक' },
  'role.business': { en: 'Business Owner', hi: 'बिज़नेस ओनर' },
  'role.barber': { en: 'Business Owner', hi: 'बिज़नेस ओनर' },
  'auth.login': { en: 'Login', hi: 'लॉगिन' },
  'auth.google': { en: 'Continue with Google', hi: 'Google से लॉगिन करें' },
  'auth.logout': { en: 'Logout', hi: 'लॉगआउट' },
  'profile.setup': { en: 'Setup Profile', hi: 'प्रोफाइल सेटअप' },
  'profile.name': { en: 'Name', hi: 'नाम' },
  'profile.phone': { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  'profile.location': { en: 'Location', hi: 'लोकेशन' },
  'profile.businessName': { en: 'Business Name', hi: 'बिज़नेस का नाम' },
  'profile.salonName': { en: 'Business Name', hi: 'बिज़नेस का नाम' },
  'profile.optional': { en: '(Optional)', hi: '(वैकल्पिक)' },
  'btn.continue': { en: 'Continue', hi: 'जारी रखें' },
  'btn.skip': { en: 'Skip', hi: 'छोड़ें' },
  'btn.save': { en: 'Save', hi: 'सेव करें' },
  'btn.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'btn.back': { en: 'Back', hi: 'वापस' },
  'btn.next': { en: 'Next', hi: 'अगला' },
  'btn.getToken': { en: 'Get Token', hi: 'टोकन लें' },
  'btn.cancelToken': { en: 'Cancel Token', hi: 'टोकन रद्द करें' },
  'home': { en: 'Home', hi: 'होम' },
  'search': { en: 'Search', hi: 'खोजें' },
  'tokens': { en: 'Activity', hi: 'गतिविधि' },
  'profile': { en: 'Profile', hi: 'प्रोफाइल' },
  'subscription': { en: 'Subscription', hi: 'सब्सक्रिप्शन' },
  'hairstyles': { en: 'Explore', hi: 'एक्सप्लोर' },
  'business.open': { en: 'Open Business', hi: 'बिज़नेस खोलें' },
  'business.close': { en: 'Close Business', hi: 'बिज़नेस बंद करें' },
  'business.break': { en: 'Take Break', hi: 'ब्रेक लें' },
  'business.endBreak': { en: 'End Break', hi: 'ब्रेक खत्म' },
  'business.closed': { en: 'Business is Closed', hi: 'बिज़नेस बंद है' },
  'business.onBreak': { en: 'On Break', hi: 'ब्रेक पर' },
  'business.isOpen': { en: 'Business is Open', hi: 'बिज़नेस खुला है' },
  'salon.open': { en: 'Open Business', hi: 'बिज़नेस खोलें' },
  'salon.close': { en: 'Close Business', hi: 'बिज़नेस बंद करें' },
  'salon.break': { en: 'Take Break', hi: 'ब्रेक लें' },
  'salon.endBreak': { en: 'End Break', hi: 'ब्रेक खत्म' },
  'salon.closed': { en: 'Business is Closed', hi: 'बिज़नेस बंद है' },
  'salon.onBreak': { en: 'On Break', hi: 'ब्रेक पर' },
  'salon.isOpen': { en: 'Business is Open', hi: 'बिज़नेस खुला है' },
  'queue': { en: 'Queue', hi: 'कतार' },
  'queue.customers': { en: 'Customers in Queue', hi: 'कतार में ग्राहक' },
  'queue.next': { en: 'Next Customer', hi: 'अगला ग्राहक' },
  'queue.stop': { en: 'Stop Tokens', hi: 'टोकन बंद करें' },
  'queue.continue': { en: 'Continue Tokens', hi: 'टोकन जारी रखें' },
  'queue.current': { en: 'Current Token', hi: 'वर्तमान टोकन' },
  'queue.total': { en: 'Total Tokens', hi: 'कुल टोकन' },
  'queue.waiting': { en: 'Waiting', hi: 'इंतज़ार' },
  'queue.peopleBefore': { en: 'people before you', hi: 'लोग आपसे पहले' },
  'queue.estTime': { en: 'Estimated wait', hi: 'अनुमानित इंतज़ार' },
  'queue.yourToken': { en: 'Your Token', hi: 'आपका टोकन' },
  'services': { en: 'Services', hi: 'सेवाएं' },
  'services.add': { en: 'Add Service', hi: 'सेवा जोड़ें' },
  'services.select': { en: 'Select Services', hi: 'सेवाएं चुनें' },
  'min': { en: 'min', hi: 'मिनट' },
  'rs': { en: '₹', hi: '₹' },
  'today': { en: 'Today', hi: 'आज' },
  'favorites': { en: 'Favorites', hi: 'पसंदीदा' },
  'no.results': { en: 'No results found', hi: 'कोई परिणाम नहीं' },
  'sub.customer.title': { en: 'Customer Subscription', hi: 'ग्राहक सब्सक्रिप्शन' },
  'sub.business.title': { en: 'Business Subscription', hi: 'बिज़नेस सब्सक्रिप्शन' },
  'sub.barber.title': { en: 'Business Subscription', hi: 'बिज़नेस सब्सक्रिप्शन' },
  'error': { en: 'Something went wrong', hi: 'कुछ गलत हो गया' },
  'loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'earnings': { en: 'Earnings', hi: 'कमाई' },
  'reviews': { en: 'Reviews', hi: 'रिव्यू' },
  'share': { en: 'Share', hi: 'शेयर करें' },
  'pay': { en: 'Pay', hi: 'भुगतान करें' },
  'trial': { en: 'Free Trial', hi: 'फ्री ट्रायल' },
  'trial.active': { en: 'Trial Active', hi: 'ट्रायल चालू' },
  'trial.expired': { en: 'Trial Expired', hi: 'ट्रायल खत्म' },
  'nearby': { en: 'Nearby Businesses', hi: 'आस-पास के बिज़नेस' },
  'featured': { en: 'Featured Businesses', hi: 'फीचर्ड बिज़नेस' },
  'all.businesses': { en: 'All Businesses', hi: 'सभी बिज़नेस' },
  'all.salons': { en: 'All Businesses', hi: 'सभी बिज़नेस' },
  'open.now': { en: 'Open Now', hi: 'अभी खुला' },
  'refer': { en: 'Refer & Earn', hi: 'रेफर करें और कमाएं' },
  'analytics': { en: 'Analytics', hi: 'एनालिटिक्स' },
  'history': { en: 'History', hi: 'इतिहास' },
  'notifications': { en: 'Notifications', hi: 'नोटिफिकेशन' },
  'delete.account': { en: 'Delete Account', hi: 'अकाउंट डिलीट करें' },
};

// Helper to normalize legacy barber profiles
const normalizeBusinessProfile = (data: any): BusinessProfile => ({
  ...data,
  businessName: data.businessName || data.salonName || 'My Business',
          businessType: ((data.businessType as string) === 'salon' ? 'men_salon' : data.businessType) || 'men_salon',
  bannerImageURL: data.bannerImageURL || data.salonImageURL || '',
  // Keep legacy fields for compat
  salonName: data.businessName || data.salonName || 'My Business',
  salonImageURL: data.bannerImageURL || data.salonImageURL || '',
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lf_lang') as Lang) || 'en');
  const [role, setRoleState] = useState<Role | null>(() => {
    const saved = localStorage.getItem('lf_role') as string | null;
    if (saved === 'barber') return 'business'; // Legacy compat
    return saved as Role | null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfileState] = useState<CustomerProfile | null>(null);
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [syncPending, setSyncPending] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('lf_theme') as 'dark' | 'light') || 'dark');

  const isOwner = user?.email === OWNER_EMAIL;

  useEffect(() => { document.documentElement.classList.toggle('light', theme === 'light'); localStorage.setItem('lf_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');
  const t = (key: string) => translations[key]?.[lang] || key;
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('lf_lang', l); };
  const setRole = (r: Role | null) => { setRoleState(r); r ? localStorage.setItem('lf_role', r) : localStorage.removeItem('lf_role'); };
  const setCustomerProfile = (p: CustomerProfile | null) => { setCustomerProfileState(p); p ? localStorage.setItem('lf_customer', JSON.stringify(p)) : localStorage.removeItem('lf_customer'); };
  const setBusinessProfile = (p: BusinessProfile | null) => { setBusinessProfileState(p); p ? localStorage.setItem('lf_barber', JSON.stringify(p)) : localStorage.removeItem('lf_barber'); };

  // ── Real-time businesses (reads from both 'barbers' + 'businesses' for migration) ──
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'barbers'), snap => {
      const s = snap.docs.map(d => normalizeBusinessProfile(d.data()));
      s.sort((a, b) => ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0));
      setAllBusinesses(s);
    }, err => console.warn('Business listener:', err));
    return () => unsub();
  }, []);

  // ── Real-time notifications ──
  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationEntry));
      notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(notifs.slice(0, 50));
    }, () => {});
    return () => unsub();
  }, [user]);

  // ── Foreground Push Messages ──
  useEffect(() => {
    try {
      const unsub = onMessage(messaging, (payload) => {
        console.log('Foreground Push Notification:', payload);
      });
      return () => unsub();
    } catch {}
  }, []);

  // ── Auth state ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        const savedRole = localStorage.getItem('lf_role') as string | null;
        const effectiveRole = savedRole === 'barber' ? 'business' : savedRole;
        if (effectiveRole === 'customer') {
          try { const snap = await getDoc(doc(db, 'customers', u.uid)); if (snap.exists()) setCustomerProfile(snap.data() as CustomerProfile); else { const l = localStorage.getItem('lf_customer'); if (l) try { setCustomerProfileState(JSON.parse(l)); } catch {} } } catch { const l = localStorage.getItem('lf_customer'); if (l) try { setCustomerProfileState(JSON.parse(l)); } catch {} }
        } else if (effectiveRole === 'business') {
          try { const snap = await getDoc(doc(db, 'barbers', u.uid)); if (snap.exists()) setBusinessProfile(normalizeBusinessProfile(snap.data())); else { const l = localStorage.getItem('lf_barber'); if (l) try { setBusinessProfileState(normalizeBusinessProfile(JSON.parse(l))); } catch {} } } catch { const l = localStorage.getItem('lf_barber'); if (l) try { setBusinessProfileState(normalizeBusinessProfile(JSON.parse(l))); } catch {} }
        }
        
        // FCM Push Notification Registration
        try {
          if ('Notification' in window && Notification.permission !== 'denied') {
            const fcmToken = await getFCMToken(messaging);
            if (fcmToken) {
              await setDoc(doc(db, 'fcmTokens', u.uid), { token: fcmToken, updatedAt: Date.now() }, { merge: true });
            }
          }
        } catch(e) { console.warn('FCM Registration Skipped:', e); }

      } else { setCustomerProfileState(null); setBusinessProfileState(null); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    try { await setPersistence(auth, browserLocalPersistence); } catch (_) {}
    const r = await signInWithPopup(auth, googleProvider);
    return r;
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try { await setPersistence(auth, browserLocalPersistence); } catch (_) {}
    return await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try { await setPersistence(auth, browserLocalPersistence); } catch (_) {}
    return await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOutUser = async () => {
    try { await fbSignOut(auth); } catch {}
    setUser(null); setRole(null); setCustomerProfile(null); setBusinessProfile(null);
    localStorage.removeItem('lf_role'); localStorage.removeItem('lf_customer'); localStorage.removeItem('lf_barber');
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      const colls = role === 'customer'
        ? [['customers', user.uid], ['tokens', 'customerId'], ['notifications', 'userId']]
        : [['barbers', user.uid], ['tokens', 'salonId'], ['reviews', 'salonId'], ['notifications', 'userId'], ['messages', 'salonId']];
      for (const [coll, field] of colls) {
        try {
          if (field === user.uid) { await deleteDoc(doc(db, coll, user.uid)); }
          else { const snap = await getDocs(query(collection(db, coll), where(field, '==', user.uid))); await Promise.all(snap.docs.map(d => deleteDoc(doc(db, coll, d.id)))); }
        } catch {}
      }
      await deleteUser(user);
      await signOutUser();
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'auth/requires-recent-login') {
        try { await reauthenticateWithPopup(user, googleProvider); return deleteAccount(); } catch { return { success: false, error: 'Re-auth failed.' }; }
      }
      return { success: false, error: e?.message || 'Failed' };
    }
  };

  const uploadPhoto = async (file: File, folder: string) => uploadToCloudinary(file, folder);

  const saveCustomerProfile = async (p: CustomerProfile) => {
    if (!p.referralCode) p = { ...p, referralCode: `LF${p.uid.slice(0, 6).toUpperCase()}` };
    setCustomerProfile(p);
    try { await setDoc(doc(db, 'customers', p.uid), p, { merge: true }); } catch (e) { console.warn('Save failed:', e); }
  };

  const pendingRef = { current: null as BusinessProfile | null };
  const firestoreRetry = async (fn: () => Promise<void>, retries = 3): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try { await fn(); return true; } catch { if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
    }
    return false;
  };

  const syncBusinessToFirestore = async (p: BusinessProfile) => {
    setSyncPending(true);
    if (!p.referralCode) p = { ...p, referralCode: `LF${p.uid.slice(0, 6).toUpperCase()}` };
    // Keep salonName in sync for legacy compat
    p.salonName = p.businessName;
    p.salonImageURL = p.bannerImageURL;
    const ok = await firestoreRetry(() => setDoc(doc(db, 'barbers', p.uid), p, { merge: true }));
    if (ok) { setSyncPending(false); pendingRef.current = null; } else { pendingRef.current = p; }
    return ok;
  };

  useEffect(() => { const iv = setInterval(() => { if (pendingRef.current) syncBusinessToFirestore(pendingRef.current); }, 10000); return () => clearInterval(iv); }, []);

  const saveBusinessProfile = async (p: BusinessProfile) => { setBusinessProfile(p); return syncBusinessToFirestore(p); };
  const retrySyncBusinessProfile = async () => businessProfile ? syncBusinessToFirestore(businessProfile) : false;

  const searchBusinesses = async (q: string) => {
    if (!q.trim()) return allBusinesses;
    const l = q.toLowerCase();
    return allBusinesses.filter(s => s.businessName?.toLowerCase().includes(l) || s.salonName?.toLowerCase().includes(l) || s.name?.toLowerCase().includes(l) || s.location?.toLowerCase().includes(l) || s.services?.some(sv => sv.name.toLowerCase().includes(l)) || s.businessType?.toLowerCase().includes(l));
  };

  const getBusinessById = async (id: string) => {
    const c = allBusinesses.find(s => s.uid === id);
    if (c) return c;
    try { const snap = await getDoc(doc(db, 'barbers', id)); if (snap.exists()) return normalizeBusinessProfile(snap.data()); } catch {}
    return null;
  };

  const getTodayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

  const getSalonTokens = async (salonId: string, date: string): Promise<TokenEntry[]> => {
    try {
      const q = query(collection(db, 'tokens'), where('salonId', '==', salonId));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
      return all.filter(t => t.date === date);
    } catch (e) { console.error('getSalonTokens error:', e); return []; }
  };

  const getCustomerTokens = async (customerId: string): Promise<TokenEntry[]> => {
    try {
      const today = getTodayStr();
      const q = query(collection(db, 'tokens'), where('customerId', '==', customerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry)).filter(t => t.date === today);
    } catch (e) { console.error('getCustomerTokens error:', e); return []; }
  };

  const getCustomerFullHistory = async (customerId: string): Promise<TokenEntry[]> => {
    try {
      const q = query(collection(db, 'tokens'), where('customerId', '==', customerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry)).sort((a, b) => ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0));
    } catch { return []; }
  };

  const getToken = async (token: Omit<TokenEntry, 'id'>): Promise<string | null> => {
    try {
      if (!user) {
        console.error('getToken failure: User not authenticated');
        return null;
      }

      // ── Check if Blocked ──
      const bizSnap = await getDoc(doc(db, 'barbers', token.salonId));
      if (bizSnap.exists()) {
        const bizData = bizSnap.data() as BusinessProfile;
        if (bizData.blockedCustomerIds?.includes(user.uid)) {
          console.warn('getToken failure: User is blocked by this business');
          alert('Sorry, you have been blocked from booking at this business.');
          return null;
        }
      }

      // Firestore fails if any field is undefined. Sanitize input.
      const sanitizedToken = JSON.parse(JSON.stringify(token, (key, value) => 
        value === undefined ? null : value
      ));

      console.log('Attempting to create token:', sanitizedToken);
      const ref = await addDoc(collection(db, 'tokens'), sanitizedToken);
      const tokenId = ref.id;
      
      setTimeout(async () => {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: sanitizedToken.customerId,
            title: '🎫 Token Confirmed!',
            body: `Token #${sanitizedToken.tokenNumber} at ${sanitizedToken.salonName}. Est. wait: ${sanitizedToken.estimatedWaitMinutes} min`,
            type: 'token_ready',
            data: { salonId: sanitizedToken.salonId, tokenNumber: sanitizedToken.tokenNumber },
            read: false, createdAt: Date.now(),
          });
        } catch (_) {}
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: sanitizedToken.salonId,
            title: '🔔 New Customer!',
            body: `${sanitizedToken.customerName} booked Token #${sanitizedToken.tokenNumber}`,
            type: 'token_ready',
            data: { tokenId },
            read: false, createdAt: Date.now(),
          });
        } catch (_) {}
      }, 0);
      return tokenId;
    } catch (e: any) {
      console.error('getToken Critical Error:', e);
      return null;
    }
  };


  const cancelToken = async (tokenId: string) => { try { await updateDoc(doc(db, 'tokens', tokenId), { status: 'cancelled' }); } catch {} };
  const pauseToken = async (tokenId: string) => { try { await updateDoc(doc(db, 'tokens', tokenId), { isPaused: true }); } catch {} };
  const resumeToken = async (tokenId: string) => { try { await updateDoc(doc(db, 'tokens', tokenId), { isPaused: false }); } catch {} };
  const transferToken = async (tokenId: string, newPhone: string, newName: string) => { try { await updateDoc(doc(db, 'tokens', tokenId), { customerPhone: newPhone, customerName: newName, transferredTo: newPhone }); } catch {} };
  
  const markNoShow = async (tokenId: string, customerId: string) => {
    try {
      await updateDoc(doc(db, 'tokens', tokenId), { status: 'no-show' });
      const snap = await getDoc(doc(db, 'customers', customerId));
      if (snap.exists()) {
        const c = snap.data() as CustomerProfile;
        await updateDoc(doc(db, 'customers', customerId), { 
          totalNoShows: (c.totalNoShows || 0) + 1,
          noShowStrikes: (c.noShowStrikes || 0) + 1 
        });
        await pushNotification(customerId, { 
          title: '🚨 Missed your turn?', 
          body: 'You were marked as no-show. 3 strikes may lead to temporary suspension!', 
          type: 'missed_turn' 
        });
      }
    } catch {}
  };

  const toggleQueuePause = async (paused: boolean) => {
    if (!businessProfile) return;
    if (paused) await broadcastBusinessNotification('⏸️ Token Service Paused', `${businessProfile.businessName} has temporarily paused taking new tokens. We will be back shortly!`);
    await saveBusinessProfile({ ...businessProfile, isPaused: paused });
  };

  const updateTokenNotes = async (tokenId: string, notes: string) => {
    try { await updateDoc(doc(db, 'tokens', tokenId), { internalNotes: notes }); } catch {}
  };

  const updateBusinessServices = async (services: ServiceItem[]) => {
    if (!businessProfile || !user) return;
    try { await updateDoc(doc(db, 'users', user.uid), { customServices: services }); setBusinessProfile({ ...businessProfile, customServices: services }); } catch {}
  };

  const blockCustomer = async (customerId: string) => {
    if (!businessProfile || !user) return;
    const blocked = businessProfile.blockedCustomerIds || [];
    if (!blocked.includes(customerId)) {
      const newList = [...blocked, customerId];
      await saveBusinessProfile({ ...businessProfile, blockedCustomerIds: newList });
    }
  };

  const unblockCustomer = async (customerId: string) => {
    if (!businessProfile || !user) return;
    const blocked = businessProfile.blockedCustomerIds || [];
    const newList = blocked.filter(id => id !== customerId);
    await saveBusinessProfile({ ...businessProfile, blockedCustomerIds: newList });
  };

  const setQueueDelay = async (minutes: number) => {
    if (!businessProfile) return;
    await saveBusinessProfile({ ...businessProfile, queueDelayMinutes: minutes });
  };

  const addWalkInCustomer = async (customerName: string, selectedServices: ServiceItem[]): Promise<string | null> => {
    if (!businessProfile || !user) return null;
    try {
      const today = getTodayStr();
      const allTokens = await getSalonTokens(user.uid, today);
      const tokenNumber = Math.max(0, ...allTokens.map(t => t.tokenNumber)) + 1;
      const totalTime = selectedServices.reduce((sum, s) => sum + s.avgTime, 0);
      const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
      
      const serving = allTokens.filter(t => t.status === 'serving').length;
      const waitingTokens = allTokens.filter(t => t.status === 'waiting');
      const waitTime = waitingTokens.reduce((sum, t) => sum + t.totalTime, 0) + (serving ? 15 : 0) + (businessProfile.queueDelayMinutes || 0);

      const token: Omit<TokenEntry, 'id'> = {
        salonId: user.uid,
        salonName: businessProfile.businessName,
        customerId: 'offline_walk_in',
        customerName: customerName,
        customerPhone: 'Walk-in',
        tokenNumber,
        selectedServices,
        totalTime,
        totalPrice,
        estimatedWaitMinutes: waitTime,
        status: 'waiting',
        createdAt: Date.now(),
        date: today,
        isAdvanceBooking: false
      };
      
      const ref = await addDoc(collection(db, 'tokens'), token);
      await saveBusinessProfile({ ...businessProfile, totalTokensToday: (businessProfile.totalTokensToday || 0) + 1 });
      return ref.id;
    } catch (e) {
      console.error('addWalkInCustomer error:', e);
      return null;
    }
  };

  const assignTokenToStaff = async (tokenId: string, staffId: string) => {
    try { await updateDoc(doc(db, 'tokens', tokenId), { assignedStaffId: staffId }); } catch {}
  };

  const rateToken = async (tokenId: string, rating: number) => { try { await updateDoc(doc(db, 'tokens', tokenId), { rating }); } catch {} };

  const nextCustomer = async () => {
    if (!businessProfile || !user) return;
    const today = getTodayStr();
    try {
      const allTokens = await getSalonTokens(user.uid, today);
      const serving = allTokens.filter(t => t.status === 'serving');
      const waiting = allTokens.filter(t => t.status === 'waiting').sort((a, b) => {
        if (a.isTatkal && !b.isTatkal) return -1;
        if (!a.isTatkal && b.isTatkal) return 1;
        return a.tokenNumber - b.tokenNumber;
      });
      await Promise.all(serving.map(t => updateDoc(doc(db, 'tokens', t.id!), { status: 'done' })));
      if (waiting.length > 0) {
        const next = waiting[0];
        await updateDoc(doc(db, 'tokens', next.id!), { status: 'serving' });
        try { await pushNotification(next.customerId, { title: '🔔 Your Turn!', body: `Token #${next.tokenNumber} — it's your turn at ${businessProfile.businessName}!`, type: 'token_called', data: { salonId: user.uid } }); } catch {}
        await saveBusinessProfile({ ...businessProfile, currentToken: next.tokenNumber });
      }
    } catch (e) { console.error('nextCustomer error:', e); }
  };

  const toggleSalonOpen = async () => { 
    if (!businessProfile) return; 
    const o = !businessProfile.isOpen; 
    if (!o) await broadcastBusinessNotification('⚠️ Business Closed', `${businessProfile.businessName} is now closed for the day. Any remaining tokens are cancelled.`);
    await saveBusinessProfile({ ...businessProfile, isOpen: o, isBreak: false, currentToken: o ? 0 : businessProfile.currentToken, totalTokensToday: o ? 0 : businessProfile.totalTokensToday }); 
  };
  const toggleSalonBreak = async () => { 
    if (!businessProfile) return; 
    const b = !businessProfile.isBreak; 
    if (b) await broadcastBusinessNotification('☕ Short Break', `${businessProfile.businessName} is on a short break. Your tokens are safe, wait times may slightly increase.`);
    await saveBusinessProfile({ ...businessProfile, isBreak: b, breakStartTime: b ? Date.now() : null }); 
  };
  const toggleSalonStop = async () => { 
    if (!businessProfile) return; 
    const isS = !businessProfile.isStopped;
    if (isS) await broadcastBusinessNotification('🛑 Tokens Paused', `${businessProfile.businessName} has temporarily stopped issuing new tokens to clear the current rush.`);
    await saveBusinessProfile({ ...businessProfile, isStopped: isS }); 
  };
  const continueTokens = async () => { 
    if (!businessProfile) return; 
    await broadcastBusinessNotification('✅ Tokens Resumed', `${businessProfile.businessName} is issuing tokens again!`);
    await saveBusinessProfile({ ...businessProfile, isStopped: false }); 
  };

  const broadcastBusinessNotification = async (title: string, body: string) => {
    if (!user || (role !== 'business' && role !== 'barber')) return;
    try {
      const tokens = await getSalonTokens(user.uid, getTodayStr());
      const eligible = tokens.filter(t => t.status === 'serving' || t.status === 'waiting');
      await Promise.all(eligible
        .filter(t => t.customerId && !t.customerId.startsWith('offline_'))
        .map(t => pushNotification(t.customerId, { title, body, type: 'business_broadcast' }))
      );
    } catch (e) { console.error('Broadcast failed:', e); }
  };

  const getBusinessFullStats = async (days: number): Promise<DayStat[]> => {
    if (!user) return [];
    const result: DayStat[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const dayName = d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
      try {
        const tks = await getSalonTokens(user.uid, dateStr);
        const done = tks.filter(t => t.status === 'done');
        const staffRev: Record<string, number> = {};
        done.forEach(t => {
          const sid = t.assignedStaffId || 'unassigned';
          staffRev[sid] = (staffRev[sid] || 0) + (t.totalPrice || 0);
        });
        result.push({ date: dateStr, dayName, count: done.length, revenue: done.reduce((a, c) => a + (c.totalPrice || 0), 0), cancelled: tks.filter(t => t.status === 'cancelled').length, staffRevenue: staffRev });
      } catch { result.push({ date: dateStr, dayName, count: 0, revenue: 0, cancelled: 0 }); }
    }
    return result;
  };

  const getBusinessTrialDaysLeft = () => { if (!businessProfile?.createdAt) return 30; const c = typeof businessProfile.createdAt === 'number' ? businessProfile.createdAt : Date.now(); return Math.max(0, 30 - Math.floor((Date.now() - c) / 86400000)); };
  const isBusinessTrialActive = () => getBusinessTrialDaysLeft() > 0;
  const isBusinessSubscribed = () => isBusinessTrialActive() || (!!(businessProfile?.subscriptionExpiry) && businessProfile.subscriptionExpiry! > Date.now());

  const addReview = async (review: Omit<ReviewEntry, 'id'>) => {
    try {
      await addDoc(collection(db, 'reviews'), review);
      const snap = await getDocs(query(collection(db, 'reviews'), where('salonId', '==', review.salonId)));
      const all = snap.docs.map(d => d.data() as ReviewEntry);
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      await updateDoc(doc(db, 'barbers', review.salonId), { rating: Math.round(avg * 10) / 10, totalReviews: all.length });
      try { await pushNotification(review.salonId, { title: '⭐ New Review!', body: `${review.customerName} gave ${review.rating} stars`, type: 'review' }); } catch {}
    } catch {}
  };

  const getSalonReviews = async (salonId: string): Promise<ReviewEntry[]> => {
    try {
      const snap = await getDocs(query(collection(db, 'reviews'), where('salonId', '==', salonId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReviewEntry)).sort((a, b) => ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0));
    } catch { return []; }
  };

  const getTodayEarnings = async () => {
    if (!user) return 0;
    try {
      const tks = await getSalonTokens(user.uid, getTodayStr());
      return tks.filter(t => t.status === 'done').reduce((s, t) => s + (t.totalPrice || 0), 0);
    } catch { return 0; }
  };

  const sendMessage = async (msg: Omit<MessageEntry, 'id'>) => {
    try { await addDoc(collection(db, 'messages'), { ...msg, createdAt: Date.now() }); } catch (e) { console.error('sendMessage error:', e); }
  };

  const useChatMessages = (salonId: string): MessageEntry[] => {
    const [msgs, setMsgs] = useState<MessageEntry[]>([]);
    useEffect(() => {
      if (!salonId) return;
      const q = query(collection(db, 'messages'), where('salonId', '==', salonId));
      const unsub = onSnapshot(q, snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageEntry));
        all.sort((a, b) => ((a.createdAt as number) || 0) - ((b.createdAt as number) || 0));
        setMsgs(all);
      }, err => console.warn('Chat listener:', err));
      return () => unsub();
    }, [salonId]);
    return msgs;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const pushNotification = async (userId: string, notif: Omit<NotificationEntry, 'id' | 'userId' | 'read' | 'createdAt'>) => {
    if (!userId || userId.startsWith('offline_')) {
      // Walk-in/guest tokens are not tied to a registered user for external push delivery.
      await addDoc(collection(db, 'notifications'), { ...notif, userId, read: false, createdAt: Date.now() });
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'customers', userId));
      let shouldPush = true;
      let shouldWhatsapp = true;
      let quiet = false;

      if (snap.exists()) {
        const profile = snap.data() as CustomerProfile;
        shouldPush = profile.notiPush ?? true;
        shouldWhatsapp = profile.notiWhatsapp ?? true;
        quiet = profile.notiQuiet ?? false;
      }

      if (quiet) return; // Skip all if quiet mode is on

      // Always save to internal history
      await addDoc(collection(db, 'notifications'), { ...notif, userId, read: false, createdAt: Date.now() });

      // Simulate External Push (FCM/WhatsApp)
      if (shouldPush) console.log(`[FCM PUSH] to ${userId}: ${notif.title}`);
      if (shouldWhatsapp) console.log(`[WHATSAPP] to ${userId}: ${notif.title}`);
    } catch (e) {
      // Fallback: silently save notification if profile fetch fails
      try { await addDoc(collection(db, 'notifications'), { ...notif, userId, read: false, createdAt: Date.now() }); } catch {}
    }
  };

  const markNotificationRead = async (id: string) => { try { await updateDoc(doc(db, 'notifications', id), { read: true }); } catch {} };
  const markAllNotificationsRead = async () => { await Promise.all(notifications.filter(n => !n.read).map(n => markNotificationRead(n.id!))); };

  const requestNotificationPermission = async () => {
    if (!user) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getFCMToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' }).catch(() => null);
        if (token) {
           if (role === 'customer' && customerProfile) saveCustomerProfile({ ...customerProfile, fcmToken: token });
           else if (role === 'business' && businessProfile) saveBusinessProfile({ ...businessProfile, fcmToken: token });
        } else {
           console.warn('FCM token generation failed (missing VAPID key in code)');
        }
      }
    } catch (e) { console.warn('Push permission failed:', e); }
  };

  const toggleFavorite = (salonId: string) => {
    if (!customerProfile) return;
    const favs = customerProfile.favoriteSalons || [];
    saveCustomerProfile({ ...customerProfile, favoriteSalons: favs.includes(salonId) ? favs.filter(id => id !== salonId) : [...favs, salonId] });
  };
  const isFavorite = (salonId: string) => (customerProfile?.favoriteSalons || []).includes(salonId);

  const getUserLocation = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise(resolve => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });

  return (
    <AppContext.Provider value={{
      lang, setLang, role, setRole, user, loading, isOwner,
      signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, deleteAccount,
      customerProfile, setCustomerProfile, saveCustomerProfile,
      businessProfile, setBusinessProfile, saveBusinessProfile, retrySyncBusinessProfile: retrySyncBusinessProfile, syncPending,
      uploadPhoto,
      getToken, cancelToken, pauseToken, resumeToken, transferToken, markNoShow, setQueueDelay, assignTokenToStaff, rateToken, addWalkInCustomer,
      searchBusinesses, getBusinessById, getSalonTokens, getCustomerTokens, getCustomerFullHistory,
      allBusinesses,
      nextCustomer, toggleSalonOpen, toggleSalonBreak, toggleSalonStop, continueTokens,
      getBusinessFullStats,
      getBusinessTrialDaysLeft: getBusinessTrialDaysLeft, isBusinessTrialActive: isBusinessTrialActive, isBusinessSubscribed: isBusinessSubscribed,
      toggleQueuePause, updateTokenNotes, updateBusinessServices,
      addReview, getSalonReviews, getTodayEarnings,
      sendMessage, useChatMessages,
      notifications, unreadCount, pushNotification, markNotificationRead, markAllNotificationsRead,
      toggleFavorite, isFavorite, getUserLocation, requestNotificationPermission,
      t, theme, toggleTheme,
      // ── Legacy backward-compat aliases ──
      allSalons: allBusinesses,
      barberProfile: businessProfile,
      saveBarberProfile: saveBusinessProfile,
      getSalonById: getBusinessById,
      searchSalons: searchBusinesses,
      getBarberFullStats: getBusinessFullStats,
      isBarberTrialActive: isBusinessTrialActive,
      getBarberTrialDaysLeft: getBusinessTrialDaysLeft,
      isBarberSubscribed: isBusinessSubscribed,
    }}>
      {children}
    </AppContext.Provider>
  );
}
