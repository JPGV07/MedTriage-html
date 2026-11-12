// Utilitário de segurança (Hash SHA-256)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Banco de dados simulado de médicos
const dbMedicos = [
  // Oftalmologistas
  { id: 1, nome: "Dr. Carlos Silva", especialidade: "Oftalmologista", cidade: "João Pessoa", crm: "CRM-PB 12345", matricula: "MED1001", senha: "senha123", rating: 4.9, avaliacoes: 35, preco: "R$ 250,00", rua: "Av. Epitácio Pessoa, 1000" },
  { id: 2, nome: "Dra. Beatriz Nogueira", especialidade: "Oftalmologista", cidade: "Campina Grande", crm: "CRM-PB 12346", matricula: "MED1002", senha: "senha123", rating: 4.8, avaliacoes: 22, preco: "R$ 240,00", rua: "Rua Maciel Pinheiro, 150" },
  
  // Cardiologistas
  { id: 3, nome: "Dra. Ana Costa", especialidade: "Cardiologista", cidade: "João Pessoa", crm: "CRM-PB 54321", matricula: "MED2001", senha: "senha123", rating: 4.9, avaliacoes: 50, preco: "R$ 300,00", rua: "Rua das Palmeiras, 450" },
  { id: 4, nome: "Dr. Ricardo Dias", especialidade: "Cardiologista", cidade: "Campina Grande", crm: "CRM-PB 54322", matricula: "MED2002", senha: "senha123", rating: 4.7, avaliacoes: 18, preco: "R$ 280,00", rua: "Av. Marechal Floriano, 300" },
  
  // Dermatologistas
  { id: 5, nome: "Dr. Roberto Alves", especialidade: "Dermatologista", cidade: "João Pessoa", crm: "CRM-PB 98765", matricula: "MED3001", senha: "senha123", rating: 4.8, avaliacoes: 30, preco: "R$ 200,00", rua: "Av. Nossa Senhora de Lourdes, 200" },
  { id: 6, nome: "Dra. Camila Ferreira", especialidade: "Dermatologista", cidade: "Campina Grande", crm: "CRM-PB 98766", matricula: "MED3002", senha: "senha123", rating: 4.6, avaliacoes: 12, preco: "R$ 190,00", rua: "Rua Treze de Maio, 80" },
  
  // Clínicos Gerais
  { id: 7, nome: "Dra. Juliana Mendes", especialidade: "Clínico geral", cidade: "João Pessoa", crm: "CRM-PB 11122", matricula: "MED4001", senha: "senha123", rating: 4.9, avaliacoes: 60, preco: "R$ 150,00", rua: "Rua da Areia, 300" },
  { id: 8, nome: "Dr. Paulo Henrique", especialidade: "Clínico geral", cidade: "Campina Grande", crm: "CRM-PB 11123", matricula: "MED4002", senha: "senha123", rating: 4.7, avaliacoes: 25, preco: "R$ 140,00", rua: "Rua Venâncio Neiva, 500" }
];

document.addEventListener("DOMContentLoaded", async () => {
  
  let perfilAtivo = "paciente"; 

  // Semeia o banco de profissionais se ele estiver vazio para permitir testes de login
  const profissionaisSalvos = JSON.parse(localStorage.getItem("@medtriage/profissionais"));
  if (!profissionaisSalvos || profissionaisSalvos.length === 0) {
    const profissionaisParaSalvar = [];
    for (const med of dbMedicos) {
      const hash = await hashPassword(med.senha);
      profissionaisParaSalvar.push({ 
        id: med.matricula, 
        nome: med.nome, 
        senhaHash: hash,
        crm: med.crm,
        especialidade: med.especialidade
      });
    }
    localStorage.setItem("@medtriage/profissionais", JSON.stringify(profissionaisParaSalvar));
  }

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

  // Tela de Login
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
        return alert(`Erro: ${perfilAtivo === "paciente" ? "CPF" : "Matrícula"} não encontrado(a). Verifique os dados ou crie uma conta.`);
      }

      const senhaHash = await hashPassword(senhaDigitada);
      
      if (usuarioCadastrado.senhaHash === senhaHash) {
        localStorage.setItem("@medtriage/tentativas", "0");
        localStorage.setItem("@medtriage/sessao", JSON.stringify(usuarioCadastrado));
        if (perfilAtivo === "paciente") {
          window.location.href = "paciente_dashboard.html"; 
        } else {
          // Futuramente, redirecionar para o dashboard do médico
          alert(`Bem-vindo(a), ${usuarioCadastrado.nome}! Área do profissional em construção.`);
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

  // Tela de Cadastro
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
      
      const novoUsuario = { 
        id: idValue, nome: nome, senhaHash: senhaHash, email: email,
        nascimento: "", sexo: "", genero: "", peso: "", altura: "", doencas: [], deficiencias: []
      };
      
      usuariosSalvos.push(novoUsuario);
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));

      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.setItem("@medtriage/sessao", JSON.stringify(novoUsuario));
      
      alert("Conta criada com sucesso! Bem-vindo(a).");
      window.location.href = "paciente_dashboard.html"; 
    });
  }

  // Tela de Recuperação de Senha
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
        return alert(`Erro: ${perfilReset === "paciente" ? "CPF" : "Matrícula"} não encontrado. Verifique os dados.`);
      }

      const novoHash = await hashPassword(novaSenha);
      usuariosSalvos[indexUsuario].senhaHash = novoHash;
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.removeItem("@medtriage/reset-perfil"); 

      alert("Senha redefinida com sucesso! Você já pode fazer login com a nova senha.");
      window.location.href = "index.html";
    });
  }

  // Dashboard e Logout
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
    
    if(document.getElementById("info-nome")) {
      document.getElementById("info-nome").textContent = sessao.nome || "Não informado";
      document.getElementById("info-cpf").textContent = sessao.id;
      document.getElementById("info-email").textContent = sessao.email || "Não informado";
    }
  }

  // Tela de Meus Dados
  const formMeusDados = document.getElementById("form-meus-dados");
  if (formMeusDados) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    
    if (!sessao) {
      alert("Acesso negado. Faça login primeiro.");
      window.location.replace("index.html");
      return;
    }

    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    document.getElementById("dados-nome").value = sessao.nome || "";
    document.getElementById("dados-cpf").value = sessao.id || "";
    document.getElementById("dados-email").value = sessao.email || "";
    document.getElementById("dados-nascimento").value = sessao.nascimento || "";
    document.getElementById("dados-sexo").value = sessao.sexo || "";
    document.getElementById("dados-genero").value = sessao.genero || "";
    document.getElementById("dados-peso").value = sessao.peso || "";
    document.getElementById("dados-altura").value = sessao.altura || "";

    const checkboxesDoencas = document.querySelectorAll(".check-doenca");
    checkboxesDoencas.forEach(cb => {
      cb.checked = (sessao.doencas || []).includes(cb.value);
    });

    const checkboxesDeficiencias = document.querySelectorAll(".check-deficiencia");
    checkboxesDeficiencias.forEach(cb => {
      cb.checked = (sessao.deficiencias || []).includes(cb.value);
    });

    formMeusDados.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("dados-nome").value.trim();
      const email = document.getElementById("dados-email").value.trim();
      const nascimento = document.getElementById("dados-nascimento").value;
      const sexo = document.getElementById("dados-sexo").value;
      const genero = document.getElementById("dados-genero").value;
      const peso = document.getElementById("dados-peso").value;
      const altura = document.getElementById("dados-altura").value;

      const doencasMarcadas = Array.from(checkboxesDoencas).filter(cb => cb.checked).map(cb => cb.value);
      if (doencasMarcadas.length > 1) {
        const indexNenhuma = doencasMarcadas.indexOf("Nenhuma");
        if (indexNenhuma > -1) doencasMarcadas.splice(indexNenhuma, 1);
      }

      const deficienciasMarcadas = Array.from(checkboxesDeficiencias).filter(cb => cb.checked).map(cb => cb.value);
      if (deficienciasMarcadas.length > 1) {
        const indexNenhuma = deficienciasMarcadas.indexOf("Nenhuma");
        if (indexNenhuma > -1) deficienciasMarcadas.splice(indexNenhuma, 1);
      }

      const sessaoAtualizada = {
        ...sessao,
        nome, email, nascimento, sexo, genero, peso, altura,
        doencas: doencasMarcadas,
        deficiencias: deficienciasMarcadas
      };

      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      const index = usuariosSalvos.findIndex(u => u.id === sessao.id);
      
      if (index !== -1) {
        usuariosSalvos[index] = sessaoAtualizada;
        localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      }

      localStorage.setItem("@medtriage/sessao", JSON.stringify(sessaoAtualizada));

      alert("Dados salvos com sucesso!");
      window.location.href = "paciente_dashboard.html";
    });
  }

  // Tela de Busca de Especialistas
  const listaMedicos = document.getElementById("lista-medicos");
  if (listaMedicos) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) {
      alert("Acesso negado. Faça login primeiro.");
      window.location.replace("index.html");
      return;
    }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const filtroEspecialidade = document.getElementById("filtro-especialidade");
    const filtroCidade = document.getElementById("filtro-cidade");
    const btnBuscar = document.getElementById("btn-buscar");
    const tituloResultados = document.getElementById("titulo-resultados");

    const renderizarMedicos = (medicos) => {
      listaMedicos.innerHTML = "";
      tituloResultados.textContent = `${medicos.length} médicos encontrados`;

      if (medicos.length === 0) {
        listaMedicos.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Nenhum médico encontrado com esses filtros.</p>";
        return;
      }

      medicos.forEach(medico => {
        const card = document.createElement("div");
        card.className = "doctor-card";
        card.innerHTML = `
          <div class="doctor-info">
            <div class="doctor-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="doctor-details">
              <h3>${medico.nome}</h3>
              <p class="specialty">${medico.especialidade} · ${medico.crm} · Matrícula: ${medico.matricula}</p>
              <p class="rating">★ ${medico.rating} · <span style="color: var(--text-muted); font-weight: 400;">${medico.avaliacoes} opiniões</span></p>
              <p class="location">${medico.rua}, ${medico.cidade}</p>
            </div>
          </div>
          <div class="doctor-action">
            <p class="price">A partir de ${medico.preco}</p>
            <button class="btn btn-primary" onclick="alert('Próxima etapa: Escolher data e horário com ${medico.nome}')">Agendar Consulta</button>
          </div>
        `;
        listaMedicos.appendChild(card);
      });
    };

    btnBuscar.addEventListener("click", () => {
      const esp = filtroEspecialidade.value;
      const cid = filtroCidade.value;

      const filtrados = dbMedicos.filter(m => {
        const matchEsp = esp === "Todas" || m.especialidade === esp;
        const matchCid = m.cidade === cid;
        return matchEsp && matchCid;
      });

      renderizarMedicos(filtrados);
    });

    // Renderiza os médicos de João Pessoa por padrão ao carregar a tela
    renderizarMedicos(dbMedicos.filter(m => m.cidade === "João Pessoa"));
  }
});