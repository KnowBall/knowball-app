// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnKzKBonnxjrwcYM7iHHusfVxbPQvu-hw",
  authDomain: "knowball-app.firebaseapp.com",
  projectId: "knowball-app",
  storageBucket: "knowball-app.firebasestorage.app",
  messagingSenderId: "420704222024",
  appId: "1:420704222024:web:4bdd6744250c340fedd17d"
};

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
