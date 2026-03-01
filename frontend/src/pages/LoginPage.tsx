import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, Zap, Globe } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';

export default function LoginPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const features = [
    { icon: GraduationCap, text: 'Track scholarship applications' },
    { icon: Shield, text: 'Secure document management' },
    { icon: Zap, text: 'Auto-fill forms from your profile' },
    { icon: Globe, text: 'Multilingual support (EN/HI)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/scholarpath-logo.dim_128x128.png"
            alt="ScholarPath Logo"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div>
            <p className="text-white font-bold text-lg leading-tight">{t('nav.appName')}</p>
            <p className="text-teal-300 text-xs">{t('nav.tagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Hero */}
          <div className="text-white space-y-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3">{t('login.title')}</h1>
              <p className="text-teal-200 text-lg leading-relaxed">{t('login.subtitle')}</p>
            </div>

            <div className="space-y-3">
              {features.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-saffron/20 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-saffron" />
                  </div>
                  <span className="text-teal-100 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Hero banner */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/dashboard-hero-banner.dim_1200x300.png"
                alt="ScholarPath Dashboard"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Login card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-teal-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Login</h2>
              <p className="text-gray-500 text-sm">{t('login.description')}</p>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 h-12 text-base rounded-xl"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('login.loggingIn')}
                </span>
              ) : (
                t('login.button')
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                By logging in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-center text-gray-500">
                🔒 Powered by Internet Computer Protocol — your data is secure and decentralized
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-teal-400 text-xs">
        © {new Date().getFullYear()} {t('nav.appName')} · Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            window.location.hostname || 'scholarpath'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-saffron hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
