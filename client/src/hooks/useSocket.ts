import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

const SOCKET_URL = 'http://localhost:3000';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

export const useSocket = (userId?: number): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Soket bağlantısı başlat
    const socketInstance = io(SOCKET_URL);
    
    socketInstance.on('connect', () => {
      console.log('Socket.IO bağlantısı kuruldu');
      setIsConnected(true);
      
      // Kullanıcı ID'si varsa odaya katıl
      if (userId) {
        socketInstance.emit('joinUserRoom', userId);
      }
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket.IO bağlantısı kesildi');
      setIsConnected(false);
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO bağlantı hatası:', error);
    });
    
    setSocket(socketInstance);
    
    // Temizlik fonksiyonu
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);
  
  return { socket, isConnected };
};

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  isRead: boolean;
  data: Record<string, unknown>;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotifications = (userId?: number): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket(userId);
  
  useEffect(() => {
    if (socket && userId) {
      // Gerçek zamanlı bildirimleri dinle
      socket.on('notification', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });
    }
    
    // Component unmount olduğunda dinlemeyi temizle
    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, userId]);
  
  // İlk yüklemede bildirimleri getir
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);
  
  // Bildirimleri getir
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Bildirimler getirilirken hata:', error);
    }
  };
  
  // Bildirimi okundu olarak işaretle
  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${userId}/read-all`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Bildirimler okundu işaretlenirken hata:', error);
    }
  };
  
  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return { 
    notifications, 
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
