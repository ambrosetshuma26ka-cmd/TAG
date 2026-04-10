import { useState, useRef } from 'react';
import { calcDeliveryEstimate } from '../config';
import CONFIG from '../config';

const { services, budgetRanges, pricing, api } = CONFIG;

const vehicleYears = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => String(new Date().getFullYear() - i)
);

const initialForm = {
  fullName:         '',
  email:            '',
  phone:            '',
  vehicleMake:      '',
  vehicleModel:     '',
  vehicleYear:      '',
  budgetRange:      '',
  deliveryRequired: false,
  deliveryDistance: '',
  notes:            '',
};

const STEPS = ['Services', 'Vehicle & Budget', 'Delivery', 'Your Details', 'Review'];

/* ── Shared primitives ──────────────────────────────────────────────────── */

const TextField = ({ label, name, type = 'text', placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
      {label}{required && <span className="text-[#FF4500] ml-1">*</span>}
    </label>
    {/* text-base = 16px → prevents iOS Safari auto-zoom on focus */}
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors duration-300 touch-manipulation"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, children, required }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
      {label}{required && <span className="text-[#FF4500] ml-1">*</span>}
    </label>
    <select
      name={name} value={value} onChange={onChange} required={required}
      /* text-base = 16px → prevents iOS Safari auto-zoom; pr-10 keeps arrow visible */
      className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 pr-10 focus:outline-none focus:border-[#FF4500] transition-colors duration-300 appearance-none cursor-pointer touch-manipulation"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23FF4500' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
      }}
    >
      {children}
    </select>
  </div>
);

/* ── Service selector ───────────────────────────────────────────────────── */

const ServiceSelector = ({ selected, onToggle }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-4">
      Services Required <span className="text-[#FF4500]">*</span>
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {services.map(service => {
        const checked = selected.includes(service);
        return (
          <button
            key={service} type="button" onClick={() => onToggle(service)}
            /* min-h for comfortable touch targets on mobile (≥44px) */
            className={`flex items-center gap-4 px-4 py-4 sm:px-5 border-l-[4px] text-left transition-all duration-300 min-h-[52px] touch-manipulation ${
              checked
                ? 'border-[#FF4500] bg-[#FF4500]/10'
                : 'border-[#696969] bg-[#1a1a1a] hover:border-[#808080] hover:bg-[#252525]'
            }`}
          >
            <span className={`shrink-0 min-w-[16px] h-[16px] border-[2px] flex items-center justify-center transition-colors ${checked ? 'border-[#FF4500]' : 'border-[#696969]'}`}>
              {checked && <span className="w-[7px] h-[7px] bg-[#FF4500]" />}
            </span>
            <span className={`font-black text-[12px] uppercase tracking-[0.12em] leading-tight ${checked ? 'text-[#FF4500]' : 'text-[#D3D3D3]'}`}>
              {service}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

/* ── Delivery section ───────────────────────────────────────────────────── */

const DeliverySection = ({ enabled, distance, onToggle, onDistance }) => {
  const est = calcDeliveryEstimate(Number(distance));
  return (
    <div>
      <button
        type="button" onClick={onToggle}
        className={`w-full flex items-center gap-4 px-4 sm:px-6 py-5 border-l-[4px] text-left transition-all duration-300 min-h-[64px] touch-manipulation ${
          enabled ? 'border-[#FF4500] bg-[#FF4500]/10' : 'border-[#696969] bg-[#1a1a1a] hover:border-[#808080]'
        }`}
      >
        <span className={`shrink-0 min-w-[18px] h-[18px] border-[2px] flex items-center justify-center transition-colors ${enabled ? 'border-[#FF4500]' : 'border-[#696969]'}`}>
          {enabled && <span className="w-[8px] h-[8px] bg-[#FF4500]" />}
        </span>
        <div>
          <p className={`font-black text-[13px] uppercase tracking-[0.15em] mb-0.5 ${enabled ? 'text-[#FF4500]' : 'text-white'}`}>
            Delivery / Transport Required
          </p>
          <p className="text-[#A9A9A9] font-bold text-[12px]">Nationwide delivery from Johannesburg · R8/km</p>
        </div>
      </button>

      {enabled && (
        <div className="mt-4 bg-[#1a1a1a] border-[2px] border-[#696969] p-5 sm:p-8">
          <p className="text-[#FF4500] font-black text-[11px] tracking-[0.28em] uppercase mb-5 sm:mb-6">
            Delivery Fee Estimator
          </p>
          {/* Stack on mobile, side-by-side on sm+ */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-5 sm:gap-6">
            <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-[220px]">
              <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.22em] uppercase mb-3">
                Distance from JHB (km)
              </label>
              <input
                type="number" min="1" max="2000" value={distance}
                onChange={e => onDistance(e.target.value)} placeholder="e.g. 150"
                /* text-base prevents iOS zoom */
                className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors touch-manipulation"
              />
            </div>
            <div className="pb-1">
              {est ? (
                <div>
                  <p className="text-[#696969] font-black text-[10px] tracking-[0.2em] uppercase mb-1">Estimate</p>
                  <p className="text-[#FF4500] font-heading font-black text-[1.6rem] sm:text-[1.9rem] leading-none">
                    R{est.low.toLocaleString()} – R{est.high.toLocaleString()}
                  </p>
                  <p className="text-[#A9A9A9] font-bold text-[11px] mt-1">{distance} km · R8/km · ±10%</p>
                </div>
              ) : (
                <p className="text-[#696969] font-bold text-[14px]">Enter distance above</p>
              )}
            </div>
          </div>
          <p className="text-[#696969] font-bold text-[12px] mt-4 sm:mt-5 leading-[1.65]">
            Estimate only. Final delivery fee confirmed after successful vehicle acquisition.
          </p>
        </div>
      )}
    </div>
  );
};

/* ── Wizard steps ───────────────────────────────────────────────────────── */

const StepServices = ({ selected, onToggle }) => (
  <div>
    <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
      Services Required
    </h3>
    <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
      Select every service you need. Ventnor will quote on the full scope.
    </p>
    <ServiceSelector selected={selected} onToggle={onToggle} />
  </div>
);

const StepVehicle = ({ form, onChange }) => (
  <div>
    <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
      Vehicle & Budget
    </h3>
    <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
      Tell Ventnor what you're after. The more specific, the more accurate your quote.
    </p>
    <div className="space-y-5 sm:space-y-6">
      {/* Stack all 3 on mobile, 3-col on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <TextField label="Make"  name="vehicleMake"  placeholder="e.g. BMW"           value={form.vehicleMake}  onChange={onChange} />
        <TextField label="Model" name="vehicleModel" placeholder="e.g. M3 Competition" value={form.vehicleModel} onChange={onChange} />
        <SelectField label="Year" name="vehicleYear" value={form.vehicleYear} onChange={onChange}>
          <option value="" disabled>Select year</option>
          {vehicleYears.map(y => <option key={y} value={y} className="bg-[#111111]">{y}</option>)}
        </SelectField>
      </div>
      <SelectField label="Budget Range" name="budgetRange" value={form.budgetRange} onChange={onChange} required>
        <option value="" disabled>Select your budget ceiling</option>
        {budgetRanges.map(r => <option key={r} value={r} className="bg-[#111111]">{r}</option>)}
      </SelectField>
    </div>
  </div>
);

const StepDelivery = ({ form, onToggle, onDistance }) => (
  <div>
    <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
      Delivery
    </h3>
    <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
      Do you need the vehicle delivered to you after acquisition? We cover the entire country.
    </p>
    <DeliverySection
      enabled={form.deliveryRequired}
      distance={form.deliveryDistance}
      onToggle={onToggle}
      onDistance={onDistance}
    />
  </div>
);

const StepDetails = ({ form, onChange }) => (
  <div>
    <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
      Your Details
    </h3>
    <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
      Where Ventnor sends your quote. Responded to within 24 hours.
    </p>
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <TextField label="Full Name"     name="fullName" placeholder="Your full name"   value={form.fullName} onChange={onChange} required />
        <TextField label="Email Address" name="email"    type="email" placeholder="your@email.com" value={form.email} onChange={onChange} required />
      </div>
      <TextField label="Phone Number" name="phone" type="tel" placeholder="+27 71 000 0000" value={form.phone} onChange={onChange} />
      <div>
        <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
          Additional Notes
        </label>
        <textarea
          name="notes" rows={4} value={form.notes} onChange={onChange}
          placeholder="Specific requirements, colour preferences, timeline, anything else Ventnor should know…"
          className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors duration-300 resize-none touch-manipulation"
        />
      </div>
    </div>
  </div>
);

const StepReview = ({ selectedServices, form }) => {
  const est = calcDeliveryEstimate(Number(form.deliveryDistance));
  const rows = [
    ['Services',  selectedServices.join(', ') || '—'],
    ['Vehicle',   [form.vehicleMake, form.vehicleModel, form.vehicleYear].filter(Boolean).join(' ') || '—'],
    ['Budget',    form.budgetRange || '—'],
    ['Delivery',  form.deliveryRequired
      ? `Yes · ${form.deliveryDistance ? `${form.deliveryDistance}km` : 'distance TBC'}${est ? ` · R${est.low.toLocaleString()}–R${est.high.toLocaleString()} est.` : ''}`
      : 'Not required'],
    ['Name',      form.fullName],
    ['Email',     form.email],
    ['Phone',     form.phone || '—'],
  ];
  return (
    <div>
      <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
        Review & Submit
      </h3>
      <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
        Check everything below before submitting. Ventnor will respond with a tailored quote within 24 hours.
      </p>
      <div className="bg-[#1a1a1a] border-[2px] border-[#696969] mb-6 sm:mb-8">
        <div className="px-4 sm:px-8 py-4 bg-[#FF4500]/10 border-b border-[#696969]">
          <p className="text-[#FF4500] font-black text-[11px] tracking-[0.28em] uppercase">Quote Summary</p>
        </div>
        {rows.map(([label, value], i) => (
          /* flex-wrap lets long email / service lists wrap rather than overflow */
          <div key={i} className={`flex flex-wrap items-start gap-2 px-4 sm:px-8 py-3 sm:py-4 ${i < rows.length - 1 ? 'border-b border-[#696969]/30' : ''}`}>
            <span className="text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase w-[80px] shrink-0 mt-[2px]">{label}</span>
            <span className="text-white font-bold text-[13px] sm:text-[14px] leading-[1.6] flex-1 min-w-0 break-words">{value}</span>
          </div>
        ))}
        {form.notes && (
          <div className="px-4 sm:px-8 py-4 border-t border-[#696969]/30">
            <span className="text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase block mb-2">Notes</span>
            <span className="text-[#D3D3D3] font-bold text-[13px] leading-[1.65]">{form.notes}</span>
          </div>
        )}
      </div>
      <div className="flex items-start gap-4 bg-[#696969]/10 border-l-[4px] border-[#FF4500] px-4 sm:px-6 py-5">
        <span className="text-[#FF4500] font-black text-[18px] mt-0.5 shrink-0">!</span>
        <p className="text-[#D3D3D3] font-bold text-[13px] leading-[1.75]">
          This is a quote request only — no payment required now. Ventnor will send a full breakdown within 24 hours with no obligation to proceed.
        </p>
      </div>
    </div>
  );
};

/* ── Progress stepper ───────────────────────────────────────────────────── */

const Stepper = ({ step }) => (
  <div className="flex items-center mb-10 sm:mb-16 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
    {STEPS.map((s, i) => (
      <div key={i} className="flex items-center flex-1 last:flex-none min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-black text-[12px] sm:text-[13px] border-[2px] transition-all duration-300 shrink-0 ${
            i < step  ? 'bg-[#FF4500] border-[#FF4500] text-white'
            : i === step ? 'bg-[#111111] border-[#FF4500] text-[#FF4500]'
            : 'bg-[#111111] border-[#696969] text-[#696969]'
          }`}>{i < step ? '✓' : i + 1}</div>
          <span className={`font-black text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hidden sm:block transition-colors whitespace-nowrap ${i <= step ? 'text-white' : 'text-[#696969]'}`}>{s}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-[2px] mx-2 sm:mx-4 transition-colors duration-300 min-w-[12px] ${i < step ? 'bg-[#FF4500]' : 'bg-[#696969]/40'}`} />
        )}
      </div>
    ))}
  </div>
);

/* ── Main page ──────────────────────────────────────────────────────────── */

const GetQuote = () => {
  const wizardRef = useRef(null);
  const [step, setStep]                         = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [form, setForm]                         = useState(initialForm);
  const [status, setStatus]                     = useState('idle');
  const [errorMsg, setErrorMsg]                 = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleService = s => setSelectedServices(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const scrollToWizard = () => {
    if (wizardRef.current) {
      const top = wizardRef.current.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const canAdvance = () => {
    if (step === 0) return selectedServices.length > 0;
    if (step === 1) return !!form.budgetRange;
    if (step === 3) return !!form.fullName && !!form.email;
    return true;
  };

  const goNext = () => { setStep(s => s + 1); scrollToWizard(); };
  const goBack = () => { setStep(s => s - 1); scrollToWizard(); };

  const handleSubmit = async () => {
    setStatus('submitting');
    setErrorMsg('');
    const est = calcDeliveryEstimate(Number(form.deliveryDistance));
    try {
      const res = await fetch(api.quote, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          servicesRequested: selectedServices.join(', '),
          deliveryEstimate: est ? (est.low + est.high) / 2 : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        scrollToWizard();
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Unable to reach the server. Please try again or contact us directly.');
    }
  };

  /* ── Success screen ─────────────────────────────────────────────────── */
  if (status === 'success') return (
    <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center px-4 sm:px-6 py-28 sm:py-40">
      <div className="max-w-lg w-full bg-[#1a1a1a] border-t-[5px] border-[#FF4500] p-8 sm:p-14 text-center shadow-2xl">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF4500] flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white font-heading font-black text-[2rem] sm:text-[2.5rem] uppercase tracking-[0.1em] mb-4 sm:mb-5">
          Quote Request Received.
        </h2>
        <p className="text-[#D3D3D3] font-bold text-[14px] sm:text-[15px] leading-[1.85] mb-6 sm:mb-8">
          Ventnor will review your requirements and provide a tailored quote within 24 hours.
        </p>
        <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.22em] uppercase break-all">
          Confirmation sent to {form.email}
        </p>
      </div>
    </div>
  );

  /* ── Main render ────────────────────────────────────────────────────── */
  return (
    <div className="w-full bg-[#696969] font-sans overflow-x-hidden selection:bg-[#FF4500] selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pt-32 sm:pt-40 pb-16 sm:pb-20 bg-[#111111] overflow-hidden">
        <span aria-hidden="true" className="absolute right-[-1rem] bottom-[-2rem] font-heading font-black text-[28vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none">QUOTE</span>
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 mb-8 sm:mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
            Success Fee Quote
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[5rem] font-black font-heading uppercase leading-[1.01] mb-6 sm:mb-8 text-white tracking-tight">
            Get a<br /><span className="text-[#FF4500]">Tailored</span><br />Quote.
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#D3D3D3] leading-[1.8] font-bold border-l-[5px] border-[#FF4500] pl-5 sm:pl-7 max-w-xl">
            Tell TAG what vehicle you're after, your budget ceiling, and which services you need. Ventnor will respond with a precise success fee quote within 24 hours.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section ref={wizardRef} className="py-16 sm:py-24 bg-[#808080]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <Stepper step={step} />

          <div className="bg-[#111111] border-t-[5px] border-[#FF4500] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="p-5 sm:p-10 md:p-14">

              {step === 0 && <StepServices selected={selectedServices} onToggle={toggleService} />}
              {step === 1 && <StepVehicle  form={form} onChange={handleChange} />}
              {step === 2 && (
                <StepDelivery
                  form={form}
                  onToggle={() => setForm(p => ({ ...p, deliveryRequired: !p.deliveryRequired, deliveryDistance: '' }))}
                  onDistance={val => setForm(p => ({ ...p, deliveryDistance: val }))}
                />
              )}
              {step === 3 && <StepDetails  form={form} onChange={handleChange} />}
              {step === 4 && <StepReview   selectedServices={selectedServices} form={form} />}

              {status === 'error' && (
                <div className="mt-6 sm:mt-8 px-4 sm:px-6 py-4 bg-red-900/30 border-l-[4px] border-red-500">
                  <p className="text-red-400 font-bold text-[14px]">{errorMsg}</p>
                </div>
              )}

              {/* Navigation — stacks on mobile: submit on top, back below */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#696969]">
                <button
                  onClick={goBack} disabled={step === 0}
                  className="w-full sm:w-auto px-8 py-4 border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[11px] tracking-[0.22em] uppercase hover:border-[#808080] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                >
                  ← Back
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={goNext} disabled={!canAdvance()}
                    className="btn-primary w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit} disabled={status === 'submitting'}
                    className="btn-primary w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting…
                      </span>
                    ) : 'Request My Quote'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex items-start gap-4 bg-[#696969]/20 border-l-[4px] border-[#696969] px-5 sm:px-7 py-5">
            <span className="text-[#A9A9A9] font-black text-[16px] shrink-0">!</span>
            <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.75]">
              Quote requests carry <strong className="text-white">no obligation</strong>. Ventnor responds within 24 hours with a full breakdown. If you proceed to auction,{' '}
              a separate <strong className="text-white">{pricing.attendance.display}</strong> attendance fee applies.
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#111111] border-y-[4px] border-[#FF4500] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#696969]/30 text-center">
          {[
            { value: '24hr',    label: 'Quote Turnaround' },
            { value: '0',       label: 'Hidden Fees'      },
            { value: '100%',    label: 'Transparent'      },
            { value: 'SA-Wide', label: 'Client Coverage'  },
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

export default GetQuote;