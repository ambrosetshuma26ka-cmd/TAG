import { useEffect } from 'react';

const Section = ({ number, title, children }) => (
  <div className="border-t border-[#696969]/20 pt-10 pb-4">
    <div className="flex items-start gap-6 mb-5">
      <span className="text-[#FF4500] font-heading font-black text-[2.2rem] leading-none min-w-[3rem]">{String(number).padStart(2,'0')}</span>
      <h2 className="text-white font-heading font-black text-[1.35rem] uppercase tracking-[0.08em] leading-tight pt-1">{title}</h2>
    </div>
    <div className="ml-[4.5rem] text-[#A9A9A9] font-bold text-[14px] leading-[1.85] space-y-4">{children}</div>
  </div>
);

const Terms = () => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div className="w-full bg-[#111111] min-h-screen font-sans">
      <section className="relative pt-40 pb-20 bg-[#0D0D0D] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]"/>
        <span aria-hidden="true" className="absolute right-[-1rem] bottom-[-1rem] font-heading font-black text-[22vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none">T&C</span>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF4500]"/>Legal
          </div>
          <h1 className="text-5xl md:text-[4.5rem] font-black font-heading uppercase leading-[1.01] mb-6 text-white tracking-tight">
            Terms &<br/><span className="text-[#FF4500]">Conditions</span>
          </h1>
          <p className="text-[#696969] font-bold text-[13px] tracking-[0.15em] uppercase">Last updated: {new Date().toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-[#1a1a1a] border-l-[5px] border-[#FF4500] px-8 py-6 mb-12">
          <p className="text-[#D3D3D3] font-bold text-[14px] leading-[1.85]">
            Please read these Terms and Conditions carefully before using the services of The Auction Guy (TAG). By engaging our services, visiting our website, or booking a consultation, you agree to be bound by these terms. If you do not agree, please do not use our services.
          </p>
        </div>

        <div className="space-y-2">
          <Section number={1} title="About The Auction Guy">
            <p>The Auction Guy (TAG) is an independent vehicle auction representative service operated by Ventnor Goosen, registered and operating in Johannesburg, South Africa. TAG acts exclusively as a representative and agent on behalf of clients at vehicle auction events hosted by third-party auction houses including but not limited to Burchmores, WeBuyCars, Aucor, and SMA.</p>
            <p>TAG is not an auction house, dealer, or seller of vehicles. We do not take ownership of any vehicle at any stage of the auction process.</p>
          </Section>

          <Section number={2} title="Scope of Services">
            <p>TAG provides the following services subject to agreement and payment:</p>
            <ul className="space-y-2 mt-2">
              {['Consultation and pre-auction strategy sessions (30 or 60 minutes)','Vehicle identification, inspection coordination, and assessment advice','Auction attendance and bidding representation on behalf of the client','Post-purchase documentation assistance and logistics coordination','Fleet sourcing and trade services','Export and cross-border acquisition advisory'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>All services are subject to availability and prior written or electronic agreement. TAG reserves the right to decline any engagement at its sole discretion.</p>
          </Section>

          <Section number={3} title="Fees and Payment">
            <p>All fees are payable in South African Rand (ZAR) via Electronic Funds Transfer (EFT). Banking details are provided upon confirmation of service. The following fee structure applies:</p>
            <ul className="space-y-2 mt-2">
              {[
                'Consultation (30 min): R250 — payable before appointment',
                'Consultation (60 min): R500 — payable before appointment',
                'Auction Attendance Fee: R1,000–R2,000 — non-refundable once the auction date is confirmed',
                'Vehicle Inspection: R500–R1,000 — quoted per vehicle',
                'Transport and Delivery: R8 per km from Johannesburg',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>A success fee may apply on completed acquisitions and will be quoted individually upon review of the client brief. All fees quoted are exclusive of financing charges.</p>
          </Section>

          <Section number={4} title="Refund and Cancellation Policy">
            <p>Consultation fees are non-refundable once the appointment is confirmed and payment received. If the client cancels at least 24 hours before the scheduled appointment, a credit may be applied toward a future booking at TAG's discretion.</p>
            <p>The auction attendance fee is strictly non-refundable once the auction date has been confirmed by the relevant auction house. This is because TAG commits time, travel, and preparation to each attendance regardless of bidding outcome.</p>
            <p>In the event TAG cancels a confirmed service due to unforeseen circumstances, a full refund will be issued within 5 business days.</p>
          </Section>

          <Section number={5} title="Limitation of Liability">
            <p>TAG acts solely as a representative and does not guarantee the purchase of any specific vehicle, the outcome of any bid, or the condition of any vehicle sold at auction. Auction vehicles are sold as-is by the auction house under their own terms.</p>
            <p>TAG is not liable for any defects, mechanical failures, misrepresentations, or legal encumbrances on vehicles acquired at auction, whether or not a pre-auction inspection was conducted. The client assumes full responsibility for any vehicle purchased.</p>
            <p>TAG's total liability to any client for any cause of action shall not exceed the fees paid by that client in the preceding 30 days.</p>
          </Section>

          <Section number={6} title="Client Obligations">
            <p>The client agrees to provide accurate, complete, and timely information required for TAG to perform its services. This includes but is not limited to vehicle preferences, budget, identification documents, and proof of payment.</p>
            <p>The client is responsible for ensuring they have sufficient funds available for vehicle purchase on the day of the auction. TAG cannot bid beyond a pre-agreed maximum without express prior authorisation.</p>
            <p>The client agrees not to engage, instruct, or communicate directly with auction house staff in a manner that conflicts with TAG's representation during any active engagement.</p>
          </Section>

          <Section number={7} title="Intellectual Property">
            <p>All content on the TAG website, including but not limited to text, images, logos, layouts, and documentation, is the intellectual property of The Auction Guy and may not be reproduced, distributed, or used without prior written consent.</p>
          </Section>

          <Section number={8} title="Privacy">
            <p>Your use of TAG's website and services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services you consent to the collection and processing of your personal information as described therein.</p>
          </Section>

          <Section number={9} title="Governing Law">
            <p>These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising shall be subject to the exclusive jurisdiction of the courts of South Africa.</p>
          </Section>

          <Section number={10} title="Amendments">
            <p>TAG reserves the right to update or amend these Terms at any time. The most current version will always be available on this page. Continued use of our services after any amendment constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section number={11} title="Contact">
            <p>For any questions regarding these Terms, please contact us:</p>
            <div className="mt-4 space-y-1">
              <p><span className="text-white font-black">Email:</span> info@theauctionguyza.co.za</p>
              <p><span className="text-white font-black">Phone:</span> 071 169 6716</p>
              <p><span className="text-white font-black">Location:</span> Johannesburg, South Africa</p>
            </div>
          </Section>
        </div>
      </section>
    </div>
  );
};

export default Terms;