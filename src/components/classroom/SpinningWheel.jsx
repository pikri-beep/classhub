import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Edit3,
  UserX,
  X,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Copy,
  Check,
  Users,
  Search
} from 'lucide-react';
import ConfirmDialog from '../admin/ConfirmDialog';

// Vibrant 4-color repeating palette
const WHEEL_PALETTE = [
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue -> Crisp White
  { bg: '#DC2626', text: '#FFFFFF' }, // Red -> Crisp White
  { bg: '#EAB308', text: '#18181B' }, // Yellow -> Crisp Dark
  { bg: '#16A34A', text: '#18181B' }  // Green -> Crisp Dark
];

const getSliceTheme = (index, total) => {
  if (total > 1 && index === total - 1 && (index % WHEEL_PALETTE.length === 0)) {
    return { bg: '#8B5CF6', text: '#FFFFFF' };
  }
  return WHEEL_PALETTE[index % WHEEL_PALETTE.length];
};

// Helper to resolve student display name (prioritizes admin-configured nickname)
const getDisplayName = (m) => {
  if (m.nickname && m.nickname.trim()) return m.nickname.trim();
  if (m.name && m.name.trim()) return m.name.trim().split(/\s+/)[0];
  return `Siswa ${m.absentNo || ''}`;
};

export default function SpinningWheel({ members = [] }) {
  // Items state: defaults to class members using nickname
  const [items, setItems] = useState(() => {
    if (members && members.length > 0) {
      return members.map(m => ({
        id: String(m.id || m.absentNo || Math.random()),
        name: getDisplayName(m),
        fullName: m.name,
        absentNo: m.absentNo,
        isEliminated: false
      }));
    }
    return [];
  });

  // Re-sync if members data arrives from cloud/store
  useEffect(() => {
    if (members && members.length > 0) {
      setItems(prev => {
        if (prev.length === 0 || prev.every(p => !p.isEliminated)) {
          return members.map(m => ({
            id: String(m.id || m.absentNo || Math.random()),
            name: getDisplayName(m),
            fullName: m.name,
            absentNo: m.absentNo,
            isEliminated: false
          }));
        }
        return prev;
      });
    }
  }, [members]);

  const [isSpinning, setIsSpinning] = useState(false);
  const isSpinningRef = useRef(false);

  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [copiedHistory, setCopiedHistory] = useState(false);
  const [isClearHistoryConfirmOpen, setIsClearHistoryConfirmOpen] = useState(false);

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('classhub_wheel_muted') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editSearch, setEditSearch] = useState('');

  // Audio Context Ref (synthesizer)
  const audioCtxRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Rotation physics state
  const rotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTickIndexRef = useRef(-1);

  // Active items for the wheel (non-eliminated)
  const activeItems = items.filter(item => !item.isEliminated);
  const activeCount = activeItems.length;
  const eliminatedCount = items.filter(item => item.isEliminated).length;

  // Keep isSpinningRef in sync
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  // Initialize Web Audio safely on user gesture
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Web Audio Synth: Ticking click sound
  const playTickSound = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio synthesis errors
    }
  }, [isMuted, getAudioContext]);

  // Web Audio Synth: Cheerful Victory Chime
  const playWinSound = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const chordNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      chordNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.09;
        const duration = 0.55;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }, [isMuted, getAudioContext]);

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('classhub_wheel_muted', String(next));
      return next;
    });
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen tidak didukung atau diblokir:', err);
      });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  };

  // Track native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Draw wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display resolution adjustment
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || 440;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    const center = size / 2;
    const radius = center - 16;
    const count = activeItems.length;

    ctx.clearRect(0, 0, size, size);

    if (count === 0) {
      ctx.restore();
      return;
    }

    const anglePerSlice = (2 * Math.PI) / count;
    const currentAngle = rotationRef.current;

    // Draw Slices
    for (let i = 0; i < count; i++) {
      const sliceStart = currentAngle + i * anglePerSlice;
      const sliceEnd = sliceStart + anglePerSlice;
      const theme = getSliceTheme(i, count);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, sliceStart, sliceEnd);
      ctx.closePath();

      // Slice background color
      ctx.fillStyle = theme.bg;
      ctx.fill();

      // Slice border line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Name Text along the slice radius
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(sliceStart + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Contrast text styling
      ctx.fillStyle = theme.text;

      // Font size adapts to total items count and canvas size
      let fontSize = 15;
      if (count > 32) fontSize = 10.5;
      else if (count > 24) fontSize = 11.5;
      else if (count > 16) fontSize = 13;
      else if (count > 10) fontSize = 14.5;
      if (size > 500) fontSize = Math.min(fontSize * 1.35, 21);

      ctx.font = `700 ${fontSize}px 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`;

      // Truncate name if too long
      const item = activeItems[i];
      let displayName = item.name;
      if (displayName.length > 20) {
        displayName = displayName.substring(0, 18) + '..';
      }

      ctx.fillText(displayName, radius - 14, 0);
      ctx.restore();
    }

    // Outer Rim
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#18181B';
    ctx.stroke();

    // Center Hub: Pure solid white circle with "PUTAR" affordance
    const hubRadius = Math.max(radius * 0.22, 28);
    ctx.beginPath();
    ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.stroke();

    // Center Hub Label ("PUTAR" / "SPIN...")
    ctx.save();
    ctx.font = `800 ${Math.max(hubRadius * 0.36, 11)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isSpinningRef.current ? '#D97706' : '#18181B';
    ctx.fillText(isSpinningRef.current ? 'SPIN...' : 'PUTAR', center, center);
    ctx.restore();

    ctx.restore();
  }, [activeItems]);

  // Initial draw & redraw on window resize
  useEffect(() => {
    drawWheel();
    const handleResize = () => drawWheel();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWheel]);

  // Start Spinning
  const handleSpin = () => {
    if (isSpinning || activeItems.length === 0) return;

    // Wake up Web Audio
    getAudioContext();

    setIsSpinning(true);
    isSpinningRef.current = true;
    setWinner(null);

    const count = activeItems.length;
    const anglePerSlice = (2 * Math.PI) / count;

    // Random destination: 5 to 8 full rotations + random angle
    const minRounds = 5;
    const maxRounds = 8;
    const rounds = minRounds + Math.random() * (maxRounds - minRounds);
    const extraAngle = Math.random() * 2 * Math.PI;
    const totalRotation = rounds * 2 * Math.PI + extraAngle;

    const startAngle = rotationRef.current;
    const duration = 4800; // ~4.8 seconds
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic Ease-Out curve for dramatic slow-down
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startAngle + totalRotation * easeOut;
      rotationRef.current = current;

      // Detect ticking sound when needle crosses a slice border at 3 o'clock (0 rad)
      const normalizedAngle = ((2 * Math.PI) - (current % (2 * Math.PI))) % (2 * Math.PI);
      const currentSliceIndex = Math.floor(normalizedAngle / anglePerSlice) % count;

      if (currentSliceIndex !== lastTickIndexRef.current) {
        lastTickIndexRef.current = currentSliceIndex;
        playTickSound();
      }

      drawWheel();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished: Determine winner
        setIsSpinning(false);
        isSpinningRef.current = false;
        const winningIndex = currentSliceIndex;
        const selectedWinner = activeItems[winningIndex];

        setWinner(selectedWinner);

        // Add to history
        if (selectedWinner) {
          setHistory(prev => [
            ...prev,
            {
              ...selectedWinner,
              drawIndex: prev.length + 1,
              timestamp: Date.now()
            }
          ]);
        }

        playWinSound();

        // Celebration confetti burst!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        drawWheel();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Keyboard navigation: Spacebar to spin, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpinning && activeItems.length > 0) {
          handleSpin();
        }
      } else if (e.code === 'Escape') {
        if (winner) {
          setWinner(null);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, activeItems, winner, isEditModalOpen]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Eliminate chosen student (Remove from current wheel)
  const handleEliminateWinner = () => {
    if (!winner) return;
    setItems(prev => prev.map(item => {
      if (item.id === winner.id) {
        return { ...item, isEliminated: true };
      }
      return item;
    }));
    setWinner(null);
  };

  // Spin again directly from winner modal
  const handleSpinAgain = () => {
    setWinner(null);
    setTimeout(() => {
      handleSpin();
    }, 150);
  };

  // Reset all eliminated students back into the wheel
  const handleResetEliminations = () => {
    setItems(prev => prev.map(item => ({ ...item, isEliminated: false })));
    setWinner(null);
  };

  // Copy winner history to clipboard
  const handleCopyHistory = () => {
    if (history.length === 0) return;
    const text = history
      .map((h, i) => `${i + 1}. ${h.fullName || h.name}`)
      .join('\n');
    const header = `📋 Urutan Hasil Undian Roda Acak (${history.length} Siswa):\n\n`;
    navigator.clipboard.writeText(header + text).then(() => {
      setCopiedHistory(true);
      setTimeout(() => setCopiedHistory(false), 2000);
    });
  };

  // Clear history
  const handleClearHistory = () => {
    setIsClearHistoryConfirmOpen(true);
  };

  // Add custom item in edit modal
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItems(prev => [
      ...prev,
      {
        id: 'custom-' + Date.now(),
        name: newItemName.trim(),
        fullName: newItemName.trim(),
        absentNo: null,
        isEliminated: false
      }
    ]);
    setNewItemName('');
  };

  // Toggle single item active/inactive
  const handleToggleItem = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isEliminated: !item.isEliminated };
      }
      return item;
    }));
  };

  // Select all / Deselect all in edit modal
  const handleSelectAll = () => {
    setItems(prev => prev.map(item => ({ ...item, isEliminated: false })));
  };

  const handleDeselectAll = () => {
    setItems(prev => prev.map(item => ({ ...item, isEliminated: true })));
  };

  // Delete item from list
  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Reset list back to original class roster with admin nicknames
  const handleResetToRoster = () => {
    if (members && members.length > 0) {
      setItems(members.map(m => ({
        id: String(m.id || m.absentNo || Math.random()),
        name: getDisplayName(m),
        fullName: m.name,
        absentNo: m.absentNo,
        isEliminated: false
      })));
    }
    setIsEditModalOpen(false);
  };

  // Filter items in Edit Modal
  const filteredEditItems = items.filter(item => {
    if (!editSearch.trim()) return true;
    const q = editSearch.toLowerCase().trim();
    return (item.name || '').toLowerCase().includes(q) || (item.fullName || '').toLowerCase().includes(q);
  });

  return (
    <div
      ref={containerRef}
      className={`spinning-wheel-container ${isFullscreen ? 'wheel-fullscreen' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        padding: isFullscreen ? '1.5rem' : '0.5rem',
        backgroundColor: isFullscreen ? '#0B0F19' : 'transparent',
        minHeight: isFullscreen ? '100vh' : 'auto',
        justifyContent: 'center'
      }}
    >
      {/* Action Controls & Session Status Bar */}
      <div
        style={
          isFullscreen
            ? {
              position: 'fixed',
              top: '1.25rem',
              right: '1.5rem',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)'
            }
            : {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '520px',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }
        }
      >
        {/* Left: Status Badges (Aktif & Tereliminasi) */}
        {!isFullscreen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <Users size={12} color="var(--primary)" />
              <span>{activeCount} Siswa Aktif</span>
            </span>

            {eliminatedCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)'
                }}
              >
                <span>{eliminatedCount} Tereliminasi</span>
              </span>
            )}
          </div>
        )}

        {/* Right: Controls (Reset, Edit, Mute, Fullscreen) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
          {items.some(i => i.isEliminated) && (
            <button
              onClick={handleResetEliminations}
              className="btn btn-ghost btn-sm"
              title="Reset & kembalikan seluruh siswa yang tereliminasi"
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.55rem',
                color: isFullscreen ? '#E2E8F0' : 'var(--text-secondary)',
                gap: '0.3rem'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-outline btn-sm"
            title="Edit daftar nama sesi ini"
            style={{
              fontSize: '0.75rem',
              gap: '0.3rem',
              padding: '0.3rem 0.65rem',
              color: isFullscreen ? '#F8FAFC' : undefined,
              borderColor: isFullscreen ? 'rgba(255, 255, 255, 0.2)' : undefined,
              backgroundColor: isFullscreen ? 'rgba(255, 255, 255, 0.05)' : undefined
            }}
          >
            <Edit3 size={13} />
            <span>Edit Daftar</span>
          </button>

          <button
            onClick={toggleMute}
            className="btn btn-ghost btn-sm btn-icon"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            aria-label="Toggle Audio"
            style={{ color: isMuted ? 'var(--danger)' : isFullscreen ? '#E2E8F0' : 'var(--text-secondary)' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn btn-ghost btn-sm btn-icon"
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh Proyektor'}
            aria-label="Toggle Fullscreen"
            style={{ color: isFullscreen ? '#F8FAFC' : 'var(--text-secondary)' }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* EMPTY STATE (JIKA SEMUA SISWA TERELIMINASI / KOSONG) */}
      {activeItems.length === 0 ? (
        <div
          style={{
            width: isFullscreen ? 'min(82vw, 76vh)' : 'min(92vw, 440px)',
            height: isFullscreen ? 'min(82vw, 76vh)' : 'min(92vw, 440px)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)',
            border: '2px dashed var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            margin: '1rem auto'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <UserX size={30} />
          </div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Semua Siswa Tereliminasi
          </h4>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.5 }}>
            Seluruh siswa pada sesi ini sudah selesai maju. Klik tombol di bawah untuk memasukkan kembali seluruh nama ke roda.
          </p>
          <button
            onClick={handleResetEliminations}
            className="btn btn-primary"
            style={{ gap: '0.45rem', fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '0.6rem 1.4rem' }}
          >
            <RotateCcw size={15} />
            <span>Reset & Muat Ulang Siswa</span>
          </button>
        </div>
      ) : (
        /* Wheel Canvas & Indicator Wrapper */
        <div
          style={{
            position: 'relative',
            width: isFullscreen ? 'min(88vw, 86vh)' : 'min(92vw, 460px)',
            height: isFullscreen ? 'min(88vw, 86vh)' : 'min(92vw, 460px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0.5rem auto'
          }}
        >
          {/* Right Needle Pointer */}
          <div
            style={{
              position: 'absolute',
              right: isFullscreen ? '-8px' : '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.45))'
            }}
          >
            <svg
              width={isFullscreen ? "36" : "28"}
              height={isFullscreen ? "40" : "32"}
              viewBox="0 0 32 36"
            >
              <polygon points="0,18 32,4 32,18" fill="#EF4444" />
              <polygon points="0,18 32,18 32,32" fill="#B91C1C" />
            </svg>
          </div>

          {/* HTML5 Canvas (Klik kanvas langsung untuk memutar) */}
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
              cursor: isSpinning ? 'not-allowed' : 'pointer'
            }}
            onClick={!isSpinning && activeItems.length > 0 ? handleSpin : undefined}
            title={isSpinning ? 'Sedang memutar...' : 'Klik roda untuk memutar'}
          />
        </div>
      )}

      {/* Primary Spin Button Below Wheel */}
      <div style={{ marginTop: '0.85rem', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning || activeItems.length === 0}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            height: '46px',
            fontSize: '0.98rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            cursor: isSpinning || activeItems.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <Sparkles size={17} />
          <span>{isSpinning ? 'Sedang Memutar...' : 'Putar Roda Acak'}</span>
        </button>
      </div>

      {/* Winner History List (Riwayat Siswa Terpilih) */}
      {history.length > 0 && !isFullscreen && (
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '520px',
            marginTop: '1.25rem',
            padding: '0.9rem 1.15rem',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Users size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Riwayat Terpilih ({history.length} Siswa)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={handleCopyHistory}
                className="btn btn-secondary btn-xs"
                style={{ gap: '0.25rem', fontSize: '0.74rem' }}
                title="Salin daftar urutan siswa terpilih"
              >
                {copiedHistory ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                <span>{copiedHistory ? 'Tersalin!' : 'Salin Urutan'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="btn btn-ghost btn-xs"
                style={{ fontSize: '0.74rem', color: 'var(--danger)' }}
                title="Hapus riwayat undian sesi ini"
              >
                <Trash2 size={12} />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* History Sequence Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {history.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.6rem',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-soft)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  #{idx + 1}
                </span>
                <span>{item.fullName || item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HASIL UNDIAN MODAL (Siswa Terpilih) */}
      {winner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setWinner(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Celebratory Header */}
            <div
              style={{
                backgroundColor: 'var(--primary)',
                padding: '0.9rem 1.25rem',
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                letterSpacing: '-0.01em'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} />
                <span>Siswa Terpilih!</span>
              </div>
              <button
                type="button"
                onClick={() => setWinner(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  opacity: 0.9
                }}
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Winner Name in the Middle: FULL NAME ONLY, NO ABSENT NUMBER */}
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: isFullscreen ? '2.8rem' : '2.1rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}
              >
                {winner.fullName || winner.name}
              </h1>
            </div>

            {/* Footer Buttons: Tutup, Eliminasi Siswa, Putar Lagi */}
            <div
              style={{
                padding: '0.9rem 1.25rem',
                backgroundColor: 'var(--bg)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >

              <button
                type="button"
                onClick={handleSpinAgain}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700, fontSize: '0.82rem', gap: '0.35rem' }}
                title="Lanjut memutar roda untuk siswa berikutnya"
              >
                <RotateCcw size={13} />
                <span>Putar Lagi</span>
              </button>
              <button
                type="button"
                onClick={handleEliminateWinner}
                className="btn btn-danger btn-sm"
                style={{ fontWeight: 600, fontSize: '0.82rem' }}
                title="Keluarkan siswa dari putaran berikutnya agar tidak terpilih ganda"
              >
                Eliminasi Siswa
              </button>

            </div>
          </div>
        </div>
      )}

      {/* EDIT TEMPORARY LIST MODAL */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Edit Daftar Sesi Ini</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {activeCount} dari {items.length} siswa aktif pada roda putaran.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-ghost btn-sm btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions & Search Filter */}
            <div style={{ padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari nama siswa..."
                  value={editSearch}
                  onChange={e => setEditSearch(e.target.value)}
                  style={{ paddingLeft: '1.9rem', fontSize: '0.82rem', height: '32px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="btn btn-secondary btn-xs"
                  style={{ fontSize: '0.74rem' }}
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
                >
                  Batal Semua
                </button>
              </div>
            </div>

            {/* Modal Form: Add Custom Item */}
            <form onSubmit={handleAddCustomItem} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Tambah nama siswa atau topik khusus..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                style={{ flex: 1, fontSize: '0.84rem', height: '34px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '0.3rem', flexShrink: 0 }}>
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </form>

            {/* Modal List Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {filteredEditItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Tidak ada siswa yang cocok dengan "{editSearch}".
                </div>
              ) : (
                filteredEditItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: item.isEliminated ? 'rgba(100, 116, 139, 0.08)' : 'var(--bg)',
                      border: '1px solid var(--border)',
                      opacity: item.isEliminated ? 0.6 : 1
                    }}
                  >
                    <div
                      onClick={() => handleToggleItem(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1 }}
                    >
                      {item.isEliminated ? (
                        <Square size={16} color="var(--text-muted)" />
                      ) : (
                        <CheckSquare size={16} color="var(--primary)" />
                      )}
                      <span style={{
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        textDecoration: item.isEliminated ? 'line-through' : 'none',
                        color: item.isEliminated ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}>
                        {item.fullName || item.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="btn btn-ghost btn-sm btn-icon"
                      title="Hapus dari daftar sesi ini"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <button
                onClick={handleResetToRoster}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
              >
                Reset ke Rombel Kelas
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-primary btn-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM DIALOG: HAPUS RIWAYAT TERPILIH */}
      <ConfirmDialog
        isOpen={isClearHistoryConfirmOpen}
        onClose={() => setIsClearHistoryConfirmOpen(false)}
        onConfirm={() => {
          setHistory([]);
          setIsClearHistoryConfirmOpen(false);
        }}
        title="Hapus Riwayat Undian"
        message={`Apakah Anda yakin ingin menghapus seluruh ${history.length} riwayat siswa terpilih sesi ini? Urutan yang telah tercatat akan dikosongkan.`}
        confirmLabel="Hapus Riwayat"
        cancelLabel="Batal"
        variant="danger"
      />
    </div>
  );
}
