export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  emailVerified?: boolean
}

export interface ProfileState {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
}

export interface EditProfileForm {
  name: string
  avatar: string
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
  bgColor: string
}

export interface FormErrors {
  [key: string]: string
}

export interface TouchedFields {
  [key: string]: boolean
}
