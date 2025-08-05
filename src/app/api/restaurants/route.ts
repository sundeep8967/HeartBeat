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
    const city = searchParams.get('city');
    const cuisine = searchParams.get('cuisine');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      isActive: true,
    };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (cuisine) {
      where.cuisine = { contains: cuisine, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [restaurants, total] = await Promise.all([
      db.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
      }),
      db.restaurant.count({ where }),
    ]);

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}