import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrO_4GVc6uGZBF4v_g2HHrnA46e9ND7Xg",
  authDomain: "predichsm.firebaseapp.com",
  projectId: "predichsm",
  storageBucket: "predichsm.firebasestorage.app",
  messagingSenderId: "669609220526",
  appId: "1:669609220526:web:972c28fbac8ac69acdd03f",
  measurementId: "G-WH2NV7ZGJB",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
