import { Metadata } from 'next';
import { LandingPage } from '@/features/landing';

export const metadata: Metadata = {
  title: 'Welcome | TKOB Order',
  description: 'Scan the QR code on your table to start ordering',
};

export default function Page() {
  return <LandingPage />;
}
