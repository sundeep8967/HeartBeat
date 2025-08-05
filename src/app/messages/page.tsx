"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, ArrowLeft, MoreVertical, Phone, Video, CreditCard } from "lucide-react";
import PremiumContact from "@/components/premium-contact";

interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    title?: string;
    company?: string;
    industry?: string;
    location?: string;
    isVerified?: boolean;
    isPremium?: boolean;
    verificationLevel?: string;
    phoneNumber?: string;
    linkedinUrl?: string;
  };
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function Messages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
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
      fetchMatches();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.user.id);
      checkPremiumAccess(selectedMatch.user.id);
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/matches/accepted");
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches);
        if (data.matches.length > 0 && !selectedMatch) {
          setSelectedMatch(data.matches[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedMatch.user.id,
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedMatch.user.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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

  if (status === "loading") {
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
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-purple-600">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Matches Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                  Your Matches
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Connect with your matches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading matches...</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No matches yet</p>
                    <p className="text-sm text-gray-400 mt-2">Start matching to see your connections here</p>
                  </div>
                ) : (
                  matches.map((match) => (
                    <div
                      key={match.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedMatch?.id === match.id
                          ? "bg-purple-50 border border-purple-200"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <Avatar className="ring-2 ring-purple-100">
                        <AvatarImage src={match.user.image} alt={match.user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          {match.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {match.user.name}
                          </p>
                          {match.user.isVerified && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              ✓
                            </Badge>
                          )}
                          {match.user.isPremium && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                              ⭐
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {match.user.title} at {match.user.company}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                            {match.user.industry}
                          </Badge>
                          <Badge variant="outline" className="border-gray-200 text-xs">
                            {match.user.location}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col border-0 shadow-lg">
              {selectedMatch ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="ring-2 ring-purple-100">
                          <AvatarImage src={selectedMatch.user.image} alt={selectedMatch.user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {selectedMatch.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg text-gray-900">{selectedMatch.user.name}</CardTitle>
                            {selectedMatch.user.isVerified && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                ✓
                              </Badge>
                            )}
                            {selectedMatch.user.isPremium && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                ⭐
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-gray-600">
                            {selectedMatch.user.title} at {selectedMatch.user.company}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-600 hover:text-purple-600 ${premiumAccess?.hasAccessToPhone ? '' : 'opacity-50'}`}
                          disabled={!premiumAccess?.hasAccessToPhone}
                          onClick={() => premiumAccess?.phoneNumber && window.open(`tel:${premiumAccess.phoneNumber}`, '_self')}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-600 hover:text-purple-600 ${premiumAccess?.hasAccessToLinkedin ? '' : 'opacity-50'}`}
                          disabled={!premiumAccess?.hasAccessToLinkedin}
                          onClick={() => premiumAccess?.linkedinUrl && window.open(premiumAccess.linkedinUrl, '_blank')}
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-2">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === session?.user?.email
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === session?.user?.email
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border-gray-200 focus:border-purple-400"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Premium Contact Section */}
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Premium Contact Access</h4>
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                          <Phone className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">Phone</span>
                        </div>
                        {premiumAccess?.hasAccessToPhone ? (
                          <div className="space-y-1">
                            <p className="text-xs text-green-600 font-medium">✓ Unlocked</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => premiumAccess.phoneNumber && window.open(`tel:${premiumAccess.phoneNumber}`, '_self')}
                              className="text-xs w-full"
                            >
                              Call Now
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">₹10 to unlock</p>
                            <Button 
                              size="sm" 
                              onClick={() => handlePremiumPurchase('phone', selectedMatch.user.id)}
                              disabled={isPurchasing}
                              className="text-xs w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                              {isPurchasing ? "..." : "Unlock"}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          <span className="text-sm font-medium text-gray-900">LinkedIn</span>
                        </div>
                        {premiumAccess?.hasAccessToLinkedin ? (
                          <div className="space-y-1">
                            <p className="text-xs text-green-600 font-medium">✓ Unlocked</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => premiumAccess.linkedinUrl && window.open(premiumAccess.linkedinUrl, '_blank')}
                              className="text-xs w-full"
                            >
                              View Profile
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">₹5 to unlock</p>
                            <Button 
                              size="sm" 
                              onClick={() => handlePremiumPurchase('linkedin', selectedMatch.user.id)}
                              disabled={isPurchasing}
                              className="text-xs w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            >
                              {isPurchasing ? "..." : "Unlock"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a match to start chatting
                    </h3>
                    <p className="text-gray-500">
                      Choose a connection from your matches to begin a conversation
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}