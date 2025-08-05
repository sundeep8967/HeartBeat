import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { phoneVerificationService } from "@/lib/phone-verification";

interface SendOTPRequest {
  phoneNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow both authenticated and unauthenticated users
    // Unauthenticated users are registering new accounts
    // Authenticated users are adding phone to existing accounts

    const body: SendOTPRequest = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Validate phone number format
    if (!phoneVerificationService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Send OTP
    const result = await phoneVerificationService.sendOTP(phoneNumber);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // If user is authenticated, this is for phone linking
    if (session?.user?.email) {
      const currentUser = await db.user.findUnique({
        where: { email: session.user.email }
      });

      if (currentUser) {
        // Check if phone is already linked to another user
        const existingUser = await db.user.findFirst({
          where: { 
            phoneNumber: phoneNumber,
            id: { not: currentUser.id }
          }
        });

        if (existingUser) {
          return NextResponse.json({ 
            error: "Phone number is already registered to another account" 
          }, { status: 400 });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      verificationId: result.verificationId
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}