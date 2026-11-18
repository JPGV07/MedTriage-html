// Busca um elemento HTML pelo seu ID
export const $ = (id) => document.getElementById(id);

// Gera uma data no formato AAAA-MM-DD
export function gerarIdData(a, m, d) {
  return `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Converte a data e o horário para o formato ISO
export function dataParaISO(dataStr, hora) {
  return `${dataStr}T${hora}:00`;
}

// Aplica a máscara de CPF no formato 000.000.000-00
export function mascararCPF(v) {
  let s = String(v || "").replace(/\D/g, "").slice(0, 11);
  s = s.replace(/(\d{3})(\d)/, "$1.$2");
  s = s.replace(/(\d{3})(\d)/, "$1.$2");
  s = s.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return s;
}

// Remove todos os caracteres que não são números
export const soDigitos = (s) => String(s || "").replace(/\D/g, "");

// Padroniza e valida o formato do CRM informado
export function normalizarCRM(v) {
  const t = String(v || "").trim().toUpperCase().replace(/\s+/g, " ");

  // Lista de siglas dos estados brasileiros
  const UFS = new Set([
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
    "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
  ]);

  // Verifica se a UF aparece antes do número do CRM
  const ufAntes = t.match(/^(?:CRM[\s-]*)?([A-Z]{2})[\s/-]*(\d{4,7})$/);

  // Verifica se a UF aparece depois do número do CRM
  const ufDepois = t.match(/^(?:CRM[\s-]*)?(\d{4,7})[\s/-]*([A-Z]{2})$/);

  // Identifica a UF e o número do CRM informado
  const uf = ufAntes ? ufAntes[1] : ufDepois ? ufDepois[2] : "";
  const num = ufAntes ? ufAntes[2] : ufDepois ? ufDepois[1] : "";

  // Retorna nulo se o CRM não estiver no formato esperado
  if (!uf || !UFS.has(uf) || !num) return null;

  // Retorna o CRM no formato padronizado
  return `CRM-${uf} ${num}`;
}

// Formata data e horário para exibição
export function fmtDataHora(iso) {
  if (!iso) return "-";

  const d = new Date(iso);

  // Retorna o valor original se a data for inválida
  if (isNaN(d.getTime())) return iso;

  // Adiciona zero à esquerda quando necessário
  const p = (n) => String(n).padStart(2, "0");

  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Formata uma data sem exibir o horário
export function fmtDataOnly(iso) {
  if (!iso) return "-";

  const d = new Date(iso);

  // Verifica se a data é válida
  if (isNaN(d.getTime())) return iso;

  // Adiciona zero à esquerda quando necessário
  const p = (n) => String(n).padStart(2, "0");

  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Formata valores numéricos como preços em reais
export function fmtPreco(v) {
  const n = typeof v === "number" ? v
    : parseFloat(String(v || 0).replace(/[^\d.,]/g, "").replace(",", "."));

  // Retorna o preço com duas casas decimais
  return `R$ ${(isNaN(n) ? 0 : n).toFixed(2).replace(".", ",")}`;
}