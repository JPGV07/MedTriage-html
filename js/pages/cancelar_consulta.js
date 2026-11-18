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

// Executa o carregamento e o funcionamento da página de cancelamento.
(async () => {
  // Verifica se o elemento principal da página existe antes de continuar.
  if (!$("cancel-data")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Preenche a saudação com as informações do usuário.
  preencherGreeting();

  // Recupera o ID da consulta que será cancelada no armazenamento local.
  const id = Number(localStorage.getItem(K.consultaCanc));

  // Se não houver um ID válido, retorna ao painel do paciente.
  if (!id) { window.location.replace("paciente_dashboard.html"); return; }

  // Declara a variável que armazenará os dados da consulta.
  let c;

  try {
    // Busca os dados da consulta na API pelo ID armazenado.
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
  $("cancel-data").textContent = fmtDataHora(c.dia_hora);

  // Exibe o nome do médico responsável pela consulta.
  $("cancel-medico").textContent = c.medico.funcionario.nome;

  // Exibe a especialidade médica utilizando o rótulo configurado.
  $("cancel-servico").textContent = ESP_LABEL[c.especialidade] || c.especialidade;

  // Informa que o atendimento será realizado presencialmente.
  $("cancel-local").textContent = "Presencial";

  // Define a ação executada quando o usuário confirma o cancelamento.
  $("btn-confirmar-cancelamento").onclick = async () => {
    try {
      // Envia uma requisição PUT para cancelar a consulta na API.
      await apiFetch(`/consulta/${id}/cancelar`, { method: "PUT" });

      // Informa que a consulta foi cancelada com sucesso.
      alert("Consulta cancelada.");

      // Remove do armazenamento local o ID da consulta em cancelamento.
      localStorage.removeItem(K.consultaCanc);

      // Retorna o usuário ao painel do paciente.
      window.location.href = "paciente_dashboard.html";
    } catch (err) {
      // Exibe a mensagem de erro caso o cancelamento não seja concluído.
      alert(err.message);
    }
  };
})();