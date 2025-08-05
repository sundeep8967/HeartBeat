"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Star, Car, Users, Heart, AlertCircle, CheckCircle, XCircle, Phone } from "lucide-react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  location?: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
}

interface CabBooking {
  id: string;
  status: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: string;
  estimatedFare: number;
  userPayment: number;
  passengerPayment: number;
  user: User;
  passenger: User;
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
  specialRequests?: string;
  boyUser: User;
  girlUser: User;
  restaurant: Restaurant;
  cabBookings?: CabBooking[];
}

interface MeetingStatusProps {
  meeting: Meeting;
  onStatusUpdate?: (meeting: Meeting) => void;
}

export default function MeetingStatus({ meeting, onStatusUpdate }: MeetingStatusProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);

  const isBoy = session?.user?.id === meeting.boyUserId;
  const isGirl = session?.user?.id === meeting.girlUserId;
  const currentUser = isBoy ? meeting.boyUser : meeting.girlUser;
  const partner = isBoy ? meeting.girlUser : meeting.boyUser;

  const userPayment = isBoy ? meeting.boyPayment : meeting.girlPayment;
  const userPaymentStatus = isBoy ? meeting.boyPaymentStatus : meeting.girlPaymentStatus;
  const partnerPaymentStatus = isBoy ? meeting.girlPaymentStatus : meeting.boyPaymentStatus;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const updateMeetingStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedMeeting = await response.json();
        onStatusUpdate?.(updatedMeeting);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update meeting status');
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
      alert('Failed to update meeting status');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatDateTime(meeting.dateTime);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            <CardTitle>Meeting with {partner.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(meeting.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(meeting.status)}
              <span className="capitalize">{meeting.status}</span>
            </div>
          </Badge>
        </div>
        <CardDescription>
          {meeting.status === 'pending' && 'Waiting for confirmation'}
          {meeting.status === 'confirmed' && 'Meeting confirmed - get ready!'}
          {meeting.status === 'cancelled' && 'Meeting has been cancelled'}
          {meeting.status === 'completed' && 'Meeting completed successfully'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Restaurant Details */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Restaurant
          </h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium">{meeting.restaurant.name}</p>
            <p className="text-sm text-gray-600">{meeting.restaurant.address}</p>
            {meeting.restaurant.cuisine && (
              <Badge variant="outline" className="mt-1">
                {meeting.restaurant.cuisine}
              </Badge>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </h4>
            <p className="text-sm bg-gray-50 p-2 rounded">{date}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time
            </h4>
            <p className="text-sm bg-gray-50 p-2 rounded">{time}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Payment Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">You Pay</p>
              <p className="font-bold text-lg">₹{userPayment}</p>
              <Badge 
                className={`mt-1 ${
                  userPaymentStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {userPaymentStatus}
              </Badge>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">{partner.name} Pays</p>
              <p className="font-bold text-lg">₹{isBoy ? meeting.girlPayment : meeting.boyPayment}</p>
              <Badge 
                className={`mt-1 ${
                  partnerPaymentStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {partnerPaymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cab Bookings */}
        {meeting.cabBookings && meeting.cabBookings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Car className="w-4 h-4" />
              Cab Bookings
            </h4>
            <div className="space-y-2">
              {meeting.cabBookings.map((cab) => (
                <div key={cab.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {cab.user.name} → {cab.passenger.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cab.pickupLocation} → {cab.dropLocation}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pickup: {new Date(cab.pickupTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(cab.status)}>
                        {cab.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        ₹{cab.estimatedFare}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Requests */}
        {meeting.specialRequests && (
          <div className="space-y-2">
            <h4 className="font-semibold">Special Requests</h4>
            <p className="text-sm bg-gray-50 p-3 rounded-lg">{meeting.specialRequests}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {meeting.status === 'pending' && isGirl && (
            <Button
              onClick={() => updateMeetingStatus('confirmed')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Confirming...' : 'Accept Meeting'}
            </Button>
          )}
          
          {meeting.status === 'pending' && (
            <Button
              onClick={() => updateMeetingStatus('cancelled')}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Cancelling...' : 'Cancel Meeting'}
            </Button>
          )}

          {meeting.status === 'confirmed' && (
            <Button
              onClick={() => updateMeetingStatus('completed')}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Completing...' : 'Mark as Completed'}
            </Button>
          )}

          {/* Contact Button */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // In a real app, this would open a chat or call interface
              alert(`Contact ${partner.name} at ${partner.email}`);
            }}
          >
            <Phone className="w-4 h-4" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}