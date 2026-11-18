// Importa funções auxiliares para selecionar elementos HTML,
// formatar datas e horários e formatar preços.
import { $, fmtDataHora, fmtPreco } from "../core/utils.js";

// Importa as constantes de armazenamento e os rótulos das especialidades médicas.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções responsáveis por verificar o login e realizar requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa uma função assíncrona para carregar os dados da consulta confirmada.
(async () => {
  // Verifica se o botão de confirmação de sucesso existe na página.
  if (!$("btn-ok")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Recupera o ID da consulta recém-criada e armazenada no navegador.
  const id = Number(localStorage.getItem(K.consultaNova));

  // Verifica se existe um ID válido da consulta.
  // Caso não exista, redireciona o usuário para o dashboard do paciente.
  if (!id) { window.location.replace("paciente_dashboard.html"); return; }

  // Declara a variável que armazenará os dados da consulta.
  let c;

  // Tenta buscar os dados da consulta na API utilizando seu ID.
  try { c = await apiFetch(`/consulta/${id}`); }

  // Caso ocorra um erro na busca, retorna o usuário ao dashboard.
  catch { window.location.replace("paciente_dashboard.html"); return; }

  // Exibe a data e o horário da consulta confirmada.
  $("sucesso-data").textContent = fmtDataHora(c.dia_hora);

  // Exibe o nome do médico e sua especialidade.
  // Utiliza o rótulo da especialidade quando estiver disponível.
  $("sucesso-medico").textContent =
    `${c.medico.funcionario.nome} · ${ESP_LABEL[c.especialidade] || c.especialidade}`;

  // Informa que a consulta será realizada presencialmente.
  $("sucesso-local").textContent = "Presencial";

  // Exibe o preço da consulta no formato monetário definido pelo sistema.
  $("sucesso-valor").textContent = fmtPreco(c.medico.preco_consulta);

  // Recupera os cartões de opção para recebimento de notificações.
  const cardEmail = $("opcao-email");
  const cardWhats = $("opcao-whatsapp");

  // Recupera os campos de seleção dentro dos cartões, caso existam.
  const inputEmail = cardEmail?.querySelector("input");
  const inputWhats = cardWhats?.querySelector("input");

  // Verifica se o cartão de WhatsApp existe.
  if (cardWhats) {
    // Reduz a opacidade para indicar visualmente que a opção está indisponível.
    cardWhats.style.opacity = "0.5";

    // Impede interações do usuário com o cartão de WhatsApp.
    cardWhats.style.pointerEvents = "none";

    // Desabilita o campo de seleção do WhatsApp, caso exista.
    if (inputWhats) inputWhats.disabled = true;
  }

  // Informa que o WhatsApp não está cadastrado.
  if ($("detalhe-whatsapp")) $("detalhe-whatsapp").textContent = "Não cadastrado";

  // Verifica se o cartão de e-mail e seu campo de seleção existem.
  if (cardEmail && inputEmail) {
    // Marca visualmente a opção de e-mail como selecionada.
    cardEmail.classList.add("selected");

    // Marca o campo de seleção do e-mail como escolhido.
    inputEmail.checked = true;
  }

  // Configura a ação executada quando o usuário clicar no botão de confirmação.
  $("btn-ok").onclick = () => {
    // Remove o ID da consulta recém-criada do armazenamento local.
    localStorage.removeItem(K.consultaNova);

    // Redireciona o paciente para o dashboard.
    window.location.href = "paciente_dashboard.html";
  };
})();