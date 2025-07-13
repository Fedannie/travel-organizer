import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, name, items } = body;

    const packingList = await prisma.packingList.create({
      data: {
        tripId,
        name,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            packed: item.packed,
            notes: item.notes
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(packingList, { status: 201 });
  } catch (error) {
    console.error('Failed to create packing list:', error);
    return NextResponse.json(
      { error: 'Failed to create packing list' },
      { status: 500 }
    );
  }
}