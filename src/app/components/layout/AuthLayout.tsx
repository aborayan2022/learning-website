import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-[#131313]">
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
