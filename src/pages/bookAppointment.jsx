import { useState, useEffect, useCallback, useRef } from 'react';
import CONFIG from '../config';

const { consultationTypes, budgetRanges, booking, pricing, api } = CONFIG;

const buildSlots = (durationMins) => {
  const slots = [];
  const lastStart = booking.endHour * 60 - durationMins;
  for (let m = booking.startHour * 60; m <= lastStart; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`);
  }
  return slots;
};

const STEPS = ['Type', 'Date & Time', 'Your Details', 'Confirm'];
const initialDetails = { fullName:'', email:'', phone:'', vehicleInterest:'', budget:'', notes:'' };

function formatDate(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function isDateAvailable(year, month, day, blockedSet) {
  const dow = new Date(year, month, day).getDay();
  if (!booking.availableDays.includes(dow)) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(year, month, day);
  const minDate = new Date(today); minDate.setDate(today.getDate() + Math.ceil(booking.minimumNoticeHours / 24));
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + booking.advanceBookingDays);
  if (target < minDate || target > maxDate) return false;
  return !blockedSet.has(formatDate(year, month, day));
}

/* ── Shared form field ──────────────────────────────────────────────────── */

const FormField = ({ label, name, type = 'text', placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
      {label}{required && <span className="text-[#FF4500] ml-1">*</span>}
    </label>
    {/* text-base = 16px prevents iOS Safari auto-zoom */}
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors duration-300 touch-manipulation"
    />
  </div>
);

/* ── Progress stepper ───────────────────────────────────────────────────── */

const Stepper = ({ step }) => (
  /* overflow-x-auto lets it scroll rather than wrapping/breaking on very small screens */
  <div className="flex items-center mb-10 sm:mb-16 overflow-x-auto pb-2 sm:pb-0">
    {STEPS.map((s, i) => (
      <div key={i} className="flex items-center flex-1 last:flex-none">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-black text-[12px] sm:text-[13px] border-[2px] transition-all duration-300 shrink-0 ${
            i < step  ? 'bg-[#FF4500] border-[#FF4500] text-white'
            : i === step ? 'bg-[#111111] border-[#FF4500] text-[#FF4500]'
            : 'bg-[#111111] border-[#696969] text-[#696969]'
          }`}>{i < step ? '✓' : i + 1}</div>
          <span className={`font-black text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hidden sm:block transition-colors whitespace-nowrap ${i <= step ? 'text-white' : 'text-[#696969]'}`}>{s}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-[2px] mx-2 sm:mx-4 min-w-[12px] transition-colors duration-300 ${i < step ? 'bg-[#FF4500]' : 'bg-[#696969]/40'}`} />
        )}
      </div>
    ))}
  </div>
);

/* ── Step 0 — Consultation type ─────────────────────────────────────────── */

const StepType = ({ selected, duration, onSelect, onDuration }) => (
  <div>
    <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
      Select Consultation Type
    </h3>
    <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
      Choose the type that best describes your situation. This helps Ventnor prepare before your session.
    </p>

    <div className="space-y-3 mb-8 sm:mb-10">
      {consultationTypes.map(ct => (
        <button
          key={ct.value} onClick={() => onSelect(ct.value)}
          /* min-h ensures comfortable touch target (≥44px) */
          className={`w-full flex items-start gap-4 sm:gap-5 p-5 sm:p-6 border-l-[5px] text-left transition-all duration-300 min-h-[64px] touch-manipulation ${
            selected === ct.value
              ? 'border-[#FF4500] bg-[#FF4500]/10'
              : 'border-[#696969] bg-[#1a1a1a] hover:border-[#808080] hover:bg-[#252525]'
          }`}
        >
          <span className={`shrink-0 min-w-[18px] h-[18px] mt-[3px] border-[2px] flex items-center justify-center transition-colors ${selected === ct.value ? 'border-[#FF4500]' : 'border-[#696969]'}`}>
            {selected === ct.value && <span className="w-[8px] h-[8px] bg-[#FF4500]" />}
          </span>
          <div>
            <p className={`font-black uppercase tracking-[0.15em] text-[12px] sm:text-[13px] mb-1.5 ${selected === ct.value ? 'text-[#FF4500]' : 'text-white'}`}>{ct.label}</p>
            <p className="text-[#A9A9A9] font-bold text-[12px] sm:text-[13px] leading-[1.65]">{ct.desc}</p>
          </div>
        </button>
      ))}
    </div>

    <div className="border-t border-[#696969] pt-6 sm:pt-8">
      <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-4 sm:mb-5">
        Session Duration & Fee
      </p>
      {/* Duration cards — 1-col on very small screens, 2-col on sm+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        {[
          { key: 30, data: pricing.consultation.halfHour },
          { key: 60, data: pricing.consultation.fullHour },
        ].map(({ key, data }) => (
          <button
            key={key} onClick={() => onDuration(key)}
            className={`p-5 sm:p-6 border-[2px] transition-all duration-300 text-left min-h-[88px] touch-manipulation ${
              duration === key ? 'border-[#FF4500] bg-[#FF4500]/10' : 'border-[#696969] bg-[#1a1a1a] hover:border-[#808080]'
            }`}
          >
            <p className={`font-black text-[12px] uppercase tracking-[0.12em] mb-1 ${duration === key ? 'text-[#FF4500]' : 'text-white'}`}>{data.label}</p>
            {/* Slightly smaller on mobile so it doesn't overflow */}
            <p className="text-white font-heading font-black text-[1.6rem] sm:text-[2rem] leading-none mb-1">{data.display}</p>
            <p className="text-[#A9A9A9] font-bold text-[11px]">{pricing.consultation.nature}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ── Step 1 — Date & Time ───────────────────────────────────────────────── */

const StepDateTime = ({ selectedDate, selectedTime, duration, blockedDates, onDate, onTime, apiBase }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots,   setLoadingSlots]   = useState(false);

  const blockedSet   = new Set(blockedDates);
  const firstDow     = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel   = new Date(viewYear, viewMonth).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const blanks       = Array(firstDow === 0 ? 6 : firstDow - 1).fill(null);
  const cells        = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  useEffect(() => {
    if (!selectedDate) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    setAvailableSlots([]);
    fetch(`${apiBase}?action=available_slots&date=${selectedDate}&duration=${duration}`)
      .then(r => r.json())
      .then(data => { if (data.success) setAvailableSlots(data.slots || []); })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, duration]);

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11); } else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0); } else setViewMonth(m=>m+1); };

  return (
    <div>
      <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
        Pick a Date & Time
      </h3>
      <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
        Available Mon–Sat · Min {booking.minimumNoticeHours}hr notice · Up to {booking.advanceBookingDays} days ahead
      </p>

      {/* Calendar + slots — stack on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">

        {/* Calendar */}
        <div className="bg-[#1a1a1a] border-[2px] border-[#696969] w-full">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#696969]">
            <button onClick={prevMonth} className="text-[#A9A9A9] hover:text-[#FF4500] font-black text-[22px] w-10 h-10 flex items-center justify-center transition-colors touch-manipulation">‹</button>
            <p className="text-white font-black text-[12px] sm:text-[13px] tracking-[0.18em] uppercase">{monthLabel}</p>
            <button onClick={nextMonth} className="text-[#A9A9A9] hover:text-[#FF4500] font-black text-[22px] w-10 h-10 flex items-center justify-center transition-colors touch-manipulation">›</button>
          </div>
          <div className="grid grid-cols-7 border-b border-[#696969]">
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} className={`text-center py-2.5 font-black text-[10px] tracking-[0.12em] ${i===6?'text-[#FF4500]/40':'text-[#696969]'}`}>{d}</div>
            ))}
          </div>
          {/* Day cells — larger touch targets on mobile */}
          <div className="grid grid-cols-7 p-2 sm:p-3 gap-0.5 sm:gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const avail  = isDateAvailable(viewYear, viewMonth, day, blockedSet);
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isSel   = selectedDate === dateStr;
              return (
                <button
                  key={i} disabled={!avail}
                  onClick={() => { onDate(dateStr); onTime(''); }}
                  /* min-h-[40px] gives a more tappable target on mobile */
                  className={`min-h-[36px] sm:min-h-[40px] aspect-square flex items-center justify-center font-black text-[12px] sm:text-[13px] transition-all duration-200 touch-manipulation ${
                    isSel ? 'bg-[#FF4500] text-white'
                    : avail ? 'text-white hover:bg-[#FF4500]/20 hover:text-[#FF4500]'
                    : 'text-[#696969]/35 cursor-not-allowed'
                  }`}
                >{day}</button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          {selectedDate ? (
            <>
              <p className="text-[#FF4500] font-black text-[11px] tracking-[0.28em] uppercase mb-4">
                {new Date(selectedDate+'T00:00:00').toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'})}
              </p>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-10 border-[2px] border-dashed border-[#696969]">
                  <svg className="animate-spin w-5 h-5 text-[#FF4500]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex items-center justify-center py-10 border-[2px] border-dashed border-[#696969]">
                  <p className="text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase text-center px-4">
                    No {duration}-min slots available on this date.
                  </p>
                </div>
              ) : (
                /* 3-col on sm+, 2-col on xs to avoid cramping */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot} onClick={() => onTime(slot)}
                      /* min-h-[44px] meets Apple/Android recommended touch target */
                      className={`min-h-[44px] py-3 font-black text-[13px] tracking-[0.1em] border-[2px] transition-all duration-200 touch-manipulation ${
                        selectedTime === slot
                          ? 'bg-[#FF4500] border-[#FF4500] text-white'
                          : 'border-[#696969] text-[#D3D3D3] hover:border-[#FF4500] hover:text-[#FF4500] bg-[#1a1a1a]'
                      }`}
                    >{slot}</button>
                  ))}
                </div>
              )}
              <p className="text-[#696969] font-bold text-[12px] mt-4">All times SAST (UTC+2) · Only available slots shown</p>
            </>
          ) : (
            <div className="h-full min-h-[180px] sm:min-h-[200px] flex items-center justify-center border-[2px] border-dashed border-[#696969] p-8 sm:p-10">
              <p className="text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase text-center">
                Select a date to see available slots
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected slot banner */}
      {selectedDate && selectedTime && (
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 bg-[#FF4500]/10 border-l-[5px] border-[#FF4500] px-5 sm:px-7 py-5">
          <span className="text-[#FF4500] text-[20px] shrink-0">✓</span>
          <div>
            <p className="text-white font-black text-[13px] sm:text-[14px]">
              {new Date(selectedDate+'T00:00:00').toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} at {selectedTime}
            </p>
            <p className="text-[#A9A9A9] font-bold text-[12px] mt-0.5">
              {duration} min · {duration===30 ? pricing.consultation.halfHour.display : pricing.consultation.fullHour.display}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Step 2 — Your Details ──────────────────────────────────────────────── */

const StepDetails = ({ details, onChange }) => (
  <div>
    <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
      Your Details
    </h3>
    <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
      Required for confirmation and so Ventnor can prepare for your specific situation.
    </p>
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormField label="Full Name"     name="fullName" type="text"  placeholder="Your full name"   value={details.fullName} onChange={onChange} required />
        <FormField label="Email Address" name="email"    type="email" placeholder="your@email.com"   value={details.email}    onChange={onChange} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormField label="Phone Number"  name="phone"   type="tel"  placeholder="+27 71 000 0000"  value={details.phone}   onChange={onChange} />
        {/* Budget select */}
        <div>
          <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">Budget Range</label>
          <select
            name="budget" value={details.budget} onChange={onChange}
            /* text-base prevents iOS zoom; pr-10 keeps arrow clear */
            className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 pr-10 focus:outline-none focus:border-[#FF4500] transition-colors duration-300 appearance-none cursor-pointer touch-manipulation"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23FF4500' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
            }}
          >
            <option value="" disabled>Select budget</option>
            {budgetRanges.map(r => <option key={r} value={r} className="bg-[#111111]">{r}</option>)}
          </select>
        </div>
      </div>
      <FormField label="Vehicle of Interest" name="vehicleInterest" type="text"
        placeholder="e.g. BMW M3, Porsche 911 — be as specific as you like"
        value={details.vehicleInterest} onChange={onChange} />
      <div>
        <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">
          Notes for Ventnor
        </label>
        <textarea
          name="notes" rows={4} value={details.notes} onChange={onChange}
          placeholder="Questions you'd like to discuss, timeline requirements, anything else…"
          className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-base px-4 py-3.5 sm:px-5 sm:py-4 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors duration-300 resize-none touch-manipulation"
        />
      </div>
    </div>
  </div>
);

/* ── Step 3 — Confirm ───────────────────────────────────────────────────── */

const StepConfirm = ({ consultType, duration, selectedDate, selectedTime, details }) => {
  const typeLabel = consultationTypes.find(c=>c.value===consultType)?.label || consultType;
  const feeData   = duration===30 ? pricing.consultation.halfHour : pricing.consultation.fullHour;
  const dateDisplay = selectedDate
    ? new Date(selectedDate+'T00:00:00').toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    : '';
  const rows = [
    ['Type',     typeLabel],
    ['Date',     dateDisplay],
    ['Time',     `${selectedTime} SAST`],
    ['Duration', feeData.label],
    ['Fee',      feeData.display],
    ['Name',     details.fullName],
    ['Email',    details.email],
    ['Phone',    details.phone || '—'],
    ['Budget',   details.budget || '—'],
    ['Vehicle',  details.vehicleInterest || '—'],
  ];
  return (
    <div>
      <h3 className="text-white font-heading font-black text-[22px] sm:text-[26px] uppercase tracking-[0.12em] mb-3 border-b border-[#696969] pb-5 sm:pb-6">
        Review & Confirm
      </h3>
      <p className="text-[#A9A9A9] font-bold text-[14px] mb-8 sm:mb-10 leading-[1.75]">
        Please review before submitting. Payment instructions will be sent by email to confirm your slot.
      </p>
      <div className="bg-[#1a1a1a] border-[2px] border-[#696969] mb-6 sm:mb-8">
        <div className="px-4 sm:px-8 py-4 bg-[#FF4500]/10 border-b border-[#696969]">
          <p className="text-[#FF4500] font-black text-[11px] tracking-[0.28em] uppercase">Booking Summary</p>
        </div>
        {rows.map(([label, value], i) => (
          /* flex-wrap lets long email addresses break rather than overflow */
          <div key={i} className={`flex flex-wrap items-start gap-2 px-4 sm:px-8 py-3 sm:py-4 ${i<rows.length-1?'border-b border-[#696969]/30':''}`}>
            <span className="text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase w-[90px] sm:w-[110px] shrink-0 mt-[2px]">{label}</span>
            <span className="text-white font-bold text-[13px] sm:text-[14px] flex-1 min-w-0 break-words">{value}</span>
          </div>
        ))}
        {details.notes && (
          <div className="px-4 sm:px-8 py-4 border-t border-[#696969]/30">
            <span className="text-[#696969] font-black text-[11px] tracking-[0.2em] uppercase block mb-2">Notes</span>
            <span className="text-[#D3D3D3] font-bold text-[13px] leading-[1.65]">{details.notes}</span>
          </div>
        )}
      </div>
      <div className="flex items-start gap-4 bg-[#696969]/10 border-l-[4px] border-[#FF4500] px-4 sm:px-6 py-5">
        <span className="text-[#FF4500] font-black text-[18px] mt-0.5 shrink-0">!</span>
        <p className="text-[#D3D3D3] font-bold text-[13px] leading-[1.75]">
          Payment of <strong className="text-white">{feeData.display}</strong> via EFT is required to confirm your booking.{' '}
          <strong className="text-white">Your slot is not reserved until payment is received.</strong>
        </p>
      </div>
    </div>
  );
};

/* ── Main page ──────────────────────────────────────────────────────────── */

const BookAppointment = () => {
  const wizardRef = useRef(null);
  const [step, setStep]               = useState(0);
  const [consultType, setConsultType] = useState('');
  const [duration, setDuration]       = useState(60);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [details, setDetails]           = useState(initialDetails);
  const [blockedDates, setBlockedDates] = useState([]);
  const [status, setStatus]             = useState('idle');
  const [errorMsg, setErrorMsg]         = useState('');

  useEffect(() => {
    fetch(`${api.appointments}?action=blocked_dates`)
      .then(r => r.json())
      .then(data => { if (data.success) setBlockedDates(data.data.map(d => d.blocked_date)); })
      .catch(() => {});
  }, []);

  const scrollToWizard = () => {
    if (wizardRef.current) {
      const top = wizardRef.current.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleDetailChange = useCallback(e => {
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const canAdvance = () => {
    if (step === 0) return !!consultType;
    if (step === 1) return !!selectedDate && !!selectedTime;
    if (step === 2) return !!details.fullName && !!details.email;
    return true;
  };

  const goNext = () => { setStep(s => s + 1); scrollToWizard(); };
  const goBack = () => { setStep(s => s - 1); scrollToWizard(); };

  const handleSubmit = async () => {
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(api.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultType, duration,
          date: selectedDate,
          time: selectedTime,
          fee: duration === 30 ? pricing.consultation.halfHour.fee : pricing.consultation.fullHour.fee,
          ...details,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
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

  /* ── Success screen ─────────────────────────────────────────────────── */
  if (status === 'success') return (
    <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center px-4 sm:px-6 py-28 sm:py-40">
      <div className="max-w-lg w-full bg-[#1a1a1a] border-t-[5px] border-[#FF4500] p-8 sm:p-14 text-center shadow-2xl">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF4500] flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-white font-heading font-black text-[2rem] sm:text-[2.5rem] uppercase tracking-[0.1em] mb-4 sm:mb-5">
          Booking Received.
        </h2>
        <p className="text-[#D3D3D3] font-bold text-[14px] sm:text-[15px] leading-[1.85] mb-6 sm:mb-8">
          Ventnor will confirm within 24 hours. Payment instructions for your{' '}
          <strong className="text-white">{duration === 30 ? pricing.consultation.halfHour.display : pricing.consultation.fullHour.display}</strong>{' '}
          session will be included.
        </p>
        <p className="text-[#A9A9A9] font-black text-[11px] tracking-[0.22em] uppercase break-all">
          Confirmation sent to {details.email}
        </p>
      </div>
    </div>
  );

  /* ── Main render ────────────────────────────────────────────────────── */
  return (
    <div className="w-full bg-[#696969] font-sans overflow-x-hidden selection:bg-[#FF4500] selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pt-32 sm:pt-40 pb-16 sm:pb-20 bg-[#111111] overflow-hidden">
        <span aria-hidden="true" className="absolute right-[-1rem] bottom-[-2rem] font-heading font-black text-[28vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none">BOOK</span>
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]"/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 mb-8 sm:mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"/>
            Consultation Booking
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[5rem] font-black font-heading uppercase leading-[1.01] mb-6 sm:mb-8 text-white tracking-tight">
            Book a<br /><span className="text-[#FF4500]">Consultation</span><br />with Ventnor.
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#D3D3D3] leading-[1.8] font-bold border-l-[5px] border-[#FF4500] pl-5 sm:pl-7 max-w-xl">
            30 or 60-minute sessions, Monday to Saturday. Strategy, acquisition planning, fleet, export — payable via EFT before your appointment.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section ref={wizardRef} className="py-16 sm:py-24 bg-[#808080]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <Stepper step={step} />

          <div className="bg-[#111111] border-t-[5px] border-[#FF4500] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="p-5 sm:p-10 md:p-14">

              {step === 0 && <StepType     selected={consultType} duration={duration} onSelect={setConsultType} onDuration={setDuration}/>}
              {step === 1 && <StepDateTime selectedDate={selectedDate} selectedTime={selectedTime} duration={duration} blockedDates={blockedDates} onDate={setSelectedDate} onTime={setSelectedTime} apiBase={api.appointments}/>}
              {step === 2 && <StepDetails  details={details} onChange={handleDetailChange}/>}
              {step === 3 && <StepConfirm  consultType={consultType} duration={duration} selectedDate={selectedDate} selectedTime={selectedTime} details={details}/>}

              {status === 'error' && (
                <div className="mt-6 sm:mt-8 px-4 sm:px-6 py-4 bg-red-900/30 border-l-[4px] border-red-500">
                  <p className="text-red-400 font-bold text-[14px]">{errorMsg}</p>
                </div>
              )}

              {/* Navigation — stacks reversed on mobile: action on top, back below */}
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
                    onClick={handleSubmit} disabled={status === 'submitting' || !canAdvance()}
                    className="btn-primary w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Submitting…
                      </span>
                    ) : 'Confirm Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex items-start gap-4 bg-[#696969]/20 border-l-[4px] border-[#696969] px-5 sm:px-7 py-5">
            <span className="text-[#A9A9A9] font-black text-[16px] shrink-0">!</span>
            <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.75]">
              This books a <strong className="text-white">consultation only</strong>. If you proceed to auction representation, a separate{' '}
              <strong className="text-white">{pricing.attendance.display}</strong> non-refundable attendance fee applies.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default BookAppointment;