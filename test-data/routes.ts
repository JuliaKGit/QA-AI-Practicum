/** Relative paths visited during BuddyTime exploration (Playwright `baseURL` = APP_URL). */
export enum AppRoute {
  Landing = '/',
  Login = '/login',
  SignUp = '/signup',
  ForgotPassword = '/forgot-password',
  Privacy = '/privacy',
  Dashboard = '/app',
  Calendar = '/calendar',
  Friends = '/friends',
  Communities = '/communities',
  CreateCommunity = '/communities/new',
  /** Maple Class — community detail visited during exploration. */
  MapleClassCommunity = '/communities/15f52f3a-ba2f-46b7-b859-047ed8f6b50f',
  Availability = '/availability',
  Playdates = '/playdates',
  NewPlaydate = '/playdates/new',
  Birthdays = '/birthdays',
  Profile = '/profile',
  Admin = '/admin',
}
