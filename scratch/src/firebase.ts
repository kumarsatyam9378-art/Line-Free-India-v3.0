import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBvIUSBHoQnAvfLrTsLUhSQ-DukjN1OsaQ",
  authDomain: "line-free-india.firebaseapp.com",
  projectId: "line-free-india",
  storageBucket: "line-free-india.firebasestorage.app",
  messagingSenderId: "848717293503",
  appId: "1:848717293503:web:3a5e525a689cd64b83230a",
  measurementId: "G-GZ0B8S4HKZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const messaging = getMessaging(app);

// ✅ Set persistence immediately — user stays logged in after closing browser
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('✅ Auth persistence set to LOCAL'))
  .catch((e) => console.warn('Auth persistence error:', e));

export default app;
