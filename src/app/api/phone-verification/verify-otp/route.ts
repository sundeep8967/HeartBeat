import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { phoneVerificationService } from "@/lib/phone-verification";
import { getFirebaseCustomToken } from "@/lib/firebase-auth";

interface VerifyOTPRequest {
  verificationId: string;
  otp: string;
  phoneNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const body: VerifyOTPRequest = await request.json();
    const { verificationId, otp, phoneNumber } = body;

    if (!verificationId || !otp || !phoneNumber) {
      return NextResponse.json({ 
        error: "Verification ID, OTP, and phone number are required" 
      }, { status: 400 });
    }

    // Verify OTP
    const result = await phoneVerificationService.verifyOTP(verificationId, otp, phoneNumber);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // If user is authenticated, update their phone number
    if (session?.user?.email) {
      const currentUser = await db.user.findUnique({
        where: { email: session.user.email }
      });

      if (currentUser) {
        // Update user's phone number in database
        await db.user.update({
          where: { id: currentUser.id },
          data: {
            phoneNumber: phoneNumber,
            phoneVerified: true,
            phoneVerifiedAt: new Date()
          }
        });

        // Get Firebase custom token for the user
        const firebaseToken = await getFirebaseCustomToken(currentUser.id, currentUser.email);

        return NextResponse.json({
          success: true,
          message: "Phone number verified and linked successfully",
          user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            phoneNumber: phoneNumber,
            phoneVerified: true,
            firebaseToken
          }
        });
      }
    } else {
      // For new user registration, return the verified phone info
      // The client will use this to complete registration
      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully",
        phoneData: {
          phoneNumber: phoneNumber,
          verified: true,
          firebaseUid: result.user?.uid
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully"
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}