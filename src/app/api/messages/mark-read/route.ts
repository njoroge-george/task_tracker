import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Mark messages as read
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, senderId } = await req.json();

    if (messageId) {
      // Mark single message as read
      await prisma.message.update({
        where: {
          id: messageId,
          receiverId: session.user.id,
        },
        data: {
          read: true,
        },
      });
    } else if (senderId) {
      // Mark all messages from sender as read
      await prisma.message.updateMany({
        where: {
          senderId,
          receiverId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: "messageId or senderId required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
