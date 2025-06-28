// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getFirestore, collection, getDocs ,addDoc} from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// // Your Firebase Configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDHhy6cR2B5UBlWZOYc-QUYX443SKvkbi0",
//   authDomain: "conversationalai-c28d0.firebaseapp.com",
//   projectId: "conversationalai-c28d0",
//   storageBucket: "conversationalai-c28d0.firebasestorage.app",
//   messagingSenderId: "249997648927",
//   appId: "1:249997648927:web:6a430b8d8b5bda1ca9212a"
// };

// // Initialize Firebase (Prevent Duplicate Initialization)
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const auth = getAuth(app);
// const db = getFirestore(app);

// export { db, collection, getDocs, auth ,addDoc};


const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyDHhy6cR2B5UBlWZOYc-QUYX443SKvkbi0",
  authDomain: "conversationalai-c28d0.firebaseapp.com",
  projectId: "conversationalai-c28d0",
  storageBucket: "conversationalai-c28d0.firebasestorage.app",
  messagingSenderId: "249997648927",
  appId: "1:249997648927:web:6a430b8d8b5bda1ca9212a"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { db, auth }; 