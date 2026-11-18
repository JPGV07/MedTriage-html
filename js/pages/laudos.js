// Importa funções auxiliares para selecionar elementos e formatar datas e horários.
import { $, fmtDataHora } from "../core/utils.js";

// Importa as configurações e os rótulos das especialidades médicas.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções responsáveis pela autenticação e pelas requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário na página.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa o carregamento e a exibição dos laudos médicos.
(async () => {
  // Verifica se o elemento principal da lista de laudos existe na página.
  if (!$("lista-laudos")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Permite o acesso somente aos usuários com perfil de cliente.
  if (s.role !== "CLIENTE") { window.location.replace("index.html"); return; }

  // Preenche a saudação com as informações do usuário.
  preencherGreeting();

  // Recupera o ID do paciente armazenado localmente.
  const pid = Number(localStorage.getItem(K.pacienteId));

  // Busca na API todas as consultas vinculadas ao paciente.
  const consultas = await apiFetch(`/consulta/paciente/${pid}`);

  // Filtra apenas as consultas concluídas que possuem um laudo preenchido.
  const comLaudo = consultas.filter(c =>
    c.status === "CONCLUIDA" && c.laudo && c.laudo.trim()
  );

  // Recupera o elemento responsável por exibir a mensagem de lista vazia.
  const vazio = $("laudos-vazio");

  // Recupera o elemento onde os laudos médicos serão exibidos.
  const lista = $("lista-laudos");

  // Verifica se o paciente não possui consultas concluídas com laudos.
  if (comLaudo.length === 0) {
    // Oculta a lista de laudos.
    lista.style.display = "none";

    // Exibe a mensagem informando que não existem laudos disponíveis.
    if (vazio) vazio.style.display = "block";
    return;
  }

  // Exibe a lista quando existem laudos disponíveis.
  lista.style.display = "block";

  // Oculta a mensagem de lista vazia.
  if (vazio) vazio.style.display = "none";

  // Limpa o conteúdo anterior da lista de laudos.
  lista.innerHTML = "";

  // Percorre todas as consultas que possuem laudos para criar seus cartões.
  comLaudo.forEach(c => {
    // Cria um elemento HTML para representar o cartão do laudo.
    const card = document.createElement("div");

    // Define a classe CSS responsável pela aparência do cartão.
    card.className = "laudo-card";

    // Insere no cartão as informações da consulta e o conteúdo do laudo.
    card.innerHTML = `
      <div class="laudo-header">
        <div>
          <h3>${ESP_LABEL[c.especialidade] || c.especialidade}</h3>
          <p class="laudo-medico">${c.medico.funcionario.nome} • ${c.medico.crm}</p>
        </div>
        <p class="laudo-data">${fmtDataHora(c.dia_hora)}</p>
      </div>
      <div class="laudo-conteudo">${c.laudo}</div>
    `;

    // Adiciona o cartão criado à lista de laudos da página.
    lista.appendChild(card);
  });
})();