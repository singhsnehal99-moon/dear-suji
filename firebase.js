import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDujzO37NdlU2H4z8GxC9TfmRoXUVjSsfM",
  authDomain: "dear-suji.firebaseapp.com",
  projectId: "dear-suji",
  storageBucket: "dear-suji.firebasestorage.app",
  messagingSenderId: "344382665682",
  appId: "1:344382665682:web:2d25628dd9b90fe6ef8e0b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
};
