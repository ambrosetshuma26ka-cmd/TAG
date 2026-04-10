import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'tag_cookie_consent';

const Row = ({ name, purpose, duration, type }) => (
  <div className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-[#696969]/15 text-[13px]">
    <span className="text-white font-black">{name}</span>
    <span className="text-[#A9A9A9] font-bold col-span-2">{purpose}</span>
    <span className="text-[#696969] font-bold">{duration}</span>
  </div>
);

const Section = ({ number, title, children }) => (
  <div className="border-t border-[#696969]/20 pt-10 pb-4">
    <div className="flex items-start gap-6 mb-5">
      <span className="text-[#FF4500] font-heading font-black text-[2.2rem] leading-none min-w-[3rem]">{String(number).padStart(2,'0')}</span>
      <h2 className="text-white font-heading font-black text-[1.35rem] uppercase tracking-[0.08em] leading-tight pt-1">{title}</h2>
    </div>
    <div className="ml-[4.5rem] text-[#A9A9A9] font-bold text-[14px] leading-[1.85] space-y-4">{children}</div>
  </div>
);

const CookiePolicy = () => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const handleRevokeConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <div className="w-full bg-[#111111] min-h-screen font-sans">
      <section className="relative pt-40 pb-20 bg-[#0D0D0D] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-transparent via-[#FF4500] to-[#FF4500]"/>
        <span aria-hidden="true" className="absolute right-[-1rem] bottom-[-1rem] font-heading font-black text-[15vw] text-white/[0.02] select-none leading-none uppercase pointer-events-none">COOKIES</span>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF4500]"/>Legal
          </div>
          <h1 className="text-5xl md:text-[4.5rem] font-black font-heading uppercase leading-[1.01] mb-6 text-white tracking-tight">
            Cookie<br/><span className="text-[#FF4500]">Policy</span>
          </h1>
          <p className="text-[#696969] font-bold text-[13px] tracking-[0.15em] uppercase">Last updated: {new Date().toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-[#1a1a1a] border-l-[5px] border-[#FF4500] px-8 py-6 mb-12">
          <p className="text-[#D3D3D3] font-bold text-[14px] leading-[1.85]">
            This Cookie Policy explains what cookies are, which cookies The Auction Guy (TAG) uses on this website, and how you can control them. By continuing to use this website after accepting our cookie notice, you consent to our use of cookies as described here.
          </p>
        </div>

        <div className="space-y-2">
          <Section number={1} title="What Are Cookies">
            <p>Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to the website owner about how the site is being used.</p>
            <p>Cookies cannot harm your device and do not contain executable code. They are simply text files that your browser stores locally.</p>
          </Section>

          <Section number={2} title="Why We Use Cookies">
            <p>We use cookies for three core reasons:</p>
            <ul className="space-y-3 mt-2">
              {[
                { title: 'Essential operation', desc: 'Some cookies are strictly necessary for the website to function. Without them, services like the booking form and quote wizard cannot work correctly.' },
                { title: 'Your preferences', desc: 'We store your cookie consent decision so we do not ask you again on return visits to this site.' },
                { title: 'Performance and analytics', desc: 'We may use analytics tools to understand how visitors use the site — which pages are visited most, how long people spend on the site, and where they come from. This helps us improve the experience for everyone. All analytics data is aggregate and not personally identifiable.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span><strong className="text-white">{item.title}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section number={3} title="Cookies We Use">
            <p>The following table describes the specific cookies placed on your device when you visit this website:</p>
            <div className="mt-5 bg-[#1a1a1a] border border-[#696969]/20 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-[#0D0D0D] border-b border-[#696969]/20">
                <span className="text-[#FF4500] font-black text-[10px] uppercase tracking-[0.25em]">Name</span>
                <span className="text-[#FF4500] font-black text-[10px] uppercase tracking-[0.25em] col-span-2">Purpose</span>
                <span className="text-[#FF4500] font-black text-[10px] uppercase tracking-[0.25em]">Duration</span>
              </div>
              <Row name="tag_cookie_consent" purpose="Stores your cookie consent decision so we do not display the consent banner on future visits." duration="1 year" type="Essential" />
              <Row name="tag_admin_token" purpose="Stores the admin session token for authenticated admin panel access. Only set for admin users." duration="Session" type="Essential" />
              <Row name="_ga, _gid" purpose="Google Analytics cookies used to distinguish users and sessions for aggregate website usage reporting. Only set if analytics is enabled." duration="2 years / 24 hours" type="Analytics" />
            </div>
            <p className="mt-4 text-[12px] text-[#696969]">We do not use advertising, tracking, or third-party marketing cookies.</p>
          </Section>

          <Section number={4} title="Third-Party Cookies">
            <p>We do not permit third-party advertisers or tracking networks to place cookies on this website. Any analytics tools we use are configured to anonymise IP addresses and to not share data with advertising networks.</p>
          </Section>

          <Section number={5} title="Managing and Withdrawing Consent">
            <p>You can control and manage cookies in several ways:</p>
            <ul className="space-y-2 mt-2">
              {[
                'Browser settings — all modern browsers allow you to block or delete cookies. Refer to your browser\'s help documentation for instructions.',
                'Opt-out tools — for Google Analytics specifically, you can install the Google Analytics Opt-out Browser Add-on.',
                'Withdraw consent below — clicking the button below removes your saved consent and reloads the page, showing the consent banner again.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#FF4500] font-black mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>Please note that blocking essential cookies may prevent parts of the website from functioning correctly.</p>
            <div className="mt-6">
              <button onClick={handleRevokeConsent}
                className="px-8 py-4 bg-[#1a1a1a] border-[2px] border-[#696969] text-[#A9A9A9] font-black text-[11px] uppercase tracking-[0.22em] hover:border-[#FF4500] hover:text-white transition-all">
                Withdraw Cookie Consent
              </button>
            </div>
          </Section>

          <Section number={6} title="Changes to This Policy">
            <p>We may update this Cookie Policy from time to time in response to legal, technical, or operational changes. We will update the date at the top of this page when we do so. We encourage you to review this page periodically.</p>
          </Section>

          <Section number={7} title="Contact">
            <p>If you have questions about our use of cookies or this policy, please contact us:</p>
            <div className="mt-4 space-y-1">
              <p><span className="text-white font-black">Email:</span> info@theauctionguyza.co.za</p>
              <p><span className="text-white font-black">Phone:</span> 071 169 6716</p>
            </div>
            <p className="mt-4">
              See also our <Link to="/privacy" className="text-[#FF4500] hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-[#FF4500] hover:underline">Terms and Conditions</Link>.
            </p>
          </Section>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;