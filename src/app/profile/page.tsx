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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Briefcase, Building2, Target, Users, Star, Edit, Save, X, Phone, Shield } from "lucide-react";
import { signIn } from "next-auth/react";
import { PhoneVerificationStatus } from "@/components/phone-verification-status";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  title?: string;
  company?: string;
  industry?: string;
  experience?: number;
  salary?: string;
  education?: string;
  location?: string;
  bio?: string;
  gender?: string;
  age?: number;
  lookingFor?: string;
  ageRange?: string;
  religion?: string;
  interests?: string;
  lifestyle?: string;
  relationshipGoals?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  isProfileComplete: boolean;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
    twitterUrl: "",
    phoneNumber: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setFormData({
          title: data.user.title || "",
          company: data.user.company || "",
          industry: data.user.industry || "",
          experience: data.user.experience?.toString() || "",
          salary: data.user.salary || "",
          education: data.user.education || "",
          location: data.user.location || "",
          bio: data.user.bio || "",
          gender: data.user.gender || "",
          age: data.user.age?.toString() || "",
          lookingFor: data.user.lookingFor || "",
          ageRange: data.user.ageRange || "",
          religion: data.user.religion || "",
          interests: data.user.interests || "",
          lifestyle: data.user.lifestyle || "",
          relationshipGoals: data.user.relationshipGoals || "",
          linkedinUrl: data.user.linkedinUrl || "",
          twitterUrl: data.user.twitterUrl || "",
          phoneNumber: data.user.phoneNumber || ""
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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
        setIsEditing(false);
        fetchUserProfile();
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setFormData({
        title: userProfile.title || "",
        company: userProfile.company || "",
        industry: userProfile.industry || "",
        experience: userProfile.experience?.toString() || "",
        salary: userProfile.salary || "",
        education: userProfile.education || "",
        location: userProfile.location || "",
        bio: userProfile.bio || "",
        gender: userProfile.gender || "",
        age: userProfile.age?.toString() || "",
        lookingFor: userProfile.lookingFor || "",
        ageRange: userProfile.ageRange || "",
        religion: userProfile.religion || "",
        interests: userProfile.interests || "",
        lifestyle: userProfile.lifestyle || "",
        relationshipGoals: userProfile.relationshipGoals || "",
        linkedinUrl: userProfile.linkedinUrl || "",
        twitterUrl: userProfile.twitterUrl || "",
        phoneNumber: userProfile.phoneNumber || ""
      });
    }
  };

  const handleLinkedInConnect = () => {
    signIn("linkedin", { callbackUrl: "/profile" });
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

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fb]">
        <p>Error loading profile data</p>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20 ring-4 ring-purple-100">
                    <AvatarImage src={userProfile.image} alt={userProfile.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {userProfile.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">{userProfile.name}</CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      {userProfile.title} at {userProfile.company}
                    </CardDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">{userProfile.industry}</Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">{userProfile.location}</Badge>
                      {userProfile.phoneVerified && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>Phone Verified</span>
                        </Badge>
                      )}
                      {userProfile.isProfileComplete && (
                        <Badge className="bg-green-500 text-white">Profile Complete</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                  className={isEditing ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {isEditing ? (
            <form className="space-y-8">
              {/* Professional Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                    Professional Information
                  </CardTitle>
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

              {/* Phone Verification */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded"></div>
                    Phone Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PhoneVerificationStatus />
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded"></div>
                    Social Links
                  </CardTitle>
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

              {/* Save Button */}
              <div className="text-center">
                <Button
                  type="button"
                  size="lg"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Professional Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Job Title</Label>
                      <p className="text-lg text-gray-900">{userProfile.title || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company</Label>
                      <p className="text-lg text-gray-900">{userProfile.company || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Industry</Label>
                      <p className="text-lg text-gray-900">{userProfile.industry || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Experience</Label>
                      <p className="text-lg text-gray-900">{userProfile.experience ? `${userProfile.experience}+ years` : "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Salary Range</Label>
                      <p className="text-lg text-gray-900">{userProfile.salary || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Education</Label>
                      <p className="text-lg text-gray-900">{userProfile.education || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p className="text-lg text-gray-900">{userProfile.location || "Not specified"}</p>
                    </div>
                  </div>
                  {userProfile.bio && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Professional Bio</Label>
                      <p className="text-lg text-gray-900 mt-1">{userProfile.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Gender</Label>
                      <p className="text-lg text-gray-900">{userProfile.gender || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Age</Label>
                      <p className="text-lg text-gray-900">{userProfile.age || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Looking For</Label>
                      <p className="text-lg text-gray-900">{userProfile.lookingFor || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Preferred Age Range</Label>
                      <p className="text-lg text-gray-900">{userProfile.ageRange || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Religion</Label>
                      <p className="text-lg text-gray-900">{userProfile.religion || "Not specified"}</p>
                    </div>
                  </div>
                  {userProfile.interests && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userProfile.interests.split(",").map((interest, index) => (
                          <Badge key={index} variant="outline" className="border-gray-200">
                            {interest.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Lifestyle</Label>
                      <p className="text-lg text-gray-900">{userProfile.lifestyle || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Relationship Goals</Label>
                      <p className="text-lg text-gray-900">{userProfile.relationshipGoals || "Not specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone Verification */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded"></div>
                    Phone Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PhoneVerificationStatus />
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded"></div>
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">LinkedIn Profile</Label>
                      {userProfile.linkedinUrl ? (
                        <a 
                          href={userProfile.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block mt-1"
                        >
                          View LinkedIn Profile
                        </a>
                      ) : (
                        <p className="text-lg text-gray-600">Not connected</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Twitter Profile</Label>
                      {userProfile.twitterUrl ? (
                        <a 
                          href={userProfile.twitterUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block mt-1"
                        >
                          View Twitter Profile
                        </a>
                      ) : (
                        <p className="text-lg text-gray-600">Not connected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}