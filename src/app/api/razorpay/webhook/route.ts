import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { razorpayUtils } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature
    const webhookSignature = request.headers.get('x-razorpay-signature');
    if (!webhookSignature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    // Verify the webhook signature
    const isValid = razorpayUtils.verifyPaymentSignature(
      body.payload.payment.entity.order_id,
      body.payload.payment.entity.id,
      webhookSignature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = body.event;
    const payment = body.payload.payment.entity;

    // Handle payment captured event
    if (event === 'payment.captured') {
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100; // Convert from paise to rupees
      const notes = payment.notes;

      // Find the purchase record
      const purchase = await db.premiumPurchase.findFirst({
        where: {
          razorpayOrderId: orderId,
          status: 'pending'
        }
      });

      if (!purchase) {
        console.error('Purchase not found for order:', orderId);
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }

      // Update purchase record
      await db.premiumPurchase.update({
        where: { id: purchase.id },
        data: {
          status: 'completed',
          razorpayPaymentId: paymentId,
          completedAt: new Date()
        }
      });

      // Get the purchased information
      const targetUser = await db.user.findUnique({
        where: { id: purchase.targetUserId }
      });

      if (!targetUser) {
        console.error('Target user not found:', purchase.targetUserId);
        return NextResponse.json({ error: "Target user not found" }, { status: 404 });
      }

      // Log successful purchase
      console.log(`Payment successful: ${paymentId} for purchase ${purchase.id}`);

      // Here you could send notifications, update user stats, etc.
      
      return NextResponse.json({ success: true });
    }

    // Handle payment failed event
    if (event === 'payment.failed') {
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const errorCode = payment.error_code;
      const errorDescription = payment.error_description;

      // Find and update the purchase record
      const purchase = await db.premiumPurchase.findFirst({
        where: {
          razorpayOrderId: orderId,
          status: 'pending'
        }
      });

      if (purchase) {
        await db.premiumPurchase.update({
          where: { id: purchase.id },
          data: {
            status: 'failed',
            razorpayPaymentId: paymentId,
            errorCode: errorCode,
            errorDescription: errorDescription
          }
        });
      }

      console.error(`Payment failed: ${paymentId} for order ${orderId} - ${errorCode}: ${errorDescription}`);
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}