import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (session.user?.id) {
      where.OR = [
        { boyUserId: session.user.id },
        { girlUserId: session.user.id },
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [meetings, total] = await Promise.all([
      db.meeting.findMany({
        where,
        skip,
        take: limit,
        include: {
          boyUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              location: true,
            },
          },
          girlUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              location: true,
            },
          },
          restaurant: true,
          cabBookings: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.meeting.count({ where }),
    ]);

    return NextResponse.json({
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      girlUserId,
      restaurantId,
      dateTime,
      paymentTier,
      specialRequests,
    } = body;

    if (!girlUserId || !restaurantId || !dateTime || !paymentTier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate payment tier
    const validTiers = ['500', '650', '1000'];
    if (!validTiers.includes(paymentTier)) {
      return NextResponse.json(
        { error: 'Invalid payment tier' },
        { status: 400 }
      );
    }

    // Calculate payments based on tier
    const totalAmount = parseInt(paymentTier);
    let boyPayment = totalAmount;
    let girlPayment = 0;

    if (paymentTier === '650') {
      boyPayment = 650;
      girlPayment = 350;
    } else if (paymentTier === '500') {
      boyPayment = 500;
      girlPayment = 500;
    }

    // Check if users exist
    const [boyUser, girlUser, restaurant] = await Promise.all([
      db.user.findUnique({ where: { id: session.user.id } }),
      db.user.findUnique({ where: { id: girlUserId } }),
      db.restaurant.findUnique({ where: { id: restaurantId } }),
    ]);

    if (!boyUser || !girlUser || !restaurant) {
      return NextResponse.json(
        { error: 'User or restaurant not found' },
        { status: 404 }
      );
    }

    // Check if there's already a meeting between these users
    const existingMeeting = await db.meeting.findFirst({
      where: {
        boyUserId: session.user.id,
        girlUserId,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (existingMeeting) {
      return NextResponse.json(
        { error: 'You already have a pending or confirmed meeting with this user' },
        { status: 400 }
      );
    }

    // Create the meeting
    const meeting = await db.meeting.create({
      data: {
        boyUserId: session.user.id,
        girlUserId,
        restaurantId,
        dateTime: new Date(dateTime),
        paymentTier,
        boyPayment,
        girlPayment,
        totalAmount,
        specialRequests,
      },
      include: {
        boyUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            location: true,
          },
        },
        girlUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            location: true,
          },
        },
        restaurant: true,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}