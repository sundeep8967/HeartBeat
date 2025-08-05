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

    // Find accepted matches (mutual likes)
    const acceptedMatches = await db.match.findMany({
      where: {
        AND: [
          { userId: currentUser.id },
          { status: "accepted" },
        ],
      },
      include: {
        likedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            title: true,
            company: true,
            industry: true,
            location: true,
            isVerified: true,
            isPremium: true,
            verificationLevel: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const matches = acceptedMatches.map(match => ({
      id: match.id,
      user: match.likedUser,
      status: match.status,
      createdAt: match.createdAt,
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching accepted matches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}