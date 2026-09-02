// ============================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ============================================================
const SUPABASE_URL = 'https://vrfdvythxysbhugrermx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qomvhRRFkvrepVZkJgAJaw_JMLuWh_t';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 2. ELEMENTOS DOM
// ============================================================
// Navbar
const btnEntrar = document.getElementById('btnEntrar');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userDropdown = document.getElementById('userDropdown');
const btnLogout = document.getElementById('btnLogout');

// Modal
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalSubtext = document.getElementById('modalSubtext');
const authForm = document.getElementById('authForm');
const nameGroup = document.getElementById('nameGroup');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const btnSubmit = document.getElementById('btnSubmit');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');
const toggleLink = document.getElementById('toggleLink');
const authError = document.getElementById('authError');

// Menú móvil
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

let isLogin = true; // true = login, false = registro

// ============================================================
// 3. MENÚ MÓVIL
// ============================================================
menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-times');
  });
});

// ============================================================
// 4. CONTADORES ANIMADOS
// ============================================================
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

// ============================================================
// 5. RESALTAR ENLACE ACTIVO
// ============================================================
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
// 6. MODAL LOGIN / REGISTRO
// ============================================================
// Abrir modal
btnEntrar.addEventListener('click', (e) => {
  e.preventDefault();
  openModal();
});

// Cerrar modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
});

function openModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  authError.style.display = 'none';
  // Si no hay sesión, aseguramos modo login
  if (!isLogin) {
    isLogin = true;
    updateModalMode();
  }
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
  authForm.reset();
  document.querySelectorAll('.form-group input').forEach(input => input.blur());
  authError.style.display = 'none';
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
    nameInput.removeAttribute('required');
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
    nameInput.setAttribute('required', 'required');
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
  authError.style.display = 'none';
}

// ============================================================
// 7. ENVÍO DEL FORMULARIO (Autenticación con Supabase)
// ============================================================
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.style.display = 'none';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const fullName = nameInput.value.trim();

  if (!email || !password) {
    showError('Por favor, completa todos los campos.');
    return;
  }

  if (!isLogin && !fullName) {
    showError('Por favor, ingresa tu nombre completo.');
    return;
  }

  // Deshabilitar botón durante la operación
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';

  try {
    if (isLogin) {
      // INICIO DE SESIÓN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      // Éxito: el evento onAuthStateChange actualizará la UI
      closeModal();
    } else {
      // REGISTRO
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) throw error;

      // Si el registro es exitoso, creamos el perfil, wallet y streak
      if (data.user) {
        const userId = data.user.id;

        // 1. Crear perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            username: fullName.toLowerCase().replace(/\s/g, '_') + '_' + userId.slice(0, 6),
            avatar_url: null,
            level: 1
          });

        if (profileError) throw profileError;

        // 2. Crear wallet
        const { error: walletError } = await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            coins: 0,
            diamonds: 0
          });

        if (walletError) throw walletError;

        // 3. Crear streak
        const { error: streakError } = await supabase
          .from('streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_claim_date: null
          });

        if (streakError) throw streakError;

        // Mostrar mensaje de éxito y cerrar modal
        alert('✅ Cuenta creada exitosamente. ¡Bienvenido a ChispaNica!');
        closeModal();
      }
    }
  } catch (error) {
    console.error('Error de autenticación:', error);
    showError(error.message || 'Ocurrió un error. Inténtalo de nuevo.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
      <span id="btnText">${isLogin ? 'Entrar' : 'Registrarse'}</span>
      <i class="fas ${isLogin ? 'fa-arrow-right' : 'fa-user-plus'}" id="btnIcon"></i>
    `;
  }
});

function showError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
}

// ============================================================
// 8. GESTIÓN DE SESIÓN Y UI
// ============================================================
async function loadUserProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const user = session.user;
    // Obtener perfil desde la tabla profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error al cargar perfil:', error);
      return;
    }

    const displayName = profile?.full_name || user.email || 'Usuario';
    const avatarUrl = profile?.avatar_url || null;
    updateUIForUser(displayName, avatarUrl);
  } else {
    updateUIForGuest();
  }
}

function updateUIForUser(displayName, avatarUrl) {
  // Ocultar botón Entrar, mostrar perfil
  btnEntrar.style.display = 'none';
  userProfile.style.display = 'flex';

  // Iniciales del nombre
  const initials = displayName
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');

  userAvatar.textContent = initials;
  userName.textContent = displayName;

  // Si hay avatar_url, usarlo (pendiente de implementar)
  if (avatarUrl) {
    userAvatar.style.backgroundImage = `url(${avatarUrl})`;
    userAvatar.style.backgroundSize = 'cover';
    userAvatar.textContent = '';
  } else {
    userAvatar.style.backgroundImage = '';
    userAvatar.textContent = initials;
  }

  // Abrir/cerrar dropdown al hacer clic en el perfil
  userProfile.onclick = (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
  };

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', () => {
    userDropdown.classList.remove('active');
  });
}

function updateUIForGuest() {
  btnEntrar.style.display = 'flex';
  userProfile.style.display = 'none';
}

// Cerrar sesión
btnLogout.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error);
  } else {
    updateUIForGuest();
    userDropdown.classList.remove('active');
  }
});

// ============================================================
// 9. ESCUCHAR CAMBIOS EN LA AUTENTICACIÓN
// ============================================================
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session) loadUserProfile();
  } else if (event === 'SIGNED_OUT') {
    updateUIForGuest();
  }
});

// ============================================================
// 10. INICIALIZAR UI AL CARGAR LA PÁGINA
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
});

// ============================================================
// 11. REGISTRO DEL SERVICE WORKER (PWA)
// ============================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.warn('Error SW:', err));
  });
}

console.log('🚀 ChispaNica cargado con Supabase.');
