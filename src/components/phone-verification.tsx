'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, Shield, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientPhoneVerificationService } from '@/lib/client-phone-verification';

interface PhoneVerificationProps {
  onVerificationSuccess?: (data: any) => void;
  onVerificationFailure?: (error: string) => void;
  initialPhone?: string;
  mode?: 'register' | 'link';
  userId?: string;
}

export function PhoneVerification({
  onVerificationSuccess,
  onVerificationFailure,
  initialPhone = '',
  mode = 'register',
  userId
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sent' | 'verified' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined' && recaptchaContainerRef.current) {
      const verifier = clientPhoneVerificationService.initializeRecaptcha('recaptcha-container');
      if (verifier) {
        setRecaptchaVerifier(verifier);
      }
    }

    return () => {
      // Clean up reCAPTCHA
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!recaptchaVerifier) {
      setError('reCAPTCHA not initialized');
      return;
    }

    // Validate phone number
    if (!clientPhoneVerificationService.validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First validate with server
      const serverResponse = await fetch('/api/phone-verification/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        }),
      });

      const serverData = await serverResponse.json();

      if (!serverResponse.ok) {
        throw new Error(serverData.error || 'Failed to send OTP');
      }

      // Then send OTP via Firebase
      const result = await clientPhoneVerificationService.sendOTP(phoneNumber, recaptchaVerifier);

      if (result.success) {
        setVerificationId(result.verificationId || null);
        setVerificationStatus('sent');
        setCountdown(60); // 60 second countdown
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${phoneNumber}`,
        });
      } else {
        throw new Error(result.error || 'Failed to send OTP');
      }

    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
      setVerificationStatus('error');
      
      if (onVerificationFailure) {
        onVerificationFailure(errorMessage);
      }
      
      toast({
        title: "Failed to Send OTP",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationId || !otp) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Verify OTP with Firebase
      const result = await clientPhoneVerificationService.verifyOTP(verificationId, otp);

      if (result.success) {
        // Verify with server
        const serverResponse = await fetch('/api/phone-verification/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verificationId,
            otp,
            phoneNumber: phoneNumber
          }),
        });

        const serverData = await serverResponse.json();

        if (!serverResponse.ok) {
          throw new Error(serverData.error || 'Failed to verify OTP');
        }

        setVerificationStatus('verified');
        toast({
          title: "Phone Verified",
          description: "Your phone number has been successfully verified",
        });

        if (onVerificationSuccess) {
          onVerificationSuccess({
            phoneNumber: phoneNumber,
            verified: true,
            firebaseUser: result.user,
            serverData: serverData
          });
        }
      } else {
        throw new Error(result.error || 'Invalid verification code');
      }

    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      setError(errorMessage);
      
      if (onVerificationFailure) {
        onVerificationFailure(errorMessage);
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    setCountdown(0);
    setOtp('');
    setError(null);
    handleSendOTP();
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'sent':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-800">OTP Sent</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Ready</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <CardTitle>Phone Verification</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
        <CardDescription>
          {mode === 'register' 
            ? "Verify your phone number to create your account"
            : "Add a phone number to your account for additional security"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden" />

        {/* Phone Number Input */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChange={handlePhoneChange}
            disabled={verificationStatus === 'verified' || isLoading}
            className={verificationStatus === 'verified' ? 'bg-green-50' : ''}
          />
        </div>

        {/* OTP Input - Show only after sending OTP */}
        {verificationStatus !== 'idle' && (
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={verificationStatus === 'verified' || isVerifying}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {verificationStatus === 'idle' && (
            <Button
              onClick={handleSendOTP}
              disabled={isLoading || !phoneNumber}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Send Verification Code</span>
                </div>
              )}
            </Button>
          )}

          {verificationStatus === 'sent' && (
            <>
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className="w-full"
              >
                {isVerifying ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Verify Code</span>
                  </div>
                )}
              </Button>
              
              <Button
                onClick={handleResendOTP}
                disabled={countdown > 0}
                variant="outline"
                className="w-full"
              >
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <span>Resend Code</span>
                )}
              </Button>
            </>
          )}

          {verificationStatus === 'verified' && (
            <div className="text-center text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Phone Number Verified</p>
              <p className="text-sm">{phoneNumber}</p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center">
          {mode === 'register' ? (
            <p>We'll send a 6-digit verification code to your phone number</p>
          ) : (
            <p>Adding a phone number helps secure your account</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}