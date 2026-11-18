// Importa funções auxiliares para selecionar elementos HTML,
// formatar datas e horários e formatar preços.
import { $, fmtDataHora, fmtPreco } from "../core/utils.js";

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

// Executa uma função assíncrona para carregar e confirmar o agendamento.
(async () => {
  // Verifica se o botão de confirmação existe na página.
  if (!$("btn-confirmar")) return;

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
    alert("Nenhum agendamento.");

    // Redireciona o usuário para a página de busca de especialistas.
    window.location.href = "buscar_especialista.html";

    // Encerra a execução.
    return;
  }

  // Exibe o nome do paciente na revisão do agendamento.
  // Caso o nome não esteja disponível, exibe um traço.
  $("revisao-paciente").textContent = s.nome || "-";

  // Exibe o serviço selecionado com o nome da especialidade médica.
  $("revisao-servico").textContent = `Consulta de ${ESP_LABEL[ag.especialidade] || ag.especialidade}`;

  // Exibe o nome do médico selecionado.
  $("revisao-medico").textContent = ag.medicoNome;

  // Exibe o CRM do médico.
  // Caso não esteja disponível, exibe um traço.
  $("revisao-crm").textContent = ag.crm || "-";

  // Informa que o atendimento será presencial.
  $("revisao-tipo").textContent = "Presencial";

  // Exibe a data e o horário escolhidos para a consulta.
  $("revisao-horario").textContent = fmtDataHora(ag.data_hora);

  // Exibe o endereço do local de atendimento.
  $("revisao-endereco").textContent = "Consultório do médico";

  // Informa que o pagamento será particular.
  $("revisao-convenio").textContent = "Particular";

  // Exibe para quem a consulta está sendo agendada.
  // Caso não exista essa informação, utiliza "Para mim".
  $("revisao-para-quem").textContent = ag.paraQuem || "Para mim";

  // Exibe o preço da consulta no formato monetário definido pelo sistema.
  $("revisao-valor").textContent = fmtPreco(ag.preco);

  // Recupera os elementos responsáveis pela exibição do motivo da consulta.
  const mEl = $("revisao-motivo");
  const mCont = $("revisao-motivo-container");

  // Verifica se o usuário informou o motivo da consulta.
  if (ag.motivo) {
    // Exibe o motivo informado pelo paciente.
    if (mEl) mEl.textContent = ag.motivo;
  }
  // Caso não exista motivo, oculta o campo correspondente.
  else if (mCont) {
    mCont.style.display = "none";
  }

  // Recupera os elementos responsáveis pela exibição da condição de saúde.
  const cEl = $("revisao-condicao");
  const cCont = $("revisao-condicao-container");

  // Verifica se os elementos de condição de saúde existem na página.
  if (cEl && cCont) {
    // Verifica se o paciente informou alguma condição de saúde.
    if (ag.condicao) {
      // Exibe a condição de saúde informada.
      cEl.textContent = ag.condicao;
    }
    // Caso não exista informação, oculta o campo correspondente.
    else {
      cCont.style.display = "none";
    }
  }

  // Configura a ação executada quando o paciente clicar em confirmar.
  // A função é assíncrona porque realiza uma requisição à API.
  $("btn-confirmar").onclick = async () => {
    // Recupera o ID do paciente armazenado no navegador.
    const pid = Number(localStorage.getItem(K.pacienteId));

    // Tenta enviar os dados do agendamento para o backend.
    try {
      // Envia uma requisição POST para criar uma nova consulta.
      const criada = await apiFetch("/consulta", {
        // Define o método HTTP utilizado na requisição.
        method: "POST",

        // Converte os dados do agendamento para o formato JSON.
        body: JSON.stringify({
          // Envia a especialidade médica selecionada.
          especialidadeConsulta: ag.especialidade,

          // Envia o CRM do médico responsável pela consulta.
          medico: ag.crm,

          // Envia o ID do paciente que está realizando o agendamento.
          paciente: pid,

          // Envia a data e o horário escolhidos.
          data_hora: ag.data_hora,

          // Define o tipo de atendimento como presencial.
          tipo: "PRESENCIAL",

          // Envia a condição de saúde informada.
          // Caso não tenha sido preenchida, envia null.
          condicaoSaude: ag.condicao || null,

          // Envia o motivo da consulta informado.
          // Caso não tenha sido preenchido, envia null.
          motivo: ag.motivo || null,
        }),
      });

      // Armazena o ID da consulta recém-criada no navegador.
      localStorage.setItem(K.consultaNova, String(criada.id));

      // Remove os dados temporários do agendamento após a confirmação.
      localStorage.removeItem(K.agendTemp);

      // Redireciona o paciente para a página de confirmação de sucesso.
      window.location.href = "agendamento_sucesso.html";
    } catch (err) {
      // Exibe uma mensagem informando o erro ocorrido durante o agendamento.
      alert(err.message);
    }
  };
})();