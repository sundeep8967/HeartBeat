# Razorpay & Firebase Integration Setup Guide

This guide will help you set up and test the Razorpay payment integration and Firebase services for the HeartBeat dating application.

## Prerequisites

Before you begin, make sure you have:
- Node.js and npm installed
- A Firebase project
- A Razorpay account
- Access to the HeartBeat project codebase

## 1. Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Enable the following services:
   - Authentication
   - Firestore Database
   - Cloud Storage
   - Cloud Messaging (optional)

### 1.2 Get Firebase Configuration

#### Server-side Configuration
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file and extract the following values:
   - `project_id`
   - `private_key`
   - `client_email`
   - `database_url`
   - `storage_bucket`

#### Client-side Configuration
1. Go to Project Settings → General → Your apps
2. Register a web app
3. Copy the Firebase config object values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 1.3 Update Environment Variables
Add the following to your `.env` file:

```env
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
```

## 2. Razorpay Setup

### 2.1 Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Switch to **Test Mode** (toggle in the top-right corner)

### 2.2 Get API Keys
1. Go to Settings → API Keys
2. You'll find:
   - **Key ID**: Your public key
   - **Key Secret**: Your secret key

### 2.3 Configure Webhooks
1. Go to Settings → Webhooks
2. Add a new webhook endpoint:
   - **URL**: `https://your-domain.com/api/razorpay/webhook`
   - **Secret**: Generate a webhook secret
   - **Events to subscribe**: 
     - `payment.captured`
     - `payment.failed`

### 2.4 Update Environment Variables
Add the following to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

## 3. Testing the Payment Flow

### 3.1 Test Environment Setup
Razorpay provides test credentials and a test environment:
- **Test Mode**: Already enabled in your Razorpay dashboard
- **Test Cards**: Use Razorpay's test card numbers

### 3.2 Test Card Details
Use these test card details for testing:

#### Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3-digit number (e.g., `123`)
- **Name**: Any name

#### Failed Payment
- **Card Number**: `4111 1111 1111 1112`
- **Expiry**: Any future date
- **CVV**: Any 3-digit number

### 3.3 Testing Steps

#### Step 1: Test Order Creation
1. Start your development server: `npm run dev`
2. Navigate to the dashboard or profile page
3. Click on a premium contact option (Phone or LinkedIn)
4. The Razorpay checkout should open

#### Step 2: Test Payment Processing
1. Use the test card details provided above
2. Complete the payment flow
3. Verify that:
   - Order is created successfully
   - Payment is processed
   - User gets access to the purchased information

#### Step 3: Test Webhook Integration
1. Use a tool like [ngrok](https://ngrok.com/) to expose your local server
2. Update your Razorpay webhook URL to use the ngrok URL
3. Trigger a payment and verify webhook handling

#### Step 4: Test Error Scenarios
1. Test with invalid card details
2. Test with insufficient funds
3. Test with expired cards
4. Verify proper error handling

### 3.4 Firebase Testing

#### Authentication Testing
1. Test user registration and login
2. Verify Firebase custom token generation
3. Test user synchronization between NextAuth and Firebase

#### Messaging Testing
1. Test real-time messaging between users
2. Verify message persistence in Firestore
3. Test typing indicators and read receipts
4. Test conversation management

## 4. Production Deployment

### 4.1 Environment Variables
Update your production environment variables with actual credentials:

```env
# Production Firebase Configuration
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_PRIVATE_KEY=your-production-private-key
FIREBASE_CLIENT_EMAIL=your-production-client-email
FIREBASE_DATABASE_URL=your-production-database-url
FIREBASE_STORAGE_BUCKET=your-production-storage-bucket

# Production Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-production-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-production-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-production-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-production-app-id

# Production Razorpay Configuration
RAZORPAY_KEY_ID=your-production-razorpay-key-id
RAZORPAY_KEY_SECRET=your-production-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-production-razorpay-webhook-secret
```

### 4.2 Razorpay Production Setup
1. Switch to **Live Mode** in Razorpay dashboard
2. Generate new API keys for production
3. Update your webhooks with the production URL
4. Complete Razorpay's onboarding process

### 4.3 Firebase Production Setup
1. Ensure your Firebase project is in production mode
2. Set up proper security rules for Firestore
3. Configure Firebase Storage security rules
4. Set up Firebase Authentication for production

## 5. Security Considerations

### 5.1 Environment Variables
- Never commit environment variables to version control
- Use different keys for development and production
- Regularly rotate your API keys

### 5.2 Firebase Security Rules
Configure Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages can only be read by sender or receiver
    match /messages/{message} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
    
    // Conversations can only be read by participants
    match /conversations/{conversation} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
  }
}
```

### 5.3 Razorpay Webhook Security
- Always verify webhook signatures
- Use HTTPS for all endpoints
- Implement proper error handling
- Log all webhook events for debugging

## 6. Troubleshooting

### 6.1 Common Issues

#### Firebase Authentication Issues
- **Problem**: Custom token generation fails
- **Solution**: Verify Firebase service account credentials
- **Check**: Ensure private key is properly formatted (replace `\n` with actual newlines)

#### Razorpay Payment Issues
- **Problem**: Payment fails with invalid signature
- **Solution**: Verify webhook secret and signature verification
- **Check**: Ensure you're using the correct webhook secret

#### Real-time Messaging Issues
- **Problem**: Messages not updating in real-time
- **Solution**: Check Firestore security rules and client-side configuration
- **Check**: Verify Firebase project configuration and network connectivity

### 6.2 Debugging Tools
- Use Firebase Console to monitor database activity
- Check Razorpay dashboard for payment logs
- Use browser developer tools to debug client-side issues
- Monitor server logs for API errors

## 7. Testing Checklist

- [ ] Firebase authentication works correctly
- [ ] Razorpay test payments process successfully
- [ ] Webhooks are received and processed correctly
- [ ] Real-time messaging functions properly
- [ ] Premium contact access is granted after payment
- [ ] Error handling works for failed payments
- [ ] Environment variables are properly configured
- [ ] Security rules are in place and working

## 8. Next Steps

After completing the setup and testing:

1. **Deploy to Production**: Set up your production environment
2. **Monitor Performance**: Use Firebase and Razorpay dashboards
3. **Handle Scaling**: Ensure your infrastructure can handle growth
4. **Implement Analytics**: Track payment success rates and user engagement
5. **Customer Support**: Set up processes for handling payment issues

This comprehensive setup should give you a fully functional payment and messaging system for the HeartBeat dating application.