import { useRef, useState, ReactNode, useCallback } from 'react';

/**
 * Feature #18: 3D Tilt Card Effect
 * Responds to mouse/touch position with perspective 3D tilt and light reflection
 */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltMax?: number;
  glareEnabled?: boolean;
  scale?: number;
}

export default function TiltCard({
  children,
  className = '',
  tiltMax = 12,
  glareEnabled = true,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      const tiltX = (y - 0.5) * tiltMax * -1;
      const tiltY = (x - 0.5) * tiltMax;

      setStyle({
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      });

      setShinePos({ x: x * 100, y: y * 100 });
    },
    [tiltMax, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handleMove(e.clientX, e.clientY),
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleEnter = () => setIsHovering(true);

  const handleLeave = () => {
    setIsHovering(false);
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    });
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
      style={{ ...style, transformStyle: 'preserve-3d' }}
    >
      {children}
      {glareEnabled && (
        <div
          className="tilt-card-shine"
          style={{
            '--shine-x': `${shinePos.x}%`,
            '--shine-y': `${shinePos.y}%`,
            opacity: isHovering ? 1 : 0,
          } as React.CSSProperties}
        />
      )}
    </div>
  );
}
