import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to accept an invitation' },
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
      // Update status if not already expired
      if (invitation.status !== 'EXPIRED') {
        await prisma.workspaceInvitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' },
        });
      }
      
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted or declined
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Note: We're allowing anyone logged in to accept the invitation
    // The email check is removed to allow flexible workspace invitations
    // You can add it back if you want strict email verification

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      // Update invitation status
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return NextResponse.json(
        { error: 'You are already a member of this workspace' },
        { status: 400 }
      );
    }

    // Create workspace membership, log activity, notify user, and update invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create workspace member
      const member = await tx.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: session.user!.id,
          role: invitation.role,
        },
        include: {
          workspace: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Log activity: user joined the workspace
      await tx.activityLog.create({
        data: {
          action: 'joined',
          entity: 'workspace',
          metadata: { role: invitation.role },
          userId: session.user!.id,
          workspaceId: invitation.workspaceId,
        },
      });

      // Create notification for the user
      await tx.notification.create({
        data: {
          title: `Welcome to ${member.workspace.name}`,
          message: 'You have successfully joined the workspace. Explore projects and start collaborating.',
          type: 'PROJECT_INVITE',
          userId: session.user!.id,
          link: '/dashboard',
        },
      });

      // Update invitation status
      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return member;
    });

    return NextResponse.json({
      message: `Successfully joined ${invitation.workspace.name}`,
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
      },
      membership: {
        id: result.id,
        role: result.role,
      },
      // Hint client to switch active workspace immediately
      workspaceId: result.workspace.id,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
