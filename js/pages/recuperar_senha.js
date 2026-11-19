
import { $, mascararCPF } from "../core/utils.js";
import { validarCPF } from "../core/validators.js";
import { apiFetch } from "../core/auth.js";
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados.
initCommon();

const form = $("recuperar-form");

if (form) {
  // Recupera o perfil selecionado na tela anterior.
  const perfil = localStorage.getItem("@medtriage/reset-perfil") || "paciente";

  const profissional = perfil === "profissional";

  // Recupera os elementos do formulário.
  const label = $("label-recuperar-id");
  const input = $("input-recuperar-id");
  const novaSenha = $("nova-senha-recuperar");
  const repetirSenha = $("repetir-senha-recuperar");
  const botao = form.querySelector('[type="submit"]');

  // Verifica se os elementos obrigatórios existem.
  if (!input || !novaSenha || !repetirSenha) {
    console.error("Campos obrigatórios da recuperação de senha não encontrados.");
    return;
  }

  // Configura o campo de identificação conforme o perfil.
  if (profissional) {
    document.body.classList.add("theme-professional");

    if (label) {
      label.textContent = "Matrícula";
    }

    input.placeholder = "Digite sua matrícula (ex: MED001)";
    input.removeAttribute("maxlength");
    input.setAttribute("autocomplete", "username");

    // Permite somente letras e números.
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
    });

  } else {
    if (label) {
      label.textContent = "CPF";
    }

    input.placeholder = "000.000.000-00";
    input.setAttribute("maxlength", "14");
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "off");

    // Aplica a máscara e impede letras, inclusive em conteúdos colados.
    input.addEventListener("input", (e) => {
      const numeros = e.target.value.replace(/\D/g, "").slice(0, 11);
      e.target.value = mascararCPF(numeros);
    });

    // Bloqueia caracteres que não sejam números durante a digitação.
    input.addEventListener("keydown", (e) => {
      const teclasPermitidas = [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End"
      ];

      if (
        teclasPermitidas.includes(e.key) ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }

      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });
  }

  // Processa o formulário de recuperação.
  let enviando = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (enviando) return;

    // Recupera e normaliza os dados informados.
    let identificador = input.value.trim();

    const senha = novaSenha.value;
    const repetir = repetirSenha.value;

    if (profissional) {
      identificador = identificador
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
    } else {
      identificador = identificador.replace(/\D/g, "");
    }

    // Verifica o identificador.
    if (!identificador) {
      alert(
        profissional
          ? "Informe sua matrícula."
          : "Informe seu CPF."
      );
      input.focus();
      return;
    }

    // Valida o CPF.
    if (!profissional && !validarCPF(identificador)) {
      alert("Informe um CPF válido.");
      input.focus();
      return;
    }

    // Verifica o tamanho da senha.
    if (senha.length < 8) {
      alert("A nova senha deve ter no mínimo 8 caracteres.");
      novaSenha.focus();
      return;
    }

    // Verifica se as senhas coincidem.
    if (senha !== repetir) {
      alert("As senhas não coincidem.");
      repetirSenha.focus();
      return;
    }

    enviando = true;

    if (botao) {
      botao.disabled = true;
      botao.textContent = "Redefinindo senha...";
    }

    try {
      // Envia a solicitação de recuperação ao backend.
      await apiFetch("/users/recuperar-senha", {
        method: "POST",
        body: JSON.stringify({
          identificador: identificador,
          senha: senha
        })
      });

      // Remove o perfil temporário após o sucesso.
      localStorage.removeItem("@medtriage/reset-perfil");

      alert("Senha redefinida com sucesso! Faça login.");

      // Retorna à página de login.
      window.location.href = "index.html";

    } catch (erro) {
      console.error("Erro na recuperação de senha:", erro);

      alert(
        erro.message ||
        "Não foi possível redefinir sua senha. Tente novamente."
      );

      // Libera o formulário para uma nova tentativa.
      enviando = false;

      if (botao) {
        botao.disabled = false;
        botao.textContent = "Redefinir senha";
      }
    }
  });
}
