import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 font-semibold text-xs px-3 py-1.5 h-8"
      title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
    </Button>
  );
}
