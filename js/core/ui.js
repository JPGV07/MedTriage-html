// Importa a função que busca elementos pelo ID
import { $ } from "./utils.js";

// Importa as funções de sessão e encerramento de autenticação
import { getSessao, clearAuth } from "./auth.js";

// Preenche as mensagens de boas-vindas com o nome do usuário
export function preencherGreeting() {
  // Recupera os dados da sessão atual
  const s = getSessao();
  if (!s) return;

  // Obtém o nome do usuário
  const nome = s.nome || "-";

  // Atualiza todas as mensagens de saudação da página
  document.querySelectorAll("#user-greeting").forEach(el => {
    el.textContent = `Olá, ${nome}`;
  });

  // Atualiza o título de boas-vindas, caso exista
  const wt = $("welcome-title");
  if (wt) wt.textContent = `Olá, ${nome}`;
}

// Configura o botão de sair do sistema
export function setupLogout() {
  // Busca o botão de logout
  const btn = $("btn-logout");
  if (!btn) return;

  // Executa as ações ao clicar no botão
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    // Limpa os dados de autenticação
    clearAuth();

    // Redireciona para a página inicial
    window.location.replace("index.html");
  });
}

// Configura a opção de mostrar ou ocultar a senha
export function setupTogglePassword() {
  // Localiza todos os botões de exibição de senha
  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Busca o campo de senha dentro do elemento
      const w = e.currentTarget.closest(".input-wrapper");
      if (!w) return;

      const input = w.querySelector("input");
      if (!input) return;

      // Alterna entre senha oculta e texto visível
      input.type = input.type === "password" ? "text" : "password";
    });
  });
}