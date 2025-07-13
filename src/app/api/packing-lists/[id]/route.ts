import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packingList = await prisma.packingList.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        trip: true
      }
    });

    if (!packingList) {
      return NextResponse.json(
        { error: 'Packing list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(packingList);
  } catch (error) {
    console.error('Failed to fetch packing list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packing list' },
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
    const { name, items } = body;

    // Delete existing items and create new ones
    await prisma.packingItem.deleteMany({
      where: { packingListId: params.id }
    });

    const packingList = await prisma.packingList.update({
      where: { id: params.id },
      data: {
        name,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            packed: item.packed,
            priority: item.priority,
            notes: item.notes
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(packingList);
  } catch (error) {
    console.error('Failed to update packing list:', error);
    return NextResponse.json(
      { error: 'Failed to update packing list' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.packingList.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete packing list:', error);
    return NextResponse.json(
      { error: 'Failed to delete packing list' },
      { status: 500 }
    );
  }
}