// Utilitário de segurança (Hash SHA-256)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  
  let perfilAtivo = "paciente"; 

  // --- LÓGICA DO OLHO DA SENHA ---
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
  const linkEsqueciSenha = document.getElementById("link-esqueci-senha");

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

    if (linkEsqueciSenha) {
      linkEsqueciSenha.addEventListener("click", () => {
        localStorage.setItem("@medtriage/reset-perfil", perfilAtivo);
      });
    }

    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      let tentativas = parseInt(localStorage.getItem("@medtriage/tentativas") || "0");
      if (tentativas >= 5) {
        const querRedefinir = confirm("Acesso bloqueado! Você excedeu o limite de 5 tentativas erradas.\n\nDeseja redefinir sua senha agora?");
        if (querRedefinir) {
          localStorage.setItem("@medtriage/reset-perfil", perfilAtivo);
          window.location.href = "recuperar_senha.html";
        }
        return;
      }

      const idDigitado = inputId.value.trim();
      const senhaDigitada = document.getElementById("senha").value;
      const storageKey = perfilAtivo === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      
      const usuarioCadastrado = usuariosSalvos.find(u => u.id === idDigitado);
      if (!usuarioCadastrado) {
        return alert(`Erro: ${perfilAtivo === "paciente" ? "CPF" : "Matrícula"} não encontrado(a).`);
      }

      const senhaHash = await hashPassword(senhaDigitada);
      
      if (usuarioCadastrado.senhaHash === senhaHash) {
        localStorage.setItem("@medtriage/tentativas", "0");
        localStorage.setItem("@medtriage/sessao", JSON.stringify(usuarioCadastrado));
        if (perfilAtivo === "paciente") {
          window.location.href = "paciente_dashboard.html"; 
        } else {
          alert("Área do profissional em construção!");
        }
      } else {
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
      // Adiciona os campos vazios para o prontuário futuro
      const novoUsuario = { 
        id: idValue, 
        nome: nome, 
        senhaHash: senhaHash, 
        email: email,
        nascimento: "",
        sexo: "",
        genero: "",
        peso: "",
        altura: "",
        doencas: [],
        deficiencias: []
      };
      
      usuariosSalvos.push(novoUsuario);
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));

      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.setItem("@medtriage/sessao", JSON.stringify(novoUsuario));
      
      alert("Conta criada com sucesso! Bem-vindo(a).");
      window.location.href = "paciente_dashboard.html"; 
    });
  }

  // --- TELA DE RECUPERAÇÃO DE SENHA ---
  const formRecuperar = document.getElementById("recuperar-form");
  if (formRecuperar) {
    const perfilReset = localStorage.getItem("@medtriage/reset-perfil") || "paciente";
    const labelRecuperar = document.getElementById("label-recuperar-id");
    const inputRecuperar = document.getElementById("input-recuperar-id");
    
    if (perfilReset === "profissional") {
      document.body.classList.add("theme-professional");
      labelRecuperar.textContent = "Matrícula";
      inputRecuperar.placeholder = "Digite sua matrícula";
    } else {
      labelRecuperar.textContent = "CPF";
      inputRecuperar.placeholder = "000.000.000-00";
      inputRecuperar.addEventListener("input", function(e) {
        let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = valor;
      });
    }

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
        return alert(`Erro: ${perfilReset === "paciente" ? "CPF" : "Matrícula"} não encontrado.`);
      }

      const novoHash = await hashPassword(novaSenha);
      usuariosSalvos[indexUsuario].senhaHash = novoHash;
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.removeItem("@medtriage/reset-perfil"); 

      alert("Senha redefinida com sucesso!");
      window.location.href = "index.html";
    });
  }

  // --- LÓGICA DO DASHBOARD E LOGOUT ---
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
    
    // Se os elementos de dados existirem no dashboard (que agora não existem mais, mas mantemos por segurança)
    if(document.getElementById("info-nome")) {
      document.getElementById("info-nome").textContent = sessao.nome || "Não informado";
      document.getElementById("info-cpf").textContent = sessao.id;
      document.getElementById("info-email").textContent = sessao.email || "Não informado";
    }
  }

  // --- LÓGICA DA TELA "MEUS DADOS" ---
  const formMeusDados = document.getElementById("form-meus-dados");
  if (formMeusDados) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    
    if (!sessao) {
      alert("Acesso negado. Faça login primeiro.");
      window.location.replace("index.html");
      return;
    }

    // Preenche os campos com os dados do LocalStorage
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    document.getElementById("dados-nome").value = sessao.nome || "";
    document.getElementById("dados-cpf").value = sessao.id || ""; // CPF fixo
    document.getElementById("dados-email").value = sessao.email || "";
    document.getElementById("dados-nascimento").value = sessao.nascimento || "";
    document.getElementById("dados-sexo").value = sessao.sexo || "";
    document.getElementById("dados-genero").value = sessao.genero || "";
    document.getElementById("dados-peso").value = sessao.peso || "";
    document.getElementById("dados-altura").value = sessao.altura || "";

    // Preenche os checkboxes de doenças
    const checkboxesDoencas = document.querySelectorAll(".check-doenca");
    checkboxesDoencas.forEach(cb => {
      cb.checked = (sessao.doencas || []).includes(cb.value);
    });

    // Preenche os checkboxes de deficiências
    const checkboxesDeficiencias = document.querySelectorAll(".check-deficiencia");
    checkboxesDeficiencias.forEach(cb => {
      cb.checked = (sessao.deficiencias || []).includes(cb.value);
    });

    // Lógica para Salvar as Alterações
    formMeusDados.addEventListener("submit", (e) => {
      e.preventDefault();

      // Coleta todos os dados do formulário
      const nome = document.getElementById("dados-nome").value.trim();
      const email = document.getElementById("dados-email").value.trim();
      const nascimento = document.getElementById("dados-nascimento").value;
      const sexo = document.getElementById("dados-sexo").value;
      const genero = document.getElementById("dados-genero").value;
      const peso = document.getElementById("dados-peso").value;
      const altura = document.getElementById("dados-altura").value;

      // Coleta checkboxes marcados de doenças
      const doencasMarcadas = Array.from(checkboxesDoencas)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      
      // Remove "Nenhuma" se outras foram marcadas
      if (doencasMarcadas.length > 1) {
        const indexNenhuma = doencasMarcadas.indexOf("Nenhuma");
        if (indexNenhuma > -1) doencasMarcadas.splice(indexNenhuma, 1);
      }

      // Coleta checkboxes marcados de deficiências
      const deficienciasMarcadas = Array.from(checkboxesDeficiencias)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (deficienciasMarcadas.length > 1) {
        const indexNenhuma = deficienciasMarcadas.indexOf("Nenhuma");
        if (indexNenhuma > -1) deficienciasMarcadas.splice(indexNenhuma, 1);
      }

      // Atualiza o objeto da sessão atual
      const sessaoAtualizada = {
        ...sessao,
        nome: nome,
        email: email,
        nascimento: nascimento,
        sexo: sexo,
        genero: genero,
        peso: peso,
        altura: altura,
        doencas: doencasMarcadas,
        deficiencias: deficienciasMarcadas
      };

      // Atualiza o banco de dados geral (LocalStorage)
      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      const index = usuariosSalvos.findIndex(u => u.id === sessao.id);
      
      if (index !== -1) {
        usuariosSalvos[index] = sessaoAtualizada;
        localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      }

      // Atualiza a sessão ativa com os novos dados
      localStorage.setItem("@medtriage/sessao", JSON.stringify(sessaoAtualizada));

      alert("Dados salvos com sucesso!");
      window.location.href = "paciente_dashboard.html"; // Volta para o painel
    });
  }
});