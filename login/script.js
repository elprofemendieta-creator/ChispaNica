// ===== CONTROL DEL MODAL =====
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const btnEntrar = document.querySelector('.btn-entrar');
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
  // Reiniciar formulario
  authForm.reset();
  // Resetear campos flotantes
  document.querySelectorAll('.form-group input').forEach(input => {
    input.blur();
  });
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
    // Reasignar evento al nuevo enlace
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

// ===== ANIMACIÓN DE ICONOS AL ENFOCAR (ya está en CSS) =====
// El resto del código (menú, contadores, etc.) permanece igual.
