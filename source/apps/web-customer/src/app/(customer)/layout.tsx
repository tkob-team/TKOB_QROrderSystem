import { BottomNav } from '@/shared/components'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}
