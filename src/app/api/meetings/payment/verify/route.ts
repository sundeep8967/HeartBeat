import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      meetingId,
      paymentType,
      paymentFor,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !meetingId || !paymentType || !paymentFor) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch meeting details
    const meeting = await db.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [
          { boyUserId: session.user.id },
          { girlUserId: session.user.id },
        ],
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    // Update payment status based on payment type
    if (paymentType === 'meeting') {
      const updateData: any = {};
      
      if (paymentFor === 'boy') {
        updateData.boyPaymentStatus = 'completed';
      } else if (paymentFor === 'girl') {
        updateData.girlPaymentStatus = 'completed';
      }

      // Update meeting payment status
      await db.meeting.update({
        where: { id: meetingId },
        data: updateData,
      });

      // Check if both payments are completed, then update meeting status
      const updatedMeeting = await db.meeting.findUnique({
        where: { id: meetingId },
      });

      if (updatedMeeting?.boyPaymentStatus === 'completed' && updatedMeeting?.girlPaymentStatus === 'completed') {
        await db.meeting.update({
          where: { id: meetingId },
          data: { status: 'confirmed' },
        });
      }
    }

    // Create payment record (you might want to create a Payment model for this)
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}