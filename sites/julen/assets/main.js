// Champ d'étoiles en parallaxe + filtres de projets + apparitions au défilement.
(() => {
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----- Étoiles -----
  const canvas = document.getElementById("etoiles");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let etoiles = [];
    let l = 0, h = 0, dpr = 1, defile = 0;

    const init = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      l = window.innerWidth; h = window.innerHeight;
      canvas.width = l * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((l * h) / 5200);
      etoiles = Array.from({ length: n }, () => ({
        x: Math.random() * l,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,           // profondeur : vitesse et taille
        t: Math.random() * Math.PI * 2,          // phase de scintillement
        teinte: Math.random() < 0.08 ? "255,200,120" : Math.random() < 0.15 ? "150,220,255" : "235,240,255",
      }));
    };

    const dessiner = (temps = 0) => {
      ctx.clearRect(0, 0, l, h);
      for (const e of etoiles) {
        const y = ((e.y - defile * e.z * 0.25) % h + h) % h;
        const a = calme ? 0.7 * e.z + 0.2 : (0.55 + 0.45 * Math.sin(temps * 0.0015 * e.z + e.t)) * (0.4 + 0.6 * e.z);
        ctx.fillStyle = `rgba(${e.teinte},${a})`;
        const r = e.z * 1.3;
        ctx.fillRect(e.x, y, r, r);
      }
      if (!calme) requestAnimationFrame(dessiner);
    };

    init();
    dessiner();
    window.addEventListener("resize", () => { init(); if (calme) dessiner(); });
    if (!calme) window.addEventListener("scroll", () => { defile = window.scrollY; }, { passive: true });
  }

  // ----- Filtres de la page Missions -----
  const grille = document.getElementById("grille-projets");
  if (grille) {
    const boutons = document.querySelectorAll(".filtre");
    boutons.forEach((b) => b.addEventListener("click", () => {
      const f = b.dataset.filtre;
      boutons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      grille.querySelectorAll(".carte").forEach((c) => {
        c.hidden = f !== "tout" && !c.classList.contains(`carte-${f}`);
      });
    }));
  }

  // ----- Apparitions -----
  if (!calme && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".bloc, .carte, .intro-texte").forEach((el, i) => {
      el.classList.add("apparait");
      el.style.transitionDelay = el.classList.contains("carte") ? `${(i % 3) * 80}ms` : "0ms";
      obs.observe(el);
    });
  }
})();
