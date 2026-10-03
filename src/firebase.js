import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Ключи вашего проекта Firebase. Веб-ключи Firebase не секретные,
// поэтому сайт работает на Vercel даже без переменных окружения.
// При желании их можно переопределить через VITE_FIREBASE_* .
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDeNDF9aqIQ1SUmPeKfRAW8FcHZVYhmW4M',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'konditer-d8188.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'konditer-d8188',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'konditer-d8188.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '77008229357',
  appId: env.VITE_FIREBASE_APP_ID || '1:77008229357:web:ac7dac8adfb94b68dbcde4',
};

export const configured = true;
export const db = getFirestore(initializeApp(firebaseConfig));
