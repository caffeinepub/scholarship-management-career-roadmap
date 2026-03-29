import React from "react";
import { useTranslation } from "../hooks/useTranslation";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useTranslation();

  return (
    <>
      {/* Floating toggle fixed at bottom-right */}
      <button
        type="button"
        onClick={toggleLanguage}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
        style={{
          background: "oklch(0.42 0.18 265)",
          color: "oklch(0.99 0 0)",
          boxShadow: "0 4px 20px oklch(0.42 0.18 265 / 0.4)",
        }}
        aria-label={`Switch to ${language === "en" ? "Hindi" : "English"}`}
      >
        <span className="text-base">{language === "en" ? "🇮🇳" : "🇬🇧"}</span>
        <span className="font-bold tracking-wide">
          {language === "en" ? "EN → HI" : "HI → EN"}
        </span>
      </button>
    </>
  );
}
