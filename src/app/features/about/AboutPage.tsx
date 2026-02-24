import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Target, Eye, Search, CalendarCheck, TrendingUp, Users, BookOpen, Star } from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, title: t('about.step1Title'), desc: t('about.step1Desc') },
    { icon: CalendarCheck, title: t('about.step2Title'), desc: t('about.step2Desc') },
    { icon: TrendingUp, title: t('about.step3Title'), desc: t('about.step3Desc') },
  ];

  const stats = [
    { value: '5,800+', label: t('about.statsStudents'), icon: Users },
    { value: '250+', label: t('about.statsTeachers'), icon: BookOpen },
    { value: '12,000+', label: t('about.statsBookings'), icon: CalendarCheck },
    { value: '4.8', label: t('about.statsRating'), icon: Star },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-4xl sm:text-5xl text-[#131313] dark:text-white mb-4">
          {t('about.title')}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-['Poppins'] max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="font-['Poppins'] font-semibold text-xl text-[#131313] dark:text-white mb-3">
            {t('about.missionTitle')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] leading-relaxed">
            {t('about.missionText')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-purple-500" />
          </div>
          <h2 className="font-['Poppins'] font-semibold text-xl text-[#131313] dark:text-white mb-3">
            {t('about.visionTitle')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] leading-relaxed">
            {t('about.visionText')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map(({ value, label, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center"
          >
            <Icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-[#131313] dark:text-white font-['Poppins']">
              {value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-['Poppins'] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313] dark:text-white text-center mb-10">
          {t('about.howItWorksTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center"
            >
              <div className="w-10 h-10 bg-[#131313] dark:bg-white text-white dark:text-[#131313] rounded-full flex items-center justify-center mx-auto mb-4 font-['Poppins'] font-bold">
                {i + 1}
              </div>
              <Icon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-['Poppins'] font-semibold text-[#131313] dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-['Poppins']">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#131313] dark:bg-white rounded-2xl p-8 sm:p-12 text-center">
        <h2 className="font-['Source_Sans_Pro'] font-bold text-2xl sm:text-3xl text-white dark:text-[#131313] mb-4">
          {t('home.readyToStart')}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 font-['Poppins'] mb-6 max-w-lg mx-auto">
          {t('home.readySubtitle')}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/teachers"
            className="px-6 py-3 bg-white dark:bg-[#131313] text-[#131313] dark:text-white font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition text-sm"
          >
            {t('nav.findTeachers')}
          </Link>
          <Link
            to="/auth/register"
            className="px-6 py-3 border border-gray-600 dark:border-gray-300 text-white dark:text-[#131313] font-['Poppins'] font-medium rounded-lg hover:bg-white/5 dark:hover:bg-gray-100 transition text-sm"
          >
            {t('home.getStarted')}
          </Link>
        </div>
      </div>
    </div>
  );
}
