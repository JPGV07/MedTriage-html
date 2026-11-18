// Importa funções auxiliares para selecionar elementos HTML e formatar datas e horários.
import { $, fmtDataHora } from "../core/utils.js";

// Importa as chaves utilizadas para armazenar informações no navegador.
import { K } from "../core/config.js";

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

  // Verifica se o campo de texto do laudo existe nesta página.
  if (!$("texto-laudo")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Impede que pacientes acessem a página de atendimento médico.
  // Redireciona o paciente para o dashboard correspondente.
  if (s.role === "CLIENTE") { window.location.replace("paciente_dashboard.html"); return; }

  // Aplica o tema visual destinado aos profissionais.
  document.body.classList.add("theme-professional");

  // Preenche a saudação e as informações do usuário na página.
  preencherGreeting();

  // Recupera o identificador da consulta selecionada no armazenamento local.
  // Converte o valor para número.
  const id = Number(localStorage.getItem(K.consultaAtend));

  // Verifica se existe uma consulta selecionada.
  if (!id) {
    // Informa que nenhuma consulta foi selecionada.
    alert("Consulta não selecionada.");

    // Redireciona para o painel principal do médico.
    window.location.replace("medico_dashboard.html");
    return;
  }

  // Declara a variável que armazenará os dados da consulta.
  let c;

  // Tenta buscar os dados da consulta no backend.
  try {
    // Consulta os dados utilizando o identificador da consulta.
    c = await apiFetch(`/consulta/${id}`);
  }
  catch {
    // Informa que a consulta não foi encontrada.
    alert("Consulta não encontrada.");

    // Redireciona para o painel principal do médico.
    window.location.replace("medico_dashboard.html");
    return;
  }

  // Exibe o nome do paciente, o tipo de atendimento e a data e horário da consulta.
  $("atendimento-paciente-info").textContent =
    `${c.paciente.nome} · Presencial · ${fmtDataHora(c.dia_hora)}`;

  // Preenche o nome do paciente.
  $("atendimento-paciente-nome").textContent = c.paciente.nome;

  // Exibe o CPF do paciente.
  // Caso o CPF não esteja disponível, apresenta um traço.
  $("atendimento-paciente-cpf").textContent = c.paciente.usuario?.cpf || "-";

  // Exibe a data e o horário da consulta formatados.
  $("atendimento-data").textContent = fmtDataHora(c.dia_hora);

  // Define o tipo de atendimento como presencial.
  $("atendimento-tipo").textContent = "Presencial";

  // Exibe o motivo informado para a consulta.
  // Caso não exista um motivo registrado, apresenta uma mensagem padrão.
  $("atendimento-motivo").textContent = c.motivo || "Não informado";

  // Recupera o campo de texto utilizado para escrever o laudo médico.
  const ta = $("texto-laudo");

  // Cria uma chave exclusiva para armazenar o rascunho desta consulta.
  const rascunhoKey = `@medtriage/rascunho-${id}`;

  // Recupera um rascunho salvo anteriormente.
  // Se não existir rascunho, utiliza o laudo já registrado na consulta.
  // Caso nenhum dos dois exista, mantém o campo vazio.
  ta.value = localStorage.getItem(rascunhoKey) || c.laudo || "";

  // Configura o botão responsável por salvar o rascunho do laudo.
  $("btn-rascunho").onclick = () => {

    // Recupera o texto digitado e remove espaços desnecessários.
    const txt = ta.value.trim();

    // Impede o salvamento caso o campo esteja vazio.
    if (!txt) return alert("Escreva o laudo.");

    // Salva o texto do laudo no armazenamento local do navegador.
    localStorage.setItem(rascunhoKey, txt);

    // Informa que o rascunho foi salvo localmente.
    alert("Rascunho salvo localmente.");
  };

  // Configura o botão responsável por finalizar o atendimento.
  $("btn-finalizar").onclick = async () => {

    // Recupera o texto do laudo e remove espaços desnecessários.
    const txt = ta.value.trim();

    // Impede a finalização caso o laudo esteja vazio.
    if (!txt) return alert("Escreva o laudo antes de finalizar.");

    // Solicita a confirmação do médico antes de finalizar o atendimento.
    // Informa que o laudo ficará disponível para o paciente.
    if (!confirm("Finalizar atendimento? O laudo ficará visível ao paciente.")) return;

    // Tenta enviar o laudo ao backend e finalizar o atendimento.
    try {
      // Atualiza a consulta utilizando o método PUT.
      // Envia o conteúdo do laudo no corpo da requisição em formato JSON.
      await apiFetch(`/consulta/${id}/laudo`, {
        method: "PUT",
        body: JSON.stringify({ laudo: txt }),
      });

      // Remove o rascunho salvo localmente após a confirmação do backend.
      localStorage.removeItem(rascunhoKey);

      // Remove o identificador da consulta em atendimento do armazenamento local.
      localStorage.removeItem(K.consultaAtend);

      // Informa que o atendimento foi finalizado com sucesso.
      alert("Atendimento finalizado!");

      // Redireciona o médico para o painel principal.
      window.location.href = "medico_dashboard.html";
    } catch (err) {

      // Exibe a mensagem de erro caso a atualização do laudo falhe.
      alert(err.message);
    }
  };
})();