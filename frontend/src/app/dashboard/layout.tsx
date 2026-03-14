// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col ml-[220px]">
          <Navbar />
          <main className="flex-1 p-7 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
