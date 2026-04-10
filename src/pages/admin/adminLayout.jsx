import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLogin from './adminLogin';
import CONFIG from '../../config';

const NAV_LINKS = [
  { to: '/admin',              label: 'Dashboard',    icon: '⬡' },
  { to: '/admin/appointments', label: 'Appointments', icon: '◈' },
  { to: '/admin/quotes',       label: 'Quotes',       icon: '◆' },
  { to: '/admin/enquiries',    label: 'Enquiries',    icon: '◎' },
  { to: '/admin/calendar',     label: 'Calendar',     icon: '◐' },
  { to: '/admin/slots',        label: 'Slots',        icon: '◫' },
  { to: '/admin/profile',      label: 'Profile',      icon: '◯' },
];

const AdminLayout = ({ children }) => {
  const [token,       setToken]   = useState(() => sessionStorage.getItem('tag_admin_token') || '');
  const [sidebarOpen, setSidebar] = useState(false);
  const [profile,     setProfile] = useState({ full_name: '', profile_photo: '' });
  const location = useLocation();

  useEffect(() => {
    if (!token) return;
    fetch(`${CONFIG.auth}?action=profile`, { headers: { 'X-Admin-Token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setProfile(d.data); })
      .catch(() => {});
  }, [token]);

  if (!token) return <AdminLogin onLogin={t => { sessionStorage.setItem('tag_admin_token', t); setToken(t); }} />;

  const logout   = () => { sessionStorage.removeItem('tag_admin_token'); setToken(''); };
  const photoUrl = profile.profile_photo ? `${import.meta.env.VITE_API_URL || "http://localhost/tag-api"}${profile.profile_photo}` : '';
  const initials = (profile.full_name || 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex font-sans">

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111111] border-r border-[#696969]/20 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <div className="p-6 border-b border-[#696969]/20">
          <p className="text-[#FF4500] font-black text-[10px] tracking-[0.35em] uppercase mb-3">The Auction Guy</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-[2px] border-[#696969] overflow-hidden shrink-0 bg-[#1a1a1a] flex items-center justify-center">
              {photoUrl
                ? <img src={photoUrl} alt="Admin avatar" className="w-full h-full object-cover object-center" />
                : <span className="text-[#FF4500] font-heading font-black text-[15px] leading-none">{initials}</span>
              }
            </div>
            <h1 className="text-white font-heading font-black text-[1.4rem] uppercase tracking-widest leading-none">Admin</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(link => {
            const active = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
            return (
              <Link key={link.to} to={link.to} onClick={() => setSidebar(false)}
                className={`flex items-center gap-3 px-4 py-3 font-black text-[12px] uppercase tracking-[0.18em] transition-all border-l-[3px] ${
                  active
                    ? 'text-[#FF4500] border-[#FF4500] bg-[#FF4500]/10'
                    : 'text-[#A9A9A9] border-transparent hover:text-white hover:border-[#696969]'
                }`}>
                <span className="text-[16px]">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#696969]/20">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-[#696969] hover:text-white font-black text-[11px] uppercase tracking-[0.18em] transition-colors mb-1">
            ↗ View Site
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#696969] hover:text-red-400 font-black text-[11px] uppercase tracking-[0.18em] transition-colors">
            ⊗ Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebar(false)} />
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <div className="bg-[#111111] border-b border-[#696969]/20 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebar(!sidebarOpen)} className="lg:hidden text-[#A9A9A9] hover:text-white transition-colors p-1">
            <span className="block w-5 h-0.5 bg-current mb-1" /><span className="block w-5 h-0.5 bg-current mb-1" /><span className="block w-5 h-0.5 bg-current" />
          </button>
          <div className="hidden lg:block" />
          <p className="text-[#696969] font-bold text-[12px]">
            {new Date().toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>

        <main className="flex-1 overflow-y-auto">
          {typeof children === 'function' ? children(token) : children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;