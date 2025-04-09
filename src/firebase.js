// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkngcxSYn3rK1_IVUNdqTSiP2BeFICLV8",
  authDomain: "miniproject-72df9.firebaseapp.com",
  projectId: "miniproject-72df9",
  storageBucket: "miniproject-72df9.firebasestorage.app",
  messagingSenderId: "894473640597",
  appId: "1:894473640597:web:873ffce0751ef44caed99c",
  measurementId: "G-96ZEDH1ZXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Make sure this line is included
const db = getFirestore(app);

export { auth, db }; // Export auth properly