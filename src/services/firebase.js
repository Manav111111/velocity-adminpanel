import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMox6OzfkkgaXK3qd3ep7jc7Ov5djL1Do",
  authDomain: "velocity-pro.firebaseapp.com",
  projectId: "velocity-pro",
  storageBucket: "velocity-pro.firebasestorage.app",
  messagingSenderId: "845684833636",
  appId: "1:845684833636:web:e5b7c50ae8b21e01f6ce71",
  measurementId: "G-P9HZTKTQV3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
