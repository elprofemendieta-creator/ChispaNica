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
  const duration = 2000;
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

stats.forEach(stat => observer.observe(stat));

// ===== RESALTAR ENLACE ACTIVO =====
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

// ============================================================
// ===== MODAL LOGIN / REGISTRO =====
// ============================================================
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const btnEntrar = document.getElementById('btnEntrar');
const toggleLink = document.getElementById('toggleLink');
const modalTitle = document.getElementById('modalTitle');
const modalSubtext = document.getElementById('modalSubtext');
const nameGroup = document.getElementById('nameGroup');
const btnSubmit = document.getElementById('btnSubmit');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');
const authForm = document.getElementById('authForm');

let isLogin = true;

// Abrir modal
btnEntrar.addEventListener('click', (e) => {
  e.preventDefault();
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
});

// Cerrar modal (botón X)
modalClose.addEventListener('click', () => {
  closeModal();
});

// Cerrar modal al hacer clic fuera del contenido
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
  authForm.reset();
  // Limpiar estado de los campos
  document.querySelectorAll('.form-group input').forEach(input => {
    input.blur();
  });
  // Restaurar modo login al cerrar
  if (!isLogin) {
    isLogin = true;
    updateModalMode();
  }
}

// Alternancia Login / Registro
toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  updateModalMode();
});

function updateModalMode() {
  if (isLogin) {
    modalTitle.textContent = 'Iniciar sesión';
    modalSubtext.textContent = 'Accede a tu cuenta y empieza a ganar';
    nameGroup.style.display = 'none';
    btnText.textContent = 'Entrar';
    btnIcon.className = 'fas fa-arrow-right';
    toggleLink.textContent = 'Regístrate';
    toggleLink.parentElement.innerHTML = `¿No tienes cuenta? <a href="#" id="toggleLink">Regístrate</a>`;
    document.getElementById('toggleLink').addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      updateModalMode();
    });
  } else {
    modalTitle.textContent = 'Crear cuenta';
    modalSubtext.textContent = 'Regístrate y comienza a ganar recompensas';
    nameGroup.style.display = 'flex';
    btnText.textContent = 'Registrarse';
    btnIcon.className = 'fas fa-user-plus';
    toggleLink.textContent = 'Iniciar sesión';
    toggleLink.parentElement.innerHTML = `¿Ya tienes cuenta? <a href="#" id="toggleLink">Iniciar sesión</a>`;
    document.getElementById('toggleLink').addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      updateModalMode();
    });
  }
}

// ===== ENVÍO DEL FORMULARIO (simulación) =====
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();
  const name = document.getElementById('nameInput')?.value.trim() || '';

  if (!email || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  if (!isLogin && !name) {
    alert('Por favor, ingresa tu nombre completo.');
    return;
  }

  // Aquí iría la lógica de autenticación con Supabase
  console.log('📝 Datos del formulario:');
  console.log('Modo:', isLogin ? 'Login' : 'Registro');
  console.log('Nombre:', name);
  console.log('Email:', email);
  console.log('Password:', password);

  // Simular éxito
  alert(isLogin ? '✅ Sesión iniciada (simulación)' : '✅ Cuenta creada (simulación)');
  closeModal();
});

// ===== REGISTRO DEL SERVICE WORKER (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('Service Worker registrado correctamente:', reg);
      })
      .catch(err => {
        console.warn('Error al registrar Service Worker:', err);
      });
  });
}

console.log('🚀 ChispaNica cargado correctamente.');
console.log('🔗 Preparado para integración con Supabase (clave pública: sb_publishable_qomvhRRFkvrepVZkJgAJaw_JMLuWh_t)');
