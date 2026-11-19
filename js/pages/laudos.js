
import { $, fmtDataHora } from "../core/utils.js";
import { K, ESP_LABEL } from "../core/config.js";
import { requireLogin, apiFetch } from "../core/auth.js";
import { preencherGreeting } from "../core/ui.js";
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados.
initCommon();

(async () => {
  // Recupera o container principal da lista de laudos.
  let lista =
    $("lista-laudos") ||
    document.querySelector(".laudos-lista");

  // Verifica se existe algum container adequado na página.
  const containerPrincipal =
    document.querySelector(".dashboard-main");

  if (!lista && !containerPrincipal) return;

  // Verifica a autenticação.
  const s = await requireLogin();
  if (!s) return;

  // Permite acesso somente aos pacientes.
  if (s.role !== "CLIENTE") {
    window.location.replace("index.html");
    return;
  }

  // Preenche a saudação.
  preencherGreeting();

  // Recupera o CPF do paciente.
  const cpf = String(
    s.cpf ||
    s.pacienteCpf ||
    localStorage.getItem(K.pacienteCpf) ||
    ""
  ).replace(/\D/g, "");

  // Valida o CPF.
  if (cpf.length !== 11) {
    alert("Não foi possível identificar seu CPF. Entre novamente na sua conta.");
    window.location.replace("index.html");
    return;
  }

  // Cria o container da lista caso ele ainda não exista.
  if (!lista) {
    lista = document.createElement("div");
    lista.id = "lista-laudos";
    lista.className = "laudos-lista";
    containerPrincipal.appendChild(lista);
  }

  // Recupera o elemento de mensagem de lista vazia.
  const vazio =
    $("laudos-vazio") ||
    document.querySelector(".laudos-vazio");

  // Busca os laudos no backend.
  let consultas;

  try {
    const resposta = await apiFetch(
      `/consulta/paciente/${encodeURIComponent(cpf)}`
    );

    if (!Array.isArray(resposta)) {
      throw new Error("A API retornou um formato de consultas inválido.");
    }

    consultas = resposta;

  } catch (erro) {
    console.error("Erro ao carregar laudos:", erro);

    lista.style.display = "none";

    if (vazio) {
      vazio.style.display = "block";
      vazio.textContent =
        "Não foi possível carregar seus laudos. Tente novamente.";
    } else {
      alert(
        erro.message ||
        "Não foi possível carregar seus laudos."
      );
    }

    return;
  }

  // Mantém somente consultas concluídas que possuem laudo.
  const comLaudo = consultas.filter(consulta =>
    consulta.status === "CONCLUIDA" &&
    typeof consulta.laudo === "string" &&
    consulta.laudo.trim().length > 0
  );

  // Se não houver laudos, apresenta a mensagem correspondente.
  if (comLaudo.length === 0) {
    lista.innerHTML = "";
    lista.style.display = "none";

    if (vazio) {
      vazio.style.display = "block";
      vazio.textContent = "Você ainda não possui laudos disponíveis.";
    }

    return;
  }

  // Exibe a lista e oculta a mensagem de ausência de laudos.
  lista.style.display = "block";

  if (vazio) {
    vazio.style.display = "none";
  }

  // Limpa os cartões anteriores.
  lista.innerHTML = "";

  // Recupera o nome do médico considerando diferentes estruturas da API.
  function obterNomeMedico(consulta) {
    return (
      consulta.medico?.funcionario?.usuario?.nome ||
      consulta.medico?.funcionario?.nome ||
      consulta.medico?.nome ||
      "Médico não informado"
    );
  }

  // Cria os cartões de laudo.
  comLaudo.forEach(consulta => {
    const card = document.createElement("div");
    card.className = "laudo-card";

    // Cabeçalho do laudo.
    const header = document.createElement("div");
    header.className = "laudo-header";

    const informacoes = document.createElement("div");

    const titulo = document.createElement("h3");
    titulo.textContent =
      `${ESP_LABEL[consulta.especialidade] ||
        consulta.especialidade ||
        "Especialidade não informada"} · Presencial`;

    const medico = document.createElement("p");
    medico.className = "laudo-medico";

    medico.textContent =
      `Médico: ${obterNomeMedico(consulta)} ` +
      `(CRM: ${consulta.medico?.crm || "-"})`;

    const data = document.createElement("span");
    data.className = "laudo-data";
    data.textContent = fmtDataHora(consulta.dia_hora);

    informacoes.appendChild(titulo);
    informacoes.appendChild(medico);

    header.appendChild(informacoes);
    header.appendChild(data);

    // Conteúdo do laudo.
    const conteudo = document.createElement("div");
    conteudo.className = "laudo-conteudo";

    // textContent impede que o conteúdo do laudo seja interpretado como HTML.
    conteudo.textContent = consulta.laudo;

    // Preserva quebras de linha do texto do laudo.
    conteudo.style.whiteSpace = "pre-wrap";

    // Monta o cartão.
    card.appendChild(header);
    card.appendChild(conteudo);

    // Adiciona o cartão à página.
    lista.appendChild(card);
  });

})();
