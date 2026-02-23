import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#131313] px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-7xl font-bold text-white mb-2 font-['Poppins']">404</h1>
        <h2 className="text-xl font-semibold text-white mb-2 font-['Poppins']">
          {t('common.pageNotFound', 'Page Not Found')}
        </h2>
        <p className="text-gray-400 mb-8 font-['Poppins']">
          {t('common.pageNotFoundDesc', "The page you're looking for doesn't exist or has been moved.")}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
          >
            <Home className="w-4 h-4" />
            {t('common.goHome', 'Go Home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-3 border border-gray-600 text-white font-['Poppins'] font-medium rounded-lg hover:bg-white/5 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.goBack', 'Go Back')}
          </button>
        </div>
      </div>
    </div>
  );
}
