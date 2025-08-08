import { format } from "date-fns";
import { markNotificationAsRead } from "../../services/notificationService";

interface NotificationPopoverProps {
  isOpen: boolean;
  notificationList: NotificationResponse[];
  onRead: (id: number) => void; // ← 콜백 추가
}

export default function NotificationPopover({
  isOpen,
  notificationList,
  onRead,
}: NotificationPopoverProps) {
  if (!isOpen) return null;

  const handleClick = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      onRead(id); // 부모 컴포넌트에 상태 업데이트 요청
    } catch (err) {
      console.error("알림 읽음 처리 실패:", err);
    }
  };

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
                // ✅ 읽지 않은 경우에만 클릭 이벤트 추가
                onClick={
                  isUnread ? () => handleClick(notification.id) : undefined
                }
                className={`p-4 rounded-md shadow-sm border-l-4 transition ${
                  isUnread
                    ? "cursor-pointer hover:bg-gray-50 border-blue-500 bg-blue-50"
                    : "cursor-default border-transparent bg-white"
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
