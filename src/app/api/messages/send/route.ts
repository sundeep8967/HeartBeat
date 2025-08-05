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

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
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

    // Check if users are matched
    const match = await db.match.findFirst({
      where: {
        AND: [
          {
            OR: [
              { userId: currentUser.id, likedUserId: receiverId },
              { userId: receiverId, likedUserId: currentUser.id },
            ],
          },
          { status: "accepted" },
        ],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Users are not matched" }, { status: 403 });
    }

    // Create the message
    const newMessage = await db.message.create({
      data: {
        senderId: currentUser.id,
        receiverId: receiverId,
        content: content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      message: "Message sent successfully", 
      data: newMessage 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}