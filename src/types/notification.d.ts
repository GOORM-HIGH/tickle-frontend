type NotificationResponse = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
};

type RealtimeNotification<T = any> = {
  type: number;
  subject: string;
  content: string;
  createdAt: string;
  link?: string | null;
  data: T;
};

type ConnectSSEOptions = {
  path?: string;
  onMessage: (data: RealtimeNotification) => void;
  onError?: (error: any) => void;
  withCredentials?: boolean;
  heartbeatTimeout?: number;
};