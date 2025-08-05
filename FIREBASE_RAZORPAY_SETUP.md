# Firebase and Razorpay Integration Setup Guide

This guide provides step-by-step instructions for setting up Firebase and Razorpay integration in the HeartBeat dating application.

## Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Razorpay Setup](#razorpay-setup)
3. [Environment Configuration](#environment-configuration)
4. [Integration Testing](#integration-testing)
5. [Troubleshooting](#troubleshooting)

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or create a new project
3. Enter project name (e.g., "heartbeat-dating-app")
4. Enable Google Analytics if desired
5. Click "Create project"

### 2. Enable Firebase Services
Enable the following services in your Firebase project:

#### Authentication
- Go to Authentication → Sign-in method
- Enable Email/Password, Google, and other desired providers
- Note your authorized domains for development and production

#### Firestore Database
- Go to Firestore Database
- Create database in test mode (for development)
- Choose location closest to your users
- Note your database URL

#### Firebase Storage
- Go to Storage
- Create storage bucket
- Set security rules for development

#### Cloud Messaging (Optional)
- Go to Cloud Messaging
- Note your Server key and Sender ID

### 3. Generate Service Account Key
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file and save it securely
4. Extract the following values from the JSON file:
   - `project_id`
   - `private_key`
   - `client_email`
   - `client_id`

### 4. Get Web App Configuration
1. Go to Project Settings → Your apps
2. Register a web app
3. Copy the Firebase configuration object:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

## Razorpay Setup

### 1. Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Complete the KYC process for production access

### 2. Get API Keys
1. Go to Settings → API Keys
2. Generate Test Keys for development
3. Generate Live Keys for production
4. Note the following:
   - Key ID
   - Key Secret

### 3. Configure Webhooks
1. Go to Settings → Webhooks
2. Add a new webhook endpoint
3. Enter your webhook URL: `https://your-domain.com/api/razorpay/webhook`
4. Select the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Note the Webhook Secret

### 4. Set Up Payment Methods
Ensure the following payment methods are enabled:
- Credit/Debit Cards
- UPI
- Net Banking
- Wallets

## Environment Configuration

### 1. Create Environment Variables
Update your `.env` file with the following configuration:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_DATABASE_URL=your-firebase-database-url
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket

# Firebase Client Configuration (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

### 2. Firebase Private Key Format
When adding the Firebase private key to your environment variables, make sure to:
- Replace `\n` with actual newlines
- Keep the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` headers
- Example:
  ```bash
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
  ```

## Integration Testing

### 1. Firebase Integration Test
Create a test file to verify Firebase connectivity:

```typescript
// src/lib/test-firebase.ts
import { app, db } from '@/lib/firebase';

export async function testFirebaseConnection() {
  try {
    // Test Firestore
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}
```

### 2. Razorpay Integration Test
Create a test file to verify Razorpay connectivity:

```typescript
// src/lib/test-razorpay.ts
import { razorpayUtils } from '@/lib/razorpay';

export async function testRazorpayConnection() {
  try {
    // Create a test order for ₹1
    const order = await razorpayUtils.createOrder(1, 'INR');
    console.log('✅ Razorpay connection successful');
    console.log('Test order created:', order.id);
    return true;
  } catch (error) {
    console.error('❌ Razorpay connection failed:', error);
    return false;
  }
}
```

### 3. Payment Flow Test
Test the complete payment flow:

1. **Create Order**: Call `/api/razorpay/create-order`
2. **Process Payment**: Use Razorpay checkout
3. **Verify Payment**: Call `/api/razorpay/verify-payment`
4. **Check Webhook**: Verify webhook receives payment events

### 4. Firebase Messaging Test
Test real-time messaging:

```typescript
// src/lib/test-messaging.ts
import { firebaseMessaging } from '@/lib/firebase-messaging';

export async function testFirebaseMessaging() {
  try {
    // Send a test message
    const messageId = await firebaseMessaging.sendMessage({
      senderId: 'test-user-1',
      receiverId: 'test-user-2',
      content: 'Test message',
      type: 'text'
    });
    
    console.log('✅ Firebase messaging test successful');
    console.log('Message sent:', messageId);
    return true;
  } catch (error) {
    console.error('❌ Firebase messaging test failed:', error);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

#### Firebase Authentication Issues
**Problem**: `auth/network-request-failed`
**Solution**: 
- Check Firebase project configuration
- Verify environment variables
- Ensure proper network connectivity

#### Razorpay Payment Issues
**Problem**: `Invalid signature`
**Solution**:
- Verify webhook secret
- Check order ID and payment ID format
- Ensure proper signature verification

#### Firestore Permission Issues
**Problem**: `Missing or insufficient permissions`
**Solution**:
- Update Firestore security rules
- Check user authentication status
- Verify database access permissions

#### Environment Variable Issues
**Problem**: Configuration not loading
**Solution**:
- Restart development server after changing .env
- Verify variable names match exactly
- Check for missing quotes or special characters

### Debugging Steps

1. **Check Environment Variables**:
   ```bash
   echo $FIREBASE_PROJECT_ID
   echo $RAZORPAY_KEY_ID
   ```

2. **Test Firebase Connection**:
   ```typescript
   console.log('Firebase Config:', {
     projectId: process.env.FIREBASE_PROJECT_ID,
     clientEmail: process.env.FIREBASE_CLIENT_EMAIL
   });
   ```

3. **Test Razorpay Connection**:
   ```typescript
   console.log('Razorpay Config:', {
     keyId: process.env.RAZORPAY_KEY_ID,
     hasSecret: !!process.env.RAZORPAY_KEY_SECRET
   });
   ```

4. **Check Network Requests**:
   - Use browser dev tools to inspect API calls
   - Verify proper authentication headers
   - Check CORS settings

### Security Considerations

1. **Environment Variables**:
   - Never commit .env files to version control
   - Use different keys for development and production
   - Regularly rotate API keys and secrets

2. **Firebase Security Rules**:
   ```javascript
   // Firestore rules for development
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

3. **Razorpay Webhook Security**:
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Implement proper error handling

## Production Deployment

### 1. Firebase Production Setup
- Switch from test mode to production mode
- Update security rules for production
- Enable Firebase App Check if needed

### 2. Razorpay Production Setup
- Switch from test keys to live keys
- Update webhook URL to production domain
- Complete KYC verification

### 3. Environment Variables for Production
- Use secure environment variable management
- Different configuration for staging and production
- Regular security audits

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [HeartBeat Application Documentation](./README.md)

For additional support, please refer to the project's issue tracker or contact the development team.