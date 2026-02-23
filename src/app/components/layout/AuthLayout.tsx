import { Outlet } from 'react-router';
import { Toaster } from 'sonner';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-[#131313]">
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
