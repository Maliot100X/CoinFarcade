import { Link, useLocation } from 'react-router-dom';
import { Home, Rocket, ShoppingBag, User, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/launch', label: 'Launch', icon: Rocket },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-purple-500" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
