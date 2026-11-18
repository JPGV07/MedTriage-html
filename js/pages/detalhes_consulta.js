// Importa funções auxiliares para selecionar elementos e formatar datas e preços.
import { $, fmtDataHora, fmtPreco } from "../core/utils.js";

// Importa as configurações, os rótulos das especialidades e os status das consultas.
import { K, ESP_LABEL, STATUS_LABEL } from "../core/config.js";

// Importa as funções responsáveis pela autenticação e pelas requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário na página.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa o carregamento dos detalhes da consulta de forma assíncrona.
(async () => {
  // Verifica se o elemento principal da página existe antes de continuar.
  if (!$("detalhe-data")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Preenche a saudação com as informações do usuário.
  preencherGreeting();

  // Recupera o ID da consulta selecionada no armazenamento local.
  const id = Number(localStorage.getItem(K.consultaSel));

  // Se não houver um ID válido, retorna ao painel do paciente.
  if (!id) { window.location.replace("paciente_dashboard.html"); return; }

  // Declara a variável que armazenará os dados da consulta.
  let c;

  try {
    // Busca os detalhes da consulta na API pelo ID selecionado.
    c = await apiFetch(`/consulta/${id}`);
  }
  catch {
    // Informa que a consulta não foi encontrada.
    alert("Consulta não encontrada.");

    // Retorna ao painel do paciente.
    window.location.replace("paciente_dashboard.html");
    return;
  }

  // Exibe a data e o horário da consulta formatados.
  $("detalhe-data").textContent = fmtDataHora(c.dia_hora);

  // Exibe o nome do médico responsável pela consulta.
  $("detalhe-medico").textContent = c.medico.funcionario.nome;

  // Exibe o nome da especialidade utilizando o rótulo configurado.
  $("detalhe-servico").textContent = ESP_LABEL[c.especialidade] || c.especialidade;

  // Informa que o atendimento será realizado presencialmente.
  $("detalhe-local").textContent = "Presencial";
  $("detalhe-tipo").textContent = "Presencial";

  // Exibe o preço da consulta formatado.
  $("detalhe-valor").textContent = fmtPreco(c.medico.preco_consulta);

  // Informa que o pagamento será particular.
  $("detalhe-convenio").textContent = "Particular";

  // Exibe o método de confirmação da consulta ou um traço caso não exista.
  $("detalhe-confirmacao").textContent = c.metodoConfirmacao || "-";

  // Recupera o elemento responsável por mostrar o status da consulta.
  const badge = $("detalhe-status");

  // Exibe o status utilizando o rótulo configurado.
  badge.textContent = STATUS_LABEL[c.status] || c.status;

  // Define as cores do indicador conforme o status da consulta.
  if (c.status === "CANCELADA") {
    // Aplica as cores correspondentes a uma consulta cancelada.
    badge.style.background = "#FEE2E2"; badge.style.color = "#991B1B";
  } else if (c.status === "CONCLUIDA") {
    // Aplica as cores correspondentes a uma consulta concluída.
    badge.style.background = "#DCFCE7"; badge.style.color = "#166534";
  } else {
    // Aplica as cores padrão para os demais status.
    badge.style.background = "#FEF3C7"; badge.style.color = "#B45309";
  }

  // Configura o botão para iniciar o processo de reagendamento.
  $("btn-reagendar").onclick = () => {
    // Salva o ID da consulta que será reagendada.
    localStorage.setItem(K.consultaReag, c.id);

    // Redireciona o usuário para a página de reagendamento.
    window.location.href = "reagendar_consulta.html";
  };

  // Configura o botão para iniciar o processo de cancelamento.
  $("btn-cancelar").onclick = () => {
    // Salva o ID da consulta que será cancelada.
    localStorage.setItem(K.consultaCanc, c.id);

    // Redireciona o usuário para a página de cancelamento.
    window.location.href = "cancelar_consulta.html";
  };
})();