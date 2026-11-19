
import { $, fmtDataHora, fmtPreco } from "../core/utils.js";
import { K, ESP_LABEL } from "../core/config.js";
import { requireLogin, apiFetch } from "../core/auth.js";
import { preencherGreeting } from "../core/ui.js";
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados.
initCommon();

(async () => {
  // Verifica se o botão de confirmação existe.
  const botaoConfirmar = $("btn-confirmar");
  if (!botaoConfirmar) return;

  // Verifica a autenticação.
  const s = await requireLogin();
  if (!s) return;

  // Esta etapa é exclusiva para pacientes.
  if (s.role !== "CLIENTE") {
    window.location.replace("index.html");
    return;
  }

  // Preenche a saudação.
  preencherGreeting();

  // Recupera os dados temporários do agendamento.
  let ag;

  try {
    ag = JSON.parse(localStorage.getItem(K.agendTemp) || "null");
  } catch (erro) {
    console.error("Erro ao recuperar o agendamento:", erro);
    ag = null;
  }

  // Verifica se existe um agendamento em andamento.
  if (!ag) {
    alert("Nenhum agendamento em andamento.");
    window.location.href = "buscar_especialista.html";
    return;
  }

  // Recupera o CPF do paciente.
  const cpf = String(
    s.cpf ||
    s.pacienteCpf ||
    localStorage.getItem(K.pacienteCpf) ||
    ""
  ).replace(/\D/g, "");

  // Recupera o ID do paciente, quando disponível.
  const pacienteId =
    Number(localStorage.getItem(K.pacienteId)) ||
    Number(s.pacienteId) ||
    null;

  // Valida os dados essenciais.
  if (cpf.length !== 11) {
    alert("Não foi possível identificar o CPF do paciente. Entre novamente na sua conta.");
    return;
  }

  if (!ag.crm || !ag.especialidade || !ag.data_hora) {
    alert("Os dados do agendamento estão incompletos. Selecione novamente o médico e o horário.");
    window.location.href = "buscar_especialista.html";
    return;
  }

  // Preenche um elemento da revisão, caso ele exista.
  function preencher(id, valor) {
    const elemento = $(id);
    if (elemento) {
      elemento.textContent = valor ?? "-";
    }
  }

  // Preenche os dados da revisão.
  preencher("revisao-paciente", s.nome || "-");

  preencher(
    "revisao-servico",
    `Consulta de ${ESP_LABEL[ag.especialidade] || ag.especialidade}`
  );

  preencher("revisao-medico", ag.medicoNome || "Médico não informado");
  preencher("revisao-crm", ag.crm);
  preencher("revisao-tipo", "Presencial");
  preencher("revisao-horario", fmtDataHora(ag.data_hora));
  preencher("revisao-endereco", "Consultório do médico");
  preencher("revisao-convenio", "Particular");
  preencher("revisao-para-quem", ag.paraQuem || "Para mim");
  preencher("revisao-valor", fmtPreco(ag.preco));

  // Exibe ou oculta o motivo da consulta.
  const motivoElemento = $("revisao-motivo");
  const motivoContainer = $("revisao-motivo-container");

  if (ag.motivo) {
    if (motivoElemento) {
      motivoElemento.textContent = ag.motivo;
    }
  } else if (motivoContainer) {
    motivoContainer.style.display = "none";
  }

  // Exibe ou oculta a condição de saúde.
  const condicaoElemento = $("revisao-condicao");
  const condicaoContainer = $("revisao-condicao-container");

  if (ag.condicao) {
    if (condicaoElemento) {
      condicaoElemento.textContent = ag.condicao;
    }
  } else if (condicaoContainer) {
    condicaoContainer.style.display = "none";
  }

  // Evita o envio de vários agendamentos pelo mesmo clique.
  let enviando = false;

  // Configura o botão de confirmação.
  botaoConfirmar.onclick = async () => {
    if (enviando) return;

    // Verifica novamente os dados essenciais.
    if (!cpf || cpf.length !== 11) {
      alert("CPF do paciente inválido.");
      return;
    }

    if (!ag.crm || !ag.especialidade || !ag.data_hora) {
      alert("Existem informações ausentes no agendamento.");
      return;
    }

    enviando = true;
    botaoConfirmar.disabled = true;
    botaoConfirmar.textContent = "Confirmando...";

    try {
      // Monta os dados enviados ao backend.
      const dadosConsulta = {
        especialidadeConsulta: ag.especialidade,

        // CRM do médico responsável.
        medico: ag.crm,

        // ID do paciente, quando disponível.
        paciente: pacienteId,

        // CPF utilizado para identificar o paciente.
        pacienteCpf: cpf,

        // Data e horário selecionados.
        data_hora: ag.data_hora,

        // Tipo de atendimento aceito pelo backend.
        tipoConsulta: "PRESENCIAL",

        // Condição de saúde informada.
        condicaoSaude: ag.condicao?.trim() || null,

        // Motivo da consulta.
        motivo: ag.motivo?.trim() || null
      };

      // Envia o agendamento para a API.
      const criada = await apiFetch("/consulta", {
        method: "POST",
        body: JSON.stringify(dadosConsulta)
      });

      // Confere se a API retornou o ID da consulta.
      if (!criada || !criada.id) {
        throw new Error(
          "A API não confirmou a criação da consulta. Verifique o backend."
        );
      }

      // Salva o ID da consulta criada.
      localStorage.setItem(
        K.consultaNova,
        String(criada.id)
      );

      // Remove os dados temporários após o sucesso.
      localStorage.removeItem(K.agendTemp);

      // Redireciona para a confirmação.
      window.location.href = "agendamento_sucesso.html";

    } catch (erro) {
      console.error("Erro ao confirmar agendamento:", erro);

      alert(
        erro.message ||
        "Não foi possível realizar o agendamento. Tente novamente."
      );

      // Permite tentar novamente.
      enviando = false;
      botaoConfirmar.disabled = false;
      botaoConfirmar.textContent = "Confirmar agendamento";
    }
  };
})();
