// Importa funções auxiliares para buscar elementos e formatar CPF
import { $, mascararCPF } from "../core/utils.js";

// Importa a função de comunicação com a API
import { apiFetch } from "../core/auth.js";

// Importa a inicialização das configurações comuns
import { initCommon } from "../core/init.js";

// Inicializa as configurações comuns da página
initCommon();

// Busca o formulário de recuperação de senha
const form = $("recuperar-form");

if (form) {
  // Recupera o perfil selecionado para a recuperação de senha
  const perfil = localStorage.getItem("@medtriage/reset-perfil") || "paciente";

  // Busca o campo de identificação e seu rótulo
  const label = $("label-recuperar-id");
  const input = $("input-recuperar-id");

  // Configura os campos para recuperação de senha do profissional
  if (perfil === "profissional") {
    // Aplica o tema visual profissional
    document.body.classList.add("theme-professional");

    // Altera o campo de identificação para matrícula
    if (label) label.textContent = "Matrícula";

    if (input) {
      // Define o texto de orientação do campo
      input.placeholder = "Digite sua matrícula";

      // Permite apenas letras e números na matrícula
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      });
    }

  } else {
    // Configura os campos para recuperação de senha do paciente
    if (label) label.textContent = "CPF";

    if (input) {
      // Aplica a máscara de CPF enquanto o usuário digita
      input.addEventListener("input", (e) => {
        e.target.value = mascararCPF(e.target.value);
      });
    }
  }

  // Processa o envio do formulário de recuperação
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recupera os dados informados pelo usuário
    const id = input.value.trim();
    const nova = $("nova-senha-recuperar").value;
    const repetir = $("repetir-senha-recuperar").value;

    // Verifica se as duas senhas são iguais
    if (nova !== repetir) return alert("As senhas não coincidem.");

    // Verifica se a nova senha possui pelo menos seis caracteres
    if (nova.length < 6) return alert("Senha curta.");

    try {
      // Verifica se a recuperação foi solicitada por um profissional
      if (perfil === "profissional") {
        alert("Reset por matrícula ainda não disponível. Contate o suporte.");
        return;
      }

      // Envia a nova senha do paciente para o backend
      await apiFetch("/users", {
        method: "PUT",
        body: JSON.stringify({ cpf: id, senha: nova }),
      });

      // Remove o perfil salvo após a recuperação
      localStorage.removeItem("@medtriage/reset-perfil");

      // Informa que a senha foi alterada
      alert("Senha redefinida! Faça login.");

      // Redireciona para a página inicial de login
      window.location.href = "index.html";

    } catch (err) {
      // Exibe a mensagem de erro caso a recuperação falhe
      alert(err.message);
    }
  });
}