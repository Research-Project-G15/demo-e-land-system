import { Database, FileCheck, LogOut, LogIn, Home, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import governmentEmblem from '@/assets/government-emblem.png';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/deeds', label: 'Deed Records', icon: Database },
  { href: '/verify', label: 'Search', icon: FileCheck },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      {/* Top government banner */}
      <div className="bg-primary text-primary-foreground py-1">
        <div className="container text-center text-xs font-medium tracking-wide">
          Government of Sri Lanka — Official Land Registry Portal
        </div>
      </div>
      
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <img 
            src={governmentEmblem} 
            alt="Government of Sri Lanka Emblem" 
            className="h-14 w-auto"
          />
          <div className="flex flex-col">
            <span className="font-display text-xl font-semibold text-foreground leading-tight">
              Land Registry Department
            </span>
            <span className="text-xs text-muted-foreground">
              Ministry of Lands
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-border"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
              className="border-border"
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Admin Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
