// ============================================================
// CONFIGURACIÓN
// ============================================================
const WHATSAPP_NUMBER = "5492645271715"; // Tu número con código de país, sin + ni espacios

document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================================
// TEMA OSCURO / CLARO
// ============================================================
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const iconMoon = document.getElementById("iconMoon");
const iconSun = document.getElementById("iconSun");

function setTheme(theme){
  root.setAttribute("data-theme", theme);
  iconMoon.style.display = theme === "dark" ? "block" : "none";
  iconSun.style.display = theme === "light" ? "block" : "none";
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("bp-theme"); } catch (_) {}
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
setTheme(savedTheme || (prefersLight ? "light" : "dark"));

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(next);
  try { localStorage.setItem("bp-theme", next); } catch (_) {}
});

// ============================================================
// MENÚ MÓVIL (hamburguesa con morph a X + overlay fullscreen)
// ============================================================
const hamburger = document.getElementById("hamburger");
const navLinksEl = document.getElementById("navLinks");

function toggleMenu(force){
  const open = typeof force === "boolean" ? force : !navLinksEl.classList.contains("open");
  navLinksEl.classList.toggle("open", open);
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
hamburger?.addEventListener("click", () => toggleMenu());
navLinksEl?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => toggleMenu(false));
});

// ============================================================
// WHATSAPP DIRECTO Y FLOTANTE
// ============================================================
const directMsg = "Hola! Quiero consultar por sus servicios técnicos.";
const directWaUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(directMsg)}`;
document.getElementById("directWhatsapp").href = directWaUrl;

document.querySelectorAll(".js-wa").forEach(a => {
  a.href = directWaUrl; a.target = "_blank"; a.rel = "noopener";
});

const floatWa = document.getElementById("floatWhatsapp");
floatWa.href = directWaUrl;

const heroSection = document.getElementById("inicio");
if ("IntersectionObserver" in window && heroSection){
  const waObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      floatWa.classList.toggle("visible", !entry.isIntersecting);
    });
  }, { threshold: 0.1 });
  waObserver.observe(heroSection);
} else {
  floatWa.classList.add("visible");
}

// ============================================================
// SCROLL REVEAL (IntersectionObserver, transform + opacity)
// ============================================================
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window){
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  revealEls.forEach(el => {
    // el hero vive dentro de la pantalla escalada: se revela de entrada
    if (el.closest(".sx-page")) { requestAnimationFrame(() => el.classList.add("in-view")); }
    else revealObserver.observe(el);
    el.addEventListener("transitionend", (e) => {
      if (e.propertyName === "opacity") el.style.setProperty("--d", "0ms");
    });
  });
} else {
  revealEls.forEach(el => el.classList.add("in-view"));
}

// ============================================================
// PARALLAX SUTIL DEL LOGO EN EL HERO (solo puntero fino)
// ============================================================
const orbitFrame = document.getElementById("orbitFrame");
// Logo animado: WebM con transparencia. Si el navegador no puede (Safari/iOS) o bloquea el autoplay
// (Brave, ahorro de energía, etc.), se reemplaza por un WebP animado, que no necesita permiso para moverse.
const IS_WEBKIT = /iP(hone|ad|od)/.test(navigator.userAgent) ||
  /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

function swapLogoToImage(v){
  if (!v || v.tagName !== "VIDEO" || !v.isConnected) return;
  const img = new Image();
  img.id = v.id; img.className = v.className.replace("alpha-logo", "").trim();
  img.width = 640; img.height = 640;
  img.alt = v.id === "orbitLogo" ? "Logo animado de Black Phantom Tech" : "";
  img.src = reduceMotion ? "img/logo-static.webp" : "img/logo-anim.webp";
  v.replaceWith(img);
  if (v.id === "orbitLogo") orbitLogo = img;
}

function keepLogosPlaying(){
  document.querySelectorAll("video.alpha-logo").forEach(v => {
    const t = v.play();
    if (t && t.catch) t.catch(() => swapLogoToImage(v));
  });
}
let orbitLogo = document.getElementById("orbitLogo");
if (reduceMotion || IS_WEBKIT){
  document.querySelectorAll("video.alpha-logo").forEach(swapLogoToImage);
} else {
  keepLogosPlaying();
  // si a los 1.8 s el video no avanzó (autoplay bloqueado), pasa al WebP animado
  setTimeout(() => {
    document.querySelectorAll("video.alpha-logo").forEach(v => { if (v.paused || v.currentTime === 0) swapLogoToImage(v); });
  }, 1800);
}
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (orbitFrame && orbitLogo && finePointer && !reduceMotion){
  let rafId = null;
  orbitFrame.addEventListener("mousemove", (e) => {
    const rect = orbitFrame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      orbitLogo.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    });
  });
  orbitFrame.addEventListener("mouseleave", () => {
    orbitLogo.style.transform = "";
  });
}

// ============================================================
// FONDO ANIMADO — RED DE PARTÍCULAS
// ============================================================
const canvas = document.getElementById("netCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function initParticles(){
  const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 22000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
  }));
}
function getAccentRGB(){
  const isLight = root.getAttribute("data-theme") === "light";
  return isLight ? "15,168,93" : "56,226,124";
}
function drawNetwork(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const rgb = getAccentRGB();
  const maxDist = 150;

  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  });

  for (let i = 0; i < particles.length; i++){
    for (let j = i + 1; j < particles.length; j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist){
        ctx.strokeStyle = `rgba(${rgb},${0.13 * (1 - dist / maxDist)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  particles.forEach(p => {
    ctx.fillStyle = `rgba(${rgb},0.5)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!reduceMotion) requestAnimationFrame(drawNetwork);
}
resizeCanvas();
initParticles();
drawNetwork();
window.addEventListener("resize", () => { resizeCanvas(); initParticles(); if (reduceMotion) drawNetwork(); });

// ============================================================
// INTRO SCROLL-EXPANSION
// La foto del PC se ve primero; al deslizar, la web crece desde la
// pantalla del watercooling hasta ocupar todo el viewport.
// (Se activa solo si no hay prefers-reduced-motion: clase html.sx-on)
// ============================================================
(function initScrollExpansion(){
  if (!root.classList.contains("sx-on")) return;

  const section = document.getElementById("inicio");
  const stage   = document.getElementById("sxStage");
  const bg      = document.getElementById("sxBg");
  const screen  = document.getElementById("sxScreen");
  const page    = document.getElementById("sxPage");
  const boot    = document.getElementById("sxBoot");
  const hint    = document.getElementById("sxHint");
  const hintL   = hint.querySelector(".sx-hint-l");
  const hintR   = hint.querySelector(".sx-hint-r");
  const skip    = document.getElementById("sxSkip");
  const nav     = document.getElementById("nav");

  // Geometría de la pantalla del watercooling dentro de la foto (px de la imagen original 1672x941)
  const IMG_W = 1672, IMG_H = 941;
  const SCR = { cx: 774, cy: 393, w: 208, h: 208, r: 21 };
  const HOLD = 0.86; // el 86% del recorrido anima; el resto queda fijo mostrando la web completa

  const clamp  = (v, a, b) => Math.min(Math.max(v, a), b);
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  let W, H, c0x, c0y, sw, sh, z1, k0, shX, shY, travel, bgQ = 1, bgOx = 0, bgOy = 0;

  function layout(){
    W = stage.clientWidth; H = stage.clientHeight;
    // "cover", y con zoom suficiente para poder centrar la pantalla del cooler en horizontal
    const s  = Math.max(W / IMG_W, H / IMG_H, W / (2 * SCR.cx));
    const iw = IMG_W * s, ih = IMG_H * s;
    const ox = clamp(W / 2 - SCR.cx * s, W - iw, 0);    // centra la pantalla del cooler si se puede
    const oy = clamp(H / 2 - SCR.cy * s, H - ih, 0);

    c0x = ox + SCR.cx * s; c0y = oy + SCR.cy * s;
    sw = SCR.w * s;        sh = SCR.h * s;

    // En celulares la foto se dibuja a la mitad de tamaño y se agranda con transform:
    // la textura en GPU pesa 4 veces menos (evita cuelgues en equipos modestos).
    bgQ = Math.min(W, H) < 700 ? 0.5 : 1;
    bgOx = ox; bgOy = oy;
    Object.assign(bg.style, {
      left: "0px", top: "0px", width: (iw * bgQ) + "px", height: (ih * bgQ) + "px",
      transformOrigin: "0 0",
    });
    Object.assign(screen.style, {
      left: (c0x - sw / 2) + "px", top: (c0y - sh / 2) + "px",
      width: sw + "px", height: sh + "px", borderRadius: (SCR.r * s) + "px",
    });
    Object.assign(page.style, {
      width: W + "px", height: H + "px", marginLeft: (-W / 2) + "px", marginTop: (-H / 2) + "px",
    });

    z1 = Math.max(W / sw, H / sh) * 1.03;                       // zoom final: la pantalla cubre todo
    k0 = W >= H ? Math.min(sw / W, sh / H) : Math.max(sw / W, sh / H); // escala inicial de la web dentro de la pantalla
    shX = W / 2 - c0x; shY = H / 2 - c0y;                       // la pantalla viaja al centro
    travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
    fitHero();
  }

  // Si por alto de pantalla o fuentes el contenido del hero no entra, se achica lo justo (mínimo 68%)
  function fitHero(){
    const hero = page.querySelector(".hero");
    const inner = page.querySelector(".hero-inner");
    if (!hero || !inner) return;
    inner.style.transform = ""; inner.style.transformOrigin = "";
    const cs = getComputedStyle(hero);
    const avail = H - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const nat = inner.offsetHeight;
    if (nat > avail && avail > 0){
      const k = Math.max(0.68, avail / nat);
      inner.style.transformOrigin = "top center";
      inner.style.transform = `scale(${k.toFixed(3)})`;
    }
  }

  function progress(){
    return clamp(-section.getBoundingClientRect().top / (travel * HOLD), 0, 1);
  }

  let navShown = null, interactive = null;
  function render(){
    const p = progress();
    const e = smooth(p);
    const z = Math.pow(z1, e);
    const t = `translate3d(${(shX * e).toFixed(2)}px,${(shY * e).toFixed(2)}px,0) scale(${z.toFixed(4)})`;

    bg.style.transform = `translate3d(${(c0x + shX * e - z * c0x + z * bgOx).toFixed(2)}px,${(c0y + shY * e - z * c0y + z * bgOy).toFixed(2)}px,0) scale(${(z / bgQ).toFixed(4)})`;
    const bgOp = 1 - smooth((p - 0.86) / 0.09);
    bg.style.opacity = bgOp.toFixed(3);
    bg.style.visibility = bgOp <= 0 ? "hidden" : "visible";

    screen.style.transform = t;
    screen.style.opacity = "1";
    screen.style.visibility = "visible";

    // la pantalla muestra siempre lo tuyo: primero el logo animado, que se funde con la web
    const bootOp = 1 - smooth((p - 0.06) / 0.34);
    boot.style.opacity = bootOp.toFixed(3);
    boot.style.visibility = bootOp <= 0 ? "hidden" : "visible";
    page.style.opacity = smooth((p - 0.08) / 0.32).toFixed(3);
    const bootVid = document.getElementById("sxBootLogo");
    if (bootVid && bootVid.tagName === "VIDEO"){
      if (bootOp <= 0 && !bootVid.paused) bootVid.pause();
      else if (bootOp > 0 && bootVid.paused){ const pr = bootVid.play(); if (pr && pr.catch) pr.catch(() => {}); }
    }
    screen.style.boxShadow = p > 0.9 ? "none" : "";
    screen.style.setProperty("--bga", (p < 0.95 ? 1 : 1 - smooth((p - 0.95) / 0.05)).toFixed(3));

    const kEff = Math.pow(k0, 1 - e);
    page.style.transform = `scale(${(kEff / z).toFixed(5)})`;

    // textos de la foto: se separan hacia los costados y se desvanecen (como el componente original)
    hint.style.opacity = (1 - smooth(p / 0.12)).toFixed(3);
    hintL.style.transform = `translateX(${(-p * W * 0.9).toFixed(1)}px)`;
    hintR.style.transform = `translateX(${(p * W * 0.9).toFixed(1)}px)`;
    skip.classList.toggle("gone", p > 0.5);

    const wantNav = p > 0.6;
    if (wantNav !== navShown){
      navShown = wantNav;
      nav.classList.toggle("nav-hidden", !wantNav);
      nav.inert = !wantNav;
    }
    const wantInteractive = p > 0.985;
    if (wantInteractive !== interactive){
      interactive = wantInteractive;
      screen.inert = !wantInteractive;
      if (wantInteractive && orbitLogo && orbitLogo.tagName === "VIDEO"){
        orbitLogo.currentTime = 0;
        const pr = orbitLogo.play(); if (pr && pr.catch) pr.catch(() => {});
      }
    }
  }

  let ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  }

  function relayout(){ layout(); render(); }
  layout(); render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener("load", relayout);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", relayout);
  if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(stage);

  skip.addEventListener("click", () => {
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + travel * HOLD + 2, behavior: "smooth" });
  });
})();

// ============================================================
// CONFIGURACIÓN DE LA PASARELA POR CATEGORÍA
//  type: "multi"  → selección múltiple (checkboxes)
//        "select" → una sola opción
// ============================================================
const OTHER = "Otro (lo detallo en el mensaje)";

const wizardConfig = {
  pc: {
    label: "Computadoras",
    icon: "🖥️",
    steps: [
      {
        key: "servicios", type: "multi", label: "Servicios", title: "¿Qué servicios necesitás?", required: true,
        options: [
          "Mantenimiento preventivo",
          "Mantenimiento correctivo",
          "Limpieza interna profunda",
          "Cambio de pasta térmica",
          "Cambio de cooler / refrigeración",
          "Armado de PC",
          "Asesoramiento en compra de PC o componentes",
          "Asesoramiento para armar tu PC",
          "Ampliación o cambio de componentes",
          "Instalación de Windows y programas",
          "Optimización y configuración",
          OTHER,
        ],
      },
      {
        key: "modalidad", type: "select", label: "Modalidad", title: "¿Cómo preferís el servicio?", required: true,
        options: ["Presencial", "Online"],
      },
      { key: "nombre", type: "text", label: "Nombre", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", label: "Teléfono", title: "¿Tu número de teléfono?", placeholder: "Ej: 2644123456", required: true },
      { key: "mensaje", type: "textarea", label: "Detalles", title: "¿Algo más que debamos saber?", placeholder: "Opcional: marca, modelo, síntoma del problema...", required: false },
    ],
  },
  celular: {
    label: "Celulares",
    icon: "📱",
    steps: [
      {
        key: "servicios", type: "multi", label: "Servicios", title: "¿Qué servicios necesitás?", required: true,
        options: [
          "Optimización de rendimiento",
          "Eliminación de virus o malware",
          "Solución de errores de software",
          "Restauración de fábrica",
          "Recuperación de datos",
          "Desbloqueo de patrón, PIN o contraseña",
          "Asesoramiento en compra de celular",
          OTHER,
        ],
      },
      { key: "modelo", type: "text", label: "Modelo", title: "¿Qué modelo de celular es?", placeholder: "Opcional: Ej. Samsung A34", required: false },
      { key: "nombre", type: "text", label: "Nombre", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", label: "Teléfono", title: "¿Tu número de teléfono?", placeholder: "Ej: 2644123456", required: true },
      { key: "mensaje", type: "textarea", label: "Detalles", title: "¿Algo más que debamos saber?", placeholder: "Opcional: contanos el problema con detalle...", required: false },
    ],
  },
  consolas: {
    label: "Consolas PS4 y PS5",
    icon: "🎮",
    steps: [
      {
        key: "servicios", type: "multi", label: "Servicios", title: "¿Qué necesitás para tu consola?", required: true,
        options: [
          "Mantenimiento PS4",
          "Mantenimiento PS5",
          "Liberación PS4",
          "Liberación PS5",
          "Instalación de juegos",
          "Asesoramiento en compra de consolas",
          OTHER,
        ],
      },
      { key: "nombre", type: "text", label: "Nombre", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", label: "Teléfono", title: "¿Tu número de teléfono?", placeholder: "Ej: 2644123456", required: true },
      { key: "mensaje", type: "textarea", label: "Detalles", title: "¿Algo más que debamos saber?", placeholder: "Opcional: modelo de la consola, juegos que querés, problema que tiene...", required: false },
    ],
  },
  web: {
    label: "Web a medida",
    icon: "💻",
    steps: [
      {
        key: "servicios", type: "multi", label: "Proyecto", title: "¿Qué necesitás para tu web?", required: true,
        options: [
          "Landing page",
          "Página para negocio o emprendimiento",
          "Sistema de turnos y reservas",
          "Mantenimiento y soporte web",
          "Asesoramiento en compra de dominio y hosting",
          OTHER,
        ],
      },
      { key: "nombre", type: "text", label: "Nombre", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", label: "Teléfono", title: "¿Tu número de teléfono?", placeholder: "Ej: 2644123456", required: true },
      { key: "mensaje", type: "textarea", label: "Proyecto", title: "Contanos sobre tu proyecto", placeholder: "Opcional: rubro, referencias, ideas...", required: false },
    ],
  },
};

// ============================================================
// MOTOR DE LA PASARELA
// ============================================================
const modalOverlay = document.getElementById("modalOverlay");
const modalEl = modalOverlay.querySelector(".modal");
const modalTag = document.getElementById("modalTag");
const progressDots = document.getElementById("progressDots");
const stepContainer = document.getElementById("stepContainer");
const btnBack = document.getElementById("btnBack");
const btnNext = document.getElementById("btnNext");
const btnNextLabel = document.getElementById("btnNextLabel");

let activeCategory = null;
let activeSteps = [];
let currentStepIndex = 0;
let answers = {};
let lastFocus = null;

const esc = (str) => String(str).replace(/[&<>"']/g, (ch) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
));
const digits = (str) => String(str || "").replace(/\D/g, "");

document.querySelectorAll(".card[data-category]").forEach(card => {
  card.querySelector(".card-btn").addEventListener("click", () => startWizard(card.dataset.category));
});

function startWizard(category){
  activeCategory = category;
  activeSteps = wizardConfig[category].steps;
  currentStepIndex = 0;
  answers = {};
  lastFocus = document.activeElement;
  modalTag.textContent = wizardConfig[category].label;
  renderStep();
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  modalEl.focus({ preventScroll: true });
}

function closeModal(){
  if (!modalOverlay.classList.contains("active")) return;
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

document.addEventListener("keydown", (e) => {
  const open = modalOverlay.classList.contains("active");
  if (e.key === "Escape"){
    if (open) closeModal();
    else if (navLinksEl.classList.contains("open")) toggleMenu(false);
    return;
  }
  if (e.key === "Tab" && open){
    const f = [...modalEl.querySelectorAll("button:not([disabled]), input, textarea, [tabindex]:not([tabindex='-1'])")]
      .filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modalEl)){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
});

function totalSteps(){ return activeSteps.length + 1; } // +1 = resumen final

function renderDots(){
  progressDots.innerHTML = "";
  for (let i = 0; i < totalSteps(); i++){
    const dot = document.createElement("span");
    if (i <= currentStepIndex) dot.classList.add("done");
    progressDots.appendChild(dot);
  }
}

function isValid(step){
  const v = answers[step.key];
  if (step.type === "multi") return !step.required || (Array.isArray(v) && v.length > 0);
  const t = (v || "").toString().trim();
  if (!t) return !step.required;
  if (step.type === "tel"){ const n = digits(t).length; return n >= 8 && n <= 15; }
  if (step.key === "nombre") return t.length >= 2;
  return true;
}

function renderStep(){
  renderDots();
  btnBack.classList.toggle("hidden", currentStepIndex === 0);

  if (currentStepIndex === activeSteps.length){
    renderSummaryStep();
    btnNextLabel.textContent = "Enviar por WhatsApp";
    btnNext.disabled = false;
    return;
  }

  const step = activeSteps[currentStepIndex];
  btnNextLabel.textContent = "Siguiente";

  let html = `<div class="wz-step wz-step-anim"><h3 id="wzTitle">${esc(step.title)}</h3>`;

  if (step.type === "multi" || step.type === "select"){
    const multi = step.type === "multi";
    const chosen = multi ? (answers[step.key] || []) : [answers[step.key]];
    if (multi) html += `<p class="multi-hint">Podés elegir más de uno</p>`;
    html += `<div class="option-list" role="${multi ? "group" : "radiogroup"}" aria-labelledby="wzTitle">`;
    step.options.forEach((opt, i) => {
      const sel = chosen.includes(opt);
      html += `<button type="button" class="option${multi ? " multi" : ""}${sel ? " selected" : ""}"
                 role="${multi ? "checkbox" : "radio"}" aria-checked="${sel}" data-i="${i}">
                 <span class="option-dot" aria-hidden="true"></span>${esc(opt)}
               </button>`;
    });
    html += `</div>`;
  } else if (step.type === "textarea"){
    html += `<div class="field"><textarea rows="4" aria-labelledby="wzTitle" placeholder="${esc(step.placeholder || "")}">${esc(answers[step.key] || "")}</textarea></div>`;
  } else {
    const ac = step.type === "tel" ? "tel" : (step.key === "nombre" ? "name" : "off");
    const im = step.type === "tel" ? ' inputmode="tel"' : "";
    html += `<div class="field"><input type="${step.type}"${im} autocomplete="${ac}" aria-labelledby="wzTitle"
               placeholder="${esc(step.placeholder || "")}" value="${esc(answers[step.key] || "")}"></div>`;
    if (step.type === "tel") html += `<p class="field-hint">Con código de área, sin 0 ni 15.</p><p class="field-error" id="wzError" role="alert"></p>`;
  }
  html += `</div>`;
  stepContainer.innerHTML = html;

  if (step.type === "multi" || step.type === "select"){
    const multi = step.type === "multi";
    stepContainer.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => {
        const value = step.options[Number(btn.dataset.i)];
        if (multi){
          const cur = new Set(answers[step.key] || []);
          cur.has(value) ? cur.delete(value) : cur.add(value);
          answers[step.key] = step.options.filter(o => cur.has(o)); // mantiene el orden de la lista
          const on = cur.has(value);
          btn.classList.toggle("selected", on);
          btn.setAttribute("aria-checked", String(on));
        } else {
          answers[step.key] = value;
          stepContainer.querySelectorAll(".option").forEach(o => {
            o.classList.remove("selected"); o.setAttribute("aria-checked", "false");
          });
          btn.classList.add("selected"); btn.setAttribute("aria-checked", "true");
        }
        validateStep();
      });
    });
  } else {
    const input = stepContainer.querySelector("input, textarea");
    input.addEventListener("input", () => { answers[step.key] = input.value; validateStep(); });
    if (input.tagName === "INPUT"){
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !btnNext.disabled){ e.preventDefault(); btnNext.click(); }
      });
    }
    if (currentStepIndex > 0) input.focus({ preventScroll: true });
  }

  validateStep();
}

function validateStep(){
  const step = activeSteps[currentStepIndex];
  const ok = isValid(step);
  btnNext.disabled = !ok;
  const err = document.getElementById("wzError");
  if (err){
    const t = (answers[step.key] || "").trim();
    err.textContent = t && !ok ? "Revisá el número: tiene que tener entre 8 y 15 dígitos." : "";
  }
}

function renderSummaryStep(){
  let html = `<div class="wz-step wz-step-anim"><h3>Revisá tu solicitud</h3><div class="summary-list">`;
  html += `<div class="summary-item"><b>Categoría</b><span>${esc(wizardConfig[activeCategory].label)}</span></div>`;
  activeSteps.forEach(s => {
    const val = answers[s.key];
    if (Array.isArray(val) && val.length){
      html += `<div class="summary-item"><b>${esc(s.label)}</b><div class="summary-chips">${val.map(v => `<em>${esc(v)}</em>`).join("")}</div></div>`;
    } else if (typeof val === "string" && val.trim() !== ""){
      html += `<div class="summary-item"><b>${esc(s.label)}</b><span>${esc(val.trim())}</span></div>`;
    }
  });
  html += `</div></div>`;
  stepContainer.innerHTML = html;
}

btnBack.addEventListener("click", () => {
  if (currentStepIndex > 0){
    currentStepIndex--;
    renderStep();
  }
});

btnNext.addEventListener("click", () => {
  if (currentStepIndex === activeSteps.length){
    sendToWhatsapp();
    return;
  }
  currentStepIndex++;
  renderStep();
});

function sendToWhatsapp(){
  const cat = wizardConfig[activeCategory];
  const lines = [`Hola! Quiero solicitar un servicio de *${cat.label}* ${cat.icon}`, ""];

  cat.steps.forEach(s => {
    const val = answers[s.key];
    if (Array.isArray(val) && val.length){
      lines.push(`*${s.label}:*`);
      val.forEach(v => lines.push(`• ${v}`));
    } else if (typeof val === "string" && val.trim() !== ""){
      lines.push(`*${s.label}:* ${val.trim()}`);
    }
  });

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener");
  closeModal();
}
