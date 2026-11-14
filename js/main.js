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
  { id: 1, nome: "Dr. Carlos Silva", especialidade: "Oftalmologista", cidade: "João Pessoa", crm: "CRM-PB 12345", matricula: "MED1001", senha: "senha123", rating: 4.9, avaliacoes: 35, preco: "R$ 250,00", precoTeleconsulta: "R$ 180,00", rua: "Av. Epitácio Pessoa, 1000", bio: "Médico oftalmologista com 15 anos de experiência." },
  { id: 2, nome: "Dra. Beatriz Nogueira", especialidade: "Oftalmologista", cidade: "Campina Grande", crm: "CRM-PB 12346", matricula: "MED1002", senha: "senha123", rating: 4.8, avaliacoes: 22, preco: "R$ 240,00", precoTeleconsulta: "R$ 170,00", rua: "Rua Maciel Pinheiro, 150", bio: "Especialista em retina e glaucoma." },
  { id: 3, nome: "Dra. Ana Costa", especialidade: "Cardiologista", cidade: "João Pessoa", crm: "CRM-PB 54321", matricula: "MED2001", senha: "senha123", rating: 4.9, avaliacoes: 50, preco: "R$ 300,00", precoTeleconsulta: "R$ 220,00", rua: "Rua das Palmeiras, 450", bio: "Cardiologista intervencionista." },
  { id: 4, nome: "Dr. Ricardo Dias", especialidade: "Cardiologista", cidade: "Campina Grande", crm: "CRM-PB 54322", matricula: "MED2002", senha: "senha123", rating: 4.7, avaliacoes: 18, preco: "R$ 280,00", precoTeleconsulta: "R$ 200,00", rua: "Av. Marechal Floriano, 300", bio: "Especialista em arritmias." },
  { id: 5, nome: "Dr. Roberto Alves", especialidade: "Dermatologista", cidade: "João Pessoa", crm: "CRM-PB 98765", matricula: "MED3001", senha: "senha123", rating: 4.8, avaliacoes: 30, preco: "R$ 200,00", precoTeleconsulta: "R$ 150,00", rua: "Av. Nossa Senhora de Lourdes, 200", bio: "Dermatologista clínico e estético." },
  { id: 6, nome: "Dra. Camila Ferreira", especialidade: "Dermatologista", cidade: "Campina Grande", crm: "CRM-PB 98766", matricula: "MED3002", senha: "senha123", rating: 4.6, avaliacoes: 12, preco: "R$ 190,00", precoTeleconsulta: "R$ 140,00", rua: "Rua Treze de Maio, 80", bio: "Dermatologia pediátrica." },
  { id: 7, nome: "Dra. Juliana Mendes", especialidade: "Clínico geral", cidade: "João Pessoa", crm: "CRM-PB 11122", matricula: "MED4001", senha: "senha123", rating: 4.9, avaliacoes: 60, preco: "R$ 150,00", precoTeleconsulta: "R$ 120,00", rua: "Rua da Areia, 300", bio: "Clínica geral holística." },
  { id: 8, nome: "Dr. Paulo Henrique", especialidade: "Clínico geral", cidade: "Campina Grande", crm: "CRM-PB 11123", matricula: "MED4002", senha: "senha123", rating: 4.7, avaliacoes: 25, preco: "R$ 140,00", precoTeleconsulta: "R$ 110,00", rua: "Rua Venâncio Neiva, 500", bio: "Geriatria." }
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
  const v1 = extrairValorNumerico(medico.preco);
  const v2 = extrairValorNumerico(medico.precoTeleconsulta);
  const m = Math.min(v1, v2);
  return `R$ ${m.toFixed(2).replace(".", ",")}`;
}

function obterMedicosAtualizados() {
  const profissionaisSalvos = JSON.parse(localStorage.getItem("@medtriage/profissionais")) || [];
  return dbMedicos.map(medicoEstatico => {
    const m = profissionaisSalvos.find(p => p.id === medicoEstatico.matricula);
    if (m) {
      return {
        ...medicoEstatico,
        nome: m.nome || medicoEstatico.nome,
        cidade: m.cidade || medicoEstatico.cidade,
        rua: m.rua || medicoEstatico.rua,
        preco: m.preco || medicoEstatico.preco,
        precoTeleconsulta: m.precoTeleconsulta || medicoEstatico.precoTeleconsulta
      };
    }
    return medicoEstatico;
  });
}

// ================= FUNÇÕES GLOBAIS =================
window.salvarMedicoSelecionado = function(matricula) {
  localStorage.setItem("@medtriage/medico-selecionado", matricula);
  window.location.href = "perfil_medico.html";
};

window.abrirDetalhes = function(idConsulta) {
  localStorage.setItem("@medtriage/consulta-selecionada", idConsulta);
  window.location.href = "detalhes_consulta.html";
};

window.abrirHistoricoPaciente = function(nome, cpf) {
  localStorage.setItem("@medtriage/historico-paciente", JSON.stringify({ nome, cpf }));
  window.location.href = "medico_historico.html";
};

window.iniciarAtendimento = function() {
  const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
  if (!sessao) return;
  const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
  const aguardando = consultas.filter(c => c.medicoMatricula === sessao.id && c.status === "Aguardando");
  if (aguardando.length === 0) { alert("Nenhuma consulta aguardando."); return; }
  localStorage.setItem("@medtriage/consulta-atendimento", aguardando[0].id);
  window.location.href = "atendimento.html";
};

window.iniciarAtendimentoEspecifico = function(idConsulta) {
  localStorage.setItem("@medtriage/consulta-atendimento", idConsulta);
  window.location.href = "atendimento.html";
};

document.addEventListener("DOMContentLoaded", async () => {
  
  let perfilAtivo = "paciente"; 

  // Semeia o banco de profissionais
  const profissionaisSalvos = JSON.parse(localStorage.getItem("@medtriage/profissionais"));
  if (!profissionaisSalvos || profissionaisSalvos.length === 0) {
    const paraSalvar = [];
    for (const med of dbMedicos) {
      const hash = await hashPassword(med.senha);
      paraSalvar.push({ 
        id: med.matricula, nome: med.nome, senhaHash: hash, crm: med.crm, 
        especialidade: med.especialidade, cidade: med.cidade, rua: med.rua, 
        preco: med.preco, precoTeleconsulta: med.precoTeleconsulta
      });
    }
    localStorage.setItem("@medtriage/profissionais", JSON.stringify(paraSalvar));
  }

  // ================= OLHO DA SENHA =================
  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const wrapper = e.currentTarget.closest('.input-wrapper');
      const input = wrapper.querySelector('input');
      if (input.type === "password") { input.type = "text"; e.currentTarget.style.opacity = "1"; }
      else { input.type = "password"; e.currentTarget.style.opacity = "0.6"; }
    });
  });

  // ================= TELA DE LOGIN =================
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
        const quer = confirm("Acesso bloqueado! Deseja redefinir sua senha?");
        if (quer) {
          localStorage.setItem("@medtriage/reset-perfil", perfilAtivo);
          window.location.href = "recuperar_senha.html";
        }
        return;
      }
      const idDigitado = inputId.value.trim();
      const senhaDigitada = document.getElementById("senha").value;
      const storageKey = perfilAtivo === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuarios = JSON.parse(localStorage.getItem(storageKey)) || [];
      const user = usuarios.find(u => u.id === idDigitado);
      if (!user) return alert(`Erro: ${perfilAtivo === "paciente" ? "CPF" : "Matrícula"} não encontrado(a).`);
      const hash = await hashPassword(senhaDigitada);
      if (user.senhaHash === hash) {
        localStorage.setItem("@medtriage/tentativas", "0");
        localStorage.setItem("@medtriage/sessao", JSON.stringify(user));
        window.location.href = perfilAtivo === "paciente" ? "paciente_dashboard.html" : "medico_dashboard.html"; 
      } else {
        tentativas++;
        localStorage.setItem("@medtriage/tentativas", tentativas.toString());
        if (tentativas >= 5) alert("Você errou 5 vezes! Acesso bloqueado.");
        else alert(`Senha incorreta. Você tem ${5 - tentativas} tentativas.`);
      }
    });
  }

  // ================= TELA DE CADASTRO =================
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
      if (nome.length < 3) return alert("Insira seu nome completo.");
      if (senha !== repetir) return alert("As senhas não coincidem!");
      if (senha.length < 6) return alert("Senha muito curta.");
      if (idValue.length < 14) return alert("CPF incompleto.");
      if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("E-mail inválido.");
      const storageKey = "@medtriage/pacientes";
      const usuarios = JSON.parse(localStorage.getItem(storageKey)) || [];
      if (usuarios.some(u => u.id === idValue)) return alert("CPF já cadastrado.");
      const hash = await hashPassword(senha);
      const novo = { id: idValue, nome, senhaHash: hash, email, telefone: "", nascimento: "", sexo: "", genero: "", peso: "", altura: "", doencas: [], deficiencias: [] };
      usuarios.push(novo);
      localStorage.setItem(storageKey, JSON.stringify(usuarios));
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.setItem("@medtriage/sessao", JSON.stringify(novo));
      alert("Conta criada com sucesso!");
      window.location.href = "paciente_dashboard.html"; 
    });
  }

  // ================= RECUPERAÇÃO DE SENHA =================
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
      if (novaSenha !== repetirSenha) return alert("As senhas não coincidem!");
      if (novaSenha.length < 6) return alert("Senha curta.");
      const storageKey = perfilReset === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuarios = JSON.parse(localStorage.getItem(storageKey)) || [];
      const idx = usuarios.findIndex(u => u.id === idRecuperar);
      if (idx === -1) return alert("Não encontrado.");
      usuarios[idx].senhaHash = await hashPassword(novaSenha);
      localStorage.setItem(storageKey, JSON.stringify(usuarios));
      localStorage.setItem("@medtriage/tentativas", "0");
      localStorage.removeItem("@medtriage/reset-perfil"); 
      alert("Senha redefinida!");
      window.location.href = "index.html";
    });
  }

  // ================= LOGOUT =================
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("@medtriage/sessao");
      localStorage.removeItem("@medtriage/tentativas");
      window.location.replace("index.html");
    });
  }

  // ================= DASHBOARD PACIENTE =================
  const welcomeTitle = document.getElementById("welcome-title");
  if (welcomeTitle && window.location.pathname.includes("paciente_dashboard")) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || sessao.id.includes("MED")) { alert("Acesso negado."); window.location.replace("index.html"); return; }
    welcomeTitle.textContent = `Olá, ${sessao.nome || 'Paciente'}`;
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome || 'Paciente'}`;

    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const minhas = consultas.filter(c => c.pacienteId === sessao.id && c.status !== "Cancelada");

    const cardCom = document.getElementById("card-com-consulta");
    const cardSem = document.getElementById("card-sem-consulta");
    const containerMulti = document.getElementById("multiplas-consultas");
    const lista = document.getElementById("lista-consultas-dashboard");

    if (minhas.length === 0) {
      cardCom.style.display = "none";
      if (containerMulti) containerMulti.style.display = "none";
      cardSem.style.display = "flex";
    } else if (minhas.length === 1) {
      cardSem.style.display = "none";
      if (containerMulti) containerMulti.style.display = "none";
      cardCom.style.display = "flex";
      const c = minhas[0];
      document.getElementById("appointment-date").textContent = `${c.dataFormatada} às ${c.horario}`;
      document.getElementById("appointment-doctor").textContent = `${c.medicoNome} • ${c.especialidade}`;
      document.getElementById("appointment-location").textContent = c.tipo === "Teleconsulta" ? "Teleconsulta (online)" : c.endereco;
      document.getElementById("btn-ver-detalhes").addEventListener("click", () => {
        localStorage.setItem("@medtriage/consulta-selecionada", c.id);
        window.location.href = "detalhes_consulta.html";
      });
    } else {
      cardSem.style.display = "none";
      cardCom.style.display = "none";
      if (containerMulti) {
        containerMulti.style.display = "block";
        lista.innerHTML = "";
        minhas.forEach(c => {
          const card = document.createElement("div");
          card.className = "consulta-item-card";
          card.innerHTML = `
            <div class="consulta-item-info">
              <h3>${c.medicoNome} • ${c.especialidade}</h3>
              <p><strong>${c.dataFormatada}</strong> às ${c.horario}</p>
              <p>${c.tipo === "Teleconsulta" ? "Teleconsulta (online)" : c.endereco}</p>
            </div>
            <button class="btn btn-primary" style="width: auto;" onclick="abrirDetalhes(${c.id})">Gerenciar</button>
          `;
          lista.appendChild(card);
        });
      }
    }
  }

  // ================= DETALHES CONSULTA =================
  const detalheData = document.getElementById("detalhe-data");
  if (detalheData) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const id = parseInt(localStorage.getItem("@medtriage/consulta-selecionada"));
    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const c = consultas.find(x => x.id === id);
    if (!c) { alert("Consulta não encontrada."); window.location.replace("paciente_dashboard.html"); return; }

    document.getElementById("detalhe-data").textContent = `${c.dataFormatada} às ${c.horario}`;
    document.getElementById("detalhe-medico").textContent = c.medicoNome;
    document.getElementById("detalhe-servico").textContent = c.especialidade;
    document.getElementById("detalhe-local").textContent = c.tipo === "Teleconsulta" ? "Online" : c.endereco;
    document.getElementById("detalhe-tipo").textContent = c.tipo;
    document.getElementById("detalhe-valor").textContent = c.valor;
    document.getElementById("detalhe-convenio").textContent = c.convenio;
    document.getElementById("detalhe-confirmacao").textContent = c.metodoConfirmacao === "email" ? "Por e-mail" : "Por WhatsApp";

    const badge = document.getElementById("detalhe-status");
    if (c.status === "Cancelada") { badge.textContent = "Cancelada"; badge.style.background = "#FEE2E2"; badge.style.color = "#991B1B"; }
    else if (c.status === "Realizada") { badge.textContent = "Realizada"; badge.style.background = "#DCFCE7"; badge.style.color = "#166534"; }
    else { badge.textContent = "Em aguardo"; }

    document.getElementById("btn-reagendar").addEventListener("click", () => {
      localStorage.setItem("@medtriage/consulta-reagendar", c.id);
      window.location.href = "reagendar_consulta.html";
    });
    document.getElementById("btn-cancelar").addEventListener("click", () => {
      localStorage.setItem("@medtriage/consulta-cancelar", c.id);
      window.location.href = "cancelar_consulta.html";
    });
  }

  // ================= REAGENDAMENTO =================
  const diasGridReagendar = document.getElementById("dias-grid");
  if (diasGridReagendar && window.location.pathname.includes("reagendar_consulta")) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const id = parseInt(localStorage.getItem("@medtriage/consulta-reagendar"));
    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const c = consultas.find(x => x.id === id);
    if (!c) { alert("Consulta não encontrada."); window.location.replace("paciente_dashboard.html"); return; }

    document.getElementById("resumo-nome").textContent = c.medicoNome;
    document.getElementById("resumo-especialidade").textContent = c.especialidade;
    document.getElementById("resumo-atual").textContent = `${c.dataFormatada} às ${c.horario}`;
    document.getElementById("resumo-valor").textContent = c.valor;

    let diaSel = null, horSel = null;
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 4; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      let lbl = i === 0 ? "Hoje" : (i === 1 ? "Amanhã" : nomes[data.getDay()]);
      const d = String(data.getDate()).padStart(2, '0');
      const m = String(data.getMonth() + 1).padStart(2, '0');
      dias.push({ id: gerarIdDataLocal(data.getFullYear(), data.getMonth() + 1, data.getDate()), labelSemana: lbl, labelData: `${d}/${m}` });
    }

    const renderDias = () => {
      diasGridReagendar.innerHTML = "";
      dias.forEach(dia => {
        const div = document.createElement("div");
        div.className = `dia-item ${diaSel === dia.id ? 'selected' : ''}`;
        div.innerHTML = `<p class="dia-semana">${dia.labelSemana}</p><p class="dia-data">${dia.labelData}</p>`;
        div.addEventListener("click", () => { diaSel = dia.id; horSel = null; renderDias(); renderHorarios(); atualizarResumo(); });
        diasGridReagendar.appendChild(div);
      });
    };

    const todosHorarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
    const ocupados = ["08:30", "09:30", "14:00", "15:30"];
    const horariosContainer = document.getElementById("horarios-container");

    const renderHorarios = () => {
      horariosContainer.innerHTML = "";
      if (!diaSel) { horariosContainer.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Selecione um dia.</p>"; return; }
      const grid = document.createElement("div");
      grid.className = "horarios-grid";
      todosHorarios.forEach(h => {
        const btn = document.createElement("button");
        btn.className = "btn-horario";
        btn.textContent = h;
        const ocup = ocupados.includes(h);
        if (ocup) { btn.classList.add("disabled"); btn.disabled = true; }
        else if (horSel === h) { btn.classList.add("selected"); }
        btn.addEventListener("click", () => { if (ocup) return; horSel = h; renderHorarios(); atualizarResumo(); });
        grid.appendChild(btn);
      });
      horariosContainer.appendChild(grid);
    };

    const resumoNovaData = document.getElementById("resumo-nova-data");
    const btnConfirmarReag = document.getElementById("btn-confirmar-reagendamento");

    const atualizarResumo = () => {
      if (horSel && diaSel) {
        const d = dias.find(x => x.id === diaSel);
        resumoNovaData.textContent = `${d.labelSemana}, ${d.labelData} às ${horSel}`;
        btnConfirmarReag.disabled = false;
      } else {
        resumoNovaData.textContent = "Nenhuma";
        btnConfirmarReag.disabled = true;
      }
    };

    btnConfirmarReag.addEventListener("click", () => {
      const partes = diaSel.split("-");
      const novaFmt = `${partes[2]}/${partes[1]}/${partes[0]}`;
      const idx = consultas.findIndex(x => x.id === id);
      if (idx !== -1) {
        consultas[idx].data = diaSel;
        consultas[idx].dataFormatada = novaFmt;
        consultas[idx].horario = horSel;
        consultas[idx].status = "Aguardando";
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultas));
      }
      localStorage.removeItem("@medtriage/consulta-reagendar");
      alert("Consulta reagendada!");
      window.location.href = "paciente_dashboard.html";
    });

    renderDias(); renderHorarios(); atualizarResumo();
  }

  // ================= CANCELAMENTO =================
  const cancelData = document.getElementById("cancel-data");
  if (cancelData) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const id = parseInt(localStorage.getItem("@medtriage/consulta-cancelar"));
    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const c = consultas.find(x => x.id === id);
    if (!c) { alert("Consulta não encontrada."); window.location.replace("paciente_dashboard.html"); return; }

    document.getElementById("cancel-data").textContent = `${c.dataFormatada} às ${c.horario}`;
    document.getElementById("cancel-medico").textContent = c.medicoNome;
    document.getElementById("cancel-servico").textContent = c.especialidade;
    document.getElementById("cancel-local").textContent = c.tipo === "Teleconsulta" ? "Online" : c.endereco;

    document.getElementById("btn-confirmar-cancelamento").addEventListener("click", () => {
      const idx = consultas.findIndex(x => x.id === id);
      if (idx !== -1) { consultas[idx].status = "Cancelada"; localStorage.setItem("@medtriage/consultas", JSON.stringify(consultas)); }
      localStorage.removeItem("@medtriage/consulta-cancelar");
      alert("Consulta cancelada.");
      window.location.href = "paciente_dashboard.html";
    });
  }

  // ================= MEUS DADOS =================
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

    const inputTel = document.getElementById("dados-telefone");
    inputTel.addEventListener("input", function(e) {
      let v = e.target.value.replace(/\D/g, "").substring(0, 11);
      if (v.length > 6) v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
      else if (v.length > 0) v = v.replace(/^(\d*)/, "($1");
      e.target.value = v;
    });

    const checkD = document.querySelectorAll(".check-doenca");
    checkD.forEach(cb => { cb.checked = (sessao.doencas || []).includes(cb.value); });
    const checkDef = document.querySelectorAll(".check-deficiencia");
    checkDef.forEach(cb => { cb.checked = (sessao.deficiencias || []).includes(cb.value); });

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

      const doencas = Array.from(checkD).filter(cb => cb.checked).map(cb => cb.value);
      if (doencas.length > 1 && doencas.includes("Nenhuma")) doencas.splice(doencas.indexOf("Nenhuma"), 1);
      const defs = Array.from(checkDef).filter(cb => cb.checked).map(cb => cb.value);
      if (defs.length > 1 && defs.includes("Nenhuma")) defs.splice(defs.indexOf("Nenhuma"), 1);

      const atualizada = { ...sessao, nome, email, telefone, nascimento, sexo, genero, peso, altura, doencas, deficiencias: defs };
      const storageKey = "@medtriage/pacientes";
      const usuarios = JSON.parse(localStorage.getItem(storageKey)) || [];
      const idx = usuarios.findIndex(u => u.id === sessao.id);
      if (idx !== -1) { usuarios[idx] = atualizada; localStorage.setItem(storageKey, JSON.stringify(usuarios)); }
      localStorage.setItem("@medtriage/sessao", JSON.stringify(atualizada));
      alert("Dados salvos!");
      window.location.href = "paciente_dashboard.html";
    });
  }

  // ================= BUSCA ESPECIALISTAS =================
  const listaMedicos = document.getElementById("lista-medicos");
  if (listaMedicos) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const filtroEsp = document.getElementById("filtro-especialidade");
    const filtroCid = document.getElementById("filtro-cidade");
    const btnBuscar = document.getElementById("btn-buscar");
    const tituloRes = document.getElementById("titulo-resultados");
    const medicos = obterMedicosAtualizados();

    const render = (lista) => {
      listaMedicos.innerHTML = "";
      tituloRes.textContent = `${lista.length} médicos encontrados`;
      if (lista.length === 0) { listaMedicos.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Nenhum médico encontrado.</p>"; return; }
      lista.forEach(m => {
        const card = document.createElement("div");
        card.className = "doctor-card";
        card.innerHTML = `
          <div class="doctor-info">
            <div class="doctor-avatar"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="doctor-details">
              <h3>${m.nome}</h3>
              <p class="specialty">${m.especialidade} · ${m.crm}</p>
              <p class="rating">★ ${m.rating} · <span style="color: var(--text-muted); font-weight: 400;">${m.avaliacoes} opiniões</span></p>
              <p class="location">${m.rua}, ${m.cidade}</p>
            </div>
          </div>
          <div class="doctor-action">
            <p class="price">A partir de ${menorPreco(m)}</p>
            <button class="btn btn-primary" onclick="salvarMedicoSelecionado('${m.matricula}')">Agendar Consulta</button>
          </div>
        `;
        listaMedicos.appendChild(card);
      });
    };

    btnBuscar.addEventListener("click", () => {
      const esp = filtroEsp.value, cid = filtroCid.value;
      render(medicos.filter(m => (esp === "Todas" || m.especialidade === esp) && m.cidade === cid));
    });
    render(medicos.filter(m => m.cidade === "João Pessoa"));
  }

  // ================= DASHBOARD MÉDICO (MÁSCARA + FILA) =================
  const tabelaMedico = document.getElementById("tabela-pacientes-body");
  if (tabelaMedico) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("welcome-title").textContent = `Olá, ${sessao.nome}`;
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const aguardando = consultas.filter(c => c.medicoMatricula === sessao.id && c.status === "Aguardando");

    const cardProx = document.getElementById("card-proxima-consulta");
    const cardSem = document.getElementById("card-sem-consulta");

    if (aguardando.length > 0) {
      const p = aguardando[0];
      if (cardSem) cardSem.style.display = "none";
      if (cardProx) {
        cardProx.style.display = "flex";
        document.getElementById("proxima-consulta-paciente").textContent = p.pacienteNome;
        document.getElementById("proxima-consulta-info").textContent = `${p.dataFormatada} às ${p.horario} • ${p.tipo}`;
      }
    } else {
      if (cardProx) cardProx.style.display = "none";
      if (cardSem) cardSem.style.display = "flex";
    }

    // Estatísticas
    const totalPacEl = document.getElementById("total-pacientes");
    if (totalPacEl) {
      const minhas = consultas.filter(c => c.medicoMatricula === sessao.id);
      const pacientesUnicos = [...new Set(minhas.map(c => c.pacienteNome))].length;
      const consultasAgendadas = minhas.filter(c => c.status === "Aguardando").length;
      const atendimentosRealizados = minhas.filter(c => c.status === "Realizada").length;
      totalPacEl.textContent = pacientesUnicos;
      document.getElementById("total-consultas").textContent = consultasAgendadas;
      document.getElementById("total-atendimentos").textContent = atendimentosRealizados;
    }

    // Busca com máscara + fila
    const inputBusca = document.getElementById("busca-paciente-cpf");
    const resultadoBusca = document.getElementById("resultado-busca");
    const btnFecharBusca = document.getElementById("btn-fechar-busca");

    // Verifica se paciente já está na fila
    const verificarNaFila = (nomePaciente) => {
      return consultas.find(c => 
        c.medicoMatricula === sessao.id && 
        c.pacienteNome === nomePaciente && 
        c.status === "Aguardando"
      ) || null;
    };

    const renderTabelaFiltrada = (pacientes) => {
      tabelaMedico.innerHTML = "";
      if (pacientes.length === 0) {
        tabelaMedico.innerHTML = "<tr><td colspan='4' style='text-align:center; color:var(--text-muted); padding: 32px;'>Nenhum paciente encontrado com esse CPF.</td></tr>";
        return;
      }
      pacientes.forEach(p => {
        const consultaNaFila = verificarNaFila(p.nome);
        const badgeFila = consultaNaFila 
          ? `<span style="background:#FEF3C7; color:#B45309; font-size:11px; padding:3px 10px; border-radius:12px; margin-left:10px; font-weight:600; vertical-align:middle;">NA FILA</span>` 
          : "";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.nome}${badgeFila}</td>
          <td>${p.cpf}</td>
          <td>${p.ultimoAtendimento}</td>
          <td><a href="#" class="action-link" onclick="abrirHistoricoPaciente('${p.nome}', '${p.cpf}')">Ver histórico</a></td>
        `;
        tabelaMedico.appendChild(tr);
      });
    };

    // Máscara automática de CPF + filtro em tempo real
    if (inputBusca) {
      inputBusca.addEventListener("input", function (e) {
        let cpf = e.target.value.replace(/\D/g, "").slice(0, 11);
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = cpf;

        const termo = cpf.replace(/\D/g, "");
        if (termo.length === 0) {
          resultadoBusca.style.display = "none";
          return;
        }

        const filtrados = dbPacientesTabela.filter(p => {
          const cpfNumeros = p.cpf.replace(/\D/g, "");
          return cpfNumeros.includes(termo);
        });

        resultadoBusca.style.display = "block";
        renderTabelaFiltrada(filtrados);
      });
    }

    // Botão Buscar
    document.getElementById("btn-buscar-paciente").addEventListener("click", () => {
      const termo = inputBusca.value.replace(/\D/g, "");
      if (termo.length === 0) { resultadoBusca.style.display = "none"; return; }
      
      const filtrados = dbPacientesTabela.filter(p => {
        const cpfNumeros = p.cpf.replace(/\D/g, "");
        return cpfNumeros.includes(termo);
      });
      
      resultadoBusca.style.display = "block";
      renderTabelaFiltrada(filtrados);

      // Alerta se todos já estão na fila
      if (filtrados.length > 0) {
        const todosNaFila = filtrados.every(p => verificarNaFila(p.nome));
        if (todosNaFila) {
          setTimeout(() => {
            alert("⚠️ Atenção: Todos os pacientes encontrados já estão na fila de atendimento (Aguardando).\n\nFinalize um atendimento antes de iniciar outro.");
          }, 300);
        }
      }
    });

    if (btnFecharBusca) {
      btnFecharBusca.addEventListener("click", () => {
        inputBusca.value = "";
        resultadoBusca.style.display = "none";
      });
    }
  }

  // ================= PERFIL MÉDICO =================
  const formPerfilMedico = document.getElementById("form-perfil-medico");
  if (formPerfilMedico) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const db = dbMedicos.find(m => m.matricula === sessao.id) || {};
    document.getElementById("perfil-nome").value = sessao.nome || "";
    document.getElementById("perfil-matricula").value = sessao.id || "";
    document.getElementById("perfil-crm").value = sessao.crm || "";
    document.getElementById("perfil-especialidade").value = sessao.especialidade || "";
    document.getElementById("perfil-cidade").value = sessao.cidade || db.cidade || "";
    document.getElementById("perfil-rua").value = sessao.rua || db.rua || "";
    document.getElementById("perfil-preco").value = sessao.preco || db.preco || "";
    document.getElementById("perfil-preco-tele").value = sessao.precoTeleconsulta || db.precoTeleconsulta || "";

    formPerfilMedico.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("perfil-nome").value.trim();
      const cidade = document.getElementById("perfil-cidade").value.trim();
      const rua = document.getElementById("perfil-rua").value.trim();
      const preco = document.getElementById("perfil-preco").value.trim();
      const precoTeleconsulta = document.getElementById("perfil-preco-tele").value.trim();

      const atualizada = { ...sessao, nome, cidade, rua, preco, precoTeleconsulta };
      localStorage.setItem("@medtriage/sessao", JSON.stringify(atualizada));
      const storageKey = "@medtriage/profissionais";
      const profs = JSON.parse(localStorage.getItem(storageKey)) || [];
      const idx = profs.findIndex(m => m.id === sessao.id);
      if (idx !== -1) { profs[idx] = { ...profs[idx], nome, cidade, rua, preco, precoTeleconsulta }; localStorage.setItem(storageKey, JSON.stringify(profs)); }
      alert("Perfil atualizado!");
      window.location.href = "medico_dashboard.html";
    });
  }

  // ================= PERFIL PÚBLICO MÉDICO =================
  const perfilPublicoContainer = document.getElementById("perfil-publico-container");
  if (perfilPublicoContainer) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const matricula = localStorage.getItem("@medtriage/medico-selecionado");
    const medicos = obterMedicosAtualizados();
    const m = medicos.find(x => x.matricula === matricula);
    if (!m) { alert("Médico não selecionado."); window.location.replace("buscar_especialista.html"); return; }
    document.getElementById("pub-nome").textContent = m.nome;
    document.getElementById("pub-especialidade").textContent = m.especialidade;
    document.getElementById("pub-crm").textContent = m.crm;
    document.getElementById("pub-rating").textContent = m.rating.toFixed(1);
    document.getElementById("pub-avaliacoes").textContent = m.avaliacoes;
    document.getElementById("pub-bio").textContent = m.bio;
    document.getElementById("pub-preco").textContent = m.preco;
    document.getElementById("pub-preco-tele").textContent = m.precoTeleconsulta;
    document.getElementById("pub-endereco").textContent = `${m.rua}, ${m.cidade}`;
  }

  // ================= AGENDAMENTO ETAPA 1 =================
  const diasGrid = document.getElementById("dias-grid");
  if (diasGrid && window.location.pathname.includes("agendar_etapa1")) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;
    const matricula = localStorage.getItem("@medtriage/medico-selecionado");
    const medicos = obterMedicosAtualizados();
    const m = medicos.find(x => x.matricula === matricula);
    if (!m) { alert("Médico não selecionado."); window.location.replace("buscar_especialista.html"); return; }
    document.getElementById("resumo-nome").textContent = m.nome;
    document.getElementById("resumo-especialidade").textContent = m.especialidade;
    document.getElementById("resumo-valor").textContent = m.preco;

    let diaSel = null, horSel = null, tipo = "Presencial";
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 4; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      let lbl = i === 0 ? "Hoje" : (i === 1 ? "Amanhã" : nomes[data.getDay()]);
      const d = String(data.getDate()).padStart(2, '0');
      const mo = String(data.getMonth() + 1).padStart(2, '0');
      dias.push({ id: gerarIdDataLocal(data.getFullYear(), data.getMonth() + 1, data.getDate()), labelSemana: lbl, labelData: `${d}/${mo}` });
    }

    const renderDias = () => {
      diasGrid.innerHTML = "";
      dias.forEach(dia => {
        const div = document.createElement("div");
        div.className = `dia-item ${diaSel === dia.id ? 'selected' : ''}`;
        div.innerHTML = `<p class="dia-semana">${dia.labelSemana}</p><p class="dia-data">${dia.labelData}</p>`;
        div.addEventListener("click", () => { diaSel = dia.id; horSel = null; renderDias(); renderHorarios(); atualizarResumo(); });
        diasGrid.appendChild(div);
      });
    };

    const todosHorarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
    const ocupados = ["08:30", "09:30", "14:00", "15:30"];
    const horariosContainer = document.getElementById("horarios-container");

    const renderHorarios = () => {
      horariosContainer.innerHTML = "";
      if (!diaSel) { horariosContainer.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Selecione um dia.</p>"; return; }
      const grid = document.createElement("div");
      grid.className = "horarios-grid";
      todosHorarios.forEach(h => {
        const btn = document.createElement("button");
        btn.className = "btn-horario";
        btn.textContent = h;
        const ocup = ocupados.includes(h);
        if (ocup) { btn.classList.add("disabled"); btn.disabled = true; }
        else if (horSel === h) { btn.classList.add("selected"); }
        btn.addEventListener("click", () => { if (ocup) return; horSel = h; renderHorarios(); atualizarResumo(); });
        grid.appendChild(btn);
      });
      horariosContainer.appendChild(grid);
    };

    const btnAvancar = document.getElementById("btn-avancar");
    const resumoHor = document.getElementById("resumo-horario");
    const resumoValor = document.getElementById("resumo-valor");

    const atualizarResumo = () => {
      if (horSel && diaSel) {
        const d = dias.find(x => x.id === diaSel);
        resumoHor.textContent = `${d.labelSemana}, ${d.labelData} às ${horSel}`;
        btnAvancar.disabled = false;
      } else {
        resumoHor.textContent = "Nenhum";
        btnAvancar.disabled = true;
      }
    };

    document.querySelectorAll('input[name="tipo-consulta"]').forEach(radio => {
      radio.addEventListener("change", (e) => {
        tipo = e.target.value;
        document.querySelectorAll('.tipo-consulta-grid .radio-card').forEach(card => card.classList.remove('selected'));
        e.target.closest('.radio-card').classList.add('selected');
        resumoValor.textContent = tipo === "Presencial" ? m.preco : m.precoTeleconsulta;
      });
    });

    btnAvancar.addEventListener("click", () => {
      const valorFinal = tipo === "Presencial" ? m.preco : m.precoTeleconsulta;
      localStorage.setItem("@medtriage/agendamento-temp", JSON.stringify({
        medicoMatricula: m.matricula, medicoNome: m.nome, especialidade: m.especialidade,
        valor: valorFinal, data: diaSel, horario: horSel, tipo
      }));
      window.location.href = "agendar_etapa2.html";
    });

    renderDias(); renderHorarios(); atualizarResumo();
  }

  // ================= AGENDAMENTO ETAPA 2 =================
  const formEtapa2 = document.getElementById("form-etapa2");
  if (formEtapa2) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const a = JSON.parse(localStorage.getItem("@medtriage/agendamento-temp"));
    if (!a) { alert("Nenhum agendamento em andamento."); window.location.replace("buscar_especialista.html"); return; }

    document.getElementById("resumo-nome").textContent = a.medicoNome;
    document.getElementById("resumo-especialidade").textContent = a.especialidade;
    document.getElementById("resumo-tipo").textContent = a.tipo;
    document.getElementById("resumo-valor").textContent = a.valor;
    const partes = a.data.split("-");
    document.getElementById("resumo-horario").textContent = `${partes[2]}/${partes[1]} às ${a.horario}`;

    document.querySelectorAll('.tipo-consulta-grid .radio-card').forEach(card => {
      card.addEventListener("click", (e) => {
        const input = card.querySelector('input');
        const grupo = input.getAttribute('name');
        document.querySelectorAll(`input[name="${grupo}"]`).forEach(inp => inp.closest('.radio-card').classList.remove('selected'));
        card.classList.add('selected');
        input.checked = true;
      });
    });

    document.getElementById("btn-avancar-etapa2").addEventListener("click", () => {
      const paraQuem = document.querySelector('input[name="para-quem"]:checked').value;
      const primeiraVez = document.querySelector('input[name="primeira-vez"]:checked').value;
      const convenio = document.getElementById("etapa2-convenio").value;
      const motivo = document.getElementById("etapa2-motivo").value.trim();
      localStorage.setItem("@medtriage/agendamento-temp", JSON.stringify({ ...a, paraQuem, primeiraVez, convenio, motivo }));
      window.location.href = "agendar_etapa3.html";
    });
  }

  // ================= AGENDAMENTO ETAPA 3 =================
  const btnConfirmar = document.getElementById("btn-confirmar");
  if (btnConfirmar) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const a = JSON.parse(localStorage.getItem("@medtriage/agendamento-temp"));
    if (!a) { alert("Nenhum agendamento."); window.location.replace("buscar_especialista.html"); return; }

    const medicos = obterMedicosAtualizados();
    const m = medicos.find(x => x.matricula === a.medicoMatricula) || {};
    const partes = a.data.split("-");
    const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

    document.getElementById("revisao-paciente").textContent = sessao.nome;
    document.getElementById("revisao-servico").textContent = `Consulta de ${a.especialidade}`;
    document.getElementById("revisao-medico").textContent = a.medicoNome;
    document.getElementById("revisao-crm").textContent = m.crm || "-";
    document.getElementById("revisao-tipo").textContent = a.tipo;
    document.getElementById("revisao-horario").textContent = `${dataFormatada} às ${a.horario}`;
    document.getElementById("revisao-endereco").textContent = a.tipo === "Teleconsulta" ? "Teleconsulta (online)" : `${m.rua}, ${m.cidade}`;
    document.getElementById("revisao-convenio").textContent = a.convenio;
    document.getElementById("revisao-para-quem").textContent = a.paraQuem;
    document.getElementById("revisao-valor").textContent = a.valor;

    if (a.motivo && a.motivo.trim() !== "") document.getElementById("revisao-motivo").textContent = a.motivo;
    else document.getElementById("revisao-motivo-container").style.display = "none";

    btnConfirmar.addEventListener("click", () => {
      const consulta = {
        id: Date.now(), pacienteId: sessao.id, pacienteNome: sessao.nome,
        medicoMatricula: a.medicoMatricula, medicoNome: a.medicoNome, especialidade: a.especialidade,
        crm: m.crm || "", tipo: a.tipo, data: a.data, dataFormatada, horario: a.horario,
        endereco: a.tipo === "Teleconsulta" ? "Online" : `${m.rua}, ${m.cidade}`,
        convenio: a.convenio, paraQuem: a.paraQuem, primeiraVez: a.primeiraVez, motivo: a.motivo,
        valor: a.valor, status: "Aguardando", laudo: "", laudoRascunho: false, dataCriacao: new Date().toISOString()
      };
      const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
      consultas.push(consulta);
      localStorage.setItem("@medtriage/consultas", JSON.stringify(consultas));
      localStorage.removeItem("@medtriage/agendamento-temp");
      window.location.href = "agendamento_sucesso.html";
    });
  }

  // ================= AGENDAMENTO SUCESSO =================
  const btnOk = document.getElementById("btn-ok");
  if (btnOk) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao) { window.location.replace("index.html"); return; }
    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    if (consultas.length === 0) { alert("Nenhuma consulta."); window.location.replace("paciente_dashboard.html"); return; }
    const ultima = consultas[consultas.length - 1];

    document.getElementById("sucesso-data").textContent = `${ultima.dataFormatada} às ${ultima.horario}`;
    document.getElementById("sucesso-medico").textContent = `${ultima.medicoNome} • ${ultima.especialidade}`;
    document.getElementById("sucesso-local").textContent = ultima.tipo === "Teleconsulta" ? "Teleconsulta (online)" : ultima.endereco;
    document.getElementById("sucesso-valor").textContent = ultima.valor;

    const email = (sessao.email || "").trim();
    const tel = (sessao.telefone || "").trim();
    const temEmail = email !== "", temTel = tel !== "";

    const detalheEmail = document.getElementById("detalhe-email");
    const detalheWhats = document.getElementById("detalhe-whatsapp");
    const cardEmail = document.getElementById("opcao-email");
    const cardWhats = document.getElementById("opcao-whatsapp");
    const aviso = document.getElementById("aviso-sem-contato");
    const inputEmail = cardEmail.querySelector("input");
    const inputWhats = cardWhats.querySelector("input");

    if (temEmail) detalheEmail.textContent = email;
    else { detalheEmail.textContent = "Nenhum e-mail"; cardEmail.style.opacity = "0.5"; cardEmail.style.pointerEvents = "none"; inputEmail.disabled = true; }

    if (temTel) detalheWhats.textContent = tel;
    else { detalheWhats.textContent = "Nenhum telefone"; cardWhats.style.opacity = "0.5"; cardWhats.style.pointerEvents = "none"; inputWhats.disabled = true; }

    if (temEmail && temTel) { cardEmail.classList.add("selected"); inputEmail.checked = true; btnOk.disabled = false; }
    else if (temEmail) { cardEmail.classList.add("selected"); inputEmail.checked = true; btnOk.disabled = false; }
    else if (temTel) { cardWhats.classList.add("selected"); inputWhats.checked = true; btnOk.disabled = false; }
    else { aviso.style.display = "block"; btnOk.disabled = true; }

    document.querySelectorAll('.sucesso-opcoes .radio-card').forEach(card => {
      card.addEventListener("click", () => {
        const input = card.querySelector('input[type="radio"]');
        if (input.disabled) return;
        document.querySelectorAll('.sucesso-opcoes .radio-card').forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        input.checked = true;
        btnOk.disabled = false;
      });
    });

    btnOk.addEventListener("click", () => {
      const marcado = document.querySelector('input[name="metodo-confirmacao"]:checked');
      if (!marcado) { alert("Escolha como receber."); return; }
      const atualizadas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
      const i = atualizadas.length - 1;
      if (i >= 0) { atualizadas[i].metodoConfirmacao = marcado.value; localStorage.setItem("@medtriage/consultas", JSON.stringify(atualizadas)); }
      window.location.href = "paciente_dashboard.html";
    });
  }

  // ================= ATENDIMENTO =================
  const textoLaudo = document.getElementById("texto-laudo");
  if (textoLaudo) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { alert("Acesso negado."); window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const id = parseInt(localStorage.getItem("@medtriage/consulta-atendimento"));
    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const c = consultas.find(x => x.id === id);
    if (!c) { alert("Consulta não encontrada."); window.location.replace("medico_dashboard.html"); return; }

    document.getElementById("atendimento-paciente-info").textContent = `${c.pacienteNome} · ${c.tipo} · ${c.dataFormatada} às ${c.horario}`;
    document.getElementById("atendimento-paciente-nome").textContent = c.pacienteNome;
    document.getElementById("atendimento-paciente-cpf").textContent = c.pacienteId || "-";
    document.getElementById("atendimento-data").textContent = `${c.dataFormatada} às ${c.horario}`;
    document.getElementById("atendimento-tipo").textContent = c.tipo;
    document.getElementById("atendimento-motivo").textContent = c.motivo || "Não informado";
    if (c.laudo) textoLaudo.value = c.laudo;

    document.getElementById("btn-rascunho").addEventListener("click", () => {
      const txt = textoLaudo.value.trim();
      if (txt === "") { alert("Escreva o laudo."); return; }
      const i = consultas.findIndex(x => x.id === id);
      if (i !== -1) { consultas[i].laudo = txt; consultas[i].laudoRascunho = true; localStorage.setItem("@medtriage/consultas", JSON.stringify(consultas)); alert("Rascunho salvo!"); }
    });

    document.getElementById("btn-finalizar").addEventListener("click", () => {
      const txt = textoLaudo.value.trim();
      if (txt === "") { alert("Escreva o laudo."); return; }
      if (!confirm("Finalizar? O laudo ficará visível para o paciente.")) return;
      const i = consultas.findIndex(x => x.id === id);
      if (i !== -1) {
        consultas[i].laudo = txt;
        consultas[i].laudoRascunho = false;
        consultas[i].status = "Realizada";
        consultas[i].dataFinalizacao = new Date().toISOString();
        localStorage.setItem("@medtriage/consultas", JSON.stringify(consultas));
      }
      localStorage.removeItem("@medtriage/consulta-atendimento");
      alert("Atendimento finalizado!");
      window.location.href = "medico_dashboard.html";
    });
  }

  // ================= LAUDOS (Paciente) =================
  const listaLaudos = document.getElementById("lista-laudos");
  if (listaLaudos) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const meus = consultas.filter(c => c.pacienteId === sessao.id && c.status === "Realizada" && c.laudo && c.laudo.trim() !== "");
    const vazio = document.getElementById("laudos-vazio");

    if (meus.length === 0) { listaLaudos.style.display = "none"; vazio.style.display = "block"; }
    else {
      listaLaudos.style.display = "block"; vazio.style.display = "none"; listaLaudos.innerHTML = "";
      meus.reverse().forEach(c => {
        const card = document.createElement("div");
        card.className = "laudo-card";
        card.innerHTML = `
          <div class="laudo-header">
            <div><h3>${c.especialidade} · ${c.tipo}</h3><p class="laudo-medico">${c.medicoNome} • ${c.crm || ""}</p></div>
            <p class="laudo-data">${c.dataFormatada} às ${c.horario}</p>
          </div>
          <div class="laudo-conteudo">${c.laudo}</div>
        `;
        listaLaudos.appendChild(card);
      });
    }
  }

  // ================= HISTÓRICO MÉDICO (por paciente) =================
  const listaHist = document.getElementById("lista-historico-medico");
  if (listaHist) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const info = JSON.parse(localStorage.getItem("@medtriage/historico-paciente"));
    if (!info) { alert("Nenhum paciente selecionado."); window.location.replace("medico_dashboard.html"); return; }

    document.getElementById("historico-paciente-nome").textContent = info.nome;
    document.getElementById("historico-paciente-cpf").textContent = `CPF: ${info.cpf}`;

    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const doPaciente = consultas.filter(c => c.pacienteNome === info.nome && c.status === "Realizada");
    const vazio = document.getElementById("historico-vazio");

    if (doPaciente.length === 0) { listaHist.style.display = "none"; vazio.style.display = "block"; }
    else {
      listaHist.style.display = "block"; vazio.style.display = "none"; listaHist.innerHTML = "";
      doPaciente.reverse().forEach(c => {
        const card = document.createElement("div");
        card.className = "historico-card";
        card.innerHTML = `
          <h3>${c.especialidade} · ${c.tipo}</h3>
          <p class="historico-info">${c.medicoNome} • ${c.dataFormatada} às ${c.horario}</p>
          <div class="historico-laudo">${c.laudo || "Laudo não registrado."}</div>
        `;
        listaHist.appendChild(card);
      });
    }
  }

  // ================= VER CONSULTAS (Médico) =================
  const listaConsultasMedico = document.getElementById("lista-consultas-medico");
  if (listaConsultasMedico) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const minhas = consultas.filter(c => c.medicoMatricula === sessao.id);
    const vazio = document.getElementById("consultas-vazio");

    const renderConsultas = (filtro) => {
      listaConsultasMedico.innerHTML = "";
      const filtradas = filtro === "todas" ? minhas : minhas.filter(c => c.status === filtro);
      if (filtradas.length === 0) { listaConsultasMedico.style.display = "none"; vazio.style.display = "block"; return; }
      listaConsultasMedico.style.display = "block";
      vazio.style.display = "none";

      [...filtradas].reverse().forEach(c => {
        const card = document.createElement("div");
        card.className = "consulta-medico-card";
        let badgeClass = "scheduled";
        if (c.status === "Aguardando") badgeClass = "waiting";
        else if (c.status === "Realizada") badgeClass = "attending";
        const temAguardando = c.status === "Aguardando";

        card.innerHTML = `
          <div class="consulta-medico-info">
            <h3>${c.pacienteNome}</h3>
            <p><strong>${c.dataFormatada}</strong> às ${c.horario} • ${c.tipo}</p>
            <p>${c.tipo === "Teleconsulta" ? "Teleconsulta (online)" : c.endereco}</p>
            <span class="badge ${badgeClass}" style="margin-top: 8px;">${c.status}</span>
          </div>
          <div class="consulta-medico-actions">
            ${temAguardando ? `<button class="btn btn-primary" style="width: auto; padding: 10px 20px; font-size: 14px;" onclick="iniciarAtendimentoEspecifico(${c.id})">Iniciar atendimento</button>` : ''}
            <button class="btn btn-outline" style="width: auto; padding: 10px 20px; font-size: 14px;" onclick="abrirHistoricoPaciente('${c.pacienteNome}', '${c.pacienteId}')">Ver histórico</button>
          </div>
        `;
        listaConsultasMedico.appendChild(card);
      });
    };

    document.querySelectorAll(".filtro-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderConsultas(btn.getAttribute("data-filtro"));
      });
    });

    renderConsultas("todas");
  }

  // ================= HISTÓRICO GERAL DE ATENDIMENTOS (Médico) =================
  const listaHistAtend = document.getElementById("lista-historico-atendimentos");
  if (listaHistAtend) {
    const sessao = JSON.parse(localStorage.getItem("@medtriage/sessao"));
    if (!sessao || !sessao.id.includes("MED")) { window.location.replace("index.html"); return; }
    document.getElementById("user-greeting").textContent = `Olá, ${sessao.nome}`;

    const consultas = JSON.parse(localStorage.getItem("@medtriage/consultas")) || [];
    const realizadas = consultas.filter(c => c.medicoMatricula === sessao.id && c.status === "Realizada");
    const vazio = document.getElementById("historico-atend-vazio");

    const stats = document.getElementById("stats-historico");
    if (stats) {
      const pacientes = [...new Set(realizadas.map(c => c.pacienteNome))].length;
      const laudos = realizadas.filter(c => c.laudo && c.laudo.trim() !== "").length;
      stats.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon">🩺</div>
          <div class="stat-info"><h3>${realizadas.length}</h3><p>Atendimentos</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info"><h3>${pacientes}</h3><p>Pacientes</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info"><h3>${laudos}</h3><p>Laudos</p></div>
        </div>
      `;
    }

    const renderHistAtend = (lista) => {
      listaHistAtend.innerHTML = "";
      if (lista.length === 0) { listaHistAtend.style.display = "none"; if (vazio) vazio.style.display = "block"; return; }
      listaHistAtend.style.display = "block";
      if (vazio) vazio.style.display = "none";
      [...lista].reverse().forEach(c => {
        const card = document.createElement("div");
        card.className = "historico-card";
        card.innerHTML = `
          <h3>${c.pacienteNome} — ${c.especialidade}</h3>
          <p class="historico-info">${c.dataFormatada} às ${c.horario} • ${c.tipo}</p>
          <div class="historico-laudo">${c.laudo || "Laudo não registrado."}</div>
        `;
        listaHistAtend.appendChild(card);
      });
    };

    renderHistAtend(realizadas);

    const busca = document.getElementById("busca-historico");
    if (busca) {
      document.getElementById("btn-buscar-historico").addEventListener("click", () => {
        const termo = busca.value.trim().toLowerCase();
        if (termo === "") renderHistAtend(realizadas);
        else {
          const filtradas = realizadas.filter(c => 
            c.pacienteNome.toLowerCase().includes(termo) || (c.pacienteId || "").includes(termo)
          );
          renderHistAtend(filtradas);
        }
      });
    }
  }
});