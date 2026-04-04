'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Ticket, Megaphone,
  BookOpen, LogOut, Users, ClipboardList, CheckSquare, Activity
} from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty', 'student'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Lesson Plans', href: '/lesson-plans', icon: ClipboardList, roles: ['admin', 'faculty'] },
  { name: 'Grading', href: '/grading', icon: CheckSquare, roles: ['admin', 'faculty'] },
  { name: 'Analytics', href: '/analytics', icon: Activity, roles: ['admin', 'faculty'] },
  { name: 'Resources', href: '/resources', icon: BookOpen, roles: ['admin', 'faculty', 'student'] },
  { name: 'Tickets', href: '/tickets', icon: Ticket, roles: ['admin', 'faculty', 'student'] },
  { name: 'Announcements', href: '/announcements', icon: Megaphone, roles: ['admin', 'faculty', 'student'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const role = (session?.user as any)?.role || 'student';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen relative">

      {/* ✅ SAFE BACKGROUND BLOBS */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-cyan-300/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />
      </div>

      {/* SIDEBAR */}
      <aside className="w-64 glass-sidebar p-4 flex flex-col">
        <h1 className="font-bold text-lg mb-6 px-2">SmartTeach</h1>
        
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            if (item.roles && !item.roles.includes(role)) return null;
            
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                  pathname === item.href ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => signOut()}
          className="mt-6 text-red-500 flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        {children}
      </main>

    </div>
  );
}