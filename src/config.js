const ENV = import.meta.env.MODE || 'development';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost/tag-api';

export const calcDeliveryEstimate = (km) => {
  if (!km || km <= 0) return null;
  const base = Math.ceil(km * 8);
  return {
    km,
    base,
    low:  Math.max(200, Math.round(base * 0.9 / 50) * 50),
    high: Math.round(base * 1.1 / 50) * 50,
  };
};

const CONFIG = {
  env: ENV,

  auth: `${API_BASE}/auth.php`,

  api: {
    contact:      `${API_BASE}/contact.php`,
    appointments: `${API_BASE}/appointments.php`,
    quote:        `${API_BASE}/quote.php`,
    admin: {
      auth:         `${API_BASE}/auth.php`,
      dashboard:    `${API_BASE}/admin.php?action=dashboard`,
      appointments: `${API_BASE}/admin.php?action=appointments`,
      appointment:  (id) => `${API_BASE}/admin.php?action=appointment&id=${id}`,
      quotes:       `${API_BASE}/admin.php?action=quotes`,
      quote:        (id) => `${API_BASE}/admin.php?action=quote&id=${id}`,
      enquiries:    `${API_BASE}/admin.php?action=enquiries`,
      blockedDates: `${API_BASE}/admin.php?action=blocked_dates`,
      slots:        `${API_BASE}/admin.php?action=slots`,
      slotsApi:     `${API_BASE}/slots.php`,
    },
  },

  brand: {
    name:      'The Auction Guy',
    shortName: 'TAG',
    founder:   'Ventnor Goosen',
    phone:     '071 169 6716',
    phoneHref: 'tel:+27711696716',
    email:     'info@theauctionguyza.co.za',
    emailHref: 'mailto:info@theauctionguyza.co.za',
    location:  'Johannesburg, South Africa',
    slogan:    'Steer your future, drive your dreams.',
  },

  auctionHouses: ['Burchmores', 'WeBuyCars', 'Aucor', 'SMA'],

  pricing: {
    attendance: {
      label:   'Auction Attendance Fee',
      min:     1000,
      max:     2000,
      display: 'R1,000 – R2,000',
      nature:  'Non-refundable · Due before attendance',
    },
    successFee: {
      label:   'Success Fee',
      display: 'On successful bid',
      nature:  'Quoted on brief review',
    },
    inspection: {
      label:   'Vehicle Inspection',
      min:     500,
      max:     1000,
      display: 'R500 – R1,000',
      nature:  'Optional · Per vehicle',
    },
    delivery: {
      label:      'Transport & Delivery',
      ratePerKm:  8,
      baseKm:     25,
      baseAmount: 200,
      nature:     'Nationwide · Post-purchase',
    },
    consultation: {
      label: 'Consultation',
      halfHour: { label: '30 Minutes', fee: 250,  display: 'R250' },
      fullHour: { label: '60 Minutes', fee: 500,  display: 'R500' },
      nature:   'Payable via EFT before appointment',
    },
  },

  consultationTypes: [
    { value: 'vehicle_acquisition', label: 'Vehicle Acquisition',    desc: 'Planning to buy at auction and need expert guidance on the process, timing, and budgeting.' },
    { value: 'fleet',               label: 'Fleet & Trade',          desc: 'Dealers or fleet managers sourcing multiple vehicles. Volume strategy and auction calendar planning.' },
    { value: 'export',              label: 'Export / Cross-Border',  desc: 'Buying vehicles for export to neighbouring countries. Documentation, compliance, and logistics advice.' },
    { value: 'general',             label: 'General Enquiry',        desc: 'Questions about how TAG works, fees, timelines, or anything else before committing.' },
    { value: 'other',               label: 'Other',                  desc: 'Anything not covered above — describe your situation and Ventnor will prepare accordingly.' },
  ],

  budgetRanges: [
    'Under R100,000',
    'R100,000 – R250,000',
    'R250,000 – R500,000',
    'R500,000 – R1,000,000',
    'R1,000,000+',
    'Prefer not to say',
  ],

  services: [
    'Vehicle Inspection',
    'Registration & Documentation',
    'Strategy, Bidding & Buying',
    'Financing & Payment',
    'Collection & Logistics',
    'Full-Service Representation',
  ],

  booking: {
    availableDays:      [1, 2, 3, 4, 5, 6],
    startHour:          9,
    endHour:            17,
    advanceBookingDays: 60,
    minimumNoticeHours: 24,
  },
};

export default CONFIG;