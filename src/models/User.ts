export enum UiTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export interface User {
  userId: string
  username: string
  firstName: string
  lastName: string
  email: string
  themePreference: UiTheme
}