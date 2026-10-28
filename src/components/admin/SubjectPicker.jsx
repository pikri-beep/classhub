import React, { useState, useMemo, useEffect } from 'react';
import { Edit3, List } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getSubjectTagClass } from '../../lib/subjectColors';

export default function SubjectPicker({
  value = '',
  onChange,
  required = true,
  id,
  placeholder = 'Pilih Mata Pelajaran'
}) {
  const { data } = useStore();

  // Aggregate standard subjects from schedules, tasks, exams and canonical curriculum
  const standardSubjects = useMemo(() => {
    const set = new Set();

    // 1. From class schedule
    if (data?.schedules) {
      Object.values(data.schedules).forEach(day => {
        (day.subjects || []).forEach(s => {
          if (s?.subject && s.subject.trim()) {
            set.add(s.subject.trim());
          }
        });
      });
    }

    // 2. From existing tasks & exams
    (data?.tasks || []).forEach(t => {
      if (t?.subject && t.subject.trim()) set.add(t.subject.trim());
    });
    (data?.exams || []).forEach(e => {
      if (e?.subject && e.subject.trim()) set.add(e.subject.trim());
    });

    // 3. Fallback canonical subjects for school curriculum
    const canonicals = [
      'Pemrograman Web',
      'Basis Data',
      'Pemrograman Berbasis Teks dan Multimedia',
      'Pemrograman Perangkat Bergerak',
      'Matematika',
      'Matematika Umum',
      'Matematika Lanjutan',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'PPKN',
      'Pendidikan Agama Islam',
      'Agama',
      'PJOK',
      'IOT',
      'Sejarah',
      'KIK (Kreativitas, Inovasi, dan Kewirausahaan)',
      'BK',
      'P5'
    ];
    canonicals.forEach(c => set.add(c));

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  // Determine if the current value is custom (not in standard list)
  const isValueInStandard = useMemo(() => {
    if (!value) return true;
    return standardSubjects.some(
      s => s.toLowerCase() === value.trim().toLowerCase()
    );
  }, [value, standardSubjects]);

  const [isCustomMode, setIsCustomMode] = useState(!isValueInStandard && Boolean(value));

  // Sync if value changes externally
  useEffect(() => {
    if (value && !isValueInStandard) {
      setIsCustomMode(true);
    }
  }, [value, isValueInStandard]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomMode(true);
      onChange('');
    } else {
      setIsCustomMode(false);
      onChange(val);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        {isCustomMode ? (
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id={id}
              type="text"
              className="form-input"
              placeholder="Ketik nama mata pelajaran kustom/baru..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              list="subject-datalist-suggestions"
              style={{ width: '100%' }}
              autoFocus
            />
            <datalist id="subject-datalist-suggestions">
              {standardSubjects.map(sub => (
                <option key={sub} value={sub} />
              ))}
            </datalist>
          </div>
        ) : (
          <select
            id={id}
            className="form-input"
            value={value}
            onChange={handleSelectChange}
            required={required}
            style={{ flex: 1, cursor: 'pointer' }}
          >
            <option value="">— {placeholder} —</option>
            <optgroup label="Mata Pelajaran Resmi / Jadwal">
              {standardSubjects.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </optgroup>
            <option value="__custom__">✏️ + Tulis Mapel Kustom / Baru...</option>
          </select>
        )}

        <button
          type="button"
          onClick={() => {
            const nextMode = !isCustomMode;
            setIsCustomMode(nextMode);
            if (nextMode) onChange('');
          }}
          className="btn btn-secondary btn-sm"
          style={{
            flexShrink: 0,
            padding: '0.45rem 0.65rem',
            fontSize: '0.78rem',
            gap: '0.3rem',
            display: 'inline-flex',
            alignItems: 'center'
          }}
          title={isCustomMode ? 'Kembali ke daftar mapel resmi' : 'Tulis nama mapel kustom'}
        >
          {isCustomMode ? (
            <>
              <List size={14} />
              <span className="hide-mobile">Daftar</span>
            </>
          ) : (
            <>
              <Edit3 size={14} />
              <span className="hide-mobile">Kustom</span>
            </>
          )}
        </button>
      </div>

      {value && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
          <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-muted)' }}>Tag:</span>
          <span className={`notion-tag ${getSubjectTagClass(value)}`} style={{ fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600 }}>
            {value}
          </span>
        </div>
      )}
    </div>
  );
}
