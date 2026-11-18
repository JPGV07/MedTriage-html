// Importa funções auxiliares para selecionar elementos, formatar datas,
// mascarar CPF e remover caracteres que não sejam números.
import { $, fmtDataHora, fmtDataOnly, mascararCPF, soDigitos } from "../core/utils.js";

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

// Executa o carregamento e o funcionamento do painel do médico.
(async () => {
  // Verifica se a tabela de pacientes existe na página.
  if (!$("tabela-pacientes-body")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Impede que usuários com perfil de cliente acessem o painel profissional.
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

  // Filtra as consultas que ainda estão aguardando atendimento.
  const aguardando = consultas.filter(c => c.status === "EM_AGUARDO");

  // Filtra as consultas que já foram concluídas.
  const realizadas = consultas.filter(c => c.status === "CONCLUIDA");

  // Conta quantos pacientes diferentes possuem consultas com o médico.
  const pacientesUnicos = new Set(consultas.map(c => c.paciente.id)).size;

  // Exibe a quantidade de pacientes únicos no painel.
  if ($("total-pacientes")) $("total-pacientes").textContent = pacientesUnicos;

  // Exibe a quantidade de consultas que aguardam atendimento.
  if ($("total-consultas")) $("total-consultas").textContent = aguardando.length;

  // Exibe a quantidade de atendimentos concluídos.
  if ($("total-atendimentos")) $("total-atendimentos").textContent = realizadas.length;

  // Recupera o cartão que apresenta a próxima consulta.
  const cardProx = $("card-proxima-consulta");

  // Recupera o cartão exibido quando não existem consultas aguardando.
  const cardSem = $("card-sem-consulta");

  // Verifica se existe pelo menos uma consulta aguardando atendimento.
  if (aguardando.length > 0) {
    // Oculta o cartão que informa a ausência de consultas.
    if (cardSem) cardSem.style.display = "none";

    // Verifica se o cartão da próxima consulta existe.
    if (cardProx) {
      // Remove o atributo hidden para permitir a exibição do cartão.
      cardProx.removeAttribute("hidden");

      // Define o cartão como visível utilizando o layout flexível.
      cardProx.style.display = "flex";

      // Exibe o nome do paciente da primeira consulta da lista de espera.
      $("proxima-consulta-paciente").textContent = aguardando[0].paciente.nome;

      // Exibe a data, o horário e o status da próxima consulta.
      $("proxima-consulta-info").textContent =
        `${fmtDataHora(aguardando[0].dia_hora)} • ${STATUS_LABEL[aguardando[0].status]}`;
    }
  } else {
    // Oculta o cartão da próxima consulta quando não há atendimentos aguardando.
    if (cardProx) { cardProx.hidden = true; cardProx.style.display = "none"; }

    // Exibe o cartão que informa que não existem consultas aguardando.
    if (cardSem) cardSem.style.display = "flex";
  }

  // Recupera o campo utilizado para pesquisar pacientes pelo CPF.
  const inputBusca = $("busca-paciente-cpf");

  // Recupera o botão responsável por limpar o campo de pesquisa.
  const btnLimpar = $("btn-limpar-cpf");

  // Recupera a área onde os resultados da pesquisa serão exibidos.
  const resultado = $("resultado-busca");

  // Recupera o botão responsável por fechar os resultados da pesquisa.
  const btnFechar = $("btn-fechar-busca");

  // Cria um Map para armazenar os pacientes sem repetir seus registros.
  const mapa = new Map();

  // Percorre todas as consultas para identificar os pacientes cadastrados.
  consultas.forEach(c => {
    // Verifica se o paciente ainda não foi adicionado ao Map.
    if (!mapa.has(c.paciente.id)) {
      // Armazena os dados do paciente utilizando seu ID como identificador.
      mapa.set(c.paciente.id, {
        id: c.paciente.id,
        nome: c.paciente.nome,
        cpf: c.paciente.usuario?.cpf || "-",
      });
    }
  });

  // Converte os pacientes armazenados no Map para uma lista.
  const listaPacientes = Array.from(mapa.values());

  // Função responsável por renderizar os pacientes encontrados na tabela.
  const render = (arr) => {
    // Recupera o corpo da tabela de pacientes.
    const body = $("tabela-pacientes-body");

    // Limpa os registros exibidos anteriormente.
    body.innerHTML = "";

    // Verifica se a pesquisa não encontrou nenhum paciente.
    if (arr.length === 0) {
      // Exibe uma mensagem informando que nenhum paciente foi encontrado.
      body.innerHTML = "<tr><td colspan='4' style='text-align:center; color:var(--text-muted); padding: 32px;'>Nenhum paciente encontrado.</td></tr>";
      return;
    }

    // Percorre os pacientes encontrados para criar as linhas da tabela.
    arr.forEach(p => {
      // Verifica se o paciente possui alguma consulta aguardando atendimento.
      const naFila = aguardando.some(c => c.paciente.id === p.id);

      // Define o indicador visual exibido para pacientes que estão na fila.
      const badge = naFila
        ? ' <span style="background:#FEF3C7;color:#B45309;font-size:11px;padding:3px 10px;border-radius:12px;margin-left:10px;font-weight:600;">NA FILA</span>'
        : "";

      // Procura a consulta concluída mais recente do paciente.
      const ult = realizadas
        .filter(c => c.paciente.id === p.id)
        .sort((a, b) => new Date(b.dia_hora) - new Date(a.dia_hora))[0];

      // Cria uma nova linha para apresentar os dados do paciente.
      const tr = document.createElement("tr");

      // Insere o nome, o CPF, a data do último atendimento e o link do histórico.
      tr.innerHTML = `
        <td>${p.nome}${badge}</td>
        <td>${p.cpf}</td>
        <td>${ult ? fmtDataOnly(ult.dia_hora) : "-"}</td>
        <td><a href="#" class="action-link">Ver histórico</a></td>
      `;

      // Configura a ação do link responsável por abrir o histórico do paciente.
      tr.querySelector("a").onclick = (ev) => {
        // Impede o comportamento padrão do link.
        ev.preventDefault();

        // Salva os dados do paciente selecionado no armazenamento local.
        localStorage.setItem(K.historicoPac,
          JSON.stringify({ nome: p.nome, cpf: p.cpf, id: p.id }));

        // Redireciona o médico para a página de histórico do paciente.
        window.location.href = "medico_historico.html";
      };

      // Adiciona a linha criada ao corpo da tabela.
      body.appendChild(tr);
    });
  };

  // Verifica se o campo de pesquisa pelo CPF existe.
  if (inputBusca) {
    // Adiciona um evento para atualizar a pesquisa enquanto o usuário digita.
    inputBusca.addEventListener("input", (e) => {
      // Aplica a máscara de CPF ao valor digitado.
      e.target.value = mascararCPF(e.target.value);

      // Exibe o botão de limpar quando existe conteúdo no campo.
      if (btnLimpar) btnLimpar.style.display = e.target.value ? "flex" : "none";

      // Remove os caracteres não numéricos para realizar a comparação.
      const term = soDigitos(e.target.value);

      // Se o campo estiver vazio, oculta os resultados e encerra a pesquisa.
      if (!term) { if (resultado) resultado.style.display = "none"; return; }

      // Exibe a área de resultados da pesquisa.
      if (resultado) resultado.style.display = "block";

      // Filtra os pacientes cujos CPFs contêm os números digitados.
      render(listaPacientes.filter(p => soDigitos(p.cpf).includes(term)));
    });
  }

  // Configura o botão responsável por limpar a pesquisa.
  if (btnLimpar) btnLimpar.onclick = () => {
    // Limpa o conteúdo do campo de CPF.
    inputBusca.value = "";

    // Oculta o botão de limpar.
    btnLimpar.style.display = "none";

    // Oculta a área de resultados.
    if (resultado) resultado.style.display = "none";
  };

  // Configura o botão responsável por fechar os resultados da pesquisa.
  if (btnFechar) btnFechar.onclick = () => {
    // Limpa o campo de pesquisa.
    inputBusca.value = "";

    // Oculta o botão de limpar, caso exista.
    if (btnLimpar) btnLimpar.style.display = "none";

    // Oculta a área de resultados.
    if (resultado) resultado.style.display = "none";
  };

  // Recupera o botão responsável por executar a pesquisa manualmente.
  const btnBuscar = $("btn-buscar-paciente");

  // Configura a ação executada quando o médico clica no botão de busca.
  if (btnBuscar) btnBuscar.onclick = () => {
    // Remove caracteres não numéricos do CPF digitado.
    const term = soDigitos(inputBusca.value);

    // Se o campo estiver vazio, oculta os resultados e encerra a pesquisa.
    if (!term) { if (resultado) resultado.style.display = "none"; return; }

    // Exibe a área de resultados.
    if (resultado) resultado.style.display = "block";

    // Filtra e apresenta os pacientes cujos CPFs correspondem à pesquisa.
    render(listaPacientes.filter(p => soDigitos(p.cpf).includes(term)));
  };
})();