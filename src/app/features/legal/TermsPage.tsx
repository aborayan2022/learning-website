import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const { t } = useTranslation();

  const sections = [
    { title: t('terms.section1Title'), text: t('terms.section1Text') },
    { title: t('terms.section2Title'), text: t('terms.section2Text') },
    { title: t('terms.section3Title'), text: t('terms.section3Text') },
    { title: t('terms.section4Title'), text: t('terms.section4Text') },
    { title: t('terms.section5Title'), text: t('terms.section5Text') },
    { title: t('terms.section6Title'), text: t('terms.section6Text') },
    { title: t('terms.section7Title'), text: t('terms.section7Text') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        <h1 className="font-['Source_Sans_Pro'] font-bold text-4xl text-[#131313] dark:text-white mb-2">
          {t('terms.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-['Poppins']">
          {t('terms.lastUpdated')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8">
        <p className="text-gray-600 dark:text-gray-300 font-['Poppins'] leading-relaxed mb-8">
          {t('terms.intro')}
        </p>

        <div className="space-y-8">
          {sections.map(({ title, text }, i) => (
            <div key={i}>
              <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-2">
                {i + 1}. {title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
