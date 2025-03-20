import { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">MSP Portal</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search input can go here */}
            </div>
            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-background transition-transform duration-200 ease-in-out md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="flex h-full flex-col space-y-4 p-4">
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Dashboard
              </Link>
              <Link
                href="/products"
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Products
              </Link>
              <Link
                href="/orders"
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Orders
              </Link>
              <Link
                href="/payments"
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Payments
              </Link>
              {user.role === 'tenant_admin' && (
                <Link
                  href="/users"
                  className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Users
                </Link>
              )}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:ml-64">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
} 