import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { phoneVerificationService } from "@/lib/phone-verification";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check phone verification status in database
    const phoneVerified = currentUser.phoneVerified || false;
    const phoneNumber = currentUser.phoneNumber || null;

    // Additionally check Firebase Auth status if phone number exists
    let firebaseVerified = false;
    if (phoneNumber) {
      try {
        firebaseVerified = await phoneVerificationService.isPhoneVerified(currentUser.id);
      } catch (error) {
        console.error('Error checking Firebase phone verification:', error);
      }
    }

    return NextResponse.json({
      success: true,
      phoneVerification: {
        verified: phoneVerified,
        firebaseVerified: firebaseVerified,
        phoneNumber: phoneNumber,
        verifiedAt: currentUser.phoneVerifiedAt,
        lastUpdated: currentUser.updatedAt
      }
    });

  } catch (error) {
    console.error("Phone verification status error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}