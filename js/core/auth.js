// Importa as configurações da API e as chaves de armazenamento
import { CONFIG, K } from "./config.js";

// Recupera o token de autenticação armazenado no navegador
export const getToken = () => localStorage.getItem(K.token);

// Salva o token de autenticação no navegador
export const setToken = (t) => localStorage.setItem(K.token, t);

// Remove os dados de autenticação e da sessão do usuário
export function clearAuth() {
  [K.token, K.sessao, K.pacienteId, K.medicoCrm].forEach(k => localStorage.removeItem(k));
}

// Recupera os dados da sessão do usuário
export function getSessao() {
  try { 
    return JSON.parse(localStorage.getItem(K.sessao) || "null"); 
  }
  catch { 
    return null; 
  }
}

// Salva os dados da sessão no navegador
export function setSessao(s) {
  localStorage.setItem(K.sessao, JSON.stringify(s));
}

// Decodifica as informações armazenadas no token JWT
export function parseJwt(t) {
  try {
    const p = t.split(".")[1];
    return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { 
    return null; 
  }
}

// Realiza requisições para o backend da API
export async function apiFetch(path, opts = {}) {
  // Define o tipo de conteúdo enviado nas requisições
  const headers = { "Content-Type": "application/json" };

  // Recupera o token de autenticação
  const tk = getToken();

  // Adiciona o token ao cabeçalho da requisição
  if (tk) headers["Authorization"] = "Bearer " + tk;

  // Adiciona outros cabeçalhos, caso existam
  Object.assign(headers, opts.headers || {});

  // Envia a requisição para o backend
  const res = await fetch(CONFIG.API_BASE + path, { ...opts, headers });

  // Verifica se a sessão expirou ou se o usuário não está autenticado
  if (res.status === 401) {
    clearAuth();

    // Verifica qual página está aberta
    const atual = window.location.pathname.split("/").pop();

    // Redireciona para a página inicial
    if (atual !== "index.html" && atual !== "") window.location.href = "index.html";

    throw new Error("Sessão expirada. Faça login novamente.");
  }

  // Verifica se a requisição retornou algum erro
  if (!res.ok) {
    let msg = `Erro ${res.status}`;

    // Tenta recuperar a mensagem de erro enviada pela API
    try {
      const j = await res.json();
      msg = j.response || j.message || j.error || msg;
    } catch { /* corpo vazio */ }

    throw new Error(msg);
  }

  // Retorna vazio quando a API responde com status 204
  if (res.status === 204) return null;

  // Recupera o conteúdo da resposta
  const text = await res.text();

  // Verifica se a resposta está vazia
  if (!text) return null;

  // Tenta converter a resposta para JSON
  try { 
    return JSON.parse(text); 
  }
  catch { 
    return text; 
  }
}

// Recupera os dados do usuário para restaurar sua sessão
export async function bootstrapSessao() {
  // Verifica se existe um token de autenticação
  if (!getToken()) return null;

  // Recupera a sessão já armazenada
  const atual = getSessao();

  // Retorna a sessão se ela já possuir um ID
  if (atual && atual.id) return atual;

  // Decodifica as informações do token
  const claims = parseJwt(getToken());
  if (!claims) return null;

  // Recupera o tipo de usuário e seu identificador
  const role = claims.role;
  const sub = claims.sub;

  try {
    // Verifica se o usuário é um paciente
    if (role === "CLIENTE") {
      // Busca os dados do paciente no backend
      const p = await apiFetch(`/pac/usuario/${encodeURIComponent(sub)}`);

      // Armazena o ID do paciente
      localStorage.setItem(K.pacienteId, String(p.id));

      // Monta os dados da sessão do paciente
      const s = { id: sub, nome: p.nome || "Paciente", role, pacienteId: p.id };

      // Salva e retorna a sessão
      setSessao(s);
      return s;
    }

    // Busca os dados do funcionário ou médico no backend
    const m = await apiFetch(`/med/funcionario/${encodeURIComponent(sub)}`);

    // Armazena o CRM do médico
    localStorage.setItem(K.medicoCrm, m.crm);

    // Monta os dados da sessão do funcionário
    const s = {
      id: sub,
      nome: (m.funcionario && m.funcionario.nome) || m.crm,
      role,
      crm: m.crm,
    };

    // Salva e retorna a sessão
    setSessao(s);
    return s;

  } catch {
    // Cria uma sessão incompleta caso não consiga recuperar os dados
    const s = { id: sub, nome: "-", role, incompleto: true };
    setSessao(s);
    return s;
  }
}

// Verifica se o usuário está autenticado antes de acessar uma página
export async function requireLogin() {
  const s = await bootstrapSessao();

  // Redireciona para a página inicial se não houver sessão válida
  if (!s) { 
    window.location.replace("index.html"); 
    return null; 
  }

  return s;
}