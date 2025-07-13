import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, category, quantity, priority, notes } = body;

    const item = await prisma.packingItem.create({
      data: {
        packingListId: params.id,
        name,
        category,
        quantity,
        priority,
        notes,
        packed: false
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create packing item:', error);
    return NextResponse.json(
      { error: 'Failed to create packing item' },
      { status: 500 }
    );
  }
}