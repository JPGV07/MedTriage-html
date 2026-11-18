// Importa funções auxiliares para selecionar elementos HTML,
// formatar datas e horários e remover caracteres não numéricos.
import { $, fmtDataHora, soDigitos } from "../core/utils.js";

// Importa as configurações gerais e os nomes das especialidades.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções de autenticação e comunicação com o backend.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função responsável por preencher as informações de saudação do usuário.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados da aplicação.
initCommon();

// Executa a lógica principal da página de forma assíncrona.
(async () => {

  // Verifica se o elemento da lista de histórico de atendimentos existe na página.
  if (!$("lista-historico-atendimentos")) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Impede que pacientes acessem o histórico de atendimentos dos médicos.
  // Redireciona o paciente para o dashboard correspondente.
  if (s.role === "CLIENTE") { window.location.replace("paciente_dashboard.html"); return; }

  // Aplica o tema visual destinado aos profissionais.
  document.body.classList.add("theme-professional");

  // Preenche a saudação e as informações do usuário na página.
  preencherGreeting();

  // Recupera o CRM do médico armazenado no navegador.
  const crm = localStorage.getItem(K.medicoCrm);

  // Busca no backend todas as consultas vinculadas ao CRM do médico.
  const consultas = await apiFetch(`/consulta/medico/${encodeURIComponent(crm)}`);

  // Filtra somente as consultas que foram concluídas.
  const realizadas = consultas.filter(c => c.status === "CONCLUIDA");

  // Recupera o elemento responsável por exibir as estatísticas do histórico.
  const stats = $("stats-historico");

  // Verifica se o elemento de estatísticas existe antes de preenchê-lo.
  if (stats) {

    // Conta a quantidade de pacientes diferentes atendidos.
    // O Set evita contar o mesmo paciente mais de uma vez.
    const pacs = new Set(realizadas.map(c => c.paciente.id)).size;

    // Conta quantas consultas possuem um laudo preenchido.
    const laudos = realizadas.filter(c => c.laudo && c.laudo.trim()).length;

    // Exibe os cartões com o total de atendimentos, pacientes e laudos.
    stats.innerHTML = `
      <div class="stat-card"><div class="stat-icon">🩺</div><div class="stat-info"><h3>${realizadas.length}</h3><p>Atendimentos</p></div></div>
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><h3>${pacs}</h3><p>Pacientes</p></div></div>
      <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-info"><h3>${laudos}</h3><p>Laudos</p></div></div>
    `;
  }

  // Recupera os elementos responsáveis pela lista e pela mensagem de histórico vazio.
  const lista = $("lista-historico-atendimentos");
  const vazio = $("historico-atend-vazio");

  // Define a função responsável por renderizar os atendimentos recebidos.
  const render = (arr) => {

    // Limpa o conteúdo anterior da lista antes de exibir os resultados.
    lista.innerHTML = "";

    // Verifica se existem atendimentos para exibir.
    if (arr.length === 0) {

      // Oculta a lista quando não existem resultados.
      lista.style.display = "none";

      // Exibe a mensagem informando que nenhum atendimento foi encontrado.
      if (vazio) vazio.style.display = "block";
      return;
    }

    // Exibe a lista de atendimentos.
    lista.style.display = "block";

    // Oculta a mensagem de histórico vazio.
    if (vazio) vazio.style.display = "none";

    // Percorre os atendimentos para criar um cartão para cada consulta.
    arr.forEach(c => {

      // Cria um novo elemento HTML para representar o atendimento.
      const card = document.createElement("div");

      // Define a classe CSS responsável pela aparência do cartão.
      card.className = "historico-card";

      // Insere no cartão o nome do paciente, a especialidade,
      // a data, o horário e o laudo do atendimento.
      // Caso a especialidade não tenha um nome configurado, utiliza o valor original.
      // Caso não exista um laudo, exibe uma mensagem padrão.
      card.innerHTML = `
        <h3>${c.paciente.nome} — ${ESP_LABEL[c.especialidade] || c.especialidade}</h3>
        <p class="historico-info">${fmtDataHora(c.dia_hora)}</p>
        <div class="historico-laudo">${c.laudo || "Laudo não registrado."}</div>
      `;

      // Adiciona o cartão criado à lista de histórico.
      lista.appendChild(card);
    });
  };

  // Exibe inicialmente todos os atendimentos concluídos.
  render(realizadas);

  // Recupera os elementos responsáveis pela pesquisa e pelos botões de ação.
  const busca = $("busca-historico");
  const btnLimpar = $("btn-limpar-busca");
  const btnBuscar = $("btn-buscar-historico");

  // Verifica se o campo de pesquisa existe antes de configurar seus eventos.
  if (busca) {

    // Monitora as alterações no campo de pesquisa.
    busca.addEventListener("input", (e) => {

      // Exibe o botão de limpar quando existe algum texto digitado.
      // Oculta o botão quando o campo está vazio.
      if (btnLimpar) btnLimpar.style.display = e.target.value ? "flex" : "none";
    });

    // Configura o botão responsável por limpar a pesquisa.
    if (btnLimpar) btnLimpar.onclick = () => {

      // Apaga o conteúdo do campo de pesquisa.
      busca.value = "";

      // Oculta o botão de limpar.
      btnLimpar.style.display = "none";

      // Restaura a exibição de todos os atendimentos.
      render(realizadas);
    };

    // Configura o botão responsável por executar a pesquisa.
    if (btnBuscar) btnBuscar.onclick = () => {

      // Obtém o texto digitado, converte para letras minúsculas
      // e remove espaços desnecessários no início e no final.
      const t = busca.value.toLowerCase().trim();

      // Se o campo estiver vazio, exibe novamente todos os atendimentos.
      if (!t) return render(realizadas);

      // Remove caracteres não numéricos da pesquisa,
      // permitindo pesquisar pacientes utilizando o CPF.
      const dig = soDigitos(t);

      // Filtra os atendimentos conforme o nome ou o CPF do paciente.
      const filtradas = realizadas.filter(c => {

        // Verifica se o nome do paciente contém o texto pesquisado.
        const nomeOk = c.paciente.nome.toLowerCase().includes(t);

        // Verifica se o CPF do paciente contém os números pesquisados.
        // O operador ?. evita erro caso o objeto usuario não exista.
        const cpfOk = dig && soDigitos(c.paciente.usuario?.cpf || "").includes(dig);

        // Mantém o atendimento caso o nome ou o CPF corresponda à pesquisa.
        return nomeOk || cpfOk;
      });

      // Atualiza a lista exibindo somente os atendimentos encontrados.
      render(filtradas);
    };
  }
})();