/**
 * Staff Invitation Section Types
 */

export type PageState = 'form' | 'success' | 'expired';

export interface InvitationDetails {
  email: string;
  role: string;
  restaurantName: string;
  inviterName: string;
}
