"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Linkedin, Lock, Unlock, CheckCircle } from "lucide-react";
import { RazorpayPayment } from "./razorpay-payment";

interface PremiumContactProps {
  userId: string;
  userName?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  hasAccessToPhone: boolean;
  hasAccessToLinkedin: boolean;
  onPurchaseSuccess?: (data: any) => void;
}

export default function PremiumContact({
  userId,
  userName = "User",
  phoneNumber,
  linkedinUrl,
  hasAccessToPhone,
  hasAccessToLinkedin,
  onPurchaseSuccess
}: PremiumContactProps) {
  const handlePaymentSuccess = (data: any) => {
    if (onPurchaseSuccess) {
      onPurchaseSuccess(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Phone Number Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Phone className="h-5 w-5 text-purple-600" />
            Phone Number
            {hasAccessToPhone ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Unlock className="h-3 w-3 mr-1" />
                Unlocked
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Get direct contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasAccessToPhone && phoneNumber ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">{phoneNumber}</span>
              </div>
              <Badge className="bg-green-500 text-white">Purchased</Badge>
            </div>
          ) : (
            <RazorpayPayment
              type="phone"
              targetUserId={userId}
              targetUserName={userName}
              onPaymentSuccess={handlePaymentSuccess}
              hasAccess={hasAccessToPhone}
            />
          )}
        </CardContent>
      </Card>

      {/* LinkedIn Profile Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Linkedin className="h-5 w-5 text-blue-600" />
            LinkedIn Profile
            {hasAccessToLinkedin ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Unlock className="h-3 w-3 mr-1" />
                Unlocked
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">
            View professional LinkedIn profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasAccessToLinkedin && linkedinUrl ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">LinkedIn Profile Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">Purchased</Badge>
                <button 
                  onClick={() => window.open(linkedinUrl, '_blank')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ) : (
            <RazorpayPayment
              type="linkedin"
              targetUserId={userId}
              targetUserName={userName}
              onPaymentSuccess={handlePaymentSuccess}
              hasAccess={hasAccessToLinkedin}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}