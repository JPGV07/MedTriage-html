// Utilitário de segurança (Hash SHA-256)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  
  let perfilAtivo = "paciente"; 

  // Lógica do olho da senha
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const wrapper = e.currentTarget.closest('.input-wrapper');
      const input = wrapper.querySelector('input');
      
      if (input.type === "password") {
        input.type = "text";
        e.currentTarget.style.opacity = "1";
      } else {
        input.type = "password";
        e.currentTarget.style.opacity = "0.6";
      }
    });
  });

  // --- TELA DE LOGIN ---
  const btnPaciente = document.getElementById("btn-paciente");
  const btnProfissional = document.getElementById("btn-profissional");
  const labelId = document.getElementById("label-id");
  const inputId = document.getElementById("input-id");
  const firstTimeBox = document.querySelector(".first-time-box");

  if (btnPaciente && btnProfissional) {
    
    btnPaciente.addEventListener("click", () => {
      perfilAtivo = "paciente";
      document.body.classList.remove("theme-professional");
      btnPaciente.classList.add("active");
      btnProfissional.classList.remove("active");
      
      labelId.textContent = "CPF";
      inputId.placeholder = "000.000.000-00";
      inputId.value = ""; 
      
      if (firstTimeBox) firstTimeBox.style.display = "block"; 
    });

    btnProfissional.addEventListener("click", () => {
      perfilAtivo = "profissional";
      document.body.classList.add("theme-professional");
      btnProfissional.classList.add("active");
      btnPaciente.classList.remove("active");
      
      labelId.textContent = "Matrícula";
      inputId.placeholder = "Digite sua matrícula";
      inputId.value = "";
      
      if (firstTimeBox) firstTimeBox.style.display = "none"; 
    });

    inputId.addEventListener("input", function (e) {
      if (perfilAtivo === "profissional") {
        e.target.value = e.target.value.replace(/[^0-9]/g, ""); 
        return;
      }
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    // SUBMISSÃO DO LOGIN ATUALIZADA
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Verifica bloqueio
      let tentativas = parseInt(localStorage.getItem("@medtriage/tentativas") || "0");
      if (tentativas >= 5) {
        return alert("Acesso bloqueado! Você excedeu o limite de 5 tentativas erradas.");
      }

      const idDigitado = inputId.value.trim();
      const senhaDigitada = document.getElementById("senha").value;
      
      const storageKey = perfilAtivo === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      
      // 2. Verifica se o usuário existe (sem contar tentativa)
      const usuarioCadastrado = usuariosSalvos.find(u => u.id === idDigitado);
      if (!usuarioCadastrado) {
        return alert(`Erro: ${perfilAtivo === "paciente" ? "CPF" : "Matrícula"} não encontrado(a). Verifique os dados ou crie uma conta.`);
      }

      // 3. Verifica a senha (aqui sim conta a tentativa)
      const senhaHash = await hashPassword(senhaDigitada);
      
      if (usuarioCadastrado.senhaHash === senhaHash) {
        // Acertou
        localStorage.setItem("@medtriage/tentativas", "0");
        localStorage.setItem("@medtriage/sessao", JSON.stringify(usuarioCadastrado));
        
        if (perfilAtivo === "paciente") {
          window.location.href = "paciente_dashboard.html"; 
        } else {
          alert("Área do profissional em construção!");
        }
      } else {
        // Errou a senha
        tentativas++;
        localStorage.setItem("@medtriage/tentativas", tentativas.toString());
        
        if (tentativas >= 5) {
          alert("Você errou 5 vezes a senha! O acesso foi bloqueado.");
        } else {
          alert(`Erro: Senha incorreta. Você tem ${5 - tentativas} tentativas restantes.`);
        }
      }
    });
  }

  // --- TELA DE CADASTRO ---
  const formCadastro = document.getElementById("cadastro-form");
  
  if (formCadastro) {
    const inputCadastroId = document.getElementById("input-cadastro-id");
    
    inputCadastroId.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome-cadastro").value.trim();
      const idValue = inputCadastroId.value.trim();
      const senha = document.getElementById("nova-senha").value;
      const repetir = document.getElementById("repetir-senha").value;
      const email = document.getElementById("email-cadastro").value.trim();

      if (nome.length < 3) return alert("Erro: Insira seu nome completo.");
      if (senha !== repetir) return alert("Erro: As senhas não coincidem!");
      if (senha.length < 6) return alert("Erro: A senha precisa ter pelo menos 6 caracteres.");
      if (idValue.length < 14) return alert("Erro: CPF incompleto.");
      
      if (email !== "") {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) return alert("Erro: Insira um e-mail válido.");
      }

      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];

      if (usuariosSalvos.some(user => user.id === idValue)) {
        return alert("Erro: Este CPF já possui cadastro.");
      }

      const senhaHash = await hashPassword(senha);
      
      const novoUsuario = { id: idValue, nome: nome, senhaHash: senhaHash, email: email };
      
      usuariosSalvos.push(novoUsuario);
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));

      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.setItem("@medtriage/sessao", JSON.stringify(novoUsuario));
      
      alert("Conta criada com sucesso! Bem-vindo(a).");
      window.location.href = "paciente_dashboard.html"; 
    });
  }

  // --- DASHBOARD E LOGOUT ---
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("@medtriage/sessao");
      localStorage.removeItem("@medtriage/tentativas");
      window.location.replace("index.html");
    });
  }

  const welcomeTitle = document.getElementById("welcome-title");
  if (welcomeTitle) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    
    if (!sessao) {
      alert("Acesso negado. Faça login primeiro.");
      window.location.replace("index.html");
      return;
    }

    welcomeTitle.textContent = `Olá, ${sessao.nome || 'Paciente'}`;
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome || 'Paciente'}`;
    document.getElementById("info-nome").textContent = sessao.nome || "Não informado";
    document.getElementById("info-cpf").textContent = sessao.id;
    document.getElementById("info-email").textContent = sessao.email || "Não informado";
  }
});