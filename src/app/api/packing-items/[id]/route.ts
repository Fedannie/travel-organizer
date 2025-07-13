import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, category, quantity, packed, priority, notes } = body;

    const item = await prisma.packingItem.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(quantity !== undefined && { quantity }),
        ...(packed !== undefined && { packed }),
        ...(priority !== undefined && { priority }),
        ...(notes !== undefined && { notes })
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update packing item:', error);
    return NextResponse.json(
      { error: 'Failed to update packing item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.packingItem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete packing item:', error);
    return NextResponse.json(
      { error: 'Failed to delete packing item' },
      { status: 500 }
    );
  }
}