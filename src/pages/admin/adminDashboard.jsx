import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';

const AdminDashboard = () => (
  <AdminLayout>{(token) => <DashContent token={token} />}</AdminLayout>
);

const DashContent = ({ token }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CONFIG.api.admin.dashboard, { headers: { 'X-Admin-Token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-10 text-[#A9A9A9] font-bold text-center py-24">Loading dashboard…</div>;
  if (!data)   return <div className="p-10 text-red-400 font-bold">Failed to load dashboard. Check API connection.</div>;

  const { stats, upcoming } = data;

  const statCards = [
    { label: 'Appointments Today',   value: stats.appointmentsToday,                                        accent: true,  link: '/admin/appointments' },
    { label: 'Pending Appointments', value: stats.appointmentsPending,                                       accent: false, link: '/admin/appointments' },
    { label: 'Pending Quotes',       value: stats.quotesPending,                                             accent: false, link: '/admin/quotes'       },
    { label: 'New Enquiries',        value: stats.enquiriesNew,                                              accent: false, link: '/admin/enquiries'    },
    { label: 'Total Appointments',   value: stats.appointmentsTotal,                                         accent: false, link: '/admin/appointments' },
    { label: 'Unpaid (Confirmed)',   value: `R${Number(stats.revenueUnpaid || 0).toLocaleString()}`,         accent: true,  link: '/admin/appointments' },
  ];

  const STATUS_COLORS = {
    confirmed: 'bg-green-900/40 text-green-400',
    pending:   'bg-yellow-900/40 text-yellow-400',
    completed: 'bg-blue-900/40 text-blue-400',
    cancelled: 'bg-red-900/40 text-red-400',
    no_show:   'bg-[#696969]/30 text-[#A9A9A9]',
  };

  return (
    <div className="p-8 lg:p-10">
      <h1 className="text-white font-heading font-black text-[2rem] uppercase tracking-[0.08em] mb-1">Dashboard</h1>
      <p className="text-[#A9A9A9] font-bold text-[13px] mb-10">
        {new Date().toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {statCards.map((s, i) => (
          <Link key={i} to={s.link}
            className={`p-6 border-[2px] hover:-translate-y-0.5 transition-all ${s.accent ? 'border-[#FF4500] bg-[#FF4500]/10' : 'border-[#696969]/30 bg-[#1a1a1a] hover:border-[#696969]'}`}>
            <p className={`font-heading font-black text-[2.8rem] leading-none mb-2 ${s.accent ? 'text-[#FF4500]' : 'text-white'}`}>{s.value}</p>
            <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.2em] uppercase">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-12">
        {[
          { to: '/admin/appointments', label: '+ New Appointment' },
          { to: '/admin/quotes',       label: '+ Review Quotes'   },
          { to: '/admin/calendar',     label: '+ Manage Calendar' },
        ].map((link, i) => (
          <Link key={i} to={link.to}
            className="py-3 text-center bg-[#1a1a1a] border border-[#696969]/30 hover:border-[#FF4500] hover:text-[#FF4500] text-[#A9A9A9] font-black text-[11px] uppercase tracking-[0.18em] transition-all">
            {link.label}
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-white font-black text-[14px] uppercase tracking-[0.2em] mb-5 border-b border-[#696969]/30 pb-4 flex justify-between">
          Upcoming — Next 7 Days
          <Link to="/admin/appointments" className="text-[#FF4500] font-black text-[11px] hover:underline">View All →</Link>
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-[#696969] font-bold text-[14px]">No upcoming appointments this week.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1a1a1a] border border-[#696969]/20 px-6 py-4 hover:border-[#FF4500]/30 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[#FF4500] font-black text-[10px] tracking-widest uppercase">
                      {new Date(a.appt_date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday:'short' })}
                    </p>
                    <p className="text-white font-heading font-black text-[1.4rem] leading-none">
                      {new Date(a.appt_date + 'T00:00:00').getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white font-black text-[14px]">{a.full_name}</p>
                    <p className="text-[#A9A9A9] font-bold text-[12px]">
                      {String(a.appt_time).slice(0,5)} · {a.duration_mins} min · <span className="text-white">R{Number(a.fee).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 font-black text-[10px] tracking-[0.15em] uppercase ${STATUS_COLORS[a.status] || 'bg-[#696969]/30 text-[#A9A9A9]'}`}>
                    {a.status}
                  </span>
                  <span className="text-[#696969] font-black text-[10px] uppercase tracking-widest hidden md:block">{a.reference}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;