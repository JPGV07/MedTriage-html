// Importa funções auxiliares para selecionar elementos HTML e formatar preços.
import { $, fmtPreco } from "../core/utils.js";

// Importa as constantes de armazenamento e os rótulos das especialidades médicas.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções responsáveis por verificar o login e realizar requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa uma função assíncrona para carregar os dados do perfil público do médico.
(async () => {
  // Verifica se os elementos necessários para exibir o perfil existem na página.
  if (!$("perfil-publico-container") || !$("pub-nome")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Preenche a saudação de boas-vindas do usuário.
  preencherGreeting();

  // Recupera o CRM do médico selecionado e armazenado no navegador.
  const crm = localStorage.getItem(K.medicoSel);

  // Verifica se existe um médico selecionado.
  if (!crm) {
    // Informa que nenhum médico foi selecionado.
    alert("Médico não selecionado.");

    // Redireciona o usuário para a página de busca de especialistas.
    window.location.href = "buscar_especialista.html";

    // Encerra a execução.
    return;
  }

  // Declara a variável que armazenará os dados do médico.
  let m;

  // Tenta buscar os dados do médico na API utilizando o CRM.
  try {
    m = await apiFetch(`/med/${encodeURIComponent(crm)}`);
  } catch {
    // Informa que o médico não foi encontrado ou que ocorreu um erro na requisição.
    alert("Médico não encontrado. (Endpoint GET /med/{crm} pode não existir no backend.)");

    // Redireciona o usuário para a página de busca de especialistas.
    window.location.href = "buscar_especialista.html";

    // Encerra a execução caso não seja possível recuperar os dados.
    return;
  }

  // Exibe o nome do médico.
  // Caso o nome não esteja disponível, utiliza o CRM como identificação.
  $("pub-nome").textContent = m.funcionario?.nome || m.crm;

  // Exibe a especialidade do médico utilizando o rótulo correspondente, quando disponível.
  $("pub-especialidade").textContent = ESP_LABEL[m.especialidade] || m.especialidade;

  // Exibe o número do CRM do médico.
  $("pub-crm").textContent = m.crm;

  // Exibe a avaliação média do médico com uma casa decimal.
  // Caso não exista avaliação, utiliza o valor zero.
  $("pub-rating").textContent = (m.rating || 0).toFixed(1);

  // Exibe a quantidade de avaliações recebidas pelo médico.
  // Caso não exista essa informação, utiliza zero.
  $("pub-avaliacoes").textContent = m.avaliacoes || 0;

  // Preenche a biografia com uma descrição básica baseada na especialidade.
  $("pub-bio").textContent = `Profissional em ${ESP_LABEL[m.especialidade] || m.especialidade}.`;

  // Exibe o preço da consulta no formato monetário definido pelo sistema.
  $("pub-preco").textContent = fmtPreco(m.preco_consulta);

  // Verifica se o elemento destinado ao preço de teleconsulta existe.
  // Caso exista, exibe um traço, indicando que não há valor informado.
  if ($("pub-preco-tele")) $("pub-preco-tele").textContent = "-";

  // Exibe um traço no campo de endereço, indicando que não há informação disponível.
  $("pub-endereco").textContent = "-";

  // Localiza o botão de agendamento dentro do cartão de informações do perfil.
  const btnAgendar = document.querySelector(".perfil-secao-card .btn-primary");

  // Configura o botão para iniciar o processo de agendamento, caso ele exista.
  if (btnAgendar) btnAgendar.onclick = () => {
    // Redireciona o usuário para a primeira etapa do agendamento.
    window.location.href = "agendar_etapa1.html";
  };
})();