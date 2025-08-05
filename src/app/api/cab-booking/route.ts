import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      meetingId,
      passengerId,
      pickupLocation,
      dropLocation,
      pickupTime,
      estimatedFare,
      bookForPassenger = false,
    } = body;

    if (!meetingId || !passengerId || !pickupLocation || !dropLocation || !pickupTime || !estimatedFare) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if meeting exists and user is part of it
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
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    // Verify passenger is part of the meeting
    if (passengerId !== meeting.boyUserId && passengerId !== meeting.girlUserId) {
      return NextResponse.json(
        { error: 'Passenger is not part of this meeting' },
        { status: 400 }
      );
    }

    // Check if user is booking for themselves or for the other person
    if (session.user.id !== passengerId && !bookForPassenger) {
      return NextResponse.json(
        { error: 'Cannot book cab for another user without explicit consent' },
        { status: 400 }
      );
    }

    const maxCoverage = 350;
    let userPayment = estimatedFare;
    let passengerPayment = 0;

    // If user is booking for passenger, calculate payments
    if (session.user.id !== passengerId) {
      userPayment = Math.min(estimatedFare, maxCoverage);
      passengerPayment = Math.max(0, estimatedFare - maxCoverage);
    }

    // Create cab booking
    const cabBooking = await db.cabBooking.create({
      data: {
        meetingId,
        userId: session.user.id,
        passengerId,
        pickupLocation,
        dropLocation,
        pickupTime: new Date(pickupTime),
        estimatedFare,
        maxCoverage,
        userPayment,
        passengerPayment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        passenger: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        meeting: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    return NextResponse.json(cabBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating cab booking:', error);
    return NextResponse.json(
      { error: 'Failed to create cab booking' },
      { status: 500 }
    );
  }
}

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

    const where: any = {
      OR: [
        { userId: session.user.id },
        { passengerId: session.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [cabBookings, total] = await Promise.all([
      db.cabBooking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          passenger: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          meeting: {
            include: {
              restaurant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.cabBooking.count({ where }),
    ]);

    return NextResponse.json({
      cabBookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cab bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cab bookings' },
      { status: 500 }
    );
  }
}