import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/web-push";
import { NotificationType, NotificationPreferences } from "@/types";

// WebSocket server instance (shared across the app)
let io: any = null;

export function setSocketIO(socketServer: any) {
  io = socketServer;
}

export type NotifyUserOptions = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
  forceEmail?: boolean; // Override user preferences for critical notifications
  forcePush?: boolean;
};

export async function notifyUser({
  userId,
  title,
  message,
  type,
  link,
  metadata,
  forceEmail = false,
  forcePush = false,
}: NotifyUserOptions) {
  // Get user with notification preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      email: true, 
      name: true, 
      notificationPreferences: true,
    },
  });

  if (!user) {
    console.error('User not found:', userId);
    return null;
  }

  const prefs = (user.notificationPreferences as NotificationPreferences) || {
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: false,
    taskDueSoon: true,
    comments: true,
    mentions: true,
  };

  // Check if user wants this type of notification
  const shouldNotify = shouldSendNotification(type, prefs);
  
  if (!shouldNotify && !forceEmail && !forcePush) {
    console.log(`User ${userId} has disabled ${type} notifications`);
    return null;
  }

  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      metadata: metadata || {},
      emailSent: false,
      pushSent: false,
    },
  });

  // Emit real-time notification via WebSocket
  if (io) {
    io.to(`notifications:${userId}`).emit('notification:new', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      read: false,
    });
  }

  // Send email if enabled
  const sendEmail = forceEmail || (prefs.email && shouldNotify);
  if (sendEmail && user.email) {
    sendNotificationEmail({
      to: user.email,
      title,
      message,
      link,
    })
      .then(() => {
        prisma.notification.update({
          where: { id: notification.id },
          data: { emailSent: true },
        }).catch(console.error);
      })
      .catch((error) => {
        console.error("Failed to send notification email:", error);
      });
  }

  // Send push notification if enabled
  const sendPush = forcePush || (prefs.push && shouldNotify);
  const pushSubscription = (user.notificationPreferences as any)?.pushSubscription;
  
  if (sendPush && pushSubscription) {
    sendPushNotification(pushSubscription, {
      title,
      body: message,
      icon: '/logo-512.svg',
      badge: '/logo.svg',
      link: link || '/dashboard/notifications',
      tag: type,
      requireInteraction: ['TASK_ASSIGNED', 'MENTION'].includes(type),
    })
      .then((success) => {
        if (success) {
          prisma.notification.update({
            where: { id: notification.id },
            data: { pushSent: true },
          }).catch(console.error);
        }
      })
      .catch((error) => {
        console.error("Failed to send push notification:", error);
      });
  }

  return notification;
}

/**
 * Determine if notification should be sent based on type and user preferences
 */
function shouldSendNotification(
  type: NotificationType,
  prefs: NotificationPreferences
): boolean {
  switch (type) {
    case 'TASK_ASSIGNED':
      return prefs.taskAssigned;
    case 'TASK_COMPLETED':
      return prefs.taskCompleted;
    case 'TASK_DUE_SOON':
    case 'TASK_REMINDER':
      return prefs.taskDueSoon;
    case 'COMMENT_ADDED':
      return prefs.comments;
    case 'MENTION':
      return prefs.mentions;
    default:
      return true; // Send other notification types by default
  }
}
