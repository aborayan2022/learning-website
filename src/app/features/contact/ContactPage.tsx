import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSubmitted(true);
    toast.success(t('contact.successTitle'));
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.emailUs'), value: t('contact.emailAddress') },
    { icon: Phone, label: t('contact.callUs'), value: t('contact.phoneNumber') },
    { icon: MapPin, label: t('contact.visitUs'), value: t('contact.address') },
    { icon: Clock, label: t('contact.workingHours'), value: t('contact.workingHoursValue') },
  ];

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313] dark:text-white mb-2">
          {t('contact.successTitle')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] mb-6">
          {t('contact.successMessage')}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
          }}
          className="px-5 py-2.5 bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-[#2a2a2a] dark:hover:bg-gray-100 transition text-sm"
        >
          {t('contact.sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-4xl text-[#131313] dark:text-white mb-2">
          {t('contact.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-['Poppins']">{t('contact.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-6">
            {t('contact.formTitle')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('contact.namePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white font-['Poppins'] text-sm focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.emailPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white font-['Poppins'] text-sm focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('contact.subject')}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('contact.subjectPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white font-['Poppins'] text-sm focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-['Poppins']">
                {t('contact.message')}
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.messagePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#131313] dark:text-white font-['Poppins'] text-sm focus:ring-2 focus:ring-[#131313] dark:focus:ring-white focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-[#2a2a2a] dark:hover:bg-gray-100 transition text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#131313] dark:text-white mb-4">
            {t('contact.infoTitle')}
          </h2>
          <div className="space-y-4">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-['Poppins'] font-medium text-[#131313] dark:text-white text-sm">{label}</p>
                  <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
