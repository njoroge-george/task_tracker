import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to decline an invitation' },
        { status: 401 }
      );
    }

    const { token } = await params;

    // Find the invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: {
        token,
      },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.status === 'EXPIRED' || new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Check if invitation has already been processed
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Check if the logged-in user's email matches the invitation email
    if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Update invitation status to declined
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'DECLINED' },
    });

    return NextResponse.json({
      message: `Invitation to ${invitation.workspace.name} declined`,
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}
