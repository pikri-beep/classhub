import React from 'react';

export default function SleepingBoxPet() {
  return (
    <div 
      className="sleeping-box-pet-container"
      aria-label="Kucing tidur di dalam box"
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
        width: '66px',
        height: '52px'
      }}
    >
      {/* FLOATING 8-BIT Z Z Z ZZ SLEEP PARTICLES */}
      <div className="sleeping-z-stream">
        <span className="pixel-z z-1">z</span>
        <span className="pixel-z z-2">z</span>
        <span className="pixel-z z-3">z</span>
        <span className="pixel-z z-4">zz</span>
      </div>

      {/* PIXEL ART SLEEPING CAT IN CARDBOARD BOX */}
      <div className="sleeping-cat-wrapper">
        <svg
          width="56"
          height="42"
          viewBox="0 0 32 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            imageRendering: 'pixelated',
            shapeRendering: 'crispEdges',
            display: 'block'
          }}
        >
          {/* =========================================
              BAGIAN 1: KUCING TIDUR PIXEL 8-BIT
             ========================================= */}
          <g className="sleeping-cat-body">
            {/* Telinga Kiri (Rebah santai ke kiri) */}
            <rect x="7" y="3" width="2" height="2" fill="#D97706" />
            <rect x="6" y="4" width="2" height="2" fill="#D97706" />
            <rect x="8" y="4" width="2" height="2" fill="#FCA5A5" />

            {/* Telinga Kanan (Rebah santai ke kanan) */}
            <rect x="22" y="3" width="2" height="2" fill="#D97706" />
            <rect x="23" y="4" width="2" height="2" fill="#D97706" />
            <rect x="21" y="4" width="2" height="2" fill="#FCA5A5" />

            {/* Kepala Kucing (Posisi menunduk santai) */}
            <rect x="8" y="4" width="15" height="8" fill="#F59E0B" />
            <rect x="7" y="5" width="17" height="6" fill="#F59E0B" />
            <rect x="6" y="6" width="19" height="4" fill="#F59E0B" />

            {/* Belang Pixel Kepala */}
            <rect x="14" y="3" width="3" height="3" fill="#B45309" />
            <rect x="12" y="4" width="1" height="2" fill="#B45309" />
            <rect x="18" y="4" width="1" height="2" fill="#B45309" />

            {/* Moncong / Pipi Bawah Krem */}
            <rect x="10" y="8" width="11" height="3" fill="#FEF3C7" />
            <rect x="11" y="9" width="9" height="2" fill="#FEF3C7" />

            {/* Hidung Pink Kecil */}
            <rect x="15" y="8" width="1" height="1" fill="#F43F5E" />

            {/* Mata Tidur Merem Pixel (Garis Santai) */}
            <rect x="9" y="7" width="3" height="1" fill="#451A03" />
            <rect x="19" y="7" width="3" height="1" fill="#451A03" />

            {/* Rona Pipi Merah Lembut (Blush) */}
            <rect x="7" y="8" width="2" height="1" fill="#FDA4AF" />
            <rect x="22" y="8" width="2" height="1" fill="#FDA4AF" />
          </g>

          {/* =========================================
              BAGIAN 2: KARDUS BOX PIXEL 8-BIT
             ========================================= */}
          {/* Lubang Dalam Box */}
          <rect x="4" y="9" width="23" height="3" fill="#451A03" />

          {/* Badan Kardus Depan */}
          <rect x="3" y="11" width="25" height="12" fill="#B45309" />
          <rect x="4" y="12" width="23" height="10" fill="#D97706" />

          {/* Highlight & Shadow Kardus */}
          <rect x="4" y="12" width="23" height="1" fill="#FBBF24" />
          <rect x="4" y="13" width="1" height="9" fill="#FBBF24" />
          <rect x="26" y="12" width="1" height="10" fill="#92400E" />
          <rect x="4" y="21" width="23" height="1" fill="#78350F" />

          {/* Lakban Kotak */}
          <rect x="14" y="11" width="3" height="11" fill="#FDE68A" />
          <rect x="14" y="11" width="1" height="11" fill="#F59E0B" />

          {/* Sayap Box Terbuka Kiri & Kanan */}
          <polygon points="3,11 0,9 3,9" fill="#F59E0B" />
          <polygon points="28,11 31,9 28,9" fill="#B45309" />

          {/* Dua Cakar Putih Nyaman Menempel di Bibir Box */}
          <rect x="9" y="10" width="3" height="2" fill="#FEF3C7" />
          <rect x="19" y="10" width="3" height="2" fill="#FEF3C7" />

          {/* Label Mini Kotak "zZ" */}
          <rect x="8" y="16" width="3" height="1" fill="#92400E" />
          <rect x="9" y="17" width="1" height="1" fill="#92400E" />
          <rect x="8" y="18" width="3" height="1" fill="#92400E" />
        </svg>
      </div>

      {/* Bayangan Halus di Lantai Kartu */}
      <div
        style={{
          width: '46px',
          height: '3px',
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
          borderRadius: '50%',
          marginTop: '-1px'
        }}
      />
    </div>
  );
}
