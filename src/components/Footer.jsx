import { Link } from 'react-router-dom';
import CONFIG from '../config';

const Footer = () => (
  <footer className="bg-[#FF4500] relative overflow-hidden border-t-[8px] border-[#111111]">
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12">

      <div className="md:col-span-5 flex flex-col justify-center relative">
        <div className="absolute top-10 left-10 bg-black/10 blur-2xl w-32 h-32 rounded-full"/>
        <img
          src="/assets/images/TAG PRIMARY LOGO.png"
          alt="TAG Logo"
          className="h-32 md:h-40 mb-8 object-contain origin-left relative z-10"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <h2 className="hidden text-white font-heading font-black text-4xl tracking-widest uppercase mb-8">
          TAG <span className="text-[#111111]">.</span>
        </h2>
        <p className="text-white text-[15px] leading-relaxed max-w-sm font-medium">
          The Auction Guy. Securing your ideal vehicle without you lifting a finger.
        </p>
      </div>

      <div className="md:col-span-3 flex flex-col gap-5 pt-4">
        <h4 className="text-white font-heading font-black text-xl tracking-widest uppercase mb-4 border-b-2 border-white/30 pb-3 inline-block w-max">
          Navigation
        </h4>
        {[
          { to: '/',                  label: 'Home'         },
          { to: '/about',             label: 'About Us'     },
          { to: '/services',          label: 'Our Services' },
          { to: '/contact',           label: 'Contact'      },
          { to: '/book-appointment',  label: 'Book Appointment' },
          { to: '/get-quote',         label: 'Get a Quote'  },
        ].map(({ to, label }) => (
          <Link key={to} to={to} className="text-white hover:text-[#111111] hover:translate-x-2 transition-all text-sm font-bold uppercase tracking-[0.15em] w-max">
            {label}
          </Link>
        ))}
        <div className="border-t border-white/20 pt-5 flex flex-col gap-3">
          {[
            { to: '/terms',   label: 'Terms & Conditions' },
            { to: '/privacy', label: 'Privacy Policy'     },
            { to: '/cookies', label: 'Cookie Policy'      },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-white/60 hover:text-white hover:translate-x-2 transition-all text-[11px] font-bold uppercase tracking-[0.12em] w-max">
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="md:col-span-4 flex flex-col gap-5 pt-4">
        <h4 className="text-white font-heading font-black text-xl tracking-widest uppercase mb-4 border-b-2 border-white/30 pb-3 inline-block w-max">
          Get In Touch
        </h4>
        <div className="text-white text-sm leading-loose">
          <p className="font-black text-white uppercase tracking-[0.15em] text-base">The Auction Guy</p>
          <p className="text-white/90 uppercase tracking-widest text-[11px] mb-5 font-bold">The Auction Guy</p>
          <div className="space-y-3 font-medium">
            <p className="flex items-center gap-4">
              <span className="text-[#111111] font-black tracking-widest w-8">PH:</span>
              <a href={CONFIG.brand.phoneHref} className="hover:text-[#111111] transition-colors text-white">{CONFIG.brand.phone}</a>
            </p>
            <p className="flex items-center gap-4">
              <span className="text-[#111111] font-black tracking-widest w-8">EM:</span>
              <a href={CONFIG.brand.emailHref} className="hover:text-[#111111] transition-colors break-all text-white text-[12px]">{CONFIG.brand.email}</a>
            </p>
            <p className="flex items-start gap-4 mt-2 pt-4 border-t border-white/30">
              <span className="text-[#111111] font-black tracking-widest w-8">HQ:</span>
              <span className="uppercase tracking-widest text-xs font-bold text-white leading-relaxed">Johannesburg,<br/>South Africa</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-[#111111] border-t border-black relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-[#A9A9A9] text-[10px] font-black uppercase tracking-[0.2em] gap-3">
        <p>&copy; {new Date().getFullYear()} TAG, The Auction Guy. All Rights Reserved.</p>
        <div className="flex gap-5">
          <Link to="/terms"   className="hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;