import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Edit3, 
  UserX, 
  Trophy, 
  Sparkles, 
  X, 
  Plus, 
  Trash2,
  CheckSquare,
  Square,
  Users
} from 'lucide-react';

// Curated vibrant & contrasting palette for wheel slices
const SLICE_COLORS = [
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#E11D48', // Rose
  '#0EA5E9'  // Sky
];

export default function SpinningWheel({ members = [] }) {
  // Items state: defaults to class members
  const [items, setItems] = useState(() => {
    if (members && members.length > 0) {
      return members.map(m => ({
        id: String(m.id || m.absentNo || Math.random()),
        name: m.name || `Siswa ${m.absentNo}`,
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
        if (prev.length === 0) {
          return members.map(m => ({
            id: String(m.id || m.absentNo || Math.random()),
            name: m.name || `Siswa ${m.absentNo}`,
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
      // Ignore audio synthesis errors on unsupported browsers
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
      document.exitFullscreen().catch(() => {});
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
    const size = canvas.clientWidth || 360;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    const center = size / 2;
    const radius = center - 16;
    const count = activeItems.length;

    ctx.clearRect(0, 0, size, size);

    if (count === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'var(--border)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tidak ada siswa aktif', center, center);
      ctx.restore();
      return;
    }

    const anglePerSlice = (2 * Math.PI) / count;
    const currentAngle = rotationRef.current;

    // Draw Slices
    for (let i = 0; i < count; i++) {
      const sliceStart = currentAngle + i * anglePerSlice;
      const sliceEnd = sliceStart + anglePerSlice;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, sliceStart, sliceEnd);
      ctx.closePath();

      // Alternate slice background colors
      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      // Slice border line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Name Text along the slice radius
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(sliceStart + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Contrast text styling
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Font size adapts to total items count
      let fontSize = 14;
      if (count > 25) fontSize = 10;
      else if (count > 18) fontSize = 11;
      else if (count > 12) fontSize = 12;
      if (size > 480) fontSize = Math.min(fontSize * 1.35, 18);

      ctx.font = `700 ${fontSize}px Plus Jakarta Sans, sans-serif`;

      // Truncate name if too long
      const item = activeItems[i];
      let displayName = item.name;
      if (displayName.length > 18) {
        displayName = displayName.substring(0, 16) + '...';
      }

      ctx.fillText(displayName, radius - 16, 0);
      ctx.restore();
    }

    // Outer Rim with decorative dots
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#1E293B';
    ctx.stroke();

    // Center Hub (Golden jewel cap)
    ctx.beginPath();
    ctx.arc(center, center, Math.max(radius * 0.18, 26), 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(center, center, 4, center, center, 32);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#B45309');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Center icon/star
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, 2 * Math.PI);
    ctx.fill();

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

      // Detect ticking sound when needle crosses a slice border at top (3*PI/2)
      // Top pointer is at angle -Math.PI / 2 (or 3 * Math.PI / 2)
      const normalizedAngle = (2 * Math.PI - (current % (2 * Math.PI))) % (2 * Math.PI);
      const pointerAngle = (normalizedAngle + 3 * Math.PI / 2) % (2 * Math.PI);
      const currentSliceIndex = Math.floor(pointerAngle / anglePerSlice);

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
        const winningIndex = (currentSliceIndex % count + count) % count;
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
      // Don't trigger if user is typing in input
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

  // Eliminate chosen student
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

  // Reset list back to original class roster
  const handleResetToRoster = () => {
    if (members && members.length > 0) {
      setItems(members.map(m => ({
        id: String(m.id || m.absentNo || Math.random()),
        name: m.name || `Siswa ${m.absentNo}`,
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
        padding: isFullscreen ? '2rem' : '1.25rem 0.5rem',
        backgroundColor: isFullscreen ? 'var(--bg)' : 'transparent',
        minHeight: isFullscreen ? '100vh' : 'auto',
        justifyContent: isFullscreen ? 'center' : 'flex-start'
      }}
    >
      {/* Top Action Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '540px',
          marginBottom: '1rem',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span 
            className="notion-tag"
            style={{ 
              backgroundColor: 'var(--primary-soft)', 
              color: 'var(--primary)', 
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Users size={12} />
            <span>{activeItems.length} Siswa Aktif</span>
          </span>

          {items.some(i => i.isEliminated) && (
            <button
              onClick={handleResetEliminations}
              className="btn btn-ghost btn-sm"
              title="Kembalikan siswa yang tereliminasi"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={12} />
              <span>Reset Eliminasi</span>
            </button>
          )}
        </div>

        {/* Right Controls: Edit, Mute, Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-outline btn-sm"
            title="Edit daftar nama sesi ini"
            style={{ fontSize: '0.75rem', gap: '0.3rem' }}
          >
            <Edit3 size={13} />
            <span>Edit Daftar</span>
          </button>

          <button
            onClick={toggleMute}
            className="btn btn-ghost btn-sm btn-icon"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            aria-label="Toggle Audio"
            style={{ color: isMuted ? 'var(--danger)' : 'var(--text-secondary)' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn btn-ghost btn-sm btn-icon"
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh Proyektor'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Wheel Canvas & Indicator Wrapper */}
      <div 
        style={{
          position: 'relative',
          width: isFullscreen ? 'min(76vw, 72vh)' : 'min(92vw, 420px)',
          height: isFullscreen ? 'min(76vw, 72vh)' : 'min(92vw, 420px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0.5rem auto 1.25rem auto'
        }}
      >
        {/* Top Needle Pointer (Indicator pointing down) */}
        <div 
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: '0',
            height: '0',
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '28px solid #E11D48',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
            pointerEvents: 'none',
            transition: 'transform 0.05s ease-out'
          }}
        />

        {/* HTML5 Canvas */}
        <canvas 
          ref={canvasRef} 
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.28), 0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: isSpinning ? 'not-allowed' : 'pointer'
          }}
          onClick={!isSpinning && activeItems.length > 0 ? handleSpin : undefined}
        />
      </div>

      {/* Controls & Quick Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={handleSpin}
          disabled={isSpinning || activeItems.length === 0}
          className="btn btn-primary"
          style={{
            fontSize: isFullscreen ? '1.25rem' : '1rem',
            padding: isFullscreen ? '0.85rem 2.5rem' : '0.65rem 1.85rem',
            borderRadius: 'var(--radius-full)',
            gap: '0.5rem',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
          }}
        >
          <Play size={isFullscreen ? 20 : 16} fill="currentColor" />
          <span>{isSpinning ? 'Sedang Memutar...' : 'Putar Roda'}</span>
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          💡 Tips: Tekan tombol <strong>[Spasi]</strong> di keyboard untuk memutar cepat
        </span>
      </div>

      {/* WINNER POPUP MODAL */}
      {winner && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '2px solid var(--primary-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 1.5rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <button
              onClick={() => setWinner(null)}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Trophy size={32} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <Sparkles size={14} />
              <span>SISWA TERPILIH</span>
              <Sparkles size={14} />
            </div>

            <h2 
              style={{ 
                fontSize: isFullscreen ? '2.4rem' : '1.85rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                margin: '0.25rem 0 0.5rem 0',
                lineHeight: 1.2
              }}
            >
              {winner.name}
            </h2>

            {winner.absentNo && (
              <span className="notion-tag" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                Nomor Absen: #{winner.absentNo}
              </span>
            )}

            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.65rem',
                marginTop: '1.5rem'
              }}
            >
              <button
                onClick={handleSpin}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
              >
                <RotateCcw size={16} />
                <span>Putar Lagi</span>
              </button>

              <button
                onClick={handleEliminateWinner}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.35)' }}
              >
                <UserX size={16} />
                <span>Eliminasi Siswa Ini (Tidak Ikut Putaran Berikutnya)</span>
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
                      {item.name} {item.absentNo ? `(#${item.absentNo})` : ''}
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
