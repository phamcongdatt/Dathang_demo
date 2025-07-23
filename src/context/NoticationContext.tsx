import React, { createContext, useContext, useState, useEffect } from 'react';

interface NotificationContextType {
  NotificationCount: number;
  setNotificationCount: (count: number) => void;
  refreshNotificationCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [NotificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    refreshNotificationCount(); // Gọi khi component mount
  }, []); // Rỗng để chỉ chạy một lần

  const refreshNotificationCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotificationCount(0);
      return;
    }
    try {
      const res = await fetch('http://localhost:5118/api/Notification', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('API error:', res.status);
        setNotificationCount(0);
        return;
      }
      const data = await res.json();
      console.log('API data:', data); // Debug dữ liệu từ API
      setNotificationCount(data.length || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      setNotificationCount(0);
    }
  };

  return (
    <NotificationContext.Provider value={{ NotificationCount, setNotificationCount, refreshNotificationCount }}>
      {children}
    </NotificationContext.Provider>
  );
};