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
  img.src = "img/logo-anim.webp";
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
if (IS_WEBKIT){
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
// (Se activa siempre: clase html.sx-on; el avance depende solo del scroll de la persona)
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


// ============================================================
// BLACKPHANTOM APPS — tablet interactiva + modal de descarga
// Para sumar otra app: agregá un objeto más a BP_APPS (con su ícono en /img).
// El link de descarga sale solo de la última release pública del repo en GitHub.
// ============================================================
const BP_APPS = [
  {
    id: "dmi",
    name: "Dónde Mierda Iba",
    icon: "img/dmi-icon.webp",
    iconSmall: "img/dmi-icon-sm.webp",
    accent: "#FF7F32", accentRgb: "255,127,50", onAccent: "#1b0a02",
    tagline: "Tu registro de series, pelis y videos",
    desc: "Anotá en qué temporada, capítulo o minuto te quedaste y seguí desde ahí, sin vueltas. Te avisa cuando sale un capítulo nuevo, tiene widget en la pantalla de inicio y backup de tus listas. Sin cuentas ni anuncios: todo queda en tu celular.",
    chips: ["Android 5.0+", "Gratis", "Sin anuncios", "Sin cuentas"],
    repo: "BlackPhantom15/Donde-mierda-iba",
    apkName: "DondeMierdaIba.apk",   // nombre fijo del APK en cada release
    version: "v2.1", sizeBytes: 0, url: ""
  }
];
const BP_TOTAL_SLOTS = 6; // casilleros del "launcher" (los vacíos se ven como "próximamente")

function bpApkUrl(app){
  return app.url || `https://github.com/${app.repo}/releases/latest/download/${app.apkName}`;
}
function bpRepoUrl(app){
  return `https://github.com/${app.repo}`;
}
function bpFormatSize(bytes){
  return bytes > 0 ? (bytes / 1048576).toFixed(1).replace(".", ",") + " MB" : "";
}
function bpMetaText(app){
  return [app.version, bpFormatSize(app.sizeBytes)].filter(Boolean).join(" · ");
}

// Lee la última release pública para mostrar versión y peso reales (si falla, queda lo de arriba).
async function bpRefreshAppInfo(app){
  try {
    let data = null;
    try {
      const cached = JSON.parse(sessionStorage.getItem("bp-app-" + app.id) || "null");
      if (cached && Date.now() - cached.t < 30 * 60 * 1000) data = cached.d;
    } catch (_) {}
    if (!data){
      const res = await fetch(`https://api.github.com/repos/${app.repo}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!res.ok) return false;
      const j = await res.json();
      const assets = j.assets || [];
      const apk = assets.find(a => a.name === app.apkName) || assets.find(a => /\.apk$/i.test(a.name));
      data = { tag: j.tag_name || "", size: apk ? apk.size : 0, url: apk ? apk.browser_download_url : "" };
      try { sessionStorage.setItem("bp-app-" + app.id, JSON.stringify({ t: Date.now(), d: data })); } catch (_) {}
    }
    if (data.tag) app.version = data.tag;
    if (data.size) app.sizeBytes = data.size;
    if (data.url) app.url = data.url;
    return true;
  } catch (_) { return false; }
}

(function initBlackPhantomApps(){
  const stage = document.getElementById("tabletStage");
  if (!stage) return;

  const tablet   = document.getElementById("tablet");
  const screenEl = document.getElementById("tabScreen");
  const canvas   = document.getElementById("tabCanvas");
  const grid     = document.getElementById("tabGrid");
  const home     = document.getElementById("tabHome");
  const detail   = document.getElementById("tabApp");
  const finger   = document.getElementById("tabFinger");
  const clock    = document.getElementById("tabClock");
  const twTime   = document.getElementById("twTime");
  const twDate   = document.getElementById("twDate");
  const twSweep  = document.getElementById("twSweep");

  // ---------- escala de la pantalla ----------
  const portraitMQ = window.matchMedia("(max-width: 700px)");
  const DIMS = { land: [960, 640], port: [480, 700] };
  function fit(){
    const portrait = portraitMQ.matches;
    stage.classList.toggle("is-portrait", portrait);
    const [cw, ch] = portrait ? DIMS.port : DIMS.land;
    stage.style.setProperty("--cw", cw + "px");
    stage.style.setProperty("--ch", ch + "px");
    const w = screenEl.clientWidth;
    if (w) stage.style.setProperty("--k", (w / cw).toFixed(4));
  }
  fit();
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(screenEl);
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);

  // ---------- reloj en vivo ----------
  function tick(){
    const d = new Date();
    const hm = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    clock.textContent = hm;
    twTime.textContent = hm;
    const ds = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
    twDate.textContent = ds.charAt(0).toUpperCase() + ds.slice(1);
  }
  tick();
  setInterval(tick, 15000);
  twSweep.style.setProperty("--sec", "-" + (new Date().getSeconds() + new Date().getMilliseconds() / 1000).toFixed(2) + "s");

  // ---------- íconos del "launcher" ----------
  const plusSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  function renderGrid(){
    grid.innerHTML = "";
    BP_APPS.forEach((app, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "tab-icon"; b.dataset.app = app.id;
      b.style.setProperty("--i", i);
      b.setAttribute("aria-label", `Abrir ${app.name}`);
      b.innerHTML = `<span class="ti-img"><img src="${app.icon}" alt="" width="118" height="118" decoding="async"></span><span class="ti-label"></span>`;
      b.querySelector(".ti-label").textContent = app.name;
      b.addEventListener("click", () => openApp(app, b));
      grid.appendChild(b);
    });
    for (let i = BP_APPS.length; i < BP_TOTAL_SLOTS; i++){
      const g = document.createElement("div");
      g.className = "tab-icon ghost"; g.style.setProperty("--i", i); g.setAttribute("aria-hidden", "true");
      g.innerHTML = `<span class="ti-img">${plusSvg}</span><span class="ti-label">${i === BP_APPS.length ? "Próximamente" : "&nbsp;"}</span>`;
      grid.appendChild(g);
    }
  }
  renderGrid();

  // ---------- abrir / cerrar la app dentro de la tablet ----------
  const taIcon = document.getElementById("taIcon");
  const taName = document.getElementById("taName");
  const taTagline = document.getElementById("taTagline");
  const taChips = document.getElementById("taChips");
  const taDesc = document.getElementById("taDesc");
  const taMeta = document.getElementById("taMeta");
  const taBack = document.getElementById("taBack");
  const taDownload = document.getElementById("taDownload");
  let currentApp = null, lastIcon = null, interacted = false;

  function paintDetail(app){
    detail.style.setProperty("--app-accent", app.accent);
    detail.style.setProperty("--app-rgb", app.accentRgb);
    detail.style.setProperty("--app-on", app.onAccent);
    taIcon.src = app.icon; taIcon.alt = "Ícono de " + app.name;
    taName.textContent = app.name;
    taTagline.textContent = app.tagline;
    taDesc.textContent = app.desc;
    taChips.innerHTML = "";
    app.chips.forEach(t => { const li = document.createElement("li"); li.textContent = t; taChips.appendChild(li); });
    taMeta.textContent = bpMetaText(app);
    document.getElementById("taRepo").href = bpRepoUrl(app);
  }
  function iconOrigin(el){
    const c = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = c.width / canvas.offsetWidth || 1;
    return { x: (r.left + r.width / 2 - c.left) / k, y: (r.top + r.height / 2 - c.top) / k };
  }
  function openApp(app, trigger){
    interacted = true;
    currentApp = app; lastIcon = trigger;
    paintDetail(app);
    const o = iconOrigin(trigger);
    canvas.style.setProperty("--ox", o.x.toFixed(1) + "px");
    canvas.style.setProperty("--oy", o.y.toFixed(1) + "px");
    trigger.classList.add("pressed");
    setTimeout(() => trigger.classList.remove("pressed"), 450);
    tablet.classList.add("app-open");
    detail.removeAttribute("inert"); detail.setAttribute("aria-hidden", "false");
    home.setAttribute("inert", ""); home.setAttribute("aria-hidden", "true");
    setTimeout(() => taDownload.focus({ preventScroll: true }), 620);
  }
  function closeApp(){
    if (!tablet.classList.contains("app-open")) return;
    tablet.classList.remove("app-open");
    detail.setAttribute("inert", ""); detail.setAttribute("aria-hidden", "true");
    home.removeAttribute("inert"); home.removeAttribute("aria-hidden");
    if (lastIcon) setTimeout(() => lastIcon.focus({ preventScroll: true }), 420);
  }
  taBack.addEventListener("click", closeApp);
  taDownload.addEventListener("click", () => { if (currentApp) openDownload(currentApp, taDownload); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tablet.classList.contains("app-open") && !dlOverlay.classList.contains("active")) closeApp();
  });

  // ---------- encendido al entrar en pantalla + dedo guía ----------
  let inView = false, hintPlays = 0, hintTimer = null;
  function playHint(){
    hintTimer = null;
    if (interacted || reduceMotion || !inView || tablet.classList.contains("app-open")) { scheduleHint(); return; }
    const btn = grid.querySelector(".tab-icon:not(.ghost)");
    if (!btn || !finger.animate) return;
    const { x, y } = iconOrigin(btn);
    finger.animate([
      { transform: `translate(${x + 190}px, ${y + 230}px) scale(1.25)`, opacity: 0 },
      { transform: `translate(${x + 12}px, ${y + 16}px) scale(1.2)`, opacity: 1, offset: .55 },
      { transform: `translate(${x}px, ${y}px) scale(.78)`, opacity: 1, offset: .68 },
      { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: .9, offset: .8 },
      { transform: `translate(${x}px, ${y}px) scale(1.9)`, opacity: 0 }
    ], { duration: 2100, easing: "cubic-bezier(.4,0,.2,1)" });
    setTimeout(() => { btn.classList.add("pressed"); setTimeout(() => btn.classList.remove("pressed"), 550); }, 1400);
    hintPlays++;
    scheduleHint();
  }
  function scheduleHint(){
    if (interacted || reduceMotion || hintPlays >= 4 || hintTimer) return;
    hintTimer = setTimeout(playHint, hintPlays === 0 ? 3600 : 7500);
  }
  if ("IntersectionObserver" in window){
    new IntersectionObserver((entries) => {
      entries.forEach(en => {
        inView = en.isIntersecting;
        if (inView && !tablet.classList.contains("on")){ tablet.classList.add("on"); scheduleHint(); }
      });
    }, { threshold: 0.3 }).observe(stage);
  } else {
    tablet.classList.add("on");
  }

  // ---------- inclinación 3D con el mouse ----------
  if (!reduceMotion && window.matchMedia("(hover:hover) and (pointer:fine)").matches){
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      stage.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
      stage.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
    });
    stage.addEventListener("pointerleave", () => {
      stage.style.setProperty("--ry", "0deg");
      stage.style.setProperty("--rx", "0deg");
    });
  }

  // ---------- botón de descarga directo (debajo de la tablet) ----------
  document.getElementById("appsDirectBtn").addEventListener("click", (e) => openDownload(BP_APPS[0], e.currentTarget));

  // ---------- versión y peso reales desde GitHub ----------
  BP_APPS.forEach(app => bpRefreshAppInfo(app).then(ok => {
    if (!ok) return;
    if (currentApp === app) taMeta.textContent = bpMetaText(app);
    if (dlOverlay.classList.contains("active") && dlApp === app) dlMeta.textContent = bpDlMeta(app);
  }));

  // ============================================================
  // MODAL DE DESCARGA
  // ============================================================
  var dlOverlay = document.getElementById("dlOverlay");
  var dlModal = document.getElementById("dlModal");
  var dlMeta = document.getElementById("dlMeta");
  var dlApp = null;
  const dlViewInfo = document.getElementById("dlViewInfo");
  const dlViewDone = document.getElementById("dlViewDone");
  const dlNotice = document.getElementById("dlNotice");
  const dlGo = document.getElementById("dlGo");
  const dlRetry = document.getElementById("dlRetry");
  let dlLastFocus = null;

  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  function bpDlMeta(app){
    const m = bpMetaText(app);
    return (m ? m + " · " : "") + "Archivo .apk";
  }
  function setNotice(kind, html){
    if (!kind){ dlNotice.hidden = true; return; }
    dlNotice.hidden = false;
    dlNotice.className = "dl-notice" + (kind === "ok" ? " ok" : "");
    dlNotice.innerHTML = html;
  }

  function openDownload(app, from){
    dlApp = app; dlLastFocus = from || null;
    document.getElementById("dlIcon").src = app.iconSmall || app.icon;
    document.getElementById("dlTitle").textContent = app.name;
    dlMeta.textContent = bpDlMeta(app);
    document.getElementById("dlRepo").href = bpRepoUrl(app);
    dlViewInfo.hidden = false; dlViewDone.hidden = true;
    dlGo.disabled = false;
    if (isIOS){
      setNotice("warn", "<b>Estás en un iPhone o iPad.</b> Esta app es solo para Android, así que no se puede instalar acá. Abrí esta página desde un celular Android.");
      dlGo.disabled = true;
    } else if (isAndroid){
      setNotice("ok", "<b>Perfecto, estás en Android.</b> Podés instalarla directo desde este celular.");
    } else {
      setNotice("warn", "<b>Estás en una computadora.</b> Podés bajar el archivo y pasarlo a tu celular Android, o abrir esta página desde el celular para descargarla ahí.");
    }
    dlOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    dlScroll.scrollTop = 0;
    updateDlFade();
    setTimeout(() => { updateDlFade(); dlModal.focus({ preventScroll: true }); }, 60);
  }
  // difumina el borde de abajo solo si todavía queda contenido por scrollear
  const dlScroll = dlOverlay.querySelector(".dl-scroll");
  function updateDlFade(){
    dlScroll.classList.toggle("fade", dlScroll.scrollHeight - dlScroll.scrollTop - dlScroll.clientHeight > 4);
  }
  dlScroll.addEventListener("scroll", updateDlFade, { passive: true });
  window.addEventListener("resize", updateDlFade);
  function closeDownload(){
    if (!dlOverlay.classList.contains("active")) return;
    dlOverlay.classList.remove("active");
    document.body.style.overflow = "";
    if (dlLastFocus && dlLastFocus.focus) dlLastFocus.focus({ preventScroll: true });
  }
  function startDownload(){
    if (!dlApp) return;
    const url = bpApkUrl(dlApp);
    const a = document.createElement("a");
    a.href = url; a.rel = "noopener"; a.download = dlApp.apkName; a.style.display = "none";
    // Con el link verificado contra la API la descarga arranca sin salir de la web;
    // si no se pudo verificar, se abre en otra pestaña para no sacar a la persona del sitio si algo falla.
    a.target = dlApp.url ? "_self" : "_blank";
    document.body.appendChild(a); a.click(); a.remove();
    dlRetry.href = url;
    dlViewInfo.hidden = true; dlViewDone.hidden = false;
    // reinicia la animación del tilde
    const svg = dlViewDone.querySelector(".dl-check");
    svg.innerHTML = svg.innerHTML;
    dlModal.focus({ preventScroll: true });
  }

  dlGo.addEventListener("click", startDownload);
  document.getElementById("dlCancel").addEventListener("click", closeDownload);
  document.getElementById("dlClose").addEventListener("click", closeDownload);
  document.getElementById("dlDone").addEventListener("click", closeDownload);
  dlOverlay.addEventListener("click", (e) => { if (e.target === dlOverlay) closeDownload(); });
  document.addEventListener("keydown", (e) => {
    if (!dlOverlay.classList.contains("active")) return;
    if (e.key === "Escape"){ closeDownload(); return; }
    if (e.key === "Tab"){
      const f = [...dlModal.querySelectorAll("button:not([disabled]), a[href]")].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dlModal)){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
})();
