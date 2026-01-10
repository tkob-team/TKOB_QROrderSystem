export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordRequestForm {
  email: string
}

export interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

export interface AuthState {
  isLoading: boolean
  isGoogleLoading: boolean
  error: string | null
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  emailVerified: boolean
}

export interface FormErrors {
  [key: string]: string
}

export interface TouchedFields {
  [key: string]: boolean
}
