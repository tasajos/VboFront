// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBUgMwsBl7aogNEVLOPzCfTBU2qky9e924",
    authDomain: "fir-login2-c7a59.firebaseapp.com",
    databaseURL: "https://fir-login2-c7a59-default-rtdb.firebaseio.com",
    projectId: "fir-login2-c7a59",
    storageBucket: "fir-login2-c7a59.appspot.com",
    messagingSenderId: "306570664024",
    appId: "1:306570664024:web:9f86c375218af6c41a522d"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);

export { auth, database };



