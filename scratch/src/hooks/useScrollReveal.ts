import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Feature #20: Scroll-Triggered Reveal Animations
 * Intersection Observer hook for revealing elements when they enter viewport
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  } = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, rootMargin, once]);

  return { ref, isRevealed };
}

/**
 * Feature #12: Staggered List Entry Animations
 * Applies scroll-reveal to a list container and staggers children
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  options: {
    threshold?: number;
    staggerDelay?: number;
    once?: boolean;
  } = {}
) {
  const { threshold = 0.1, staggerDelay = 50, once = true } = options;
  const containerRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, once]);

  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)`,
      transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
    }),
    [isVisible, staggerDelay]
  );

  const getItemClassName = useCallback(
    (index: number) => {
      const delayClass = index < 10 ? `stagger-delay-${index + 1}` : '';
      return `reveal ${isVisible ? 'revealed' : ''} ${delayClass}`.trim();
    },
    [isVisible]
  );

  return { containerRef, isVisible, getItemStyle, getItemClassName };
}

export default useScrollReveal;
