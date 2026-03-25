import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { Activity, LayoutDashboard, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
  user: FirebaseUser | null;
}

export function Layout({ children, user }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Device', path: '/device', icon: Activity },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">StayHealthy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-black",
                  location.pathname === item.path ? "text-black" : "text-neutral-500"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => auth.signOut()}
                className="p-2 text-neutral-400 hover:text-black transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link
                to="/device"
                className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Start Measurement
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">© 2026 StayHealthy Public Health System</p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
