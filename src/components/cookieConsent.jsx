import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'tag_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value) => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ consent: value, date: new Date().toISOString() }));
      setVisible(false);
      setLeaving(false);
    }, 350);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={`fixed bottom-0 left-0 right-0 z-[200] transition-transform duration-350 ease-in-out ${leaving ? 'translate-y-full' : 'translate-y-0'}`}
    >
      <div className="bg-[#111111] border-t-[4px] border-[#FF4500] shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">

          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-9 h-9 bg-[#FF4500]/15 border border-[#FF4500]/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[#FF4500] font-black text-[15px]">◈</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-[13px] uppercase tracking-[0.12em] mb-1.5">We use cookies</p>
              <p className="text-[#A9A9A9] font-bold text-[12px] leading-[1.7]">
                This site uses essential cookies to keep the booking and quote forms working, and optional analytics cookies to help us understand how visitors use the site — no advertising or tracking.{' '}
                <Link to="/cookies" className="text-[#FF4500] hover:underline whitespace-nowrap">Cookie Policy</Link>
                {' '}·{' '}
                <Link to="/privacy" className="text-[#FF4500] hover:underline whitespace-nowrap">Privacy Policy</Link>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => dismiss('essential_only')}
              className="flex-1 md:flex-none px-5 py-3 border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[11px] uppercase tracking-[0.18em] hover:border-[#808080] hover:text-white transition-all whitespace-nowrap">
              Essential Only
            </button>
            <button
              onClick={() => dismiss('all')}
              className="flex-1 md:flex-none px-6 py-3 bg-[#FF4500] text-white font-black text-[11px] uppercase tracking-[0.18em] hover:bg-[#E63F00] transition-colors whitespace-nowrap border-[2px] border-[#FF4500]">
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;