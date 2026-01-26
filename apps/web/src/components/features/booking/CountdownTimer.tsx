'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ expiresAt, onExpire, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expirationTime = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const difference = expirationTime - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    // Initial calculation
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg",
        timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-orange-50 text-orange-600",
        className
      )}
    >
      <span className="text-sm uppercase font-sans tracking-wider opacity-70">Thời gian giữ vé:</span>
      <span>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
