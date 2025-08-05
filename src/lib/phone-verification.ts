import { getAuth } from 'firebase-admin/auth';
import { app } from './firebase';

// Initialize Firebase Auth
const auth = getAuth(app);

export interface PhoneVerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
}

export interface PhoneVerificationConfirmResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const phoneVerificationService = {
  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<PhoneVerificationResult> {
    try {
      // Format phone number (remove spaces, dashes, etc.)
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // For Firebase Admin SDK, we need to create a custom token
      // The actual OTP sending happens on the client side
      // This server-side method validates the phone number format
      
      // Basic phone number validation
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formattedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format'
        };
      }

      // Check if phone number is already verified by another user
      try {
        const users = await auth.getUsers([
          { phoneNumber: formattedPhone }
        ]);

        if (users.users.length > 0) {
          return {
            success: false,
            error: 'Phone number is already registered'
          };
        }
      } catch (error) {
        // If user doesn't exist, continue with OTP sending
        console.log('Phone number not found, proceeding with OTP');
      }

      // For Firebase Phone Auth, the actual OTP sending happens client-side
      // We'll return a success response to allow client-side OTP sending
      return {
        success: true,
        verificationId: 'pending_client_side_verification'
      };

    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  },

  // Verify OTP and create user
  async verifyOTP(verificationId: string, otp: string, phoneNumber: string): Promise<PhoneVerificationConfirmResult> {
    try {
      // Note: Firebase Admin SDK cannot verify OTP directly
      // OTP verification happens client-side with Firebase Auth
      // This method handles the server-side verification after client-side success

      // Get the user by phone number after client-side verification
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      try {
        const user = await auth.getUserByPhoneNumber(formattedPhone);
        
        return {
          success: true,
          user: {
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        };
      } catch (error) {
        return {
          success: false,
          error: 'User not found after verification'
        };
      }

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify OTP'
      };
    }
  },

  // Link phone number to existing user
  async linkPhoneNumber(uid: string, phoneNumber: string): Promise<PhoneVerificationConfirmResult> {
    try {
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Update user's phone number in Firebase Auth
      await auth.updateUser(uid, {
        phoneNumber: formattedPhone
      });

      const user = await auth.getUser(uid);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };

    } catch (error) {
      console.error('Error linking phone number:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to link phone number'
      };
    }
  },

  // Unlink phone number from user
  async unlinkPhoneNumber(uid: string): Promise<PhoneVerificationConfirmResult> {
    try {
      // Remove phone number from user
      await auth.updateUser(uid, {
        phoneNumber: null
      });

      const user = await auth.getUser(uid);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };

    } catch (error) {
      console.error('Error unlinking phone number:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlink phone number'
      };
    }
  },

  // Check if phone number is verified
  async isPhoneVerified(uid: string): Promise<boolean> {
    try {
      const user = await auth.getUser(uid);
      return !!user.phoneNumber;
    } catch (error) {
      console.error('Error checking phone verification:', error);
      return false;
    }
  },

  // Get user by phone number
  async getUserByPhoneNumber(phoneNumber: string): Promise<any | null> {
    try {
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      const user = await auth.getUserByPhoneNumber(formattedPhone);
      return user;
    } catch (error) {
      console.error('Error getting user by phone number:', error);
      return null;
    }
  },

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(formattedPhone);
  },

  // Format phone number for display
  formatPhoneNumber(phoneNumber: string): string {
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Basic formatting for international numbers
    if (formattedPhone.startsWith('+1')) {
      // US/Canada format: +1 (XXX) XXX-XXXX
      return `+1 (${formattedPhone.slice(2, 5)}) ${formattedPhone.slice(5, 8)}-${formattedPhone.slice(8, 12)}`;
    } else if (formattedPhone.startsWith('+91')) {
      // India format: +91 XXXXX XXXXX
      return `+91 ${formattedPhone.slice(3, 8)} ${formattedPhone.slice(8, 13)}`;
    } else if (formattedPhone.startsWith('+44')) {
      // UK format: +44 XXXX XXXXXX
      return `+44 ${formattedPhone.slice(3, 7)} ${formattedPhone.slice(7, 13)}`;
    }
    
    // Default format: just return the cleaned number
    return formattedPhone;
  }
};