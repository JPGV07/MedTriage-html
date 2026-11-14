// Utilitário de segurança (Hash SHA-256)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Gera ID de data no formato YYYY-MM-DD usando horário LOCAL
function gerarIdDataLocal(ano, mes, dia) {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Banco de dados estático de médicos
const dbMedicos = [
  { id: 1, nome: "Dr. Carlos Silva", especialidade: "Oftalmologista", cidade: "João Pessoa", crm: "CRM-PB 12345", matricula: "MED1001", senha: "senha123", rating: 4.9, avaliacoes: 35, preco: "R$ 250,00", precoTeleconsulta: "R$ 180,00", rua: "Av. Epitácio Pessoa, 1000", bio: "Médico oftalmologista com 15 anos de experiência em cirurgias de catarata e refrativas." },
  { id: 2, nome: "Dra. Beatriz Nogueira", especialidade: "Oftalmologista", cidade: "Campina Grande", crm: "CRM-PB 12346", matricula: "MED1002", senha: "senha123", rating: 4.8, avaliacoes: 22, preco: "R$ 240,00", precoTeleconsulta: "R$ 170,00", rua: "Rua Maciel Pinheiro, 150", bio: "Especialista em doenças da retina e glaucoma." },
  { id: 3, nome: "Dra. Ana Costa", especialidade: "Cardiologista", cidade: "João Pessoa", crm: "CRM-PB 54321", matricula: "MED2001", senha: "senha123", rating: 4.9, avaliacoes: 50, preco: "R$ 300,00", precoTeleconsulta: "R$ 220,00", rua: "Rua das Palmeiras, 450", bio: "Cardiologista intervencionista." },
  { id: 4, nome: "Dr. Ricardo Dias", especialidade: "Cardiologista", cidade: "Campina Grande", crm: "CRM-PB 54322", matricula: "MED2002", senha: "senha123", rating: 4.7, avaliacoes: 18, preco: "R$ 280,00", precoTeleconsulta: "R$ 200,00", rua: "Av. Marechal Floriano, 300", bio: "Especialista em arritmias cardíacas." },
  { id: 5, nome: "Dr. Roberto Alves", especialidade: "Dermatologista", cidade: "João Pessoa", crm: "CRM-PB 98765", matricula: "MED3001", senha: "senha123", rating: 4.8, avaliacoes: 30, preco: "R$ 200,00", precoTeleconsulta: "R$ 150,00", rua: "Av. Nossa Senhora de Lourdes, 200", bio: "Dermatologista clínico e estético." },
  { id: 6, nome: "Dra. Camila Ferreira", especialidade: "Dermatologista", cidade: "Campina Grande", crm: "CRM-PB 98766", matricula: "MED3002", senha: "senha123", rating: 4.6, avaliacoes: 12, preco: "R$ 190,00", precoTeleconsulta: "R$ 140,00", rua: "Rua Treze de Maio, 80", bio: "Dermatologia pediátrica." },
  { id: 7, nome: "Dra. Juliana Mendes", especialidade: "Clínico geral", cidade: "João Pessoa", crm: "CRM-PB 11122", matricula: "MED4001", senha: "senha123", rating: 4.9, avaliacoes: 60, preco: "R$ 150,00", precoTeleconsulta: "R$ 120,00", rua: "Rua da Areia, 300", bio: "Clínica geral holística." },
  { id: 8, nome: "Dr. Paulo Henrique", especialidade: "Clínico geral", cidade: "Campina Grande", crm: "CRM-PB 11123", matricula: "MED4002", senha: "senha123", rating: 4.7, avaliacoes: 25, preco: "R$ 140,00", precoTeleconsulta: "R$ 110,00", rua: "Rua Venâncio Neiva, 500", bio: "Geriatria e doenças crônicas." }
];

const dbPacientesTabela = [
  { nome: "Maria da Silva", cpf: "123.***.**-**", ultimoAtendimento: "15/10/2023" },
  { nome: "José Almeida", cpf: "456.***.**-**", ultimoAtendimento: "10/10/2023" },
  { nome: "Ana Souza", cpf: "789.***.**-**", ultimoAtendimento: "05/10/2023" },
  { nome: "Carlos Pereira", cpf: "321.***.**-**", ultimoAtendimento: "28/09/2023" }
];

function extrairValorNumerico(precoString) {
  if (!precoString) return 0;
  return parseFloat(precoString.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
}

function menorPreco(medico) {
  const valorPresencial = extrairValorNumerico(medico.preco);
  const valorTeleconsulta = extrairValorNumerico(medico.precoTeleconsulta);
  const menor = Math.min(valorPresencial, valorTeleconsulta);
  return `R$ ${menor.toFixed(2).replace(".", ",")}`;
}

function obterMedicosAtualizados() {
  const profissionaisSalvos = JSON.parse(localStorage.getItem("@medtriage/profissionais")) || [];
  return dbMedicos.map(medicoEstatico => {
    const medicoAtualizado = profissionaisSalvos.find(p => p.id === medicoEstatico.matricula);
    if (medicoAtualizado) {
      return {
        ...medicoEstatico,
        nome: medicoAtualizado.nome || medicoEstatico.nome,
        cidade: medicoAtualizado.cidade || medicoEstatico.cidade,
        rua: medicoAtualizado.rua || medicoEstatico.rua,
        preco: medicoAtualizado.preco || medicoEstatico.preco,
        precoTeleconsulta: medicoAtualizado.precoTeleconsulta || medicoEstatico.precoTeleconsulta
      };
    }
    return medicoEstatico;
  });
}

// Funções globais
window.salvarMedicoSelecionado = function(matricula) {
  localStorage.setItem("@medtriage/medico-selecionado", matricula);
  window.location.href = "perfil_medico.html";
};

window.abrirDetalhes = function(idConsulta) {
  localStorage.setItem("@medtriage/consulta-selecionada", idConsulta);
  window.location.href = "detalhes_consulta.html";
};

// Abrir histórico de um paciente (visão do médico)
window.abrirHistoricoPaciente = function(nome, cpf) {
  localStorage.setItem("@medtriage/historico-paciente", JSON.stringify({ nome, cpf }));
  window.location.href = "medico_historico.html";
};

// Iniciar atendimento: pega a próxima consulta "Aguardando" do médico logado
window.iniciarAtendimento = function() {
  const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
  if (!sessao) return;
  
  const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
  const consultasDoMedico = consultas.filter(c => c.medicoMatricula === sessao.id && c.status === "Aguardando");
  
  if (consultasDoMedico.length === 0) {
    alert("Nenhuma consulta aguardando atendimento no momento.");
    return;
  }
  
  const proximaConsulta = consultasDoMedico[0];
  localStorage.setItem("@medtriage/consulta-atendimento", proximaConsulta.id);
  window.location.href = "atendimento.html";
};

document.addEventListener("DOMContentLoaded", async () => {
  
  let perfilAtivo = "paciente"; 

  // Semeia o banco de profissionais
  const profissionaisSalvos = JSON.parse(localStorage.getItem("@medtriage/profissionais"));
  if (!profissionaisSalvos || profissionaisSalvos.length === 0) {
    const profissionaisParaSalvar = [];
    for (const med of dbMedicos) {
      const hash = await hashPassword(med.senha);
      profissionaisParaSalvar.push({ 
        id: med.matricula, nome: med.nome, senhaHash: hash, crm: med.crm, 
        especialidade: med.especialidade, cidade: med.cidade, rua: med.rua, 
        preco: med.preco, precoTeleconsulta: med.precoTeleconsulta
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
      if (input.type === "password") { input.type = "text"; e.currentTarget.style.opacity = "1"; }
      else { input.type = "password"; e.currentTarget.style.opacity = "0.6"; }
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
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(); 
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
        window.location.href = perfilAtivo === "paciente" ? "paciente_dashboard.html" : "medico_dashboard.html"; 
      } else {
        tentativas++;
        localStorage.setItem("@medtriage/tentativas", tentativas.toString());
        if (tentativas >= 5) alert("Você errou 5 vezes! O acesso foi bloqueado.");
        else alert(`Erro: Senha incorreta. Você tem ${5 - tentativas} tentativas restantes.`);
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
      if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Erro: E-mail inválido.");
      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      if (usuariosSalvos.some(user => user.id === idValue)) return alert("Erro: Este CPF já possui cadastro.");
      const senhaHash = await hashPassword(senha);
      const novoUsuario = { id: idValue, nome, senhaHash, email, telefone: "", nascimento: "", sexo: "", genero: "", peso: "", altura: "", doencas: [], deficiencias: [] };
      usuariosSalvos.push(novoUsuario);
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.setItem("@medtriage/sessao", JSON.stringify(novoUsuario));
      alert("Conta criada com sucesso!");
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
      inputRecuperar.addEventListener("input", function(e) {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      });
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
      if (novaSenha.length < 6) return alert("Erro: A senha é muito curta.");
      const storageKey = perfilReset === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      const indexUsuario = usuariosSalvos.findIndex(u => u.id === idRecuperar);
      if (indexUsuario === -1) return alert(`Erro: ${perfilReset === "paciente" ? "CPF" : "Matrícula"} não encontrado.`);
      const novoHash = await hashPassword(novaSenha);
      usuariosSalvos[indexUsuario].senhaHash = novoHash;
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.removeItem("@medtriage/reset-perfil"); 
      alert("Senha redefinida com sucesso!");
      window.location.href = "index.html";
    });
  }

  // Botão Logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("@medtriage/sessao");
      localStorage.removeItem("@medtriage/tentativas");
      window.location.replace("index.html");
    });
  }

  // Tela Dashboard do Paciente
  const welcomeTitle = document.getElementById("welcome-title");
  if (welcomeTitle && window.location.pathname.includes("paciente_dashboard")) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || sessao.id.includes("MED")) {
      alert("Acesso negado. Faça login como paciente.");
      window.location.replace("index.html");
      return;
    }
    welcomeTitle.textContent = `Olá, ${sessao.nome || 'Paciente'}`;
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome || 'Paciente'}`;

    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const minhasConsultas = consultasSalvas.filter(c => c.pacienteId === sessao.id && c.status !== "Cancelada");

    const cardComConsulta = document.getElementById("card-com-consulta");
    const cardSemConsulta = document.getElementById("card-sem-consulta");
    const containerMultiplas = document.getElementById("multiplas-consultas");
    const listaConsultas = document.getElementById("lista-consultas-dashboard");

    if (minhasConsultas.length === 0) {
      cardComConsulta.style.display = "none";
      if (containerMultiplas) containerMultiplas.style.display = "none";
      cardSemConsulta.style.display = "flex";
    } else if (minhasConsultas.length === 1) {
      cardSemConsulta.style.display = "none";
      if (containerMultiplas) containerMultiplas.style.display = "none";
      cardComConsulta.style.display = "flex";
      const unica = minhasConsultas[0];
      document.getElementById("appointment-date").textContent = `${unica.dataFormatada} às ${unica.horario}`;
      document.getElementById("appointment-doctor").textContent = `${unica.medicoNome} • ${unica.especialidade}`;
      document.getElementById("appointment-location").textContent = unica.tipo === "Teleconsulta" ? "Teleconsulta (online)" : unica.endereco;
      document.getElementById("btn-ver-detalhes").addEventListener("click", () => {
        localStorage.setItem("@medtriage/consulta-selecionada", unica.id);
        window.location.href = "detalhes_consulta.html";
      });
    } else {
      cardSemConsulta.style.display = "none";
      cardComConsulta.style.display = "none";
      if (containerMultiplas) {
        containerMultiplas.style.display = "block";
        listaConsultas.innerHTML = "";
        minhasConsultas.forEach(consulta => {
          const card = document.createElement("div");
          card.className = "consulta-item-card";
          card.innerHTML = `
            <div class="consulta-item-info">
              <h3>${consulta.medicoNome} • ${consulta.especialidade}</h3>
              <p><strong>${consulta.dataFormatada}</strong> às ${consulta.horario}</p>
              <p>${consulta.tipo === "Teleconsulta" ? "Teleconsulta (online)" : consulta.endereco}</p>
            </div>
            <button class="btn btn-primary" style="width: auto;" onclick="abrirDetalhes(${consulta.id})">Gerenciar</button>
          `;
          listaConsultas.appendChild(card);
        });
      }
    }
  }

  // Tela de Detalhes da Consulta
  const detalheData = document.getElementById("detalhe-data");
  if (detalheData) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const idConsulta = parseInt(localStorage.getItem("@medtriage/consulta-selecionada"));
    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const consulta = consultasSalvas.find(c => c.id === idConsulta);

    if (!consulta) {
      alert("Consulta não encontrada.");
      window.location.replace("paciente_dashboard.html");
      return;
    }

    document.getElementById("detalhe-data").textContent = `${consulta.dataFormatada} às ${consulta.horario}`;
    document.getElementById("detalhe-medico").textContent = consulta.medicoNome;
    document.getElementById("detalhe-servico").textContent = consulta.especialidade;
    document.getElementById("detalhe-local").textContent = consulta.tipo === "Teleconsulta" ? "Online" : consulta.endereco;
    document.getElementById("detalhe-tipo").textContent = consulta.tipo;
    document.getElementById("detalhe-valor").textContent = consulta.valor;
    document.getElementById("detalhe-convenio").textContent = consulta.convenio;
    document.getElementById("detalhe-confirmacao").textContent = consulta.metodoConfirmacao === "email" ? "Por e-mail" : "Por WhatsApp";

    const badgeStatus = document.getElementById("detalhe-status");
    if (consulta.status === "Cancelada") {
      badgeStatus.textContent = "Cancelada";
      badgeStatus.style.background = "#FEE2E2";
      badgeStatus.style.color = "#991B1B";
    } else if (consulta.status === "Realizada") {
      badgeStatus.textContent = "Realizada";
      badgeStatus.style.background = "#DCFCE7";
      badgeStatus.style.color = "#166534";
    } else {
      badgeStatus.textContent = "Em aguardo";
    }

    document.getElementById("btn-reagendar").addEventListener("click", () => {
      localStorage.setItem("@medtriage/consulta-reagendar", consulta.id);
      window.location.href = "reagendar_consulta.html";
    });

    document.getElementById("btn-cancelar").addEventListener("click", () => {
      localStorage.setItem("@medtriage/consulta-cancelar", consulta.id);
      window.location.href = "cancelar_consulta.html";
    });
  }

  // Tela de Reagendamento
  const diasGridReagendar = document.getElementById("dias-grid");
  if (diasGridReagendar && window.location.pathname.includes("reagendar_consulta")) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const idConsulta = parseInt(localStorage.getItem("@medtriage/consulta-reagendar"));
    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const consulta = consultasSalvas.find(c => c.id === idConsulta);

    if (!consulta) {
      alert("Consulta não encontrada.");
      window.location.replace("paciente_dashboard.html");
      return;
    }

    document.getElementById("resumo-nome").textContent = consulta.medicoNome;
    document.getElementById("resumo-especialidade").textContent = consulta.especialidade;
    document.getElementById("resumo-atual").textContent = `${consulta.dataFormatada} às ${consulta.horario}`;
    document.getElementById("resumo-valor").textContent = consulta.valor;

    let diaSelecionado = null;
    let horarioSelecionado = null;

    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 4; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      let labelSemana = i === 0 ? "Hoje" : (i === 1 ? "Amanhã" : nomesSemana[data.getDay()]);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const idData = gerarIdDataLocal(data.getFullYear(), data.getMonth() + 1, data.getDate());
      dias.push({ id: idData, labelSemana: labelSemana, labelData: `${dia}/${mes}` });
    }

    const renderizarDias = () => {
      diasGridReagendar.innerHTML = "";
      dias.forEach(dia => {
        const div = document.createElement("div");
        div.className = `dia-item ${diaSelecionado === dia.id ? 'selected' : ''}`;
        div.innerHTML = `<p class="dia-semana">${dia.labelSemana}</p><p class="dia-data">${dia.labelData}</p>`;
        div.addEventListener("click", () => {
          diaSelecionado = dia.id;
          horarioSelecionado = null;
          renderizarDias();
          renderizarHorarios();
          atualizarResumo();
        });
        diasGridReagendar.appendChild(div);
      });
    };

    const todosHorarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
    const horariosOcupados = ["08:30", "09:30", "14:00", "15:30"];
    const horariosContainer = document.getElementById("horarios-container");

    const renderizarHorarios = () => {
      horariosContainer.innerHTML = "";
      if (!diaSelecionado) {
        horariosContainer.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Selecione um dia para ver os horários disponíveis.</p>";
        return;
      }
      const grid = document.createElement("div");
      grid.className = "horarios-grid";
      todosHorarios.forEach(horario => {
        const botao = document.createElement("button");
        botao.className = "btn-horario";
        botao.textContent = horario;
        const estaOcupado = horariosOcupados.includes(horario);
        if (estaOcupado) { botao.classList.add("disabled"); botao.disabled = true; }
        else if (horarioSelecionado === horario) { botao.classList.add("selected"); }
        botao.addEventListener("click", () => {
          if (estaOcupado) return;
          horarioSelecionado = horario;
          renderizarHorarios();
          atualizarResumo();
        });
        grid.appendChild(botao);
      });
      horariosContainer.appendChild(grid);
    };

    const resumoNovaData = document.getElementById("resumo-nova-data");
    const btnConfirmarReagendamento = document.getElementById("btn-confirmar-reagendamento");

    const atualizarResumo = () => {
      if (horarioSelecionado && diaSelecionado) {
        const diaObj = dias.find(d => d.id === diaSelecionado);
        resumoNovaData.textContent = `${diaObj.labelSemana}, ${diaObj.labelData} às ${horarioSelecionado}`;
        btnConfirmarReagendamento.disabled = false;
      } else {
        resumoNovaData.textContent = "Nenhuma";
        btnConfirmarReagendamento.disabled = true;
      }
    };

    btnConfirmarReagendamento.addEventListener("click", () => {
      const partes = diaSelecionado.split("-");
      const novaDataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

      const index = consultasSalvas.findIndex(c => c.id === idConsulta);
      if (index !== -1) {
        consultasSalvas[index].data = diaSelecionado;
        consultasSalvas[index].dataFormatada = novaDataFormatada;
        consultasSalvas[index].horario = horarioSelecionado;
        consultasSalvas[index].status = "Aguardando";
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultasSalvas));
      }

      localStorage.removeItem("@medtriage/consulta-reagendar");
      alert("Consulta reagendada com sucesso!");
      window.location.href = "paciente_dashboard.html";
    });

    renderizarDias();
    renderizarHorarios();
    atualizarResumo();
  }

  // Tela de Cancelamento
  const cancelData = document.getElementById("cancel-data");
  if (cancelData) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const idConsulta = parseInt(localStorage.getItem("@medtriage/consulta-cancelar"));
    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const consulta = consultasSalvas.find(c => c.id === idConsulta);

    if (!consulta) {
      alert("Consulta não encontrada.");
      window.location.replace("paciente_dashboard.html");
      return;
    }

    document.getElementById("cancel-data").textContent = `${consulta.dataFormatada} às ${consulta.horario}`;
    document.getElementById("cancel-medico").textContent = consulta.medicoNome;
    document.getElementById("cancel-servico").textContent = consulta.especialidade;
    document.getElementById("cancel-local").textContent = consulta.tipo === "Teleconsulta" ? "Online" : consulta.endereco;

    document.getElementById("btn-confirmar-cancelamento").addEventListener("click", () => {
      const index = consultasSalvas.findIndex(c => c.id === idConsulta);
      if (index !== -1) {
        consultasSalvas[index].status = "Cancelada";
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultasSalvas));
      }
      localStorage.removeItem("@medtriage/consulta-cancelar");
      alert("Consulta cancelada com sucesso.");
      window.location.href = "paciente_dashboard.html";
    });
  }

  // Tela Meus Dados (Paciente)
  const formMeusDados = document.getElementById("form-meus-dados");
  if (formMeusDados) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    document.getElementById("dados-nome").value = sessao.nome || "";
    document.getElementById("dados-cpf").value = sessao.id || "";
    document.getElementById("dados-email").value = sessao.email || "";
    document.getElementById("dados-telefone").value = sessao.telefone || "";
    document.getElementById("dados-nascimento").value = sessao.nascimento || "";
    document.getElementById("dados-sexo").value = sessao.sexo || "";
    document.getElementById("dados-genero").value = sessao.genero || "";
    document.getElementById("dados-peso").value = sessao.peso || "";
    document.getElementById("dados-altura").value = sessao.altura || "";

    const inputTelefone = document.getElementById("dados-telefone");
    inputTelefone.addEventListener("input", function(e) {
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      if (valor.length > 6) valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
      else if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
      else if (valor.length > 0) valor = valor.replace(/^(\d*)/, "($1");
      e.target.value = valor;
    });

    const checkboxesDoencas = document.querySelectorAll(".check-doenca");
    checkboxesDoencas.forEach(cb => { cb.checked = (sessao.doencas || []).includes(cb.value); });
    const checkboxesDeficiencias = document.querySelectorAll(".check-deficiencia");
    checkboxesDeficiencias.forEach(cb => { cb.checked = (sessao.deficiencias || []).includes(cb.value); });

    formMeusDados.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("dados-nome").value.trim();
      const email = document.getElementById("dados-email").value.trim();
      const telefone = document.getElementById("dados-telefone").value.trim();
      const nascimento = document.getElementById("dados-nascimento").value;
      const sexo = document.getElementById("dados-sexo").value;
      const genero = document.getElementById("dados-genero").value;
      const peso = document.getElementById("dados-peso").value;
      const altura = document.getElementById("dados-altura").value;

      const doencasMarcadas = Array.from(checkboxesDoencas).filter(cb => cb.checked).map(cb => cb.value);
      if (doencasMarcadas.length > 1 && doencasMarcadas.includes("Nenhuma")) doencasMarcadas.splice(doencasMarcadas.indexOf("Nenhuma"), 1);
      const deficienciasMarcadas = Array.from(checkboxesDeficiencias).filter(cb => cb.checked).map(cb => cb.value);
      if (deficienciasMarcadas.length > 1 && deficienciasMarcadas.includes("Nenhuma")) deficienciasMarcadas.splice(deficienciasMarcadas.indexOf("Nenhuma"), 1);

      const sessaoAtualizada = { ...sessao, nome, email, telefone, nascimento, sexo, genero, peso, altura, doencas: doencasMarcadas, deficiencias: deficienciasMarcadas };
      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      const index = usuariosSalvos.findIndex(u => u.id === sessao.id);
      if (index !== -1) { usuariosSalvos[index] = sessaoAtualizada; localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos)); }
      localStorage.setItem("@medtriage/sessao", JSON.stringify(sessaoAtualizada));
      alert("Dados salvos com sucesso!");
      window.location.href = "paciente_dashboard.html";
    });
  }

  // Tela Busca de Especialistas
  const listaMedicos = document.getElementById("lista-medicos");
  if (listaMedicos) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const filtroEspecialidade = document.getElementById("filtro-especialidade");
    const filtroCidade = document.getElementById("filtro-cidade");
    const btnBuscar = document.getElementById("btn-buscar");
    const tituloResultados = document.getElementById("titulo-resultados");
    const medicosAtualizados = obterMedicosAtualizados();

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
              <p class="specialty">${medico.especialidade} · ${medico.crm}</p>
              <p class="rating">★ ${medico.rating} · <span style="color: var(--text-muted); font-weight: 400;">${medico.avaliacoes} opiniões</span></p>
              <p class="location">${medico.rua}, ${medico.cidade}</p>
            </div>
          </div>
          <div class="doctor-action">
            <p class="price">A partir de ${menorPreco(medico)}</p>
            <button class="btn btn-primary" onclick="salvarMedicoSelecionado('${medico.matricula}')">Agendar Consulta</button>
          </div>
        `;
        listaMedicos.appendChild(card);
      });
    };

    btnBuscar.addEventListener("click", () => {
      const esp = filtroEspecialidade.value;
      const cid = filtroCidade.value;
      const filtrados = medicosAtualizados.filter(m => {
        const matchEsp = esp === "Todas" || m.especialidade === esp;
        const matchCid = m.cidade === cid;
        return matchEsp && matchCid;
      });
      renderizarMedicos(filtrados);
    });
    renderizarMedicos(medicosAtualizados.filter(m => m.cidade === "João Pessoa"));
  }

  // Tela Dashboard do Médico
  const tabelaMedico = document.getElementById("tabela-pacientes-body");
  if (tabelaMedico) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("welcome-title").textContent = `Olá, ${sessao.nome}`;
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const consultasAguardando = consultasSalvas.filter(c => 
      c.medicoMatricula === sessao.id && c.status === "Aguardando"
    );

    const cardProxima = document.getElementById("card-proxima-consulta");
    const cardSemConsulta = document.getElementById("card-sem-consulta");

    if (consultasAguardando.length > 0) {
      const proxima = consultasAguardando[0];
      if (cardSemConsulta) cardSemConsulta.style.display = "none";
      if (cardProxima) {
        cardProxima.style.display = "flex";
        document.getElementById("proxima-consulta-paciente").textContent = proxima.pacienteNome;
        document.getElementById("proxima-consulta-info").textContent = 
          `${proxima.dataFormatada} às ${proxima.horario} • ${proxima.tipo}`;
      }
    } else {
      if (cardProxima) cardProxima.style.display = "none";
      if (cardSemConsulta) cardSemConsulta.style.display = "flex";
    }

    const renderizarTabela = (pacientes) => {
      tabelaMedico.innerHTML = "";
      if(pacientes.length === 0) { 
        tabelaMedico.innerHTML = "<tr><td colspan='4' style='text-align:center; color:var(--text-muted);'>Nenhum paciente encontrado.</td></tr>"; 
        return; 
      }
      pacientes.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${p.nome}</td><td>${p.cpf}</td><td>${p.ultimoAtendimento}</td><td><a href="#" class="action-link" onclick="abrirHistoricoPaciente('${p.nome}', '${p.cpf}')">Ver histórico</a></td>`;
        tabelaMedico.appendChild(tr);
      });
    };
    renderizarTabela(dbPacientesTabela);

    const buscaCpf = document.getElementById("busca-paciente-cpf");
    const btnBuscar = document.getElementById("btn-buscar-paciente");
    btnBuscar.addEventListener("click", () => {
      const termo = buscaCpf.value.trim();
      if(termo === "") { renderizarTabela(dbPacientesTabela); } 
      else { renderizarTabela(dbPacientesTabela.filter(p => p.cpf.includes(termo) || p.nome.toLowerCase().includes(termo.toLowerCase()))); }
    });
  }

  // Tela de Perfil do Médico (Edição)
  const formPerfilMedico = document.getElementById("form-perfil-medico");
  if (formPerfilMedico) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const medicoDB = dbMedicos.find(m => m.matricula === sessao.id) || {};
    document.getElementById("perfil-nome").value = sessao.nome || "";
    document.getElementById("perfil-matricula").value = sessao.id || "";
    document.getElementById("perfil-crm").value = sessao.crm || "";
    document.getElementById("perfil-especialidade").value = sessao.especialidade || "";
    document.getElementById("perfil-cidade").value = sessao.cidade || medicoDB.cidade || "";
    document.getElementById("perfil-rua").value = sessao.rua || medicoDB.rua || "";
    document.getElementById("perfil-preco").value = sessao.preco || medicoDB.preco || "";
    document.getElementById("perfil-preco-tele").value = sessao.precoTeleconsulta || medicoDB.precoTeleconsulta || "";

    formPerfilMedico.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("perfil-nome").value.trim();
      const cidade = document.getElementById("perfil-cidade").value.trim();
      const rua = document.getElementById("perfil-rua").value.trim();
      const preco = document.getElementById("perfil-preco").value.trim();
      const precoTeleconsulta = document.getElementById("perfil-preco-tele").value.trim();

      const sessaoAtualizada = { ...sessao, nome, cidade, rua, preco, precoTeleconsulta };
      localStorage.setItem("@medtriage/sessao", JSON.stringify(sessaoAtualizada));
      const storageKey = "@medtriage/profissionais";
      const profissionaisSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      const index = profissionaisSalvos.findIndex(m => m.id === sessao.id);
      if (index !== -1) {
        profissionaisSalvos[index] = { ...profissionaisSalvos[index], nome, cidade, rua, preco, precoTeleconsulta };
        localStorage.setItem(storageKey, JSON.stringify(profissionaisSalvos));
      }
      alert("Perfil atualizado com sucesso!");
      window.location.href = "medico_dashboard.html";
    });
  }

  // Tela de Visualização do Perfil do Médico
  const perfilPublicoContainer = document.getElementById("perfil-publico-container");
  if (perfilPublicoContainer) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const medicoMatricula = localStorage.getItem("@medtriage/medico-selecionado");
    const medicosAtualizados = obterMedicosAtualizados();
    const medico = medicosAtualizados.find(m => m.matricula === medicoMatricula);
    if (!medico) {
      alert("Nenhum médico selecionado. Volte para a busca.");
      window.location.replace("buscar_especialista.html");
      return;
    }
    document.getElementById("pub-nome").textContent = medico.nome;
    document.getElementById("pub-especialidade").textContent = medico.especialidade;
    document.getElementById("pub-crm").textContent = medico.crm;
    document.getElementById("pub-rating").textContent = medico.rating.toFixed(1);
    document.getElementById("pub-avaliacoes").textContent = medico.avaliacoes;
    document.getElementById("pub-bio").textContent = medico.bio;
    document.getElementById("pub-preco").textContent = medico.preco;
    document.getElementById("pub-preco-tele").textContent = medico.precoTeleconsulta;
    document.getElementById("pub-endereco").textContent = `${medico.rua}, ${medico.cidade}`;
  }

  // Tela de Agendamento - Etapa 1
  const diasGrid = document.getElementById("dias-grid");
  if (diasGrid && window.location.pathname.includes("agendar_etapa1")) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const medicoMatricula = localStorage.getItem("@medtriage/medico-selecionado");
    const medicosAtualizados = obterMedicosAtualizados();
    const medico = medicosAtualizados.find(m => m.matricula === medicoMatricula);
    if (!medico) {
      alert("Nenhum médico selecionado. Volte para a busca.");
      window.location.replace("buscar_especialista.html");
      return;
    }
    document.getElementById("resumo-nome").textContent = medico.nome;
    document.getElementById("resumo-especialidade").textContent = medico.especialidade;
    document.getElementById("resumo-valor").textContent = medico.preco;

    let diaSelecionado = null;
    let horarioSelecionado = null;
    let tipoConsulta = "Presencial";

    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 4; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      let labelSemana = i === 0 ? "Hoje" : (i === 1 ? "Amanhã" : nomesSemana[data.getDay()]);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const idData = gerarIdDataLocal(data.getFullYear(), data.getMonth() + 1, data.getDate());
      dias.push({ id: idData, labelSemana: labelSemana, labelData: `${dia}/${mes}` });
    }

    const renderizarDias = () => {
      diasGrid.innerHTML = "";
      dias.forEach(dia => {
        const div = document.createElement("div");
        div.className = `dia-item ${diaSelecionado === dia.id ? 'selected' : ''}`;
        div.innerHTML = `<p class="dia-semana">${dia.labelSemana}</p><p class="dia-data">${dia.labelData}</p>`;
        div.addEventListener("click", () => {
          diaSelecionado = dia.id;
          horarioSelecionado = null;
          renderizarDias();
          renderizarHorarios();
          atualizarResumo();
        });
        diasGrid.appendChild(div);
      });
    };

    const todosHorarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
    const horariosOcupadosSimulados = ["08:30", "09:30", "14:00", "15:30"];
    const horariosContainer = document.getElementById("horarios-container");

    const renderizarHorarios = () => {
      horariosContainer.innerHTML = "";
      if (!diaSelecionado) {
        horariosContainer.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Selecione um dia para ver os horários disponíveis.</p>";
        return;
      }
      const grid = document.createElement("div");
      grid.className = "horarios-grid";
      todosHorarios.forEach(horario => {
        const botao = document.createElement("button");
        botao.className = "btn-horario";
        botao.textContent = horario;
        const estaOcupado = horariosOcupadosSimulados.includes(horario);
        if (estaOcupado) { botao.classList.add("disabled"); botao.disabled = true; } 
        else if (horarioSelecionado === horario) { botao.classList.add("selected"); }
        botao.addEventListener("click", () => {
          if (estaOcupado) return;
          horarioSelecionado = horario;
          renderizarHorarios();
          atualizarResumo();
        });
        grid.appendChild(botao);
      });
      horariosContainer.appendChild(grid);
    };

    const btnAvancar = document.getElementById("btn-avancar");
    const resumoHorario = document.getElementById("resumo-horario");
    const resumoValor = document.getElementById("resumo-valor");

    const atualizarResumo = () => {
      if (horarioSelecionado && diaSelecionado) {
        const diaObj = dias.find(d => d.id === diaSelecionado);
        resumoHorario.textContent = `${diaObj.labelSemana}, ${diaObj.labelData} às ${horarioSelecionado}`;
        btnAvancar.disabled = false;
      } else {
        resumoHorario.textContent = "Nenhum";
        btnAvancar.disabled = true;
      }
    };

    const radiosTipo = document.querySelectorAll('input[name="tipo-consulta"]');
    radiosTipo.forEach(radio => {
      radio.addEventListener("change", (e) => {
        tipoConsulta = e.target.value;
        document.querySelectorAll('.tipo-consulta-grid .radio-card').forEach(card => card.classList.remove('selected'));
        e.target.closest('.radio-card').classList.add('selected');
        if (tipoConsulta === "Presencial") {
          resumoValor.textContent = medico.preco;
        } else {
          resumoValor.textContent = medico.precoTeleconsulta;
        }
      });
    });

    btnAvancar.addEventListener("click", () => {
      const valorFinal = tipoConsulta === "Presencial" ? medico.preco : medico.precoTeleconsulta;
      const agendamentoTemp = {
        medicoMatricula: medico.matricula,
        medicoNome: medico.nome,
        especialidade: medico.especialidade,
        valor: valorFinal,
        data: diaSelecionado,
        horario: horarioSelecionado,
        tipo: tipoConsulta
      };
      localStorage.setItem("@medtriage/agendamento-temp", JSON.stringify(agendamentoTemp));
      window.location.href = "agendar_etapa2.html";
    });

    renderizarDias();
    renderizarHorarios();
    atualizarResumo();
  }

  // Tela de Agendamento - Etapa 2
  const formEtapa2 = document.getElementById("form-etapa2");
  if (formEtapa2) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const agendamentoTemp = JSON.parse(localStorage.getItem("@medtriage/agendamento-temp"));
    if (!agendamentoTemp) {
      alert("Nenhum agendamento em andamento. Volte para a busca.");
      window.location.replace("buscar_especialista.html");
      return;
    }

    document.getElementById("resumo-nome").textContent = agendamentoTemp.medicoNome;
    document.getElementById("resumo-especialidade").textContent = agendamentoTemp.especialidade;
    document.getElementById("resumo-tipo").textContent = agendamentoTemp.tipo;
    document.getElementById("resumo-valor").textContent = agendamentoTemp.valor;

    const partes = agendamentoTemp.data.split("-");
    document.getElementById("resumo-horario").textContent = `${partes[2]}/${partes[1]} às ${agendamentoTemp.horario}`;

    const radiosEtapa2 = document.querySelectorAll('.tipo-consulta-grid .radio-card');
    radiosEtapa2.forEach(card => {
      card.addEventListener("click", (e) => {
        const input = card.querySelector('input');
        const nomeGrupo = input.getAttribute('name');
        document.querySelectorAll(`input[name="${nomeGrupo}"]`).forEach(inp => {
          inp.closest('.radio-card').classList.remove('selected');
        });
        card.classList.add('selected');
        input.checked = true;
      });
    });

    const btnAvancarEtapa2 = document.getElementById("btn-avancar-etapa2");
    btnAvancarEtapa2.addEventListener("click", () => {
      const paraQuem = document.querySelector('input[name="para-quem"]:checked').value;
      const primeiraVez = document.querySelector('input[name="primeira-vez"]:checked').value;
      const convenio = document.getElementById("etapa2-convenio").value;
      const motivo = document.getElementById("etapa2-motivo").value.trim();

      const agendamentoCompleto = {
        ...agendamentoTemp,
        paraQuem: paraQuem,
        primeiraVez: primeiraVez,
        convenio: convenio,
        motivo: motivo
      };

      localStorage.setItem("@medtriage/agendamento-temp", JSON.stringify(agendamentoCompleto));
      window.location.href = "agendar_etapa3.html";
    });
  }

  // Tela de Agendamento - Etapa 3 (Revisão)
  const btnConfirmar = document.getElementById("btn-confirmar");
  if (btnConfirmar) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const agendamento = JSON.parse(localStorage.getItem("@medtriage/agendamento-temp"));
    if (!agendamento) {
      alert("Nenhum agendamento em andamento. Volte para a busca.");
      window.location.replace("buscar_especialista.html");
      return;
    }

    const medicosAtualizados = obterMedicosAtualizados();
    const medico = medicosAtualizados.find(m => m.matricula === agendamento.medicoMatricula) || {};

    const partes = agendamento.data.split("-");
    const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

    document.getElementById("revisao-paciente").textContent = sessao.nome;
    document.getElementById("revisao-servico").textContent = `Consulta de ${agendamento.especialidade}`;
    document.getElementById("revisao-medico").textContent = agendamento.medicoNome;
    document.getElementById("revisao-crm").textContent = medico.crm || "-";
    document.getElementById("revisao-tipo").textContent = agendamento.tipo;
    document.getElementById("revisao-horario").textContent = `${dataFormatada} às ${agendamento.horario}`;
    document.getElementById("revisao-endereco").textContent = agendamento.tipo === "Teleconsulta" ? "Teleconsulta (online)" : `${medico.rua}, ${medico.cidade}`;
    document.getElementById("revisao-convenio").textContent = agendamento.convenio;
    document.getElementById("revisao-para-quem").textContent = agendamento.paraQuem;
    document.getElementById("revisao-valor").textContent = agendamento.valor;

    if (agendamento.motivo && agendamento.motivo.trim() !== "") {
      document.getElementById("revisao-motivo").textContent = agendamento.motivo;
    } else {
      document.getElementById("revisao-motivo-container").style.display = "none";
    }

    btnConfirmar.addEventListener("click", () => {
      const consultaFinal = {
        id: Date.now(),
        pacienteId: sessao.id,
        pacienteNome: sessao.nome,
        medicoMatricula: agendamento.medicoMatricula,
        medicoNome: agendamento.medicoNome,
        especialidade: agendamento.especialidade,
        crm: medico.crm || "",
        tipo: agendamento.tipo,
        data: agendamento.data,
        dataFormatada: dataFormatada,
        horario: agendamento.horario,
        endereco: agendamento.tipo === "Teleconsulta" ? "Online" : `${medico.rua}, ${medico.cidade}`,
        convenio: agendamento.convenio,
        paraQuem: agendamento.paraQuem,
        primeiraVez: agendamento.primeiraVez,
        motivo: agendamento.motivo,
        valor: agendamento.valor,
        status: "Aguardando",
        laudo: "",
        laudoRascunho: false,
        dataCriacao: new Date().toISOString()
      };

      const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
      consultasSalvas.push(consultaFinal);
      localStorage.setItem("@medtriage/consultas", JSON.stringify(consultasSalvas));

      localStorage.removeItem("@medtriage/agendamento-temp");
      window.location.href = "agendamento_sucesso.html";
    });
  }

  // Tela de Agendamento com Sucesso
  const btnOk = document.getElementById("btn-ok");
  if (btnOk) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }

    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    if (consultasSalvas.length === 0) {
      alert("Nenhuma consulta encontrada. Volte para o painel.");
      window.location.replace("paciente_dashboard.html");
      return;
    }
    const ultimaConsulta = consultasSalvas[consultasSalvas.length - 1];

    document.getElementById("sucesso-data").textContent = `${ultimaConsulta.dataFormatada} às ${ultimaConsulta.horario}`;
    document.getElementById("sucesso-medico").textContent = `${ultimaConsulta.medicoNome} • ${ultimaConsulta.especialidade}`;
    document.getElementById("sucesso-local").textContent = ultimaConsulta.tipo === "Teleconsulta" 
      ? "Teleconsulta (online)" 
      : ultimaConsulta.endereco;
    document.getElementById("sucesso-valor").textContent = ultimaConsulta.valor;

    const emailPaciente = (sessao.email || "").trim();
    const telefonePaciente = (sessao.telefone || "").trim();
    const temEmail = emailPaciente !== "";
    const temTelefone = telefonePaciente !== "";

    const detalheEmail = document.getElementById("detalhe-email");
    const detalheWhatsApp = document.getElementById("detalhe-whatsapp");
    const cardEmail = document.getElementById("opcao-email");
    const cardWhatsApp = document.getElementById("opcao-whatsapp");
    const avisoSemContato = document.getElementById("aviso-sem-contato");
    const inputEmail = cardEmail.querySelector("input");
    const inputWhatsApp = cardWhatsApp.querySelector("input");

    if (temEmail) {
      detalheEmail.textContent = emailPaciente;
    } else {
      detalheEmail.textContent = "Nenhum e-mail cadastrado";
      cardEmail.style.opacity = "0.5";
      cardEmail.style.pointerEvents = "none";
      inputEmail.disabled = true;
    }

    if (temTelefone) {
      detalheWhatsApp.textContent = telefonePaciente;
    } else {
      detalheWhatsApp.textContent = "Nenhum telefone cadastrado";
      cardWhatsApp.style.opacity = "0.5";
      cardWhatsApp.style.pointerEvents = "none";
      inputWhatsApp.disabled = true;
    }

    if (temEmail && temTelefone) {
      cardEmail.classList.add("selected");
      inputEmail.checked = true;
      btnOk.disabled = false;
    } else if (temEmail) {
      cardEmail.classList.add("selected");
      inputEmail.checked = true;
      btnOk.disabled = false;
    } else if (temTelefone) {
      cardWhatsApp.classList.add("selected");
      inputWhatsApp.checked = true;
      btnOk.disabled = false;
    } else {
      avisoSemContato.style.display = "block";
      btnOk.disabled = true;
    }

    const opcoesConfirmacao = document.querySelectorAll('.sucesso-opcoes .radio-card');
    opcoesConfirmacao.forEach(card => {
      card.addEventListener("click", () => {
        const input = card.querySelector('input[type="radio"]');
        if (input.disabled) return;
        opcoesConfirmacao.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        input.checked = true;
        btnOk.disabled = false;
      });
    });

    btnOk.addEventListener("click", () => {
      const inputMarcado = document.querySelector('input[name="metodo-confirmacao"]:checked');
      if (!inputMarcado) {
        alert("Escolha como deseja receber a confirmação.");
        return;
      }
      const metodoEscolhido = inputMarcado.value;
      const consultasAtualizadas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
      const indexUltima = consultasAtualizadas.length - 1;
      if (indexUltima >= 0) {
        consultasAtualizadas[indexUltima].metodoConfirmacao = metodoEscolhido;
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultasAtualizadas));
      }
      window.location.href = "paciente_dashboard.html";
    });
  }

  // Tela de Atendimento (Médico)
  const textoLaudo = document.getElementById("texto-laudo");
  if (textoLaudo) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) {
      alert("Acesso negado. Faça login como profissional.");
      window.location.replace("index.html");
      return;
    }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const idConsulta = parseInt(localStorage.getItem("@medtriage/consulta-atendimento"));
    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const consulta = consultasSalvas.find(c => c.id === idConsulta);

    if (!consulta) {
      alert("Consulta não encontrada. Volte para a agenda.");
      window.location.replace("medico_dashboard.html");
      return;
    }

    document.getElementById("atendimento-paciente-info").textContent = 
      `${consulta.pacienteNome} · ${consulta.tipo} · ${consulta.dataFormatada} às ${consulta.horario}`;
    document.getElementById("atendimento-paciente-nome").textContent = consulta.pacienteNome;
    document.getElementById("atendimento-paciente-cpf").textContent = consulta.pacienteId || "-";
    document.getElementById("atendimento-data").textContent = `${consulta.dataFormatada} às ${consulta.horario}`;
    document.getElementById("atendimento-tipo").textContent = consulta.tipo;
    document.getElementById("atendimento-motivo").textContent = consulta.motivo || "Não informado";

    if (consulta.laudo) {
      textoLaudo.value = consulta.laudo;
    }

    document.getElementById("btn-rascunho").addEventListener("click", () => {
      const texto = textoLaudo.value.trim();
      if (texto === "") {
        alert("Escreva o laudo antes de salvar.");
        return;
      }
      const index = consultasSalvas.findIndex(c => c.id === idConsulta);
      if (index !== -1) {
        consultasSalvas[index].laudo = texto;
        consultasSalvas[index].laudoRascunho = true;
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultasSalvas));
        alert("Rascunho salvo com sucesso!");
      }
    });

    document.getElementById("btn-finalizar").addEventListener("click", () => {
      const texto = textoLaudo.value.trim();
      if (texto === "") {
        alert("Escreva o laudo antes de finalizar o atendimento.");
        return;
      }
      const confirmar = confirm("Finalizar atendimento? Após isso, o laudo ficará disponível para o paciente.");
      if (!confirmar) return;

      const index = consultasSalvas.findIndex(c => c.id === idConsulta);
      if (index !== -1) {
        consultasSalvas[index].laudo = texto;
        consultasSalvas[index].laudoRascunho = false;
        consultasSalvas[index].status = "Realizada";
        consultasSalvas[index].dataFinalizacao = new Date().toISOString();
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultasSalvas));
      }

      localStorage.removeItem("@medtriage/consulta-atendimento");
      alert("Atendimento finalizado com sucesso!");
      window.location.href = "medico_dashboard.html";
    });
  }

  // Tela de Laudos (Paciente)
  const listaLaudos = document.getElementById("lista-laudos");
  if (listaLaudos) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const meusLaudos = consultasSalvas.filter(c => 
      c.pacienteId === sessao.id && c.status === "Realizada" && c.laudo && c.laudo.trim() !== ""
    );

    const laudosVazio = document.getElementById("laudos-vazio");

    if (meusLaudos.length === 0) {
      listaLaudos.style.display = "none";
      if (laudosVazio) laudosVazio.style.display = "block";
    } else {
      listaLaudos.style.display = "block";
      if (laudosVazio) laudosVazio.style.display = "none";
      listaLaudos.innerHTML = "";
      meusLaudos.reverse().forEach(consulta => {
        const card = document.createElement("div");
        card.className = "laudo-card";
        card.innerHTML = `
          <div class="laudo-header">
            <div>
              <h3>${consulta.especialidade} · ${consulta.tipo}</h3>
              <p class="laudo-medico">${consulta.medicoNome} • ${consulta.crm || ""}</p>
            </div>
            <p class="laudo-data">${consulta.dataFormatada} às ${consulta.horario}</p>
          </div>
          <div class="laudo-conteudo">${consulta.laudo}</div>
        `;
        listaLaudos.appendChild(card);
      });
    }
  }

  // Tela de Histórico do Paciente (Visão do Médico)
  const listaHistoricoMedico = document.getElementById("lista-historico-medico");
  if (listaHistoricoMedico) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const pacienteInfo = JSON.parse(localStorage.getItem("@medtriage/historico-paciente"));
    if (!pacienteInfo) {
      alert("Nenhum paciente selecionado.");
      window.location.replace("medico_dashboard.html");
      return;
    }

    document.getElementById("historico-paciente-nome").textContent = pacienteInfo.nome;
    document.getElementById("historico-paciente-cpf").textContent = `CPF: ${pacienteInfo.cpf}`;

    const consultasSalvas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const consultasDoPaciente = consultasSalvas.filter(c => 
      c.pacienteNome === pacienteInfo.nome && c.status === "Realizada"
    );

    const historicoVazio = document.getElementById("historico-vazio");

    if (consultasDoPaciente.length === 0) {
      listaHistoricoMedico.style.display = "none";
      if (historicoVazio) historicoVazio.style.display = "block";
    } else {
      listaHistoricoMedico.style.display = "block";
      if (historicoVazio) historicoVazio.style.display = "none";
      listaHistoricoMedico.innerHTML = "";
      consultasDoPaciente.reverse().forEach(consulta => {
        const card = document.createElement("div");
        card.className = "historico-card";
        card.innerHTML = `
          <h3>${consulta.especialidade} · ${consulta.tipo}</h3>
          <p class="historico-info">${consulta.medicoNome} • ${consulta.dataFormatada} às ${consulta.horario}</p>
          <div class="historico-laudo">${consulta.laudo || "Laudo não registrado."}</div>
        `;
        listaHistoricoMedico.appendChild(card);
      });
    }
  }
});