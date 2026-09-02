// ===== MENÚ MÓVIL =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-times');
  });
});

// ===== CONTADORES ANIMADOS =====
const stats = document.querySelectorAll('.stat-number');

const animateCounter = (el) => {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000; // ms
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // función de easing (cubic-bezier)
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  };
  requestAnimationFrame(update);
};

// Usar Intersection Observer para disparar cuando estén visibles
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

stats.forEach(stat => observer.observe(stat));

// ===== TIEMPO RESTANTE (ejemplo dinámico) =====
// Actualizar cada minuto para simular cuenta regresiva
const tiempoElements = document.querySelectorAll('.tiempo-restante span');

const updateTimes = () => {
  tiempoElements.forEach((span, index) => {
    // Valores de ejemplo: decrementar aleatoriamente (solo demo)
    // En una app real, se calcularía desde una fecha objetivo
    let text = span.textContent;
    if (text.includes('h') || text.includes('d')) {
      // Solo para demostración, no hacemos decremento real
      // Podríamos simular pequeños cambios
    }
  });
};

// Actualizar cada 30 segundos para demostración
setInterval(updateTimes, 30000);

// ===== RESALTAR ENLACE ACTIVO AL HACER SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

console.log('🚀 ChispaNica cargado correctamente.');
console.log('🔗 Preparado para integración con Supabase (clave pública almacenada).');
