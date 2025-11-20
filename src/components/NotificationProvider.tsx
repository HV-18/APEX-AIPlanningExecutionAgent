import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { NotificationPortal } = useNotifications();

  return (
    <>
      {children}
      {NotificationPortal}
    </>
  );
}
