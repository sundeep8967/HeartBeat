'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Linkedin, Lock, Unlock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RazorpayPaymentProps {
  type: 'phone' | 'linkedin';
  targetUserId: string;
  targetUserName: string;
  onPaymentSuccess: (data: any) => void;
  hasAccess?: boolean;
}

export function RazorpayPayment({
  type,
  targetUserId,
  targetUserName,
  onPaymentSuccess,
  hasAccess = false
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const prices = {
    phone: 10, // ₹10
    linkedin: 5  // ₹5
  };

  const typeConfig = {
    phone: {
      icon: Phone,
      label: 'Phone Number',
      description: 'Get direct contact information',
      color: 'bg-green-100 text-green-800'
    },
    linkedin: {
      icon: Linkedin,
      label: 'LinkedIn Profile',
      description: 'View professional profile',
      color: 'bg-blue-100 text-blue-800'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;
  const price = prices[type];

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Create Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          targetUserId
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      const order = data.order;
      const keyId = data.key_id;
      const prefill = data.prefill;
      const notes = data.notes;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'HeartBeat',
          description: `${config.label} - ${targetUserName}`,
          order_id: order.id,
          prefill: prefill,
          notes: notes,
          theme: {
            color: '#8B5CF6', // Purple color matching HeartBeat theme
          },
          modal: {
            ondismiss: function() {
              setIsLoading(false);
            }
          },
          handler: async function(response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                toast({
                  title: "Payment Successful!",
                  description: `You now have access to ${targetUserName}'s ${config.label.toLowerCase()}.`,
                });
                onPaymentSuccess(verifyData);
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support if the issue persists.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (hasAccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">{config.label}</CardTitle>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            You have access to {targetUserName}'s {config.label.toLowerCase()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <CardTitle>{config.label}</CardTitle>
          </div>
          <Badge className={config.color}>
            ₹{price}
          </Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Unlock {config.label}</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}