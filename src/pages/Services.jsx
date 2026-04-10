import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calcDeliveryEstimate } from '../config';

const coreServices = [
  {
    code: 'S01', icon: '◈', title: 'Vehicle Inspection',
    subtitle: 'Expert eyes before the gavel falls.',
    price: 'R500 – R1,000', priceNote: 'Optional · Add-on',
    desc: 'I conduct a comprehensive physical inspection of the vehicle during the pre-auction viewing period, identifying any potential faults the auction house is legally required to disclose in writing. You receive detailed video footage and a condition report before a single bid is placed.',
    includes: ['In-person pre-auction physical inspection','Mechanical and cosmetic fault identification','Auction house disclosure verification','Video footage delivered to client before bidding','Data-driven vehicle history and record checks','Honest, unbiased condition assessment'],
  },
  {
    code: 'S02', icon: '◎', title: 'Registration & Documentation',
    subtitle: 'Compliance handled. Paperwork eliminated.',
    price: 'Included', priceNote: 'With all packages',
    desc: 'I guide you through the full registration process, which typically requires FICA documents (ID and proof of address) and a refundable deposit, and complete all necessary auction paperwork on your behalf if the bid is successful.',
    includes: ['FICA documentation guidance (ID & proof of address)','Auction registration completed on your behalf','Refundable deposit coordination','All post-auction paperwork handled in full','Legal compliance verification at every step','Change-of-ownership documentation processing'],
  },
  {
    code: 'S03', icon: '◆', title: 'Strategy, Bidding & Buying',
    subtitle: 'Disciplined execution. Zero emotional overbidding.',
    price: 'Success Fee', priceNote: 'Quoted on brief review',
    desc: 'I help you set a clear maximum bid ceiling and never exceed it. Armed with your pre-approved parameters and backed by market intelligence, I place bids on the floor with calm, self-assured precision, acting purely on strategy, never emotion.',
    includes: ['Pre-auction budget strategy consultation','Strict maximum bid limit adherence','Real-time auction floor representation','Market price benchmarking and guidance','Competitive floor intelligence in the moment','Full post-auction outcome debrief'],
  },
  {
    code: 'S04', icon: '◉', title: 'Financing & Payment',
    subtitle: 'Pre-approved. On time. Every time.',
    price: 'Included', priceNote: 'With all packages',
    desc: 'I help coordinate pre-approved financing arrangements and ensure timely payment within the required window, typically within 48 hours of a successful auction, so your acquisition is never placed at risk.',
    includes: ['Pre-approved financing coordination','48-hour post-auction payment management','Finance provider liaison and follow-up','Payment timeline compliance assurance','EFT and secure payment processing','Full transactional documentation support'],
  },
  {
    code: 'S05', icon: '◐', title: 'Collection & Logistics',
    subtitle: 'Your vehicle. Delivered to your door.',
    price: 'Calculated by distance', priceNote: 'Nationwide · If applicable',
    desc: 'Post-purchase, I manage the complete change-of-ownership documentation and coordinate secure vehicle collection and delivery, directly to your city, anywhere in South Africa. This makes TAG a fully turn-key service for out-of-province clients.',
    includes: ['Change-of-ownership documentation processing','Nationwide delivery coordination','Secure vehicle collection management','Out-of-province client logistics','"Auction + Delivery" package available','Client handover condition confirmation'],
    hasCalculator: true,
  },
];

const pricingRows = [
  { service: 'Auction Attendance Fee',     amount: 'R1,000 – R2,000',       nature: 'Non-refundable',        timing: 'Before attendance',    highlight: false },
  { service: 'Success Fee / Commission',   amount: 'Quoted on brief review', nature: 'On successful bid',     timing: 'Post-purchase',         highlight: true  },
  { service: 'Vehicle Inspection Fee',     amount: 'R500 – R1,000',          nature: 'Optional add-on',       timing: 'Before auction',        highlight: false },
  { service: 'Transport / Delivery Fee',   amount: 'Calculated by distance', nature: 'If applicable',         timing: 'Post-purchase',         highlight: false },
  { service: 'Consultation Fee',           amount: 'R250 – R500',            nature: '30 min / 60 min',       timing: 'Before appointment',    highlight: false },
];

const targetClients = [
  { type: 'Private Buyers',             icon: '01', desc: 'Individuals who want access to cheaper, quality vehicles without navigating the complexity and pressure of auction floors themselves.' },
  { type: 'Used Car Dealers',           icon: '02', desc: 'Dealers who need to stock inventory regularly but cannot afford the time and resources to manage auction attendance themselves.' },
  { type: 'Export Buyers',              icon: '03', desc: 'Buyers from neighbouring countries who need a trusted, local South African buyer to represent them at Johannesburg auctions.' },
  { type: 'Serious Collectors & HNWIs', icon: '04', desc: 'Affluent individuals seeking investment-grade classics, rare exotics, and status vehicles, acquired with absolute discretion and precision.' },
];

const processSteps = [
  { step: '01', stage: 'Brief',   title: 'Submit Your Brief',       desc: 'Tell me the vehicle you want, your hard budget ceiling, and any must-have specifications. The more detail, the sharper the strategy.' },
  { step: '02', stage: 'Inspect', title: 'Pre-Auction Inspection',  desc: 'I physically inspect the vehicle during the viewing period. You receive video footage and a full condition report before any bid is authorised.' },
  { step: '03', stage: 'Bid',     title: 'Floor Representation',    desc: 'I attend the auction and bid strictly within your pre-approved limit. Calm, decisive, strategic, never emotional.' },
  { step: '04', stage: 'Acquire', title: 'Paperwork & Payment',     desc: 'If successful, I complete all auction documentation and coordinate payment within the required 48-hour window.' },
  { step: '05', stage: 'Deliver', title: 'Collection & Delivery',   desc: 'I manage change-of-ownership and arrange secure delivery of your vehicle directly to your door, anywhere in South Africa.' },
];

const scopeItems = [
  { num: '01', title: 'Attend on Your Behalf',             desc: 'I attend the agreed auction(s) in person, representing you on the floor so you never have to be there yourself.' },
  { num: '02', title: 'Inspect & Report',                   desc: 'I inspect the selected vehicle(s) and provide detailed condition reports and photos where possible before bidding commences.' },
  { num: '03', title: 'Bid Within Your Limit',              desc: 'I bid on the vehicle(s) up to the maximum bid limit set by you, the Client, and never a rand above it.' },
  { num: '04', title: 'Complete All Paperwork',             desc: 'I complete the necessary auction paperwork on your behalf if the bid is successful, ensuring every legal requirement is met.' },
  { num: '05', title: 'Assist With Collection & Delivery',  desc: 'I assist with vehicle collection or delivery if included in the package, from change-of-ownership documentation to your door.' },
];

const clientResponsibilities = [
  'Provide valid identification (ID) and proof of address for auction registration',
  'Communicate clearly and promptly via email or WhatsApp',
  'Ensure sufficient funds are available before the auction date',
  'Provide a firm maximum bid limit before the auction begins',
  'Settle the attendance fee via EFT before TAG attends on your behalf',
];

const DeliveryCalculator = () => {
  const [km, setKm] = useState('');
  const est = calcDeliveryEstimate(Number(km));

  return (
    <div className="mt-8 bg-[#1a1a1a] border-t-[3px] border-[#FF4500] p-8">
      <p className="text-[#FF4500] font-black text-[11px] tracking-[0.3em] uppercase mb-5">Delivery Fee Estimator</p>
      <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7] mb-6">
        Enter the distance from Johannesburg to your delivery address to get a rough estimate. Final fee confirmed after successful bid.
      </p>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-[200px]">
          <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-3">Distance (km)</label>
          <input
            type="number" min="1" max="2000"
            value={km} onChange={e => setKm(e.target.value)}
            placeholder="e.g. 150"
            className="w-full bg-[#696969] border-[2px] border-[#808080] text-white font-bold text-[16px] px-4 py-3 placeholder-[#A9A9A9] focus:outline-none focus:border-[#FF4500] transition-colors"
          />
        </div>
        <div className="pt-7 text-[#696969] font-bold text-[14px]">= approx.</div>
        <div className="pt-7">
          {est ? (
            <div>
              <p className="text-[#FF4500] font-heading font-black text-[2rem] leading-none">
                R{est.low.toLocaleString()} – R{est.high.toLocaleString()}
              </p>
              <p className="text-[#A9A9A9] font-bold text-[12px] mt-1">Based on R8/km · {km} km from Johannesburg</p>
            </div>
          ) : (
            <p className="text-[#696969] font-bold text-[14px]">Enter distance above</p>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3 bg-[#696969]/10 border-l-[3px] border-[#696969] px-5 py-3">
        <span className="text-[#696969] text-[16px]">!</span>
        <p className="text-[#696969] font-bold text-[12px] leading-[1.65]">
          Estimate only. Actual delivery fee is quoted and confirmed after successful vehicle acquisition. Nationwide coverage, Cape Town to Limpopo.
        </p>
      </div>
    </div>
  );
};

const Services = () => {
  const [activeService, setActiveService] = useState(0);
  const service = coreServices[activeService];

  return (
    <div className="w-full bg-[#696969] font-sans overflow-x-hidden selection:bg-[#FF4500] selection:text-white">

      <section className="relative min-h-screen flex items-end pt-40 pb-24 bg-[#111111] overflow-hidden">
        <span aria-hidden="true" className="absolute right-[-2rem] top-1/2 -translate-y-1/2 font-heading font-black text-[32vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none">05</span>
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]" />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
            Professional Buyer's Agent · Johannesburg, SA
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black font-heading uppercase leading-[1.0] mb-10 text-white tracking-tight">
                Five Services.<br /><span className="text-[#FF4500]">One Seamless</span><br />Acquisition.
              </h1>
              <p className="text-[17px] text-[#D3D3D3] leading-[1.8] font-bold border-l-[5px] border-[#FF4500] pl-7 max-w-xl">
                From the moment you brief me on your ideal vehicle to the moment it arrives at your door, I manage the entire lifecycle. You never need to set foot on an auction floor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: 'R1k–2k',   label: 'Attendance Fee'    },
                { val: 'R250–500', label: 'Consultation'       },
                { val: '48hr',     label: 'Payment Window'     },
                { val: 'SA-Wide',  label: 'Delivery Coverage'  },
              ].map((s, i) => (
                <div key={i} className={`p-6 border-[2px] ${i === 0 ? 'border-[#FF4500] bg-[#FF4500]/10' : 'border-[#696969] bg-[#1a1a1a]'}`}>
                  <div className="text-white font-heading font-black text-[2.2rem] leading-none mb-2">{s.val}</div>
                  <div className="text-[#A9A9A9] font-black text-[11px] tracking-[0.22em] uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 pt-10 border-t-[1px] border-[#696969]/40 flex flex-wrap items-center gap-4 md:gap-12">
            <span className="text-[#696969] font-black text-[11px] tracking-[0.22em] uppercase">Active Across:</span>
            {['Burchmores', 'WeBuyCars', 'Aucor', 'SMA'].map(h => (
              <span key={h} className="text-[#D3D3D3] font-heading font-black tracking-[0.2em] uppercase text-[15px] hover:text-[#FF4500] transition-colors duration-300 cursor-default">{h}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-0 bg-[#808080]">
        <div className="border-b-[3px] border-[#111111] overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex min-w-max">
              {coreServices.map((s, i) => (
                <button key={s.code} onClick={() => setActiveService(i)}
                  className={`relative px-6 py-5 font-black text-[11px] tracking-[0.22em] uppercase transition-all duration-300 whitespace-nowrap border-b-[4px] -mb-[3px] ${
                    activeService === i ? 'text-[#FF4500] border-[#FF4500] bg-[#111111]' : 'text-[#111111] border-transparent hover:text-white hover:bg-[#696969]'
                  }`}>
                  <span className="text-[#FF4500] mr-2">{s.code}</span>{s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[#FF4500] font-black text-[11px] tracking-[0.3em] uppercase">{service.code}</span>
                <div className="flex-1 h-[1px] bg-[#111111]/30" />
                <span className="text-[#111111] font-black text-[11px] tracking-[0.2em] uppercase">{activeService + 1} of {coreServices.length}</span>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <span className="text-[#FF4500] text-[2.5rem] leading-none font-heading">{service.icon}</span>
                <h2 className="text-4xl md:text-5xl font-black font-heading uppercase leading-[1.05] text-white">{service.title}</h2>
              </div>
              <p className="text-[#FF4500] font-black text-[13px] tracking-[0.2em] uppercase mb-8 border-l-[3px] border-[#FF4500] pl-5">{service.subtitle}</p>
              <p className="text-[#111111] font-bold text-[16px] leading-[1.85] mb-10">{service.desc}</p>
              <div className="inline-flex items-center gap-5 bg-[#111111] px-8 py-5 border-l-[5px] border-[#FF4500] mb-10">
                <div>
                  <p className="text-[#A9A9A9] font-black text-[10px] tracking-[0.3em] uppercase mb-1">Fee</p>
                  <p className="text-[#FF4500] font-heading font-black text-[22px] leading-none">{service.price}</p>
                </div>
                <div className="w-[1px] h-10 bg-[#696969]" />
                <p className="text-[#A9A9A9] font-bold text-[13px]">{service.priceNote}</p>
              </div>
              {service.hasCalculator && <DeliveryCalculator />}
              <div className="mt-10">
                <Link to="/contact" className="btn-primary">Appoint TAG for This</Link>
              </div>
            </div>

            <div>
              <div className="bg-[#111111] border-t-[4px] border-[#FF4500] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <div className="px-10 pt-10 pb-6 border-b-[1px] border-[#696969]">
                  <h3 className="text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase">What's Included</h3>
                </div>
                <ul className="px-10 py-8 space-y-4">
                  {service.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-5 group">
                      <span className="mt-[5px] min-w-[18px] h-[18px] border-[2px] border-[#696969] flex items-center justify-center group-hover:border-[#FF4500] transition-colors duration-300">
                        <span className="w-[8px] h-[8px] bg-[#FF4500] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </span>
                      <span className="text-[#D3D3D3] font-bold text-[14px] leading-[1.65] group-hover:text-white transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mx-10 mb-10 aspect-[16/7] overflow-hidden">
                  <img src="/assets/images/inspection.png" alt={service.title} className="w-full h-full object-cover object-center" />
                </div>
              </div>
              <div className="flex justify-between mt-4 gap-2">
                <button onClick={() => setActiveService(i => Math.max(0, i - 1))} disabled={activeService === 0}
                  className="flex-1 py-3 bg-[#111111] text-[#A9A9A9] font-black text-[11px] tracking-[0.2em] uppercase hover:text-[#FF4500] hover:bg-[#1a1a1a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed">
                  Prev
                </button>
                <button onClick={() => setActiveService(i => Math.min(coreServices.length - 1, i + 1))} disabled={activeService === coreServices.length - 1}
                  className="flex-1 py-3 bg-[#111111] text-[#A9A9A9] font-black text-[11px] tracking-[0.2em] uppercase hover:text-[#FF4500] hover:bg-[#1a1a1a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#111111] border-t-[6px] border-[#FF4500]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-10">
            <div>
              <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Transparent Pricing</h2>
              <h3 className="text-4xl md:text-5xl font-black font-heading uppercase text-white leading-[1.06]">Fees &amp; Services.<br /><span className="text-[#FF4500]">No Surprises.</span></h3>
            </div>
            <p className="text-[#A9A9A9] font-bold text-[16px] leading-[1.8] border-l-[4px] border-[#696969] pl-7 max-w-md">
              All fees are settled via <strong className="text-white">EFT or secure payment</strong> before attendance or vehicle release. No hidden costs.
            </p>
          </div>
          <div className="border-[2px] border-[#696969] overflow-hidden">
            <div className="grid grid-cols-4 bg-[#696969]">
              {['Service', 'Amount', 'Nature', 'Due'].map(col => (
                <div key={col} className="px-6 py-4"><span className="text-[#111111] font-black text-[10px] tracking-[0.3em] uppercase">{col}</span></div>
              ))}
            </div>
            {pricingRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-4 border-t-[1px] border-[#696969]/30 hover:bg-[#1a1a1a] transition-all duration-300 ${
                row.highlight ? 'bg-[#FF4500]/10 border-l-[4px] border-l-[#FF4500]' : 'bg-[#1a1a1a]/50'
              }`}>
                <div className="px-6 py-5"><span className={`font-black text-[14px] ${row.highlight ? 'text-white' : 'text-[#D3D3D3]'}`}>{row.service}</span></div>
                <div className="px-6 py-5"><span className={`font-black text-[14px] ${row.highlight ? 'text-[#FF4500]' : 'text-white'}`}>{row.amount}</span></div>
                <div className="px-6 py-5"><span className="text-[#A9A9A9] font-bold text-[13px]">{row.nature}</span></div>
                <div className="px-6 py-5"><span className="text-[#A9A9A9] font-bold text-[13px]">{row.timing}</span></div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-5 bg-[#696969]/20 border-l-[5px] border-[#FF4500] px-8 py-6">
            <span className="text-[#FF4500] font-black text-[20px] mt-0.5 min-w-[20px]">!</span>
            <p className="text-[#D3D3D3] font-bold text-[14px] leading-[1.75]">
              <strong className="text-white">Note:</strong> TAG always requires a non-refundable attendance deposit before attending, it ensures only committed, serious clients are represented on the floor.
            </p>
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#696969]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">
          <div className="lg:sticky lg:top-32">
            <h2 className="text-[#111111] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">What TAG Commits To</h2>
            <h3 className="text-4xl md:text-5xl font-black font-heading uppercase leading-[1.06] text-white mb-8">Scope of<br /><span className="text-[#111111]">Service.</span></h3>
            <p className="text-[#111111] font-bold text-[16px] leading-[1.85] max-w-md border-l-[5px] border-[#111111] pl-7 mb-10">When you appoint TAG, these are the commitments I make to you, in writing and in practice. No ambiguity. No excuses.</p>
            <div className="aspect-[4/3] overflow-hidden">
              <img src="/assets/images/floor.png" alt="Auction Floor Representation" className="w-full h-full object-cover object-center" />
            </div>
          </div>
          <div className="space-y-3">
            {scopeItems.map(item => (
              <div key={item.num} className="group flex items-start gap-6 bg-[#111111] p-8 border-l-[5px] border-[#696969] hover:border-[#FF4500] transition-all duration-300 shadow-lg">
                <span className="text-[#FF4500] font-heading font-black text-[2.2rem] leading-none min-w-[48px] group-hover:scale-110 transition-transform duration-300">{item.num}</span>
                <div>
                  <h4 className="text-white font-black uppercase tracking-[0.15em] text-[14px] mb-2">{item.title}</h4>
                  <p className="text-[#A9A9A9] text-[14px] leading-[1.7] font-semibold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#C0C0C0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Who TAG Serves</h2>
            <h3 className="text-4xl md:text-5xl font-black font-heading uppercase text-[#111111] leading-[1.08]">Target Clients</h3>
            <p className="text-[#696969] font-bold text-[16px] max-w-xl mx-auto mt-6 leading-[1.8]">TAG operates across the full spectrum of vehicle buyers, from private individuals to trade buyers to cross-border clients.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetClients.map((client, i) => (
              <div key={i} className="group relative bg-[#111111] p-10 border-t-[4px] border-[#696969] hover:border-[#FF4500] transition-all duration-300 shadow-xl overflow-hidden">
                <span aria-hidden="true" className="absolute -right-3 -bottom-4 font-heading font-black text-[80px] text-white/[0.03] leading-none select-none group-hover:text-[#FF4500]/[0.07] transition-colors duration-500">{client.icon}</span>
                <div className="text-[#FF4500] font-heading font-black text-[36px] mb-4 leading-none">{client.icon}</div>
                <div className="h-[2px] w-8 bg-[#696969] group-hover:bg-[#FF4500] mb-5 transition-colors duration-300" />
                <h4 className="text-white font-black uppercase tracking-[0.15em] text-[14px] mb-4 leading-snug">{client.type}</h4>
                <p className="text-[#A9A9A9] text-[13px] leading-[1.75] font-semibold relative z-10">{client.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#111111] border-t-[6px] border-[#FF4500]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Lifecycle</h2>
            <h3 className="text-4xl md:text-5xl font-black font-heading uppercase text-white leading-[1.08]">Your Acquisition Journey</h3>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute top-[46px] left-0 right-0 h-[2px] bg-[#696969]" />
            <div className="absolute top-[46px] left-0 h-[2px] w-[calc(60%+20px)] bg-[#FF4500]" />
            <div className="grid grid-cols-5 gap-0">
              {processSteps.map((s, i) => (
                <div key={i} className="relative flex flex-col items-center text-center px-3">
                  <div className={`relative z-10 w-[48px] h-[48px] mb-8 flex items-center justify-center border-[3px] font-heading font-black text-[18px] shadow-lg ${
                    i < 3 ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'bg-[#111111] border-[#696969] text-[#696969]'
                  }`}>{s.step}</div>
                  <p className={`font-black text-[11px] tracking-[0.25em] uppercase mb-3 ${i < 3 ? 'text-[#FF4500]' : 'text-[#696969]'}`}>{s.stage}</p>
                  <h4 className="text-white font-black uppercase tracking-[0.1em] text-[13px] mb-3">{s.title}</h4>
                  <p className="text-[#A9A9A9] text-[12px] font-semibold leading-[1.65] max-w-[150px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:hidden border-l-[3px] border-[#696969] ml-4">
            {processSteps.map((s, i) => (
              <div key={i} className="relative pl-10 pb-12">
                <div className={`absolute -left-[14px] top-0 w-[26px] h-[26px] flex items-center justify-center border-[2px] font-black text-[11px] ${
                  i < 3 ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'bg-[#111111] border-[#696969] text-[#696969]'
                }`}>{i + 1}</div>
                <p className={`font-black text-[10px] tracking-[0.3em] uppercase mb-2 ${i < 3 ? 'text-[#FF4500]' : 'text-[#696969]'}`}>{s.stage}</p>
                <h4 className="text-white font-black uppercase text-[14px] mb-2">{s.title}</h4>
                <p className="text-[#A9A9A9] text-[13px] font-semibold leading-[1.65]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-[#808080]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-[#111111] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">A Partnership</h2>
            <h3 className="text-4xl font-black font-heading uppercase leading-[1.06] text-white mb-6">What We<br /><span className="text-[#111111]">Need From You.</span></h3>
            <p className="text-[#111111] font-bold text-[16px] leading-[1.8] max-w-md">TAG handles almost everything, but a successful acquisition requires clear communication and preparation from your side too.</p>
          </div>
          <div className="space-y-3">
            {clientResponsibilities.map((r, i) => (
              <div key={i} className="group flex items-start gap-5 bg-[#111111] px-7 py-5 border-l-[4px] border-[#696969] hover:border-[#FF4500] transition-all duration-300">
                <span className="text-[#FF4500] font-heading font-black text-[18px] leading-none min-w-[20px] mt-0.5">{i + 1}</span>
                <p className="text-[#D3D3D3] font-bold text-[14px] leading-[1.65] group-hover:text-white transition-colors duration-300">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#111111] border-y-[4px] border-[#FF4500]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-[#696969] font-black text-[11px] tracking-[0.25em] uppercase mb-1">Representing Clients At</p>
            <p className="text-white font-bold text-[15px]">All major Johannesburg auction houses</p>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {['Burchmores', 'WeBuyCars', 'Aucor', 'SMA'].map(house => (
              <div key={house} className="group bg-[#696969] px-8 py-4 border-b-[3px] border-[#808080] hover:border-[#FF4500] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <span className="text-white font-heading font-black tracking-[0.2em] uppercase text-[16px] group-hover:text-[#FF4500] transition-colors duration-300">{house}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-gradient-to-b from-[#696969] to-[#111111] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-[11px] font-black tracking-[0.3em] text-[#FF4500] uppercase mb-7">Begin Your Acquisition</h2>
          <h3 className="text-4xl md:text-6xl font-black text-white mb-8 font-heading tracking-tight uppercase leading-[1.08]">Brief me.<br /><span className="text-[#FF4500]">I will handle the rest.</span></h3>
          <p className="text-[18px] text-[#D3D3D3] mb-14 font-bold max-w-2xl mx-auto leading-[1.75]">Ready to appoint TAG as your personal auction representative? Contact Ventnor directly to submit your brief, establish your budget, and gain expert access to the floor.</p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/contact" className="btn-primary">Appoint TAG Today</Link>
            <Link to="/book-appointment" className="btn-outline text-[#D3D3D3] border-[#D3D3D3] hover:text-[#FF4500] hover:border-[#FF4500]">Book a Consultation</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;