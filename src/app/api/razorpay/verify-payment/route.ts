import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { razorpayUtils } from "@/lib/razorpay";

interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: VerifyPaymentRequest = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify payment signature
    const isValid = razorpayUtils.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the purchase record
    const purchase = await db.premiumPurchase.findFirst({
      where: {
        razorpayOrderId: razorpayOrderId,
        userId: currentUser.id,
        status: 'pending'
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpayUtils.fetchPayment(razorpayPaymentId);

    // Check if payment is captured
    if (paymentDetails.status !== 'captured') {
      return NextResponse.json({ error: "Payment not captured" }, { status: 400 });
    }

    // Update purchase record
    const updatedPurchase = await db.premiumPurchase.update({
      where: { id: purchase.id },
      data: {
        status: 'completed',
        razorpayPaymentId: razorpayPaymentId,
        completedAt: new Date()
      }
    });

    // Get the purchased information
    const targetUser = await db.user.findUnique({
      where: { id: purchase.targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Get the purchased data
    let purchasedData = {};
    if (purchase.type === 'phone' && targetUser.phoneNumber) {
      purchasedData = { phoneNumber: targetUser.phoneNumber };
    } else if (purchase.type === 'linkedin' && targetUser.linkedinUrl) {
      purchasedData = { linkedinUrl: targetUser.linkedinUrl };
    }

    return NextResponse.json({
      success: true,
      purchase: {
        id: updatedPurchase.id,
        type: updatedPurchase.type,
        amount: updatedPurchase.amount,
        status: updatedPurchase.status,
        createdAt: updatedPurchase.createdAt,
        completedAt: updatedPurchase.completedAt
      },
      data: purchasedData
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}