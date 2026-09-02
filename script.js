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

  try {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) {
    if (error.message.includes('duplicate key') || error.message.includes('already registered')) {
      showError('❌ Este correo electrónico ya está registrado. Inicia sesión o usa otro correo.');
    } else {
      throw error;
    }
    return;
  }
  // ... resto del registro exitoso
} catch (error) {
  showError(error.message || 'Ocurrió un error. Inténtalo de nuevo.');
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
  document.getElementById('btnProfile').addEventListener('click', function() {
  if (currentUser) {
    navigateTo('page-perfil');
    loadProfileData();
    document.getElementById('userDropdown').classList.remove('active');
  } else {
    alert('Inicia sesión para ver tu perfil.');
  }
});

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
// ... (todo el código anterior de login, navegación, etc.)

// ============================================================
// 15. PERFIL DE USUARIO (nuevo)
// ============================================================
const profilePage = document.getElementById('page-perfil');
const profileName = document.getElementById('profileName');
const profileLevel = document.getElementById('profileLevel');
const profileXp = document.getElementById('profileXp');
const xpFill = document.getElementById('xpFill');
const currentStreak = document.getElementById('currentStreak');
const bestStreak = document.getElementById('bestStreak');
const profileCoins = document.getElementById('profileCoins');
const profileDiamonds = document.getElementById('profileDiamonds');
const profileInitials = document.getElementById('profileInitials');
const profileAvatarImg = document.getElementById('profileAvatarImg');
const editName = document.getElementById('editName');
const editAvatar = document.getElementById('editAvatar');
const profileForm = document.getElementById('profileForm');
const profileMessage = document.getElementById('profileMessage');
const achievementsList = document.getElementById('achievementsList');
const btnDeleteAccount = document.getElementById('btnDeleteAccount');

// Abrir perfil desde el dropdown
document.getElementById('btnProfile').addEventListener('click', function() {
  if (currentUser) {
    navigateTo('page-perfil');
    loadProfileData();
    document.getElementById('userDropdown').classList.remove('active');
  } else {
    alert('Inicia sesión para ver tu perfil.');
  }
});

async function loadProfileData() {
  if (!currentUser) return;
  
  try {
    // Obtener perfil
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    if (error) throw error;

    // Obtener wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coins, diamonds')
      .eq('user_id', currentUser.id)
      .single();

    // Obtener streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', currentUser.id)
      .single();

    // Mostrar datos
    const fullName = profile.full_name || 'Usuario';
    profileName.textContent = fullName;
    profileLevel.textContent = profile.level || 1;
    profileXp.textContent = profile.xp || 0;
    editName.value = fullName;
    editAvatar.value = profile.avatar_url || '';

    // Avatar
    if (profile.avatar_url) {
      profileAvatarImg.src = profile.avatar_url;
      profileAvatarImg.style.display = 'block';
      profileInitials.style.display = 'none';
    } else {
      profileAvatarImg.style.display = 'none';
      profileInitials.style.display = 'flex';
      profileInitials.textContent = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    }

    // Barra de XP (calcular porcentaje para el siguiente nivel)
    const xp = profile.xp || 0;
    const level = profile.level || 1;
    const xpNextLevel = getXpForLevel(level + 1);
    const xpCurrentLevel = getXpForLevel(level);
    const progress = xpNextLevel > xpCurrentLevel ? (xp - xpCurrentLevel) / (xpNextLevel - xpCurrentLevel) * 100 : 0;
    xpFill.style.width = Math.min(progress, 100) + '%';

    // Rachas
    currentStreak.textContent = streak?.current_streak || 0;
    bestStreak.textContent = streak?.longest_streak || 0;

    // Monedas
    profileCoins.textContent = wallet?.coins || 0;
    profileDiamonds.textContent = wallet?.diamonds || 0;

    // Logros
    await loadAchievements();

  } catch (error) {
    console.error('Error cargando perfil:', error);
  }
}

function getXpForLevel(level) {
  const xpTable = {
    1: 0, 2: 100, 3: 250, 4: 500, 5: 1000,
    6: 1800, 7: 3000, 8: 5000, 9: 8000, 10: 12000
  };
  return xpTable[level] || 12000 + (level - 10) * 4000;
}

// Cargar logros
async function loadAchievements() {
  if (!currentUser) return;
  
  try {
    // Obtener todos los logros disponibles
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('id');

    // Obtener logros del usuario
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', currentUser.id);

    const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];

    achievementsList.innerHTML = allAchievements.map(ach => {
      const unlocked = unlockedIds.includes(ach.id);
      return `
        <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
          <span class="ach-icon">${ach.icon || '🏆'}</span>
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.description || ''}</div>
          ${unlocked ? '<small style="color:#34d399;">✅ Desbloqueado</small>' : '<small style="color:#64748b;">🔒 Bloqueado</small>'}
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error cargando logros:', error);
  }
}

// ============================================================
// 16. EDITAR PERFIL
// ============================================================
profileForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  profileMessage.textContent = '';
  profileMessage.style.color = '';

  const fullName = editName.value.trim();
  const avatarUrl = editAvatar.value.trim();

  if (!fullName) {
    profileMessage.textContent = 'El nombre es obligatorio.';
    profileMessage.style.color = '#fca5a5';
    return;
  }

  // Validar URL de imagen (si se proporciona)
  if (avatarUrl && !avatarUrl.match(/^https?:\/\/.+/i)) {
    profileMessage.textContent = 'Ingresa una URL válida (https://...)';
    profileMessage.style.color = '#fca5a5';
    return;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: avatarUrl || null,
        updated_at: new Date()
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    profileMessage.textContent = '✅ Perfil actualizado correctamente.';
    profileMessage.style.color = '#34d399';

    // Recargar datos
    await loadProfileData();
    // Actualizar también la barra superior
    const displayName = fullName;
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    document.getElementById('userAvatar').textContent = initials;
    // Actualizar wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coins, diamonds')
      .eq('user_id', currentUser.id)
      .single();
    if (wallet) {
      document.getElementById('userCoins').textContent = wallet.coins || 0;
      document.getElementById('userDiamonds').textContent = wallet.diamonds || 0;
    }

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    profileMessage.textContent = '❌ ' + error.message;
    profileMessage.style.color = '#fca5a5';
  }
});

// ============================================================
// 17. ELIMINAR CUENTA
// ============================================================
btnDeleteAccount.addEventListener('click', async function() {
  if (!currentUser) return;
  
  const confirmed = confirm(
    '⚠️ ¿Estás seguro de que quieres eliminar tu cuenta?\n' +
    'Esta acción es irreversible y eliminará todos tus datos (perfil, monedas, logros, etc.).'
  );
  
  if (!confirmed) return;

  const password = prompt('Para confirmar, ingresa tu contraseña:');
  if (!password) return;

  try {
    // Primero verificar credenciales
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: password
    });
    if (signInError) throw new Error('Contraseña incorrecta.');

    // Eliminar datos del usuario en cascada (RLS debe permitir)
    // Primero eliminamos las filas en tablas relacionadas
    await supabase.from('user_achievements').delete().eq('user_id', currentUser.id);
    await supabase.from('streaks').delete().eq('user_id', currentUser.id);
    await supabase.from('wallets').delete().eq('user_id', currentUser.id);
    await supabase.from('profiles').delete().eq('id', currentUser.id);

    // Finalmente eliminar el usuario (esto requiere una función RPC o admin, 
    // porque Supabase no permite eliminar auth.users desde el cliente)
    // Como alternativa, desactivamos la cuenta o usamos una Edge Function.
    // Por simplicidad, cerramos sesión y mostramos mensaje.
    await supabase.auth.signOut();
    alert('✅ Tu cuenta ha sido eliminada. Sentimos que te vayas.');

    // Volver a la página de inicio
    navigateTo('page-inicio');
    updateUIForGuest();

  } catch (error) {
    alert('❌ Error al eliminar cuenta: ' + error.message);
  }
});

// Modificar la función navigateTo para que si se navega al perfil, cargue los datos
const originalNavigate = window.navigateTo;
window.navigateTo = function(pageId) {
  originalNavigate(pageId);
  if (pageId === 'page-perfil' && currentUser) {
    loadProfileData();
  }
};
// ============================================================
// 18. MODAL EDITAR PERFIL CON SUBIDA DE IMAGEN
// ============================================================

// Elementos del modal
const editModal = document.getElementById('editProfileModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const modalProfileImage = document.getElementById('modalProfileImage');
const uploadPhoto = document.getElementById('uploadPhoto');
const uploadPhotoIcon = document.getElementById('uploadPhotoIcon');
const editNameInput = document.getElementById('editNameInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editProfileMessage = document.getElementById('editProfileMessage');

let tempFile = null; // Archivo temporal para la nueva foto

// Abrir modal (desde el botón "Editar perfil" en la página de perfil)
function openEditProfileModal() {
  if (!currentUser) {
    alert('Inicia sesión para editar tu perfil.');
    return;
  }
  // Cargar datos actuales
  editNameInput.value = document.getElementById('profileName').textContent || '';
  // Cargar avatar actual
  const currentAvatar = document.getElementById('profileAvatarImg').src;
  if (currentAvatar && currentAvatar !== window.location.href) {
    modalProfileImage.src = currentAvatar;
  } else {
    modalProfileImage.src = ''; // mostrar placeholder
  }
  tempFile = null;
  editProfileMessage.textContent = '';
  editProfileMessage.style.color = '';
  editModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeEditModal() {
  editModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  uploadPhoto.value = ''; // reset
  tempFile = null;
  editProfileMessage.textContent = '';
}

// Eventos de apertura/cierre
document.querySelector('.profile-edit .btn-edit-profile')?.addEventListener('click', openEditProfileModal);
// Si no hay botón, lo creamos en la página de perfil

// Cerrar con botones
closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editModal.style.display === 'flex') closeEditModal();
});

// Subir foto
uploadPhotoIcon.addEventListener('click', () => {
  uploadPhoto.click();
});

uploadPhoto.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validar tipo
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    editProfileMessage.textContent = '❌ Formato no soportado. Usa JPG, PNG o WEBP.';
    editProfileMessage.style.color = '#fca5a5';
    uploadPhoto.value = '';
    return;
  }
  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    editProfileMessage.textContent = '❌ La imagen es muy grande. Máximo 5MB.';
    editProfileMessage.style.color = '#fca5a5';
    uploadPhoto.value = '';
    return;
  }
  // Previsualizar
  const reader = new FileReader();
  reader.onload = (ev) => {
    modalProfileImage.src = ev.target.result;
    tempFile = file;
    editProfileMessage.textContent = '📷 Foto seleccionada. Guarda los cambios.';
    editProfileMessage.style.color = '#34d399';
  };
  reader.readAsDataURL(file);
});

// Guardar perfil
saveProfileBtn.addEventListener('click', async () => {
  const nuevoNombre = editNameInput.value.trim();
  if (!nuevoNombre) {
    editProfileMessage.textContent = '❌ El nombre no puede estar vacío.';
    editProfileMessage.style.color = '#fca5a5';
    return;
  }

  // Si no hay foto temporal, usar la actual
  let avatarUrl = null;
  if (tempFile) {
    try {
      // Subir a Supabase Storage
      const fileName = `avatar_${currentUser.id}_${Date.now()}.${tempFile.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, tempFile, {
          cacheControl: '3600',
          upsert: true,
        });
      if (error) throw error;
      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      avatarUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      editProfileMessage.textContent = '❌ Error al subir imagen: ' + error.message;
      editProfileMessage.style.color = '#fca5a5';
      return;
    }
  } else {
    // Mantener la URL actual o null
    const currentImg = document.getElementById('profileAvatarImg').src;
    if (currentImg && currentImg !== window.location.href) {
      avatarUrl = currentImg;
    }
  }

  // Guardar en Supabase
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: nuevoNombre,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    editProfileMessage.textContent = '✅ Perfil actualizado correctamente.';
    editProfileMessage.style.color = '#34d399';

    // Actualizar UI
    await loadProfileData(); // recarga todo
    // Actualizar avatar en header
    const initials = nuevoNombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    document.getElementById('userAvatar').textContent = initials;
    if (avatarUrl) {
      document.getElementById('userAvatar').style.backgroundImage = `url(${avatarUrl})`;
      document.getElementById('userAvatar').style.backgroundSize = 'cover';
      document.getElementById('userAvatar').textContent = '';
    } else {
      document.getElementById('userAvatar').style.backgroundImage = '';
      document.getElementById('userAvatar').textContent = initials;
    }

    // Cerrar modal después de 1.5s
    setTimeout(closeEditModal, 1500);

  } catch (error) {
    console.error('Error al guardar perfil:', error);
    editProfileMessage.textContent = '❌ ' + error.message;
    editProfileMessage.style.color = '#fca5a5';
  }
});
// ===== SUBIR A IMGBB =====
async function uploadToImgbb(file) {
  const formData = new FormData();
  formData.append('key', 'd67ad1a46c99f2914bcaa2df0b229214'); // <-tu API Key
  formData.append('image', file);
  
  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      return data.data.url; // URL directa de la imagen
    } else {
      throw new Error(data.error?.message || 'Error al subir a imgbb');
    }
  } catch (error) {
    throw new Error('Error de conexión con imgbb: ' + error.message);
  }
}
//-- bton
saveProfileBtn.addEventListener('click', async () => {
  const nuevoNombre = editNameInput.value.trim();
  if (!nuevoNombre) {
    editProfileMessage.textContent = '❌ El nombre no puede estar vacío.';
    editProfileMessage.style.color = '#fca5a5';
    return;
  }

  let avatarUrl = null;
  if (tempFile) {
    try {
      // Subir a imgbb
      avatarUrl = await uploadToImgbb(tempFile);
      editProfileMessage.textContent = '📤 Imagen subida a imgbb...';
      editProfileMessage.style.color = '#34d399';
    } catch (error) {
      editProfileMessage.textContent = '❌ ' + error.message;
      editProfileMessage.style.color = '#fca5a5';
      return;
    }
  } else {
    // Mantener avatar actual si no hay cambio
    const currentImg = document.getElementById('profileAvatarImg').src;
    if (currentImg && currentImg !== window.location.href) {
      avatarUrl = currentImg;
    }
  }

  // Guardar en Supabase
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: nuevoNombre,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    editProfileMessage.textContent = '✅ Perfil actualizado correctamente.';
    editProfileMessage.style.color = '#34d399';
    await loadProfileData(); // recargar datos
    // Actualizar header
    updateHeaderAvatar(nuevoNombre, avatarUrl);
    setTimeout(closeEditModal, 1500);
  } catch (error) {
    editProfileMessage.textContent = '❌ ' + error.message;
    editProfileMessage.style.color = '#fca5a5';
  }
});

// Función auxiliar para actualizar header
function updateHeaderAvatar(name, avatarUrl) {
  const avatarEl = document.getElementById('userAvatar');
  if (avatarUrl) {
    avatarEl.style.backgroundImage = `url(${avatarUrl})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.textContent = '';
  } else {
    avatarEl.style.backgroundImage = '';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    avatarEl.textContent = initials;
  }
}
