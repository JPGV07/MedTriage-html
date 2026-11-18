// Importa as configurações do sistema
import { CONFIG } from "./config.js";

// Obtém o token de resposta do CAPTCHA
export function getCaptchaToken() {
  // Retorna vazio se o CAPTCHA estiver desativado
  if (!CONFIG.CAPTCHA_ENABLED) return "";

  // Verifica se o hCaptcha está disponível
  if (typeof hcaptcha !== "undefined" && typeof hcaptcha.getResponse === "function") {
    return hcaptcha.getResponse() || "";
  }

  return "";
}

// Exibe e configura os campos de CAPTCHA na página
export function renderCaptchaWidgets() {
  // Não executa a configuração se o CAPTCHA estiver desativado
  if (!CONFIG.CAPTCHA_ENABLED) return;

  // Localiza os elementos que possuem o atributo data-captcha
  document.querySelectorAll("[data-captcha]").forEach(el => {
    el.style.display = "block";

    // Insere o componente do hCaptcha no elemento
    el.innerHTML = `<div class="h-captcha" data-sitekey="${CONFIG.CAPTCHA_SITEKEY}"></div>`;
  });

  // Verifica se o script do hCaptcha já foi carregado
  if (!document.querySelector('script[src*="hcaptcha.com"]')) {
    const s = document.createElement("script");

    // Define o endereço do script do hCaptcha
    s.src = "https://js.hcaptcha.com/1/api.js";

    // Carrega o script de forma assíncrona
    s.async = true;
    s.defer = true;

    // Adiciona o script ao documento HTML
    document.head.appendChild(s);
  }
}

// Reinicia o CAPTCHA para permitir uma nova verificação
export function resetCaptcha() {
  // Verifica se o hCaptcha está disponível antes de reiniciar
  if (typeof hcaptcha !== "undefined" && hcaptcha.reset) hcaptcha.reset();
}