'use client';

import { useSession } from 'next-auth/react';
import { Mail, User, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  // ✅ Better loading UI
  if (status === 'loading') {
    return (
      <div className="glass-card p-6 animate-pulse text-center">
        Loading profile...
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-xl mx-auto">

      <div className="glass-card p-8 space-y-6 text-center">

        {/* Avatar */}
        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
          {initials}
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-slate-800">
          {user.name || 'Unknown User'}
        </h2>

        {/* Info */}
        <div className="space-y-4 text-left">

          <div className="flex items-center gap-3">
            <User size={18} className="text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">Full Name</div>
              <div className="font-semibold text-slate-700">
                {user.name || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail size={18} className="text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">Email</div>
              <div className="font-semibold text-slate-700">
                {user.email || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield size={18} className="text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">Role</div>
              <span className={`badge badge-${user.role}`}>
                {user.role}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}