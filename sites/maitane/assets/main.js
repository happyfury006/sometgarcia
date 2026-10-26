// Apparition douce des collections et de la présentation au défilement.
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");
  const obs = new IntersectionObserver((entrees) => {
    entrees.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll(".apparait").forEach((el) => obs.observe(el));
})();
