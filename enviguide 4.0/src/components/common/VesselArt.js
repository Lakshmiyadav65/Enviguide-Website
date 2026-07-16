import React from "react";

// Vessel silhouettes drawn as inline SVG. Shared by the /IHM page and the IHM
// band on the home page, so the two never drift apart.
//
// Colours are NOT set here: the .ihmpage-v* classes are styled by whichever
// section renders them, which is how the same art works on both a black band
// (lime stroke) and a light one (black stroke).

// Shared hull profile (bow to the right) so every type reads as one family and
// they differ only where real ships differ: what sits on the deck.
export const HULL = "M8,56 L8,68 Q9,76 18,76 L158,76 Q178,75 186,66 L194,56 Z";

const containerStacks = () => {
    const cols = [
        { x: 54, n: 1 }, { x: 72, n: 2 }, { x: 90, n: 3 }, { x: 108, n: 3 },
        { x: 126, n: 3 }, { x: 144, n: 2 }, { x: 162, n: 1 },
    ];
    return cols.flatMap(c =>
        Array.from({ length: c.n }, (_, r) => (
            <rect className="ihmpage-vfill" key={`${c.x}-${r}`} x={c.x} y={50 - r * 6} width="16" height="5" rx="1" />
        ))
    );
};

export const VESSELS = [
    {
        key: "bulk",
        name: "Bulk carriers",
        sub: "Cranes, hatch covers and holds. Long service lives, and a lot of machinery replaced along the way.",
        art: (
            <>
                <path className="ihmpage-vline" d="M70,56 L70,38 L86,44" />
                <path className="ihmpage-vline" d="M105,56 L105,38 L121,44" />
                <path className="ihmpage-vline" d="M140,56 L140,38 L156,44" />
                <rect className="ihmpage-vfill" x="56" y="52" width="24" height="4" rx="1" />
                <rect className="ihmpage-vfill" x="91" y="52" width="24" height="4" rx="1" />
                <rect className="ihmpage-vfill" x="126" y="52" width="24" height="4" rx="1" />
                <rect className="ihmpage-vfill" x="161" y="52" width="20" height="4" rx="1" />
            </>
        ),
    },
    {
        key: "tanker",
        name: "Oil and chemical tankers",
        sub: "Cargo pumps, pipework and coatings, each part carrying its own declaration to collect.",
        art: (
            <>
                <line className="ihmpage-vline" x1="58" y1="52" x2="180" y2="52" />
                <line className="ihmpage-vline" x1="72" y1="52" x2="72" y2="56" />
                <line className="ihmpage-vline" x1="152" y1="52" x2="152" y2="56" />
                <rect className="ihmpage-vfill" x="110" y="46" width="18" height="10" rx="1" />
                <path className="ihmpage-vline" d="M119,46 L119,36 L134,36" />
            </>
        ),
    },
    {
        key: "container",
        name: "Container ships",
        sub: "High voyage frequency means high spare part turnover, and an inventory that moves fast.",
        art: <>{containerStacks()}</>,
        tallSuper: true,
    },
    {
        key: "gas",
        name: "Gas carriers",
        sub: "Cryogenic and insulation systems, and the material questions that come with them.",
        art: (
            <>
                <circle className="ihmpage-vtank" cx="82" cy="46" r="13" />
                <circle className="ihmpage-vtank" cx="118" cy="46" r="13" />
                <circle className="ihmpage-vtank" cx="154" cy="46" r="13" />
            </>
        ),
    },
];

export const VesselArt = ({ v }) => (
    // viewBox is cropped to the drawn content (y 27..76 plus a little air) rather
    // than 0..90, which left ~30% dead space at the top and made the ships look tiny.
    <svg className="ihmpage-vsvg" viewBox="0 21 200 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <line className="ihmpage-vwater" x1="0" y1="70" x2="200" y2="70" strokeDasharray="6 6" />
        <path className="ihmpage-vhull" d={HULL} />
        <line className="ihmpage-vdeck" x1="8" y1="56" x2="194" y2="56" />
        <rect className="ihmpage-vsuper" x="14" y={v.tallSuper ? 32 : 36} width={v.tallSuper ? 30 : 34} height={v.tallSuper ? 24 : 20} rx="2" />
        <rect className="ihmpage-vfunnel" x={v.tallSuper ? 24 : 26} y={v.tallSuper ? 23 : 27} width="9" height="9" rx="1" />
        {v.art}
    </svg>
);

export default VesselArt;
