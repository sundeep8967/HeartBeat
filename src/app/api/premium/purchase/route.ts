import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface PurchaseRequest {
  type: 'phone' | 'linkedin';
  targetUserId: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PurchaseRequest = await request.json();
    const { type, targetUserId } = body;

    if (!type || !targetUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['phone', 'linkedin'].includes(type)) {
      return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get target user
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check if user already has access
    const existingPurchase = await db.premiumPurchase.findFirst({
      where: {
        userId: currentUser.id,
        targetUserId: targetUserId,
        type: type,
        status: 'completed'
      }
    });

    if (existingPurchase) {
      return NextResponse.json({ 
        error: "You already have access to this information" 
      }, { status: 400 });
    }

    // Define prices
    const prices = {
      phone: 10, // ₹10
      linkedin: 5  // ₹5
    };

    const price = prices[type];

    // Check if there's a pending purchase
    const pendingPurchase = await db.premiumPurchase.findFirst({
      where: {
        userId: currentUser.id,
        targetUserId: targetUserId,
        type: type,
        status: 'pending'
      }
    });

    if (pendingPurchase) {
      return NextResponse.json({ 
        error: "You have a pending payment for this purchase. Please complete or cancel it first." 
      }, { status: 400 });
    }

    // For backward compatibility, we'll still support the old flow
    // But redirect to Razorpay for new purchases
    return NextResponse.json({
      success: false,
      message: "Please use the Razorpay payment flow for new purchases",
      redirect: true,
      razorpayEndpoint: "/api/razorpay/create-order",
      amount: price,
      type: type,
      targetUserId: targetUserId
    });

  } catch (error) {
    console.error("Premium purchase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}