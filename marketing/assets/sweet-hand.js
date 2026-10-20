// Sweet Hand marketing page (www.sweethand.ca, ADR 0016): the only script.
// The page reads fine without it: every section is visible and the anchors work.
(() => {
  document.documentElement.classList.add('reveal-ready');

  const header = document.querySelector('[data-header]');
  const setHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  // Sections rise into view, or are all shown at once under reduced motion.
  const items = document.querySelectorAll('[data-reveal]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((item) => observer.observe(item));
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
