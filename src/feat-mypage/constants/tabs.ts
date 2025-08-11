export const MY_PAGE_TABS = {
  INFO: 'info',
  PERFORMANCES: 'performances',
  RESERVATIONS: 'reservations',
  COUPONS: 'coupons',
  SCRAPS: 'scraps',
  SETTLEMENTS: 'settlements',
  POINT_HISTORY: 'pointHistory'
} as const;

export type MyPageTab = typeof MY_PAGE_TABS[keyof typeof MY_PAGE_TABS];
