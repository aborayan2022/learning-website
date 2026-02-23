import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CreditCard, Shield, Smartphone, CheckCircle, ArrowLeft, Bell } from 'lucide-react';

/**
 * PaymentPage — Placeholder / Coming Soon
 *
 * Strategy:
 * - All payment logic is DISABLED (no API calls, no form submissions)
 * - The UI informs the user the feature is coming soon
 * - The component is fully modular so payment can be enabled later:
 *   1. Add a PaymentForm child component
 *   2. Create payment.service.ts + payment.store.ts
 *   3. Toggle the PAYMENT_ENABLED flag to `true`
 * - Zero runtime errors — no broken imports or dead API calls
 */

// Feature flag — flip to true when payment backend is ready
const PAYMENT_ENABLED = false;

export default function PaymentPage() {
  const { t } = useTranslation();

  if (PAYMENT_ENABLED) {
    // Future: render the actual payment flow here
    // return <PaymentFlow />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Icon */}
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <CreditCard className="w-10 h-10 text-gray-400" />
      </div>

      <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-gray-900 dark:text-white mb-3">
        {t('payment.comingSoonTitle')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] mb-10 max-w-md mx-auto">
        {t('payment.comingSoonMessage')}
      </p>

      {/* Features preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-['Poppins'] font-semibold text-sm text-gray-900 dark:text-white mb-1">
            {t('payment.features.secure')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {t('payment.features.secureDesc')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <Smartphone className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-['Poppins'] font-semibold text-sm text-gray-900 dark:text-white mb-1">
            {t('payment.features.multiple')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {t('payment.features.multipleDesc')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-['Poppins'] font-semibold text-sm text-gray-900 dark:text-white mb-1">
            {t('payment.features.instant')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {t('payment.features.instantDesc')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-['Poppins'] font-semibold opacity-50 cursor-not-allowed"
        >
          <Bell className="w-4 h-4" />
          {t('payment.notifyMe')}
        </button>
        <Link
          to="/bookings"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-['Poppins'] font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('payment.backToBookings')}
        </Link>
      </div>
    </div>
  );
}
