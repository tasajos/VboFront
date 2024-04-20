// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "tu-apiKey",
    authDomain: "tu-authDomain",
    projectId: "tu-projectId",
    storageBucket: "tu-storageBucket",
    messagingSenderId: "tu-messagingSenderId",
    appId: "tu-appId"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  export { auth };
