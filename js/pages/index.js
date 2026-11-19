
import { $, mascararCPF } from "../core/utils.js";

import {
    apiFetch,
    setToken,
    bootstrapSessao,
    parseJwt
} from "../core/auth.js";

import { K } from "../core/config.js";

import {
    getCaptchaToken,
    renderCaptchaWidgets,
    resetCaptcha
} from "../core/captcha.js";

import { initCommon } from "../core/init.js";

initCommon();

const form = $("login-form");

if (form) {

    // Elementos da página
    const btnPac = $("btn-paciente");
    const btnProf = $("btn-profissional");

    const label = $("label-id");
    const input = $("input-id");

    const senha = $("senha");

    const linkCadastro = $("link-cadastro");

    // Perfil inicial
    let perfil = "paciente";

    // Inicializar CAPTCHA
    renderCaptchaWidgets();

    // ==============================
    // SELECIONAR PACIENTE
    // ==============================

    btnPac?.addEventListener("click", () => {

        perfil = "paciente";

        btnPac.classList.add("active");
        btnProf?.classList.remove("active");

        document.body.classList.remove("theme-professional");

        // Configurar CPF
        label.textContent = "CPF";

        input.value = "";
        input.placeholder = "000.000.000-00";
        input.maxLength = 14;
        input.inputMode = "numeric";

        input.focus();

        // Link de cadastro
        if (linkCadastro) {

            linkCadastro.href = "cadastro.html";

            linkCadastro.textContent = "Criar meu acesso";
        }

    });

    // ==============================
    // SELECIONAR PROFISSIONAL
    // ==============================

    btnProf?.addEventListener("click", () => {

        perfil = "profissional";

        btnProf.classList.add("active");
        btnPac?.classList.remove("active");

        document.body.classList.add("theme-professional");

        // Configurar matrícula
        label.textContent = "Matrícula";

        input.value = "";
        input.placeholder = "Digite sua matrícula";
        input.maxLength = 30;
        input.inputMode = "text";

        input.focus();

        // Link de cadastro
        if (linkCadastro) {

            linkCadastro.href = "cadastro_medico.html";

            linkCadastro.textContent = "Cadastrar como médico";
        }

    });

    // ==============================
    // FORMATAÇÃO DO IDENTIFICADOR
    // ==============================

    input.addEventListener("input", (e) => {

        if (perfil === "profissional") {

            // Matrícula aceita letras e números
            e.target.value = e.target.value
                .replace(/[^a-zA-Z0-9]/g, "")
                .toUpperCase()
                .slice(0, 30);

        } else {

            // CPF aceita somente números
            let cpf = e.target.value.replace(/\D/g, "");

            // Limitar a 11 dígitos
            cpf = cpf.slice(0, 11);

            // Aplicar máscara
            e.target.value = mascararCPF(cpf);

        }

    });

    // ==============================
    // ENVIAR LOGIN
    // ==============================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const id = input.value.trim();

        const senhaValor = senha.value;

        // Verificar campos
        if (!id || !senhaValor) {

            alert("Preencha todos os campos.");

            return;
        }

        // ==============================
        // VALIDAR CPF
        // ==============================

        if (perfil === "paciente") {

            const cpf = id.replace(/\D/g, "");

            if (cpf.length !== 11) {

                alert("Digite um CPF com 11 números.");

                input.focus();

                return;
            }

        }

        // ==============================
        // VALIDAR MATRÍCULA
        // ==============================

        if (perfil === "profissional") {

            if (!/^[A-Z0-9]{1,30}$/.test(id)) {

                alert("Digite uma matrícula válida.");

                input.focus();

                return;
            }

        }

        try {

            // Enviar dados para o backend
            const r = await apiFetch("/register/login", {

                method: "POST",

                body: JSON.stringify({

                    document: perfil === "paciente"
                        ? id.replace(/\D/g, "")
                        : id,

                    senha: senhaValor,

                    captchaToken: getCaptchaToken()

                })

            });

            // Verificar resposta
            if (!r || !r.token) {

                throw new Error(
                    "O servidor não retornou um token de autenticação."
                );

            }

            // Salvar token
            setToken(r.token);

            // Limpar sessão anterior
            localStorage.removeItem(K.sessao);

            // Interpretar JWT
            const claims = parseJwt(r.token);

            if (!claims) {

                throw new Error("Token de autenticação inválido.");

            }

            // Identificar perfil retornado pelo backend
            const role = String(claims.role || "").toUpperCase();

            // Verificar compatibilidade do perfil
            if (perfil === "paciente" && role !== "CLIENTE") {

                throw new Error(
                    "Este acesso não pertence a uma conta de paciente."
                );

            }

            if (perfil === "profissional" && role !== "MEDICO") {

                throw new Error(
                    "Este acesso não pertence a uma conta profissional."
                );

            }

            // Recuperar sessão
            await bootstrapSessao();

            // Redirecionamento
            if (role === "CLIENTE") {

                window.location.href = "paciente_dashboard.html";

            } else if (role === "MEDICO") {

                window.location.href = "medico_dashboard.html";

            } else {

                throw new Error("Tipo de usuário não reconhecido.");

            }

        } catch (err) {

            // Reiniciar CAPTCHA
            resetCaptcha();

            alert(
                err.message ||
                "Não foi possível realizar o login."
            );

        }

    });

}
