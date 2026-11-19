import { $, fmtPreco } from "../core/utils.js";
import { K, ESP_LABEL } from "../core/config.js";
import { requireLogin, apiFetch } from "../core/auth.js";
import { preencherGreeting } from "../core/ui.js";
import { initCommon } from "../core/init.js";

initCommon();

const ESPECIALIDADES_ENUM = {
  CARDIOLOGISTA: "Cardiologista",
  CLINICO_GERAL: "Clínico Geral",
  PEDIATRA: "Pediatra",
  DERMANTOLOGISTA: "Dermatologista",
  ORTOPEDISTA: "Ortopedista",
  NEUROLOGISTA: "Neurologista",
  GINECOLOGISTA: "Ginecologista",
  OFTALMOLOGISTA: "Oftalmologista",
  PSIQUIATRA: "Psiquiatra",
  ENDOCRINOLOGISTA: "Endocrinologista"
};

(async () => {
  if (!$("lista-medicos")) return;

  const s = await requireLogin();
  if (!s) return;

  if (s.role !== "CLIENTE") {
    window.location.replace("index.html");
    return;
  }

  preencherGreeting();

  const lista = $("lista-medicos");
  const titulo = $("titulo-resultados");
  const selectEsp = $("filtro-especialidade");
  const inputBusca = $("filtro-busca") || $("busca-medico");

  if (selectEsp) {
    selectEsp.innerHTML = `<option value="Todas">Todas as especialidades</option>`;
    Object.entries(ESPECIALIDADES_ENUM).forEach(([enumKey, label]) => {
      const opt = document.createElement("option");
      opt.value = enumKey;
      opt.textContent = label;
      selectEsp.appendChild(opt);
    });
  }

  let medicos = [];
  try {
    const res = await apiFetch("/med");
    medicos = Array.isArray(res) ? res : [];
  } catch {
    medicos = [];
  }

  const getNomeEspecialidade = (enumVal) => {
    return ESPECIALIDADES_ENUM[enumVal] || (ESP_LABEL && ESP_LABEL[enumVal]) || enumVal;
  };

  const render = (arr) => {
    lista.innerHTML = "";
    if (titulo) titulo.textContent = `${arr.length} médicos encontrados`;

    if (arr.length === 0) {
      lista.innerHTML =
        "<p style='color: var(--text-muted); padding: 20px 0;'>" +
        "Nenhum médico encontrado para os filtros selecionados." +
        "</p>";
      return;
    }

    arr.forEach((m) => {
      const card = document.createElement("div");
      card.className = "doctor-card";

      const nome = m.funcionario?.usuario?.nome || m.funcionario?.nome || `Dr(a). ${m.crm}`;
      const especialidadeTexto = getNomeEspecialidade(m.especialidade);

      card.innerHTML = `
        <div class="doctor-info">
          <div class="doctor-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="doctor-details">
            <h3>${nome}</h3>
            <p class="specialty">${especialidadeTexto} · ${m.crm}</p>
            <p class="rating">Modalidade: Presencial</p>
          </div>
        </div>
        <div class="doctor-action">
          <p class="price">Consulta: ${fmtPreco(m.preco_consulta)}</p>
          <button type="button" class="btn btn-primary">Agendar Consulta</button>
        </div>
      `;

      card.querySelector("button").onclick = () => {
        localStorage.setItem(K.medicoSel, m.crm);
        window.location.href = "perfil_medico.html";
      };

      lista.appendChild(card);
    });
  };

  const aplicarFiltros = () => {
    const esp = selectEsp ? selectEsp.value : "Todas";
    const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : "";

    const filtrados = medicos.filter((m) => {
      const matchEsp = esp === "Todas" || !esp || m.especialidade === esp;
      const nome = (m.funcionario?.usuario?.nome || m.funcionario?.nome || "").toLowerCase();
      const crm = (m.crm || "").toLowerCase();
      const matchTexto = !termo || nome.includes(termo) || crm.includes(termo);
      return matchEsp && matchTexto;
    });

    render(filtrados);
  };

  const btn = $("btn-buscar");
  if (btn) btn.addEventListener("click", aplicarFiltros);
  if (selectEsp) selectEsp.addEventListener("change", aplicarFiltros);
  if (inputBusca) inputBusca.addEventListener("input", aplicarFiltros);

  render(medicos);
})();
