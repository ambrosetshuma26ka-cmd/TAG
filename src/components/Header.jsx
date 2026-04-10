import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const close = () => setMobileOpen(false);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/',        label: 'Home'     },
    { to: '/about',   label: 'About'    },
    { to: '/services',label: 'Services' },
    { to: '/contact', label: 'Contact'  },
  ];

  return (
    <header className="fixed w-full top-0 z-50 flex flex-col shadow-2xl">

      {/* ── Top accent ── */}
      <div className="bg-[#111111] w-full h-1.5" />

      {/* ── Utility bar ── */}
      <div className="bg-[#111111] border-b border-[#333333] hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-10 flex justify-between items-center text-[11px] font-bold tracking-widest text-[#D3D3D3] uppercase">
          <span>Johannesburg, South Africa</span>
          <div className="flex gap-8">
            <a href="tel:+27711696716" className="hover:text-white transition-colors flex items-center gap-2">
              <span className="text-[#FF4500]">P:</span> 071 169 6716
            </a>
            <a href="mailto:info@theauctionguyza.co.za" className="hover:text-white transition-colors flex items-center gap-2">
              <span className="text-[#FF4500]">E:</span> info@theauctionguyza.co.za
            </a>
          </div>
        </div>
      </div>

      {/* ── Main nav ── */}
      <div className="bg-[#FF4500]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center group relative">
            <div className="absolute inset-0 bg-black/10 blur-xl rounded-full scale-150" />
            <img
              src="/assets/images/TAG PRIMARY LOGO.png"
              alt="TAG Logo"
              className="h-16 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
            />
            <span className="hidden relative z-10 text-white font-heading font-bold text-2xl tracking-widest uppercase">
              TAG <span className="text-[#111111]">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`text-[13px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  isActive(link.to)
                    ? 'text-[#111111] border-b-2 border-[#111111] pb-0.5'
                    : 'text-white hover:text-[#111111]'
                }`}>
                {link.label}
              </Link>
            ))}

            {/* Get Quote — secondary CTA */}
            <Link to="/get-quote"
              className="ml-2 bg-white/20 text-white border-[2px] border-white/60 px-5 py-2.5 text-[12px] font-black uppercase tracking-[0.18em] hover:bg-white hover:text-[#FF4500] transition-all duration-300">
              Get Quote
            </Link>

            {/* Book Appointment — primary CTA */}
            <Link to="/book-appointment"
              className="bg-[#111111] text-white px-7 py-3 text-[13px] font-black uppercase tracking-[0.15em] hover:bg-[#333333] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 border border-[#111111] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4500]" />
              Book Appointment
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div className={`md:hidden bg-[#111111] border-t-[3px] border-[#FF4500] overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={close}
              className={`py-3 px-4 font-black text-[13px] uppercase tracking-[0.2em] border-l-[4px] transition-all duration-300 ${
                isActive(link.to)
                  ? 'text-[#FF4500] border-[#FF4500] bg-[#FF4500]/10'
                  : 'text-[#D3D3D3] border-transparent hover:text-[#FF4500] hover:border-[#FF4500]'
              }`}>
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3 border-t border-[#696969] mt-2">
            <Link to="/get-quote" onClick={close}
              className="py-3 px-4 bg-[#696969] text-white font-black text-[13px] uppercase tracking-[0.2em] text-center hover:bg-[#808080] transition-colors">
              Get Quote
            </Link>
            <Link to="/book-appointment" onClick={close}
              className="py-4 px-4 bg-[#FF4500] text-white font-black text-[13px] uppercase tracking-[0.2em] text-center hover:bg-[#E63F00] transition-colors flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              Book Appointment
            </Link>
            <a href="tel:+27711696716" className="py-3 px-4 text-[#A9A9A9] font-bold text-[12px] uppercase tracking-[0.2em] text-center hover:text-white transition-colors">
              071 169 6716
            </a>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;