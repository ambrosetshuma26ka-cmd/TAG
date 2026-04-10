import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-full bg-[#696969] font-sans overflow-x-hidden selection:bg-[#FF4500] selection:text-white">

        <section className="relative min-h-screen flex items-center pt-32 pb-16 bg-gradient-to-br from-[#696969] via-[#808080] to-[#696969]">
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            <div className="lg:w-6/12 relative z-20 pt-10 lg:pt-0">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-8 border-[2px] border-[#111111] bg-[#111111] text-[#FF4500] text-[11px] font-black tracking-[0.25em] uppercase shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"></span>
                Independent Representation
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[4.75rem] font-bold leading-[1.02] mb-8 text-white font-heading tracking-tight uppercase drop-shadow-md">
                Steer your future, <br/>
                <span className="text-[#111111] inline-block mt-2 drop-shadow-sm">drive your dreams.</span>
              </h1>
              <p className="text-[17px] md:text-[18px] text-[#D3D3D3] mb-12 leading-[1.75] font-bold max-w-xl border-l-[5px] border-[#FF4500] pl-7 py-1">
                A refined blend of classic elegance and modern minimalism. We provide a skill-based sense of security, ensuring a high-end, dynamic auction experience. Secure your ideal vehicle without lifting a finger.
              </p>
              <div className="flex flex-wrap gap-5 text-left">
                <Link to="/contact" className="btn-primary">Appoint TAG Today</Link>
                <Link to="/services" className="btn-outline text-[#111111] border-[#111111] hover:text-[#FF4500] hover:border-[#111111]">Explore Services</Link>
              </div>
            </div>
            <div className="lg:w-6/12 relative w-full h-[600px] flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-radial from-[#A9A9A9]/20 via-transparent to-transparent blur-2xl"></div>
              <img
                src="/assets/images/TAG SECONDARY LOGO.png"
                alt="TAG Secondary Logo - High Res"
                className="w-full max-w-[650px] object-contain relative z-20 drop-shadow-[0_20px_40px_rgba(17,17,17,0.4)] transform transition-all duration-700 hover:scale-[1.03]"
              />
            </div>
          </div>
        </section>

        <div className="bg-[#111111] border-y-[4px] border-[#FF4500] py-12 relative z-20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 md:gap-10">
            <span className="text-[#A9A9A9] font-black text-[12px] tracking-[0.2em] uppercase text-center md:text-left">Active Across Premier Houses:</span>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[#D3D3D3] font-heading font-black tracking-[0.22em] uppercase text-[15px]">
              <span className="hover:text-[#FF4500] transition-colors duration-300 cursor-pointer">Burchmores</span>
              <span className="hover:text-[#FF4500] transition-colors duration-300 cursor-pointer">WeBuyCars</span>
              <span className="hover:text-[#FF4500] transition-colors duration-300 cursor-pointer">Aucor</span>
              <span className="hover:text-[#FF4500] transition-colors duration-300 cursor-pointer">SMA</span>
            </div>
          </div>
        </div>

        <section className="py-32 bg-[#C0C0C0] text-[#111111]">
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
              <div className="max-w-2xl">
                <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Our Philosophy</h2>
                <h3 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black font-heading leading-[1.08] uppercase drop-shadow-sm">
                  Authority without <br/> domineering.
                </h3>
              </div>
              <p className="text-[#696969] leading-[1.8] text-[17px] max-w-lg border-l-[5px] border-[#111111] pl-8 py-2 font-bold md:mt-8">
                We take our duties seriously and view auction representation as a profound responsibility. When others hesitate, we act as intuitive, assertive decision-makers.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Market Leadership", desc: "To be the leading and most trusted independent representative in the vehicle auction marketplace, known for uncompromising integrity." },
                { title: "Industry Transformation", desc: "To completely transform the traditional vehicle auction process by providing unrivalled transparency and data-driven insights." },
                { title: "Seamless Experience", desc: "To lead the way in creating a seamless vehicle auction experience, free of hassle or pressure, where every client feels confident." },
                { title: "Maximising Returns", desc: "Professionally managing the complex auction process to ensure our buyers find high-quality vehicles exactly at fair market value." }
              ].map((purpose, idx) => (
                <div key={idx} className="bg-[#111111] p-10 border-t-[4px] border-[#696969] hover:border-[#FF4500] transition-all duration-400 shadow-xl group">
                  <div className="text-[#FF4500] font-heading font-black text-[22px] mb-6 tracking-[0.15em] border-b-[2px] border-[#696969] group-hover:border-[#FF4500] pb-4 inline-block transition-colors duration-400">
                    PHASE {idx + 1}
                  </div>
                  <h4 className="text-white font-black mb-4 uppercase tracking-[0.12em] text-[15px] leading-snug">{purpose.title}</h4>
                  <p className="text-[#A9A9A9] text-[14px] leading-[1.7] font-semibold">{purpose.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 bg-[#808080]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-[#111111] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Target Audience</h2>
              <h3 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white font-heading uppercase mb-6 leading-[1.08] drop-shadow-md">
                Curating for the <span className="text-[#FF4500]">Connoisseur.</span>
              </h3>
              <p className="text-[#111111] font-bold max-w-2xl mx-auto text-[17px] leading-[1.75]">
                We partner with affluent buyers who value status, exclusivity, craftsmanship, and absolute discretion in their acquisitions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {[
                { title: "Serious Collectors", desc: "Seeking rare, investment-grade classics or unique modern exotics for asset appreciation." },
                { title: "High-Net-Worth Individuals", desc: "Acquiring status symbols, luxury SUVs, and high-performance vehicles for prestige and enjoyment." },
                { title: "Automotive Enthusiasts", desc: "Passionate buyers focused on specific marques demanding perfection." },
                { title: "Luxury Lifestyle Buyers", desc: "Consumers who prioritise elegance, cutting-edge tech, and highly personalised experiences." },
                { title: "Premium Upgraders", desc: "Affluent individuals looking to seamlessly upgrade from current luxury models." }
              ].map((market, idx) => (
                <div key={idx} className="bg-[#111111] p-10 border-l-[4px] border-[#696969] shadow-lg hover:border-[#FF4500] transition-all duration-500 group relative">
                  <h4 className="text-[18px] font-black text-white mt-2 mb-4 uppercase tracking-[0.12em] leading-tight">{market.title}</h4>
                  <p className="text-[#D3D3D3] text-[14px] font-semibold leading-[1.7]">{market.desc}</p>
                </div>
              ))}
              <div className="overflow-hidden border-l-[4px] border-[#FF4500] shadow-lg min-h-[200px]">
                <img
                  src="/assets/images/discerning_guy.png"
                  alt="Discerning luxury car buyer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 bg-[#111111] text-white border-t-[8px] border-[#FF4500]">
          <div className="max-w-7xl mx-auto px-6 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start mb-24">
              <div>
                <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Methodology</h2>
                <h3 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white font-heading uppercase leading-[1.08]">
                  Disciplined <span className="text-[#FF4500]">Execution.</span>
                </h3>
              </div>
              <p className="text-[#D3D3D3] max-w-md text-[16px] leading-[1.8] mt-6 md:mt-8 font-bold border-l-[5px] border-[#696969] pl-7">
                Focused and organised with a deep respect for systems and processes. We manage the entire lifecycle of the acquisition.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-16 items-start">
              <div className="w-full lg:w-5/12 lg:sticky lg:top-32">
                <div className="aspect-[4/5] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border-b-[6px] border-[#FF4500]">
                  <img
                    src="/assets/images/auction_floor.png"
                    alt="Professional bidding environment at a vehicle auction"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="text-white font-black text-[12px] tracking-[0.22em] uppercase">Representing authority on the auction floor.</p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-7/12 space-y-6">
                {[
                  { step: "Sourcing",    title: "Strategic Digital Sourcing",  desc: "Leveraging our robust digital presence, high-quality website insights, and exclusive targeted email lists to find vehicles and provide sneak peeks before they hit the block." },
                  { step: "Inspection", title: "Meticulous Inspection",        desc: "Guiding clients through complexities using expert knowledge. We conduct highly detailed pre-auction physical inspections and data-driven history checks. We ensure all legal and procedural requirements are met." },
                  { step: "Execution",  title: "Disciplined Bidding",          desc: "Acting on your behalf on the auction floor. We execute bids strictly within your pre-approved parameters. Radiating self-assurance, we trust our judgment and act decisively without emotion." },
                  { step: "Logistics", title: "Logistics & Delivery",          desc: "Post-purchase, we handle all necessary change-of-ownership documentation and manage the secure vehicle collection and delivery directly to your designated location." }
                ].map((item, i) => (
                  <div key={i} className="bg-[#696969] p-10 border-[2px] border-[#808080] hover:border-[#FF4500] hover:bg-[#808080] transition-all duration-300 shadow-lg group">
                    <div className="flex flex-col">
                      <span className="text-[#111111] font-black tracking-[0.25em] text-[11px] mb-5 block uppercase border-b-[2px] border-[#111111] group-hover:border-[#FF4500] group-hover:text-[#FF4500] pb-3 w-max transition-colors duration-300">
                        Stage: {item.step}
                      </span>
                      <h4 className="text-[22px] font-black text-white mb-5 tracking-[0.08em] uppercase leading-tight">{item.title}</h4>
                      <p className="text-[#111111] text-[15px] leading-[1.7] max-w-xl font-bold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-40 bg-gradient-to-b from-[#808080] to-[#696969] text-center border-t-[2px] border-[#A9A9A9]">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-[11px] font-black tracking-[0.3em] text-[#111111] uppercase mb-7">Take Control</h2>
            <h3 className="text-4xl md:text-6xl lg:text-[4rem] font-black text-white mb-8 font-heading tracking-tight uppercase leading-[1.08] drop-shadow-md">
              Be the architect of <br/>
              <span className="text-[#FF4500] mt-2 inline-block">your own destiny.</span>
            </h3>
            <p className="text-[18px] text-[#111111] mb-14 font-bold max-w-2xl mx-auto leading-[1.75]">
              Ready to secure your next investment-grade classic or modern exotic? Contact us today to establish your portfolio and gain VIP auction access.
            </p>
            <Link to="/contact" className="btn-primary">Contact The Auction Guy</Link>
          </div>
        </section>

  </div>
  );
};

export default Home;