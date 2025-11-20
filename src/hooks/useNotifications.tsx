import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AchievementNotification from '@/components/AchievementNotification';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'badge' | 'level_up' | 'challenge' | 'achievement';
  is_read: boolean;
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (!newNotification.is_read) {
            setCurrentNotification(newNotification);
            setNotifications((prev) => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const typedData = (data || []) as Notification[];
      setNotifications(typedData);

      // Show first unread notification
      const unread = typedData.find((n) => !n.is_read);
      if (unread) {
        setCurrentNotification(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClose = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setCurrentNotification(null);
  };

  const NotificationPortal = currentNotification ? (
    <AchievementNotification notification={currentNotification} onClose={handleClose} />
  ) : null;

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    NotificationPortal,
  };
}
