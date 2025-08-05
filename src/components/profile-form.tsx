"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, User, Briefcase, Heart, MapPin } from "lucide-react";

interface ProfileData {
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
}

export function ProfileForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof ProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Professional Profile
          </CardTitle>
          <CardDescription>
            Complete your profile to get better matches with like-minded professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={profileData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Startup"
                    value={profileData.company || ""}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={profileData.experience || ""}
                    onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Select onValueChange={(value) => handleInputChange("salary", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                      <SelectItem value="150k-200k">$150,000 - $200,000</SelectItem>
                      <SelectItem value="200k-300k">$200,000 - $300,000</SelectItem>
                      <SelectItem value="300k+">$300,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Select onValueChange={(value) => handleInputChange("education", value)}>
                    <SelectTrigger>
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
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={profileData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your professional journey and what you're looking for..."
                  value={profileData.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Personal Information & Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 28"
                    value={profileData.age || ""}
                    onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lookingFor">Looking For</Label>
                  <Select onValueChange={(value) => handleInputChange("lookingFor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ageRange">Preferred Age Range</Label>
                  <Select onValueChange={(value) => handleInputChange("ageRange", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25-35">25-35</SelectItem>
                      <SelectItem value="30-40">30-40</SelectItem>
                      <SelectItem value="35-45">35-45</SelectItem>
                      <SelectItem value="40-50">40-50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Select onValueChange={(value) => handleInputChange("religion", value)}>
                    <SelectTrigger>
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
                
                <div>
                  <Label htmlFor="lifestyle">Lifestyle</Label>
                  <Select onValueChange={(value) => handleInputChange("lifestyle", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lifestyle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work-life-balance">Work-life balance</SelectItem>
                      <SelectItem value="career-focused">Career-focused</SelectItem>
                      <SelectItem value="family-oriented">Family-oriented</SelectItem>
                      <SelectItem value="adventurous">Adventurous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="interests">Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  placeholder="e.g., technology, travel, fitness, reading"
                  value={profileData.interests || ""}
                  onChange={(e) => handleInputChange("interests", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="relationshipGoals">Relationship Goals</Label>
                <Select onValueChange={(value) => handleInputChange("relationshipGoals", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marriage">Marriage</SelectItem>
                    <SelectItem value="long-term">Long-term relationship</SelectItem>
                    <SelectItem value="serious-dating">Serious dating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Social Links
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profileData.linkedinUrl || ""}
                    onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    placeholder="https://twitter.com/yourusername"
                    value={profileData.twitterUrl || ""}
                    onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              {success && (
                <Badge variant="secondary" className="text-green-600">
                  Profile updated successfully!
                </Badge>
              )}
              
              <Button 
                type="submit" 
                disabled={loading}
                className="ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}