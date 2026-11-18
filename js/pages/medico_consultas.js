// Importa funções auxiliares para selecionar elementos e formatar datas e horários.
import { $, fmtDataHora } from "../core/utils.js";

// Importa as configurações e os rótulos dos status das consultas.
import { K, STATUS_LABEL } from "../core/config.js";

// Importa as funções responsáveis pela autenticação e pelas requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário na página.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa o carregamento e o funcionamento da página de consultas do médico.
(async () => {
  // Verifica se a lista de consultas do médico existe na página.
  if (!$("lista-consultas-medico")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Impede que usuários com perfil de cliente acessem a área profissional.
  if (s.role === "CLIENTE") { window.location.replace("paciente_dashboard.html"); return; }

  // Aplica o tema visual destinado aos profissionais.
  document.body.classList.add("theme-professional");

  // Preenche a saudação com as informações do usuário.
  preencherGreeting();

  // Recupera o CRM do médico armazenado localmente.
  const crm = localStorage.getItem(K.medicoCrm);

  // Se não houver um CRM, redireciona o usuário para a página inicial.
  if (!crm) { window.location.replace("index.html"); return; }

  // Busca na API todas as consultas vinculadas ao médico.
  const consultas = await apiFetch(`/consulta/medico/${encodeURIComponent(crm)}`);

  // Recupera o elemento onde os cartões das consultas serão exibidos.
  const lista = $("lista-consultas-medico");

  // Recupera o elemento responsável por exibir a mensagem de lista vazia.
  const vazio = $("consultas-vazio");

  // Função responsável por filtrar e renderizar as consultas na página.
  const render = (filtro) => {
    // Limpa os cartões exibidos anteriormente.
    lista.innerHTML = "";

    // Define quais consultas serão exibidas conforme o filtro selecionado.
    const filtradas = filtro === "todas"
      ? consultas
      : consultas.filter(c => c.status === filtro);

    // Verifica se existem consultas correspondentes ao filtro.
    if (filtradas.length === 0) {
      // Oculta a lista de consultas.
      lista.style.display = "none";

      // Exibe a mensagem informando que nenhuma consulta foi encontrada.
      if (vazio) vazio.style.display = "block";
      return;
    }

    // Exibe a lista quando existem consultas disponíveis.
    lista.style.display = "block";

    // Oculta a mensagem de lista vazia.
    if (vazio) vazio.style.display = "none";

    // Percorre as consultas filtradas para criar seus cartões.
    filtradas.forEach(c => {
      // Cria um elemento HTML para representar a consulta.
      const card = document.createElement("div");

      // Define a classe CSS responsável pela aparência do cartão.
      card.className = "consulta-medico-card";

      // Define a classe visual do indicador conforme o status da consulta.
      const badge = c.status === "EM_AGUARDO" ? "waiting"
        : c.status === "CONCLUIDA" ? "attending"
        : "scheduled";

      // Insere no cartão os dados do paciente, da consulta e os botões de ação.
      card.innerHTML = `
        <div class="consulta-medico-info">
          <h3>${c.paciente.nome}</h3>
          <p><strong>${fmtDataHora(c.dia_hora)}</strong> • Presencial</p>
          <span class="badge ${badge}" style="margin-top: 8px;">${STATUS_LABEL[c.status]}</span>
        </div>
        <div class="consulta-medico-actions">
          ${c.status === "EM_AGUARDO"
            ? `<button class="btn btn-primary btn-atend" style="width:auto;padding:10px 20px;font-size:14px;">Iniciar atendimento</button>`
            : ""}
          <button class="btn btn-outline btn-hist" style="width:auto;padding:10px 20px;font-size:14px;">Ver histórico</button>
        </div>
      `;

      // Recupera o botão de iniciar atendimento, caso ele tenha sido criado.
      const btnAtend = card.querySelector(".btn-atend");

      // Configura a ação do botão de iniciar atendimento, quando disponível.
      if (btnAtend) btnAtend.onclick = () => {
        // Salva o ID da consulta selecionada no armazenamento local.
        localStorage.setItem(K.consultaAtend, c.id);

        // Redireciona o médico para a página de atendimento.
        window.location.href = "atendimento.html";
      };

      // Configura a ação do botão responsável por abrir o histórico do paciente.
      card.querySelector(".btn-hist").onclick = () => {
        // Salva os dados do paciente selecionado no armazenamento local.
        localStorage.setItem(K.historicoPac, JSON.stringify({
          nome: c.paciente.nome,
          cpf: c.paciente.usuario?.cpf || "-",
          id: c.paciente.id,
        }));

        // Redireciona o médico para a página de histórico do paciente.
        window.location.href = "medico_historico.html";
      };

      // Adiciona o cartão criado à lista de consultas.
      lista.appendChild(card);
    });
  };

  // Seleciona todos os botões responsáveis pelos filtros de consultas.
  document.querySelectorAll(".filtro-btn").forEach(btn => {
    // Adiciona um evento de clique a cada botão de filtro.
    btn.addEventListener("click", () => {
      // Remove a classe active de todos os botões de filtro.
      document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));

      // Marca como ativo o botão que foi selecionado.
      btn.classList.add("active");

      // Recupera o valor do filtro definido no atributo data-filtro do botão.
      const f = btn.getAttribute("data-filtro");

      // Relaciona os nomes dos filtros da interface aos status utilizados pela API.
      const map = {
        "todas": "todas",
        "Aguardando": "EM_AGUARDO",
        "Realizada": "CONCLUIDA",
        "Cancelada": "CANCELADA",
      };

      // Renderiza as consultas de acordo com o filtro selecionado.
      render(map[f] || "todas");
    });
  });

  // Exibe inicialmente todas as consultas do médico.
  render("todas");
})();