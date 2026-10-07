import React from 'react';

export default function SleepingBoxPet() {
  return (
    <div 
      className="sleeping-cat-pet-container"
      aria-label="Kucing oranye tidur melingkar"
      title="Sedang tidur pulas... zZz"
    >
      {/* FLOATING SLEEP PARTICLES (z z z) DRIFTING FROM SNOUT */}
      <div className="sleeping-z-stream">
        <span className="pixel-z z-1">z</span>
        <span className="pixel-z z-2">z</span>
        <span className="pixel-z z-3">z</span>
        <span className="pixel-z z-4">zz</span>
      </div>

      {/* PIXEL ART CURLED SLEEPING GINGER CAT */}
      <div className="sleeping-cat-wrapper">
        <svg
          width="68"
          height="40"
          viewBox="0 0 34 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            imageRendering: 'pixelated',
            shapeRendering: 'crispEdges',
            display: 'block'
          }}
        >
          {/* 1. SOFT AMBIENT CONTACT SHADOW */}
          <ellipse cx="17" cy="18.5" rx="15" ry="1.5" fill="currentColor" className="cat-contact-shadow" opacity="0.12" />

          {/* 2. CRISP CHARCOAL PIXEL OUTLINE */}
          <g fill="#1C1917" className="cat-layer-outline">
            {/* Left Ear */}
            <rect x="6" y="3" width="1" height="1" />
            <rect x="7" y="2" width="2" height="1" />
            <rect x="9" y="3" width="1" height="1" />
            {/* Head Top */}
            <rect x="10" y="4" width="2" height="1" />
            {/* Right Ear */}
            <rect x="12" y="3" width="1" height="1" />
            <rect x="13" y="2" width="2" height="1" />
            <rect x="15" y="3" width="1" height="1" />
            {/* Curled Spine Top Arc */}
            <rect x="16" y="3" width="1" height="1" />
            <rect x="17" y="2" width="7" height="1" />
            <rect x="24" y="3" width="2" height="1" />
            <rect x="26" y="4" width="2" height="1" />
            {/* Curled Rump & Tail Outer Boundary */}
            <rect x="28" y="5" width="1" height="1" />
            <rect x="29" y="6" width="1" height="1" />
            <rect x="30" y="7" width="1" height="2" />
            <rect x="31" y="9" width="1" height="4" />
            <rect x="30" y="13" width="1" height="1" />
            <rect x="29" y="14" width="1" height="1" />
            <rect x="28" y="15" width="1" height="1" />
            {/* Bottom Tail Sweeping Arc */}
            <rect x="11" y="17" width="16" height="1" />
            <rect x="9" y="16" width="2" height="1" />
            <rect x="7" y="15" width="2" height="1" />
            <rect x="5" y="14" width="2" height="1" />
            {/* Face & Chin Outer Curve */}
            <rect x="4" y="13" width="1" height="1" />
            <rect x="3" y="9" width="1" height="4" />
            <rect x="4" y="7" width="1" height="2" />
            <rect x="5" y="5" width="1" height="2" />
            <rect x="6" y="4" width="1" height="1" />
            {/* Inner separation line between tail and head */}
            <rect x="7" y="12" width="5" height="1" />
            <rect x="12" y="13" width="1" height="1" />
          </g>

          {/* 3. MAIN GINGER ORANGE BODY */}
          <g fill="#EA580C" className="cat-layer-main">
            {/* Head fill */}
            <rect x="4" y="9" width="8" height="4" />
            <rect x="5" y="7" width="7" height="2" />
            <rect x="6" y="5" width="5" height="2" />
            {/* Body / Spine fill */}
            <rect x="16" y="3" width="8" height="1" />
            <rect x="14" y="4" width="12" height="2" />
            <rect x="13" y="6" width="16" height="4" />
            <rect x="13" y="10" width="17" height="3" />
            <rect x="14" y="13" width="15" height="1" />
            {/* Tail sweep fill */}
            <rect x="12" y="14" width="16" height="1" />
            <rect x="11" y="15" width="16" height="1" />
            <rect x="11" y="16" width="15" height="1" />
          </g>

          {/* 4. WARM SUNNY HIGHLIGHTS (TOP OF SPINE & FOREHEAD) */}
          <g fill="#FB923C" className="cat-layer-highlights">
            <rect x="17" y="3" width="7" height="1" />
            <rect x="24" y="4" width="2" height="1" />
            <rect x="26" y="5" width="2" height="1" />
            <rect x="28" y="6" width="1" height="2" />
            <rect x="29" y="8" width="1" height="3" />
            <rect x="8" y="5" width="3" height="1" />
            <rect x="7" y="6" width="4" height="1" />
          </g>

          {/* 5. GINGER TABBY STRIPES ON SPINE & TAIL */}
          <g fill="#9A3412" className="cat-layer-stripes">
            {/* Spine Tabby Stripes */}
            <rect x="17" y="3" width="2" height="5" />
            <rect x="21" y="3" width="2" height="6" />
            <rect x="25" y="4" width="2" height="6" />
            <rect x="28" y="7" width="2" height="5" />
            {/* Tail Ring Stripes */}
            <rect x="16" y="15" width="2" height="2" />
            <rect x="21" y="14" width="2" height="3" />
            <rect x="26" y="14" width="2" height="2" />
          </g>

          {/* 6. CREAM / WHITE ACCENTS (TAIL TIP, TUCKED PAWS, CHEEKS) */}
          <g fill="#FFF7ED" className="cat-layer-cream">
            {/* Fluffy white tail tip tucked beside chin */}
            <rect x="5" y="13" width="2" height="1" />
            <rect x="6" y="14" width="3" height="1" />
            <rect x="8" y="15" width="3" height="1" />
            {/* Tucked front paws */}
            <rect x="9" y="13" width="3" height="1" />
            {/* White muzzle / bib accent */}
            <rect x="5" y="11" width="3" height="1" />
            <rect x="6" y="12" width="2" height="1" />
          </g>

          {/* 7. SWEET SLEEPING FACE (CLOSED EYES, PINK NOSE, BLUSH) */}
          {/* Cute pink nose */}
          <rect x="4" y="10" width="2" height="1" fill="#F472B6" />
          {/* Inner ears blush */}
          <rect x="7" y="3" width="2" height="1" fill="#F472B6" />
          <rect x="13" y="3" width="2" height="1" fill="#F472B6" />
          {/* Closed peaceful sleeping eyes (⌒ ⌒) */}
          <g fill="#1C1917" className="cat-sleeping-eyes">
            <rect x="6" y="8" width="2" height="1" />
            <rect x="5" y="9" width="1" height="1" />
            <rect x="8" y="9" width="1" height="1" />
            <rect x="10" y="8" width="2" height="1" />
            <rect x="9" y="9" width="1" height="1" />
            <rect x="12" y="9" width="1" height="1" />
          </g>
          {/* Gentle pink blush under closed eyes */}
          <rect x="6" y="10" width="1" height="1" fill="#F472B6" opacity="0.75" />
          <rect x="11" y="10" width="1" height="1" fill="#F472B6" opacity="0.75" />
        </svg>
      </div>
    </div>
  );
}

export { SleepingBoxPet as SleepingCatPet };

