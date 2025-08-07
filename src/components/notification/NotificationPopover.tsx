import { format } from "date-fns";

interface Notification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  notificationList: Notification[] | null;
}

export default function NotificationPopover({
  isOpen,
  notificationList,
}: NotificationPopoverProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-8 top-[60px] w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 text-sm">
      <p className="text-gray-800 font-semibold mb-3">🔔 알림</p>

      {notificationList && notificationList.length > 0 ? (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {notificationList.map((notification) => (
            <li
              key={notification.id}
              className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm"
            >
              <p className="font-semibold text-gray-800">
                {notification.title}
              </p>
              <p className="text-gray-600 text-sm">{notification.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(notification.createdAt), "yyyy.MM.dd HH:mm")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-center py-6">알림이 없습니다.</div>
      )}
    </div>
  );
}
