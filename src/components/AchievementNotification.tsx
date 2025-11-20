import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'badge' | 'level_up' | 'challenge' | 'achievement';
    data?: any;
  };
  onClose: () => void;
}

export default function AchievementNotification({ notification, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    if (notification.type === 'badge' || notification.type === 'level_up') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
    }

    setIsVisible(true);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'badge':
        return <Award className="w-8 h-8 text-yellow-500" />;
      case 'level_up':
        return <TrendingUp className="w-8 h-8 text-blue-500" />;
      case 'challenge':
        return <Trophy className="w-8 h-8 text-purple-500" />;
      default:
        return <Star className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'animate-slide-in-right opacity-100' : 'opacity-0 translate-x-full'
      }`}
    >
      <Card className="p-6 bg-card border-primary shadow-lg max-w-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1">
              {notification.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {notification.message}
            </p>
            {notification.data?.points && (
              <div className="mt-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-primary">
                  +{notification.data.points} points
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
