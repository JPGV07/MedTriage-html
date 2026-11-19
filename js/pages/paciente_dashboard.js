
import { $, fmtDataHora } from "../core/utils.js";
import { K, ESP_LABEL, STATUS_LABEL } from "../core/config.js";
import { requireLogin, apiFetch } from "../core/auth.js";
import { preencherGreeting } from "../core/ui.js";
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados da página.
initCommon();

(async () => {
  // Verifica se os elementos principais do dashboard existem.
  if (!$("card-sem-consulta") || !$("welcome-title")) return;

  // Verifica a autenticação do usuário.
  const s = await requireLogin();
  if (!s) return;

  // Esta página é exclusiva para pacientes.
  if (s.role !== "CLIENTE") {
    window.location.replace("index.html");
    return;
  }

  // Preenche a saudação do paciente.
  preencherGreeting();

  // Recupera o CPF da sessão ou do armazenamento local.
  const cpf = String(
    s.cpf ||
    s.pacienteCpf ||
    localStorage.getItem(K.pacienteCpf) ||
    ""
  ).replace(/\D/g, "");

  // O CPF precisa conter exatamente 11 dígitos.
  if (cpf.length !== 11) {
    console.error("CPF do paciente ausente ou inválido.");
    window.location.replace("index.html");
    return;
  }

  // Recupera os elementos utilizados na exibição das consultas.
  const cardCom = $("card-com-consulta");
  const cardSem = $("card-sem-consulta");
  const multi = $("multiplas-consultas");
  const lista = $("lista-consultas-dashboard");

  // Consulta as informações do paciente no backend.
  let consultas;

  try {
    const resposta = await apiFetch(
      `/consulta/paciente/${encodeURIComponent(cpf)}`
    );

    if (!Array.isArray(resposta)) {
      throw new Error("A API não retornou uma lista de consultas.");
    }

    consultas = resposta;

  } catch (erro) {
    console.error("Erro ao carregar consultas:", erro);

    // Não apresenta uma falha de comunicação como ausência de consultas.
    if (cardCom) cardCom.style.display = "none";
    if (multi) multi.style.display = "none";

    if (cardSem) {
      cardSem.style.display = "flex";
      cardSem.textContent = "Não foi possível carregar suas consultas. Tente novamente.";
    }

    return;
  }

  // Remove as consultas canceladas.
  const ativas = consultas.filter(
    consulta => consulta.status !== "CANCELADA"
  );

  // Recupera o nome do médico considerando diferentes estruturas da API.
  function obterNomeMedico(consulta) {
    return (
      consulta.medico?.funcionario?.usuario?.nome ||
      consulta.medico?.funcionario?.nome ||
      consulta.medico?.nome ||
      consulta.medico?.crm ||
      "Médico não informado"
    );
  }

  // Recupera a descrição da especialidade.
  function obterEspecialidade(consulta) {
    return (
      ESP_LABEL[consulta.especialidade] ||
      consulta.especialidade ||
      "Especialidade não informada"
    );
  }

  // Recupera a descrição do status.
  function obterStatus(consulta) {
    return (
      STATUS_LABEL[consulta.status] ||
      consulta.status ||
      "Status não informado"
    );
  }

  // Abre a página de detalhes de uma consulta.
  function abrirDetalhes(consulta) {
    if (!consulta.id) {
      console.error("Consulta sem ID:", consulta);
      return;
    }

    localStorage.setItem(K.consultaSel, consulta.id);

    window.location.href = "detalhes_consulta.html";
  }

  // Se não houver consultas ativas, apresenta o cartão correspondente.
  if (ativas.length === 0) {
    if (cardCom) cardCom.style.display = "none";
    if (multi) multi.style.display = "none";

    if (cardSem) {
      cardSem.style.display = "flex";
    }

    return;
  }

  // Se existir somente uma consulta ativa, apresenta o cartão individual.
  if (ativas.length === 1) {
    if (cardSem) cardSem.style.display = "none";
    if (multi) multi.style.display = "none";

    if (cardCom) {
      cardCom.style.display = "flex";
    }

    const consulta = ativas[0];

    const data = $("appointment-date");
    const medico = $("appointment-doctor");
    const local = $("appointment-location");
    const botao = $("btn-ver-detalhes");

    if (data) {
      data.textContent = fmtDataHora(consulta.dia_hora);
    }

    if (medico) {
      medico.textContent =
        `${obterNomeMedico(consulta)} · ${obterEspecialidade(consulta)}`;
    }

    if (local) {
      local.textContent = "Consulta presencial";
    }

    if (botao) {
      botao.onclick = () => abrirDetalhes(consulta);
    }

    return;
  }

  // Se houver várias consultas, apresenta a listagem.
  if (cardCom) cardCom.style.display = "none";
  if (cardSem) cardSem.style.display = "none";

  if (!multi || !lista) {
    console.error("Elementos da lista de consultas não encontrados.");
    return;
  }

  multi.style.display = "block";
  lista.innerHTML = "";

  // Cria um cartão para cada consulta ativa.
  ativas.forEach(consulta => {
    const div = document.createElement("div");
    div.className = "consulta-item-card";

    const info = document.createElement("div");
    info.className = "consulta-item-info";

    const titulo = document.createElement("h3");
    titulo.textContent =
      `${obterNomeMedico(consulta)} · ${obterEspecialidade(consulta)}`;

    const data = document.createElement("p");
    const dataStrong = document.createElement("strong");

    dataStrong.textContent = fmtDataHora(consulta.dia_hora);
    data.appendChild(dataStrong);

    const modalidade = document.createElement("span");
    modalidade.textContent = " · Presencial";
    data.appendChild(modalidade);

    const status = document.createElement("p");
    status.textContent = `Status: ${obterStatus(consulta)}`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-primary";
    botao.style.width = "auto";
    botao.textContent = "Gerenciar";

    botao.addEventListener("click", () => {
      abrirDetalhes(consulta);
    });

    info.appendChild(titulo);
    info.appendChild(data);
    info.appendChild(status);

    div.appendChild(info);
    div.appendChild(botao);

    lista.appendChild(div);
  });
})();
