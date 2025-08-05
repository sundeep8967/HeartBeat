import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { razorpayUtils } from "@/lib/razorpay";

interface CreateOrderRequest {
  type: 'phone' | 'linkedin';
  targetUserId: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateOrderRequest = await request.json();
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
        type: type
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

    const amount = prices[type];

    // Create Razorpay order
    const razorpayOrder = await razorpayUtils.createOrder(amount, 'INR');

    // Create a pending purchase record
    const purchase = await db.premiumPurchase.create({
      data: {
        userId: currentUser.id,
        targetUserId: targetUserId,
        type: type,
        amount: amount,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        purchaseId: purchase.id
      },
      key_id: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: currentUser.name || '',
        email: currentUser.email || '',
        contact: currentUser.phoneNumber || ''
      },
      notes: {
        purchaseId: purchase.id,
        type: type,
        targetUserId: targetUserId
      }
    });

  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}