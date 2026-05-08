import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, BarChart2, Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: FileText, label: 'Posts', path: '/admin' },
  { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    sessionStorage.removeItem('editorial_auth');
    navigate('/sign-in');
  };

  return (
    <div className="flex gap-12 flex-col lg:flex-row">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h3 className="text-label-caps text-secondary opacity-50">MANAGEMENT</h3>
          <nav className="flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/admin' && (location.pathname.startsWith('/admin/write') || location.pathname.startsWith('/admin/edit')));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-all",
                    isActive ? "bg-tertiary text-white" : "text-secondary hover:bg-surface-container"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-body-md">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 bg-surface-container-low border border-outline-variant flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center">
              <User size={20} className="text-tertiary" />
            </div>
            <div>
              <p className="text-label-caps text-[11px] text-secondary">Editor-in-Chief</p>
              <p className="text-body-md font-bold leading-tight">Kartikeya Trivedi</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-secondary text-[12px] hover:text-tertiary transition-colors mt-2 cursor-pointer"
          >
            <LogOut size={14} />
            <span className="text-label-caps">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col gap-12">
        {children}
      </div>
    </div>
  );
}
