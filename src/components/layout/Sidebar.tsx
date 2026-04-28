'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  LogOut,
  GraduationCap,
} from 'lucide-react';

const adminLinks = [
  { href: '/dashboard/admin', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/admin/schools', label: 'Escolas', icon: School },
  { href: '/dashboard/admin/teachers', label: 'Professores', icon: Users },
];

const teacherLinks = [
  { href: '/dashboard/teacher', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/teacher/classrooms', label: 'Minhas Turmas', icon: BookOpen },
];

export function Sidebar() {
  const { profile, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = role === 'admin' ? adminLinks : teacherLinks;

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <BookOpen className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-bold tracking-tight">Lexfluência</span>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
          {role === 'admin' ? 'Administrador' : 'Professor'}
        </p>
        <p className="text-sm font-medium truncate">{profile?.name ?? '...'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard/admin' || href === '/dashboard/teacher'
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
