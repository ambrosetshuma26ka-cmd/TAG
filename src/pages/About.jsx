import { Link } from 'react-router-dom';

const About = () => {
  const coreValues = [
    { letter: "I", word: "Integrity",     desc: "Doing the right thing, even when no one's looking. Staying honest, accountable, and transparent in every decision and action." },
    { letter: "I", word: "Innovation",    desc: 'Challenging the status quo with curiosity and new ideas, continually testing, learning, iterating, and never settling for "good enough."' },
    { letter: "A", word: "Accountability",desc: "Owning outcomes, learning from challenges, and following through responsibly on every client commitment." },
    { letter: "A", word: "Adaptability",  desc: "Staying flexible when plans shift, markets change, or challenges surface, pivoting fast and keeping momentum forward." },
    { letter: "D", word: "Dependability", desc: "Showing up as someone you can count on, turning trust into tangible gains on the auction floor." },
    { letter: "E", word: "Excellence",    desc: "Setting the bar high, always rising to exceed it. Never coasting on past success." },
    { letter: "C", word: "Commitment",    desc: "Showing up with resolute focus, attention to detail, and assertive follow-through to finish every acquisition strong." },
  ];

  const traits = [
    { label: "Confident",   detail: "Radiating self-assurance that never second-guesses, we trust our judgment and expect others to do the same." },
    { label: "Strategic",   detail: "Always planning with a long-term vision that others may not yet see." },
    { label: "Disciplined", detail: "Focused and organised with a deep respect for systems and processes." },
    { label: "Responsible", detail: "We take our duties seriously and see auction representation as a responsibility, not just a privilege." },
    { label: "Decisive",    detail: "When others hesitate, we act as intuitive, assertive decision-makers that step up in uncertainty." },
  ];

  return (
    <div className="w-full bg-[#696969] font-sans overflow-x-hidden selection:bg-[#FF4500] selection:text-white">

      <section className="relative min-h-[92vh] flex items-end pt-40 pb-20 bg-gradient-to-br from-[#111111] via-[#696969] to-[#808080] overflow-hidden">
        <span aria-hidden="true" className="absolute right-[-2rem] top-1/2 -translate-y-1/2 text-[22vw] font-heading font-black text-white/[0.03] select-none leading-none uppercase tracking-tighter pointer-events-none whitespace-nowrap">
          TAG
        </span>
        <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-[#FF4500] via-[#FF4500]/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-2 gap-20 items-end">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 border-[2px] border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-[11px] font-black tracking-[0.28em] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF4500]" />
              About The Auction Guy
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-black font-heading uppercase leading-[1.01] mb-10 text-white tracking-tight">
              One Agent.<br />
              <span className="text-[#FF4500]">Unrivalled</span><br />
              Representation.
            </h1>
            <p className="text-[17px] text-[#D3D3D3] leading-[1.8] max-w-lg border-l-[5px] border-[#FF4500] pl-7 font-bold">
              I'm The Auction Guy, your personal car auction representative committed to integrity, transparency, and ethical conduct in every transaction. I attend auctions so you don't have to, securing your ideal vehicle at the best possible price.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px]">
              <div className="w-full aspect-[4/5] relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                <img
                  src="/assets/images/potrait.jpeg"
                  alt="The Auction Guy, Founder of The Auction Guy"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-[#FF4500]" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#111111] border-l-[5px] border-[#FF4500] px-8 py-5 shadow-2xl">
                <p className="text-white font-heading font-black text-[20px] tracking-[0.12em] uppercase">Ventnor Goosen</p>
                <p className="text-[#FF4500] font-black text-[11px] tracking-[0.25em] uppercase mt-1">Founder · Independent Agent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#808080]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-[#111111] font-black tracking-[0.3em] uppercase mb-6 text-[11px]">Our Story</h2>
              <h3 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black font-heading uppercase leading-[1.06] text-white mb-8">
                Authority without<br /><span className="text-[#111111]">Domineering.</span>
              </h3>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-[3px] w-14 bg-[#FF4500]" />
                <div className="h-[3px] w-4 bg-[#111111]" />
              </div>
              <p className="text-[#111111] font-bold text-[17px] leading-[1.8] max-w-md">
                Born from a deep passion for vehicles and a frustration with the opacity of traditional auction processes, TAG was founded on a single principle: every buyer deserves expert eyes on the floor.
              </p>
            </div>
            <div className="space-y-8 text-[#111111] text-[16px] font-bold leading-[1.85]">
              <p className="border-t-[2px] border-[#696969] pt-8">
                Operating across Johannesburg's premier auction houses, Burchmores, WeBuyCars, Aucor, SMA, and beyond, I attend every auction in person, representing you with the strategic precision and calm assertiveness that the floor demands.
              </p>
              <p className="border-t-[2px] border-[#696969] pt-8">
                The vehicle auction world moves fast. Decisions are made in seconds. Without expert representation, buyers face emotional overbidding, undisclosed faults, and paperwork complexity. TAG eliminates all of that, replacing uncertainty with informed, disciplined execution.
              </p>
              <p className="border-t-[2px] border-[#696969] pt-8">
                Every engagement is personal. From the moment you brief me on your ideal vehicle to the moment it arrives at your door, I manage the entire lifecycle with meticulous care. I service clients nationwide, bringing the auction floor to wherever you are.
              </p>
              <p className="border-t-[2px] border-[#696969] border-b-[2px] pb-8 pt-8">
                This isn't a transaction. It's representation. And representation at this level demands nothing less than excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#111111] border-t-[6px] border-[#FF4500] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Brand Purpose</h2>
            <h3 className="text-4xl md:text-5xl font-black font-heading uppercase leading-[1.08]">Vision & Mission</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-0 border-[2px] border-[#696969]">
            <div className="p-14 border-r-0 md:border-r-[2px] border-[#696969] border-b-[2px] md:border-b-0">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-[#FF4500] flex items-center justify-center">
                  <span className="font-heading font-black text-white text-[22px]">V</span>
                </div>
                <h4 className="font-heading font-black text-[28px] uppercase tracking-[0.15em] text-white">Vision</h4>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Market Leadership",      desc: "To be the leading and most trusted independent representative in the vehicle auction marketplace, known for integrity and unparalleled client service." },
                  { title: "Industry Transformation",desc: "To transform the traditional vehicle auction process by providing unrivalled transparency and data-driven insights for all clients." },
                  { title: "Seamless Experience",    desc: "To lead the way in creating a seamless auction experience, free of hassle or pressure, where every client feels confident and valued." },
                ].map((item, i) => (
                  <div key={i} className="pl-6 border-l-[3px] border-[#696969] hover:border-[#FF4500] transition-colors duration-300">
                    <h5 className="text-[#FF4500] font-black text-[13px] tracking-[0.2em] uppercase mb-2">{item.title}</h5>
                    <p className="text-[#A9A9A9] text-[14px] leading-[1.7] font-semibold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-14">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-[#111111] border-[2px] border-[#FF4500] flex items-center justify-center">
                  <span className="font-heading font-black text-[#FF4500] text-[22px]">M</span>
                </div>
                <h4 className="font-heading font-black text-[28px] uppercase tracking-[0.15em] text-white">Mission</h4>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Maximising Returns", desc: "Professionally managing the auction process, ensuring buyers find quality vehicles at fair market value." },
                  { title: "Building Trust",     desc: "Operating a highly trusted, efficient buying process through clear, accurate data and operational integrity." },
                  { title: "Providing Expertise",desc: "Guiding clients through auction complexities using expert knowledge, ensuring all legal and procedural requirements are met." },
                  { title: "Ensuring Efficiency",desc: "Making the auction process seamless, cohesive, and hassle-free, from initial valuation to final delivery and post-sale assistance." },
                ].map((item, i) => (
                  <div key={i} className="pl-6 border-l-[3px] border-[#696969] hover:border-[#FF4500] transition-colors duration-300">
                    <h5 className="text-[#FF4500] font-black text-[13px] tracking-[0.2em] uppercase mb-2">{item.title}</h5>
                    <p className="text-[#A9A9A9] text-[14px] leading-[1.7] font-semibold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#C0C0C0] text-[#111111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            <div className="lg:w-5/12 lg:sticky lg:top-32">
              <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Brand Character</h2>
              <h3 className="text-4xl md:text-5xl font-black font-heading uppercase leading-[1.06] mb-8">
                Who We<br />Are at the<br /><span className="text-[#696969]">Core.</span>
              </h3>
              <p className="text-[#696969] font-bold text-[16px] leading-[1.8] max-w-md border-l-[5px] border-[#111111] pl-7">
                An articulate, authoritative, decisive, and refined brand voice that communicates elegance, reliability, and dominance in the vehicle auction market. We speak powerfully, never pushy. Authoritative, never domineering.
              </p>
            </div>
            <div className="lg:w-7/12 space-y-4">
              {traits.map((t, i) => (
                <div key={i} className="group flex items-start gap-6 bg-[#111111] p-8 border-l-[6px] border-[#696969] hover:border-[#FF4500] transition-all duration-300 shadow-lg hover:shadow-xl">
                  <span className="text-[#FF4500] font-heading font-black text-[36px] leading-none min-w-[20px] group-hover:scale-110 transition-transform duration-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-[0.18em] text-[15px] mb-2">{t.label}</h4>
                    <p className="text-[#A9A9A9] text-[14px] leading-[1.7] font-semibold">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#696969]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[#FF4500] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">What We Stand For</h2>
            <h3 className="text-4xl md:text-5xl font-black font-heading uppercase text-white leading-[1.08]">Core Values</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coreValues.map((v, i) => (
              <div key={i} className="group relative bg-[#111111] p-8 border-t-[4px] border-[#696969] hover:border-[#FF4500] transition-all duration-400 shadow-xl overflow-hidden">
                <span aria-hidden="true" className="absolute -right-3 -bottom-4 font-heading font-black text-[100px] text-white/[0.03] leading-none select-none group-hover:text-[#FF4500]/[0.07] transition-colors duration-500">
                  {v.letter}
                </span>
                <h4 className="text-[#FF4500] font-heading font-black text-[22px] mb-3 tracking-[0.1em] uppercase">{v.word}</h4>
                <div className="h-[2px] w-8 bg-[#696969] group-hover:bg-[#FF4500] mb-5 transition-colors duration-300" />
                <p className="text-[#A9A9A9] text-[13px] leading-[1.75] font-semibold relative z-10">{v.desc}</p>
              </div>
            ))}
            <div className="overflow-hidden border-t-[4px] border-[#FF4500] shadow-xl min-h-[200px]">
              <img
                src="/assets/images/brand.png"
                alt="TAG Brand Values"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#111111] border-y-[4px] border-[#FF4500]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#696969]/30">
            {[
              { number: "100%",  label: "Transparent Process"   },
              { number: "4+",    label: "Auction Houses Covered" },
              { number: "Nation",label: "Wide Client Service"    },
              { number: "0",     label: "Hidden Fees"            },
            ].map((stat, i) => (
              <div key={i} className="text-center py-8 px-6 group hover:bg-[#1a1a1a] transition-colors duration-300">
                <div className="text-[#FF4500] font-heading font-black text-[3.5rem] leading-none mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-[#A9A9A9] font-black text-[11px] tracking-[0.22em] uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-36 bg-[#808080]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative flex justify-center">
            <div className="w-full max-w-[460px] aspect-square bg-gradient-to-br from-[#111111] to-[#696969] flex flex-col items-center justify-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <img
                src="/assets/images/TAG SECONDARY LOGO.png"
                alt="TAG Logo"
                className="w-3/4 object-contain relative z-10 drop-shadow-[0_10px_30px_rgba(255,69,0,0.3)]"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[#A9A9A9] font-black text-[12px] tracking-[0.2em] uppercase text-center leading-[3]">[ TAG Logo ]</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-[#FF4500]" />
            </div>
          </div>
          <div>
            <h2 className="text-[#111111] font-black tracking-[0.3em] uppercase mb-5 text-[11px]">Logo Rationale</h2>
            <h3 className="text-4xl font-black font-heading uppercase leading-[1.08] text-white mb-8">
              Engineered to<br /><span className="text-[#111111]">Identify.</span>
            </h3>
            <div className="space-y-5 text-[#111111] font-bold text-[15px] leading-[1.85]">
              <p className="border-l-[4px] border-[#111111] pl-6">
                The TAG acronym alludes to a buyer selecting the agent as their representative to bid on their behalf, a direct, purposeful identity for the role.
              </p>
              <p className="border-l-[4px] border-[#FF4500] pl-6 text-white">
                Sleek lines of a car are merged into the letters, instantly identifying the industry. The outline merging into the font symbolises a seamless flow, aerodynamics suggesting speed, efficiency, and smooth cohesive operations.
              </p>
              <p className="border-l-[4px] border-[#111111] pl-6">
                The orange-red accent on the "A" reinforces emphasis on the industry. Extracting the "A" as a strong unique initial makes brand identification effortless across platforms, from a small favicon to a large auction floor banner.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-40 bg-gradient-to-b from-[#696969] to-[#111111] text-center border-t-[2px] border-[#A9A9A9]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-[11px] font-black tracking-[0.3em] text-[#FF4500] uppercase mb-7">Partner With TAG</h2>
          <h3 className="text-4xl md:text-6xl font-black text-white mb-8 font-heading tracking-tight uppercase leading-[1.08]">
            Ready to experience<br />
            <span className="text-[#FF4500]">elite representation?</span>
          </h3>
          <p className="text-[18px] text-[#D3D3D3] mb-14 font-bold max-w-2xl mx-auto leading-[1.75]">
            Explore our full suite of services or contact The Auction Guy to begin your acquisition journey.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/services" className="btn-primary">View Our Services</Link>
            <Link to="/contact" className="btn-outline text-[#D3D3D3] border-[#D3D3D3] hover:text-[#FF4500] hover:border-[#FF4500]">Contact The Auction Guy</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;