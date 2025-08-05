"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Account {
  id: string;
  provider: string;
  providerAccountId: string;
}

export function LinkedInConnect() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/auth/accounts");
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const linkedinAccount = accounts.find(account => account.provider === "linkedin");

  const handleConnectLinkedIn = async () => {
    setConnecting(true);
    try {
      await signIn("linkedin", { callbackUrl: "/" });
    } catch (error) {
      console.error("Error connecting LinkedIn:", error);
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            LinkedIn Connect
          </CardTitle>
          <CardDescription>
            Enhance your profile with LinkedIn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          LinkedIn Connect
          {linkedinAccount && (
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {linkedinAccount 
            ? "Your LinkedIn account is connected to your profile"
            : "Enhance your profile with LinkedIn verification"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {linkedinAccount ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              LinkedIn account successfully connected
            </div>
            <div className="text-xs text-gray-500">
              Account ID: {linkedinAccount.providerAccountId}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              LinkedIn not connected
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleConnectLinkedIn}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Connect LinkedIn
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}