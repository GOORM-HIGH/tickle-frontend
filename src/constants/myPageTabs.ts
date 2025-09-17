export enum MyPageTabs {
  INFO = "INFO",
  RESERVATION_HISTORIES = "RESERVATION_HISTORIES",
  SCRAPED_PERFORMANCES = "SCRAPED_PERFORMANCES",
  PERFORMANCE_DASHBOARD = "PERFORMANCE_DASHBOARD",
  COUPONS = "COUPONS",
  SETTLEMENT_DASHBOARD = "SETTLEMENT_DASHBOARD",
  POINTS = "POINTS",
}

export const TAB_PATHS: Record<MyPageTabs, string> = {
  [MyPageTabs.INFO]: "info",
  [MyPageTabs.RESERVATION_HISTORIES]: "reservationhistories",
  [MyPageTabs.SCRAPED_PERFORMANCES]: "scraped-performance",
  [MyPageTabs.PERFORMANCE_DASHBOARD]: "performance-dashboard",
  [MyPageTabs.COUPONS]: "coupons",
  [MyPageTabs.SETTLEMENT_DASHBOARD]: "settlement",
  [MyPageTabs.POINTS]: "points",
};