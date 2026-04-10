import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvIUSBHoQnAvfLrTsLUhSQ-DukjN1OsaQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "line-free-india.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://line-free-india-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "line-free-india",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "line-free-india.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "848717293503",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:848717293503:web:3a5e525a689cd64b83230a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GZ0B8S4HKZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const messaging = getMessaging(app);
export const analyticsPromise = typeof window !== 'undefined'
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null);

// ✅ Set persistence immediately — user stays logged in after closing browser
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('✅ Auth persistence set to LOCAL'))
  .catch((e) => console.warn('Auth persistence error:', e));

export default app;
