import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const preferencesSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  weekStart: z.number().int().min(0).max(6).optional(),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  notificationPreferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    taskAssigned: z.boolean(),
    taskCompleted: z.boolean(),
    taskDueSoon: z.boolean(),
    comments: z.boolean(),
    mentions: z.boolean(),
  }).optional(),
  reminderSettings: z.object({
    enabled: z.boolean(),
    intervals: z.array(z.number()), // hours before due date
  }).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        timezone: true,
        dateFormat: true,
        weekStart: true,
        theme: true,
        notificationPreferences: true,
        reminderSettings: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = preferencesSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
      select: {
        timezone: true,
        dateFormat: true,
        weekStart: true,
        theme: true,
        notificationPreferences: true,
        reminderSettings: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
