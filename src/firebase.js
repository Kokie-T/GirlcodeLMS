// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';        
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcXkfIEQNAULgTqY7BkQTJeI2OXATm7SU",
  authDomain: "lmspro-d1ed1.firebaseapp.com",
  projectId: "lmspro-d1ed1",
  storageBucket: "lmspro-d1ed1.firebasestorage.app",
  messagingSenderId: "71848995690",
  appId: "1:71848995690:web:76b43c4a63298a66779313"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
