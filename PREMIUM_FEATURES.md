# HeartBeat Premium Contact Features

## Overview

HeartBeat now offers premium contact features that allow users to purchase access to sensitive contact information such as phone numbers and LinkedIn profiles. This feature creates a new revenue stream while providing value to users who want to take their connections to the next level.

## Features

### 1. Phone Number Access - ₹10
Users can purchase access to another user's phone number for direct contact.

**Features:**
- One-time purchase of ₹10
- Permanent access to the phone number
- Direct call functionality from the app
- Secure payment processing
- Purchase history tracking

### 2. LinkedIn Profile Access - ₹5
Users can purchase access to another user's LinkedIn profile for professional networking.

**Features:**
- One-time purchase of ₹5
- Direct link to LinkedIn profile
- Professional background verification
- Network and connections visibility
- Secure payment processing

## Implementation Details

### Database Schema

#### New Fields in User Model
```sql
phoneNumber   String?   -- Phone number for premium access
linkedinUrl   String?   -- LinkedIn profile URL
```

#### New PremiumPurchase Model
```sql
model PremiumPurchase {
  id          String   @id @default(cuid())
  userId      String
  targetUserId String
  type        String   -- 'phone' or 'linkedin'
  amount      Int      -- Price in rupees
  status      String   @default("pending") -- pending, completed, failed
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetUserId, type])
}
```

### API Endpoints

#### 1. Purchase Premium Access
**Endpoint:** `POST /api/premium/purchase`

**Request Body:**
```json
{
  "type": "phone" | "linkedin",
  "targetUserId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": "string",
    "type": "phone",
    "amount": 10,
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "data": {
    "phoneNumber": "+91XXXXXXXXXX" // or linkedinUrl for LinkedIn purchases
  }
}
```

#### 2. Check Premium Access
**Endpoint:** `GET /api/premium/access?targetUserId=string`

**Response:**
```json
{
  "hasAccessToPhone": true,
  "hasAccessToLinkedin": false,
  "phoneNumber": "+91XXXXXXXXXX",
  "linkedinUrl": null
}
```

### Frontend Components

#### 1. PremiumContact Component
Location: `src/components/premium-contact.tsx`

**Props:**
```typescript
interface PremiumContactProps {
  userId: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  hasAccessToPhone: boolean;
  hasAccessToLinkedin: boolean;
  onPurchase: (type: 'phone' | 'linkedin', userId: string) => Promise<void>;
  isLoading?: boolean;
}
```

**Features:**
- Modal-based purchase flow
- Clear pricing information
- Access status indicators
- Loading states during purchase
- Success/error handling

#### 2. Integration Points

**Dashboard Page:**
- Premium contact section in sidebar
- Available only when viewing a match
- Real-time access status updates
- Purchase history tracking

**Messages Page:**
- Premium contact section below chat area
- Direct call/LinkedIn buttons when access is granted
- Inline purchase options
- Visual indicators for locked/unlocked status

## User Experience

### Purchase Flow

1. **Discovery**: User sees contact option with price
2. **Confirmation**: Modal shows detailed information and pricing
3. **Payment**: Secure payment processing (simulated)
4. **Access**: Immediate access to purchased information
5. **Usage**: Direct integration with phone/LinkedIn apps

### Visual Design

#### Locked State
- Grayed out buttons with lock icons
- Clear pricing information (₹10 for phone, ₹�5 for LinkedIn)
- "Unlock" call-to-action buttons

#### Unlocked State
- Green checkmarks and "Unlocked" badges
- Functional call/LinkedIn buttons
- Direct access to contact information

#### Loading State
- Spinner animations during purchase
- Disabled buttons to prevent duplicate purchases
- Clear progress indicators

## Security Considerations

### Data Protection
- Phone numbers and LinkedIn URLs are stored securely
- Access is granted only after successful purchase
- Purchase history is tracked for auditing
- No sensitive data is exposed without proper authorization

### Access Control
- Server-side validation of purchase status
- User authentication required for all operations
- Unique constraints prevent duplicate purchases
- Purchase ownership verification

### Payment Security
- Simulated payment processing (ready for real integration)
- Transaction logging for all purchases
- Fraud prevention measures
- Secure API endpoints with proper validation

## Integration Guide

### Adding Premium Features to New Pages

1. **Import the PremiumContact component:**
```typescript
import PremiumContact from "@/components/premium-contact";
```

2. **Add state management:**
```typescript
const [premiumAccess, setPremiumAccess] = useState<{
  hasAccessToPhone: boolean;
  hasAccessToLinkedin: boolean;
  phoneNumber?: string;
  linkedinUrl?: string;
} | null>(null);
const [isPurchasing, setIsPurchasing] = useState(false);
```

3. **Add access check function:**
```typescript
const checkPremiumAccess = async (targetUserId: string) => {
  try {
    const response = await fetch(`/api/premium/access?targetUserId=${targetUserId}`);
    if (response.ok) {
      const data = await response.json();
      setPremiumAccess(data);
    }
  } catch (error) {
    console.error("Error checking premium access:", error);
  }
};
```

4. **Add purchase function:**
```typescript
const handlePremiumPurchase = async (type: 'phone' | 'linkedin', targetUserId: string) => {
  setIsPurchasing(true);
  try {
    const response = await fetch("/api/premium/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, targetUserId }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        await checkPremiumAccess(targetUserId);
      }
    }
  } catch (error) {
    console.error("Error purchasing premium access:", error);
  } finally {
    setIsPurchasing(false);
  }
};
```

5. **Use the component:**
```typescript
<PremiumContact
  userId={targetUser.id}
  phoneNumber={premiumAccess?.phoneNumber}
  linkedinUrl={premiumAccess?.linkedinUrl}
  hasAccessToPhone={premiumAccess?.hasAccessToPhone || false}
  hasAccessToLinkedin={premiumAccess?.hasAccessToLinkedin || false}
  onPurchase={handlePremiumPurchase}
  isLoading={isPurchasing}
/>
```

## Testing

### Test Scenarios

1. **First-time Purchase**
   - User sees locked contact options
   - Clicks purchase button
   - Sees confirmation modal
   - Completes purchase
   - Gains access to contact information

2. **Repeat Access**
   - User returns to profile/page
   - Sees unlocked status
   - Can access contact information directly

3. **Duplicate Purchase Prevention**
   - User tries to purchase same access twice
   - System prevents duplicate purchase
   - Shows appropriate error message

4. **Error Handling**
   - Network errors during purchase
   - Invalid user IDs
   - Payment processing failures
   - Server errors

### Performance Considerations

- Minimal API calls for access checking
- Efficient state management
- Optimized component rendering
- Proper loading states
- Error boundary implementation

## Future Enhancements

### Planned Features

1. **Subscription Model**
   - Monthly premium subscription
   - Unlimited contact access
   - Additional premium features

2. **Payment Gateway Integration**
   - Real payment processing
   - Multiple payment methods
   - Recurring billing

3. **Advanced Analytics**
   - Purchase tracking and reporting
   - Revenue analytics
   - User behavior insights

4. **Enhanced Security**
   - Two-factor authentication for purchases
   - Advanced fraud detection
   - Data encryption improvements

### Technical Improvements

1. **Caching Layer**
   - Redis for access status caching
   - Improved performance
   - Reduced database load

2. **Background Jobs**
   - Purchase receipt generation
   - Email notifications
   - Data analytics processing

3. **Mobile App Integration**
   - Native mobile features
   - Push notifications
   - Enhanced UI/UX

## Monitoring and Analytics

### Key Metrics

1. **Purchase Metrics**
   - Number of phone number purchases
   - Number of LinkedIn profile purchases
   - Conversion rates
   - Revenue tracking

2. **User Engagement**
   - Feature usage statistics
   - User retention rates
   - Premium feature adoption

3. **Technical Performance**
   - API response times
   - Error rates
   - System uptime

### Logging

- All purchase transactions logged
- Access requests tracked
- Error events monitored
- User behavior analyzed

## Conclusion

The premium contact features provide a valuable service to users while creating a sustainable revenue model for HeartBeat. The implementation is secure, user-friendly, and scalable, with clear paths for future enhancements.

The system maintains the high-quality user experience expected from HeartBeat while adding practical functionality that helps users connect more meaningfully.