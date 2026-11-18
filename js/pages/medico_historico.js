// Importa funções auxiliares para selecionar elementos HTML e formatar datas e horários.
import { $, fmtDataHora } from "../core/utils.js";

// Importa as configurações gerais e os nomes das especialidades.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções de autenticação e comunicação com o backend.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função responsável por preencher as informações de saudação do usuário.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados da aplicação.
initCommon();

// Executa a lógica principal da página de forma assíncrona.
(async () => {

  // Verifica se o elemento da lista de histórico existe nesta página.
  if (!$("lista-historico-medico")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Impede que pacientes acessem a página de histórico do médico.
  // Caso seja um paciente, redireciona para o dashboard correspondente.
  if (s.role === "CLIENTE") { window.location.replace("paciente_dashboard.html"); return; }

  // Aplica o tema visual destinado aos profissionais.
  document.body.classList.add("theme-professional");

  // Preenche a saudação e as informações do usuário na página.
  preencherGreeting();

  // Recupera do armazenamento local os dados do paciente selecionado.
  // Caso não exista nenhum dado, utiliza null como valor padrão.
  const info = JSON.parse(localStorage.getItem(K.historicoPac) || "null");

  // Verifica se existe um paciente selecionado para consultar o histórico.
  if (!info) {
    // Informa que nenhum paciente foi selecionado.
    alert("Paciente não selecionado.");

    // Retorna para o painel principal do médico.
    window.location.replace("medico_dashboard.html");
    return;
  }

  // Exibe o nome do paciente selecionado na página.
  $("historico-paciente-nome").textContent = info.nome;

  // Exibe o CPF do paciente selecionado.
  $("historico-paciente-cpf").textContent = `CPF: ${info.cpf}`;

  // Recupera o CRM do médico armazenado no navegador.
  const crm = localStorage.getItem(K.medicoCrm);

  // Busca no backend todas as consultas vinculadas ao CRM do médico.
  const consultas = await apiFetch(`/consulta/medico/${encodeURIComponent(crm)}`);

  // Filtra as consultas para manter somente aquelas que:
  // pertencem ao paciente selecionado e possuem status CONCLUIDA.
  const doPac = consultas.filter(c => c.paciente.id === info.id && c.status === "CONCLUIDA");

  // Recupera os elementos responsáveis por exibir o histórico e a mensagem de lista vazia.
  const vazio = $("historico-vazio");
  const lista = $("lista-historico-medico");

  // Verifica se o paciente possui consultas concluídas.
  if (doPac.length === 0) {
    // Oculta a lista de consultas quando não existem registros.
    lista.style.display = "none";

    // Exibe a mensagem informando que não há histórico, caso o elemento exista.
    if (vazio) vazio.style.display = "block";
    return;
  }

  // Exibe a lista de consultas concluídas.
  lista.style.display = "block";

  // Oculta a mensagem de histórico vazio.
  if (vazio) vazio.style.display = "none";

  // Limpa o conteúdo anterior da lista antes de adicionar os novos registros.
  lista.innerHTML = "";

  // Percorre todas as consultas concluídas encontradas para o paciente.
  doPac.forEach(c => {

    // Cria um novo elemento HTML para representar cada consulta.
    const card = document.createElement("div");

    // Define a classe CSS responsável pela aparência do cartão de histórico.
    card.className = "historico-card";

    // Insere no cartão a especialidade, o tipo de atendimento,
    // a data e o horário da consulta e o laudo médico.
    // Caso a especialidade não tenha um nome configurado, utiliza o valor original.
    // Caso não exista um laudo registrado, exibe uma mensagem padrão.
    card.innerHTML = `
      <h3>${ESP_LABEL[c.especialidade] || c.especialidade} · Presencial</h3>
      <p class="historico-info">${fmtDataHora(c.dia_hora)}</p>
      <div class="historico-laudo">${c.laudo || "Laudo não registrado."}</div>
    `;

    // Adiciona o cartão criado à lista de histórico do paciente.
    lista.appendChild(card);
  });
})();