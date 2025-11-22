import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, callType, duration, missed, noAnswer } = await req.json();

    if (!receiverId || !callType) {
      return NextResponse.json(
        { error: "receiverId and callType are required" },
        { status: 400 }
      );
    }

    // Format call duration
    const formatDuration = (seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    };

    let content: string;
    let messageType: string;
    
    if (noAnswer) {
      // No answer - create two messages: one for caller, one for receiver
      
      // Message for caller (sender): "No answer"
      const callerMessage = await prisma.message.create({
        data: {
          content: `${callType === 'video' ? '📹' : '📞'} No answer`,
          messageType: "CALL_MISSED",
          callType,
          callDuration: duration,
          senderId: session.user.id,
          receiverId,
          read: true, // Caller knows they called
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
      
      // Message for receiver: "Missed call"
      const receiverMessage = await prisma.message.create({
        data: {
          content: `${callType === 'video' ? '📹' : '📞'} Missed call`,
          messageType: "CALL_MISSED",
          callType,
          callDuration: duration,
          senderId: session.user.id,
          receiverId,
          read: false, // Unread for receiver
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      console.log('No answer logged - both messages created');

      return NextResponse.json({ success: true, message: callerMessage, receiverMessage });
    } else if (missed) {
      // Declined call - only create missed call for receiver
      content = `${callType === 'video' ? '📹' : '📞'} Missed call`;
      messageType = "CALL_MISSED";
    } else {
      // Completed call
      const durationText = duration > 0 
        ? formatDuration(duration)
        : 'less than a second';
      content = `${callType === 'video' ? '📹 Video' : '📞 Voice'} call · ${durationText}`;
      messageType = "CALL";
    }

    // Create call log message
    const message = await prisma.message.create({
      data: {
        content,
        messageType,
        callType,
        callDuration: duration,
        senderId: session.user.id,
        receiverId,
        read: (missed || noAnswer) ? false : true, // Unread if missed/no answer, read if completed
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    console.log('Call logged successfully:', message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error logging call:", error);
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to log call", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
