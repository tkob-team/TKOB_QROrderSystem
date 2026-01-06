import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Modifiers | TKQR Admin',
};

export default function MenuModifiersRoute() {
  redirect('/admin/menu?tab=modifiers');
}
