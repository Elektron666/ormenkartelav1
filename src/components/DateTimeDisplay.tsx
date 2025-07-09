import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const DateTimeDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-r from-ormen-500 to-ormen-600 text-white px-4 py-2 rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-lg font-bold">
            {formatTime(currentTime)}
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
};