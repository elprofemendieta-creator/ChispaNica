// ============================================================
// 1. CONFIGURACIÓN SUPABASE
// ============================================================
const SUPABASE_URL = 'https://vrfdvythxysbhugrermx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qomvhRRFkvrepVZkJgAJaw_JMLuWh_t';

// Clave API de imgbb (reemplaza con tu propia clave)
// Obténla en https://api.imgbb.com/
const IMGBB_API_KEY = 'TU_API_KEY_AQUI'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 2. ESPERAR A QUE EL DOM ESTÉ LISTO
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 ChispaNica inicializado');

  // ============================================================
  // 3. REFERENCIAS A ELEMENTOS DEL DOM
  // ============================================================
  // Navbar / Header
  const btnEntrar = document.getElementById('btnEntrar');
  const userProfile = document.getElementById('userProfile');
  const userAvatar = document.getElementById('userAvatar');
  const userDropdown = document.getElementById('userDropdown');
  const btnLogout = document.getElementById('btnLogout');
  const btnProfile = document.getElementById('btnProfile');
  const userCoins = document.getElementById('userCoins');
  const userDiamonds = document.getElementById('userDiamonds');

  // Modal de login/registro
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

  // Recuperación de contraseña
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const recoveryForm = document.getElementById('recoveryForm');
  const recoveryEmail = document.getElementById('recoveryEmail');
  const btnRecover = document.getElementById('btnRecover');
  const recoveryMessage = document.getElementById('recoveryMessage');
  const backToLoginLink = document.getElementById('backToLoginLink');

  // Navegación
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page-section');
  const moreItems = document.querySelectorAll('.more-item[data-page]');

  // Página de perfil
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
  const achievementsList = document.getElementById('achievementsList');
  const btnDeleteAccount = document.getElementById('btnDeleteAccount');

  // Modal de edición de perfil
  const editModal = document.getElementById('editProfileModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const modalProfileImage = document.getElementById('modalProfileImage');
  const uploadPhoto = document.getElementById('uploadPhoto');
  const uploadPhotoIcon = document.getElementById('uploadPhotoIcon');
  const editNameInput = document.getElementById('editNameInput');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const editProfileMessage = document.getElementById('editProfileMessage');

  // ============================================================
  // 4. ESTADO GLOBAL
  // ============================================================
  let currentUser = null;
  let isLogin = true;
  let tempFile = null; // archivo temporal para avatar

  // ============================================================
  // 5. NAVEGACIÓN POR TABS (BOTTOM NAV)
  // ============================================================
  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const pageId = this.dataset.page;
      if (!pageId) return;
      // Actualizar clases activas
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) page.classList.add('active');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ============================================================
  // 6. FUNCIÓN GLOBAL DE NAVEGACIÓN
  // ============================================================
  window.navigateTo = function (pageId) {
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    navItems.forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Si es la página de perfil, cargar datos
    if (pageId === 'page-perfil' && currentUser) {
      loadProfileData();
    }
  };

  // Enlaces de "Más" que llevan a páginas documento
  moreItems.forEach(item => {
    item.addEventListener('click', function () {
      const page = this.dataset.page;
      if (page) window.navigateTo(page);
    });
  });

  // ============================================================
  // 7. MODAL LOGIN / REGISTRO
  // ============================================================
  function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    authError.style.display = 'none';
    // Restaurar formulario principal
    authForm.style.display = 'block';
    recoveryForm.style.display = 'none';
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
    // Limpiar mensajes de recuperación
    recoveryMessage.textContent = '';
    recoveryMessage.style.color = '';
  }

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

  // Alternancia login / registro
  function updateModalMode() {
    if (isLogin) {
      modalTitle.textContent = 'Iniciar sesión';
      modalSubtext.textContent = 'Accede a tu cuenta';
      nameGroup.style.display = 'none';
      nameInput.removeAttribute('required');
      btnText.textContent = 'Entrar';
      btnIcon.className = 'fas fa-arrow-right';
      toggleLink.parentElement.innerHTML =
        `¿No tienes cuenta? <a href="#" id="toggleLink">Regístrate</a>`;
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
      toggleLink.parentElement.innerHTML =
        `¿Ya tienes cuenta? <a href="#" id="toggleLink">Iniciar sesión</a>`;
      document.getElementById('toggleLink').addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        updateModalMode();
      });
    }
    authError.style.display = 'none';
  }

  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    updateModalMode();
  });

  // ============================================================
  // 8. RECUPERACIÓN DE CONTRASEÑA
  // ============================================================
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    authForm.style.display = 'none';
    recoveryForm.style.display = 'block';
    recoveryMessage.textContent = '';
    recoveryMessage.style.color = '';
  });

  backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    authForm.style.display = 'block';
    recoveryForm.style.display = 'none';
    recoveryMessage.textContent = '';
    recoveryMessage.style.color = '';
  });

  btnRecover.addEventListener('click', async () => {
    const email = recoveryEmail.value.trim();
    if (!email) {
      recoveryMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
      recoveryMessage.style.color = '#fca5a5';
      return;
    }
    btnRecover.disabled = true;
    btnRecover.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html',
      });
      if (error) throw error;
      recoveryMessage.textContent =
        '✅ Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo.';
      recoveryMessage.style.color = '#34d399';
      recoveryEmail.value = '';
    } catch (error) {
      recoveryMessage.textContent = '❌ ' + (error.message || 'Ocurrió un error. Inténtalo de nuevo.');
      recoveryMessage.style.color = '#fca5a5';
    } finally {
      btnRecover.disabled = false;
      btnRecover.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar enlace';
    }
  });

  // ============================================================
  // 9. AUTENTICACIÓN (LOGIN / REGISTRO)
  // ============================================================
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none';

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const fullName = nameInput.value.trim();

    if (!email || !password) {
      showAuthError('Completa todos los campos.');
      return;
    }
    if (!isLogin && !fullName) {
      showAuthError('Ingresa tu nombre completo.');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';

    try {
      if (isLogin) {
        // INICIAR SESIÓN
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        closeModal();
      } else {
        // REGISTRO
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) {
          if (error.message.includes('duplicate key') ||
              error.message.includes('already registered')) {
            showAuthError('❌ Este correo electrónico ya está registrado. Inicia sesión o usa otro correo.');
          } else {
            throw error;
          }
          return;
        }

        if (data.user) {
          const userId = data.user.id;
          // Crear perfil
          await supabase.from('profiles').insert({
            id: userId,
            full_name: fullName,
            username: fullName.toLowerCase().replace(/\s/g, '_') + '_' + userId.slice(0, 6),
            avatar_url: null,
            level: 1,
            xp: 0
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
      showAuthError(error.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <span id="btnText">${isLogin ? 'Entrar' : 'Registrarse'}</span>
        <i class="fas ${isLogin ? 'fa-arrow-right' : 'fa-user-plus'}" id="btnIcon"></i>
      `;
    }
  });

  function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
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

        const displayName = profile?.full_name || user.email || 'Usuario';
        updateUIForUser(displayName, profile?.avatar_url);
        updateWalletUI(wallet);
      } else {
        currentUser = null;
        updateUIForGuest();
        updateWalletUI(null);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
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

    if (avatarUrl) {
      userAvatar.style.backgroundImage = `url(${avatarUrl})`;
      userAvatar.style.backgroundSize = 'cover';
      userAvatar.textContent = '';
    } else {
      userAvatar.style.backgroundImage = '';
      userAvatar.textContent = initials;
    }

    // Toggle dropdown
    userProfile.onclick = function (e) {
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
      const inicio = document.querySelector('[data-page="page-inicio"]');
      if (inicio) inicio.click();
    }
  });

  // Botón "Mi perfil" en dropdown → navegar a página de perfil
  btnProfile.addEventListener('click', function () {
    if (currentUser) {
      window.navigateTo('page-perfil');
      userDropdown.classList.remove('active');
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
      currentUser = null;
      updateUIForGuest();
      updateWalletUI(null);
    }
  });

  // ============================================================
  // 12. CONTADORES ANIMADOS (STATS)
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
  // 13. PERFIL DE USUARIO (CARGAR DATOS)
  // ============================================================
  async function loadProfileData() {
    if (!currentUser) return;

    try {
      // Perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      if (error) throw error;

      // Wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('coins, diamonds')
        .eq('user_id', currentUser.id)
        .single();

      // Streak
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

      // Avatar
      if (profile.avatar_url) {
        profileAvatarImg.src = profile.avatar_url;
        profileAvatarImg.style.display = 'block';
        profileInitials.style.display = 'none';
      } else {
        profileAvatarImg.style.display = 'none';
        profileInitials.style.display = 'flex';
        const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        profileInitials.textContent = initials;
      }

      // Barra de XP
      const xp = profile.xp || 0;
      const level = profile.level || 1;
      const xpNext = getXpForLevel(level + 1);
      const xpCurrent = getXpForLevel(level);
      const progress = xpNext > xpCurrent ? ((xp - xpCurrent) / (xpNext - xpCurrent)) * 100 : 0;
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
    const table = {
      1: 0, 2: 100, 3: 250, 4: 500, 5: 1000,
      6: 1800, 7: 3000, 8: 5000, 9: 8000, 10: 12000
    };
    return table[level] || 12000 + (level - 10) * 4000;
  }

  // ============================================================
  // 14. LOGROS
  // ============================================================
  async function loadAchievements() {
    if (!currentUser) return;
    try {
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('id');

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
  // 15. MODAL EDITAR PERFIL (CON SUBIDA A IMGBB)
  // ============================================================
  function openEditProfileModal() {
    if (!currentUser) {
      alert('Inicia sesión para editar tu perfil.');
      return;
    }
    // Cargar datos actuales en el modal
    editNameInput.value = profileName.textContent || '';
    const currentAvatar = profileAvatarImg.src;
    if (currentAvatar && currentAvatar !== window.location.href) {
      modalProfileImage.src = currentAvatar;
    } else {
      modalProfileImage.src = ''; // placeholder (se mostrará el ícono)
    }
    tempFile = null;
    editProfileMessage.textContent = '';
    editProfileMessage.style.color = '';
    editModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Resetear input file
    uploadPhoto.value = '';
  }

  function closeEditModal() {
    editModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    uploadPhoto.value = '';
    tempFile = null;
    editProfileMessage.textContent = '';
    editProfileMessage.style.color = '';
  }

  // Botón "Editar perfil" en la página de perfil (lo agregamos dinámicamente)
  const btnEditProfile = document.getElementById('btnEditProfile');
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', openEditProfileModal);
  }

  // Eventos del modal de edición
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

  // ============================================================
  // 16. SUBIR A IMGBB
  // ============================================================
  async function uploadToImgbb(file) {
    const formData = new FormData();
    formData.append('key', d67ad1a46c99f2914bcaa2df0b229214);
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

  // ============================================================
  // 17. GUARDAR PERFIL (NOMBRE + AVATAR)
  // ============================================================
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
        editProfileMessage.textContent = '📤 Subiendo imagen a imgbb...';
        editProfileMessage.style.color = '#34d399';
        avatarUrl = await uploadToImgbb(tempFile);
        editProfileMessage.textContent = '✅ Imagen subida correctamente.';
      } catch (error) {
        editProfileMessage.textContent = '❌ ' + error.message;
        editProfileMessage.style.color = '#fca5a5';
        return;
      }
    } else {
      // Mantener la actual
      const currentImg = profileAvatarImg.src;
      if (currentImg && currentImg !== window.location.href) {
        avatarUrl = currentImg;
      }
    }

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

      // Recargar datos de perfil
      await loadProfileData();
      // Actualizar header
      const initials = nuevoNombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      if (avatarUrl) {
        userAvatar.style.backgroundImage = `url(${avatarUrl})`;
        userAvatar.style.backgroundSize = 'cover';
        userAvatar.textContent = '';
      } else {
        userAvatar.style.backgroundImage = '';
        userAvatar.textContent = initials;
      }
      // Cerrar modal después de 1.5s
      setTimeout(closeEditModal, 1500);

    } catch (error) {
      console.error('Error al guardar perfil:', error);
      editProfileMessage.textContent = '❌ ' + error.message;
      editProfileMessage.style.color = '#fca5a5';
    }
  });

  // ============================================================
  // 18. ELIMINAR CUENTA
  // ============================================================
  btnDeleteAccount.addEventListener('click', async () => {
    if (!currentUser) return;
    const confirmed = confirm(
      '⚠️ ¿Estás seguro de que quieres eliminar tu cuenta?\n' +
      'Esta acción es irreversible y eliminará todos tus datos (perfil, monedas, logros, etc.).'
    );
    if (!confirmed) return;

    const password = prompt('Para confirmar, ingresa tu contraseña:');
    if (!password) return;

    try {
      // Verificar credenciales
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: password
      });
      if (signInError) throw new Error('Contraseña incorrecta.');

      // Eliminar datos relacionados
      await supabase.from('user_achievements').delete().eq('user_id', currentUser.id);
      await supabase.from('streaks').delete().eq('user_id', currentUser.id);
      await supabase.from('wallets').delete().eq('user_id', currentUser.id);
      await supabase.from('profiles').delete().eq('id', currentUser.id);

      // Cerrar sesión
      await supabase.auth.signOut();
      alert('✅ Tu cuenta ha sido eliminada. Sentimos que te vayas.');
      window.navigateTo('page-inicio');
      updateUIForGuest();

    } catch (error) {
      alert('❌ Error al eliminar cuenta: ' + error.message);
    }
  });

  // ============================================================
  // 19. INICIALIZAR UI
  // ============================================================
  loadUserData();

  // ============================================================
  // 20. SERVICE WORKER (OPCIONAL)
  // ============================================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('✅ SW registrado:', reg))
        .catch(err => console.warn('⚠️ Error SW:', err));
    });
  }

  console.log('✅ ChispaNica inicializado correctamente.');
});
