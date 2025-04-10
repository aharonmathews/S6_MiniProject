import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

// Your Firebase config
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
const auth = getAuth(app);

// ✅ Force Firestore to use long polling (avoid QUIC/WebChannel issues)
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false, // optional but improves compatibility
  localCache: persistentLocalCache(),
});

export { auth, db };
