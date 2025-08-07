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
  notificationList: Notification[];
}

export default function NotificationPopover({
  isOpen,
  notificationList,
}: NotificationPopoverProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-8 top-[60px] w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 text-sm">
      <p className="text-gray-800 font-semibold mb-3">🔔 알림</p>

      {notificationList.length > 0 ? (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {notificationList.map((notification) => {
            const isUnread = !notification.isRead;

            return (
              <li
                key={notification.id}
                className={`p-4 rounded-md shadow-sm border-l-4 ${
                  isUnread
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p
                    className={`text-sm ${
                      isUnread ? "font-semibold text-blue-900" : "text-gray-700"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {isUnread && (
                    <span className="text-xs text-red-500 font-bold ml-2">
                      🔔
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{notification.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(notification.createdAt), "yyyy.MM.dd HH:mm")}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-gray-500 text-center py-6">알림이 없습니다.</div>
      )}
    </div>
  );
}
