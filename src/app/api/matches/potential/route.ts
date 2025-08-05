import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find potential matches based on preferences
    const potentialMatches = await db.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } }, // Exclude current user
          { isProfileComplete: true }, // Only users with complete profiles
          { isActive: true }, // Only active users
          // Basic gender preference matching
          {
            OR: [
              { lookingFor: currentUser.gender },
              { lookingFor: "both" },
              { lookingFor: null },
            ],
          },
          // Age range matching (simplified)
          {
            OR: [
              { age: null }, // If no age specified
              {
                AND: [
                  { age: { gte: 25 } }, // Minimum age
                  { age: { lte: 65 } }, // Maximum age
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        title: true,
        company: true,
        industry: true,
        location: true,
        bio: true,
        age: true,
        interests: true,
        lifestyle: true,
        relationshipGoals: true,
        isVerified: true,
        isPremium: true,
        verificationLevel: true,
      },
      take: 20, // Limit to 20 potential matches
      orderBy: {
        createdAt: 'desc', // Newest profiles first
      },
    });

    // Filter out users that the current user has already liked or passed
    const existingMatches = await db.match.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        likedUserId: true,
      },
    });

    const matchedUserIds = new Set(existingMatches.map(match => match.likedUserId));
    const filteredMatches = potentialMatches.filter(
      user => !matchedUserIds.has(user.id)
    );

    return NextResponse.json({ matches: filteredMatches });
  } catch (error) {
    console.error("Error fetching potential matches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}