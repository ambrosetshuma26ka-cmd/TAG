import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';

const AdminCalendar = () => (
  <AdminLayout>{(token) => <Content token={token} />}</AdminLayout>
);

const Content = ({ token }) => {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [appointments, setAppointments] = useState([]);
  const [blocked,      setBlocked]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [blockDate,    setBlockDate]    = useState('');
  const [blockReason,  setBlockReason]  = useState('');
  const [saving,       setSaving]       = useState(false);

  const headers = { 'X-Admin-Token': token };

  const load = async () => {
    setLoading(true);
    const [aRes, bRes] = await Promise.all([
      fetch(CONFIG.api.admin.appointments, { headers }),
      fetch(CONFIG.api.admin.blockedDates,  { headers }),
    ]);
    const aData = await aRes.json();
    const bData = await bRes.json();
    if (aData.success) setAppointments(aData.data || []);
    if (bData.success) setBlocked(bData.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addBlock = async () => {
    if (!blockDate) return;
    setSaving(true);
    await fetch(CONFIG.api.admin.blockedDates, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block_date', date: blockDate, reason: blockReason }),
    });
    setSaving(false);
    setBlockDate(''); setBlockReason('');
    load();
  };

  const removeBlock = async (date) => {
    await fetch(CONFIG.api.admin.blockedDates, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unblock_date', date }),
    });
    load();
  };

  const daysInMon  = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
  const firstDay   = new Date(calMonth.year, calMonth.month, 1).getDay();
  const offset     = firstDay === 0 ? 6 : firstDay - 1;
  const monthName  = new Date(calMonth.year, calMonth.month).toLocaleString('en-ZA', { month: 'long', year: 'numeric' });
  const today      = new Date().toISOString().split('T')[0];

  const dayStr = (d) => `${calMonth.year}-${String(calMonth.month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const apptsByDate = {};
  appointments.forEach(a => {
    if (!apptsByDate[a.appt_date]) apptsByDate[a.appt_date] = [];
    apptsByDate[a.appt_date].push(a);
  });

  const blockedSet = new Set(blocked.map(b => b.blocked_date));

  const prevMonth = () => setCalMonth(p => p.month === 0 ? { year: p.year-1, month: 11 } : { year: p.year, month: p.month-1 });
  const nextMonth = () => setCalMonth(p => p.month === 11 ? { year: p.year+1, month: 0 } : { year: p.year, month: p.month+1 });

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-white font-heading font-black text-[1.8rem] uppercase tracking-[0.08em] mb-1">Calendar</h1>
          <p className="text-[#A9A9A9] font-bold text-[13px]">Appointment overview and date blocking</p>
        </div>
        <Link to="/admin/slots"
          className="flex items-center gap-3 px-6 py-3 bg-[#FF4500] text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#E63F00] transition-colors">
          ◫ Manage Slots
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
          <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="w-9 h-9 bg-[#696969] text-white font-black hover:bg-[#FF4500] transition-colors flex items-center justify-center">‹</button>
              <h3 className="text-white font-heading font-black text-[16px] tracking-[0.15em] uppercase">{monthName}</h3>
              <button onClick={nextMonth} className="w-9 h-9 bg-[#696969] text-white font-black hover:bg-[#FF4500] transition-colors flex items-center justify-center">›</button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d, i) => (
                <div key={i} className={`text-center font-black text-[11px] tracking-widest uppercase py-2 ${i === 6 ? 'text-[#696969]' : 'text-[#A9A9A9]'}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMon).fill(null).map((_, i) => {
                const d        = i + 1;
                const ds       = dayStr(d);
                const dow      = new Date(calMonth.year, calMonth.month, d).getDay();
                const isSun    = dow === 0;
                const isToday  = ds === today;
                const isBlocked = blockedSet.has(ds);
                const apts     = apptsByDate[ds] || [];

                return (
                  <div key={d} className={`aspect-square flex flex-col items-center justify-start pt-1 text-[13px] font-black transition-all rounded border ${
                    isSun || isBlocked ? 'opacity-40 border-transparent' : isToday ? 'bg-[#FF4500]/20 border border-[#FF4500]' : 'border-transparent hover:border-[#696969]/40'
                  }`}>
                    <span className={`${isToday ? 'text-[#FF4500]' : isSun ? 'text-[#696969]' : 'text-white'}`}>{d}</span>
                    {apts.length > 0 && (
                      <span className="mt-0.5 w-5 h-5 bg-[#FF4500] text-white text-[10px] font-black flex items-center justify-center rounded-full">
                        {apts.length}
                      </span>
                    )}
                    {isBlocked && <span className="text-[8px] text-red-400 font-black mt-0.5">BLK</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-6 mt-4 text-[12px] font-bold text-[#A9A9A9]">
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#FF4500] rounded-full" /> Today</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#FF4500] rounded-full opacity-40" /> Has Appointments</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-400/60 rounded-full" /> Blocked</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-6">
            <h3 className="text-white font-black text-[13px] uppercase tracking-[0.18em] mb-5">Block a Full Day</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Date</label>
                <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                  className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500]" />
              </div>
              <div>
                <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Reason</label>
                <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="e.g. Public holiday"
                  className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500]" />
              </div>
              <button onClick={addBlock} disabled={!blockDate || saving}
                className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.2em] py-3 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                {saving ? 'Blocking...' : 'Block Date'}
              </button>
            </div>
          </div>

          <div className="bg-[#111111] border-t-[4px] border-[#696969] p-6">
            <h3 className="text-white font-black text-[13px] uppercase tracking-[0.18em] mb-5">Blocked Dates</h3>
            {blocked.length === 0 ? (
              <p className="text-[#696969] font-bold text-[13px]">No dates blocked.</p>
            ) : (
              <div className="space-y-2">
                {blocked.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-[#1a1a1a] px-4 py-3 border border-[#696969]/20">
                    <div>
                      <p className="text-white font-black text-[13px]">{b.blocked_date}</p>
                      {b.reason && <p className="text-[#696969] font-bold text-[11px]">{b.reason}</p>}
                    </div>
                    <button onClick={() => removeBlock(b.blocked_date)}
                      className="text-red-400 hover:text-red-300 font-black text-[13px] transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;