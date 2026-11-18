// Importa as funções globais que registram ações no window
import "./globals.js";

// Importa as funções de configuração da interface
import { setupLogout, setupTogglePassword } from "./ui.js";

// Inicializa as configurações comuns utilizadas nas páginas
export function initCommon() {
  // Configura os botões para mostrar ou ocultar senhas
  setupTogglePassword();

  // Configura o botão de sair do sistema
  setupLogout();
}