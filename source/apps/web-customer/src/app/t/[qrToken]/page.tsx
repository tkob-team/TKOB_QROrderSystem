'use client'

import { useParams } from 'next/navigation';
import { QRHandlerPage } from '@/features/tables';

export default function QRScanPage() {
  const params = useParams();
  const qrToken = params.qrToken as string;
  
  return <QRHandlerPage qrToken={qrToken} />;
}
