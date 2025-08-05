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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing target user ID" }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check premium access for phone
    const phoneAccess = await db.premiumPurchase.findFirst({
      where: {
        userId: currentUser.id,
        targetUserId: targetUserId,
        type: 'phone',
        status: 'completed'
      }
    });

    // Check premium access for linkedin
    const linkedinAccess = await db.premiumPurchase.findFirst({
      where: {
        userId: currentUser.id,
        targetUserId: targetUserId,
        type: 'linkedin',
        status: 'completed'
      }
    });

    // Get target user's contact info (only if access is granted)
    let phoneNumber = null;
    let linkedinUrl = null;

    if (phoneAccess) {
      const targetUser = await db.user.findUnique({
        where: { id: targetUserId },
        select: { phoneNumber: true }
      });
      phoneNumber = targetUser?.phoneNumber || null;
    }

    if (linkedinAccess) {
      const targetUser = await db.user.findUnique({
        where: { id: targetUserId },
        select: { linkedinUrl: true }
      });
      linkedinUrl = targetUser?.linkedinUrl || null;
    }

    return NextResponse.json({
      hasAccessToPhone: !!phoneAccess,
      hasAccessToLinkedin: !!linkedinAccess,
      phoneNumber: phoneNumber,
      linkedinUrl: linkedinUrl
    });

  } catch (error) {
    console.error("Premium access check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}