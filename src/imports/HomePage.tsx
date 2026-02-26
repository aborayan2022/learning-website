import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../app/components/layout/Navbar';
import { Footer } from '../app/components/layout/Footer';
import { Star, BookOpen, Users, Award, MessageCircle, ArrowRight, Heart, Sparkles } from 'lucide-react';

const HERO_BG = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80';
const HERO_SIDE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80';
const INSTRUCTOR_1 = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80';
const INSTRUCTOR_2 = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80';
const INSTRUCTOR_3 = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80';
const INSTRUCTOR_4 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
const TRAINING_1 = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80';
const TRAINING_2 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80';
const TEAM_IMG = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80';

const CATEGORIES = [
  { icon: '\u2B50', label: 'Trending', active: true },
  { icon: '\uD83C\uDFA8', label: 'Design & Style' },
  { icon: '\uD83D\uDCBC', label: 'Business' },
  { icon: '\u270D\uFE0F', label: 'Writing' },
  { icon: '\uD83C\uDFAD', label: 'Art & Entertainment' },
  { icon: '\uD83C\uDFE0', label: 'Home & Lifestyle' },
  { icon: '\uD83C\uDFB5', label: 'Music' },
  { icon: '\uD83C\uDF73', label: 'Food' },
  { icon: '\uD83D\uDD2C', label: 'Science & Tech' },
];

const INTEREST_TAGS = [
  'professionalSkills',
  'musician',
  'becomeTutor',
  'greatMusician',
  'become',
  'becomeChef',
  'designingSkills',
  'others',
] as const;

const INSTRUCTORS = [
  { name: 'Daniel H. Pink', role: 'American Writer', img: INSTRUCTOR_1, badge: 'Popular' },
  { name: 'Paul Krugman', role: 'American Economist', img: INSTRUCTOR_2, badge: 'New' },
  { name: 'Sarah Johnson', role: 'Design Instructor', img: INSTRUCTOR_3, badge: 'Popular' },
  { name: 'Ahmed Hassan', role: 'Tech Educator', img: INSTRUCTOR_4, badge: 'Featured' },
];

const FEATURES = [
  {
    icon: BookOpen,
    titleKey: 'New Training Every Month',
    desc: 'Opportunity to add new trainings uploaded every month at no additional cost!',
  },
  {
    icon: MessageCircle,
    titleKey: 'Live Q&A with All Trainers',
    desc: 'Ask your questions by participating in the live question and answer activities.',
  },
  {
    icon: Award,
    titleKey: '+70 Training Programs',
    desc: 'More than 70 trainings prepared by the "best" in their field!',
  },
];

const TypewriterText = ({ phrases }: { phrases: string[] }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  // Main typing logic
  useEffect(() => {
    if (index === phrases.length) return;

    if (subIndex === phrases[index].length + 1 && !reverse) {
      // Pause at the end of typing
      const timeout = setTimeout(() => setReverse(true), 2500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      // Move to next phrase after deleting
      setReverse(false);
      setIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 120);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, phrases]);

  return (
    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400">
      {`${phrases[index].substring(0, subIndex)}`}
      <span className={`inline-block w-[4px] h-[0.9em] bg-indigo-600 dark:bg-indigo-300 ml-1 translate-y-[2px] ${blink ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
};

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative bg-[#131313] overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-[rgba(19,19,19,0.92)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-['Source_Sans_Pro',sans-serif] font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-[62px] text-white leading-tight">
                {t('home.heroTitle1')}
                <br />
                {t('home.heroTitle2')}
              </h1>
              <p className="mt-3 text-gray-300 font-['Poppins',sans-serif] text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
              <div className="mt-3 h-[3px] w-[180px] sm:w-[280px] bg-white" />

              <div className="mt-6">
                <h2 className="font-['Source_Sans_Pro',sans-serif] font-bold text-xl sm:text-2xl lg:text-[32px] text-white leading-tight">
                  {t('home.whatBringsYou')}
                </h2>
                <p className="mt-1 text-gray-400 font-['Poppins',sans-serif] text-sm sm:text-base lg:text-lg">
                  {t('home.chooseManyAsYouWant')}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {INTEREST_TAGS.map((key) => (
                    <button
                      key={key}
                      className="px-4 py-2 rounded-lg border border-white/30 text-white font-['Poppins',sans-serif] text-xs sm:text-sm hover:bg-white/10 transition"
                    >
                      {t(`home.${key}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative w-full max-w-sm ml-auto aspect-[4/5] lg:aspect-[3.5/4]">
                <img src={HERO_SIDE} alt="Students collaborating" className="w-full h-full object-cover rounded-2xl shadow-2xl" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* START YOUR JOURNEY CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-white dark:bg-gray-950 text-center">
        {/* Background Decorative Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-400/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>ابدأ الآن واستفد من العروض القائمة</span>
          </div>

          <h2 className="font-['Source_Sans_Pro',sans-serif] font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-[72px] text-[#131313] dark:text-white leading-tight min-h-[1.2em]">
            <TypewriterText phrases={[
              t('home.startJourney'),
              t('home.learnFromBest'),
              "كُن أفضل نسخة من نفسك"
            ]} />
          </h2>

          <p className="mt-6 text-gray-500 dark:text-gray-400 font-['Poppins',sans-serif] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            انضم إلى آلاف الطلاب الذين غيروا حياتهم بالتعلم من خلال خبراء يوتوبيا.
          </p>

          <Link
            to="/teachers"
            className="group relative inline-flex items-center gap-3 mt-10 px-10 py-4 sm:py-5 bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-['Poppins',sans-serif] font-bold text-lg sm:text-xl rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-indigo-500/20"
          >
            {/* Shiny background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <span>{t('home.exploreClasses')}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-12 flex justify-center items-center gap-6 grayscale opacity-50 dark:invert">
             {/* Simple list of brand placeholders to make it look "established" */}
             <div className="text-sm font-bold tracking-widest text-gray-400">TRUSTED BY 500+ SCHOOLS</div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.titleKey}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex items-start gap-4 hover:shadow-lg transition"
              >
                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-[#131313] dark:text-white" />
                </div>
                <div>
                  <h3 className="font-['Poppins',sans-serif] font-semibold text-base sm:text-lg text-black dark:text-white">{f.titleKey}</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400 font-['Poppins',sans-serif] text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 sm:py-20 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Source_Sans_Pro',sans-serif] font-bold text-3xl sm:text-4xl lg:text-5xl text-white text-center leading-snug">
            {t('home.topCategories')}
          </h2>
          <p className="mt-3 text-gray-400 text-center font-['Poppins',sans-serif] text-base sm:text-lg">
            {t('home.broadSelection')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-['Poppins',sans-serif] text-sm sm:text-base transition ${
                  cat.active ? 'border border-white bg-transparent' : 'bg-[#2e2e2e] hover:bg-[#3a3a3a]'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {INSTRUCTORS.map((inst) => (
              <div key={inst.name} className="bg-white rounded-xl overflow-hidden group cursor-pointer hover:shadow-xl transition">
                <div className="relative h-52 sm:h-64 overflow-hidden">
                  <img src={inst.img} alt={inst.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute top-3 right-3 bg-white/80 text-black text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded">{inst.badge}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-['Poppins',sans-serif] font-bold text-lg sm:text-xl text-black">{inst.name}</h4>
                  <p className="text-gray-500 font-['Poppins',sans-serif] text-sm">{inst.role}</p>
                  <p className="text-gray-400 text-xs mt-1">2 hour 58 minutes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR TRAINERS */}
      <section className="py-16 sm:py-20 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Source_Sans_Pro',sans-serif] font-semibold text-2xl sm:text-3xl lg:text-4xl text-white mb-8">
            {t('home.topInstructors')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INSTRUCTORS.map((inst, i) => (
              <Link key={`trainer-${i}`} to="/teachers" className="relative h-72 sm:h-96 rounded-xl overflow-hidden group block">
                <img src={inst.img} alt={inst.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-['Poppins',sans-serif] font-bold text-lg sm:text-xl leading-tight">
                    Group Culture and Musician Education
                  </h3>
                  <p className="font-['Poppins',sans-serif] text-sm text-gray-300 mt-1">{inst.name}</p>
                  <span className="mt-3 inline-block px-4 py-2 border border-white/60 rounded-lg text-white text-xs sm:text-sm font-['Poppins',sans-serif] hover:bg-white/10 transition">
                    View Tutorial
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW AND POPULAR TRAININGS */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Source_Sans_Pro',sans-serif] font-semibold text-2xl sm:text-3xl lg:text-4xl text-[#131313] dark:text-white mb-8 text-center">
            New and Popular Trainings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[TRAINING_1, TRAINING_2].map((img, i) => (
              <div key={i} className="relative h-64 sm:h-80 lg:h-[438px] rounded-xl overflow-hidden group cursor-pointer">
                <img src={img} alt="Training" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-black/40" />
                <button className="absolute top-4 left-4 text-white hover:text-red-400 transition">
                  <Heart className="w-7 h-7" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex items-end justify-between">
                  <div>
                    <h3 className="font-['Poppins',sans-serif] font-semibold text-lg sm:text-2xl text-white leading-tight">
                      Climate Change: Cause<br />and Solution
                    </h3>
                  </div>
                  <span className="font-['Poppins',sans-serif] font-bold text-xl sm:text-2xl text-white shrink-0 ml-4">$40.90</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/teachers"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#131313] dark:border-white text-[#131313] dark:text-white rounded-lg font-['Poppins',sans-serif] font-medium text-base hover:bg-[#131313] hover:text-white dark:hover:bg-white dark:hover:text-[#131313] transition"
            >
              Show More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TEAM / CTA SECTION */}
      <section className="py-16 sm:py-20 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <img src={TEAM_IMG} alt="Team collaboration" className="w-full h-64 sm:h-80 lg:h-[400px] object-cover rounded-xl" loading="lazy" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-['Source_Sans_Pro',sans-serif] font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                Let your team learn from the best names
              </h2>
              <Link
                to="/auth/register"
                className="inline-block mt-8 px-6 py-3 sm:py-4 bg-white text-[#131313] font-['Poppins',sans-serif] font-medium text-base sm:text-lg rounded-xl hover:bg-gray-100 transition"
              >
                Let Us Contact You
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Source_Sans_Pro',sans-serif] font-semibold text-2xl sm:text-3xl lg:text-[45px] text-[#131313] dark:text-white text-center mb-10">
            {t('home.testimonials')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#2e2e2e] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -top-12 -right-8 w-40 h-40 rounded-full bg-gray-400/10" />
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gray-400/10" />
                <div className="relative">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/80 font-['Poppins',sans-serif] text-sm sm:text-base leading-relaxed mb-6">
                    "This platform transformed my learning experience. The trainers are world-class and the interactive sessions make complex topics easy to understand."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                      {i === 1 ? 'S' : 'A'}
                    </div>
                    <div>
                      <p className="text-white font-['Poppins',sans-serif] font-semibold text-sm">
                        {i === 1 ? 'Sarah Mitchell' : 'Ahmed Omar'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {i === 1 ? 'Design Student' : 'Business Graduate'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-['Source_Sans_Pro',sans-serif] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#131313] dark:text-white">
            {t('home.readyToStart')}
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-['Poppins',sans-serif] text-base sm:text-lg">
            {t('home.readySubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/auth/register"
              className="px-8 py-3 bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-['Poppins',sans-serif] font-semibold rounded-xl hover:opacity-90 transition"
            >
              {t('home.getStarted')}
            </Link>
            <Link
              to="/teachers"
              className="px-8 py-3 border border-[#131313] dark:border-white text-[#131313] dark:text-white font-['Poppins',sans-serif] font-medium rounded-xl hover:bg-[#131313] hover:text-white dark:hover:bg-white dark:hover:text-[#131313] transition"
            >
              {t('home.browseCourses')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
