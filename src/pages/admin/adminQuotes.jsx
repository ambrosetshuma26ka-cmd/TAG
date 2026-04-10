import { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const STATUS_COLORS = {
  pending:     'bg-yellow-900/40 text-yellow-400',
  in_progress: 'bg-blue-900/40 text-blue-400',
  quoted:      'bg-purple-900/40 text-purple-400',
  accepted:    'bg-green-900/40 text-green-400',
  declined:    'bg-red-900/40 text-red-400',
};
const STATUSES = ['pending','in_progress','quoted','accepted','declined'];

const SEND_QUOTE_ENDPOINT =
  (import.meta.env.VITE_API_URL || 'http://localhost/tag-api') + '/send-quote.php';

const parseItems = (servicesStr) => {
  if (!servicesStr) return [{ id: 1, description: "Professional Buyer's Agent Services", amount: '' }];
  return servicesStr.split(',').map((s, i) => ({
    id: i + 1,
    description: s.trim(),
    amount: '',
  }));
};

const QuoteTemplate = ({ data, templateRef = null }) => {
  const {
    toName, toEmail, toPhone, toCompany,
    fromName, fromTitle, fromPhone, fromEmail,
    quoteRef, quoteDate, validUntil,
    items, nbText,
  } = data;

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const hasAmounts = items.some(i => parseFloat(i.amount) > 0);

  const tx = { wordSpacing: 'normal', letterSpacing: 'normal' };

  return (
    <div
      ref={templateRef}
      style={{
        width: '794px',
        height: '1123px',
        background: '#FFFFFF',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#111111',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...tx,
      }}
    >
      <div style={{ height: '7px', background: '#FF4500', flexShrink: 0 }} />

      <div style={{ background: '#111111', padding: '28px 48px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <img src="/assets/images/TAG PRIMARY LOGO.png" alt="TAG" style={{ height: '56px', objectFit: 'contain', display: 'block', marginBottom: '8px' }} />
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#808080', ...tx }}>
            Johannesburg, South Africa
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#FF4500', ...tx }}>QUOTATION</p>
          <p style={{ margin: '0 0 5px', fontSize: '26px', fontWeight: 900, color: '#FFFFFF', ...tx }}>{quoteRef || 'TAG-QT-XXXXXX'}</p>
          <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 700, color: '#A9A9A9', ...tx }}>
            {'Date: '}<span style={{ color: '#FFFFFF' }}>{quoteDate || '—'}</span>
          </p>
          {validUntil && (
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#A9A9A9', ...tx }}>
              {'Valid Until: '}<span style={{ color: '#FF4500' }}>{validUntil}</span>
            </p>
          )}
        </div>
      </div>

      <div style={{ height: '3px', background: '#FF4500', flexShrink: 0 }} />

      <div style={{ display: 'flex', background: '#F8F8F8', borderBottom: '1px solid #E0E0E0', flexShrink: 0 }}>
        <div style={{ flex: 1, padding: '22px 32px 22px 48px', borderRight: '1px solid #E0E0E0' }}>
          <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#FF4500', ...tx }}>FROM</p>
          <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 900, color: '#111111', ...tx }}>{fromName || 'Ventnor Goosen'}</p>
          <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, color: '#696969', ...tx }}>{fromTitle || "Professional Buyer's Agent"}</p>
          <p style={{ margin: '0 0 1px', fontSize: '11px', fontWeight: 600, color: '#111111', ...tx }}>{fromPhone || '071 169 6716'}</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#111111', ...tx }}>{fromEmail || 'info@theauctionguyza.co.za'}</p>
        </div>
        <div style={{ flex: 1, padding: '22px 48px 22px 32px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#FF4500', ...tx }}>TO</p>
          <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 900, color: '#111111', ...tx }}>{toName || '—'}</p>
          {toCompany && <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 700, color: '#696969', ...tx }}>{toCompany}</p>}
          {toPhone && <p style={{ margin: '0 0 1px', fontSize: '11px', fontWeight: 600, color: '#111111', ...tx }}>{toPhone}</p>}
          {toEmail && <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#111111', ...tx }}>{toEmail}</p>}
        </div>
      </div>

      <div style={{ padding: '24px 48px 0', flexShrink: 0 }}>
        <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#111111', ...tx }}>SERVICES &amp; FEES</p>

        <div style={{ display: 'flex', background: '#111111', padding: '10px 14px' }}>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#A9A9A9', ...tx }}>#</span>
          <span style={{ flex: 10, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#A9A9A9', ...tx }}>Description</span>
          {hasAmounts && (
            <span style={{ flex: 3, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#A9A9A9', textAlign: 'right', ...tx }}>Amount (R)</span>
          )}
        </div>

        {items.map((item, i) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center',
            padding: '12px 14px',
            background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
            borderBottom: '1px solid #EBEBEB',
            borderLeft: i === 0 ? '4px solid #FF4500' : '4px solid transparent',
          }}>
            <span style={{ flex: 1, fontSize: '12px', fontWeight: 900, color: '#FF4500', ...tx }}>{String(i + 1).padStart(2,'0')}</span>
            <span style={{ flex: 10, fontSize: '13px', fontWeight: 600, color: '#111111', lineHeight: 1.45, ...tx }}>
              {item.description || '—'}
              {item.note && <span style={{ display: 'block', fontSize: '11px', color: '#696969', marginTop: '2px', ...tx }}>{item.note}</span>}
            </span>
            {hasAmounts && (
              <span style={{ flex: 3, fontSize: '13px', fontWeight: 900, color: item.amount ? '#111111' : '#A9A9A9', textAlign: 'right', ...tx }}>
                {item.amount ? 'R ' + Number(item.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'TBC'}
              </span>
            )}
          </div>
        ))}

        {hasAmounts && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px', background: '#111111', marginTop: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#A9A9A9', marginRight: '28px', ...tx }}>TOTAL</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FF4500', minWidth: '110px', textAlign: 'right', ...tx }}>
              {'R ' + subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {nbText && (
        <div style={{ margin: '20px 48px 0', padding: '16px 20px', borderLeft: '5px solid #FF4500', background: '#FFF8F5', flexShrink: 0 }}>
          <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#FF4500', ...tx }}>NB</p>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#333333', lineHeight: 1.65, whiteSpace: 'pre-line', ...tx }}>{nbText}</p>
        </div>
      )}

      <div style={{ margin: '20px 48px 0', padding: '16px 18px', background: '#F5F5F5', borderTop: '2px solid #E0E0E0', flexShrink: 0 }}>
        <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#111111', ...tx }}>PAYMENT TERMS</p>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#696969', lineHeight: 1.6, ...tx }}>
          All fees are payable via EFT prior to service delivery. Banking details provided upon acceptance of this quotation. Attendance fee is non-refundable once auction date is confirmed.
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ flexShrink: 0 }}>
        <div style={{ background: '#F0F0F0', padding: '14px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E0E0E0' }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#696969', ...tx }}>
            {'Active at: '}<strong style={{ color: '#111111' }}>Burchmores · WeBuyCars · Aucor · SMA</strong>
          </p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#696969', ...tx }}>theauctionguyza.co.za</p>
        </div>
        <div style={{ height: '5px', background: '#FF4500' }} />
      </div>
    </div>
  );
};

const QuotePDFModal = ({ row, onClose, token }) => {
  const templateRef = useRef(null);

  const [toName,    setToName]    = useState(row.full_name || '');
  const [toEmail,   setToEmail]   = useState(row.email || '');
  const [toPhone,   setToPhone]   = useState(row.phone || '');
  const [toCompany, setToCompany] = useState('');
  const [fromName,  setFromName]  = useState('Ventnor Goosen');
  const [fromTitle, setFromTitle] = useState("Professional Buyer's Agent");
  const [fromPhone, setFromPhone] = useState('071 169 6716');
  const [fromEmail, setFromEmail] = useState('info@theauctionguyza.co.za');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems]         = useState(parseItems(row.services_requested));
  const [nbText, setNbText]       = useState(
    "This quotation is valid for the period stated above and is subject to vehicle availability at auction. The Auction Guy (TAG) acts as the client's representative only and is not liable for any vehicle defects not identified during pre-auction inspection. All fees are exclusive of financing charges."
  );

  const [sendEmailAddr, setSendEmailAddr] = useState(row.email || '');
  const [sendSubject,   setSendSubject]   = useState(`Quotation ${row.reference} — The Auction Guy`);

  const [generating, setGenerating] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [toastMsg,   setToastMsg]   = useState('');
  const [activeTab,  setActiveTab]  = useState('to');

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 4000); };

  const addItem    = () => setItems(p => [...p, { id: Date.now(), description: '', amount: '', note: '' }]);
  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i));

  const buildPDF = async () => {
    if (!templateRef.current) return null;
    setGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 80));

      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'NONE');

      return pdf;
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    const pdf = await buildPDF();
    if (!pdf) return;
    pdf.save(`${row.reference || 'TAG-Quote'}.pdf`);
    showToast('PDF downloaded successfully.');
  };

  const handleSend = async () => {
    if (!sendEmailAddr) return showToast('Enter a recipient email address.');
    setSending(true);
    try {
      const pdf = await buildPDF();
      if (!pdf) return;
      const b64 = pdf.output('datauristring').split(',')[1];
      const res = await fetch(SEND_QUOTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({
          quoteId:        row.id,
          quoteRef:       row.reference,
          recipientEmail: sendEmailAddr,
          recipientName:  toName,
          subject:        sendSubject,
          pdfBase64:      b64,
        }),
      });
      const data = await res.json();
      if (data.success) showToast('Quote sent successfully to ' + sendEmailAddr);
      else showToast('Error: ' + (data.message || 'Send failed.'));
    } catch {
      showToast('Network error — check your API connection.');
    } finally {
      setSending(false);
    }
  };

  const tplData = {
    toName, toEmail, toPhone, toCompany,
    fromName, fromTitle, fromPhone, fromEmail,
    quoteRef: row.reference, quoteDate, validUntil,
    items, nbText,
  };

  const tabs = [
    { key: 'to',    label: 'To'        },
    { key: 'from',  label: 'From'      },
    { key: 'items', label: 'Items'     },
    { key: 'nb',    label: 'NB / Note' },
    { key: 'send',  label: 'Send'      },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col overflow-hidden">

      <div className="flex items-center justify-between px-8 py-4 bg-[#111111] border-b-[3px] border-[#FF4500] shrink-0">
        <div>
          <p className="text-[#FF4500] font-black text-[10px] tracking-[0.35em] uppercase">Quote Generator</p>
          <h2 className="text-white font-black text-[18px] uppercase tracking-[0.1em]">{row.reference} — {row.full_name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} disabled={generating}
            className="px-6 py-3 bg-[#1a1a1a] border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[11px] tracking-[0.18em] uppercase hover:border-[#FF4500] hover:text-[#FF4500] transition-all disabled:opacity-40">
            {generating ? 'Building...' : 'Download PDF'}
          </button>
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#696969] hover:text-white text-[22px] font-black transition-colors border-[2px] border-[#696969] hover:border-white">
            x
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        <div className="flex-1 overflow-auto bg-[#0D0D0D] p-8 flex justify-center">
          <div style={{ transform: 'scale(0.72)', transformOrigin: 'top center', width: '794px', flexShrink: 0 }}>
            <QuoteTemplate data={tplData} templateRef={null} />
          </div>
        </div>

        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', height: '1123px', overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
          <QuoteTemplate data={tplData} templateRef={templateRef} />
        </div>

        <div className="w-[380px] shrink-0 bg-[#111111] border-l-[2px] border-[#696969]/30 flex flex-col overflow-hidden">

          <div className="flex border-b-[2px] border-[#696969]/30 shrink-0 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex-1 min-w-[60px] px-3 py-3.5 font-black text-[10px] tracking-[0.18em] uppercase transition-all whitespace-nowrap border-b-[3px] -mb-[2px] ${
                  activeTab === t.key
                    ? 'text-[#FF4500] border-[#FF4500] bg-[#1a1a1a]'
                    : 'text-[#696969] border-transparent hover:text-[#A9A9A9]'
                }`}>{t.label}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {activeTab === 'to' && <>
              <PanelField label="Full Name"    value={toName}    onChange={setToName}    placeholder="Client full name" />
              <PanelField label="Company"      value={toCompany} onChange={setToCompany} placeholder="Company (optional)" />
              <PanelField label="Email"        value={toEmail}   onChange={setToEmail}   placeholder="client@email.com" />
              <PanelField label="Phone"        value={toPhone}   onChange={setToPhone}   placeholder="+27 71 000 0000" />
            </>}

            {activeTab === 'from' && <>
              <PanelField label="Name"       value={fromName}   onChange={setFromName}   placeholder="Your name" />
              <PanelField label="Title"      value={fromTitle}  onChange={setFromTitle}  placeholder="Your title" />
              <PanelField label="Phone"      value={fromPhone}  onChange={setFromPhone}  placeholder="Phone" />
              <PanelField label="Email"      value={fromEmail}  onChange={setFromEmail}  placeholder="Email" />
              <div className="pt-2 border-t border-[#696969]/30 space-y-4">
                <PanelField label="Quote Date"  value={quoteDate}  onChange={setQuoteDate}  type="date" />
                <PanelField label="Valid Until" value={validUntil} onChange={setValidUntil} type="date" />
              </div>
            </>}

            {activeTab === 'items' && (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={item.id} className="bg-[#1a1a1a] border border-[#696969]/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#FF4500] font-black text-[11px] tracking-widest">#{String(i+1).padStart(2,'0')}</span>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(item.id)} className="text-[#696969] hover:text-red-400 font-black text-[16px] transition-colors leading-none">x</button>
                      )}
                    </div>
                    <input
                      value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Service description"
                      className="w-full bg-[#696969]/20 border border-[#696969]/40 text-white font-bold text-[13px] px-3 py-2.5 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors mb-2"
                    />
                    <input
                      value={item.note || ''} onChange={e => updateItem(item.id, 'note', e.target.value)}
                      placeholder="Sub-note (optional)"
                      className="w-full bg-[#696969]/20 border border-[#696969]/40 text-[#A9A9A9] font-bold text-[12px] px-3 py-2 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[#696969] font-bold text-[13px]">R</span>
                      <input
                        type="number" value={item.amount} onChange={e => updateItem(item.id, 'amount', e.target.value)}
                        placeholder="Amount (leave blank = TBC)"
                        className="flex-1 bg-[#696969]/20 border border-[#696969]/40 text-[#FF4500] font-black text-[13px] px-3 py-2 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors"
                      />
                    </div>
                  </div>
                ))}
                <button onClick={addItem}
                  className="w-full py-3 border-[2px] border-dashed border-[#696969]/50 text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase hover:border-[#FF4500] hover:text-[#FF4500] transition-all">
                  + Add Item
                </button>
              </div>
            )}

            {activeTab === 'nb' && (
              <div>
                <label className="block text-[#A9A9A9] font-black text-[10px] tracking-[0.28em] uppercase mb-3">NB / Footer Note</label>
                <textarea
                  value={nbText} onChange={e => setNbText(e.target.value)} rows={10}
                  placeholder="Write your NB paragraph here..."
                  className="w-full bg-[#696969]/20 border-[2px] border-[#696969]/40 text-white font-bold text-[13px] px-4 py-3 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors resize-none leading-[1.7]"
                />
                <p className="text-[#696969] font-bold text-[11px] mt-2">Leave empty to hide this section.</p>
              </div>
            )}

            {activeTab === 'send' && (
              <div className="space-y-5">
                <div className="bg-[#1a1a1a] border-l-[4px] border-[#FF4500] px-5 py-4">
                  <p className="text-[#A9A9A9] font-bold text-[12px] leading-[1.7]">
                    This will generate the PDF and send it directly to the recipient via the TAG mail server.
                  </p>
                </div>
                <PanelField label="Recipient Email" value={sendEmailAddr} onChange={setSendEmailAddr} placeholder="client@email.com" />
                <PanelField label="Email Subject"   value={sendSubject}   onChange={setSendSubject}   placeholder="Quotation TAG-QT-..." />
                <button onClick={handleSend} disabled={sending || generating}
                  className="w-full py-4 bg-[#FF4500] text-white font-black text-[12px] tracking-[0.2em] uppercase hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                  {sending ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Generating and Sending...
                    </span>
                  ) : 'Generate and Send Quote'}
                </button>
                <div className="border-t border-[#696969]/30 pt-4">
                  <p className="text-[#696969] font-bold text-[11px] leading-[1.7]">
                    Tip: Download the PDF first to verify the layout before sending to the client.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border-l-[5px] border-[#FF4500] px-8 py-4 shadow-2xl z-[80]">
          <p className="text-white font-black text-[13px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
};

const PanelField = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[10px] tracking-[0.28em] uppercase mb-2">{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-[#696969]/20 border-[2px] border-[#696969]/40 text-white font-bold text-[13px] px-4 py-3 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors"
    />
  </div>
);

const AdminQuotes = () => (
  <AdminLayout>{(token) => <Content token={token} />}</AdminLayout>
);

const Content = ({ token }) => {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('');
  const [selected,   setSelected]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes,  setEditNotes]  = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [pdfRow,     setPdfRow]     = useState(null);

  const headers = { 'X-Admin-Token': token };

  const load = async () => {
    setLoading(true);
    const url = CONFIG.api.admin.quotes + (filter ? `&status=${filter}` : '');
    const res = await fetch(url, { headers });
    const d   = await res.json();
    if (d.success) setRows(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const openRow = (row) => {
    setSelected(row);
    setEditStatus(row.status);
    setEditNotes(row.admin_notes || '');
    setEditAmount(row.quoted_amount ?? '');
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(CONFIG.api.admin.quotes, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:        'update_quote',
        id:            selected.id,
        status:        editStatus,
        admin_notes:   editNotes,
        quoted_amount: editAmount ? parseFloat(editAmount) : null,
      }),
    });
    setSaving(false);
    setSelected(null);
    load();
  };

  const filtered = filter ? rows.filter(r => r.status === filter) : rows;

  return (
    <div className="p-8 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white font-heading font-black text-[1.8rem] uppercase tracking-[0.08em] mb-1">Quote Requests</h1>
          <p className="text-[#A9A9A9] font-bold text-[13px]">{rows.length} total · {rows.filter(r => r.status === 'pending').length} pending</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 font-black text-[11px] uppercase tracking-[0.15em] border-[2px] transition-all ${
                filter === s ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'border-[#696969] text-[#A9A9A9] hover:border-[#A9A9A9] hover:text-white'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-[#A9A9A9] font-bold py-12 text-center">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-[#696969] font-bold py-12 text-center">No quote requests found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(row => (
            <div key={row.id} onClick={() => openRow(row)}
              className="bg-[#1a1a1a] border border-[#696969]/20 hover:border-[#FF4500]/40 px-6 py-5 cursor-pointer transition-colors group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-white font-black text-[15px] group-hover:text-[#FF4500] transition-colors mb-1">{row.full_name}</p>
                  <p className="text-[#A9A9A9] font-bold text-[12px] mb-1">{row.email} · {row.phone || '—'}</p>
                  <p className="text-[#696969] font-bold text-[12px]">{row.services_requested || 'No services specified'}</p>
                  {(row.vehicle_make || row.vehicle_model) && (
                    <p className="text-[#A9A9A9] font-bold text-[12px]">
                      {[row.vehicle_year, row.vehicle_make, row.vehicle_model].filter(Boolean).join(' ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 font-black text-[10px] tracking-[0.15em] uppercase ${STATUS_COLORS[row.status] || 'bg-[#696969]/30 text-[#A9A9A9]'}`}>
                    {row.status.replace('_', ' ')}
                  </span>
                  {row.quoted_amount && (
                    <span className="text-[#FF4500] font-black text-[13px]">R{Number(row.quoted_amount).toLocaleString()}</span>
                  )}
                  <span className="text-[#696969] font-black text-[10px] uppercase tracking-widest">{row.reference}</span>
                  <span className="text-[#696969] font-bold text-[11px]">{new Date(row.created_at).toLocaleDateString('en-ZA')}</span>
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
                <button onClick={() => setSelected(null)} className="text-[#696969] hover:text-white text-[24px] font-black leading-none">x</button>
              </div>

              <button
                onClick={() => { setSelected(null); setPdfRow(selected); }}
                className="w-full mb-8 py-4 bg-[#FF4500] text-white font-black text-[13px] uppercase tracking-[0.22em] hover:bg-[#E63F00] transition-colors flex items-center justify-center gap-3 border-b-[4px] border-[#CC3700]">
                Generate Quote PDF
              </button>

              <div className="space-y-1 mb-8">
                {[
                  { l: 'Email',    v: selected.email },
                  { l: 'Phone',    v: selected.phone || '—' },
                  { l: 'Services', v: selected.services_requested || '—' },
                  { l: 'Vehicle',  v: [selected.vehicle_year, selected.vehicle_make, selected.vehicle_model].filter(Boolean).join(' ') || '—' },
                  { l: 'Budget',   v: selected.budget_range || '—' },
                  { l: 'Delivery', v: selected.delivery_required ? `Yes — ${selected.delivery_distance || '?'} km (Est. R${Number(selected.delivery_estimate || 0).toLocaleString()})` : 'No' },
                  { l: 'Notes',    v: selected.notes || '—' },
                  { l: 'Received', v: new Date(selected.created_at).toLocaleString('en-ZA') },
                ].map((r, i) => (
                  <div key={i} className="flex items-start border-b border-[#696969]/20 py-3">
                    <span className="text-[#A9A9A9] font-black text-[11px] tracking-widest uppercase min-w-[80px]">{r.l}</span>
                    <span className="text-[#D3D3D3] font-bold text-[13px] break-all">{r.v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500]">
                    {STATUSES.map(s => <option key={s} value={s} className="bg-[#111111]">{s.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Quoted Amount (R)</label>
                  <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Enter amount if quoted"
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500]" />
                </div>
                <div>
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Admin Notes</label>
                  <textarea rows={4} value={editNotes} onChange={e => setEditNotes(e.target.value)}
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[14px] px-4 py-3 focus:outline-none focus:border-[#FF4500] resize-none" />
                </div>
                <button onClick={save} disabled={saving}
                  className="w-full bg-[#1a1a1a] border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[13px] uppercase tracking-[0.2em] py-4 hover:border-[#FF4500] hover:text-white transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pdfRow && (
        <QuotePDFModal row={pdfRow} token={token} onClose={() => setPdfRow(null)} />
      )}
    </div>
  );
};

export default AdminQuotes;