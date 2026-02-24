import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  Search,
  Rocket,
  Calendar,
  CreditCard,
  UserCog,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';

export default function HelpPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: Rocket, title: t('help.gettingStarted'), desc: t('help.gettingStartedDesc') },
    { icon: Calendar, title: t('help.bookingsHelp'), desc: t('help.bookingsHelpDesc') },
    { icon: CreditCard, title: t('help.paymentsHelp'), desc: t('help.paymentsHelpDesc') },
    { icon: UserCog, title: t('help.accountHelp'), desc: t('help.accountHelpDesc') },
    { icon: GraduationCap, title: t('help.teacherHelp'), desc: t('help.teacherHelpDesc') },
  ];

  const faqs = [
    { q: t('help.faq1Q'), a: t('help.faq1A') },
    { q: t('help.faq2Q'), a: t('help.faq2A') },
    { q: t('help.faq3Q'), a: t('help.faq3A') },
    { q: t('help.faq4Q'), a: t('help.faq4A') },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h1 className="font-['Source_Sans_Pro'] font-bold text-4xl text-[#131313] dark:text-white mb-2">
          {t('help.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-['Poppins']">{t('help.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg mx-auto mb-12">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('help.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-[#131313] dark:text-white font-['Poppins'] focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
        />
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {categories.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition cursor-pointer"
            >
              <Icon className="w-6 h-6 text-gray-400 mb-3" />
              <h3 className="font-['Poppins'] font-semibold text-[#131313] dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-['Poppins']">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="font-['Source_Sans_Pro'] font-bold text-2xl text-[#131313] dark:text-white mb-6">
          {t('help.faq')}
        </h2>
        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-['Poppins'] font-medium text-[#131313] dark:text-white">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-[#131313] dark:bg-white rounded-2xl p-8 text-center">
        <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <h2 className="font-['Poppins'] font-semibold text-xl text-white dark:text-[#131313] mb-2">
          {t('help.stillNeedHelp')}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 font-['Poppins'] text-sm mb-5">
          {t('help.stillNeedHelpDesc')}
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#131313] text-[#131313] dark:text-white font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition text-sm"
        >
          {t('help.contactSupport')}
        </Link>
      </div>
    </div>
  );
}
