(function () {
  function formatarCPF(valor) {
    let digits = String(valor || '').replace(/\D/g, '').slice(0, 11);
    digits = digits.replace(/(\d{3})(\d)/, '$1.$2');
    digits = digits.replace(/(\d{3})(\d)/, '$1.$2');
    digits = digits.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return digits;
  }

  function validarCPF(cpf) {
    const digits = String(cpf || '').replace(/\D/g, '');
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
      return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(digits.charAt(i), 10) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digito1 = resto >= 10 ? 0 : resto;
    if (digito1 !== parseInt(digits.charAt(9), 10)) {
      return false;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(digits.charAt(i), 10) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digito2 = resto >= 10 ? 0 : resto;
    return digito2 === parseInt(digits.charAt(10), 10);
  }

  function aplicarMascaraCPFInput(input) {
    if (!input || input.dataset.cpfBound === 'true') return;
    input.dataset.cpfBound = 'true';
    input.setAttribute('maxlength', '14');
    input.setAttribute('inputmode', 'numeric');

    input.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener('input', (e) => {
      e.target.value = formatarCPF(e.target.value);
      const limpo = e.target.value.replace(/\D/g, '');
      if (limpo.length === 11 && !validarCPF(e.target.value)) {
        e.target.setCustomValidity('CPF inválido.');
      } else {
        e.target.setCustomValidity('');
      }
    });

    input.addEventListener('blur', (e) => {
      const val = e.target.value.trim();
      if (val && !validarCPF(val)) {
        e.target.setCustomValidity('CPF inválido. Verifique os dígitos.');
      } else {
        e.target.setCustomValidity('');
      }
    });
  }

  function initCPFFields() {
    const seletoresCPF = [
      '#cpf',
      '#pacienteCpf',
      'input[name="cpf"]',
      'input[id*="cpf" i]',
      'input[placeholder*="000.000.000-00"]'
    ].join(', ');

    document.querySelectorAll(seletoresCPF).forEach(aplicarMascaraCPFInput);

    // No campo de login (#document), aceita CPF com máscara ou matrícula alfanumérica
    const docLogin = document.getElementById('document');
    if (docLogin && docLogin.dataset.cpfBound !== 'true') {
      docLogin.dataset.cpfBound = 'true';
      docLogin.addEventListener('input', (e) => {
        const raw = e.target.value;
        if (/^\d/.test(raw) && !/[a-zA-Z]/.test(raw)) {
          e.target.value = formatarCPF(raw);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initCPFFields);

  window.MedTriageValidators = {
    formatarCPF,
    validarCPF,
    aplicarMascaraCPFInput,
    initCPFFields
  };
})();
