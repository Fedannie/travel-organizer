import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        packingLists: {
          include: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const tripsWithParsedActivities = trips.map(trip => ({
      ...trip,
      activities: JSON.parse(trip.activities)
    }));

    return NextResponse.json(tripsWithParsedActivities);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, destination, duration, tempMin, tempMax, activities } = body;

    const trip = await prisma.trip.create({
      data: {
        name,
        destination,
        duration,
        tempMin,
        tempMax,
        activities: JSON.stringify(activities)
      }
    });

    const tripWithParsedActivities = {
      ...trip,
      activities: JSON.parse(trip.activities)
    };

    return NextResponse.json(tripWithParsedActivities, { status: 201 });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}