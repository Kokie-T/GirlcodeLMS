// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';        
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRN0Cr_-Mxq7jwtdC_fBdtJsD4aAdLf50",
  authDomain: "lms-pro-ae608.firebaseapp.com",
  projectId: "lms-pro-ae608",
  storageBucket: "lms-pro-ae608.firebasestorage.app",
  messagingSenderId: "1045277665613",
  appId: "1:1045277665613:web:f03348cc61a68d02e8af04"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
