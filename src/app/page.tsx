"use client";

import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chrome, Linkedin, Heart, Users, Star, X, Menu, Smartphone, Sparkles, Zap, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LiquidBackground from "@/components/liquid-background";
import FloatingHearts from "@/components/floating-hearts";
import ParticleEffects from "@/components/particle-effects";
import GradientOrbs from "@/components/gradient-orbs";

export default function Home() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getAuthProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    getAuthProviders();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      if (!session.user?.isProfileComplete) {
        router.push("/setup-profile");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fb]">
        <div className="animate-pulse text-center">
          <Heart className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading HeartBeat...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-xl text-gray-600">
              Ready to find your professional partner?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Complete Profile
                </CardTitle>
                <CardDescription>
                  Add your professional details to get better matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  Find Matches
                </CardTitle>
                <CardDescription>
                  Discover like-minded professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Browse Matches</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-purple-600" />
                  LinkedIn Connect
                </CardTitle>
                <CardDescription>
                  Enhance your profile with LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={() => handleSignIn("linkedin")}
                >
                  Connect LinkedIn
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] relative overflow-hidden">
      {/* Animated Backgrounds */}
      <LiquidBackground />
      <GradientOrbs />
      <FloatingHearts />
      <ParticleEffects />
      
      {/* Content */}
      <div className="relative z-30">
        {/* Navigation */}
        <nav className="bg-transparent py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300 shadow-lg">
                  ♡
                </div>
                <span className="text-xl font-medium text-gray-900 flex items-center gap-2">
                  HeartBeat
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                </span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-10">
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium hover:scale-105 transform transition-all">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium hover:scale-105 transform transition-all">How it Works</a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium hover:scale-105 transform transition-all">Contact</a>
                <div className="flex items-center space-x-5">
                  <Button variant="ghost" onClick={() => handleSignIn("google")} disabled={isLoading} className="text-gray-600 hover:text-purple-600 text-sm font-medium hover:scale-105 transform transition-all">
                    LOGIN IN
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold tracking-wider uppercase rounded-full px-7 py-3 shadow-lg hover:shadow-xl transition-all hover:transform hover:-translate-y-1 hover:scale-105"
                    onClick={() => handleSignIn("google")} 
                    disabled={isLoading}
                  >
                    {isLoading ? "Connecting..." : "Signup Now"}
                  </Button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:scale-110 transform transition-all">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">Features</a>
                  <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">How it Works</a>
                  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium">Contact</a>
                  <Button variant="ghost" onClick={() => handleSignIn("google")} disabled={isLoading} className="text-gray-600 hover:text-purple-600 text-sm font-medium justify-start">
                    LOGIN IN
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold tracking-wider uppercase rounded-full px-7 py-3"
                    onClick={() => handleSignIn("google")} 
                    disabled={isLoading}
                  >
                    Signup Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
                    <span className="text-sm font-medium text-gray-600 ml-2">Find Genuine Love</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-6xl font-normal text-gray-900 leading-tight">
                    Find your love
                    <span className="block">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold line-through decoration-red-500 decoration-4 relative animate-pulse">
                        Delete all
                      </span>
                    </span>
                    Dating apps
                  </h1>
                  
                  <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                    We designed a platform to find your love the most genuine way, no more regret for no matches
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-bold tracking-wider uppercase px-12 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:transform hover:-translate-y-1 hover:scale-105 group"
                    onClick={() => handleSignIn("google")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 group-hover:animate-pulse" />
                        Find Your Love
                      </div>
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Fast</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Safe</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Genuine</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">10k+</div>
                    <div className="text-sm text-gray-600">Happy Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 mb-1">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
              </div>

              {/* Animated Phone Mockup */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Floating elements around phone */}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-200 rounded-full opacity-60 animate-float"></div>
                  <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-pink-200 rounded-full opacity-60 animate-float delay-1000"></div>
                  <div className="absolute top-1/2 -left-16 w-12 h-12 bg-blue-200 rounded-full opacity-60 animate-float delay-2000"></div>
                  
                  <div className="w-72 h-[580px] bg-black rounded-[45px] p-2 shadow-2xl transform -rotate-12 hover:rotate-10 transition-transform duration-500 hover:scale-105">
                    <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative">
                      {/* Animated Phone Header */}
                      <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-gradient-x relative">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="absolute bottom-5 left-5 text-white text-2xl font-semibold">
                          Find your love
                        </div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                      
                      {/* Animated Main Profile Card */}
                      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-56 h-80 bg-white rounded-2xl shadow-lg overflow-hidden z-10 hover:scale-105 transition-transform duration-300">
                        <div className="h-3/4 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 animate-gradient-y"></div>
                        <div className="h-1/4 bg-white p-3 text-center">
                          <p className="text-gray-900 font-medium animate-pulse">Meet People</p>
                        </div>
                      </div>
                      
                      {/* Animated Side Card 1 */}
                      <div className="absolute top-36 right-2 w-32 h-44 bg-white rounded-xl shadow-md overflow-hidden transform rotate-12 z-5 hover:rotate-6 transition-transform duration-300">
                        <div className="h-3/4 bg-gradient-to-br from-blue-100 to-cyan-100 animate-gradient-y"></div>
                      </div>
                      
                      {/* Animated Side Card 2 */}
                      <div className="absolute bottom-24 left-2 w-28 h-40 bg-white rounded-xl shadow-md overflow-hidden transform -rotate-12 z-5 hover:-rotate-6 transition-transform duration-300">
                        <div className="h-3/4 bg-gradient-to-br from-green-100 to-emerald-100 animate-gradient-y"></div>
                      </div>
                      
                      {/* Bottom Navigation */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-800 rounded-b-[38px] flex items-center justify-center">
                        <p className="text-white font-medium">Made with Love</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HeartBeat?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the difference with our innovative approach to meaningful connections
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="text-left group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:animate-bounce">
                  ♡
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">10k+</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Members</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Over thousands of people are using HeartBeat to find meaningful connections
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-left group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:animate-pulse">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart AI</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Best match based on an intelligent algorithm that understands your preferences
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-left group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-amber-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:animate-spin">
                  😊
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">Perfect</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Match</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  10k+ people are happy using our platform to find their perfect partner
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 mt-20">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                  ♡
                </div>
                <span className="text-xl font-bold">HeartBeat</span>
              </div>
              <p className="text-gray-400 mb-4 md:mb-0">Where Corporate Hearts Meet</p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-purple-400 transition-colors hover:scale-105 transform">Privacy Policy</a>
                <a href="#" className="hover:text-purple-400 transition-colors hover:scale-105 transform">Terms of Service</a>
                <a href="#" className="hover:text-purple-400 transition-colors hover:scale-105 transform">Contact</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              <p>© 2024 HeartBeat. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}