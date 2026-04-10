import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';

const STATUS_COLORS = {
  pending:   'bg-yellow-900/40 text-yellow-400',
  confirmed: 'bg-green-900/40 text-green-400',
  completed: 'bg-blue-900/40 text-blue-400',
  cancelled: 'bg-red-900/40 text-red-400',
  no_show:   'bg-[#696969]/40 text-[#A9A9A9]',
};

const PAY_COLORS = {
  unpaid:   'text-red-400',
  paid:     'text-green-400',
  refunded: 'text-[#A9A9A9]',
};

const STATUSES = ['pending','confirmed','completed','cancelled','no_show'];

const AdminAppointments = () => (
  <AdminLayout>{(token) => <Content token={token} />}</AdminLayout>
);

const Content = ({ token }) => {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('');
  const [selected,   setSelected]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [editNotes,  setEditNotes]  = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPay,    setEditPay]    = useState('');
  const [blockDate,  setBlockDate]  = useState('');
  const [blockTime,  setBlockTime]  = useState('');
  const [blockingSlot, setBlockingSlot] = useState(false);
  const [slotMsg,    setSlotMsg]    = useState('');

  const headers = { 'X-Admin-Token': token };

  const load = async () => {
    setLoading(true);
    const url = CONFIG.api.admin.appointments + (filter ? `&status=${filter}` : '');
    const res = await fetch(url, { headers });
    const d   = await res.json();
    if (d.success) setRows(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const openRow = (row) => {
    setSelected(row);
    setEditStatus(row.status);
    setEditPay(row.payment_status);
    setEditNotes(row.admin_notes || '');
    setSlotMsg('');
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(CONFIG.api.admin.appointments, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_appointment',
        id: selected.id,
        status: editStatus,
        payment_status: editPay,
        admin_notes: editNotes,
      }),
    });
    setSaving(false);
    setSelected(null);
    load();
  };

  const handleBlockSlot = async () => {
    if (!blockDate || !blockTime) { setSlotMsg('Enter both date and time.'); return; }
    setBlockingSlot(true);
    setSlotMsg('');
    const res = await fetch(CONFIG.api.admin.appointments, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block_slot', date: blockDate, time: blockTime }),
    });
    const d = await res.json();
    setSlotMsg(d.success ? `Slot ${blockDate} ${blockTime} blocked.` : (d.message || 'Failed.'));
    setBlockingSlot(false);
    if (d.success) { setBlockDate(''); setBlockTime(''); }
  };

  const handleUnblockSlot = async () => {
    if (!blockDate || !blockTime) { setSlotMsg('Enter both date and time.'); return; }
    setBlockingSlot(true);
    setSlotMsg('');
    const res = await fetch(CONFIG.api.admin.appointments, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unblock_slot', date: blockDate, time: blockTime }),
    });
    const d = await res.json();
    setSlotMsg(d.success ? `Slot ${blockDate} ${blockTime} unblocked.` : (d.message || 'Failed.'));
    setBlockingSlot(false);
    if (d.success) { setBlockDate(''); setBlockTime(''); }
  };

  const filtered = filter ? rows.filter(r => r.status === filter) : rows;

  return (
    <div className="p-8 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white font-heading font-black text-[1.8rem] uppercase tracking-[0.08em] mb-1">Appointments</h1>
          <p className="text-[#A9A9A9] font-bold text-[13px]">{rows.length} total · {rows.filter(r => r.status === 'pending').length} pending</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 font-black text-[11px] uppercase tracking-[0.18em] border-[2px] transition-all ${
                filter === s ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'border-[#696969] text-[#A9A9A9] hover:border-[#A9A9A9] hover:text-white'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#696969]/20 p-6 mb-8">
        <p className="text-[#FF4500] font-black text-[11px] tracking-[0.28em] uppercase mb-5">Block / Unblock Individual Slot</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[#A9A9A9] font-black text-[10px] tracking-[0.22em] uppercase mb-2">Date</label>
            <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
              className="bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[13px] px-4 py-2.5 focus:outline-none focus:border-[#FF4500] transition-colors" />
          </div>
          <div>
            <label className="block text-[#A9A9A9] font-black text-[10px] tracking-[0.22em] uppercase mb-2">Time (HH:MM)</label>
            <input type="time" value={blockTime} onChange={e => setBlockTime(e.target.value)}
              className="bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[13px] px-4 py-2.5 focus:outline-none focus:border-[#FF4500] transition-colors" />
          </div>
          <button onClick={handleBlockSlot} disabled={blockingSlot}
            className="px-6 py-2.5 bg-red-900/60 border-[2px] border-red-700 text-red-400 font-black text-[11px] uppercase tracking-[0.18em] hover:bg-red-900 transition-colors disabled:opacity-50">
            Block Slot
          </button>
          <button onClick={handleUnblockSlot} disabled={blockingSlot}
            className="px-6 py-2.5 border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[11px] uppercase tracking-[0.18em] hover:border-[#A9A9A9] hover:text-white transition-colors disabled:opacity-50">
            Unblock Slot
          </button>
        </div>
        {slotMsg && <p className="text-[#FF4500] font-bold text-[12px] mt-4">{slotMsg}</p>}
      </div>

      {loading ? (
        <div className="text-[#A9A9A9] font-bold py-12 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-[#696969] font-bold py-12 text-center">No appointments found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(row => (
            <div key={row.id}
              onClick={() => openRow(row)}
              className="bg-[#1a1a1a] border border-[#696969]/20 hover:border-[#FF4500]/40 px-6 py-4 cursor-pointer transition-colors group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-5">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[#FF4500] font-black text-[10px] tracking-widest uppercase">
                      {new Date(row.appt_date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'short' })}
                    </p>
                    <p className="text-white font-heading font-black text-[1.4rem] leading-none">
                      {new Date(row.appt_date + 'T00:00:00').getDate()}
                    </p>
                    <p className="text-[#696969] font-bold text-[10px]">
                      {new Date(row.appt_date + 'T00:00:00').toLocaleDateString('en-ZA', { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-white font-black text-[15px] group-hover:text-[#FF4500] transition-colors">{row.full_name}</p>
                    <p className="text-[#A9A9A9] font-bold text-[12px]">
                      {String(row.appt_time).slice(0, 5)} · {row.duration_mins} min · <span className="text-white">R{Number(row.fee).toLocaleString()}</span>
                    </p>
                    <p className="text-[#696969] font-bold text-[11px]">{row.email} · {row.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 font-black text-[10px] tracking-[0.15em] uppercase ${STATUS_COLORS[row.status] || 'bg-[#696969]/30 text-[#A9A9A9]'}`}>
                    {row.status}
                  </span>
                  <span className={`font-black text-[11px] uppercase tracking-widest ${PAY_COLORS[row.payment_status] || 'text-[#A9A9A9]'}`}>
                    {row.payment_status}
                  </span>
                  <span className="text-[#696969] font-black text-[10px] uppercase tracking-widest">{row.reference}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg bg-[#111111] h-full overflow-y-auto border-l-[4px] border-[#FF4500] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[#FF4500] font-black text-[11px] tracking-[0.3em] uppercase mb-1">{selected.reference}</p>
                  <h2 className="text-white font-heading font-black text-[1.5rem] uppercase">{selected.full_name}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#696969] hover:text-white text-[24px] font-black leading-none">×</button>
              </div>

              <div className="space-y-1 mb-8">
                {[
                  { l: 'Date',    v: new Date(selected.appt_date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                  { l: 'Time',    v: String(selected.appt_time).slice(0,5) + ' · ' + selected.duration_mins + ' min' },
                  { l: 'Fee',     v: 'R' + Number(selected.fee).toLocaleString() },
                  { l: 'Email',   v: selected.email },
                  { l: 'Phone',   v: selected.phone || '—' },
                  { l: 'Type',    v: selected.consult_type },
                  { l: 'Vehicle', v: selected.vehicle_interest || '—' },
                  { l: 'Budget',  v: selected.budget_range || '—' },
                  { l: 'Notes',   v: selected.notes || '—' },
                  { l: 'Booked',  v: new Date(selected.created_at).toLocaleString('en-ZA') },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-0 border-b border-[#696969]/20 py-3">
                    <span className="text-[#A9A9A9] font-black text-[11px] tracking-widest uppercase min-w-[80px]">{r.l}</span>
                    <span className="text-[#D3D3D3] font-bold text-[13px] break-all">{r.v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500] transition-colors">
                    {STATUSES.map(s => <option key={s} value={s} className="bg-[#111111]">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Payment</label>
                  <select value={editPay} onChange={e => setEditPay(e.target.value)}
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500] transition-colors">
                    {['unpaid','paid','refunded'].map(s => <option key={s} value={s} className="bg-[#111111]">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Admin Notes</label>
                  <textarea rows={4} value={editNotes} onChange={e => setEditNotes(e.target.value)}
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500] transition-colors resize-none" />
                </div>
                <button onClick={save} disabled={saving}
                  className="w-full bg-[#FF4500] text-white font-black text-[13px] uppercase tracking-[0.2em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;