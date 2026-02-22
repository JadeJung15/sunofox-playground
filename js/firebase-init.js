// js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
// Optional: import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhVAOItc5hfBsjHnN6EfJUtKcIiQz3KsM",
  authDomain: "sunofoxplayground-backend.firebaseapp.com",
  projectId: "sunofoxplayground-backend",
  storageBucket: "sunofoxplayground-backend.firebasestorage.app",
  messagingSenderId: "461172455449",
  appId: "1:461172455449:web:4bec4914bc86facac49288",
  measurementId: "G-HYDNVBQJGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth instance
export const db = getFirestore(app); // Export db instance

// Optional: const analytics = getAnalytics(app);
