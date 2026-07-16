import React, { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { NavLink } from "react-router-dom";
import { VesselArt, VESSELS } from "./common/VesselArt";

const STEPS = [
    {
        n: "01",
        head: "Upload the purchase order",
        txt: "Bring the file exactly as your system exports it. Every operator's layout is different, so you map your columns onto ours: vessel and IMO number, purchase order number, item description, IMPA and ISSA codes, maker, model, part number and vendor email. Duplicate purchase orders are counted up front.",
    },
    {
        n: "02",
        head: "Screen the line items",
        txt: "You keep a register of suspected keywords, each term carrying a severity from Critical to Low, as the shared reference your reviewers screen against. Your reviewer marks the line items that are actually suspected. The judgement stays with your people.",
    },
    {
        n: "03",
        head: "Send one clarification request",
        txt: "You ask once. Enviguide splits the request by each line's vendor email and issues a separate upload link to every supplier, valid for 72 hours. No vendor ever sees another vendor's items, and your reviewers ride along on Bcc.",
    },
    {
        n: "04",
        head: "Suppliers upload MD and SDoC",
        txt: "No account, no password, no portal training. The link is the credential, protected by expiry, a recipient email match and rate limiting. Suppliers return their Material Declaration and Supplier's Declaration of Conformity against the exact items you asked about.",
    },
    {
        n: "05",
        head: "Track, chase and review",
        txt: "Every item carries its own status for the Material Declaration and for the Declaration of Conformity, so \"what is still missing\" is a question with an answer. Reminders reuse the same link and count themselves. Completed work goes to audit and review before it is finalised.",
    },
    {
        n: "06",
        head: "Map it to the vessel",
        txt: "Confirmed hazardous materials are mapped to where they physically are: the deck and the position on the general arrangement plan, across Parts I, II and III of the inventory. An inventory that says what, and also says where.",
    },
];

// Positions are inside the hull path drawn below. Anti fouling belongs on the
// underwater hull, not the deck, so pin 4 sits beneath the waterline (y=250).
// x values carry the same +350 offset as the hull, centring it in the 1600 viewBox.
const PINS = [
    { id: 1, x: 522, y: 148, label: "Accommodation", sub: "PCBs in cable insulation" },
    { id: 2, x: 564, y: 232, label: "Engine room", sub: "Asbestos in gaskets and lagging" },
    { id: 3, x: 802, y: 214, label: "Cargo hold", sub: "Coatings and preservatives" },
    { id: 4, x: 950, y: 266, label: "Underwater hull", sub: "Anti fouling systems" },
    { id: 5, x: 1114, y: 254, label: "Bow thruster", sub: "Heavy metals in components" },
];

const PARTS = [
    { n: "Part I", head: "Materials in the ship's structure and equipment", txt: "The part that has to be maintained for the whole operating life of the vessel, and the part that new purchases keep changing. This is where Enviguide IHMM does its work." },
    { n: "Part II", head: "Operationally generated wastes", txt: "Compiled ahead of recycling, alongside Part III. Enviguide IHMM carries the structure for Parts II and III so the record is complete when the vessel reaches end of life." },
    { n: "Part III", head: "Stores", txt: "Consumables and stores held on board at the point of recycling. Also compiled at end of life, and also structured in the platform." },
];

const SUBSTANCES = [
    "Asbestos", "Polychlorinated biphenyls", "Ozone depleting substances", "Anti fouling compounds",
    "Cybutryne", "Organotin", "Cadmium", "Lead", "Mercury", "Hexavalent chromium",
    "Brominated flame retardants", "Radioactive substances",
];

// Seamless waves. One period is 180 units. The CSS shifts every wave by exactly
// -900 (five periods), so a path must span at least viewBoxWidth + 900 for the
// loop to be seamless. `reps` sets that span: total width = 90 * (1 + reps).
const ripple = (y, amp, reps) => {
    let d = `M0,${y} q45,${-amp} 90,0`;
    for (let i = 0; i < reps; i++) d += " t90,0";
    return d;
};
// Filled body of water: the same ripple, closed down to `bottom`.
const wave = (y, amp, bottom, reps) => `${ripple(y, amp, reps)} L${90 * (1 + reps)},${bottom} L0,${bottom} Z`;
// Open path, stroked, to read as a wave crest.
const crest = (y, amp, reps) => ripple(y, amp, reps);

// Ship diagram is a 1600-wide full-bleed viewBox so the sea reaches both screen
// edges. Waves must therefore span 1600 + 900 = 2500 -> reps 27 gives 2520.
const SEA_REPS = 27;
// The hero band is 900 wide, so 900 + 900 = 1800 -> reps 19.
const HERO_REPS = 19;

// Small vessel silhouette used for the drifting hero fleet.
const MiniShip = ({ className }) => (
    <svg className={className} viewBox="0 0 64 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M1,15 L63,15 L56,24 L8,24 Z" />
        <rect x="7" y="7" width="13" height="8" />
        <rect x="11" y="2" width="4" height="5" />
        <rect x="24" y="10" width="11" height="5" />
        <rect x="37" y="10" width="11" height="5" />
        <rect x="50" y="10" width="8" height="5" />
    </svg>
);

const WHO = [
    { head: "Shipowners", txt: "You carry the obligation and the certificate. You need to know the inventory is current across the fleet, not just filed." },
    { head: "Ship managers", txt: "You run the purchasing that changes the inventory. This is where the declarations are won or lost." },
    { head: "Technical superintendents", txt: "You are the reviewer. You keep the keyword register, and the call on what is suspected stays yours." },
    { head: "Procurement teams", txt: "You already hold the purchase order data the inventory depends on. Here it does a second job." },
];

const IHMM = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        AOS.init();
    }, []);

    return (
        <>
            <div className="ihmpage-mainsection">

                <div className="ihmpage-section1">
                    <span className="ihmpage-herogrid" aria-hidden="true"></span>
                    <span className="ihmpage-heroglow" aria-hidden="true"></span>
                    <span className="ihmpage-herofleet" aria-hidden="true">
                        <MiniShip className="ihmpage-mini ihmpage-mini1" />
                        <MiniShip className="ihmpage-mini ihmpage-mini2" />
                        <MiniShip className="ihmpage-mini ihmpage-mini3" />
                        <svg className="ihmpage-herowaves" viewBox="0 0 900 44" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <defs>
                                <linearGradient id="ihmHeroSea" gradientUnits="userSpaceOnUse" x1="0" y1="6" x2="0" y2="44">
                                    <stop offset="0%" stopColor="#9afb00" stopOpacity="0.20" />
                                    <stop offset="100%" stopColor="#9afb00" stopOpacity="0.02" />
                                </linearGradient>
                            </defs>
                            <path className="ihmpage-herowave ihmpage-herowave1" d={wave(10, 4, 44, HERO_REPS)} />
                            <path className="ihmpage-herocrest ihmpage-herocrest1" vectorEffect="non-scaling-stroke" d={crest(10, 4, HERO_REPS)} />
                            <path className="ihmpage-herocrest ihmpage-herocrest2" vectorEffect="non-scaling-stroke" d={crest(18, 3, HERO_REPS)} />
                        </svg>
                    </span>
                    <div className="container ihmpage-herobody">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <p className="ihmpage-tag" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                    <span className="ihmpage-tagdot" aria-hidden="true"></span>New from Enviguide
                                </p>
                                <h2 className="ihmpage-mainhead" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">IHMM | Enviguide</h2>
                                <h3 className="ihmpage-subhead" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">Keep your Inventory of Hazardous Materials current, without chasing suppliers by hand.</h3>
                                <p className="ihmpage-content">Enviguide IHMM is compliance software for shipowners and ship managers. It turns the purchase orders you already raise into a maintained Inventory of Hazardous Materials, by collecting Material Declarations and Supplier's Declarations of Conformity from the vendors themselves.</p>
                                <div className="ihmpage-section1bt">
                                    <NavLink className="ihmpage-bt" to={'/Contact-Us'}>Talk to us about IHMM</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section2">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <h2 className="ihmpage-section2head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">The rule that applies to your fleet</h2>
                                <p className="ihmpage-section2sub">Two regimes govern hazardous materials on board, and both put the same duty on Part I of the inventory: keep it maintained and updated throughout the operational life of the ship.</p>
                            </div>
                        </div>
                        <div className="row gy-4">
                            <div className="col-md-6 col-lg-4">
                                <div className="ihmpage-regbox" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                    <p className="ihmpage-regboxtag">In force</p>
                                    <h3 className="ihmpage-regboxhead">Hong Kong Convention</h3>
                                    <p className="ihmpage-regboxtxt">In force since 26 June 2025, for ships of 500 GT and above flying the flag of a Party. Ships that trade only in their own flag state's waters are out of scope, and ships flagged in non Parties are reached indirectly, through no more favourable treatment in the ports of Parties. Existing ships need their International Certificate on Inventory of Hazardous Materials by 26 June 2030 at the latest, but the date that actually binds you is your own first renewal survey on or after 26 June 2025.</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4">
                                <div className="ihmpage-regbox" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                    <p className="ihmpage-regboxtag">EU</p>
                                    <h3 className="ihmpage-regboxhead">EU Ship Recycling Regulation</h3>
                                    <p className="ihmpage-regboxtxt">Regulation (EU) No 1257/2013 has applied since 31 December 2020 to existing EU flagged ships of 500 GT and above, and to non EU flagged ships of that size calling at an EU port or anchorage, which need an inventory and a Statement of Compliance. Article 5(6) is the one to read: Part I must be properly maintained and updated throughout the operational life of the ship. For third country flagged ships the equivalent duty sits in Article 12(4).</p>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4">
                                <div className="ihmpage-regbox" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                    <p className="ihmpage-regboxtag">Straight answer</p>
                                    <h3 className="ihmpage-regboxhead">What Port State Control can actually do</h3>
                                    <p className="ihmpage-regboxtxt">Being behind on updates is not, by itself, a detainable deficiency. EMSA guidance says it is to be rectified at the next survey. What is detainable is a certificate that is missing, invalid or incomplete, or an inventory that is not verified or not specific to your ship. So the real risk is not tomorrow's inspection. It is that the drift is invisible until your renewal survey, and then it is a scramble.</p>
                                </div>
                            </div>
                        </div>
                        <p className="ihmpage-note">Regulatory summary only. Scope, tonnage thresholds and survey timing depend on your flag, your class society and your trading pattern. Talk to us and we will walk through your fleet.</p>
                    </div>
                </div>

                <div className="ihmpage-vessels">
                    <span className="ihmpage-herogrid" aria-hidden="true"></span>
                    <div className="container ihmpage-herobody">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <h2 className="ihmpage-vesselshead" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">One inventory duty, whatever you operate</h2>
                                <p className="ihmpage-vesselssub">The Convention draws its line at tonnage and flag, not at what you carry. If the vessel is in scope, Part I has to stay current for its whole operating life.</p>
                            </div>
                        </div>
                        <div className="row gy-4">
                            {VESSELS.map((v) => (
                                <div className="col-md-6 col-lg-3" key={v.key}>
                                    <div className="ihmpage-vbox" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                        <VesselArt v={v} />
                                        <h3 className="ihmpage-vname">{v.name}</h3>
                                        <p className="ihmpage-vsub">{v.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section3">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <h2 className="ihmpage-section3head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">Maintaining an IHM is a supplier problem, not a paperwork problem</h2>
                                <p className="ihmpage-section3sub">The inventory is not compiled once and filed. Every spare part a vessel takes on board can change it, and for each one the regulation expects evidence from the vendor who supplied it.</p>
                            </div>
                        </div>
                        <div className="row gy-4 align-items-stretch">
                            <div className="col-lg-6">
                                <div className="ihmpage-cmp ihmpage-cmpbad" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                    <p className="ihmpage-cmphead">Done by hand</p>
                                    <p className="ihmpage-cmprow">A spreadsheet of purchase order lines, filtered by eye</p>
                                    <p className="ihmpage-cmprow">One long email thread per vendor, or worse, one shared thread</p>
                                    <p className="ihmpage-cmprow">No reliable answer to "which declarations are still missing?"</p>
                                    <p className="ihmpage-cmprow">Reminders sent from memory, or not at all</p>
                                    <p className="ihmpage-cmprow">An inventory that is accurate the day it was made, and drifts from then on</p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ihmpage-cmp ihmpage-cmpgood" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                    <p className="ihmpage-cmphead">With Enviguide IHMM</p>
                                    <p className="ihmpage-cmprow">The purchase order you already raise is the input</p>
                                    <p className="ihmpage-cmprow">One request, split automatically into a private link per vendor</p>
                                    <p className="ihmpage-cmprow">Received against pending, per item, per document</p>
                                    <p className="ihmpage-cmprow">Reminders reuse the same link and count themselves</p>
                                    <p className="ihmpage-cmprow">An inventory that keeps up, because the supplier fills it in</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section4">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <h2 className="ihmpage-section4head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">How Enviguide IHMM works</h2>
                                <p className="ihmpage-section4sub">Six steps, from the purchase order you already have to a hazard record you can evidence.</p>
                            </div>
                        </div>
                        <div className="ihmpage-flow">
                            <span className="ihmpage-flowrail" aria-hidden="true"></span>
                            {STEPS.map((s) => (
                                <div className="ihmpage-flowitem" key={s.n}>
                                    <span className="ihmpage-flownode" aria-hidden="true">{s.n}</span>
                                    <div className="ihmpage-flowcard" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                        <p className="ihmpage-flowstep">Step {s.n}</p>
                                        <h3 className="ihmpage-flowhead">{s.head}</h3>
                                        <p className="ihmpage-flowtxt">{s.txt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section5">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <h2 className="ihmpage-section5head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">An inventory that says what, and also says where</h2>
                                <p className="ihmpage-section5sub">Every confirmed hazardous material is tied to a physical location on the vessel, across Parts I, II and III. That is the difference between a list and an inventory.</p>
                            </div>
                        </div>
                    </div>

                    {/* Deliberately outside .container: the sea has to reach both screen
                        edges, otherwise it renders as a green box floating mid-page. */}
                    <div className="ihmpage-shipwrap" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                        <div className="ihmpage-shipscroll">
                            <svg className="ihmpage-shipsvg" viewBox="0 0 1600 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schematic side profile of a vessel showing where hazardous materials are typically located: accommodation, engine room, cargo hold, underwater hull, and bow thruster.">
                                <defs>
                                    <linearGradient id="ihmHullFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1c1c1c" />
                                        <stop offset="100%" stopColor="#0a0a0a" />
                                    </linearGradient>
                                    {/* userSpaceOnUse: the wave path's bbox runs far below the
                                        visible sea, so a bbox-relative gradient would be wrong. */}
                                    <linearGradient id="ihmSeaFill" gradientUnits="userSpaceOnUse" x1="0" y1="246" x2="0" y2="340">
                                        <stop offset="0%" stopColor="#9afb00" stopOpacity="0.22" />
                                        <stop offset="100%" stopColor="#9afb00" stopOpacity="0.02" />
                                    </linearGradient>
                                </defs>

                                {/* sea behind the hull, so the horizon reads across the frame */}
                                <rect className="ihmpage-seaback" x="0" y="250" width="1600" height="90" />

                                {/* Ship and its pins bob as ONE group so they never desync. */}
                                <g className="ihmpage-shipfloat">
                                {/* hull */}
                                <path className="ihmpage-hull" fill="url(#ihmHullFill)"
                                    d="M420,190 L420,258 Q422,282 456,282 L1050,282 Q1132,280 1172,248 L1208,190 Z" />

                                {/* internal deck lines */}
                                <line className="ihmpage-decknline" x1="422" y1="218" x2="1188" y2="218" />
                                <line className="ihmpage-decknline" x1="430" y1="250" x2="1162" y2="250" />

                                {/* main deck */}
                                <line className="ihmpage-deck" x1="420" y1="190" x2="1208" y2="190" />

                                {/* superstructure */}
                                <rect className="ihmpage-super" x="448" y="112" width="152" height="78" rx="4" />
                                <rect className="ihmpage-window" x="462" y="126" width="26" height="12" rx="2" />
                                <rect className="ihmpage-window" x="496" y="126" width="26" height="12" rx="2" />
                                <rect className="ihmpage-window" x="530" y="126" width="26" height="12" rx="2" />
                                <rect className="ihmpage-window" x="564" y="126" width="26" height="12" rx="2" />
                                {/* funnel */}
                                <path className="ihmpage-funnel" d="M506,112 L512,70 L550,70 L556,112 Z" />

                                {/* cargo hatches */}
                                <rect className="ihmpage-hatch" x="630" y="176" width="120" height="14" rx="2" />
                                <rect className="ihmpage-hatch" x="768" y="176" width="120" height="14" rx="2" />
                                <rect className="ihmpage-hatch" x="906" y="176" width="120" height="14" rx="2" />
                                <rect className="ihmpage-hatch" x="1044" y="176" width="86" height="14" rx="2" />

                                {/* hazard pins */}
                                {PINS.map((p, i) => (
                                    <g className="ihmpage-pin" key={p.id} style={{ '--pin-delay': `${i * 0.45}s` }}>
                                        <circle className="ihmpage-pinpulse" cx={p.x} cy={p.y} r="9" />
                                        <circle className="ihmpage-pindot" cx={p.x} cy={p.y} r="9" />
                                        <text className="ihmpage-pintext" x={p.x} y={p.y + 4} textAnchor="middle">{p.id}</text>
                                    </g>
                                ))}
                                </g>

                                {/* Sea drawn LAST and translucent: the hull below the waterline reads as
                                    submerged, and pins 4 and 5 correctly appear to sit underwater. */}
                                <g className="ihmpage-sea">
                                    <path className="ihmpage-wavebody" d={wave(252, 7, 340, SEA_REPS)} />
                                    <path className="ihmpage-crest ihmpage-crest1" d={crest(252, 7, SEA_REPS)} />
                                    <path className="ihmpage-crest ihmpage-crest2" d={crest(260, 5, SEA_REPS)} />
                                    <path className="ihmpage-crest ihmpage-crest3" d={crest(268, 4, SEA_REPS)} />
                                </g>
                            </svg>
                        </div>

                        <div className="container">
                            <p className="ihmpage-swipe">Swipe the diagram to explore</p>
                            <div className="row gy-3 ihmpage-legend">
                                {PINS.map((p) => (
                                    <div className="col-md-6 col-lg-4" key={p.id}>
                                        <div className="ihmpage-legenditem">
                                            <span className="ihmpage-legendnum" aria-hidden="true">{p.id}</span>
                                            <div>
                                                <p className="ihmpage-legendhead">{p.label}</p>
                                                <p className="ihmpage-legendsub">{p.sub}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="ihmpage-shipnote">Schematic illustration. Typical locations, not a survey of your vessel.</p>
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section6">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <h2 className="ihmpage-section6head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">What an Inventory of Hazardous Materials contains</h2>
                            </div>
                        </div>
                        <div className="row gy-4">
                            {PARTS.map((p) => (
                                <div className="col-md-4" key={p.n}>
                                    <div className="ihmpage-partbox" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                        <p className="ihmpage-partnum">{p.n}</p>
                                        <h3 className="ihmpage-parthead">{p.head}</h3>
                                        <p className="ihmpage-parttxt">{p.txt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-md-11">
                                <div className="ihmpage-hazbox">
                                    <p className="ihmpage-hazhead" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">The substances the inventory is looking for</p>
                                    <div className="ihmpage-chips">
                                        {SUBSTANCES.map((s, i) => (
                                            <span className="ihmpage-chip" key={s} data-aos="zoom-in" data-aos-duration="500" data-aos-delay={30 + i * 40}>{s}</span>
                                        ))}
                                    </div>
                                    <p className="ihmpage-haztxt">These are the materials a Material Declaration is asked to account for, and the reason a filter element is not just a filter element.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section7">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8">
                                <h2 className="ihmpage-section7head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">Who it is for</h2>
                            </div>
                        </div>
                        <div className="row gy-4 justify-content-center">
                            {WHO.map((w) => (
                                <div className="col-md-6 col-lg-3" key={w.head}>
                                    <div className="ihmpage-whobox" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">
                                        <h3 className="ihmpage-whohead">{w.head}</h3>
                                        <p className="ihmpage-whotxt">{w.txt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ihmpage-section8">
                    <span className="ihmpage-herogrid" aria-hidden="true"></span>
                    <div className="container ihmpage-herobody">
                        <div className="row justify-content-center">
                            <div className="col-md-9">
                                <h2 className="ihmpage-section8head" data-aos="fade-up" data-aos-duration="800" data-aos-delay="30">Built on the same idea as the rest of Enviguide</h2>
                                <p className="ihmpage-section8txt">Get the declaration out of the supplier's inbox and into a record you can evidence. It is the discipline we already apply to carbon data across the automotive value chain, pointed at a different regulation and a different fleet.</p>
                                <div className="ihmpage-section8bt">
                                    <NavLink className="ihmpage-bt" to={'/Contact-Us'}>Talk to us about IHMM</NavLink>
                                    <NavLink className="ihmpage-bt ihmpage-bt2" to={'/Solutions'}>See our other solutions</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default IHMM;
