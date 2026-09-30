import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function PiketMbgTab({ initialDay = 'Senin' }) {
  const { data } = useStore();
  const [activeDay, setActiveDay] = useState(initialDay);
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const mbgSchedule = data.piketMbg || {};
  const dayMbg = mbgSchedule[activeDay] || { ambil: [], balikin: [] };

  return (
    <div>
      {/* Day Buttons */}
      <div className="scrollable-tabs" style={{ marginBottom: '1.25rem' }}>
        {days.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`btn ${activeDay === d ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ fontWeight: activeDay === d ? 700 : 500, minWidth: '60px' }}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Petugas Ngambil */}
        <div>
          <div className="notion-section-title" style={{ marginTop: 0 }}>
            <span>Petugas Ngambil MBG</span>
            <span className="notion-tag notion-tag-gray">
              {(dayMbg.ambil || []).length} Siswa
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
            {(dayMbg.ambil || []).length === 0 ? (
              <div className="card" style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', padding: '1.25rem', fontSize: '0.85rem' }}>
                Belum ada petugas ngambil yang dijadwalkan.
              </div>
            ) : (
              dayMbg.ambil.map((name, i) => (
                <div
                  key={i}
                  className="clean-chip chip-neutral"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    padding: '0.4rem 0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <span>{name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Petugas Balikin */}
        <div>
          <div className="notion-section-title" style={{ marginTop: 0 }}>
            <span>Petugas Balikin MBG</span>
            <span className="notion-tag notion-tag-gray">
              {(dayMbg.balikin || []).length} Siswa
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
            {(dayMbg.balikin || []).length === 0 ? (
              <div className="card" style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', padding: '1.25rem', fontSize: '0.85rem' }}>
                Belum ada petugas balikin yang dijadwalkan.
              </div>
            ) : (
              dayMbg.balikin.map((name, i) => (
                <div
                  key={i}
                  className="clean-chip chip-neutral"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    padding: '0.4rem 0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <span>{name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
