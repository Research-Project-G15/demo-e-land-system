import { Shield, Database, FileCheck, Link2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Shield },
  { href: '/deeds', label: 'Deed Records', icon: Database },
  { href: '/verify', label: 'Verify Deed', icon: FileCheck },
  { href: '/blockchain', label: 'On-Chain Registry', icon: Link2 },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md group-hover:shadow-lg transition-shadow">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold text-foreground leading-tight">
              Land Deed Verification
            </span>
            <span className="text-xs text-muted-foreground">
              Blockchain-Based Registry System
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
