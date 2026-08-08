import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '30px',
        padding: '4px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button
        onClick={() => setLanguage('en')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          border: 'none',
          background: language === 'en' ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
          color: language === 'en' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: language === 'en' ? '0 2px 10px rgba(56, 189, 248, 0.4)' : 'none',
        }}
      >
        <span>🇺🇸</span>
        <span>EN</span>
      </button>

      <button
        onClick={() => setLanguage('ar')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          border: 'none',
          background: language === 'ar' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
          color: language === 'ar' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: language === 'ar' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
        }}
      >
        <span>🇸🇦</span>
        <span>العربية</span>
      </button>
    </div>
  );
};
