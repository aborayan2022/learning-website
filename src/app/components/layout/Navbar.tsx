import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../../store/auth.store';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    const map: Record<string, string> = {
      admin: '/admin',
      teacher: '/dashboard/teacher',
      parent: '/dashboard/parent',
    };
    return map[user.role] || '/';
  };

  return (
    <nav className="bg-[#131313] shadow-[0px_4px_12px_0px_rgba(39,38,38,0.5)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-[39px] h-[28px]">
              <svg width="39" height="28" viewBox="0 0 39 28" fill="none">
                <circle cx="25" cy="14" r="14" fill="#393939" />
                <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
              </svg>
            </div>
            <span className="font-['Poppins'] font-semibold text-[20px] text-white">
              Utopia
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/teachers"
              className="flex items-center gap-1 text-white font-['Poppins'] font-medium text-[16px] hover:text-gray-300 transition"
            >
              {t('nav.instructors')}
              <ChevronDown className="w-4 h-4" />
            </Link>
            <Link
              to="/teachers?view=categories"
              className="flex items-center gap-1 text-white font-['Poppins'] font-medium text-[16px] hover:text-gray-300 transition"
            >
              {t('nav.allCategories')}
              <ChevronDown className="w-4 h-4" />
            </Link>
            <Link
              to="/plans"
              className="text-white font-['Poppins'] font-medium text-[16px] hover:text-gray-300 transition"
            >
              {t('nav.viewPlans')}
            </Link>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/teachers"
              className="w-[39.5px] h-[39.5px] rounded border border-white flex items-center justify-center hover:bg-white/10 transition"
            >
              <Search className="w-5 h-5 text-white" />
            </Link>

            <ThemeToggle />
            <LanguageSwitcher />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-['Poppins'] font-medium text-sm">
                    {user.first_name}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t('common.dashboard')}
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <BookOpen className="w-4 h-4" />
                      {t('nav.myBookings')}
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      {t('common.settings')}
                    </Link>
                    <hr className="my-1 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded border border-white text-white font-['Poppins'] font-medium text-[16px] hover:bg-white/10 transition"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 rounded bg-white text-[#131313] font-['Poppins'] font-medium text-[16px] hover:bg-gray-100 transition"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#131313] border-t border-gray-700 pb-4">
          <div className="px-4 pt-4 space-y-3">
            <Link
              to="/teachers"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white font-['Poppins'] font-medium text-[16px]"
            >
              {t('nav.instructors')}
            </Link>
            <Link
              to="/teachers?view=categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white font-['Poppins'] font-medium text-[16px]"
            >
              {t('nav.allCategories')}
            </Link>
            <Link
              to="/plans"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white font-['Poppins'] font-medium text-[16px]"
            >
              {t('nav.viewPlans')}
            </Link>
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <hr className="border-gray-700" />
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white font-['Poppins'] font-medium"
                >
                  {t('common.dashboard')}
                </Link>
                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white font-['Poppins'] font-medium"
                >
                  {t('nav.myBookings')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-red-400 font-['Poppins'] font-medium"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 border border-white rounded text-white"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 bg-white rounded text-[#131313]"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
