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
import Image from 'next/image';
import logo from '@/assets/logo.png';

const adminLinks = [
  { href: '/dashboard/admin', label: 'Visão Geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/schools', label: 'Escolas', icon: School, exact: false },
  { href: '/dashboard/admin/users', label: 'Usuários', icon: Users, exact: false },
  { href: '/dashboard/admin/classrooms', label: 'Turmas', icon: BookOpen, exact: false },
  { href: '/dashboard/admin/students', label: 'Alunos', icon: GraduationCap, exact: false },
];

const gestorLinks = [
  { href: '/dashboard/gestor', label: 'Visão Geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/gestor/classrooms', label: 'Turmas da Escola', icon: BookOpen, exact: false },
  { href: '/dashboard/gestor/students', label: 'Alunos da Escola', icon: GraduationCap, exact: false },
];

const coordenadorLinks = [
  { href: '/dashboard/coordenador', label: 'Início', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/coordenador/classrooms', label: 'Minhas Turmas', icon: BookOpen, exact: false },
];

const teacherLinks = [
  { href: '/dashboard/teacher', label: 'Início', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/teacher/classrooms', label: 'Minhas Turmas', icon: BookOpen, exact: false },
];

export function Sidebar() {
  const { profile, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  let links = teacherLinks;
  if (role === 'admin') links = adminLinks;
  else if (role === 'gestor') links = gestorLinks;
  else if (role === 'coordenador') links = coordenadorLinks;

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <Image src={logo} alt="Logo fluênciaCAP" width={150} height={50} className="w-auto h-8 object-contain" />
        <span className="text-lg font-bold tracking-tight">fluênciaCAP</span>
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
        {links.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-800 text-white'
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
