// ============================================================
// 1. CONFIGURACIÓN SUPABASE
// ============================================================
const SUPABASE_URL = 'https://vrfdvythxysbhugrermx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qomvhRRFkvrepVZkJgAJaw_JMLuWh_t';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 2. ELEMENTOS DOM
// ============================================================
// Header
const btnEntrar = document.getElementById('btnEntrar');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userDropdown = document.getElementById('userDropdown');
const btnLogout = document.getElementById('btnLogout');
const btnProfile = document.getElementById('btnProfile');
const userCoins = document.getElementById('userCoins');
const userDiamonds = document.getElementById('userDiamonds');

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

// Bottom Nav
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page-section');

let isLogin = true;
let currentUser = null;
let walletData = null;

// ============================================================
// 3. NAVEGACIÓN POR TABS
// ============================================================
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const pageId = item.dataset.page;
    // Actualizar active en nav
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    // Mostrar página correspondiente
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.id === pageId) {
        page.classList.add('active');
      }
    });
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ============================================================
// 4. MODAL LOGIN / REGISTRO
// ============================================================
btnEntrar.addEventListener('click', (e) => {
  e.preventDefault();
  openModal();
});

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

// Alternancia Login/Registro
toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  updateModalMode();
});

function updateModalMode() {
  if (isLogin) {
    modalTitle.textContent = 'Iniciar sesión';
    modalSubtext.textContent = 'Accede a tu cuenta';
    nameGroup.style.display = 'none';
    nameInput.removeAttribute('required');
    btnText.textContent = 'Entrar';
    btnIcon.className = 'fas fa-arrow-right';
    toggleLink.parentElement.innerHTML = `¿No tienes cuenta? <a href="#" id="toggleLink">Regístrate</a>`;
    document.getElementById('toggleLink').addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      updateModalMode();
    });
  } else {
    modalTitle.textContent = 'Crear cuenta';
    modalSubtext.textContent = 'Regístrate y comienza a ganar';
    nameGroup.style.display = 'flex';
    nameInput.setAttribute('required', 'required');
    btnText.textContent = 'Registrarse';
    btnIcon.className = 'fas fa-user-plus';
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
// 5. AUTENTICACIÓN CON SUPABASE
// ============================================================
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.style.display = 'none';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const fullName = nameInput.value.trim();

  if (!email || !password) {
    showError('Completa todos los campos.');
    return;
  }
  if (!isLogin && !fullName) {
    showError('Ingresa tu nombre completo.');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';

  try {
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      closeModal();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;

      if (data.user) {
        const userId = data.user.id;
        // Crear perfil
        await supabase.from('profiles').insert({
          id: userId,
          full_name: fullName,
          username: fullName.toLowerCase().replace(/\s/g, '_') + '_' + userId.slice(0, 6),
          avatar_url: null,
          level: 1
        });
        // Crear wallet
        await supabase.from('wallets').insert({
          user_id: userId,
          coins: 0,
          diamonds: 0
        });
        // Crear streak
        await supabase.from('streaks').insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_claim_date: null
        });
        alert('✅ ¡Cuenta creada exitosamente!');
        closeModal();
      }
    }
  } catch (error) {
    console.error('Error:', error);
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
// 6. GESTIÓN DE SESIÓN Y WALLET
// ============================================================
async function loadUserData() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const user = session.user;
    currentUser = user;
    
    // Obtener perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    // Obtener wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coins, diamonds')
      .eq('user_id', user.id)
      .single();

    walletData = wallet;
    
    const displayName = profile?.full_name || user.email || 'Usuario';
    updateUIForUser(displayName, profile?.avatar_url);
    updateWalletUI(wallet);
  } else {
    updateUIForGuest();
    updateWalletUI(null);
  }
}

function updateUIForUser(displayName, avatarUrl) {
  btnEntrar.style.display = 'none';
  userProfile.style.display = 'flex';
  
  const initials = displayName
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
  
  userAvatar.textContent = initials;
  
  if (avatarUrl) {
    userAvatar.style.backgroundImage = `url(${avatarUrl})`;
    userAvatar.style.backgroundSize = 'cover';
    userAvatar.textContent = '';
  }
  
  userProfile.onclick = (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
  };
  
  document.addEventListener('click', () => {
    userDropdown.classList.remove('active');
  });
}

function updateUIForGuest() {
  btnEntrar.style.display = 'flex';
  userProfile.style.display = 'none';
  userDropdown.classList.remove('active');
}

function updateWalletUI(wallet) {
  if (wallet) {
    userCoins.textContent = wallet.coins || 0;
    userDiamonds.textContent = wallet.diamonds || 0;
  } else {
    userCoins.textContent = '0';
    userDiamonds.textContent = '0';
  }
}

// Cerrar sesión
btnLogout.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    updateUIForGuest();
    updateWalletUI(null);
    userDropdown.classList.remove('active');
    // Ir a inicio
    document.querySelector('[data-page="page-inicio"]').click();
  }
});

// ============================================================
// 7. EVENTOS DE AUTENTICACIÓN
// ============================================================
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session) loadUserData();
  } else if (event === 'SIGNED_OUT') {
    updateUIForGuest();
    updateWalletUI(null);
  }
});

// ============================================================
// 8. CONTADORES ANIMADOS
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
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
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
// 9. INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
});

// ============================================================
// 10. SERVICE WORKER (PWA)
// ============================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registrado:', reg))
      .catch(err => console.warn('Error SW:', err));
  });
}

console.log('🚀 ChispaNica cargado con Supabase y Bottom Nav');