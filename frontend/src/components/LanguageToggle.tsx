import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'HI' },
  { code: 'ta', label: 'தமிழ்', short: 'TA' },
  { code: 'te', label: 'తెలుగు', short: 'TE' },
];

export default function LanguageToggle() {
  const [current, setCurrent] = useState('en');
  const [open, setOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === current) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
          bg-sidebar-accent text-sidebar-foreground hover:bg-white/15
          transition-all duration-150 ease-in-out cursor-pointer
          border border-sidebar-border/50
        "
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span>{currentLang.short}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrent(lang.code);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-1.5 text-sm cursor-pointer
                  transition-colors duration-100
                  ${current === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
