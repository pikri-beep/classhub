import React from 'react';

export default function SleepingBoxPet() {
  return (
    <div 
      className="sleeping-cat-pet-container"
      aria-label="Kucing oranye tidur pulas di lantai"
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      {/* FLOATING SLEEP PARTICLES (z z z zz) DRIFTING FROM SNOUT */}
      <div 
        className="sleeping-z-stream" 
        style={{ 
          position: 'absolute',
          top: '-14px', 
          left: '4px',
          width: '36px',
          height: '36px',
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        <span className="pixel-z z-1">z</span>
        <span className="pixel-z z-2">z</span>
        <span className="pixel-z z-3">z</span>
        <span className="pixel-z z-4">zz</span>
      </div>

      {/* PIXEL ART SLEEPING GINGER CAT (MATCHING REFERENCE IMAGE 100%) */}
      <div className="sleeping-cat-wrapper">
        <svg
          width="78"
          height="46"
          viewBox="0 0 39 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            imageRendering: 'pixelated',
            shapeRendering: 'crispEdges',
            display: 'block'
          }}
        >
          {/* Main Orange Fur Body */}
          <g fill="#EA580C" className="cat-layer-main">
            <rect x="23" y="1" width="2" height="1" />
            <rect x="27" y="1" width="1" height="1" />
            <rect x="19" y="2" width="2" height="1" />
            <rect x="23" y="2" width="3" height="1" />
            <rect x="27" y="2" width="3" height="1" />
            <rect x="16" y="3" width="1" height="1" />
            <rect x="19" y="3" width="3" height="1" />
            <rect x="24" y="3" width="2" height="1" />
            <rect x="28" y="3" width="2" height="1" />
            <rect x="32" y="3" width="1" height="1" />
            <rect x="10" y="4" width="1" height="1" />
            <rect x="16" y="4" width="2" height="1" />
            <rect x="20" y="4" width="3" height="1" />
            <rect x="24" y="4" width="3" height="1" />
            <rect x="28" y="4" width="3" height="1" />
            <rect x="32" y="4" width="2" height="1" />
            <rect x="10" y="5" width="2" height="1" />
            <rect x="14" y="5" width="5" height="1" />
            <rect x="20" y="5" width="3" height="1" />
            <rect x="24" y="5" width="3" height="1" />
            <rect x="28" y="5" width="4" height="1" />
            <rect x="33" y="5" width="2" height="1" />
            <rect x="10" y="6" width="2" height="1" />
            <rect x="14" y="6" width="2" height="1" />
            <rect x="17" y="6" width="2" height="1" />
            <rect x="20" y="6" width="4" height="1" />
            <rect x="25" y="6" width="3" height="1" />
            <rect x="29" y="6" width="7" height="1" />
            <rect x="7" y="7" width="2" height="1" />
            <rect x="10" y="7" width="3" height="1" />
            <rect x="15" y="7" width="5" height="1" />
            <rect x="21" y="7" width="3" height="1" />
            <rect x="25" y="7" width="3" height="1" />
            <rect x="29" y="7" width="3" height="1" />
            <rect x="33" y="7" width="3" height="1" />
            <rect x="6" y="8" width="8" height="1" />
            <rect x="15" y="8" width="6" height="1" />
            <rect x="22" y="8" width="3" height="1" />
            <rect x="26" y="8" width="7" height="1" />
            <rect x="34" y="8" width="3" height="1" />
            <rect x="5" y="9" width="4" height="1" />
            <rect x="10" y="9" width="19" height="1" />
            <rect x="30" y="9" width="3" height="1" />
            <rect x="35" y="9" width="2" height="1" />
            <rect x="4" y="10" width="4" height="1" />
            <rect x="9" y="10" width="2" height="1" />
            <rect x="12" y="10" width="21" height="1" />
            <rect x="35" y="10" width="2" height="1" />
            <rect x="1" y="11" width="7" height="1" />
            <rect x="9" y="11" width="1" height="1" />
            <rect x="11" y="11" width="2" height="1" />
            <rect x="14" y="11" width="5" height="1" />
            <rect x="20" y="11" width="8" height="1" />
            <rect x="29" y="11" width="5" height="1" />
            <rect x="36" y="11" width="1" height="1" />
            <rect x="2" y="12" width="5" height="1" />
            <rect x="8" y="12" width="4" height="1" />
            <rect x="14" y="12" width="5" height="1" />
            <rect x="21" y="12" width="6" height="1" />
            <rect x="29" y="12" width="5" height="1" />
            <rect x="36" y="12" width="1" height="1" />
            <rect x="4" y="13" width="1" height="1" />
            <rect x="7" y="13" width="1" height="1" />
            <rect x="9" y="13" width="2" height="1" />
            <rect x="13" y="13" width="5" height="1" />
            <rect x="30" y="13" width="4" height="1" />
            <rect x="36" y="13" width="1" height="1" />
            <rect x="13" y="14" width="5" height="1" />
            <rect x="31" y="14" width="3" height="1" />
            <rect x="36" y="14" width="1" height="1" />
            <rect x="14" y="15" width="3" height="1" />
            <rect x="32" y="15" width="1" height="1" />
            <rect x="36" y="15" width="1" height="1" />
            <rect x="15" y="16" width="2" height="1" />
            <rect x="36" y="16" width="1" height="1" />
            <rect x="15" y="17" width="2" height="1" />
            <rect x="36" y="17" width="1" height="1" />
            <rect x="15" y="18" width="1" height="1" />
            <rect x="36" y="18" width="1" height="1" />
            <rect x="15" y="19" width="1" height="1" />
            <rect x="36" y="19" width="1" height="1" />
            <rect x="15" y="20" width="1" height="1" />
            <rect x="36" y="20" width="1" height="1" />
            <rect x="14" y="21" width="1" height="1" />
            <rect x="36" y="21" width="1" height="1" />
          </g>

          {/* Light Orange Stripes / Highlights */}
          <g fill="#FB923C" className="cat-layer-stripes">
            <rect x="21" y="1" width="2" height="1" />
            <rect x="25" y="1" width="2" height="1" />
            <rect x="18" y="2" width="1" height="1" />
            <rect x="21" y="2" width="2" height="1" />
            <rect x="26" y="2" width="1" height="1" />
            <rect x="30" y="2" width="1" height="1" />
            <rect x="17" y="3" width="2" height="1" />
            <rect x="22" y="3" width="2" height="1" />
            <rect x="26" y="3" width="2" height="1" />
            <rect x="30" y="3" width="2" height="1" />
            <rect x="15" y="4" width="1" height="1" />
            <rect x="18" y="4" width="2" height="1" />
            <rect x="23" y="4" width="1" height="1" />
            <rect x="27" y="4" width="1" height="1" />
            <rect x="31" y="4" width="1" height="1" />
            <rect x="19" y="5" width="1" height="1" />
            <rect x="23" y="5" width="1" height="1" />
            <rect x="27" y="5" width="1" height="1" />
            <rect x="32" y="5" width="1" height="1" />
            <rect x="16" y="6" width="1" height="1" />
            <rect x="19" y="6" width="1" height="1" />
            <rect x="24" y="6" width="1" height="1" />
            <rect x="28" y="6" width="1" height="1" />
            <rect x="20" y="7" width="1" height="1" />
            <rect x="24" y="7" width="1" height="1" />
            <rect x="28" y="7" width="1" height="1" />
            <rect x="32" y="7" width="1" height="1" />
            <rect x="21" y="8" width="1" height="1" />
            <rect x="25" y="8" width="1" height="1" />
            <rect x="33" y="8" width="1" height="1" />
            <rect x="29" y="9" width="1" height="1" />
            <rect x="34" y="9" width="1" height="1" />
            <rect x="34" y="10" width="1" height="1" />
            <rect x="6" y="13" width="1" height="1" />
          </g>

          {/* Darker Underbelly & Inner Shadows */}
          <g fill="#B43B0E" className="cat-layer-shadow">
            <rect x="9" y="5" width="1" height="1" />
            <rect x="9" y="6" width="1" height="1" />
            <rect x="9" y="7" width="1" height="1" />
            <rect x="14" y="7" width="1" height="1" />
            <rect x="14" y="8" width="1" height="1" />
            <rect x="11" y="11" width="1" height="1" />
            <rect x="19" y="11" width="1" height="1" />
            <rect x="28" y="11" width="1" height="1" />
            <rect x="35" y="11" width="1" height="1" />
            <rect x="12" y="12" width="1" height="1" />
            <rect x="19" y="12" width="1" height="1" />
            <rect x="27" y="12" width="1" height="1" />
            <rect x="35" y="12" width="1" height="1" />
            <rect x="3" y="13" width="1" height="1" />
            <rect x="8" y="13" width="1" height="1" />
            <rect x="12" y="13" width="1" height="1" />
            <rect x="18" y="13" width="1" height="1" />
            <rect x="20" y="13" width="9" height="1" />
            <rect x="35" y="13" width="1" height="1" />
            <rect x="1" y="14" width="2" height="1" />
            <rect x="4" y="14" width="4" height="1" />
            <rect x="12" y="14" width="1" height="1" />
            <rect x="18" y="14" width="1" height="1" />
            <rect x="23" y="14" width="2" height="1" />
            <rect x="34" y="14" width="2" height="1" />
            <rect x="37" y="14" width="1" height="1" />
            <rect x="13" y="16" width="1" height="1" />
            <rect x="34" y="16" width="2" height="1" />
            <rect x="37" y="16" width="1" height="1" />
            <rect x="33" y="17" width="2" height="1" />
            <rect x="37" y="17" width="1" height="1" />
            <rect x="33" y="18" width="1" height="1" />
            <rect x="37" y="18" width="1" height="1" />
            <rect x="33" y="19" width="1" height="1" />
            <rect x="37" y="19" width="1" height="1" />
            <rect x="33" y="20" width="1" height="1" />
            <rect x="37" y="20" width="1" height="1" />
            <rect x="33" y="21" width="1" height="1" />
            <rect x="37" y="21" width="1" height="1" />
          </g>

          {/* Pink Cheeks / Nose Accent */}
          <g fill="#F472B6" className="cat-layer-pink">
            <rect x="8" y="11" width="1" height="1" />
            <rect x="5" y="13" width="1" height="1" />
          </g>

          {/* Crisp Black 8-Bit Pixel Outline */}
          <g fill="#1A181B" className="cat-layer-outline">
            <rect x="21" y="0" width="7" height="1" />
            <rect x="18" y="1" width="3" height="1" />
            <rect x="28" y="1" width="3" height="1" />
            <rect x="16" y="2" width="2" height="1" />
            <rect x="31" y="2" width="2" height="1" />
            <rect x="10" y="3" width="1" height="1" />
            <rect x="15" y="3" width="1" height="1" />
            <rect x="33" y="3" width="1" height="1" />
            <rect x="9" y="4" width="1" height="1" />
            <rect x="11" y="4" width="1" height="1" />
            <rect x="14" y="4" width="1" height="1" />
            <rect x="34" y="4" width="1" height="1" />
            <rect x="8" y="5" width="1" height="1" />
            <rect x="12" y="5" width="2" height="1" />
            <rect x="35" y="5" width="1" height="1" />
            <rect x="6" y="6" width="3" height="1" />
            <rect x="12" y="6" width="1" height="1" />
            <rect x="36" y="6" width="1" height="1" />
            <rect x="5" y="7" width="1" height="1" />
            <rect x="13" y="7" width="1" height="1" />
            <rect x="36" y="7" width="1" height="1" />
            <rect x="4" y="8" width="1" height="1" />
            <rect x="37" y="8" width="1" height="1" />
            <rect x="3" y="9" width="1" height="1" />
            <rect x="8" y="9" width="1" height="1" />
            <rect x="33" y="9" width="1" height="1" />
            <rect x="37" y="9" width="1" height="1" />
            <rect x="0" y="10" width="3" height="1" />
            <rect x="8" y="10" width="1" height="1" />
            <rect x="11" y="10" width="1" height="1" />
            <rect x="33" y="10" width="1" height="1" />
            <rect x="37" y="10" width="1" height="1" />
            <rect x="0" y="11" width="1" height="1" />
            <rect x="10" y="11" width="1" height="1" />
            <rect x="34" y="11" width="1" height="1" />
            <rect x="37" y="11" width="1" height="1" />
            <rect x="1" y="12" width="1" height="1" />
            <rect x="7" y="12" width="1" height="1" />
            <rect x="13" y="12" width="1" height="1" />
            <rect x="20" y="12" width="1" height="1" />
            <rect x="27" y="12" width="1" height="1" />
            <rect x="34" y="12" width="1" height="1" />
            <rect x="37" y="12" width="1" height="1" />
            <rect x="2" y="13" width="1" height="1" />
            <rect x="4" y="13" width="1" height="1" />
            <rect x="19" y="13" width="1" height="1" />
            <rect x="29" y="13" width="1" height="1" />
            <rect x="34" y="13" width="1" height="1" />
            <rect x="37" y="13" width="1" height="1" />
            <rect x="3" y="14" width="1" height="1" />
            <rect x="8" y="14" width="3" height="1" />
            <rect x="19" y="14" width="4" height="1" />
            <rect x="25" y="14" width="5" height="1" />
            <rect x="37" y="14" width="1" height="1" />
            <rect x="6" y="15" width="1" height="1" />
            <rect x="13" y="15" width="1" height="1" />
            <rect x="17" y="15" width="1" height="1" />
            <rect x="31" y="15" width="1" height="1" />
            <rect x="33" y="15" width="3" height="1" />
            <rect x="37" y="15" width="1" height="1" />
            <rect x="5" y="16" width="1" height="1" />
            <rect x="17" y="16" width="1" height="1" />
            <rect x="32" y="16" width="2" height="1" />
            <rect x="37" y="16" width="1" height="1" />
            <rect x="14" y="17" width="1" height="1" />
            <rect x="17" y="17" width="1" height="1" />
            <rect x="32" y="17" width="1" height="1" />
            <rect x="35" y="17" width="1" height="1" />
            <rect x="37" y="17" width="1" height="1" />
            <rect x="14" y="18" width="1" height="1" />
            <rect x="16" y="18" width="2" height="1" />
            <rect x="32" y="18" width="1" height="1" />
            <rect x="35" y="18" width="1" height="1" />
            <rect x="37" y="18" width="1" height="1" />
            <rect x="14" y="19" width="1" height="1" />
            <rect x="16" y="19" width="1" height="1" />
            <rect x="32" y="19" width="1" height="1" />
            <rect x="35" y="19" width="1" height="1" />
            <rect x="37" y="19" width="1" height="1" />
            <rect x="14" y="20" width="1" height="1" />
            <rect x="16" y="20" width="1" height="1" />
            <rect x="32" y="20" width="1" height="1" />
            <rect x="35" y="20" width="1" height="1" />
            <rect x="37" y="20" width="1" height="1" />
            <rect x="13" y="21" width="1" height="1" />
            <rect x="15" y="21" width="1" height="1" />
            <rect x="32" y="21" width="1" height="1" />
            <rect x="35" y="21" width="1" height="1" />
            <rect x="14" y="22" width="1" height="1" />
            <rect x="32" y="22" width="1" height="1" />
            <rect x="35" y="22" width="2" height="1" />
          </g>
        </svg>
      </div>

      {/* Gentle shadow underneath resting paws */}
      <div
        style={{
          width: '68px',
          height: '2px',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          borderRadius: '50%',
          marginTop: '-1px'
        }}
      />
    </div>
  );
}

export { SleepingBoxPet as SleepingCatPet };
