"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Briefcase, Building2, Target, Users, Star, Phone, Shield } from "lucide-react";
import { signIn } from "next-auth/react";
import { PhoneVerification } from "@/components/phone-verification";

export default function SetupProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    industry: "",
    experience: "",
    salary: "",
    education: "",
    location: "",
    bio: "",
    gender: "",
    age: "",
    lookingFor: "",
    ageRange: "",
    religion: "",
    interests: "",
    lifestyle: "",
    relationshipGoals: "",
    linkedinUrl: "",
    twitterUrl: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInConnect = () => {
    signIn("linkedin", { callbackUrl: "/setup-profile" });
  };

  const handlePhoneVerificationSuccess = (data: any) => {
    setPhoneVerified(true);
    setPhoneNumber(data.phoneNumber);
    // You can also update the form data with the phone number
    setFormData(prev => ({ ...prev, phoneNumber: data.phoneNumber }));
  };

  const handlePhoneVerificationFailure = (error: string) => {
    console.error('Phone verification failed:', error);
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
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg transform -rotate-12">
              ♡
            </div>
            <span className="text-2xl font-medium text-gray-900">HeartBeat</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us about yourself to find your perfect match</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Google Sign-in</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Phone Verification</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Profile Setup</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Find Matches</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Phone Verification */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded"></div>
                  Phone Verification
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Verify your phone number to secure your account and build trust
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PhoneVerification
                  onVerificationSuccess={handlePhoneVerificationSuccess}
                  onVerificationFailure={handlePhoneVerificationFailure}
                  mode="register"
                />
                {phoneVerified && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Phone number verified successfully!</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">Your phone number {phoneNumber} has been verified.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                  Professional Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Tell us about your career and professional background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-700">Job Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      required
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-gray-700">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="e.g., Google, Microsoft, etc."
                      required
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="industry" className="text-gray-700">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-gray-700">Years of Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">0-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="15+">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary" className="text-gray-700">Salary Range</Label>
                    <Select value={formData.salary} onValueChange={(value) => handleInputChange("salary", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                        <SelectItem value="100k-150k">$100k - $150k</SelectItem>
                        <SelectItem value="150k-200k">$150k - $200k</SelectItem>
                        <SelectItem value="200k-300k">$200k - $300k</SelectItem>
                        <SelectItem value="300k+">$300k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="education" className="text-gray-700">Education</Label>
                    <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-700">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                      required
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio" className="text-gray-700">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about your professional journey and what you're looking for..."
                    rows={3}
                    className="border-gray-200 focus:border-purple-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                  Personal Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Help us understand who you are and what you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gender" className="text-gray-700">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-gray-700">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="e.g., 28"
                      min="18"
                      max="100"
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lookingFor" className="text-gray-700">Looking For</Label>
                    <Select value={formData.lookingFor} onValueChange={(value) => handleInputChange("lookingFor", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Men</SelectItem>
                        <SelectItem value="female">Women</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageRange" className="text-gray-700">Preferred Age Range</Label>
                    <Select value={formData.ageRange} onValueChange={(value) => handleInputChange("ageRange", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25-30">25-30</SelectItem>
                        <SelectItem value="30-35">30-35</SelectItem>
                        <SelectItem value="35-40">35-40</SelectItem>
                        <SelectItem value="40-45">40-45</SelectItem>
                        <SelectItem value="45-50">45-50</SelectItem>
                        <SelectItem value="50+">50+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="religion" className="text-gray-700">Religion</Label>
                    <Select value={formData.religion} onValueChange={(value) => handleInputChange("religion", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="christian">Christian</SelectItem>
                        <SelectItem value="muslim">Muslim</SelectItem>
                        <SelectItem value="jewish">Jewish</SelectItem>
                        <SelectItem value="hindu">Hindu</SelectItem>
                        <SelectItem value="buddhist">Buddhist</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="interests" className="text-gray-700">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => handleInputChange("interests", e.target.value)}
                    placeholder="e.g., hiking, reading, technology, travel"
                    className="border-gray-200 focus:border-purple-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lifestyle" className="text-gray-700">Lifestyle</Label>
                    <Select value={formData.lifestyle} onValueChange={(value) => handleInputChange("lifestyle", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select lifestyle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work-life-balance">Work-life balance</SelectItem>
                        <SelectItem value="career-focused">Career-focused</SelectItem>
                        <SelectItem value="family-oriented">Family-oriented</SelectItem>
                        <SelectItem value="adventurous">Adventurous</SelectItem>
                        <SelectItem value="social">Social butterfly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relationshipGoals" className="text-gray-700">Relationship Goals</Label>
                    <Select value={formData.relationshipGoals} onValueChange={(value) => handleInputChange("relationshipGoals", value)}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-400">
                        <SelectValue placeholder="Select goals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="long-term">Long-term relationship</SelectItem>
                        <SelectItem value="serious-dating">Serious dating</SelectItem>
                        <SelectItem value="companionship">Companionship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded"></div>
                  Social Links
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Connect your professional profiles (Optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedinUrl" className="text-gray-700">LinkedIn Profile</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUrl" className="text-gray-700">Twitter Profile</Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                      placeholder="https://twitter.com/yourusername"
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLinkedInConnect}
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Connect LinkedIn Account
                </Button>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Creating Profile..." : "Complete Profile & Find Matches"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}