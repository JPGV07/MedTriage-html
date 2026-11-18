// Importa funções auxiliares para buscar elementos, formatar CPF e validar CRM
import { $, mascararCPF, normalizarCRM } from "../core/utils.js";

// Importa funções de comunicação com a API e autenticação
import { apiFetch, setToken, bootstrapSessao } from "../core/auth.js";

// Importa funções responsáveis pelo CAPTCHA
import { getCaptchaToken, renderCaptchaWidgets, resetCaptcha } from "../core/captcha.js";

// Importa a inicialização das configurações comuns
import { initCommon } from "../core/init.js";

// Inicializa as configurações comuns da página
initCommon();

// Busca o formulário de cadastro médico
const form = $("cadastro-medico-form");

if (form) {
  // Configura os campos de CAPTCHA
  renderCaptchaWidgets();

  // Busca os campos de matrícula, CRM e CPF
  const mat = $("medico-matricula");
  const crm = $("medico-crm");
  const cpf = $("medico-cpf");

  // Formata a matrícula para aceitar apenas letras e números em maiúsculas
  if (mat) mat.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  });

  // Transforma as letras do CRM em maiúsculas
  if (crm) crm.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  // Aplica a máscara de CPF enquanto o usuário digita
  if (cpf) cpf.addEventListener("input", (e) => {
    e.target.value = mascararCPF(e.target.value);
  });

  // Processa o envio do formulário de cadastro médico
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recupera os dados informados pelo médico
    const nome = $("medico-nome").value.trim();
    const matricula = mat.value.trim();
    const crmRaw = crm.value.trim();

    // Normaliza o CRM para o formato padrão
    const crmNorm = normalizarCRM(crmRaw);

    const cpfVal = cpf.value.trim();
    const especialidade = $("medico-especialidade").value;
    const precoRaw = $("medico-preco").value.trim();
    const email = $("medico-email").value.trim();
    const senha = $("medico-senha").value;
    const repetir = $("medico-repetir-senha").value;

    // Verifica se o nome possui pelo menos três caracteres
    if (nome.length < 3) return alert("Informe seu nome completo.");

    // Verifica se a matrícula possui o formato esperado
    if (matricula.length < 4 || !matricula.startsWith("MED")) return alert("Matrícula inválida (ex: MED5001).");

    // Verifica se o CRM foi informado corretamente
    if (!crmNorm) return alert("CRM inválido. Use o formato CRM-UF 12345.");

    // Verifica se o CPF está completo
    if (cpfVal.length !== 14) return alert("CPF incompleto.");

    // Verifica se uma especialidade foi selecionada
    if (!especialidade) return alert("Selecione a especialidade.");

    // Verifica se as senhas são iguais
    if (senha !== repetir) return alert("As senhas não coincidem.");

    // Verifica se a senha possui pelo menos seis caracteres
    if (senha.length < 6) return alert("Senha muito curta.");

    // Converte o preço informado para um valor numérico
    const precoNum = parseFloat(precoRaw.replace(/[^\d,]/g, "").replace(",", "."));

    // Verifica se o preço é válido e maior que zero
    if (!precoNum || precoNum <= 0) return alert("Informe um preço válido.");

    // Relaciona os nomes das especialidades aos valores utilizados pelo backend
    const mapMed = {
      "Clínico geral": "CLINICO_GERAL",
      "Pediatra": "PEDIATRA",
      "Ginecologista": "GINECOLOGISTA",
      "Cardiologista": "CARDIOLOGISTA",
      "Dermatologista": "DERMATOLOGISTA",
      "Oftalmologista": "OFTALMOLOGISTA",
      "Ortopedista": "ORTOPEDISTA",
      "Neurologista": "NEUROLOGISTA",
      "Psiquiatra": "PSIQUIATRA",
      "Endocrinologista": "ENDOCRINOLOGISTA",
    };

    // Obtém o código da especialidade selecionada
    const espEnum = mapMed[especialidade] || "CLINICO_GERAL";

    try {
      // Cria a conta de usuário do profissional no backend
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          cpf: cpfVal, senha, email, role: "FUNCIONARIO",
          captchaToken: getCaptchaToken(),
        }),
      });

      // Cadastra os dados do funcionário
      await apiFetch("/func", {
        method: "POST",
        body: JSON.stringify({
          matricula, usuario: cpfVal, profissao: "MEDICO", nome,
        }),
      });

      // Cadastra os dados profissionais do médico
      await apiFetch("/med", {
        method: "POST",
        body: JSON.stringify({
          crm: crmNorm,
          especialidade: espEnum,
          status: "ATIVO",
          preco_consulta: precoNum,
          funcionario: matricula,
        }),
      });

      // Realiza o login automático após o cadastro
      const r = await apiFetch("/register/login", {
        method: "POST",
        body: JSON.stringify({ document: matricula, senha, captchaToken: "" }),
      });

      // Salva o token de autenticação recebido
      setToken(r.token);

      // Recupera os dados da sessão do médico
      await bootstrapSessao();

      // Informa que a conta profissional foi criada
      alert("Conta profissional criada!");

      // Redireciona para o painel médico
      window.location.href = "medico_dashboard.html";

    } catch (err) {
      // Reinicia o CAPTCHA caso ocorra algum erro
      resetCaptcha();

      // Exibe a mensagem de erro recebida
      alert(err.message);
    }
  });
}