async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Aguarda todo o HTML carregar antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  
  // Variável global que guarda qual aba está ativa no momento
  let perfilAtivo = "paciente"; 
  //OLHO DA SENHA (Mostrar/Ocultar)
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Encontra o input que está no mesmo container do botão clicado
      const wrapper = e.currentTarget.closest('.input-wrapper');
      const input = wrapper.querySelector('input');
      
      // Alterna entre texto visível e oculto
      if (input.type === "password") {
        input.type = "text";
        e.currentTarget.style.opacity = "1"; // Fica mais claro
      } else {
        input.type = "password";
        e.currentTarget.style.opacity = "0.6"; // Fica mais transparente
      }
    });
  });
  //TELA DE LOGIN
  const btnPaciente = document.getElementById("btn-paciente");
  const btnProfissional = document.getElementById("btn-profissional");
  const labelId = document.getElementById("label-id");
  const inputId = document.getElementById("input-id");
  const firstTimeBox = document.querySelector(".first-time-box");
  const linkEsqueciSenha = document.getElementById("link-esqueci-senha");

  // Verifica se estamos na página de login
  if (btnPaciente && btnProfissional) {
    
    //Sou Paciente
    btnPaciente.addEventListener("click", () => {
      perfilAtivo = "paciente";
      document.body.classList.remove("theme-professional"); // Remove cor verde
      btnPaciente.classList.add("active");
      btnProfissional.classList.remove("active");
      
      // Altera textos para Paciente
      labelId.textContent = "CPF";
      inputId.placeholder = "000.000.000-00";
      inputId.value = ""; 
      
      // Mostra a caixa "Primeira vez aqui"
      if (firstTimeBox) firstTimeBox.style.display = "block"; 
    });

    // --- EVENTO: Clicou na aba "Sou Profissional" ---
    btnProfissional.addEventListener("click", () => {
      perfilAtivo = "profissional";
      document.body.classList.add("theme-professional"); // Aplica cor verde
      btnProfissional.classList.add("active");
      btnPaciente.classList.remove("active");
      
      // Altera textos para Profissional
      labelId.textContent = "Matrícula";
      inputId.placeholder = "Digite sua matrícula";
      inputId.value = "";
      
      // Esconde a caixa Primeira vez aqui
      if (firstTimeBox) firstTimeBox.style.display = "none"; 
    });

    //MÁSCARA DE CPF e MATRÍCULA
    inputId.addEventListener("input", function (e) {
      // Se for profissional, aceita apenas números
      if (perfilAtivo === "profissional") {
        e.target.value = e.target.value.replace(/[^0-9]/g, ""); 
        return;
      }
      // Se for paciente, aplica a máscara 000.000.000-00
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    //SALVAR O PERFIL ESQUECI MINHA SENHA
    if (linkEsqueciSenha) {
      linkEsqueciSenha.addEventListener("click", () => {
        // Salva na memória do navegador qual aba o usuário estava usando
        localStorage.setItem("@medtriage/reset-perfil", perfilAtivo);
      });
    }

    //SUBMISSÃO DO FORMULÁRIO DE LOGIN
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault(); // Impede a página de recarregar

      //Verificar se o usuário já está bloqueado
      let tentativas = parseInt(localStorage.getItem("@medtriage/tentativas") || "0");
      
      if (tentativas >= 5) {
        // Se está bloqueado, pergunta se ele quer redefinir a senha
        const querRedefinir = confirm("Acesso bloqueado! Você excedeu o limite de 5 tentativas erradas.\n\nDeseja redefinir sua senha agora?");
        if (querRedefinir) {
          localStorage.setItem("@medtriage/reset-perfil", perfilAtivo);
          window.location.href = "recuperar_senha.html";
        }
        return; // Para a execução aqui
      }

      //Capturar os dados digitados
      const idDigitado = inputId.value.trim();
      const senhaDigitada = document.getElementById("senha").value;
      
      //Escolher qual "banco de dados" consultar
      const storageKey = perfilAtivo === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      
      //Verificar se o usuário (CPF/Matrícula) existe
      const usuarioCadastrado = usuariosSalvos.find(u => u.id === idDigitado);
      
      if (!usuarioCadastrado) {
        // Se não existe, avisa e NÃO conta tentativa
        return alert(`Erro: ${perfilAtivo === "paciente" ? "CPF" : "Matrícula"} não encontrado(a). Verifique os dados ou crie uma conta.`);
      }

      // 5º Passo: O usuário existe, então vamos verificar a senha
      const senhaHash = await hashPassword(senhaDigitada);
      
      if (usuarioCadastrado.senhaHash === senhaHash) {
        // --- SUCESSO NO LOGIN ---
        localStorage.setItem("@medtriage/tentativas", "0"); // Zera as tentativas
        localStorage.setItem("@medtriage/sessao", JSON.stringify(usuarioCadastrado)); // Salva a sessão
        
        if (perfilAtivo === "paciente") {
          window.location.href = "paciente_dashboard.html"; 
        } else {
          alert("Área do profissional em construção!");
        }
      } else {
        // --- FALHA NA SENHA (Usuário existe, mas senha errada) ---
        tentativas++;
        localStorage.setItem("@medtriage/tentativas", tentativas.toString());
        
        if (tentativas >= 5) {
          alert("Você errou 5 vezes! O acesso foi bloqueado. Clique em OK e tente novamente para redefinir sua senha.");
        } else {
          alert(`Erro: Senha incorreta. Você tem ${5 - tentativas} tentativas restantes.`);
        }
      }
    });
  }

  //TELA DE CADASTRO Paciente
  const formCadastro = document.getElementById("cadastro-form");
  if (formCadastro) {
    const inputCadastroId = document.getElementById("input-cadastro-id");
    
    // Máscara de CPF no cadastro
    inputCadastroId.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    // Submissão do Cadastro
    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Captura dos dados
      const nome = document.getElementById("nome-cadastro").value.trim();
      const idValue = inputCadastroId.value.trim();
      const senha = document.getElementById("nova-senha").value;
      const repetir = document.getElementById("repetir-senha").value;
      const email = document.getElementById("email-cadastro").value.trim();

      // Validações
      if (nome.length < 3) return alert("Erro: Insira seu nome completo.");
      if (senha !== repetir) return alert("Erro: As senhas não coincidem!");
      if (senha.length < 6) return alert("Erro: A senha precisa ter pelo menos 6 caracteres.");
      if (idValue.length < 14) return alert("Erro: CPF incompleto.");
      
      if (email !== "") {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) return alert("Erro: Insira um e-mail válido.");
      }

      // Consulta no banco de pacientes
      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];

      if (usuariosSalvos.some(user => user.id === idValue)) {
        return alert("Erro: Este CPF já possui cadastro.");
      }

      // Criptografa a senha e salva
      const senhaHash = await hashPassword(senha);
      const novoUsuario = { id: idValue, nome: nome, senhaHash: senhaHash, email: email };
      
      usuariosSalvos.push(novoUsuario);
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));

      // LOGIN AUTOMÁTICO APÓS CADASTRO
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.setItem("@medtriage/sessao", JSON.stringify(novoUsuario));
      
      alert("Conta criada com sucesso! Bem-vindo(a).");
      window.location.href = "paciente_dashboard.html"; 
    });
  }


  //RECUPERAÇÃO DE SENHA
  const formRecuperar = document.getElementById("recuperar-form");
  if (formRecuperar) {
    // Recupera o perfil que foi salvo antes de vir para cá
    const perfilReset = localStorage.getItem("@medtriage/reset-perfil") || "paciente";
    
    // Ajusta a tela de acordo com o perfil
    const labelRecuperar = document.getElementById("label-recuperar-id");
    const inputRecuperar = document.getElementById("input-recuperar-id");
    
    if (perfilReset === "profissional") {
      document.body.classList.add("theme-professional");
      labelRecuperar.textContent = "Matrícula";
      inputRecuperar.placeholder = "Digite sua matrícula";
    } else {
      labelRecuperar.textContent = "CPF";
      inputRecuperar.placeholder = "000.000.000-00";
      
      // Aplica máscara de CPF
      inputRecuperar.addEventListener("input", function(e) {
        let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = valor;
      });
    }

    // Submissão da nova senha
    formRecuperar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const idRecuperar = document.getElementById("input-recuperar-id").value.trim();
      const novaSenha = document.getElementById("nova-senha-recuperar").value;
      const repetirSenha = document.getElementById("repetir-senha-recuperar").value;

      if (novaSenha !== repetirSenha) return alert("Erro: As senhas não coincidem!");
      if (novaSenha.length < 6) return alert("Erro: A senha precisa ter pelo menos 6 caracteres.");

      const storageKey = perfilReset === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];

      const indexUsuario = usuariosSalvos.findIndex(u => u.id === idRecuperar);
      
      if (indexUsuario === -1) {
        return alert(`Erro: ${perfilReset === "paciente" ? "CPF" : "Matrícula"} não encontrado. Verifique os dados.`);
      }

      // Atualiza a senha com o novo Hash
      const novoHash = await hashPassword(novaSenha);
      usuariosSalvos[indexUsuario].senhaHash = novoHash;
      
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      
      // Reseta as tentativas e limpa o perfil temporário
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.removeItem("@medtriage/reset-perfil"); 

      alert("Senha redefinida com sucesso! Você já pode fazer login com a nova senha.");
      window.location.href = "index.html";
    });
  }
  //Botão Sair e Exibição de Dados
  // Botão Sair
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("@medtriage/sessao");
      localStorage.removeItem("@medtriage/tentativas");
      window.location.replace("index.html");
    });
  }

  // Exibição de dados
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