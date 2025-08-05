import { auth, RecaptchaVerifier } from '@/lib/firebase-client';
import { PhoneAuthProvider, signInWithPhoneNumber, signInWithCredential, PhoneAuthCredential } from 'firebase/auth';

export interface ClientPhoneVerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
}

export interface ClientPhoneVerificationConfirmResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const clientPhoneVerificationService = {
  // Initialize reCAPTCHA
  initializeRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier | null {
    try {
      if (typeof window !== 'undefined') {
        const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response: any) => {
            // reCAPTCHA solved - allow sending OTP
            console.log('reCAPTCHA verified');
          },
          'expired-callback': () => {
            // Response expired - ask user to solve reCAPTCHA again
            console.log('reCAPTCHA expired');
          }
        });
        return recaptchaVerifier;
      }
      return null;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      return null;
    }
  },

  // Send OTP to phone number
  async sendOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ClientPhoneVerificationResult> {
    try {
      // Format phone number with country code if not present
      let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      if (!formattedPhone.startsWith('+')) {
        // Default to US country code if none provided
        formattedPhone = `+1${formattedPhone}`;
      }

      // Send OTP using Firebase Phone Auth
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      return {
        success: true,
        verificationId: confirmationResult.verificationId
      };

    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Failed to send OTP';
      if (error instanceof Error) {
        if (error.message.includes('auth/invalid-phone-number')) {
          errorMessage = 'Invalid phone number format';
        } else if (error.message.includes('auth/too-many-requests')) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.message.includes('auth/quota-exceeded')) {
          errorMessage = 'SMS quota exceeded. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Verify OTP and complete authentication
  async verifyOTP(verificationId: string, otp: string): Promise<ClientPhoneVerificationConfirmResult> {
    try {
      // Create phone credential
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      return {
        success: true,
        user: {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Failed to verify OTP';
      if (error instanceof Error) {
        if (error.message.includes('auth/invalid-verification-code')) {
          errorMessage = 'Invalid verification code';
        } else if (error.message.includes('auth/code-expired')) {
          errorMessage = 'Verification code expired';
        } else if (error.message.includes('auth/invalid-verification-id')) {
          errorMessage = 'Invalid verification session';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Link phone number to existing user
  async linkPhoneNumber(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ClientPhoneVerificationResult> {
    try {
      if (!auth.currentUser) {
        return {
          success: false,
          error: 'No user currently signed in'
        };
      }

      // Format phone number
      let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+1${formattedPhone}`;
      }

      // Send OTP for linking
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      return {
        success: true,
        verificationId: confirmationResult.verificationId
      };

    } catch (error) {
      console.error('Error linking phone number:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to link phone number'
      };
    }
  },

  // Complete phone number linking with OTP
  async completePhoneLinking(verificationId: string, otp: string): Promise<ClientPhoneVerificationConfirmResult> {
    try {
      if (!auth.currentUser) {
        return {
          success: false,
          error: 'No user currently signed in'
        };
      }

      // Create phone credential
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      
      // Link credential to current user
      const userCredential = await auth.currentUser.linkWithCredential(credential);
      const user = userCredential.user;

      return {
        success: true,
        user: {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };

    } catch (error) {
      console.error('Error completing phone linking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete phone linking'
      };
    }
  },

  // Check if current user has phone number verified
  isPhoneVerified(): boolean {
    return !!auth.currentUser?.phoneNumber;
  },

  // Get current user's phone number
  getCurrentUserPhone(): string | null {
    return auth.currentUser?.phoneNumber || null;
  },

  // Format phone number for display
  formatPhoneNumber(phoneNumber: string): string {
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (formattedPhone.startsWith('+1')) {
      return `+1 (${formattedPhone.slice(2, 5)}) ${formattedPhone.slice(5, 8)}-${formattedPhone.slice(8, 12)}`;
    } else if (formattedPhone.startsWith('+91')) {
      return `+91 ${formattedPhone.slice(3, 8)} ${formattedPhone.slice(8, 13)}`;
    } else if (formattedPhone.startsWith('+44')) {
      return `+44 ${formattedPhone.slice(3, 7)} ${formattedPhone.slice(7, 13)}`;
    }
    
    return formattedPhone;
  },

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(formattedPhone);
  },

  // Get country code from phone number
  getCountryCode(phoneNumber: string): string {
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (formattedPhone.startsWith('+')) {
      const match = formattedPhone.match(/^\+(\d{1,3})/);
      return match ? match[1] : '';
    }
    
    return '1'; // Default to US
  },

  // Get phone number without country code
  getPhoneNumberWithoutCountryCode(phoneNumber: string): string {
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (formattedPhone.startsWith('+')) {
      const countryCode = this.getCountryCode(formattedPhone);
      return formattedPhone.slice(countryCode.length + 1);
    }
    
    return formattedPhone;
  }
};