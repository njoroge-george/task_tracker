import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ roomId: string }>;
}

// POST - Join a voice room
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const voiceRoom = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          where: {
            leftAt: null,
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

    if (!voiceRoom.isActive) {
      return NextResponse.json(
        { error: "Voice room is not active" },
        { status: 400 }
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

    // Check if room is full
    if (voiceRoom.participants.length >= voiceRoom.maxMembers) {
      return NextResponse.json(
        { error: "Voice room is full" },
        { status: 400 }
      );
    }

    // Check if user is already in the room
    const existingParticipant = voiceRoom.participants.find(
      (p) => p.userId === session.user.id
    );

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Already in this room", participant: existingParticipant },
        { status: 200 }
      );
    }

    // Leave any other voice rooms first
    await prisma.voiceRoomParticipant.updateMany({
      where: {
        userId: session.user.id,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });

    // Join the room
    const participant = await prisma.voiceRoomParticipant.create({
      data: {
        roomId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Error joining voice room:", error);
    return NextResponse.json(
      { error: "Failed to join voice room" },
      { status: 500 }
    );
  }
}

// DELETE - Leave a voice room
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Find active participation
    const participant = await prisma.voiceRoomParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id,
        leftAt: null,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not in this room" },
        { status: 400 }
      );
    }

    // Mark as left
    await prisma.voiceRoomParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
      },
    });

    // Check if room is empty and not persistent
    const voiceRoom = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          where: {
            leftAt: null,
          },
        },
      },
    });

    // Delete non-persistent empty rooms
    if (voiceRoom && !voiceRoom.isPersistent && voiceRoom.participants.length === 0) {
      await prisma.voiceRoom.delete({
        where: { id: roomId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving voice room:", error);
    return NextResponse.json(
      { error: "Failed to leave voice room" },
      { status: 500 }
    );
  }
}
