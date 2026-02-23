import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#131313] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <svg width="39" height="28" viewBox="0 0 39 28" fill="none">
                <circle cx="25" cy="14" r="14" fill="#393939" />
                <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
              </svg>
              <span className="font-['Poppins'] font-semibold text-[20px]">Utopia</span>
            </Link>
            <p className="text-gray-400 font-['Poppins'] text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-['Poppins'] font-semibold text-lg mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/teachers" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.findTeachers')}
                </Link>
              </li>
              <li>
                <Link to="/plans" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.subscriptionPlans')}
                </Link>
              </li>
              <li>
                <Link to="/auth/register?role=teacher" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.becomeTeacher')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-['Poppins'] font-semibold text-lg mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition text-sm">
                  {t('footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-['Poppins'] font-semibold text-lg mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                support@utopia.edu
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                +20 123 456 7890
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                Cairo, Egypt
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm font-['Poppins']">
            &copy; {new Date().getFullYear()} Utopia. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
