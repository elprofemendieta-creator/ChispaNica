// ============================================================
// 1. CONFIGURACIÓN SUPABASE
// ============================================================
const SUPABASE_URL = 'https://vrfdvythxysbhugrermx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qomvhRRFkvrepVZkJgAJaw_JMLuWh_t';

// Verificar que Supabase esté disponible
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase no está cargado. Revisa la CDN.');
} else {
  console.log('✅ Supabase cargado correctamente.');
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 2. ESPERAR A QUE EL DOM ESTÉ LISTO
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM listo. Inicializando ChispaNica...');

  // ============================================================
  // 3. REFERENCIAS A ELEMENTOS DEL DOM
  // ============================================================
  const elements = {
    // Header
    btnEntrar: document.getElementById('btnEntrar'),
    userProfile: document.getElementById('userProfile'),
    userAvatar: document.getElementById('userAvatar'),
    userDropdown: document.getElementById('userDropdown'),
    btnLogout: document.getElementById('btnLogout'),
    btnProfile: document.getElementById('btnProfile'),
    userCoins: document.getElementById('userCoins'),
    userDiamonds: document.getElementById('userDiamonds'),

    // Modal
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    modalTitle: document.getElementById('modalTitle'),
    modalSubtext: document.getElementById('modalSubtext'),
    authForm: document.getElementById('authForm'),
    nameGroup: document.getElementById('nameGroup'),
    nameInput: document.getElementById('nameInput'),
    emailInput: document.getElementById('emailInput'),
    passwordInput: document.getElementById('passwordInput'),
    btnSubmit: document.getElementById('btnSubmit'),
    btnText: document.getElementById('btnText'),
    btnIcon: document.getElementById('btnIcon'),
    toggleLink: document.getElementById('toggleLink'),
    authError: document.getElementById('authError'),

    // Recuperación
    forgotPasswordLink: document.getElementById('forgotPasswordLink'),
    recoveryForm: document.getElementById('recoveryForm'),
    recoveryEmail: document.getElementById('recoveryEmail'),
    btnRecover: document.getElementById('btnRecover'),
    recoveryMessage: document.getElementById('recoveryMessage'),
    backToLoginLink: document.getElementById('backToLoginLink'),

    // Navegación
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page-section'),
    moreItems: document.querySelectorAll('.more-item[data-page]'),
  };

  // Verificar elementos críticos
  console.log('🔍 Verificando elementos del DOM...');
  for (const [key, el] of Object.entries(elements)) {
    if (el === null || (typeof el === 'object' && el.length === 0)) {
      console.warn(`⚠️ Elemento "${key}" no encontrado.`);
    } else if (typeof el === 'object' && el.length > 0) {
      console.log(`✅ "${key}" encontrado (${el.length} elementos).`);
    } else {
      console.log(`✅ "${key}" encontrado.`);
    }
  }

  // ============================================================
  // 4. VARIABLES DE ESTADO
  // ============================================================
  let isLogin = true;
  let currentUser = null;
  let walletData = null;

  // ============================================================
  // 5. NAVEGACIÓN POR TABS (Bottom Nav)
  // ============================================================
  elements.navItems.forEach(item => {
    item.addEventListener('click', function() {
      const pageId = this.dataset.page;
      if (!pageId) return;
      
      // Actualizar clases activas
      elements.navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      
      elements.pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
          page.classList.add('active');
        }
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ============================================================
  // 6. NAVEGACIÓN A PÁGINAS DOCUMENTO
  // ============================================================
  function navigateTo(pageId) {
    // Ocultar todas las páginas
    elements.pages.forEach(p => p.classList.remove('active'));
    // Mostrar la página destino
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    // Actualizar nav items
    elements.navItems.forEach(n => n.classList.remove('active'));
    // Activar nav item si existe
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Enlaces de "Más" que llevan a páginas documento
  elements.moreItems.forEach(item => {
    item.addEventListener('click', function() {
      const page = this.dataset.page;
      if (page) navigateTo(page);
    });
  });

  // Enlaces del footer (usando onclick en HTML, pero también lo manejamos aquí)
  window.navigateTo = navigateTo; // Hacer global para usar en onclick

  // ============================================================
  // 7. MODAL LOGIN / REGISTRO
  // ============================================================
  // Abrir modal
  if (elements.btnEntrar) {
    elements.btnEntrar.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  }

  // Cerrar modal
  if (elements.modalClose) {
    elements.modalClose.addEventListener('click', closeModal);
  }
  if (elements.modalOverlay) {
    elements.modalOverlay.addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && elements.modalOverlay && elements.modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  function openModal() {
    if (!elements.modalOverlay) return;
    elements.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (elements.authError) elements.authError.style.display = 'none';
    if (!isLogin) {
      isLogin = true;
      updateModalMode();
    }
  }

  function closeModal() {
    if (!elements.modalOverlay) return;
    elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (elements.authForm) elements.authForm.reset();
    document.querySelectorAll('.form-group input').forEach(input => input.blur());
    if (elements.authError) elements.authError.style.display = 'none';
    // Restaurar formulario principal
    if (elements.authForm) elements.authForm.style.display = 'block';
    if (elements.recoveryForm) elements.recoveryForm.style.display = 'none';
  }

  // Alternancia Login / Registro
  if (elements.toggleLink) {
    elements.toggleLink.addEventListener('click', function(e) {
      e.preventDefault();
      isLogin = !isLogin;
      updateModalMode();
    });
  }

  function updateModalMode() {
    if (!elements.modalTitle || !elements.modalSubtext || !elements.nameGroup || !elements.btnText || !elements.btnIcon || !elements.toggleLink) return;

    if (isLogin) {
      elements.modalTitle.textContent = 'Iniciar sesión';
      elements.modalSubtext.textContent = 'Accede a tu cuenta';
      elements.nameGroup.style.display = 'none';
      if (elements.nameInput) elements.nameInput.removeAttribute('required');
      elements.btnText.textContent = 'Entrar';
      elements.btnIcon.className = 'fas fa-arrow-right';
      elements.toggleLink.textContent = 'Regístrate';
      elements.toggleLink.parentElement.innerHTML = `¿No tienes cuenta? <a href="#" id="toggleLink">Regístrate</a>`;
      document.getElementById('toggleLink').addEventListener('click', function(e) {
        e.preventDefault();
        isLogin = !isLogin;
        updateModalMode();
      });
    } else {
      elements.modalTitle.textContent = 'Crear cuenta';
      elements.modalSubtext.textContent = 'Regístrate y comienza a ganar';
      elements.nameGroup.style.display = 'flex';
      if (elements.nameInput) elements.nameInput.setAttribute('required', 'required');
      elements.btnText.textContent = 'Registrarse';
      elements.btnIcon.className = 'fas fa-user-plus';
      elements.toggleLink.textContent = 'Iniciar sesión';
      elements.toggleLink.parentElement.innerHTML = `¿Ya tienes cuenta? <a href="#" id="toggleLink">Iniciar sesión</a>`;
      document.getElementById('toggleLink').addEventListener('click', function(e) {
        e.preventDefault();
        isLogin = !isLogin;
        updateModalMode();
      });
    }
    if (elements.authError) elements.authError.style.display = 'none';
  }

  // ============================================================
  // 8. RECUPERACIÓN DE CONTRASEÑA
  // ============================================================
  if (elements.forgotPasswordLink) {
    elements.forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (elements.authForm) elements.authForm.style.display = 'none';
      if (elements.recoveryForm) elements.recoveryForm.style.display = 'block';
      if (elements.recoveryMessage) {
        elements.recoveryMessage.textContent = '';
        elements.recoveryMessage.style.color = '';
      }
    });
  }

  if (elements.backToLoginLink) {
    elements.backToLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (elements.authForm) elements.authForm.style.display = 'block';
      if (elements.recoveryForm) elements.recoveryForm.style.display = 'none';
      if (elements.recoveryMessage) {
        elements.recoveryMessage.textContent = '';
        elements.recoveryMessage.style.color = '';
      }
    });
  }

  if (elements.btnRecover) {
    elements.btnRecover.addEventListener('click', async function() {
      const email = elements.recoveryEmail ? elements.recoveryEmail.value.trim() : '';
      if (!email) {
        if (elements.recoveryMessage) {
          elements.recoveryMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
          elements.recoveryMessage.style.color = '#fca5a5';
        }
        return;
      }
      this.disabled = true;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password.html',
        });
        if (error) throw error;
        if (elements.recoveryMessage) {
          elements.recoveryMessage.textContent = '✅ Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo.';
          elements.recoveryMessage.style.color = '#34d399';
        }
        if (elements.recoveryEmail) elements.recoveryEmail.value = '';
      } catch (error) {
        if (elements.recoveryMessage) {
          elements.recoveryMessage.textContent = '❌ ' + (error.message || 'Ocurrió un error. Inténtalo de nuevo.');
          elements.recoveryMessage.style.color = '#fca5a5';
        }
      } finally {
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar enlace';
      }
    });
  }

  // ============================================================
  // 9. AUTENTICACIÓN (Login / Registro)
  // ============================================================
  if (elements.authForm) {
    elements.authForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (elements.authError) elements.authError.style.display = 'none';

      const email = elements.emailInput ? elements.emailInput.value.trim() : '';
      const password = elements.passwordInput ? elements.passwordInput.value.trim() : '';
      const fullName = elements.nameInput ? elements.nameInput.value.trim() : '';

      if (!email || !password) {
        showError('Completa todos los campos.');
        return;
      }
      if (!isLogin && !fullName) {
        showError('Ingresa tu nombre completo.');
        return;
      }

      if (elements.btnSubmit) {
        elements.btnSubmit.disabled = true;
        elements.btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
      }

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
        console.error('Error de autenticación:', error);
        showError(error.message || 'Ocurrió un error. Inténtalo de nuevo.');
      } finally {
        if (elements.btnSubmit) {
          elements.btnSubmit.disabled = false;
          elements.btnSubmit.innerHTML = `
            <span id="btnText">${isLogin ? 'Entrar' : 'Registrarse'}</span>
            <i class="fas ${isLogin ? 'fa-arrow-right' : 'fa-user-plus'}" id="btnIcon"></i>
          `;
        }
      }
    });
  }

  function showError(message) {
    if (elements.authError) {
      elements.authError.textContent = message;
      elements.authError.style.display = 'block';
    }
  }

  // ============================================================
  // 10. GESTIÓN DE SESIÓN Y WALLET
  // ============================================================
  async function loadUserData() {
    try {
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
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  }

  function updateUIForUser(displayName, avatarUrl) {
    if (elements.btnEntrar) elements.btnEntrar.style.display = 'none';
    if (elements.userProfile) elements.userProfile.style.display = 'flex';
    
    const initials = displayName
      .split(' ')
      .map(word => word[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');
    
    if (elements.userAvatar) {
      elements.userAvatar.textContent = initials;
      if (avatarUrl) {
        elements.userAvatar.style.backgroundImage = `url(${avatarUrl})`;
        elements.userAvatar.style.backgroundSize = 'cover';
        elements.userAvatar.textContent = '';
      } else {
        elements.userAvatar.style.backgroundImage = '';
        elements.userAvatar.textContent = initials;
      }
    }
    
    // Toggle dropdown
    if (elements.userProfile) {
      elements.userProfile.onclick = function(e) {
        e.stopPropagation();
        if (elements.userDropdown) elements.userDropdown.classList.toggle('active');
      };
    }
    
    document.addEventListener('click', function() {
      if (elements.userDropdown) elements.userDropdown.classList.remove('active');
    });
  }

  function updateUIForGuest() {
    if (elements.btnEntrar) elements.btnEntrar.style.display = 'flex';
    if (elements.userProfile) elements.userProfile.style.display = 'none';
    if (elements.userDropdown) elements.userDropdown.classList.remove('active');
  }

  function updateWalletUI(wallet) {
    if (wallet) {
      if (elements.userCoins) elements.userCoins.textContent = wallet.coins || 0;
      if (elements.userDiamonds) elements.userDiamonds.textContent = wallet.diamonds || 0;
    } else {
      if (elements.userCoins) elements.userCoins.textContent = '0';
      if (elements.userDiamonds) elements.userDiamonds.textContent = '0';
    }
  }

  // Cerrar sesión
  if (elements.btnLogout) {
    elements.btnLogout.addEventListener('click', async function() {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        updateUIForGuest();
        updateWalletUI(null);
        if (elements.userDropdown) elements.userDropdown.classList.remove('active');
        // Ir a inicio
        const inicio = document.querySelector('[data-page="page-inicio"]');
        if (inicio) inicio.click();
      }
    });
  }

  // Perfil (placeholder)
  if (elements.btnProfile) {
    elements.btnProfile.addEventListener('click', function() {
      alert('🔧 Próximamente podrás editar tu perfil.');
      if (elements.userDropdown) elements.userDropdown.classList.remove('active');
    });
  }

  // ============================================================
  // 11. EVENTOS DE AUTENTICACIÓN (Supabase)
  // ============================================================
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state change:', event);
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session) loadUserData();
    } else if (event === 'SIGNED_OUT') {
      updateUIForGuest();
      updateWalletUI(null);
    }
  });

  // ============================================================
  // 12. CONTADORES ANIMADOS
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
  // 13. INICIALIZAR UI
  // ============================================================
  loadUserData();

  // ============================================================
  // 14. SERVICE WORKER (PWA)
  // ============================================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('✅ SW registrado:', reg))
        .catch(err => console.warn('⚠️ Error SW:', err));
    });
  }

  console.log('✅ ChispaNica inicializado correctamente.');
});
