document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCadastroMedico');
  const cpfInput = document.getElementById('cpf');
  const feedback = document.getElementById('cadastroMedicoFeedback');

  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });
  }

  function showMessage(msg, isError = true) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = isError ? 'feedback-message error' : 'feedback-message success';
  }

  function validarCPF(cpf) {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 >= 10) d1 = 0;
    if (d1 !== parseInt(digits)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    let d2 = 11 - (sum % 11);
    if (d2 >= 10) d2 = 0;
    return d2 === parseInt(digits);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (feedback) feedback.textContent = '';

    const nome = document.getElementById('nome').value.trim();
    const cpf = cpfInput.value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const crm = document.getElementById('crm').value.trim();
    const especialidade = document.getElementById('especialidade').value;
    const email = document.getElementById('email').value.trim();
    const precoConsulta = parseFloat(document.getElementById('precoConsulta').value);
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (!nome || !cpf || !matricula || !crm || !especialidade || !email) {
      return showMessage('Todos os campos obrigatórios devem ser preenchidos.');
    }
    if (!validarCPF(cpf)) {
      return showMessage('Informe um CPF válido no formato 000.000.000-00.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showMessage('Informe um endereço de e-mail válido.');
    }
    if (isNaN(precoConsulta) || precoConsulta <= 0) {
      return showMessage('Informe um valor válido para a consulta presencial.');
    }
    if (senha.length < 8) {
      return showMessage('A senha deve ter no mínimo 8 caracteres.');
    }
    if (senha !== confirmarSenha) {
      return showMessage('As senhas não coincidem.');
    }

    const termos = window.MedTriageTermos.getDadosAceite();
    if (!termos.termosAceitos) {
      return showMessage('É obrigatório ler e aceitar os Termos de Uso.');
    }

    const captchaToken = window.MedTriageCaptcha.getToken(form);
    if (!captchaToken) {
      return showMessage('Complete a verificação CAPTCHA antes de enviar.');
    }

    const btn = document.getElementById('btnCadastrarMedico');
    btn.disabled = true;

    try {
      await window.MedTriageAPI.request('/med/cadastro-completo', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          cpf,
          matricula,
          crm,
          especialidade,
          email,
          precoConsulta,
          senha,
          termosAceitos: termos.termosAceitos,
          termosVersao: termos.termosVersao,
          termosAceitoEm: termos.termosAceitoEm,
          captchaToken
        })
      });

      showMessage('Cadastro médico concluído com sucesso! Redirecionando...', false);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (err) {
      window.MedTriageCaptcha.reset(form);
      showMessage(err.message || 'Erro ao cadastrar médico.');
    } finally {
      btn.disabled = false;
    }
  });
});
