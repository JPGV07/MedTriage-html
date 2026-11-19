(function () {
  const PAGINAS_PUBLICAS = [
    'index.html',
    'cadastro.html',
    'cadastro_medico.html',
    'recuperar_senha.html',
    ''
  ];

  function getPaginaAtual() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
  }

  function logout() {
    localStorage.removeItem('medtriage_token');
    localStorage.removeItem('medtriage_user');
    sessionStorage.clear();
    window.location.href = 'index.html';
  }

  function verificarAcesso() {
    const pagina = getPaginaAtual();
    if (PAGINAS_PUBLICAS.includes(pagina)) return;

    const token = localStorage.getItem('medtriage_token');
    if (!token || (window.MedTriageAPI && window.MedTriageAPI.isTokenExpired(token))) {
      logout();
      return;
    }

    const user = window.MedTriageAPI ? window.MedTriageAPI.parseJwt(token) : null;
    if (user && pagina.startsWith('medico_') && user.role !== 'FUNCIONARIO' && user.role !== 'ADMIN') {
      window.location.href = 'paciente_dashboard.html';
    }
  }

  function bindBotoesSair() {
    const seletores = '#btnSair, #btnLogout, #logoutBtn, .btn-sair, .logout-btn, [data-logout], a[href="index.html"]';
    document.querySelectorAll(seletores).forEach((el) => {
      const texto = (el.textContent || '').trim().toLowerCase();
      if (el.matches('[data-logout], #btnSair, #btnLogout, #logoutBtn, .btn-sair, .logout-btn') || texto === 'sair') {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    });

    // Garante captura mesmo em botões criados dinamicamente na tela
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      const texto = (target.textContent || '').trim().toLowerCase();
      if (
        target.matches('#btnSair, #btnLogout, #logoutBtn, .btn-sair, .logout-btn, [data-logout]') ||
        texto === 'sair'
      ) {
        e.preventDefault();
        logout();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    verificarAcesso();
    bindBotoesSair();
  });

  window.MedTriageSession = {
    logout,
    verificarAcesso
  };
})();
