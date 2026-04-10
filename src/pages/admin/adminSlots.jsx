import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';

const AdminSlots = () => (
  <AdminLayout>{(token) => <Content token={token} />}</AdminLayout>
);

const STATUS_STYLE = {
  available: 'bg-green-900/30 border-green-700/50 text-green-400',
  booked:    'bg-[#FF4500]/10 border-[#FF4500]/40 text-[#FF4500]',
  blocked:   'bg-red-900/30 border-red-700/50 text-red-400',
};

const STD_TIMES_30 = ['09:00','10:00','11:00','12:00','13:30','15:00'];
const STD_TIMES_60 = ['09:00','10:00','11:00','12:00','13:30','15:00'];

function fmtDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

const Content = ({ token }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [summary,   setSummary]   = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySlots,    setDaySlots]    = useState([]);
  const [loadingCal,  setLoadingCal]  = useState(false);
  const [loadingDay,  setLoadingDay]  = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newDur,  setNewDur]  = useState(60);
  const [working, setWorking] = useState(false);
  const [msg,     setMsg]     = useState({ text: '', ok: true });

  const headers = { 'X-Admin-Token': token };
  const base    = CONFIG.api.admin.slotsApi;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const loadSummary = useCallback(async () => {
    setLoadingCal(true);
    const res  = await fetch(`${base}?action=slots_summary&year=${viewYear}&month=${viewMonth + 1}`, { headers });
    const data = await res.json();
    if (data.success) setSummary(data.data || {});
    setLoadingCal(false);
  }, [viewYear, viewMonth]);

  const loadDay = useCallback(async (dateStr) => {
    setLoadingDay(true);
    setDaySlots([]);
    setMsg({ text: '', ok: true });
    const res  = await fetch(`${base}?action=slots_for_date&date=${dateStr}`, { headers });
    const data = await res.json();
    if (data.success) setDaySlots(data.data || []);
    setLoadingDay(false);
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const selectDay = (ds) => {
    setSelectedDay(ds);
    loadDay(ds);
  };

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 4000);
  };

  const addSlot = async () => {
    if (!selectedDay) return;
    setWorking(true);
    const res  = await fetch(base, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_slot', date: selectedDay, time: newTime, duration: newDur }),
    });
    const data = await res.json();
    flash(data.success ? `Added ${newDur}-min slot at ${newTime}.` : (data.message || 'Failed.'), data.success);
    if (data.success) { loadDay(selectedDay); loadSummary(); }
    setWorking(false);
  };

  const bulkAdd = async (dur, times) => {
    if (!selectedDay) return;
    setWorking(true);
    const res  = await fetch(base, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_bulk', date: selectedDay, duration: dur, times }),
    });
    const data = await res.json();
    flash(data.success ? `Added ${data.added} slots (${data.skipped} skipped).` : (data.message || 'Failed.'), data.success);
    if (data.success) { loadDay(selectedDay); loadSummary(); }
    setWorking(false);
  };

  const removeSlot = async (id) => {
    setWorking(true);
    const res  = await fetch(base, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove_slot', id }),
    });
    const data = await res.json();
    flash(data.success ? 'Slot removed.' : (data.message || 'Failed.'), data.success);
    if (data.success) { loadDay(selectedDay); loadSummary(); }
    setWorking(false);
  };

  const clearDay = async () => {
    if (!selectedDay || !window.confirm('Remove all available slots for this date?')) return;
    setWorking(true);
    const res  = await fetch(base, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_day', date: selectedDay }),
    });
    const data = await res.json();
    flash(data.success ? `Cleared ${data.removed} slots.` : (data.message || 'Failed.'), data.success);
    if (data.success) { loadDay(selectedDay); loadSummary(); }
    setWorking(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const offset      = firstDow === 0 ? 6 : firstDow - 1;
  const monthLabel  = new Date(viewYear, viewMonth).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const blanks      = Array(offset).fill(null);
  const days        = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11); } else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0); } else setViewMonth(m=>m+1); };

  const slots30 = daySlots.filter(s => Number(s.duration_mins) === 30);
  const slots60 = daySlots.filter(s => Number(s.duration_mins) === 60);

  const selectedDayFmt = selectedDay
    ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '';

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-[#FF4500] font-black text-[10px] tracking-[0.35em] uppercase mb-1">Admin</p>
        <h1 className="text-white font-heading font-black text-[1.8rem] uppercase tracking-[0.08em] mb-1">Slot Management</h1>
        <p className="text-[#A9A9A9] font-bold text-[13px]">Define which time slots are available for booking, per day and duration.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        <div className="lg:col-span-2">
          <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-6 sticky top-6">
            <div className="flex justify-between items-center mb-5">
              <button onClick={prevMonth} className="w-9 h-9 bg-[#696969] text-white font-black hover:bg-[#FF4500] transition-colors flex items-center justify-center text-[18px]">‹</button>
              <h3 className="text-white font-heading font-black text-[14px] tracking-[0.15em] uppercase">{monthLabel}</h3>
              <button onClick={nextMonth} className="w-9 h-9 bg-[#696969] text-white font-black hover:bg-[#FF4500] transition-colors flex items-center justify-center text-[18px]">›</button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {['M','T','W','T','F','S','S'].map((d,i) => (
                <div key={i} className={`text-center font-black text-[10px] tracking-wider py-1.5 ${i===6?'text-[#696969]':'text-[#A9A9A9]'}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {blanks.map((_,i) => <div key={`b${i}`} />)}
              {days.map(d => {
                const ds    = fmtDate(viewYear, viewMonth, d);
                const dow   = new Date(viewYear, viewMonth, d).getDay();
                const isSun = dow === 0;
                const isToday    = ds === todayStr;
                const isSelected = ds === selectedDay;
                const info  = summary[ds];
                const hasBooked    = info?.booked > 0;
                const hasAvailable = info?.available > 0;

                return (
                  <button key={d} onClick={() => selectDay(ds)} disabled={isSun}
                    className={`aspect-square flex flex-col items-center justify-center text-[12px] font-black transition-all rounded border ${
                      isSelected  ? 'border-[#FF4500] bg-[#FF4500]/20 text-[#FF4500]'
                      : isToday   ? 'border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500]'
                      : isSun     ? 'border-transparent text-[#696969]/30 cursor-not-allowed'
                      : 'border-transparent hover:border-[#696969]/40 text-white'
                    }`}>
                    <span>{d}</span>
                    {!isSun && info && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${hasBooked ? 'bg-[#FF4500]' : hasAvailable ? 'bg-green-500' : 'bg-transparent'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 mt-4 pt-4 border-t border-[#696969]/20 text-[11px] font-bold text-[#696969] flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />Available slots</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4500]" />Has bookings</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {!selectedDay ? (
            <div className="flex items-center justify-center h-64 bg-[#111111] border-[2px] border-dashed border-[#696969]/30">
              <div className="text-center">
                <p className="text-[#696969] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Select a Date</p>
                <p className="text-[#696969] font-bold text-[12px]">Click any day on the calendar to manage its slots.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[#FF4500] font-black text-[10px] tracking-[0.3em] uppercase mb-1">Managing Slots</p>
                    <h2 className="text-white font-black text-[16px]">{selectedDayFmt}</h2>
                  </div>
                  <button onClick={clearDay} disabled={working}
                    className="px-4 py-2 border-[2px] border-red-800 text-red-500 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-900/30 transition-colors disabled:opacity-40">
                    Clear All Available
                  </button>
                </div>

                <div className="bg-[#1a1a1a] border border-[#696969]/20 p-5 mb-6">
                  <p className="text-[#A9A9A9] font-black text-[10px] tracking-[0.28em] uppercase mb-4">Add Single Slot</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-[#696969] font-black text-[10px] tracking-widest uppercase mb-2">Time</label>
                      <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                        className="bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[13px] px-4 py-2.5 focus:outline-none focus:border-[#FF4500] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[#696969] font-black text-[10px] tracking-widest uppercase mb-2">Duration</label>
                      <div className="flex gap-2">
                        {[30, 60].map(d => (
                          <button key={d} onClick={() => setNewDur(d)}
                            className={`px-5 py-2.5 font-black text-[11px] uppercase tracking-[0.1em] border-[2px] transition-all ${
                              newDur === d ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'border-[#696969] text-[#A9A9A9] hover:border-[#A9A9A9]'
                            }`}>{d} min · R{d === 30 ? '250' : '500'}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={addSlot} disabled={working}
                      className="px-6 py-2.5 bg-[#FF4500] text-white font-black text-[11px] uppercase tracking-[0.15em] hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                      {working ? '...' : '+ Add Slot'}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#696969]/20 p-5">
                  <p className="text-[#A9A9A9] font-black text-[10px] tracking-[0.28em] uppercase mb-3">Quick Fill — 6 Slots (09:00 to 17:00)</p>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => bulkAdd(30, STD_TIMES_30)} disabled={working}
                      className="px-5 py-2.5 border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[10px] uppercase tracking-[0.12em] hover:border-green-500 hover:text-green-400 transition-colors disabled:opacity-40">
                      6 x 30-min  (R250 each)
                    </button>
                    <button onClick={() => bulkAdd(60, STD_TIMES_60)} disabled={working}
                      className="px-5 py-2.5 border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[10px] uppercase tracking-[0.12em] hover:border-green-500 hover:text-green-400 transition-colors disabled:opacity-40">
                      6 x 60-min  (R500 each)
                    </button>
                    <button onClick={() => { bulkAdd(30, STD_TIMES_30); bulkAdd(60, STD_TIMES_60); }} disabled={working}
                      className="px-5 py-2.5 border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[10px] uppercase tracking-[0.12em] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors disabled:opacity-40">
                      Fill Both
                    </button>
                  </div>
                  <p className="text-[#696969] font-bold text-[11px] mt-2">Slots: 09:00 · 10:00 · 11:00 · 12:00 · 13:30 · 15:00 · Conflicts skipped automatically.</p>
                </div>

                {msg.text && (
                  <p className={`font-bold text-[12px] mt-4 ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
                )}
              </div>

              <div className="bg-[#111111] border-t-[4px] border-[#696969] p-6">
                <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-5">
                  Slots for this date
                  <span className="ml-3 text-[#696969] font-bold normal-case tracking-normal">
                    {daySlots.length === 0 ? 'none' : `${daySlots.filter(s=>s.status==='available').length} available · ${daySlots.filter(s=>s.status==='booked').length} booked`}
                  </span>
                </p>

                {loadingDay ? (
                  <div className="flex items-center justify-center py-10">
                    <svg className="animate-spin w-5 h-5 text-[#FF4500]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                ) : daySlots.length === 0 ? (
                  <p className="text-[#696969] font-bold text-[13px] py-4 text-center border-[2px] border-dashed border-[#696969]/20">
                    No slots defined. Add some above.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[{ label: '30-Minute · R250', slots: slots30 }, { label: '60-Minute · R500', slots: slots60 }].map(({ label, slots }) => (
                      <div key={label}>
                        <p className="text-[#696969] font-black text-[10px] tracking-[0.22em] uppercase mb-3">{label}</p>
                        {slots.length === 0 ? (
                          <p className="text-[#696969] font-bold text-[12px]">None defined.</p>
                        ) : (
                          <div className="space-y-2">
                            {slots.map(s => (
                              <div key={s.id} className={`flex items-center justify-between px-4 py-3 border ${STATUS_STYLE[s.status] || 'border-[#696969]/20 text-[#A9A9A9]'}`}>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-[15px]">{s.slot_time}</span>
                                    <span className="font-black text-[9px] uppercase tracking-widest opacity-60 border border-current px-1.5 py-0.5">{s.status}</span>
                                  </div>
                                  {s.full_name && (
                                    <p className="text-[11px] font-bold opacity-80 mt-0.5 truncate">{s.full_name}</p>
                                  )}
                                  {s.reference && (
                                    <p className="text-[10px] font-bold opacity-50">{s.reference}</p>
                                  )}
                                </div>
                                {s.status === 'available' && (
                                  <button onClick={() => removeSlot(Number(s.id))} disabled={working}
                                    className="text-[#696969] hover:text-red-400 font-black text-[18px] transition-colors leading-none ml-3 shrink-0 disabled:opacity-30">
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSlots;