import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List voice rooms for a workspace
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
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

    // Get all voice rooms for this workspace
    const voiceRooms = await prisma.voiceRoom.findMany({
      where: {
        workspaceId,
        isActive: true,
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
            leftAt: null, // Only active participants
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(voiceRooms);
  } catch (error) {
    console.error("Error fetching voice rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice rooms" },
      { status: 500 }
    );
  }
}

// POST - Create a new voice room
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, workspaceId, isPersistent = true, maxMembers = 10 } = body;

    if (!name || !workspaceId) {
      return NextResponse.json(
        { error: "Name and workspace ID are required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
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

    const voiceRoom = await prisma.voiceRoom.create({
      data: {
        name,
        description,
        workspaceId,
        createdById: session.user.id,
        isPersistent,
        maxMembers,
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

    return NextResponse.json(voiceRoom, { status: 201 });
  } catch (error) {
    console.error("Error creating voice room:", error);
    return NextResponse.json(
      { error: "Failed to create voice room" },
      { status: 500 }
    );
  }
}
