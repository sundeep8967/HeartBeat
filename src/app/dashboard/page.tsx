"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, Star, MessageCircle, Users, Settings, LogOut, Phone, Linkedin } from "lucide-react";
import { signOut } from "next-auth/react";
import PremiumContact from "@/components/premium-contact";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  title?: string;
  company?: string;
  industry?: string;
  location?: string;
  bio?: string;
  age?: number;
  interests?: string;
  lifestyle?: string;
  relationshipGoals?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  verificationLevel?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<User[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [premiumAccess, setPremiumAccess] = useState<{
    hasAccessToPhone: boolean;
    hasAccessToLinkedin: boolean;
    phoneNumber?: string;
    linkedinUrl?: string;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchCurrentUser();
      fetchPotentialMatches();
    }
  }, [status, router]);

  useEffect(() => {
    if (currentMatch && session) {
      checkPremiumAccess(currentMatch.id);
    }
  }, [currentMatch, session]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/matches/potential");
      if (response.ok) {
        const data = await response.json();
        setPotentialMatches(data.matches);
      }
    } catch (error) {
      console.error("Error fetching potential matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) return;

    const currentMatch = potentialMatches[currentMatchIndex];
    try {
      await fetch("/api/matches/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likedUserId: currentMatch.id }),
      });

      // Move to next match
      setCurrentMatchIndex(prev => prev + 1);
    } catch (error) {
      console.error("Error liking user:", error);
    }
  };

  const handlePass = () => {
    // Move to next match without recording
    setCurrentMatchIndex(prev => prev + 1);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const checkPremiumAccess = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/premium/access?targetUserId=${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        setPremiumAccess(data);
      }
    } catch (error) {
      console.error("Error checking premium access:", error);
    }
  };

  const handlePremiumPurchase = async (type: 'phone' | 'linkedin', targetUserId: string) => {
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/premium/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, targetUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh premium access
          await checkPremiumAccess(targetUserId);
        }
      }
    } catch (error) {
      console.error("Error purchasing premium access:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fb]">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 animate-pulse">
            ♡
          </div>
          <p className="text-gray-600">Loading HeartBeat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fb]">
        <p>Error loading user data</p>
      </div>
    );
  }

  const currentMatch = potentialMatches[currentMatchIndex];
  const hasMoreMatches = currentMatchIndex < potentialMatches.length;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg transform -rotate-12">
                ♡
              </div>
              <span className="text-xl font-medium text-gray-900">HeartBeat</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                <Users className="h-4 w-4 mr-2" />
                Matches
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="text-gray-600 hover:text-purple-600">
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-purple-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Matching Area */}
          <div className="lg:col-span-2">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Your Match</h1>
              <p className="text-gray-600">Find professionals who share your ambitions and values</p>
            </div>

            {/* Match Card */}
            <div className="max-w-md mx-auto">
              {hasMoreMatches && currentMatch ? (
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto w-32 h-32 mb-4">
                      <Avatar className="w-full h-full ring-4 ring-purple-100">
                        <AvatarImage src={currentMatch.image} alt={currentMatch.name} />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          {currentMatch.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-2xl text-gray-900">{currentMatch.name}</CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      {currentMatch.title} at {currentMatch.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">{currentMatch.industry}</Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">{currentMatch.location}</Badge>
                      {currentMatch.age && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">{currentMatch.age} years old</Badge>
                      )}
                      {/* Verification Badges */}
                      {currentMatch.isVerified && (
                        <Badge className="bg-blue-500 text-white">
                          ✓ Verified
                        </Badge>
                      )}
                      {currentMatch.isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          ⭐ Premium
                        </Badge>
                      )}
                      {currentMatch.verificationLevel === "executive" && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          🎯 Executive
                        </Badge>
                      )}
                    </div>
                    
                    {currentMatch.bio && (
                      <p className="text-gray-600 text-center">{currentMatch.bio}</p>
                    )}
                    
                    {currentMatch.interests && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Interests:</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {currentMatch.interests.split(",").map((interest, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-200">
                              {interest.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full w-16 h-16 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
                        onClick={handlePass}
                      >
                        <X className="h-8 w-8" />
                      </Button>
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                        onClick={handleLike}
                      >
                        <Heart className="h-8 w-8" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="text-center border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No more matches right now
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Check back later for new potential matches
                    </p>
                    <Button 
                      onClick={fetchPotentialMatches}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Refresh Matches
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Match Counter */}
              {hasMoreMatches && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    {currentMatchIndex + 1} of {potentialMatches.length} profiles
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current User Profile */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="ring-2 ring-purple-100">
                    <AvatarImage src={currentUser.image} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
                      {currentUser.isVerified && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          ✓
                        </Badge>
                      )}
                      {currentUser.isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                          ⭐
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{currentUser.title}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-700">Company:</span>
                    <span className="text-gray-600">{currentUser.company}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="text-gray-600">{currentUser.location}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-700">Looking for:</span>
                    <span className="text-gray-600">{currentUser.relationshipGoals}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900">Your Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profiles Viewed</span>
                  <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{currentMatchIndex}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Matches Made</span>
                  <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Messages Sent</span>
                  <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded"></div>
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentUser.isPremium ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Unlimited Likes</span>
                      <Badge className="bg-green-500 text-white">✓</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Advanced Filters</span>
                      <Badge className="bg-green-500 text-white">✓</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">See Who Liked You</span>
                      <Badge className="bg-green-500 text-white">✓</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Profile Boost</span>
                      <Badge className="bg-green-500 text-white">✓</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">
                      Unlock premium features to enhance your HeartBeat experience:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Unlimited Likes</span>
                        <Badge variant="outline" className="border-gray-200">🔒</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Advanced Filters</span>
                        <Badge variant="outline" className="border-gray-200">🔒</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">See Who Liked You</span>
                        <Badge variant="outline" className="border-gray-200">🔒</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Profile Boost</span>
                        <Badge variant="outline" className="border-gray-200">🔒</Badge>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Access - Only show when there's a current match */}
            {currentMatch && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                    Contact Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Get direct access to {currentMatch.name}'s contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PremiumContact
                    userId={currentMatch.id}
                    phoneNumber={premiumAccess?.phoneNumber}
                    linkedinUrl={premiumAccess?.linkedinUrl}
                    hasAccessToPhone={premiumAccess?.hasAccessToPhone || false}
                    hasAccessToLinkedin={premiumAccess?.hasAccessToLinkedin || false}
                    onPurchase={handlePremiumPurchase}
                    isLoading={isPurchasing}
                  />
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Users className="h-4 w-4 mr-2" />
                  My Matches
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => router.push("/profile")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}