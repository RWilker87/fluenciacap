import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {title && (
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </header>
        )}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
