import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read configuration from the firebase config file
const firebaseConfig = {
  apiKey: "AIzaSyCwMdYYzwBRZaWPkW8B6TsPCaRotzeIz-k",
  authDomain: "gen-lang-client-0886998494.firebaseapp.com",
  projectId: "gen-lang-client-0886998494",
  storageBucket: "gen-lang-client-0886998494.firebasestorage.app",
  messagingSenderId: "136444518932",
  appId: "1:136444518932:web:ac966cef476566622ffd01",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard helper exports
export { onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber };
