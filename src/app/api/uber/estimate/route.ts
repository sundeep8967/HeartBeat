import { NextRequest, NextResponse } from 'next/server';
import { uberService } from '@/lib/uber';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pickup, dropoff } = body;

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: 'Pickup and dropoff locations are required' },
        { status: 400 }
      );
    }

    // Validate location format
    if (!pickup.latitude || !pickup.longitude || !dropoff.latitude || !dropoff.longitude) {
      return NextResponse.json(
        { error: 'Invalid location format. Latitude and longitude are required.' },
        { status: 400 }
      );
    }

    // Get ride estimate
    const estimate = await uberService.estimateRide(pickup, dropoff);

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error getting Uber estimate:', error);
    return NextResponse.json(
      { error: 'Failed to get ride estimate' },
      { status: 500 }
    );
  }
}