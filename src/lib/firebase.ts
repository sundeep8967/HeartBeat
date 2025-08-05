import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase Admin
let app: any;
let db: any;
let storage: any;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: firebaseConfig.storageBucket,
  });
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, db, storage };

// Helper functions for Firebase operations
export const firebaseAuth = {
  // Authentication helpers will be added here
};

export const firebaseDb = {
  // Database helpers will be added here
};

export const firebaseStorage = {
  // Storage helpers will be added here
};