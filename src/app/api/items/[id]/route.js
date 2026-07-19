import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { validateItemData } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * Find an item by ID that belongs to the authenticated user.
 * Returns the item or null (used by GET, PUT, DELETE).
 */
async function findUserItem(id, userId) {
  return prisma.item.findFirst({
    where: { id, userId },
  });
}

/**
 * GET /api/items/[id]
 * Fetch a single item that belongs to the authenticated user.
 */
export async function GET(request, { params }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { id } = await params;
    const item = await findUserItem(id, userId);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Exclude userId from response
    const { userId: _, ...itemData } = item;
    return NextResponse.json({ item: itemData });
  } catch (error) {
    console.error('GET /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/items/[id]
 * Update an item that belongs to the authenticated user.
 * Lenient validation: only provided fields are checked, and category/storage/unit
 * are not validated against constant lists (preserves legacy data flexibility).
 */
export async function PUT(request, { params }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { id } = await params;
    const existingItem = await findUserItem(id, userId);

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Lenient validation for updates
    const validationResult = validateItemData(body, { strict: false });
    if (validationResult) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }

    // Build update data from only the fields that are provided
    const updateData = {};
    if ('name' in body) updateData.name = body.name.trim();
    if ('category' in body) updateData.category = body.category;
    if ('storage' in body) updateData.storage = body.storage;
    if ('quantity' in body) updateData.quantity = body.quantity;
    if ('unit' in body) updateData.unit = body.unit;
    if ('expiry' in body) updateData.expiry = body.expiry || null;
    if ('notes' in body) updateData.notes = body.notes?.trim() || null;

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        category: true,
        storage: true,
        quantity: true,
        unit: true,
        expiry: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[id]
 * Delete an item that belongs to the authenticated user.
 */
export async function DELETE(request, { params }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { id } = await params;
    const existingItem = await findUserItem(id, userId);

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
