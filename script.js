// ============================================================
// 11. RECUPERACIÓN DE CONTRASEÑA
// ============================================================
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const recoveryForm = document.getElementById('recoveryForm');
const authFormMain = document.getElementById('authForm');
const backToLoginLink = document.getElementById('backToLoginLink');
const btnRecover = document.getElementById('btnRecover');
const recoveryEmail = document.getElementById('recoveryEmail');
const recoveryMessage = document.getElementById('recoveryMessage');

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  authFormMain.style.display = 'none';
  recoveryForm.style.display = 'block';
  recoveryMessage.textContent = '';
  recoveryMessage.style.color = '';
});

backToLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  authFormMain.style.display = 'block';
  recoveryForm.style.display = 'none';
  recoveryMessage.textContent = '';
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
    recoveryMessage.textContent = '✅ Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo.';
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
// 12. NAVEGACIÓN A PÁGINAS DOCUMENTO
// ============================================================
function navigateTo(pageId) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  // Mostrar la página destino
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
  // Actualizar nav items (quitar active)
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  // Si la página destino está en el bottom nav, activarla
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  // Scroll arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Los enlaces de "Más" que llevan a páginas documento
document.querySelectorAll('.more-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    navigateTo(page);
  });
});

// ============================================================
// 13. CERRAR DROPDOWN AL HACER CLIC EN "MI PERFIL" (placeholder)
// ============================================================
document.getElementById('btnProfile').addEventListener('click', () => {
  alert('🔧 Próximamente podrás editar tu perfil.');
  document.getElementById('userDropdown').classList.remove('active');
});
