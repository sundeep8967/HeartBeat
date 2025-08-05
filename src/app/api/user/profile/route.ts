import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      title,
      company,
      industry,
      experience,
      salary,
      education,
      location,
      bio,
      gender,
      age,
      lookingFor,
      ageRange,
      religion,
      interests,
      lifestyle,
      relationshipGoals,
      linkedinUrl,
      twitterUrl
    } = data;

    // Update user profile
    const updatedUser = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        title: title || null,
        company: company || null,
        industry: industry || null,
        experience: experience ? parseInt(experience.split("-")[0]) : null,
        salary: salary || null,
        education: education || null,
        location: location || null,
        bio: bio || null,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        lookingFor: lookingFor || null,
        ageRange: ageRange || null,
        religion: religion || null,
        interests: interests || null,
        lifestyle: lifestyle || null,
        relationshipGoals: relationshipGoals || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        isProfileComplete: true,
      },
    });

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        title: true,
        company: true,
        industry: true,
        experience: true,
        salary: true,
        education: true,
        location: true,
        bio: true,
        gender: true,
        age: true,
        lookingFor: true,
        ageRange: true,
        religion: true,
        interests: true,
        lifestyle: true,
        relationshipGoals: true,
        linkedinUrl: true,
        twitterUrl: true,
        isProfileComplete: true,
        isVerified: true,
        isPremium: true,
        verificationLevel: true,
        premiumSince: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}