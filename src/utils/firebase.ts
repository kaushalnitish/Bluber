/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";

import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read configuration from the firebase config file with environment variable fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwMdYYzwBRZaWPkW8B6TsPCaRotzeIz-k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0886998494.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0886998494",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0886998494.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "136444518932",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:136444518932:web:ac966cef476566622ffd01",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable local persistence explicitly for robust cross-page authentication state
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Firebase persistence initialization failed:", err);
});

// CRITICAL: Must use the specific firestoreDatabaseId "ai-studio-dac06a5c-88d3-4873-b0d7-3147d386e113" to avoid breaking Firestore
const dbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-dac06a5c-88d3-4873-b0d7-3147d386e113";
export const db = getFirestore(app, dbId);

export const googleProvider = new GoogleAuthProvider();
// Set default scopes or custom parameters for Google Auth Provider
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Device detection helper
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined" || !window.navigator) return false;
  const ua = window.navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || isSmallScreen;
};

// Translate common Firebase Auth errors into clear, action-oriented human-readable messages
export function translateFirebaseAuthError(err: any): string {
  const code = err?.code || "";
  const message = err?.message || "";
  
  console.error("Firebase Auth Error Details:", {
    code,
    message,
    originalError: err
  });

  switch (code) {
    case "auth/unauthorized-domain":
      return "Unauthorized Domain: This website domain is not authorized in your Firebase Project Console. Please go to Firebase Console > Authentication > Settings > Authorized Domains, and add your current Vercel/localhost domain.";
    case "auth/popup-blocked":
      return "Pop-up Blocked: Your browser blocked the Google sign-in window. Please enable pop-ups in your browser settings or try mobile/redirect login.";
    case "auth/popup-closed-by-user":
      return "Sign-in Cancelled: The sign-in window was closed before completing authentication. Please try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in Cancelled: The sign-in window was closed. Please try again.";
    case "auth/operation-not-allowed":
      return "Operation Not Allowed: Google Sign-In is not enabled in your Firebase Project Console. Please go to Firebase Console > Authentication > Sign-in method, and enable Google.";
    case "auth/network-request-failed":
      return "Network Error: A network error occurred. Please check your internet connection and try again.";
    case "auth/invalid-api-key":
      return "Invalid API Key: Your Firebase API Key is invalid or restricted. Please verify your Firebase project credentials.";
    case "auth/auth-domain-config-required":
    case "auth/invalid-auth-domain":
      return "Configuration Error: The Firebase 'authDomain' is incorrect or missing. Please verify your Firebase project setup.";
    default:
      if (message.toLowerCase().includes("unauthorized-domain") || message.toLowerCase().includes("unauthorized domain")) {
        return "Unauthorized Domain: This domain is not allowlisted in Firebase Console > Authentication > Settings > Authorized Domains.";
      }
      return `Authentication failed: ${message || "Please check your credentials and try again."} (Error Code: ${code || "unknown"})`;
  }
}

// Standard helper exports
export { 
  onAuthStateChanged, 
  signOut, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
};
