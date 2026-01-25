import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <main className="container mx-auto px-4 py-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
