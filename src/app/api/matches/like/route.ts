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

    const { likedUserId } = await request.json();

    if (!likedUserId) {
      return NextResponse.json({ error: "likedUserId is required" }, { status: 400 });
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

    // Check if the liked user exists
    const likedUser = await db.user.findUnique({
      where: {
        id: likedUserId,
      },
    });

    if (!likedUser) {
      return NextResponse.json({ error: "Liked user not found" }, { status: 404 });
    }

    // Check if match already exists
    const existingMatch = await db.match.findUnique({
      where: {
        userId_likedUserId: {
          userId: currentUser.id,
          likedUserId: likedUserId,
        },
      },
    });

    if (existingMatch) {
      return NextResponse.json({ error: "Match already exists" }, { status: 400 });
    }

    // Create the match
    const newMatch = await db.match.create({
      data: {
        userId: currentUser.id,
        likedUserId: likedUserId,
        status: "pending",
      },
    });

    // Check if it's a mutual match (the other user has already liked this user)
    const mutualMatch = await db.match.findUnique({
      where: {
        userId_likedUserId: {
          userId: likedUserId,
          likedUserId: currentUser.id,
        },
      },
    });

    if (mutualMatch) {
      // Update both matches to "accepted" status
      await db.match.update({
        where: {
          userId_likedUserId: {
            userId: currentUser.id,
            likedUserId: likedUserId,
          },
        },
        data: {
          status: "accepted",
        },
      });

      await db.match.update({
        where: {
          userId_likedUserId: {
            userId: likedUserId,
            likedUserId: currentUser.id,
          },
        },
        data: {
          status: "accepted",
        },
      });

      return NextResponse.json({ 
        message: "It's a match!", 
        match: newMatch,
        isMutual: true 
      });
    }

    return NextResponse.json({ 
      message: "Like recorded successfully", 
      match: newMatch,
      isMutual: false 
    });
  } catch (error) {
    console.error("Error recording like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}