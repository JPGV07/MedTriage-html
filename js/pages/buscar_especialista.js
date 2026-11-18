// Importa funções auxiliares para selecionar elementos HTML e formatar preços.
import { $, fmtPreco } from "../core/utils.js";

// Importa as constantes de armazenamento e os rótulos das especialidades médicas.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções responsáveis por verificar o login e realizar requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa uma função assíncrona para carregar e exibir os médicos disponíveis.
(async () => {
  // Verifica se a lista de médicos existe na página.
  if (!$("lista-medicos")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Permite o acesso somente a usuários com perfil de cliente.
  // Caso contrário, redireciona para a página inicial.
  if (s.role !== "CLIENTE") { window.location.replace("index.html"); return; }

  // Preenche a saudação de boas-vindas do paciente.
  preencherGreeting();

  // Recupera os elementos HTML responsáveis pela lista e pelo título dos resultados.
  const lista = $("lista-medicos");
  const titulo = $("titulo-resultados");

  // Inicializa uma lista vazia para armazenar os médicos.
  let medicos = [];

  // Tenta buscar os médicos cadastrados no backend.
  try { medicos = await apiFetch("/med").catch(() => []); }

  // Caso ocorra algum erro na requisição, mantém a lista vazia.
  catch { medicos = []; }

  // Define a função responsável por exibir os médicos na tela.
  const render = (arr) => {
    // Limpa a lista antes de apresentar os novos resultados.
    lista.innerHTML = "";

    // Atualiza o título com a quantidade de médicos encontrados.
    if (titulo) titulo.textContent = `${arr.length} médicos encontrados`;

    // Verifica se nenhum médico foi encontrado.
    if (arr.length === 0) {
      // Exibe uma mensagem informando que não existem médicos disponíveis.
      lista.innerHTML =
        "<p style='color: var(--text-muted); padding: 20px 0;'>" +
        "Nenhum médico disponível para busca no momento. " +
        "(Endpoint <code>GET /med</code> precisa ser implementado no backend.)" +
        "</p>";

      // Encerra a função, pois não há médicos para apresentar.
      return;
    }

    // Percorre a lista de médicos para criar um cartão para cada profissional.
    arr.forEach(m => {
      // Cria um novo elemento HTML para representar o médico.
      const card = document.createElement("div");

      // Define a classe CSS responsável pela aparência do cartão.
      card.className = "doctor-card";

      // Recupera o nome do médico.
      // Caso o nome não esteja disponível, utiliza o CRM como identificação.
      const nome = m.funcionario?.nome || m.crm;

      // Monta o conteúdo do cartão com as informações do médico.
      // Exibe nome, especialidade, CRM, avaliação, preço e botão de agendamento.
      card.innerHTML = `
        <div class="doctor-info">
          <div class="doctor-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="doctor-details">
            <h3>${nome}</h3>
            <p class="specialty">${ESP_LABEL[m.especialidade] || m.especialidade} · ${m.crm}</p>
            <p class="rating">★ 0.0 · <span style="color: var(--text-muted); font-weight: 400;">0 opiniões</span></p>
          </div>
        </div>
        <div class="doctor-action">
          <p class="price">Consulta: ${fmtPreco(m.preco_consulta)}</p>
          <button class="btn btn-primary">Agendar Consulta</button>
        </div>
      `;

      // Configura o botão para selecionar o médico e abrir seu perfil.
      card.querySelector("button").onclick = () => {
        // Armazena o CRM do médico selecionado no navegador.
        localStorage.setItem(K.medicoSel, m.crm);

        // Redireciona o paciente para a página de perfil do médico.
        window.location.href = "perfil_medico.html";
      };

      // Adiciona o cartão do médico à lista exibida na página.
      lista.appendChild(card);
    });
  };

  // Recupera o botão responsável por realizar a busca com filtros.
  const btn = $("btn-buscar");

  // Adiciona um evento de clique ao botão de busca, caso ele exista.
  if (btn) btn.addEventListener("click", () => {
    // Recupera a especialidade selecionada no campo de filtro.
    const esp = $("filtro-especialidade").value;

    // Filtra a lista de médicos de acordo com a especialidade escolhida.
    const filtro = medicos.filter(m => {
      // Quando a opção "Todas" estiver selecionada, mantém todos os médicos.
      if (esp === "Todas") return true;

      // Relaciona os nomes exibidos no filtro com os valores utilizados no backend.
      const map = {
        "Oftalmologista": "OFTALMOLOGISTA",
        "Cardiologista": "CARDIOLOGISTA",
        "Dermatologista": "DERMATOLOGISTA",
        "Clínico geral": "CLINICO_GERAL",
      };

      // Mantém somente os médicos cuja especialidade corresponde ao filtro selecionado.
      return m.especialidade === map[esp];
    });

    // Atualiza a lista na tela com os médicos encontrados no filtro.
    render(filtro);
  });

  // Exibe inicialmente todos os médicos retornados pela API.
  render(medicos);
})();