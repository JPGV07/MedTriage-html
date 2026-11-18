// Importa funções auxiliares para buscar elementos e formatar CPF
import { $, mascararCPF } from "../core/utils.js";

// Importa funções de comunicação com a API e autenticação
import { apiFetch, setToken, bootstrapSessao } from "../core/auth.js";

// Importa funções responsáveis pelo CAPTCHA
import { getCaptchaToken, renderCaptchaWidgets, resetCaptcha } from "../core/captcha.js";

// Importa a inicialização das configurações comuns
import { initCommon } from "../core/init.js";

// Inicializa as configurações comuns da página
initCommon();

// Busca o formulário de cadastro
const form = $("cadastro-form");

if (form) {
  // Configura os campos de CAPTCHA
  renderCaptchaWidgets();

  // Busca o campo de CPF
  const inputCpf = $("input-cadastro-id");

  if (inputCpf) {
    // Aplica a máscara de CPF enquanto o usuário digita
    inputCpf.addEventListener("input", (e) => {
      e.target.value = mascararCPF(e.target.value);
    });
  }

  // Processa o envio do formulário de cadastro
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recupera os dados informados pelo usuário
    const nome = $("nome-cadastro").value.trim();
    const cpf = inputCpf.value.trim();
    const senha = $("nova-senha").value;
    const repetir = $("repetir-senha").value;
    const email = $("email-cadastro").value.trim();

    // Verifica se o nome possui pelo menos três caracteres
    if (nome.length < 3) return alert("Informe seu nome completo.");

    // Verifica se a senha possui pelo menos seis caracteres
    if (senha.length < 6) return alert("Senha muito curta (mínimo 6).");

    // Verifica se as duas senhas são iguais
    if (senha !== repetir) return alert("As senhas não coincidem.");

    // Verifica se o CPF foi preenchido corretamente
    if (cpf.length !== 14) return alert("CPF incompleto.");

    // Verifica se o e-mail possui um formato válido
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("E-mail inválido.");

    try {
      // Envia os dados da conta para criar o usuário no backend
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          cpf, senha, email, role: "CLIENTE",
          captchaToken: getCaptchaToken(),
        }),
      });

      // Cadastra os dados pessoais do paciente
      await apiFetch("/pac", {
        method: "POST",
        body: JSON.stringify({ usuario: cpf, nome }),
      });

      // Realiza o login automático após o cadastro
      const r = await apiFetch("/register/login", {
        method: "POST",
        body: JSON.stringify({ document: cpf, senha, captchaToken: "" }),
      });

      // Salva o token de autenticação recebido
      setToken(r.token);

      // Recupera e inicializa os dados da sessão
      await bootstrapSessao();

      // Informa que o cadastro foi concluído
      alert("Conta criada com sucesso!");

      // Redireciona para o painel do paciente
      window.location.href = "paciente_dashboard.html";

    } catch (err) {
      // Reinicia o CAPTCHA caso ocorra algum erro
      resetCaptcha();

      // Exibe a mensagem de erro recebida
      alert(err.message);
    }
  });
}