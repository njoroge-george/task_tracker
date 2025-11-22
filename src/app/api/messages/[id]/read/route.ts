import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/messages/[id]/read - Mark message as read
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the message belongs to the current user (as receiver)
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message || message.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Mark as read
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
