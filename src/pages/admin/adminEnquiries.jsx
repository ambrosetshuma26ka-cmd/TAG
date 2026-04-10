import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';

const STATUS_COLORS = {
  new:      'bg-[#FF4500]/20 text-[#FF4500]',
  read:     'bg-blue-900/30 text-blue-400',
  replied:  'bg-green-900/30 text-green-400',
  archived: 'bg-[#696969]/30 text-[#696969]',
};

const AdminEnquiries = () => (
  <AdminLayout>{(token) => <Content token={token} />}</AdminLayout>
);

const Content = ({ token }) => {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]  = useState(false);

  const headers = { 'X-Admin-Token': token };

  const load = async () => {
    setLoading(true);
    const res = await fetch(CONFIG.api.admin.enquiries, { headers });
    const d   = await res.json();
    if (d.success) setRows(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setSaving(true);
    await fetch(CONFIG.api.admin.enquiries, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_enquiry', id, status }),
    });
    setSaving(false);
    setSelected(null);
    load();
  };

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-white font-heading font-black text-[1.8rem] uppercase tracking-[0.08em] mb-1">Enquiries</h1>
        <p className="text-[#A9A9A9] font-bold text-[13px]">{rows.length} total · {rows.filter(r => r.status === 'new').length} new</p>
      </div>

      {loading ? (
        <div className="text-[#A9A9A9] font-bold py-12 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-[#696969] font-bold py-12 text-center">No enquiries yet.</div>
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <div key={row.id} onClick={() => setSelected(row)}
              className={`bg-[#1a1a1a] border hover:border-[#FF4500]/40 px-6 py-4 cursor-pointer transition-colors group ${
                row.status === 'new' ? 'border-[#FF4500]/30' : 'border-[#696969]/20'
              }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-white font-black text-[15px] group-hover:text-[#FF4500] transition-colors">{row.full_name}</p>
                  <p className="text-[#A9A9A9] font-bold text-[12px]">{row.email} · {row.phone || '—'}</p>
                  {row.subject && <p className="text-[#D3D3D3] font-bold text-[13px] mt-1">{row.subject}</p>}
                  <p className="text-[#696969] font-bold text-[12px] mt-1 truncate max-w-md">{row.message}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 font-black text-[10px] tracking-[0.15em] uppercase ${STATUS_COLORS[row.status] || ''}`}>
                    {row.status}
                  </span>
                  <span className="text-[#696969] font-bold text-[11px]">{new Date(row.created_at).toLocaleDateString('en-ZA')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg bg-[#111111] h-full overflow-y-auto border-l-[4px] border-[#FF4500] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-white font-heading font-black text-[1.5rem] uppercase">{selected.full_name}</h2>
                  <p className="text-[#A9A9A9] font-bold text-[13px]">{new Date(selected.created_at).toLocaleString('en-ZA')}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#696969] hover:text-white text-[24px] font-black leading-none">×</button>
              </div>

              <div className="space-y-1 mb-8">
                {[
                  { l: 'Email',   v: selected.email },
                  { l: 'Phone',   v: selected.phone || '—' },
                  { l: 'Subject', v: selected.subject || '—' },
                ].map((r, i) => (
                  <div key={i} className="flex items-start border-b border-[#696969]/20 py-3">
                    <span className="text-[#A9A9A9] font-black text-[11px] tracking-widest uppercase min-w-[70px]">{r.l}</span>
                    <span className="text-[#D3D3D3] font-bold text-[13px]">{r.v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a1a1a] border-l-[4px] border-[#FF4500] px-6 py-5 mb-8">
                <p className="text-[#A9A9A9] font-black text-[10px] tracking-[0.3em] uppercase mb-3">Message</p>
                <p className="text-[#D3D3D3] font-bold text-[14px] leading-[1.7] whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="space-y-3">
                <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Mark As</p>
                <div className="grid grid-cols-2 gap-2">
                  {['read','replied','archived'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={saving}
                      className={`py-3 font-black text-[12px] uppercase tracking-[0.18em] border-[2px] transition-all ${
                        selected.status === s
                          ? 'bg-[#FF4500] border-[#FF4500] text-white'
                          : 'border-[#696969] text-[#A9A9A9] hover:border-[#A9A9A9] hover:text-white'
                      } disabled:opacity-60`}>
                      {s}
                    </button>
                  ))}
                </div>
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your TAG Enquiry')}`}
                  className="block w-full text-center bg-[#FF4500] text-white font-black text-[13px] uppercase tracking-[0.2em] py-4 hover:bg-[#E63F00] transition-colors mt-4">
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;