import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { NotificationType } from "@/types";

export type NotifyUserOptions = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  sendEmail?: boolean;
  emailOverride?: string;
};

export async function notifyUser({
  userId,
  title,
  message,
  type,
  link,
  sendEmail = true,
  emailOverride,
}: NotifyUserOptions) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });

  if (sendEmail) {
    const user = emailOverride
      ? { email: emailOverride, name: undefined }
      : await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

    if (user?.email) {
      // Fire-and-forget; we don't want email failures to block notification creation
      sendNotificationEmail({
        to: user.email,
        title,
        message,
        link,
      }).catch((error) => {
        console.error("Failed to send notification email:", error);
      });
    }
  }

  return notification;
}
