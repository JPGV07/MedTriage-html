// Importa funções auxiliares para selecionar elementos HTML e formatar datas.
import { $, fmtDataHora } from "../core/utils.js";

// Importa as constantes de armazenamento, especialidades e status das consultas.
import { K, ESP_LABEL, STATUS_LABEL } from "../core/config.js";

// Importa as funções responsáveis por verificar o login e realizar requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa uma função assíncrona para carregar as consultas do paciente.
(async () => {
  // Verifica se os elementos necessários do dashboard existem na página.
  if (!$("card-sem-consulta") || !$("welcome-title")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Verifica se o usuário possui o perfil de cliente.
  // Caso contrário, redireciona para a página inicial.
  if (s.role !== "CLIENTE") { window.location.replace("index.html"); return; }

  // Preenche a saudação de boas-vindas do paciente.
  preencherGreeting();

  // Recupera o ID do paciente armazenado no navegador.
  const pid = Number(localStorage.getItem(K.pacienteId));

  // Verifica se o ID do paciente é válido.
  // Caso não seja, redireciona para a página inicial.
  if (!pid) { window.location.replace("index.html"); return; }

  // Busca na API todas as consultas vinculadas ao paciente.
  const consultas = await apiFetch(`/consulta/paciente/${pid}`);

  // Filtra as consultas, mantendo apenas aquelas que não foram canceladas.
  const ativas = consultas.filter(c => c.status !== "CANCELADA");

  // Recupera os elementos HTML utilizados para exibir as consultas.
  const cardCom = $("card-com-consulta");
  const cardSem = $("card-sem-consulta");
  const multi = $("multiplas-consultas");
  const lista = $("lista-consultas-dashboard");

  // Verifica se o paciente não possui consultas ativas.
  if (ativas.length === 0) {
    // Oculta o cartão de consulta existente.
    if (cardCom) cardCom.style.display = "none";

    // Oculta a área de múltiplas consultas.
    if (multi) multi.style.display = "none";

    // Exibe o cartão informando que não existem consultas.
    if (cardSem) cardSem.style.display = "flex";

    // Encerra a execução, pois não há consultas para exibir.
    return;
  }

  // Verifica se o paciente possui exatamente uma consulta ativa.
  if (ativas.length === 1) {
    // Oculta o cartão de ausência de consultas.
    if (cardSem) cardSem.style.display = "none";

    // Oculta a área destinada à listagem de várias consultas.
    if (multi) multi.style.display = "none";

    // Exibe o cartão da consulta única.
    if (cardCom) cardCom.style.display = "flex";

    // Recupera os dados da única consulta ativa.
    const c = ativas[0];

    // Exibe a data e o horário da consulta formatados.
    $("appointment-date").textContent = fmtDataHora(c.dia_hora);

    // Exibe o nome do médico e a especialidade da consulta.
    // Utiliza o rótulo da especialidade quando estiver disponível.
    $("appointment-doctor").textContent =
      `${c.medico.funcionario.nome} · ${ESP_LABEL[c.especialidade] || c.especialidade}`;

    // Informa que a consulta será realizada presencialmente.
    $("appointment-location").textContent = "Consulta presencial";

    // Configura o botão para abrir os detalhes da consulta.
    $("btn-ver-detalhes").onclick = () => {
      // Armazena o ID da consulta selecionada no navegador.
      localStorage.setItem(K.consultaSel, c.id);

      // Redireciona o paciente para a página de detalhes da consulta.
      window.location.href = "detalhes_consulta.html";
    };

    // Encerra a execução após exibir a consulta única.
    return;
  }

  // Caso existam várias consultas, oculta os cartões de consulta única e ausência.
  if (cardCom) cardCom.style.display = "none";
  if (cardSem) cardSem.style.display = "none";

  // Verifica se a área de múltiplas consultas existe na página.
  if (!multi) return;

  // Exibe a área destinada à listagem de várias consultas.
  multi.style.display = "block";

  // Limpa a lista antes de adicionar as consultas recuperadas da API.
  lista.innerHTML = "";

  // Percorre todas as consultas ativas para criar seus cartões.
  ativas.forEach(c => {
    // Cria um novo elemento HTML para representar uma consulta.
    const div = document.createElement("div");

    // Define a classe CSS responsável pela aparência do cartão.
    div.className = "consulta-item-card";

    // Insere no cartão o nome do médico, a especialidade,
    // a data, o horário e o status da consulta.
    // Também cria o botão para gerenciar a consulta.
    div.innerHTML = `
      <div class="consulta-item-info">
        <h3>${c.medico.funcionario.nome} · ${ESP_LABEL[c.especialidade] || c.especialidade}</h3>
        <p><strong>${fmtDataHora(c.dia_hora)}</strong></p>
        <p>Status: ${STATUS_LABEL[c.status]}</p>
      </div>
      <button class="btn btn-primary" style="width: auto;">Gerenciar</button>
    `;

    // Configura o botão Gerenciar para abrir os detalhes da consulta.
    div.querySelector("button").onclick = () => {
      // Armazena o ID da consulta selecionada no navegador.
      localStorage.setItem(K.consultaSel, c.id);

      // Redireciona o paciente para a página de detalhes da consulta.
      window.location.href = "detalhes_consulta.html";
    };

    // Adiciona o cartão criado à lista de consultas do dashboard.
    lista.appendChild(div);
  });
})();