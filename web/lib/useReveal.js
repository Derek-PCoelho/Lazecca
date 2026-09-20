'use client';

import { useEffect } from 'react';

// Recriado de window.LZ_initReveal (design_files/js/data.js) — IntersectionObserver
// que ativa as classes .reveal / .reveal-stagger definidas em styles.css.
export default function useReveal(deps = []) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
      );
      document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 60);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
