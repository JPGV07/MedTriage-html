// URL principal da API do sistema MedTriage
const RAILWAY_API = "https://triagemapi-production.up.railway.app";

// Configurações utilizadas pelo sistema
export const CONFIG = {
  // Define o endereço da API que será utilizado
  // Permite alterar o endereço por meio do MEDTRIAGE_API_BASE
  API_BASE: (window.MEDTRIAGE_API_BASE !== undefined
    ? window.MEDTRIAGE_API_BASE
    : RAILWAY_API
  ).replace(/\/+$/, ""),

  // Define se o CAPTCHA está ativado
  CAPTCHA_ENABLED: false,

  // Chave utilizada para configurar o CAPTCHA
  CAPTCHA_SITEKEY: "10000000-ffff-ffff-ffff-000000000001",
};

// Nomes das informações armazenadas no navegador
export const K = {
  token: "@medtriage/token", // Token de autenticação
  sessao: "@medtriage/sessao", // Dados da sessão do usuário
  pacienteId: "@medtriage/paciente-id", // ID do paciente
  medicoCrm: "@medtriage/medico-crm", // CRM do médico
  agendTemp: "@medtriage/agend-temp", // Agendamento temporário
  consultaSel: "@medtriage/consulta-sel", // Consulta selecionada
  consultaReag: "@medtriage/consulta-reag", // Consulta reagendada
  consultaCanc: "@medtriage/consulta-canc", // Consulta cancelada
  consultaAtend: "@medtriage/consulta-atend", // Consulta em atendimento
  consultaNova: "@medtriage/consulta-nova", // Nova consulta
  medicoSel: "@medtriage/medico-sel", // Médico selecionado
  historicoPac: "@medtriage/historico-pac", // Histórico do paciente
};

// Textos apresentados para cada situação de uma consulta
export const STATUS_LABEL = {
  EM_AGUARDO: "Aguardando",
  CONCLUIDA: "Realizada",
  CANCELADA: "Cancelada",
};

// Nomes das especialidades médicas exibidas no sistema
export const ESP_LABEL = {
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
};