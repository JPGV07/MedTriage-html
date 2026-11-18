// Importa as chaves utilizadas para armazenar informações no navegador
import { K } from "./config.js";

// Importa as funções de sessão e comunicação com a API
import { getSessao, apiFetch } from "./auth.js";

// Abre a página de detalhes da consulta selecionada
window.abrirDetalhes = (id) => {
  // Salva o ID da consulta selecionada
  localStorage.setItem(K.consultaSel, id);

  // Redireciona para a página de detalhes
  window.location.href = "detalhes_consulta.html";
};

// Abre o histórico de um paciente
window.abrirHistoricoPaciente = (nome, cpf, id) => {
  // Salva os dados do paciente no navegador
  localStorage.setItem(K.historicoPac, JSON.stringify({ nome, cpf, id }));

  // Redireciona para a página de histórico
  window.location.href = "medico_historico.html";
};

// Salva o médico selecionado e abre seu perfil
window.salvarMedicoSelecionado = (crm) => {
  // Armazena o CRM do médico selecionado
  localStorage.setItem(K.medicoSel, crm);

  // Redireciona para a página do perfil médico
  window.location.href = "perfil_medico.html";
};

// Inicia o atendimento de uma consulta específica
window.iniciarAtendimentoEspecifico = (id) => {
  // Salva o ID da consulta que será atendida
  localStorage.setItem(K.consultaAtend, id);

  // Abre a página de atendimento
  window.location.href = "atendimento.html";
};

// Busca a próxima consulta aguardando atendimento
window.iniciarAtendimento = async () => {
  // Recupera os dados da sessão atual
  const s = getSessao();

  // Impede pacientes de iniciar atendimentos médicos
  if (!s || s.role === "CLIENTE") return;

  // Recupera o CRM do médico conectado
  const crm = localStorage.getItem(K.medicoCrm);
  if (!crm) return;

  try {
    // Busca as consultas vinculadas ao médico
    const consultas = await apiFetch(`/consulta/medico/${encodeURIComponent(crm)}`);

    // Localiza a primeira consulta que está aguardando atendimento
    const aguardando = consultas.find(c => c.status === "EM_AGUARDO");

    // Informa caso não existam consultas aguardando
    if (!aguardando) {
      alert("Nenhuma consulta aguardando.");
      return;
    }

    // Salva o ID da consulta encontrada
    localStorage.setItem(K.consultaAtend, aguardando.id);

    // Redireciona para a página de atendimento
    window.location.href = "atendimento.html";

  } catch (e) {
    // Exibe uma mensagem caso ocorra algum erro na requisição
    alert(e.message);
  }
};