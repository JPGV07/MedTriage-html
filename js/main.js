document.addEventListener("DOMContentLoaded", () => {
  
  //LÓGICA DO OLHO (Mostrar/Ocultar Senha)
  // Pega os elementos do HTML usando seus IDs
  const btnToggleSenha = document.getElementById("toggle-senha");
  const inputSenha = document.getElementById("senha");
  // MÁSCARA E BLOQUEIO DE LETRAS NO CPF
  const inputCpf = document.getElementById("cpf");

  if (inputCpf) {
    inputCpf.addEventListener("input", function (e) {
      //Pega o valor que o usuário digitou
      let valor = e.target.value;
      // A MÁGICA: A regex /\D/g substitui TUDO que NÃO for número (\D) por vazio ("")
      valor = valor.replace(/\D/g, "");
      // Limita o CPF a no máximo 11 números
      valor = valor.substring(0, 11);
      // Aplica a máscara visual (000.000.000-00)
      // Coloca o primeiro ponto
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      // Coloca o segundo ponto
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      // Coloca o traço
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      // Devolve o valor formatado para o input
      e.target.value = valor;
    });
  }

  // Verifica se os elementos existem na página para evitar erros
  if (btnToggleSenha && inputSenha) {
    // Adiciona um "ouvinte" que espera o clique no botão
    btnToggleSenha.addEventListener("click", () => {
      
      // Se a senha estiver oculta (password), mostra ela
      if (inputSenha.type === "password") {
        inputSenha.type = "text";
        
        // Troca o ícone para o desenho de "olho cortado"
        btnToggleSenha.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>`;
      } else {
        // Se a senha estiver visível (text), esconde ela
        inputSenha.type = "password";
        
        // Troca o ícone de volta para o "olho aberto"
        btnToggleSenha.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>`;
      }
    });
  }

  // LÓGICA DAS ABAS (Paciente / Profissional)
  const btnPaciente = document.getElementById("btn-paciente");
  const btnProfissional = document.getElementById("btn-profissional");

  if (btnPaciente && btnProfissional) {
    // Quando clicar em "Sou paciente"
    btnPaciente.addEventListener("click", () => {
      btnPaciente.classList.add("active"); // Adiciona a cor azul
      btnProfissional.classList.remove("active"); // Tira a cor azul do outro
    });

    // Quando clicar em "Sou profissional"
    btnProfissional.addEventListener("click", () => {
      btnProfissional.classList.add("active");
      btnPaciente.classList.remove("active");
    });
  }

  //IMPEDIR ENVIO DO FORM 
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (evento) => {
      evento.preventDefault(); // Impede a página de piscar e recarregar
      alert("Login simulado com sucesso! (Aqui conectaria no Backend)");
    });
  }
});