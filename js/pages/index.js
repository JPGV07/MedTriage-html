// Importa funções auxiliares para buscar elementos e formatar CPF
import { $, mascararCPF } from "../core/utils.js";

// Importa funções de autenticação e comunicação com a API
import { apiFetch, setToken, bootstrapSessao, parseJwt } from "../core/auth.js";

// Importa as chaves utilizadas para armazenar dados no navegador
import { K } from "../core/config.js";

// Importa funções responsáveis pelo CAPTCHA
import { getCaptchaToken, renderCaptchaWidgets, resetCaptcha } from "../core/captcha.js";

// Importa a inicialização das configurações comuns
import { initCommon } from "../core/init.js";

// Inicializa as configurações comuns da página
initCommon();

// Busca o formulário de login
const form = $("login-form");

if (form) {
  // Configura os campos de CAPTCHA
  renderCaptchaWidgets();

  // Define o perfil inicial como paciente
  let perfil = "paciente";

  // Busca os botões de seleção de perfil
  const btnPac = $("btn-paciente");
  const btnProf = $("btn-profissional");

  // Busca o campo de identificação e seu rótulo
  const label = $("label-id");
  const input = $("input-id");

  // Verifica se todos os elementos necessários existem
  if (btnPac && btnProf && label && input) {

    // Configura a seleção do perfil de paciente
    btnPac.addEventListener("click", () => {
      perfil = "paciente";

      // Atualiza o botão selecionado
      btnPac.classList.add("active");
      btnProf.classList.remove("active");

      // Remove o tema visual profissional
      document.body.classList.remove("theme-professional");

      // Configura o campo para receber o CPF
      label.textContent = "CPF";
      input.placeholder = "000.000.000-00";
      input.value = "";

      // Atualiza o link de cadastro para pacientes
      const box = document.querySelector(".first-time-box a");
      if (box) {
        box.href = "cadastro.html";
        box.textContent = "Criar meu acesso";
      }
    });

    // Configura a seleção do perfil profissional
    btnProf.addEventListener("click", () => {
      perfil = "profissional";

      // Atualiza o botão selecionado
      btnProf.classList.add("active");
      btnPac.classList.remove("active");

      // Aplica o tema visual profissional
      document.body.classList.add("theme-professional");

      // Configura o campo para receber a matrícula
      label.textContent = "Matrícula";
      input.placeholder = "Digite sua matrícula";
      input.value = "";

      // Atualiza o link de cadastro para médicos
      const box = document.querySelector(".first-time-box a");
      if (box) {
        box.href = "cadastro_medico.html";
        box.textContent = "Cadastrar como médico";
      }
    });

    // Aplica a formatação adequada ao campo de identificação
    input.addEventListener("input", (e) => {

      // Remove caracteres especiais da matrícula e transforma em maiúsculas
      if (perfil === "profissional") {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      // Aplica a máscara de CPF para pacientes
      } else {
        e.target.value = mascararCPF(e.target.value);
      }
    });
  }

  // Processa o envio do formulário de login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recupera os dados informados pelo usuário
    const id = input.value.trim();
    const senha = $("senha").value;

    // Verifica se os campos foram preenchidos
    if (!id || !senha) return alert("Preencha todos os campos.");

    try {
      // Envia os dados de login para o backend
      const r = await apiFetch("/register/login", {
        method: "POST",
        body: JSON.stringify({
          document: id,
          senha,
          captchaToken: getCaptchaToken()
        }),
      });

      // Salva o token de autenticação recebido da API
      setToken(r.token);

      // Remove os dados da sessão anterior
      localStorage.removeItem(K.sessao);

      // Recupera as informações do token JWT
      const claims = parseJwt(r.token);

      // Verifica se o token recebido é válido
      if (!claims) throw new Error("Token inválido.");

      // Recupera os dados da sessão do usuário
      await bootstrapSessao();

      // Redireciona conforme o tipo de usuário
      window.location.href = claims.role === "CLIENTE"
        ? "paciente_dashboard.html"
        : "medico_dashboard.html";

    } catch (err) {
      // Reinicia o CAPTCHA caso ocorra algum erro
      resetCaptcha();

      // Exibe a mensagem de erro
      alert(err.message);
    }
  });
}