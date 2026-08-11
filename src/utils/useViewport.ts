import { useState, useEffect, useRef } from 'react';

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
}

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      width: w,
      height: h,
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isPortrait: h >= w,
      isLandscape: w > h,
      aspectRatio: h > 0 ? w / h : 1.5,
    };
  });

  const rafId = useRef<number | null>(null);

  useEffect(() => {
    function updateViewport() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewport((prev) => {
        const isMobile = w < 768;
        const isTablet = w >= 768 && w < 1024;
        const isDesktop = w >= 1024;
        const isPortrait = h >= w;
        const isLandscape = w > h;

        // Prevent unnecessary re-renders if dimensions haven't significantly shifted
        if (
          prev.width === w &&
          prev.height === h &&
          prev.isMobile === isMobile &&
          prev.isTablet === isTablet &&
          prev.isDesktop === isDesktop
        ) {
          return prev;
        }

        return {
          width: w,
          height: h,
          isMobile,
          isTablet,
          isDesktop,
          isPortrait,
          isLandscape,
          aspectRatio: h > 0 ? w / h : 1.5,
        };
      });
    }

    function handleResize() {
      // Add 'is-resizing' class to disable heavy CSS transitions during active drag
      document.body.classList.add('is-resizing');

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        updateViewport();
        setTimeout(() => {
          document.body.classList.remove('is-resizing');
        }, 150);
      });
    }

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}
