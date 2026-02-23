import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="w-[39.5px] h-[39.5px] rounded border border-white/30 flex items-center justify-center hover:bg-white/10 transition"
      aria-label="Switch language"
      title={i18n.language === 'ar' ? 'English' : 'العربية'}
    >
      <Languages className="w-5 h-5 text-white" />
    </button>
  );
}
