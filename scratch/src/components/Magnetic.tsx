import { useRef, ReactNode, useCallback } from 'react';

/**
 * Feature #17: Magnetic Cursor Effect (Desktop)
 * Elements subtly pull toward cursor when nearby
 */

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: 'div' | 'button' | 'a';
}

export default function Magnetic({
  children,
  strength = 0.3,
  className = '',
  as: Tag = 'div',
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || window.innerWidth < 768) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) * strength;
      const dy = (e.clientY - centerY) * strength;

      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0px, 0px)';
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={`magnetic ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Tag>
  );
}
