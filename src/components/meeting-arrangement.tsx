"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Star, Car, Users, Heart, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  images?: string[];
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
}

interface MeetingArrangementProps {
  targetUser: User;
  onMeetingCreated?: (meeting: Meeting) => void;
}

export default function MeetingArrangement({ targetUser, onMeetingCreated }: MeetingArrangementProps) {
  const { data: session } = useSession();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentTier, setPaymentTier] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    if (session?.user?.location) {
      // Extract city from user location
      const userCity = session.user.location.split(',')[0]?.trim();
      if (userCity) {
        setCity(userCity);
        fetchRestaurants(userCity);
      }
    }
  }, [session]);

  const fetchRestaurants = async (searchCity?: string) => {
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);
      
      const response = await fetch(`/api/restaurants?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleCreateMeeting = async () => {
    if (!selectedRestaurant || !selectedDate || !selectedTime || !paymentTier) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const dateTime = `${selectedDate}T${selectedTime}:00`;
      
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          girlUserId: targetUser.id,
          restaurantId: selectedRestaurant,
          dateTime,
          paymentTier,
          specialRequests,
        }),
      });

      if (response.ok) {
        const meeting = await response.json();
        onMeetingCreated?.(meeting);
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRestaurant("");
    setSelectedDate("");
    setSelectedTime("");
    setPaymentTier("");
    setSpecialRequests("");
  };

  const getPaymentDetails = (tier: string) => {
    switch (tier) {
      case '1000':
        return { boy: 1000, girl: 0, description: 'You pay ₹1000, girl pays nothing' };
      case '650':
        return { boy: 650, girl: 350, description: 'You pay ₹650, girl pays ₹350' };
      case '500':
        return { boy: 500, girl: 500, description: 'You pay ₹500, girl pays ₹500' };
      default:
        return { boy: 0, girl: 0, description: '' };
    }
  };

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);
  const paymentDetails = paymentTier ? getPaymentDetails(paymentTier) : null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <Heart className="w-4 h-4 mr-2" />
          Arrange First Meet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Arrange First Meet with {targetUser.name}</DialogTitle>
          <DialogDescription>
            Plan your first meeting at one of our partner restaurants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Restaurant Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Restaurant</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchRestaurants(city)}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="grid gap-4 max-h-64 overflow-y-auto">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className={`cursor-pointer transition-all ${
                    selectedRestaurant === restaurant.id
                      ? 'ring-2 ring-purple-600 bg-purple-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRestaurant(restaurant.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{restaurant.name}</h3>
                          {restaurant.rating && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {restaurant.rating}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{restaurant.cuisine}</p>
                        <p className="text-sm text-gray-500 mb-2">{restaurant.address}</p>
                        {restaurant.priceRange && (
                          <Badge variant="outline">{restaurant.priceRange}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Tier Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Payment Option</Label>
            <div className="grid gap-3">
              {[
                { tier: '1000', label: 'Premium - ₹1000', description: 'You pay ₹1000, girl pays nothing' },
                { tier: '650', label: 'Standard - ₹650', description: 'You pay ₹650, girl pays ₹350' },
                { tier: '500', label: 'Basic - ₹500', description: 'You pay ₹500, girl pays ₹500' },
              ].map((option) => (
                <Card
                  key={option.tier}
                  className={`cursor-pointer transition-all ${
                    paymentTier === option.tier
                      ? 'ring-2 ring-purple-600 bg-purple-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setPaymentTier(option.tier)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{option.label}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {paymentTier === option.tier && (
                        <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="special-requests">Special Requests (Optional)</Label>
            <Textarea
              id="special-requests"
              placeholder="Any special dietary requirements, seating preferences, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedRestaurantData && selectedDate && selectedTime && paymentTier && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{selectedRestaurantData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{selectedTime}</span>
                </div>
                {paymentDetails && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{paymentDetails.description}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
              onClick={handleCreateMeeting}
              disabled={loading || !selectedRestaurant || !selectedDate || !selectedTime || !paymentTier}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}