import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
  ];

  return (
    <div className="glass-card" id="faq" style={{ padding: '36px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 16px', borderRadius: '20px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
          <HelpCircle size={16} /> FAQ
        </div>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('faqTitle')}</h3>
        <p style={{ color: 'var(--text-muted)' }}>{t('faqSubtitle')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.05rem',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <span>{faq.q}</span>
              <ChevronDown
                size={20}
                style={{
                  transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  color: '#38bdf8',
                }}
              />
            </button>
            {openIdx === idx && (
              <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
