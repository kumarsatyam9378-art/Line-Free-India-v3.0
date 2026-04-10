# 🔥 Line Free India — v2.1 Setup Guide

## ⚡ STEP 1: Cloudinary Setup (Photo Upload — FREE)

### 1. Account banao
👉 https://cloudinary.com → Sign Up (FREE, no credit card)

### 2. Cloud Name copy karo
Dashboard pe top-left mein dikhta hai → e.g. `dxyz123abc`

### 3. Upload Preset banao (IMPORTANT)
Settings → Upload → Scroll down → **"Add upload preset"**
- Preset name: `line_free_unsigned`
- Signing mode: **Unsigned** ← ye select karo
- Save karo

### 4. Code mein daalo
File: `src/utils/cloudinary.ts`
```ts
export const CLOUDINARY_CLOUD_NAME = 'dxyz123abc';       // ← apna naam
export const CLOUDINARY_UPLOAD_PRESET = 'line_free_unsigned'; // ← apna preset
```

---

## ⚡ STEP 2: Firebase Console

### Firestore Rules
Firebase Console → Firestore → Rules → Paste `firestore.rules` → **Publish**

### Firestore Indexes
Console → Firestore → Indexes → Composite → Add indexes from `firestore.indexes.json`
(Ya automatically create ho jaayenge — browser console mein link aayega)

---

## 🚀 Local Development
```bash
npm install
npm run dev
```

## 📦 Deploy to Firebase Hosting
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase deploy
```

---

## 📱 Features v2.1
- ✅ Google Login (Customer + Barber)
- ✅ Real-time Salon List
- ✅ Token Booking System
- ✅ Queue Management for Barbers
- ✅ Photo Upload via Cloudinary (FREE)
- ✅ In-App Notifications (real-time)
- ✅ Analytics Dashboard (7/14/30 days)
- ✅ Visit History for Customers
- ✅ Delete Account (all data cleared)
- ✅ Referral Code System
- ✅ Nearby Salons (GPS)
- ✅ Dark/Light Mode
- ✅ Reviews & Ratings
- ✅ WhatsApp Token Sharing
- ✅ UPI Payment Link
- ✅ Advance Booking
- ✅ Messaging System
