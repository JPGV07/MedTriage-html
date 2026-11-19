
import { $, fmtPreco } from "../core/utils.js";
import { K, ESP_LABEL } from "../core/config.js";
import { requireLogin, apiFetch } from "../core/auth.js";
import { preencherGreeting } from "../core/ui.js";
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados.
initCommon();

(async () => {
  // Verifica se o formulário existe nesta página.
  const form = $("form-perfil-medico");
  if (!form) return;

  // Verifica a autenticação.
  const s = await requireLogin();
  if (!s) return;

  // Impede que pacientes acessem o perfil médico.
  if (s.role === "CLIENTE") {
    window.location.replace("paciente_dashboard.html");
    return;
  }

  // Aplica o tema visual profissional.
  document.body.classList.add("theme-professional");

  // Preenche a saudação.
  preencherGreeting();

  // Recupera o CRM salvo durante a autenticação.
  const crm = localStorage.getItem(K.medicoCrm) || s.crm;

  if (!crm) {
    alert("CRM do médico não encontrado. Faça login novamente.");
    window.location.replace("index.html");
    return;
  }

  // Recupera os campos do formulário.
  const campoNome = $("perfil-nome");
  const campoMatricula = $("perfil-matricula");
  const campoCrm = $("perfil-crm");
  const campoEspecialidade = $("perfil-especialidade");
  const campoPreco = $("perfil-preco");

  if (!campoNome || !campoPreco) {
    console.error("Campos obrigatórios do perfil médico não encontrados.");
    return;
  }

  // Busca os dados do médico no backend.
  let medico;

  try {
    medico = await apiFetch(
      `/med/${encodeURIComponent(crm)}`
    );

    if (!medico || !medico.crm) {
      throw new Error("O backend não retornou os dados do médico.");
    }

  } catch (erro) {
    console.error("Erro ao carregar perfil médico:", erro);

    alert(
      erro.message ||
      "Não foi possível carregar os dados do médico."
    );

    window.location.href = "medico_dashboard.html";
    return;
  }

  // Recupera os dados do funcionário.
  const funcionario = medico.funcionario || {};
  const usuario = funcionario.usuario || {};

  // Preenche os campos com os dados recebidos.
  campoNome.value =
    usuario.nome ||
    funcionario.nome ||
    medico.nome ||
    "";

  if (campoMatricula) {
    campoMatricula.value = funcionario.matricula || "";
  }

  if (campoCrm) {
    campoCrm.value = medico.crm || "";
  }

  if (campoEspecialidade) {
    campoEspecialidade.value =
      ESP_LABEL[medico.especialidade] ||
      medico.especialidade ||
      "";
  }

  // Formata o preço da consulta.
  campoPreco.value = fmtPreco(medico.preco_consulta);

  // Impede o envio de várias atualizações simultâneas.
  let enviando = false;

  // Converte valores monetários brasileiros para número.
  function converterPreco(valor) {
    let texto = String(valor || "")
      .trim()
      .replace(/R\$/gi, "")
      .replace(/\s/g, "");

    if (!texto) return NaN;

    // Quando existe vírgula, considera o padrão brasileiro:
    // 1.234,56 -> 1234.56
    if (texto.includes(",")) {
      texto = texto
        .replace(/\./g, "")
        .replace(",", ".");
    }

    // Remove caracteres que não fazem parte do número.
    texto = texto.replace(/[^\d.-]/g, "");

    return Number(texto);
  }

  // Processa a atualização do perfil.
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (enviando) return;

    // Recupera os valores preenchidos.
    const nome = campoNome.value.trim();
    const preco = converterPreco(campoPreco.value);

    // Valida o nome.
    if (!nome) {
      alert("Informe o nome do médico.");
      campoNome.focus();
      return;
    }

    // Valida o preço.
    if (!Number.isFinite(preco) || preco <= 0) {
      alert("Informe um preço válido maior que zero.");
      campoPreco.focus();
      return;
    }

    enviando = true;

    const botao = form.querySelector('[type="submit"]');

    if (botao) {
      botao.disabled = true;
      botao.textContent = "Salvando...";
    }

    try {
      // Envia somente os campos editáveis.
      await apiFetch(
        `/med/${encodeURIComponent(crm)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            nome: nome,
            preco_consulta: preco
          })
        }
      );

      alert("Perfil atualizado com sucesso!");

      // Retorna ao painel médico.
      window.location.href = "medico_dashboard.html";

    } catch (erro) {
      console.error("Erro ao atualizar perfil:", erro);

      alert(
        erro.message ||
        "Não foi possível atualizar o perfil médico."
      );

      // Libera o formulário para nova tentativa.
      enviando = false;

      if (botao) {
        botao.disabled = false;
        botao.textContent = "Salvar alterações";
      }
    }
  });
})();
