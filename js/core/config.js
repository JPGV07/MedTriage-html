
// =====================================================
// CONFIGURAÇÃO PRINCIPAL DA API MEDTRIAGE
// =====================================================

// Endereço de produção do backend hospedado no Railway.
const DEFAULT_API = "https://triagemapi-production.up.railway.app";

// =====================================================
// CONFIGURAÇÕES GERAIS
// =====================================================

export const CONFIG = {

    // Endereço da API.
    // Permite substituir o endereço usando MEDTRIAGE_API_BASE.
    API_BASE: (
        window.MEDTRIAGE_API_BASE !== undefined
            ? window.MEDTRIAGE_API_BASE
            : DEFAULT_API
    ).replace(/\/+$/, ""),

    // Deve possuir o mesmo valor de HCAPTCHA_ENABLED
    // configurado no application.properties do backend.
    CAPTCHA_ENABLED: true,

    // Chave pública de configuração do hCaptcha.
    CAPTCHA_SITEKEY: "10000000-ffff-ffff-ffff-000000000001",

};

// =====================================================
// CHAVES DE ARMAZENAMENTO DO NAVEGADOR
// =====================================================

export const K = {

    token: "@medtriage/token",

    sessao: "@medtriage/sessao",

    pacienteId: "@medtriage/paciente-id",

    pacienteCpf: "@medtriage/paciente-cpf",

    medicoCrm: "@medtriage/medico-crm",

    agendTemp: "@medtriage/agend-temp",

    consultaSel: "@medtriage/consulta-sel",

    consultaReag: "@medtriage/consulta-reag",

    consultaCanc: "@medtriage/consulta-canc",

    consultaAtend: "@medtriage/consulta-atend",

    consultaNova: "@medtriage/consulta-nova",

    medicoSel: "@medtriage/medico-sel",

    historicoPac: "@medtriage/historico-pac",

};

// =====================================================
// SITUAÇÕES DAS CONSULTAS
// =====================================================

export const STATUS_LABEL = {

    EM_AGUARDO: "Aguardando",

    CONCLUIDA: "Realizada",

    CANCELADA: "Cancelada",

};

// =====================================================
// ESPECIALIDADES MÉDICAS
// =====================================================

export const ESP_LABEL = {

    // Especialidades utilizadas nas consultas.

    CARDIOLOGIA: "Cardiologia",

    CLINICA_GERAL: "Clínica Geral",

    PEDIATRA: "Pediatra",

    DERMATOLOGIA: "Dermatologia",

    ORTOPEDIA: "Ortopedia",

    NEUROLOGIA: "Neurologia",

    GINECOLOGIA: "Ginecologia",

    OFTALMOLOGIA: "Oftalmologia",

    PSIQUIATRIA: "Psiquiatria",

    ENDOCRINOLOGIA: "Endocrinologia",

    // Especialidades utilizadas no cadastro dos médicos.

    CARDIOLOGISTA: "Cardiologista",

    CLINICO_GERAL: "Clínico Geral",

    DERMANTOLOGISTA: "Dermatologista",

    ORTOPEDISTA: "Ortopedista",

    NEUROLOGISTA: "Neurologista",

    GINECOLOGISTA: "Ginecologista",

    OFTALMOLOGISTA: "Oftalmologista",

    PSIQUIATRA: "Psiquiatra",

    ENDOCRINOLOGISTA: "Endocrinologista",

};
