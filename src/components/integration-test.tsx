'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, CreditCard, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  status: 'healthy' | 'issues_detected';
  timestamp: string;
  tests: {
    firebase: {
      connection: boolean;
      auth: boolean;
      firestore: boolean;
      storage: boolean;
      error: string | null;
    };
    razorpay: {
      connection: boolean;
      orderCreation: boolean;
      error: string | null;
    };
    database: {
      connection: boolean;
      userAccess: boolean;
      error: string | null;
    };
  };
  summary: {
    firebase: number;
    razorpay: number;
    database: number;
    total: number;
    totalTests: number;
  };
}

export function IntegrationTest() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runIntegrationTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-integration');
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
        toast({
          title: "Integration Test Completed",
          description: `Status: ${data.status === 'healthy' ? 'All systems operational' : 'Some issues detected'}`,
        });
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error) {
      console.error('Integration test error:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runIntegrationTest();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">Pass</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Fail</Badge>
    );
  };

  const getOverallStatusIcon = () => {
    if (!testResult) return <AlertCircle className="h-6 w-6 text-gray-600" />;
    
    return testResult.status === 'healthy' ? (
      <CheckCircle className="h-6 w-6 text-green-600" />
    ) : (
      <XCircle className="h-6 w-6 text-red-600" />
    );
  };

  const getOverallStatusBadge = () => {
    if (!testResult) return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    
    return testResult.status === 'healthy' ? (
      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Issues Detected</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <CardTitle>Integration Status</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getOverallStatusIcon()}
              {getOverallStatusBadge()}
              <Button
                onClick={runIntegrationTest}
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
            </div>
          </div>
          <CardDescription>
            Test the integration status of Firebase, Razorpay, and Database services
          </CardDescription>
        </CardHeader>
        {testResult && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {testResult.summary.total}/{testResult.summary.totalTests}
                </div>
                <div className="text-sm text-orange-800">Tests Passing</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.summary.firebase}/3
                </div>
                <div className="text-sm text-blue-800">Firebase Services</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {testResult.summary.razorpay}/2
                </div>
                <div className="text-sm text-purple-800">Razorpay Services</div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Firebase Tests */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Firebase Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.firebase.connection)}
                      {getStatusBadge(testResult.tests.firebase.connection)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.firebase.auth)}
                      {getStatusBadge(testResult.tests.firebase.auth)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Firestore</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.firebase.firestore)}
                      {getStatusBadge(testResult.tests.firebase.firestore)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.firebase.storage)}
                      {getStatusBadge(testResult.tests.firebase.storage)}
                    </div>
                  </div>
                  {testResult.tests.firebase.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {testResult.tests.firebase.error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Razorpay Tests */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Razorpay Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.razorpay.connection)}
                      {getStatusBadge(testResult.tests.razorpay.connection)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Order Creation</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.razorpay.orderCreation)}
                      {getStatusBadge(testResult.tests.razorpay.orderCreation)}
                    </div>
                  </div>
                  {testResult.tests.razorpay.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {testResult.tests.razorpay.error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Database Tests */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Database Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.database.connection)}
                      {getStatusBadge(testResult.tests.database.connection)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Access</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.tests.database.userAccess)}
                      {getStatusBadge(testResult.tests.database.userAccess)}
                    </div>
                  </div>
                  {testResult.tests.database.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {testResult.tests.database.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Last tested: {new Date(testResult.timestamp).toLocaleString()}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}