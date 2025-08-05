"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, MapPin, Clock, AlertCircle, User, CreditCard, Navigation } from "lucide-react";
import { useSession } from "next-auth/react";

interface UberLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UberEstimate {
  fare: string;
  currency: string;
  distance: number;
  duration: number;
  pickup_estimate: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  location?: string;
}

interface Meeting {
  id: string;
  boyUserId: string;
  girlUserId: string;
  restaurantId: string;
  dateTime: string;
  status: string;
  restaurant: {
    name: string;
    address: string;
    city: string;
  };
}

interface CabBookingProps {
  meeting: Meeting;
  targetUser: User;
  onCabBooked?: (booking: any) => void;
}

export default function CabBooking({ meeting, targetUser, onCabBooked }: CabBookingProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [dropLocation, setDropLocation] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [estimate, setEstimate] = useState<UberEstimate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UberLocation | null>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<UberLocation | null>(null);

  const isBoy = session?.user?.id === meeting.boyUserId;
  const isBookingForSelf = session?.user?.id === targetUser.id;

  useEffect(() => {
    if (session?.user?.location) {
      setPickupLocation(session.user.location);
      // Mock location coordinates - in real app, use geocoding
      setUserLocation({
        latitude: 19.0760,
        longitude: 72.8777,
        address: session.user.location,
      });
    }

    if (meeting.restaurant) {
      setDropLocation(meeting.restaurant.address);
      // Mock restaurant location - in real app, use geocoding
      setRestaurantLocation({
        latitude: 19.0753,
        longitude: 72.8748,
        address: meeting.restaurant.address,
      });
    }

    // Set default pickup time to 1 hour before meeting
    const meetingDateTime = new Date(meeting.dateTime);
    meetingDateTime.setHours(meetingDateTime.getHours() - 1);
    setPickupTime(meetingDateTime.toISOString().slice(0, 16));
  }, [meeting, session]);

  const getEstimate = async () => {
    if (!userLocation || !restaurantLocation) {
      alert('Please ensure both pickup and drop locations are set');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/uber/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: userLocation,
          dropoff: restaurantLocation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to get estimate');
      }
    } catch (error) {
      console.error('Error getting estimate:', error);
      alert('Failed to get estimate');
    } finally {
      setLoading(false);
    }
  };

  const bookCab = async () => {
    if (!estimate || !pickupTime) {
      alert('Please get estimate and set pickup time');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch('/api/cab-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: meeting.id,
          passengerId: targetUser.id,
          pickupLocation: pickupLocation,
          dropLocation: dropLocation,
          pickupTime: pickupTime,
          estimatedFare: parseInt(estimate.fare),
          bookForPassenger: !isBookingForSelf,
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        onCabBooked?.(booking);
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to book cab');
      }
    } catch (error) {
      console.error('Error booking cab:', error);
      alert('Failed to book cab');
    } finally {
      setBookingLoading(false);
    }
  };

  const resetForm = () => {
    setEstimate(null);
  };

  const calculatePaymentSplit = () => {
    if (!estimate) return null;

    const fare = parseInt(estimate.fare);
    const maxCoverage = 350;
    
    if (isBookingForSelf) {
      return {
        userPayment: fare,
        passengerPayment: 0,
        description: 'You pay the full amount',
      };
    } else {
      const userPayment = Math.min(fare, maxCoverage);
      const passengerPayment = Math.max(0, fare - maxCoverage);
      return {
        userPayment,
        passengerPayment,
        description: `You pay ₹${userPayment}, ${targetUser.name} pays ₹${passengerPayment}`,
      };
    }
  };

  const paymentSplit = calculatePaymentSplit();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Car className="w-4 h-4" />
          Book Cab
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Cab for {isBookingForSelf ? 'Yourself' : targetUser.name}</DialogTitle>
          <DialogDescription>
            {isBookingForSelf 
              ? 'Book a cab to travel to the meeting location'
              : `Book a cab for ${targetUser.name} to travel to the meeting location`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Details */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Route Details
              </Label>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pickup</p>
                    <p className="text-sm text-gray-600">{pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Drop-off</p>
                    <p className="text-sm text-gray-600">{dropLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          <div className="space-y-2">
            <Label htmlFor="pickup-time">Pickup Time</Label>
            <Input
              id="pickup-time"
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </div>

          {/* Get Estimate Button */}
          {!estimate && (
            <Button
              onClick={getEstimate}
              disabled={loading || !userLocation || !restaurantLocation}
              className="w-full"
            >
              {loading ? 'Getting Estimate...' : 'Get Fare Estimate'}
            </Button>
          )}

          {/* Estimate Display */}
          {estimate && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Fare Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Fare</p>
                    <p className="text-xl font-bold text-green-600">₹{estimate.fare}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="text-lg font-semibold">{estimate.distance} km</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-lg font-semibold">{estimate.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pickup Estimate</p>
                    <p className="text-lg font-semibold">{estimate.pickup_estimate} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Split */}
          {estimate && paymentSplit && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">{paymentSplit.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">You Pay</p>
                    <p className="text-lg font-bold text-blue-600">₹{paymentSplit.userPayment}</p>
                  </div>
                  {!isBookingForSelf && (
                    <div>
                      <p className="text-sm text-gray-600">{targetUser.name} Pays</p>
                      <p className="text-lg font-bold text-orange-600">₹{paymentSplit.passengerPayment}</p>
                    </div>
                  )}
                </div>
                {!isBookingForSelf && paymentSplit.passengerPayment > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {targetUser.name} will need to pay ₹{paymentSplit.passengerPayment} directly to the driver.
                      We'll notify them about your contribution.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Important Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isBookingForSelf 
                ? 'You are booking a cab for yourself. The full amount will be charged to you.'
                : `You are booking a cab for ${targetUser.name}. You can cover up to ₹350 of the fare.`
              }
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={bookCab}
              disabled={bookingLoading || !estimate || !pickupTime}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {bookingLoading ? 'Booking...' : 'Book Cab'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}