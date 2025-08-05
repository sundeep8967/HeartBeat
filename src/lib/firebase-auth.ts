import { getAuth } from 'firebase-admin/auth';
import { app } from './firebase';

// Initialize Firebase Auth
const auth = getAuth(app);

export const firebaseAuth = {
  // Create Firebase custom token for authenticated users
  async createCustomToken(uid: string): Promise<string> {
    try {
      const customToken = await auth.createCustomToken(uid);
      return customToken;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  },

  // Verify Firebase ID token
  async verifyIdToken(idToken: string): Promise<any> {
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  },

  // Get user by UID
  async getUser(uid: string): Promise<any> {
    try {
      const user = await auth.getUser(uid);
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create user in Firebase Auth
  async createUser(email: string, password?: string): Promise<any> {
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        emailVerified: false,
      });
      return userRecord;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user in Firebase Auth
  async updateUser(uid: string, updates: any): Promise<any> {
    try {
      const userRecord = await auth.updateUser(uid, updates);
      return userRecord;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user from Firebase Auth
  async deleteUser(uid: string): Promise<void> {
    try {
      await auth.deleteUser(uid);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Set custom claims for user
  async setCustomClaims(uid: string, claims: any): Promise<void> {
    try {
      await auth.setCustomUserClaims(uid, claims);
    } catch (error) {
      console.error('Error setting custom claims:', error);
      throw error;
    }
  },

  // Generate password reset link
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const resetLink = await auth.generatePasswordResetLink(email);
      return resetLink;
    } catch (error) {
      console.error('Error generating password reset link:', error);
      throw error;
    }
  },

  // Generate email verification link
  async generateEmailVerificationLink(email: string): Promise<string> {
    try {
      const verificationLink = await auth.generateEmailVerificationLink(email);
      return verificationLink;
    } catch (error) {
      console.error('Error generating email verification link:', error);
      throw error;
    }
  },

  // Revoke all refresh tokens for a user
  async revokeRefreshTokens(uid: string): Promise<void> {
    try {
      await auth.revokeRefreshTokens(uid);
    } catch (error) {
      console.error('Error revoking refresh tokens:', error);
      throw error;
    }
  },
};

// Helper function to sync NextAuth user with Firebase
export async function syncUserWithFirebase(userId: string, email: string) {
  try {
    // Check if user exists in Firebase
    let firebaseUser;
    try {
      firebaseUser = await firebaseAuth.getUser(userId);
    } catch (error) {
      // User doesn't exist, create them
      firebaseUser = await firebaseAuth.createUser(email);
    }

    // Set custom claims for the user
    await firebaseAuth.setCustomClaims(userId, {
      nextAuthUserId: userId,
      isHeartBeatUser: true,
    });

    return firebaseUser;
  } catch (error) {
    console.error('Error syncing user with Firebase:', error);
    throw error;
  }
}

// Helper function to get Firebase custom token for NextAuth user
export async function getFirebaseCustomToken(userId: string, email: string): Promise<string> {
  try {
    // Sync user with Firebase
    await syncUserWithFirebase(userId, email);
    
    // Create custom token
    const customToken = await firebaseAuth.createCustomToken(userId);
    return customToken;
  } catch (error) {
    console.error('Error getting Firebase custom token:', error);
    throw error;
  }
}