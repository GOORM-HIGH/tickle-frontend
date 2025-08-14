import api from "./api";

export const markNotificationAsRead = async (notificationId: number) => {
  return api.patch(`/api/v1/notifications/${notificationId}/read`);
};
