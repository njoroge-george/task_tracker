import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get invitation details by token (public endpoint for invite page)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: {
        token,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        invitedByUser: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    const isExpired = invitation.status === 'EXPIRED' || new Date() > invitation.expiresAt;

    // Update status if expired but not marked as such
    if (isExpired && invitation.status !== 'EXPIRED') {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: isExpired ? 'EXPIRED' : invitation.status,
        expiresAt: invitation.expiresAt,
        workspace: invitation.workspace,
        invitedBy: invitation.invitedByUser,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    );
  }
}
