import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ roomId: string }>;
}

// GET - Get a specific voice room
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const voiceRoom = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participants: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!voiceRoom) {
      return NextResponse.json(
        { error: "Voice room not found" },
        { status: 404 }
      );
    }

    // Verify user is a member of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: voiceRoom.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    return NextResponse.json(voiceRoom);
  } catch (error) {
    console.error("Error fetching voice room:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice room" },
      { status: 500 }
    );
  }
}

// PATCH - Update a voice room
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await request.json();
    const { name, description, isActive, maxMembers } = body;

    const voiceRoom = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
    });

    if (!voiceRoom) {
      return NextResponse.json(
        { error: "Voice room not found" },
        { status: 404 }
      );
    }

    // Only creator or workspace admins can update
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: voiceRoom.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (
      voiceRoom.createdById !== session.user.id &&
      membership?.role !== "ADMIN" &&
      membership?.role !== "OWNER"
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this room" },
        { status: 403 }
      );
    }

    const updatedRoom = await prisma.voiceRoom.update({
      where: { id: roomId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(maxMembers && { maxMembers }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participants: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating voice room:", error);
    return NextResponse.json(
      { error: "Failed to update voice room" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a voice room
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const voiceRoom = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
    });

    if (!voiceRoom) {
      return NextResponse.json(
        { error: "Voice room not found" },
        { status: 404 }
      );
    }

    // Only creator or workspace admins can delete
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: voiceRoom.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (
      voiceRoom.createdById !== session.user.id &&
      membership?.role !== "ADMIN" &&
      membership?.role !== "OWNER"
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this room" },
        { status: 403 }
      );
    }

    await prisma.voiceRoom.delete({
      where: { id: roomId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting voice room:", error);
    return NextResponse.json(
      { error: "Failed to delete voice room" },
      { status: 500 }
    );
  }
}
