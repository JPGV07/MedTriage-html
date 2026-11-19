
import { CONFIG, K } from "./config.js";

// =====================================================
// TOKEN DE AUTENTICAÇÃO
// =====================================================

// Recupera o token armazenado.
export const getToken = () => localStorage.getItem(K.token);

// Salva o token.
export const setToken = (t) => {
    if (!t) {
        localStorage.removeItem(K.token);
        return;
    }

    localStorage.setItem(K.token, t);
};

// =====================================================
// LIMPAR AUTENTICAÇÃO
// =====================================================

export function clearAuth() {

    [
        K.token,
        K.sessao,
        K.pacienteId,
        K.pacienteCpf,
        K.medicoCrm,
        K.agendTemp,
        K.consultaSel,
        K.consultaReag,
        K.consultaCanc,
        K.consultaAtend,
        K.consultaNova,
        K.medicoSel,
        K.historicoPac,
        "medtriage_token",
        "medtriage_user"
    ].forEach(k => localStorage.removeItem(k));

    sessionStorage.clear();
}

// =====================================================
// SAIR DO SISTEMA
// =====================================================

export function logout() {
    clearAuth();
    window.location.replace("index.html");
}

// =====================================================
// RECUPERAR SESSÃO
// =====================================================

export function getSessao() {
    try {
        return JSON.parse(
            localStorage.getItem(K.sessao) || "null"
        );
    } catch {
        return null;
    }
}

// =====================================================
// SALVAR SESSÃO
// =====================================================

export function setSessao(s) {
    localStorage.setItem(
        K.sessao,
        JSON.stringify(s)
    );
}

// =====================================================
// DECODIFICAR TOKEN JWT
// =====================================================

export function parseJwt(t) {
    try {

        if (!t || typeof t !== "string") {
            return null;
        }

        const partes = t.split(".");

        if (partes.length !== 3 || !partes[1]) {
            return null;
        }

        // Utiliza a segunda parte do JWT (payload).
        const payload = partes[1];

        // Converte Base64URL para Base64.
        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        // Corrige o preenchimento do Base64.
        const padded = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        );

        // Decodifica corretamente caracteres UTF-8.
        const binary = atob(padded);

        const bytes = Uint8Array.from(
            binary,
            c => c.charCodeAt(0)
        );

        const decoded = new TextDecoder().decode(bytes);

        return JSON.parse(decoded);

    } catch {
        return null;
    }
}

// =====================================================
// VERIFICAR EXPIRAÇÃO DO TOKEN
// =====================================================

export function isTokenExpired(t) {

    const claims = parseJwt(t);

    if (!claims || !claims.exp) {
        return true;
    }

    return Date.now() >= Number(claims.exp) * 1000;
}

// =====================================================
// REQUISIÇÕES PARA A API
// =====================================================

export async function apiFetch(path, opts = {}) {

    // Prepara os cabeçalhos.
    const headers = {};

    // Recupera o token.
    const tk = getToken();

    // Verifica se o token existe e se ainda é válido.
    if (tk) {

        if (isTokenExpired(tk)) {
            clearAuth();

            const atual = window.location.pathname
                .split("/")
                .pop();

            if (atual !== "index.html" && atual !== "") {
                window.location.replace("index.html");
            }

            throw new Error(
                "Sessão expirada. Faça login novamente."
            );
        }

        headers["Authorization"] = "Bearer " + tk;
    }

    // Não define Content-Type para FormData.
    if (!(opts.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // Adiciona cabeçalhos personalizados.
    Object.assign(headers, opts.headers || {});

    // Executa a requisição.
    const res = await fetch(
        CONFIG.API_BASE + path,
        {
            ...opts,
            headers
        }
    );

    // Verifica autenticação.
    if (res.status === 401) {

        clearAuth();

        const atual = window.location.pathname
            .split("/")
            .pop();

        if (atual !== "index.html" && atual !== "") {
            window.location.replace("index.html");
        }

        throw new Error(
            "Sessão expirada. Faça login novamente."
        );
    }

    // Verifica erros retornados pelo backend.
    if (!res.ok) {

        let msg = `Erro ${res.status}`;

        try {

            const j = await res.json();

            msg =
                j.response ||
                j.message ||
                j.error ||
                msg;

        } catch {
            // Resposta sem JSON.
        }

        throw new Error(msg);
    }

    // Resposta sem conteúdo.
    if (res.status === 204) {
        return null;
    }

    // Recupera o conteúdo.
    const text = await res.text();

    if (!text) {
        return null;
    }

    // Converte JSON quando possível.
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// =====================================================
// RESTAURAR SESSÃO DO USUÁRIO
// =====================================================

export async function bootstrapSessao() {

    // Recupera o token.
    const tk = getToken();

    // Verifica se existe autenticação.
    if (!tk || isTokenExpired(tk)) {
        clearAuth();
        return null;
    }

    // Recupera a sessão armazenada.
    const atual = getSessao();

    // Evita novas consultas quando a sessão já está completa.
    if (
        atual &&
        atual.id &&
        (
            atual.pacienteId ||
            atual.crm
        )
    ) {
        return atual;
    }

    // Decodifica os dados do token.
    const claims = parseJwt(tk);

    if (!claims) {
        clearAuth();
        return null;
    }

    // Recupera identificação e perfil.
    const role = claims.role;
    const sub = claims.sub;

    if (!role || !sub) {
        clearAuth();
        return null;
    }

    try {

        // =================================================
        // SESSÃO DO PACIENTE
        // =================================================

        if (role === "CLIENTE") {

            // Recupera o CPF do token.
            const cpf = claims.cpf || sub;

            // Busca o paciente no backend.
            const p = await apiFetch(
                `/pac/usuario/${encodeURIComponent(cpf)}`
            );

            if (!p || p.id == null) {
                throw new Error(
                    "Não foi possível recuperar os dados do paciente."
                );
            }

            // Armazena o ID do paciente.
            localStorage.setItem(
                K.pacienteId,
                String(p.id)
            );

            // Armazena o CPF.
            localStorage.setItem(
                K.pacienteCpf,
                cpf
            );

            // Monta a sessão.
            const s = {

                id: cpf,

                cpf: cpf,

                nome:
                    p.usuario?.nome ||
                    p.nome ||
                    claims.nome ||
                    "Paciente",

                role: role,

                pacienteId: p.id

            };

            setSessao(s);

            return s;
        }

        // =================================================
        // SESSÃO DO FUNCIONÁRIO / MÉDICO
        // =================================================

        const matricula = claims.matricula || sub;

        // Busca o funcionário pelo identificador.
        const m = await apiFetch(
            `/med/funcionario/${encodeURIComponent(matricula)}`
        );

        if (!m || !m.crm) {
            throw new Error(
                "Não foi possível recuperar os dados do funcionário."
            );
        }

        // Armazena o CRM.
        localStorage.setItem(
            K.medicoCrm,
            String(m.crm)
        );

        // Monta a sessão.
        const s = {

            id: matricula,

            matricula: matricula,

            cpf:
                claims.cpf ||
                m.funcionario?.usuario?.cpf ||
                "",

            nome:
                m.funcionario?.usuario?.nome ||
                m.funcionario?.nome ||
                claims.nome ||
                m.crm,

            role: role,

            crm: m.crm

        };

        setSessao(s);

        return s;

    } catch (error) {

        // Não cria uma sessão aparentemente válida
        // quando não consegue confirmar os dados no backend.
        console.error(
            "Erro ao restaurar sessão:",
            error
        );

        return null;
    }
}

// =====================================================
// PROTEGER PÁGINAS DO SISTEMA
// =====================================================

export async function requireLogin() {

    const s = await bootstrapSessao();

    // Impede acesso sem sessão válida.
    if (!s) {

        window.location.replace("index.html");

        return null;
    }

    return s;
}
