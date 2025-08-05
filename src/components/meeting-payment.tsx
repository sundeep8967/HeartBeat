"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { loadRazorpayScript } from '@/lib/razorpay';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Meeting {
  id: string;
  boyUserId: string;
  girlUserId: string;
  restaurantId: string;
  dateTime: string;
  status: string;
  paymentTier: string;
  boyPayment: number;
  girlPayment: number;
  totalAmount: number;
  boyPaymentStatus: string;
  girlPaymentStatus: string;
  boyUser: User;
  girlUser: User;
  restaurant: Restaurant;
}

interface MeetingPaymentProps {
  meeting: Meeting;
  onPaymentComplete?: (meeting: Meeting) => void;
}

export default function MeetingPayment({ meeting, onPaymentComplete }: MeetingPaymentProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { data: session } = useSession();
  const isBoy = session?.user?.id === meeting.boyUserId;
  const isGirl = session?.user?.id === meeting.girlUserId;

  const userPayment = isBoy ? meeting.boyPayment : meeting.girlPayment;
  const userPaymentStatus = isBoy ? meeting.boyPaymentStatus : meeting.girlPaymentStatus;
  const partnerPaymentStatus = isBoy ? meeting.girlPaymentStatus : meeting.boyPaymentStatus;

  const partner = isBoy ? meeting.girlUser : meeting.boyUser;

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Load Razorpay script
      await loadRazorpayScript();

      // Create payment order
      const response = await fetch('/api/meetings/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: meeting.id,
          paymentType: 'meeting',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HeartBeat',
        description: orderData.meeting.restaurant,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/meetings/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              meetingId: meeting.id,
              paymentType: 'meeting',
              paymentFor: isBoy ? 'boy' : 'girl',
            }),
          });

          if (verifyResponse.ok) {
            setSuccess('Payment completed successfully!');
            onPaymentComplete?.({ ...meeting, 
              [isBoy ? 'boyPaymentStatus' : 'girlPaymentStatus']: 'completed',
              status: partnerPaymentStatus === 'completed' ? 'confirmed' : meeting.status
            });
          } else {
            const errorData = await verifyResponse.json();
            setError(errorData.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: '', // You can add phone number if available
        },
        theme: {
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const canPay = userPaymentStatus === 'pending' && meeting.status !== 'cancelled';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment to confirm the meeting
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error and Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Payment Summary */}
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Meeting Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Restaurant:</span> {meeting.restaurant.name}</p>
              <p><span className="font-medium">Date:</span> {new Date(meeting.dateTime).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {new Date(meeting.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><span className="font-medium">Payment Tier:</span> ₹{meeting.paymentTier}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Your Payment</p>
              <p className="text-2xl font-bold text-blue-600">₹{userPayment}</p>
              <Badge className={getStatusColor(userPaymentStatus)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(userPaymentStatus)}
                  <span className="capitalize">{userPaymentStatus}</span>
                </div>
              </Badge>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{partner.name}'s Payment</p>
              <p className="text-2xl font-bold text-orange-600">₹{isBoy ? meeting.girlPayment : meeting.boyPayment}</p>
              <Badge className={getStatusColor(partnerPaymentStatus)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(partnerPaymentStatus)}
                  <span className="capitalize">{partnerPaymentStatus}</span>
                </div>
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Status Information */}
        <div className="space-y-2">
          {userPaymentStatus === 'completed' && partnerPaymentStatus === 'pending' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your payment is complete! Waiting for {partner.name} to complete their payment.
              </AlertDescription>
            </Alert>
          )}

          {userPaymentStatus === 'completed' && partnerPaymentStatus === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Both payments completed! Your meeting is confirmed.
              </AlertDescription>
            </Alert>
          )}

          {userPaymentStatus === 'pending' && partnerPaymentStatus === 'completed' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {partner.name} has paid! Complete your payment to confirm the meeting.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Button */}
        {canPay && (
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {loading ? 'Processing...' : `Pay ₹${userPayment}`}
          </Button>
        )}

        {/* Meeting Status */}
        <div className="text-center">
          <Badge 
            className={
              meeting.status === 'confirmed' 
                ? 'bg-green-100 text-green-800' 
                : meeting.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            Meeting Status: <span className="capitalize ml-1">{meeting.status}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}