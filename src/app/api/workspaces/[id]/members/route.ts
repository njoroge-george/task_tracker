import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get all members of a workspace
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: workspaceId } = await params;

    // Check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a member of this workspace' },
        { status: 403 }
      );
    }

    // Get all members
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, MEMBER, VIEWER
        { joinedAt: 'asc' },
      ],
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace members' },
      { status: 500 }
    );
  }
}

// Update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: workspaceId } = await params;
    const body = await req.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: 'Member ID and role are required' },
        { status: 400 }
      );
    }

    if (!['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if requester is owner or admin
    const requesterMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });

    if (!requesterMembership) {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can change member roles' },
        { status: 403 }
      );
    }

    // Get the target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent changing owner role unless requester is owner
    if (targetMember.role === 'OWNER' && requesterMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Forbidden: Only the owner can change another owner\'s role' },
        { status: 403 }
      );
    }

    // Prevent setting someone as owner unless transferring ownership
    if (role === 'OWNER' && requesterMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners can assign owner role' },
        { status: 403 }
      );
    }

    // If setting someone as owner, demote current owner to admin
    if (role === 'OWNER') {
      await prisma.$transaction([
        // Demote current owner to admin
        prisma.workspaceMember.update({
          where: {
            id: requesterMembership.id,
          },
          data: {
            role: 'ADMIN',
          },
        }),
        // Promote target member to owner
        prisma.workspaceMember.update({
          where: {
            id: memberId,
          },
          data: {
            role: 'OWNER',
          },
        }),
      ]);

      return NextResponse.json({
        message: 'Ownership transferred successfully',
      });
    }

    // Update member role
    const updatedMember = await prisma.workspaceMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
      include: {
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

    return NextResponse.json({
      message: 'Member role updated successfully',
      member: updatedMember,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

// Remove member from workspace
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const { id: workspaceId } = await params;

    // Check if requester is owner or admin
    const requesterMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });

    if (!requesterMembership) {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can remove members' },
        { status: 403 }
      );
    }

    // Get the target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent removing owner
    if (targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove workspace owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Delete the member
    await prisma.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
