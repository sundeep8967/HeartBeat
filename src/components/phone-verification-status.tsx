'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Shield, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationStatus {
  verified: boolean;
  firebaseVerified: boolean;
  phoneNumber: string | null;
  verifiedAt: string | null;
  lastUpdated: string | null;
}

interface PhoneVerificationStatusProps {
  onRefresh?: () => void;
  showActions?: boolean;
}

export function PhoneVerificationStatus({ onRefresh, showActions = true }: PhoneVerificationStatusProps) {
  const [status, setStatus] = useState<PhoneVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/phone-verification/status');
      const data = await response.json();

      if (response.ok) {
        setStatus(data.phoneVerification);
      } else {
        throw new Error(data.error || 'Failed to fetch phone verification status');
      }
    } catch (error) {
      console.error('Error fetching phone verification status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch phone verification status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    fetchStatus();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="h-5 w-5 text-gray-600" />;
    
    if (status.verified && status.firebaseVerified) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (status.verified || status.firebaseVerified) {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!status) return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    
    if (status.verified && status.firebaseVerified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    } else if (status.verified || status.firebaseVerified) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partially Verified</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Not Verified</Badge>;
    }
  };

  const getStatusText = () => {
    if (!status) return "Loading verification status...";
    
    if (status.verified && status.firebaseVerified) {
      return "Your phone number is fully verified";
    } else if (status.verified) {
      return "Phone number verified in database, but not in Firebase";
    } else if (status.firebaseVerified) {
      return "Phone number verified in Firebase, but not in database";
    } else {
      return "Phone number not verified";
    }
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return "Not set";
    
    const formatted = phone.replace(/[\s\-\(\)]/g, '');
    if (formatted.startsWith('+1')) {
      return `+1 (${formatted.slice(2, 5)}) ${formatted.slice(5, 8)}-${formatted.slice(8, 12)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Phone Verification Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <CardTitle>Phone Verification Status</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {getStatusBadge()}
            {showActions && (
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Number */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Phone Number:</span>
          <span className="text-sm">{formatPhoneNumber(status.phoneNumber)}</span>
        </div>

        {/* Database Verification */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Database Verified:</span>
          <div className="flex items-center space-x-2">
            {status.verified ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">{status.verified ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {/* Firebase Verification */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Firebase Verified:</span>
          <div className="flex items-center space-x-2">
            {status.firebaseVerified ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">{status.firebaseVerified ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {/* Verification Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Verified At:</span>
          <span className="text-sm">{formatDate(status.verifiedAt)}</span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Updated:</span>
          <span className="text-sm">{formatDate(status.lastUpdated)}</span>
        </div>

        {/* Security Benefits */}
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Security Benefits</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Account recovery options</li>
            <li>• Two-factor authentication</li>
            <li>• Enhanced account security</li>
            <li>• Verified profile badge</li>
          </ul>
        </div>

        {/* Action Buttons */}
        {showActions && !status.verified && (
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              Verify Phone Number
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}