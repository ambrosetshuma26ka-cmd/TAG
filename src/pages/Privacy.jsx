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

const Privacy = () => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div className="w-full bg-[#111111] min-h-screen font-sans">
      <section className="relative pt-40 pb-20 bg-[#0D0D0D] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]"/>
        <span aria-hidden="true" className="absolute right-[-1rem] bottom-[-1rem] font-heading font-black text-[18vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none">PRIVACY</span>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF4500]"/>Legal
          </div>
          <h1 className="text-5xl md:text-[4.5rem] font-black font-heading uppercase leading-[1.01] mb-6 text-white tracking-tight">
            Privacy<br/><span className="text-[#FF4500]">Policy</span>
          </h1>
          <p className="text-[#696969] font-bold text-[13px] tracking-[0.15em] uppercase">Last updated: {new Date().toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-[#1a1a1a] border-l-[5px] border-[#FF4500] px-8 py-6 mb-12">
          <p className="text-[#D3D3D3] font-bold text-[14px] leading-[1.85]">
            The Auction Guy (TAG) is committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and other applicable South African privacy legislation. This policy explains what information we collect, why we collect it, how we use it, and your rights.
          </p>
        </div>

        <div className="space-y-2">
          <Section number={1} title="Who We Are">
            <p>The responsible party for your personal information is The Auction Guy, operated by Ventnor Goosen, Johannesburg, South Africa. Contact: info@theauctionguyza.co.za | 071 169 6716.</p>
          </Section>

          <Section number={2} title="Information We Collect">
            <p>We collect personal information you provide directly to us, including:</p>
            <ul className="space-y-2 mt-2">
              {[
                'Full name, email address, and phone number submitted via contact, booking, or quote forms',
                'Vehicle preferences, budget ranges, and notes provided during consultations',
                'Correspondence via email, phone, or our website forms',
                'Payment confirmation details (we do not store card information)',
                'Device and browser information collected automatically via cookies and analytics tools',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section number={3} title="How We Use Your Information">
            <p>We use your personal information for the following purposes:</p>
            <ul className="space-y-2 mt-2">
              {[
                'To process appointment bookings and quote requests',
                'To communicate with you regarding your enquiries and services',
                'To send booking confirmations, payment instructions, and service updates',
                'To improve our website and service offerings based on aggregate usage data',
                'To comply with legal and regulatory obligations under South African law',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>We will never sell your personal information to third parties.</p>
          </Section>

          <Section number={4} title="Legal Basis for Processing">
            <p>We process your personal information on the following lawful bases under POPIA:</p>
            <ul className="space-y-2 mt-2">
              {[
                'Contractual necessity — to fulfil the services you have requested',
                'Legitimate interests — to operate and improve our business',
                'Consent — where you have explicitly agreed (e.g. cookie usage)',
                'Legal obligation — where required by law',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section number={5} title="Data Sharing">
            <p>Your personal information may be shared with:</p>
            <ul className="space-y-2 mt-2">
              {[
                'Auction houses (Burchmores, WeBuyCars, Aucor, SMA) where required to fulfil your auction representation',
                'Email and hosting service providers who process data on our behalf under data processing agreements',
                'Law enforcement or regulatory authorities where legally required',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>All third parties are contractually obligated to handle your data securely and in accordance with applicable law.</p>
          </Section>

          <Section number={6} title="Data Retention">
            <p>We retain your personal information only for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Enquiry records are retained for 12 months. Appointment and transaction records are retained for 5 years for accounting and legal compliance purposes.</p>
          </Section>

          <Section number={7} title="Cookies">
            <p>Our website uses cookies to function correctly and to improve your experience. Please refer to our Cookie Policy for full details on the types of cookies we use, what they do, and how to manage them.</p>
          </Section>

          <Section number={8} title="Your Rights Under POPIA">
            <p>As a data subject, you have the following rights:</p>
            <ul className="space-y-2 mt-2">
              {[
                'Right of access — to request a copy of the personal information we hold about you',
                'Right to correction — to request that inaccurate information be corrected',
                'Right to deletion — to request that your personal information be deleted, subject to legal obligations',
                'Right to object — to object to processing based on legitimate interests',
                'Right to lodge a complaint — with the Information Regulator of South Africa',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>To exercise any of these rights, contact us at info@theauctionguyza.co.za. We will respond within 30 days.</p>
          </Section>

          <Section number={9} title="Security">
            <p>We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, or destruction. While we take security seriously, no transmission over the internet is 100% secure and we cannot guarantee absolute security.</p>
          </Section>

          <Section number={10} title="Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. The most current version is always available on this page. Material changes will be communicated via our website. Continued use of our services after any update constitutes acceptance.</p>
          </Section>

          <Section number={11} title="Contact the Information Regulator">
            <p>If you believe we have not handled your personal information lawfully, you may lodge a complaint with the Information Regulator of South Africa:</p>
            <div className="mt-4 space-y-1">
              <p><span className="text-white font-black">Website:</span> www.inforegulator.org.za</p>
              <p><span className="text-white font-black">Email:</span> inforeg@justice.gov.za</p>
            </div>
          </Section>
        </div>
      </section>
    </div>
  );
};

export default Privacy;