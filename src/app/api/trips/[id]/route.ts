import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        packingLists: {
          include: {
            items: true
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const tripWithParsedActivities = {
      ...trip,
      activities: JSON.parse(trip.activities)
    };

    return NextResponse.json(tripWithParsedActivities);
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, destination, duration, tempMin, tempMax, activities } = body;

    const trip = await prisma.trip.update({
      where: { id: params.id },
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

    return NextResponse.json(tripWithParsedActivities);
  } catch (error) {
    console.error('Failed to update trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.trip.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}