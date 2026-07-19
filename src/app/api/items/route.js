import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { validateItemData } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/items
 * Fetch all items for the authenticated user, ordered by createdAt desc.
 */
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Create a new item for the authenticated user.
 * Strict validation: all required fields must be present and valid.
 */
export async function POST(request) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();

    // Strict validation for creation
    const validationResult = validateItemData(body, { strict: true });
    if (validationResult) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        userId,
        name: body.name.trim(),
        category: body.category,
        storage: body.storage,
        quantity: body.quantity,
        unit: body.unit,
        expiry: body.expiry || null,
        notes: body.notes?.trim() || null,
      },
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

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
