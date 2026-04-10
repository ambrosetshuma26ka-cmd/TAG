import { useState } from 'react';
import CONFIG from '../config';

const initialForm = { firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' };

const Field = ({ label, name, type = 'text', placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
      {label}{required && <span className="text-[#FF4500] ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      /* text-base (16px) prevents iOS Safari auto-zoom on focus */
      className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors touch-manipulation"
    />
  </div>
);

const Contact = () => {
  const [form,     setForm]     = useState(initialForm);
  const [status,   setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res  = await fetch(CONFIG.api.contact, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm(initialForm);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Unable to reach the server. Please try again or contact us directly.');
    }
  };

  return (
    <div className="w-full bg-[#696969] font-sans overflow-x-hidden selection:bg-[#FF4500] selection:text-white">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex items-end pt-32 sm:pt-40 pb-16 sm:pb-20 bg-[#111111] overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute right-[-1rem] bottom-[-2rem] font-heading font-black text-[28vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none"
        >TAG</span>
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-end">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 mb-8 sm:mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
              Get In Touch
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-[5rem] font-black font-heading uppercase leading-[1.01] mb-6 sm:mb-8 text-white tracking-tight">
              Contact<br /><span className="text-[#FF4500]">Ventnor</span><br />Goosen.
            </h1>
            <p className="text-[15px] sm:text-[17px] text-[#D3D3D3] leading-[1.8] font-bold border-l-[5px] border-[#FF4500] pl-5 sm:pl-7 max-w-xl">
              Questions about TAG, how auctions work, or anything else? Send a message and Ventnor will respond within 24 hours.
            </p>
          </div>

          {/* Right contact card */}
          <div className="flex justify-start lg:justify-end">
            <div className="bg-[#696969] border-t-[5px] border-[#FF4500] p-6 sm:p-10 w-full max-w-full sm:max-w-[380px] shadow-2xl">
              <p className="text-[#FF4500] font-black text-[11px] tracking-[0.3em] uppercase mb-6 sm:mb-8 border-b border-[#808080] pb-5">
                Direct Contact
              </p>
              {[
                { label: 'Phone', value: '071 169 6716',               href: 'tel:+27711696716' },
                { label: 'Email', value: 'info@theauctionguyza.co.za', href: 'mailto:info@theauctionguyza.co.za' },
                { label: 'Based', value: 'Johannesburg, South Africa' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <span className="text-[#A9A9A9] font-black text-[11px] tracking-[0.2em] uppercase min-w-[50px] mt-[2px]">{c.label}</span>
                  {c.href
                    ? <a href={c.href} className="text-[#D3D3D3] font-bold text-[13px] sm:text-[14px] hover:text-[#FF4500] transition-colors break-all">{c.value}</a>
                    : <span className="text-[#D3D3D3] font-bold text-[13px] sm:text-[14px]">{c.value}</span>
                  }
                </div>
              ))}
              <div className="pt-5 border-t border-[#808080]">
                <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.2em] uppercase mb-3">Auction Houses</p>
                <div className="flex flex-wrap gap-2">
                  {['Burchmores','WeBuyCars','Aucor','SMA'].map(h => (
                    <span key={h} className="text-white font-black text-[11px] tracking-[0.12em] uppercase bg-[#111111] px-3 py-1.5">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-36 bg-[#808080]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {status === 'success' ? (
            <div className="bg-[#111111] border-t-[5px] border-[#FF4500] p-8 sm:p-14 text-center shadow-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF4500] flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-heading font-black text-[1.8rem] sm:text-[2.2rem] uppercase tracking-[0.1em] mb-4 sm:mb-5">Message Sent.</h3>
              <p className="text-[#D3D3D3] font-bold text-[14px] sm:text-[15px] leading-[1.85] max-w-md mx-auto">
                Ventnor will be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="bg-[#111111] p-5 sm:p-10 md:p-14 border-t-[5px] border-[#FF4500] shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                <h2 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-8 sm:mb-10 border-b border-[#696969] pb-6 sm:pb-7">
                  Send a Message
                </h2>

                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <Field label="First Name" name="firstName" placeholder="First name"  value={form.firstName} onChange={handleChange} required />
                  <Field label="Last Name"  name="lastName"  placeholder="Last name"   value={form.lastName}  onChange={handleChange} required />
                </div>

                {/* Email / Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <Field label="Email Address" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                  <Field label="Phone Number"  name="phone" type="tel"   placeholder="+27 71 000 0000" value={form.phone} onChange={handleChange} />
                </div>

                {/* Subject */}
                <div className="mb-4 sm:mb-6">
                  <Field label="Subject" name="subject" placeholder="What is this about?" value={form.subject} onChange={handleChange} />
                </div>

                {/* Message */}
                <div className="mb-8 sm:mb-10">
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
                    Message <span className="text-[#FF4500]">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="How can Ventnor help you?"
                    /* text-base = 16px — prevents iOS Safari zoom */
                    className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors resize-none touch-manipulation"
                  />
                </div>

                {status === 'error' && (
                  <div className="mb-6 sm:mb-8 px-4 sm:px-6 py-4 bg-red-900/30 border-l-[4px] border-red-500">
                    <p className="text-red-400 font-bold text-[14px]">{errorMsg}</p>
                  </div>
                )}

                {/* Submit — full width on mobile */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : 'Send Message'}
                </button>

                <p className="text-[#696969] font-bold text-[12px] mt-5 sm:mt-6">
                  Your information is held in strict confidence. TAG responds within 24 hours.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <div className="bg-[#111111] border-y-[4px] border-[#FF4500] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#696969]/30 text-center">
          {[
            { value: '24hr',    label: 'Response Time'   },
            { value: '100%',    label: 'Transparent'     },
            { value: '0',       label: 'Pressure Sales'  },
            { value: 'SA-Wide', label: 'Client Coverage' },
          ].map((s, i) => (
            <div key={i} className="py-5 sm:py-6 px-2 sm:px-4">
              <div className="text-[#FF4500] font-heading font-black text-[2rem] sm:text-[2.5rem] leading-none mb-2">{s.value}</div>
              <div className="text-[#A9A9A9] font-black text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Contact;