// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';        
import { getFirestore } from 'firebase/firestore'; 



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
const auth = getAuth(app);
const db = getFirestore(app);



export { auth, db };