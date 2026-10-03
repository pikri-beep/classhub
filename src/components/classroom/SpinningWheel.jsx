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
  Square
} from 'lucide-react';

// Vibrant 4-color repeating palette matching reference design
const WHEEL_PALETTE = [
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue -> Crisp White
  { bg: '#DC2626', text: '#FFFFFF' }, // Red -> Crisp White
  { bg: '#EAB308', text: '#18181B' }, // Yellow -> Crisp Dark
  { bg: '#16A34A', text: '#18181B' }  // Green -> Crisp Dark
];

const getSliceTheme = (index, total) => {
  // If total is 4k + 1 (e.g. 5, 9, 13, 17, 21...), last item would touch first item (Blue).
  // In that case, use purple for the last item so adjacent slices never clash.
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
        // If current items are default or empty, update with latest member nicknames
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
  const [winner, setWinner] = useState(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('classhub_wheel_muted') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');

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

      // Contrast text styling matching reference
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

    // Outer Rim: Thin crisp border matching reference
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#18181B';
    ctx.stroke();

    // Center Hub: Pure solid white circle matching reference
    const hubRadius = Math.max(radius * 0.22, 28);
    ctx.beginPath();
    ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.stroke();

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
    const targetAngle = startAngle + totalRotation;
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
        const winningIndex = currentSliceIndex;
        const selectedWinner = activeItems[winningIndex];

        setWinner(selectedWinner);
        playWinSound();

        // Celebration confetti burst!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
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

  // Eliminate chosen student (Remove button)
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

  // Reset all eliminated students back into the wheel
  const handleResetEliminations = () => {
    setItems(prev => prev.map(item => ({ ...item, isEliminated: false })));
    setWinner(null);
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
      {/* Action Controls: Edit, Mute, Fullscreen */}
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
              justifyContent: 'flex-end',
              width: '100%',
              maxWidth: '520px',
              marginBottom: '0.5rem',
              gap: '0.4rem'
            }
        }
      >
        {items.some(i => i.isEliminated) && (
          <button
            onClick={handleResetEliminations}
            className="btn btn-ghost btn-sm"
            title="Reset & Kembalikan siswa yang tereliminasi"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.65rem',
              color: isFullscreen ? '#E2E8F0' : 'var(--text-secondary)',
              gap: '0.35rem'
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
            gap: '0.35rem',
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
        /* Wheel Canvas & Indicator Wrapper (Perbesar ukuran tampilan) */
        <div
          style={{
            position: 'relative',
            width: isFullscreen ? 'min(88vw, 86vh)' : 'min(94vw, 480px)',
            height: isFullscreen ? 'min(88vw, 86vh)' : 'min(94vw, 480px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0.5rem auto'
          }}
        >
          {/* Right Needle Pointer (Red 3D Faceted Arrow pointing left into wheel) */}
          <div
            style={{
              position: 'absolute',
              right: isFullscreen ? '-12px' : '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.45))'
            }}
          >
            <svg
              width={isFullscreen ? "38" : "32"}
              height={isFullscreen ? "42" : "36"}
              viewBox="0 0 32 36"
            >
              {/* Top lighter facet */}
              <polygon points="0,18 32,4 32,18" fill="#EF4444" />
              {/* Bottom darker facet for 3D depth */}
              <polygon points="0,18 32,18 32,32" fill="#B91C1C" />
            </svg>
          </div>

          {/* HTML5 Canvas (Klik langsung roda untuk memutar) */}
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

      {/* HASIL UNDIAN MODAL (Sesuai Desain Foto: Header Merah 'We have a winner!', Nama Tengah, Tombol Close & Remove) */}
      {winner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
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
              backgroundColor: '#18181B',
              borderRadius: '10px',
              overflow: 'hidden',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Red Top Header Bar: "We have a winner!" */}
            <div
              style={{
                backgroundColor: '#DC2626',
                padding: '0.85rem 1.25rem',
                color: '#FFFFFF',
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                userSelect: 'none'
              }}
            >
              We have a winner!
            </div>

            {/* Winner Name in the Middle */}
            <div
              style={{
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: '#18181B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: isFullscreen ? '3.8rem' : '3rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.01em',
                  lineHeight: 1.1,
                  wordBreak: 'break-word',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {winner.name}
              </h1>
            </div>

            {/* Footer Buttons: Close & Remove */}
            <div
              style={{
                padding: '0.75rem 1.25rem 1.25rem 1.25rem',
                backgroundColor: '#18181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.85rem'
              }}
            >
              <button
                onClick={() => setWinner(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  padding: '0.5rem 0.85rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Close
              </button>

              <button
                onClick={handleEliminateWinner}
                style={{
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  padding: '0.55rem 1.35rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)',
                  transition: 'background-color 0.15s, transform 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4338CA'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F46E5'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Remove
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
                  Perubahan di sini hanya bersifat sementara untuk sesi putaran ini.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-ghost btn-sm btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form: Add Custom Item */}
            <form onSubmit={handleAddCustomItem} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Tambah nama siswa atau topik khusus..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '0.3rem', flexShrink: 0 }}>
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </form>

            {/* Modal List Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {items.map(item => (
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
                      {item.name}
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
              ))}
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
                Reset ke Seluruh Siswa Kelas
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
    </div>
  );
}
