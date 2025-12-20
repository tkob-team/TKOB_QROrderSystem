// Common types used across the application

export type Language = 'EN' | 'VI';

export interface RedirectState {
  screen: string;
  params?: Record<string, any>;
}
