"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MeetingArrangement from "@/components/meeting-arrangement";
import CabBooking from "@/components/cab-booking";
import MeetingStatus from "@/components/meeting-status";
import MeetingPayment from "@/components/meeting-payment";
import NotificationSystem from "@/components/notification-system";
import { Heart, Users, Car, CreditCard, Bell, AlertCircle, CheckCircle, Info } from "lucide-react";

// Mock data for demonstration
const mockTargetUser = {
  id: "2",
  name: "Priya Sharma",
  email: "priya@example.com",
  location: "Mumbai, Maharashtra",
  image: "/api/placeholder/100/100",
};

const mockMeeting = {
  id: "1",
  boyUserId: "1",
  girlUserId: "2",
  restaurantId: "1",
  dateTime: "2024-02-15T19:00:00Z",
  status: "pending",
  paymentTier: "650",
  boyPayment: 650,
  girlPayment: 350,
  totalAmount: 1000,
  boyPaymentStatus: "pending",
  girlPaymentStatus: "pending",
  specialRequests: "Window seat preferred",
  boyUser: {
    id: "1",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    location: "Mumbai, Maharashtra",
  },
  girlUser: {
    id: "2",
    name: "Priya Sharma",
    email: "priya@example.com",
    location: "Mumbai, Maharashtra",
  },
  restaurant: {
    id: "1",
    name: "The Table",
    address: "Colaba, Mumbai",
    city: "Mumbai",
    cuisine: "Italian, Continental",
    priceRange: "₹₹₹",
    rating: 4.5,
  },
  cabBookings: [],
};

const mockRestaurants = [
  {
    id: "1",
    name: "The Table",
    description: "Fine dining restaurant with exquisite cuisine",
    address: "Colaba, Mumbai",
    city: "Mumbai",
    cuisine: "Italian, Continental",
    priceRange: "₹₹₹",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Pa Pa Ya",
    description: "Modern Asian cuisine with rooftop seating",
    address: "Lower Parel, Mumbai",
    city: "Mumbai",
    cuisine: "Asian, Japanese",
    priceRange: "₹₹₹",
    rating: 4.3,
  },
  {
    id: "3",
    name: "Olive Bar & Kitchen",
    description: "Mediterranean cuisine in a beautiful setting",
    address: "Bandra, Mumbai",
    city: "Mumbai",
    cuisine: "Mediterranean, European",
    priceRange: "₹₹₹₹",
    rating: 4.7,
  },
];

export default function MeetingDemoPage() {
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleMeetingCreated = (meeting: any) => {
    setCurrentMeeting(meeting);
    // Add notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        type: 'meeting_created',
        title: 'New Meeting Request',
        message: `You have a new meeting request at ${meeting.restaurant.name}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedUser: mockTargetUser,
        meeting,
      },
      ...prev,
    ]);
  };

  const handleCabBooked = (booking: any) => {
    // Add notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        type: 'cab_booked',
        title: 'Cab Booked',
        message: `A cab has been booked for your meeting`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: booking,
      },
      ...prev,
    ]);
  };

  const handlePaymentComplete = (meeting: any) => {
    setCurrentMeeting(meeting);
    // Add notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        type: 'payment_completed',
        title: 'Payment Completed',
        message: `Payment of ₹${meeting.boyPayment} completed successfully`,
        isRead: false,
        createdAt: new Date().toISOString(),
        meeting,
      },
      ...prev,
    ]);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                ♡
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HeartBeat Meetings</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationSystem onNotificationClick={handleNotificationClick} />
              <Badge variant="outline">Demo Mode</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Arrange Your First Meeting
          </h2>
          <p className="text-gray-600 mb-6">
            Experience the complete meeting arrangement workflow - from restaurant selection to cab booking and payments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Meeting Arrangement
                </CardTitle>
                <CardDescription>
                  Choose from our partner restaurants and set up your first meeting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-orange-600" />
                  Cab Booking
                </CardTitle>
                <CardDescription>
                  Book cabs for yourself or your partner with smart payment splitting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Secure Payments
                </CardTitle>
                <CardDescription>
                  Safe and secure payment processing with multiple payment tiers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Demo Content */}
        <Tabs defaultValue="arrange" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="arrange">Arrange Meeting</TabsTrigger>
            <TabsTrigger value="status">Meeting Status</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="cab">Cab Booking</TabsTrigger>
          </TabsList>

          <TabsContent value="arrange" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Click the button below to arrange a meeting with {mockTargetUser.name}. 
                This will demonstrate the complete meeting arrangement workflow.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <MeetingArrangement 
                targetUser={mockTargetUser}
                onMeetingCreated={handleMeetingCreated}
              />
            </div>

            {currentMeeting && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Meeting created successfully! Check the "Meeting Status" tab to see details.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            {currentMeeting ? (
              <MeetingStatus 
                meeting={currentMeeting}
                onStatusUpdate={setCurrentMeeting}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Meeting Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Arrange a meeting first to see the status here.
                  </p>
                  <Button onClick={() => document.querySelector('[value="arrange"]')?.click()}>
                    Arrange Meeting
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            {currentMeeting ? (
              <MeetingPayment 
                meeting={currentMeeting}
                onPaymentComplete={handlePaymentComplete}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Meeting to Pay For
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create a meeting first to make payments.
                  </p>
                  <Button onClick={() => document.querySelector('[value="arrange"]')?.click()}>
                    Arrange Meeting
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cab" className="space-y-6">
            {currentMeeting ? (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Book a cab for yourself or your partner. You can cover up to ₹350 of your partner's fare.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <CabBooking 
                    meeting={currentMeeting}
                    targetUser={mockTargetUser}
                    onCabBooked={handleCabBooked}
                  />
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Meeting for Cab Booking
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create a meeting first to book cabs.
                  </p>
                  <Button onClick={() => document.querySelector('[value="arrange"]')?.click()}>
                    Arrange Meeting
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flexible Payment Tiers</CardTitle>
                <CardDescription>
                  Choose from three payment options that work for both you and your partner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ₹1000 - You pay full amount</li>
                  <li>• ₹650 - Split payment (₹350 each)</li>
                  <li>• ₹500 - Equal payment (₹500 each)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Cab Booking</CardTitle>
                <CardDescription>
                  Book cabs with intelligent payment splitting and coverage limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Book for yourself or partner</li>
                  <li>• Up to ₹350 coverage for partner</li>
                  <li>• Real-time fare estimates</li>
                  <li>• Scheduled pickup times</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-time Notifications</CardTitle>
                <CardDescription>
                  Stay updated with instant notifications for all meeting activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Meeting requests</li>
                  <li>• Payment confirmations</li>
                  <li>• Cab booking updates</li>
                  <li>• Status changes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}