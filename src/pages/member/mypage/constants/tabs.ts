export enum MyPageTab {
  INFO = "INFO",
  RESERVATION_HISTORIES = "RESERVATION_HISTORIES",
  SCRAPED_PERFORMANCES = "SCRAPED_PERFORMANCES",
  PERFORMANCE_DASHBOARD = "PERFORMANCE_DASHBOARD",
  COUPONS = "COUPONS",
  SETTLEMENT_DASHBOARD = "SETTLEMENT_DASHBOARD",
  POINTS = "POINTS",
}

export const TAB_PATHS: Record<MyPageTab, string> = {
  [MyPageTab.INFO]: "info",
  [MyPageTab.RESERVATION_HISTORIES]: "reservationhistories",
  [MyPageTab.SCRAPED_PERFORMANCES]: "scraped-performance",
  [MyPageTab.PERFORMANCE_DASHBOARD]: "performance-dashboard",
  [MyPageTab.COUPONS]: "coupons",
  [MyPageTab.SETTLEMENT_DASHBOARD]: "settlement",
  [MyPageTab.POINTS]: "points",
};