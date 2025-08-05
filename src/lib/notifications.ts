import { db } from './db';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface NotificationData {
  type: 'meeting_created' | 'meeting_confirmed' | 'meeting_cancelled' | 'meeting_completed' | 'cab_booked' | 'payment_completed';
  title: string;
  message: string;
  userId: string;
  relatedUserId?: string;
  meetingId?: string;
  cabBookingId?: string;
  data?: any;
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      const notification = await db.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId,
          relatedUserId: data.relatedUserId,
          meetingId: data.meetingId,
          cabBookingId: data.cabBookingId,
          data: data.data || {},
          isRead: false,
          createdAt: new Date(),
        },
      });

      // Send real-time notification via socket.io if available
      if (global.io) {
        global.io.to(`user_${data.userId}`).emit('notification', {
          id: notification.id,
          type: data.type,
          title: data.title,
          message: data.message,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          relatedUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          meeting: {
            select: {
              id: true,
              dateTime: true,
              restaurant: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await db.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const notifications = await db.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return notifications;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const count = await db.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }
}

// Helper functions to create specific notifications
export const NotificationHelpers = {
  async meetingCreated(meetingId: string, boyUserId: string, girlUserId: string, restaurantName: string) {
    await Promise.all([
      NotificationService.createNotification({
        type: 'meeting_created',
        title: 'New Meeting Request',
        message: `You have a new meeting request at ${restaurantName}`,
        userId: girlUserId,
        relatedUserId: boyUserId,
        meetingId,
        data: { restaurantName },
      }),
    ]);
  },

  async meetingConfirmed(meetingId: string, boyUserId: string, girlUserId: string, restaurantName: string) {
    await Promise.all([
      NotificationService.createNotification({
        type: 'meeting_confirmed',
        title: 'Meeting Confirmed',
        message: `Your meeting at ${restaurantName} has been confirmed`,
        userId: boyUserId,
        relatedUserId: girlUserId,
        meetingId,
        data: { restaurantName },
      }),
    ]);
  },

  async meetingCancelled(meetingId: string, boyUserId: string, girlUserId: string, cancelledByUserId: string, restaurantName: string) {
    const isBoyCancelled = cancelledByUserId === boyUserId;
    const recipientId = isBoyCancelled ? girlUserId : boyUserId;
    const cancelledByName = isBoyCancelled ? 'boy' : 'girl';

    await NotificationService.createNotification({
      type: 'meeting_cancelled',
      title: 'Meeting Cancelled',
      message: `Your meeting at ${restaurantName} has been cancelled by the ${cancelledByName}`,
      userId: recipientId,
      relatedUserId: cancelledByUserId,
      meetingId,
      data: { restaurantName, cancelledBy: cancelledByName },
    });
  },

  async meetingCompleted(meetingId: string, boyUserId: string, girlUserId: string, restaurantName: string) {
    await Promise.all([
      NotificationService.createNotification({
        type: 'meeting_completed',
        title: 'Meeting Completed',
        message: `Hope you had a great time at ${restaurantName}!`,
        userId: boyUserId,
        relatedUserId: girlUserId,
        meetingId,
        data: { restaurantName },
      }),
      NotificationService.createNotification({
        type: 'meeting_completed',
        title: 'Meeting Completed',
        message: `Hope you had a great time at ${restaurantName}!`,
        userId: girlUserId,
        relatedUserId: boyUserId,
        meetingId,
        data: { restaurantName },
      }),
    ]);
  },

  async cabBooked(cabBookingId: string, meetingId: string, userId: string, passengerId: string, pickupLocation: string, dropLocation: string) {
    await NotificationService.createNotification({
      type: 'cab_booked',
      title: 'Cab Booked',
      message: `A cab has been booked for your journey from ${pickupLocation} to ${dropLocation}`,
      userId: passengerId,
      relatedUserId: userId,
      meetingId,
      cabBookingId,
      data: { pickupLocation, dropLocation },
    });
  },

  async paymentCompleted(meetingId: string, payerUserId: string, recipientUserId: string, amount: number, restaurantName: string) {
    await NotificationService.createNotification({
      type: 'payment_completed',
      title: 'Payment Completed',
      message: `Your partner has paid ₹${amount} for your meeting at ${restaurantName}`,
      userId: recipientUserId,
      relatedUserId: payerUserId,
      meetingId,
      data: { amount, restaurantName },
    });
  },
};