import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Client-side Firebase utilities
export const clientFirebase = {
  // Sign in with custom token (from NextAuth)
  async signInWithCustomToken(token: string): Promise<User> {
    try {
      const result = await signInWithCustomToken(auth, token);
      return result.user;
    } catch (error) {
      console.error('Error signing in with custom token:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Firestore helpers
  firestore: {
    // Create or update document
    async setDocument(collectionPath: string, docId: string, data: any) {
      try {
        await setDoc(doc(db, collectionPath, docId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error setting document:', error);
        throw error;
      }
    },

    // Get document
    async getDocument(collectionPath: string, docId: string) {
      try {
        const docSnap = await getDoc(doc(db, collectionPath, docId));
        return docSnap.exists() ? docSnap.data() : null;
      } catch (error) {
        console.error('Error getting document:', error);
        throw error;
      }
    },

    // Update document
    async updateDocument(collectionPath: string, docId: string, data: any) {
      try {
        await updateDoc(doc(db, collectionPath, docId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating document:', error);
        throw error;
      }
    },
  },

  // Storage helpers
  storage: {
    // Upload file
    async uploadFile(filePath: string, file: File): Promise<string> {
      try {
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    },
  },
};

// React hook for Firebase auth
import { useState, useEffect } from 'react';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}