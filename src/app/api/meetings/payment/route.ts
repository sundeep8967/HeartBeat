import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meetingId, paymentType } = body;

    if (!meetingId || !paymentType) {
      return NextResponse.json(
        { error: 'Meeting ID and payment type are required' },
        { status: 400 }
      );
    }

    // Validate payment type
    if (!['meeting', 'cab'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Invalid payment type' },
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
      include: {
        boyUser: true,
        girlUser: true,
        restaurant: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    let amount = 0;
    let paymentDescription = '';
    let paymentFor = '';

    if (paymentType === 'meeting') {
      // Determine which user is paying and how much
      const isBoy = session.user.id === meeting.boyUserId;
      amount = isBoy ? meeting.boyPayment : meeting.girlPayment;
      
      // Check if payment is already completed
      const paymentStatus = isBoy ? meeting.boyPaymentStatus : meeting.girlPaymentStatus;
      if (paymentStatus === 'completed') {
        return NextResponse.json(
          { error: 'Payment already completed' },
          { status: 400 }
        );
      }

      paymentDescription = `Payment for meeting at ${meeting.restaurant.name}`;
      paymentFor = isBoy ? 'boy' : 'girl';
    } else if (paymentType === 'cab') {
      // For cab payments, we need to fetch the cab booking details
      // This would be implemented when cab booking is created
      return NextResponse.json(
        { error: 'Cab payment not implemented yet' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `meeting_${meetingId}_${paymentFor}_${Date.now()}`,
      notes: {
        meetingId,
        paymentType,
        paymentFor,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      meeting: {
        id: meeting.id,
        restaurant: meeting.restaurant.name,
        dateTime: meeting.dateTime,
        amount,
      },
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}