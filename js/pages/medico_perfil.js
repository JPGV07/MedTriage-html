// Importa funções auxiliares para selecionar elementos HTML e formatar preços.
import { $, fmtPreco } from "../core/utils.js";

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

  // Verifica se o formulário de perfil médico existe nesta página.
  if (!$("form-perfil-medico")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Impede que pacientes acessem o perfil de edição do médico.
  // Redireciona o paciente para o dashboard correspondente.
  if (s.role === "CLIENTE") { window.location.replace("paciente_dashboard.html"); return; }

  // Aplica o tema visual destinado aos profissionais.
  document.body.classList.add("theme-professional");

  // Preenche a saudação e as informações do usuário na página.
  preencherGreeting();

  // Recupera o CRM do médico armazenado no navegador.
  const crm = localStorage.getItem(K.medicoCrm);

  // Declara a variável que armazenará os dados do médico.
  let m;

  // Tenta buscar os dados do médico no backend.
  try {
    // Consulta o médico pelo CRM informado.
    // encodeURIComponent protege o valor utilizado na URL.
    m = await apiFetch(`/med/${encodeURIComponent(crm)}`);
  }
  catch {
    // Informa ao usuário que os dados do médico não foram encontrados.
    alert("Dados do médico não encontrados.");

    // Redireciona para o painel principal do médico.
    window.location.href = "medico_dashboard.html";
    return;
  }

  // Preenche o campo de nome com os dados do funcionário.
  // Caso o nome não esteja disponível, utiliza uma string vazia.
  $("perfil-nome").value = m.funcionario?.nome || "";

  // Preenche o campo de matrícula do funcionário.
  $("perfil-matricula").value = m.funcionario?.matricula || "";

  // Preenche o campo com o CRM do médico.
  $("perfil-crm").value = m.crm || "";

  // Exibe o nome da especialidade utilizando o rótulo configurado.
  // Caso não exista um rótulo correspondente, utiliza o valor original.
  $("perfil-especialidade").value = ESP_LABEL[m.especialidade] || m.especialidade;

  // Preenche o campo de cidade com um valor provisório, caso exista.
  if ($("perfil-cidade")) $("perfil-cidade").value = "-";

  // Preenche o campo de rua com um valor provisório, caso exista.
  if ($("perfil-rua")) $("perfil-rua").value = "-";

  // Formata o preço da consulta e preenche o campo correspondente.
  $("perfil-preco").value = fmtPreco(m.preco_consulta);

  // Preenche o campo de preço para teleconsulta com um valor provisório, caso exista.
  if ($("perfil-preco-tele")) $("perfil-preco-tele").value = "-";

  // Adiciona o evento de envio ao formulário de perfil médico.
  $("form-perfil-medico").addEventListener("submit", (e) => {

    // Impede o comportamento padrão de envio do formulário.
    e.preventDefault();

    // Informa que a edição do perfil ainda não está disponível.
    // A funcionalidade depende da implementação do endpoint PUT /med/{crm} no backend.
    alert("Edição de perfil ainda não disponível — endpoint PUT /med/{crm} em desenvolvimento.");
  });
})();