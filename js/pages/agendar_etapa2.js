// Importa funções auxiliares para selecionar elementos HTML,
// formatar datas e horários e formatar preços.
import { $, fmtDataHora, fmtPreco } from "../core/utils.js";

// Importa as constantes de armazenamento e os rótulos das especialidades médicas.
import { K, ESP_LABEL } from "../core/config.js";

// Importa a função responsável por verificar se o usuário está autenticado.
import { requireLogin } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa uma função assíncrona para carregar os dados da segunda etapa do agendamento.
(async () => {
  // Recupera o formulário da segunda etapa do agendamento.
  const form = $("form-etapa2");

  // Verifica se o formulário existe na página.
  if (!form) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Preenche a saudação de boas-vindas do usuário.
  preencherGreeting();

  // Recupera os dados temporários do agendamento armazenados no navegador.
  // Caso não existam dados, utiliza null.
  const ag = JSON.parse(localStorage.getItem(K.agendTemp) || "null");

  // Verifica se existe um agendamento em andamento.
  if (!ag) {
    // Informa que nenhum agendamento foi encontrado.
    alert("Nenhum agendamento em andamento.");

    // Redireciona o usuário para a página de busca de especialistas.
    window.location.href = "buscar_especialista.html";

    // Encerra a execução.
    return;
  }

  // Exibe o nome do médico selecionado no resumo do agendamento.
  $("resumo-nome").textContent = ag.medicoNome;

  // Exibe a especialidade do médico utilizando o rótulo correspondente, quando disponível.
  $("resumo-especialidade").textContent = ESP_LABEL[ag.especialidade] || ag.especialidade;

  // Informa que o tipo de consulta será presencial.
  $("resumo-tipo").textContent = "Presencial";

  // Exibe a data e o horário selecionados na primeira etapa.
  $("resumo-horario").textContent = fmtDataHora(ag.data_hora);

  // Exibe o preço da consulta no formato monetário definido pelo sistema.
  $("resumo-valor").textContent = fmtPreco(ag.preco);

  // Percorre os cartões de seleção do tipo de consulta.
  document.querySelectorAll(".tipo-consulta-grid .radio-card").forEach(card => {
    // Adiciona um evento de clique em cada cartão.
    card.addEventListener("click", () => {
      // Recupera o campo de seleção associado ao cartão.
      const input = card.querySelector("input");

      // Interrompe a execução caso o cartão não possua um campo de seleção.
      if (!input) return;

      // Recupera o nome do grupo ao qual o campo pertence.
      const grupo = input.getAttribute("name");

      // Percorre todos os campos do mesmo grupo.
      document.querySelectorAll(`input[name="${grupo}"]`).forEach(inp => {
        // Recupera o cartão associado ao campo atual.
        const p = inp.closest(".radio-card");

        // Remove a classe "selected" dos cartões do grupo.
        if (p) p.classList.remove("selected");
      });

      // Marca visualmente o cartão clicado como selecionado.
      card.classList.add("selected");

      // Marca o campo de seleção correspondente como escolhido.
      input.checked = true;
    });
  });

  // Recupera o botão responsável por avançar para a próxima etapa.
  const btn = $("btn-avancar-etapa2");

  // Configura a ação executada quando o usuário clicar no botão.
  if (btn) btn.onclick = () => {
    // Recupera para quem a consulta está sendo agendada.
    // Caso nenhuma opção seja selecionada, utiliza "Para mim".
    const paraQuem = document.querySelector('input[name="para-quem"]:checked')?.value || "Para mim";

    // Recupera se o paciente está consultando pela primeira vez.
    // Caso nenhuma opção seja selecionada, utiliza "Sim".
    const primeiraVez = document.querySelector('input[name="primeira-vez"]:checked')?.value || "Sim";

    // Recupera a condição de saúde informada pelo usuário.
    // Remove espaços desnecessários do início e do final do texto.
    const condicao = ($("etapa2-condicao")?.value || "").trim();

    // Recupera o motivo da consulta informado pelo usuário.
    // Remove espaços desnecessários do início e do final do texto.
    const motivo = ($("etapa2-motivo")?.value || "").trim();

    // Atualiza os dados temporários do agendamento com as informações desta etapa.
    // O operador spread (...) preserva os dados que já estavam armazenados.
    localStorage.setItem(K.agendTemp, JSON.stringify({
      ...ag, paraQuem, primeiraVez, condicao, motivo,
    }));

    // Redireciona o usuário para a terceira etapa do agendamento.
    window.location.href = "agendar_etapa3.html";
  };
})();