import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');

  // Profile form
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  const handleProfileSave = () => {
    // TODO: Call API to update profile
    toast.success(t('settings.savedSuccessfully'));
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordsNoMatch'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('auth.minPassword'));
      return;
    }
    // TODO: Call API to change password
    toast.success(t('settings.savedSuccessfully'));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const tabs = [
    { id: 'profile' as const, label: t('settings.profile'), icon: User },
    { id: 'preferences' as const, label: t('settings.preferences'), icon: Palette },
    { id: 'notifications' as const, label: t('settings.notifications'), icon: Bell },
    { id: 'security' as const, label: t('settings.security'), icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313] dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-['Poppins']">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-['Poppins'] font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === id
                ? 'border-[#131313] dark:border-white text-[#131313] dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-1">
            {t('settings.profile')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('settings.profileDesc')}</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                  {t('auth.lastName')}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('settings.emailAddress')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('settings.phoneNumber')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
              />
            </div>

            <button
              onClick={handleProfileSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-[#2a2a2a] dark:hover:bg-gray-100 transition text-sm"
            >
              <Save className="w-4 h-4" />
              {t('settings.updateProfile')}
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-1">
            {t('settings.preferences')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('settings.preferencesDesc')}</p>

          <div className="space-y-6">
            {/* Language */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-['Poppins'] font-medium text-[#131313] dark:text-white">
                  {t('settings.language')}
                </p>
              </div>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white text-sm focus:ring-2 focus:ring-[#131313] outline-none"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-['Poppins'] font-medium text-[#131313] dark:text-white">
                  {t('settings.darkMode')}
                </p>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-[#131313]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    theme === 'dark' ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-1">
            {t('settings.notifications')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('settings.notificationsDesc')}</p>

          <div className="space-y-4">
            {[
              { label: t('settings.emailNotifications'), value: emailNotifications, setter: setEmailNotifications },
              { label: t('settings.bookingReminders'), value: bookingReminders, setter: setBookingReminders },
              { label: t('settings.promotionalEmails'), value: promotionalEmails, setter: setPromotionalEmails },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <span className="font-['Poppins'] text-[#131313] dark:text-white">{label}</span>
                <button
                  onClick={() => setter(!value)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-[#131313] dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform ${
                      value ? 'translate-x-5 bg-white dark:bg-[#131313]' : 'bg-white'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-1">
            {t('settings.security')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('settings.securityDesc')}</p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('settings.currentPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('settings.newPassword')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('settings.confirmNewPassword')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
              />
            </div>

            <button
              onClick={handlePasswordChange}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-[#2a2a2a] dark:hover:bg-gray-100 transition text-sm"
            >
              <Shield className="w-4 h-4" />
              {t('settings.changePassword')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
