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
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
setTheme(prefersLight ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(next);
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
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("in-view"));
}

// ============================================================
// PARALLAX SUTIL DEL LOGO EN EL HERO (solo puntero fino)
// ============================================================
const orbitFrame = document.getElementById("orbitFrame");
const orbitLogo = document.getElementById("orbitLogo");
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
window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });

// ============================================================
// CONFIGURACIÓN DE LA PASARELA POR CATEGORÍA
// ============================================================
const wizardConfig = {
  pc: {
    label: "Computadoras",
    icon: "🖥️",
    steps: [
      {
        key: "servicio", type: "select", title: "¿Qué servicio necesitás?", required: true,
        options: [
          "Mantenimiento preventivo",
          "Mantenimiento correctivo",
          "Limpieza interna profunda",
          "Cambio de pasta térmica",
          "Optimización y configuración",
        ],
      },
      {
        key: "modalidad", type: "select", title: "¿Cómo preferís el servicio?", required: true,
        options: ["Presencial", "Online"],
      },
      { key: "nombre", type: "text", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", title: "¿Tu número de teléfono?", placeholder: "Ej: 3001234567", required: true },
      { key: "mensaje", type: "textarea", title: "¿Algo más que debamos saber?", placeholder: "Opcional: marca, modelo, síntoma del problema...", required: false },
    ],
  },
  celular: {
    label: "Celulares",
    icon: "📱",
    steps: [
      {
        key: "servicio", type: "select", title: "¿Qué servicio necesitás?", required: true,
        options: [
          "Optimización de rendimiento",
          "Eliminación de virus o malware",
          "Solución de errores de software",
          "Restauración de fábrica",
          "Recuperación de datos",
          "Desbloqueo de patrón, PIN o contraseña",
        ],
      },
      { key: "modelo", type: "text", title: "¿Qué modelo de celular es?", placeholder: "Opcional: Ej. Samsung A34", required: false },
      { key: "nombre", type: "text", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", title: "¿Tu número de teléfono?", placeholder: "Ej: 3001234567", required: true },
      { key: "mensaje", type: "textarea", title: "¿Algo más que debamos saber?", placeholder: "Opcional: contanos el problema con detalle...", required: false },
    ],
  },
  web: {
    label: "Web a medida",
    icon: "💻",
    steps: [
      {
        key: "servicio", type: "select", title: "¿Qué tipo de proyecto necesitás?", required: true,
        options: [
          "Landing page",
          "Página para negocio o emprendimiento",
          "Sistema de turnos y reservas",
          "Mantenimiento y soporte web",
        ],
      },
      { key: "nombre", type: "text", title: "¿Cuál es tu nombre?", placeholder: "Nombre completo", required: true },
      { key: "telefono", type: "tel", title: "¿Tu número de teléfono?", placeholder: "Ej: 3001234567", required: true },
      { key: "mensaje", type: "textarea", title: "Contanos sobre tu proyecto", placeholder: "Opcional: rubro, referencias, ideas...", required: false },
    ],
  },
};

// ============================================================
// MOTOR DE LA PASARELA
// ============================================================
const modalOverlay = document.getElementById("modalOverlay");
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

document.querySelectorAll(".card[data-category]").forEach(card => {
  card.querySelector(".card-btn").addEventListener("click", () => startWizard(card.dataset.category));
});

function startWizard(category){
  activeCategory = category;
  activeSteps = wizardConfig[category].steps;
  currentStepIndex = 0;
  answers = {};
  modalTag.textContent = wizardConfig[category].label;
  renderDots();
  renderStep();
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function totalSteps(){ return activeSteps.length + 1; } // +1 = resumen final

function renderDots(){
  progressDots.innerHTML = "";
  for (let i = 0; i < totalSteps(); i++){
    const dot = document.createElement("span");
    if (i <= currentStepIndex) dot.classList.add("done");
    progressDots.appendChild(dot);
  }
}

function renderStep(){
  renderDots();
  btnBack.classList.toggle("hidden", currentStepIndex === 0);

  const isSummary = currentStepIndex === activeSteps.length;

  if (isSummary){
    renderSummaryStep();
    btnNextLabel.textContent = "Enviar por WhatsApp";
    btnNext.disabled = false;
    return;
  }

  const step = activeSteps[currentStepIndex];
  btnNextLabel.textContent = "Siguiente";

  let html = `<div class="step step-anim"><h3>${step.title}</h3>`;

  if (step.type === "select"){
    html += `<div class="option-list">`;
    step.options.forEach(opt => {
      const selected = answers[step.key] === opt ? "selected" : "";
      html += `<div class="option ${selected}" data-value="${opt}">
                 <span class="option-dot"></span>${opt}
               </div>`;
    });
    html += `</div>`;
  } else if (step.type === "textarea"){
    html += `<div class="field">
               <textarea rows="4" placeholder="${step.placeholder || ""}">${answers[step.key] || ""}</textarea>
             </div>`;
  } else {
    html += `<div class="field">
               <input type="${step.type}" placeholder="${step.placeholder || ""}" value="${answers[step.key] || ""}">
             </div>`;
  }

  html += `</div>`;
  stepContainer.innerHTML = html;

  if (step.type === "select"){
    stepContainer.querySelectorAll(".option").forEach(opt => {
      opt.addEventListener("click", () => {
        answers[step.key] = opt.dataset.value;
        stepContainer.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        validateStep();
      });
    });
  } else {
    const input = stepContainer.querySelector("input, textarea");
    input.addEventListener("input", () => {
      answers[step.key] = input.value;
      validateStep();
    });
  }

  validateStep();
}

function validateStep(){
  const step = activeSteps[currentStepIndex];
  const value = (answers[step.key] || "").toString().trim();
  const valid = step.required ? value.length > 0 : true;
  btnNext.disabled = !valid;
}

function renderSummaryStep(){
  const step = activeSteps;
  let html = `<div class="step step-anim"><h3>Revisá tu solicitud</h3><div class="summary-list">`;
  html += `<div class="summary-item"><b>Servicio</b><span>${wizardConfig[activeCategory].label}</span></div>`;
  step.forEach(s => {
    const val = answers[s.key];
    if (val && val.trim() !== ""){
      html += `<div class="summary-item"><b>${s.title.replace(/¿|\?/g, "")}</b><span>${val}</span></div>`;
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
  const isSummary = currentStepIndex === activeSteps.length;

  if (isSummary){
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
    if (val && val.trim() !== ""){
      lines.push(`${s.title.replace(/¿|\?/g, "")}: ${val}`);
    }
  });

  const text = lines.join("\n");
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
  closeModal();
}
