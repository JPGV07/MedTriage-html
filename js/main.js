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
  // LÓGICA DA TELA DE CADASTRO
  
  // Mostrar/Ocultar Senha (Agora temos dois botões de olho na tela)
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");
  
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Pega o input que está logo antes do botão clicado
      const input = e.currentTarget.previousElementSibling;
      
      if (input.type === "password") {
        input.type = "text";
        e.currentTarget.style.opacity = "1"; 
      } else {
        input.type = "password";
        e.currentTarget.style.opacity = "0.6";
      }
    });
  });

  //Máscara de CPF 
  const inputCpfCadastro = document.getElementById("cpf-cadastro");
  if (inputCpfCadastro) {
    inputCpfCadastro.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });
  }
  // Validação do Formulário de Cadastro
  const formCadastro = document.getElementById("cadastro-form");
  const novaSenha = document.getElementById("nova-senha");
  const repetirSenha = document.getElementById("repetir-senha");
  const emailCadastro = document.getElementById("email-cadastro"); // <-- ESSA LINHA ESTAVA FALTANDO

  if (formCadastro) {
    formCadastro.addEventListener("submit", (e) => {
      e.preventDefault(); 

      //Cheque: As senhas batem?
      if (novaSenha.value !== repetirSenha.value) {
        alert("Erro: As senhas não coincidem!");
        repetirSenha.focus();
        return; // Para a execução e não cria a conta
      }

      // Cheque: A senha tem o tamanho mínimo?
      if (novaSenha.value.length < 6) {
        alert("Erro: A senha precisa ter pelo menos 6 caracteres.");
        novaSenha.focus();
        return;
      }
      //Cheque: O e-mail é válido? (Só valida se o campo não estiver vazio)
      if (emailCadastro.value.trim() !== "") {
        // Regex que exige texto + @ + texto + . + texto
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!regexEmail.test(emailCadastro.value.trim())) {
          alert("Erro: Por favor, insira um e-mail válido (ex: nome@dominio.com).");
          
          // Deixa a borda vermelha para aviso visual
          emailCadastro.style.borderColor = "#EF4444"; 
          emailCadastro.focus();
          return; // Trava o cadastro aqui
        } else {
          // Se o e-mail for válido, limpa a borda vermelha
          emailCadastro.style.borderColor = "var(--border-color)";
        }
      }
      // Se passar por todos os testes:
      alert("Conta criada com sucesso! (Simulação)");
      window.location.href = "index.html"; 
    });

    // Limpa o aviso vermelho assim que o usuário voltar a digitar
    if (emailCadastro) {
      emailCadastro.addEventListener("input", () => {
        emailCadastro.style.borderColor = "var(--border-color)";
      });
    }
  }
});