import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Prefer environment variables, fall back to provided config
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseConfig = {
  apiKey: envConfig.apiKey || 'AIzaSyDu0WgAQS8hAgrnggLbaRFanDpBfY-ppBc',
  authDomain: envConfig.authDomain || 'password-manager-ecf92.firebaseapp.com',
  projectId: envConfig.projectId || 'password-manager-ecf92',
  storageBucket: envConfig.storageBucket || 'password-manager-ecf92.appspot.com',
  messagingSenderId: envConfig.messagingSenderId || '1080552581327',
  appId: envConfig.appId || '1:1080552581327:web:67b78b39d98c0ced1fefba',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
