import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Feature #94: Scratch Card Rewards After Service
 * Interactive scratch-to-reveal reward card
 */

interface ScratchCardProps {
  reward: string;
  rewardEmoji?: string;
  rewardSubtext?: string;
  onRevealed?: () => void;
  className?: string;
}

export default function ScratchCard({
  reward,
  rewardEmoji = '🎉',
  rewardSubtext = 'You won a reward!',
  onRevealed,
  className = '',
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isDrawing = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Draw scratch overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    gradient.addColorStop(0, '#E11D48');
    gradient.addColorStop(0.5, '#D946EF');
    gradient.addColorStop(1, '#FB7185');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Add sparkle pattern
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.offsetWidth;
      const y = Math.random() * canvas.offsetHeight;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Scratch to Reveal ✨', canvas.offsetWidth / 2, canvas.offsetHeight / 2);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (x - rect.left) * scaleX / 2;
    const py = (y - rect.top) * scaleY / 2;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const percent = (transparent / (imageData.data.length / 4)) * 100;
    setScratchPercent(percent);

    if (percent > 55 && !isRevealed) {
      setIsRevealed(true);
      onRevealed?.();
    }
  }, [isRevealed, onRevealed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) scratch(touch.clientX, touch.clientY);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{ width: '100%', height: '160px' }}>
        {/* Reward content behind scratch layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center glass-ultra">
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-center"
              >
                <span className="text-4xl block mb-2">{rewardEmoji}</span>
                <p className="type-heading text-lg text-text">{reward}</p>
                <p className="text-text-dim text-xs mt-1">{rewardSubtext}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isRevealed && (
            <div className="text-center opacity-30">
              <span className="text-3xl block mb-1">🎁</span>
              <p className="text-sm text-text-dim">Hidden Reward</p>
            </div>
          )}
        </div>

        {/* Scratch overlay canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer"
          style={{ 
            touchAction: 'none',
            opacity: isRevealed ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
          onMouseDown={() => { isDrawing.current = true; }}
          onMouseMove={handleMouseMove}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseLeave={() => { isDrawing.current = false; }}
          onTouchStart={() => { isDrawing.current = true; }}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => { isDrawing.current = false; }}
        />
      </div>

      {/* Progress indicator */}
      {!isRevealed && scratchPercent > 5 && (
        <div className="mt-2 h-1 rounded-full bg-card-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${Math.min(scratchPercent * 1.8, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
