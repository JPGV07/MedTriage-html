// Importa funções auxiliares para selecionar elementos HTML, formatar preços,
// gerar identificadores de datas e converter datas e horários para o formato ISO.
import { $, fmtPreco, gerarIdData, dataParaISO } from "../core/utils.js";

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

// Executa uma função assíncrona para carregar os dias e horários disponíveis para agendamento.
(async () => {
  // Recupera o elemento HTML onde serão exibidos os dias disponíveis.
  const diasGrid = $("dias-grid");

  // Verifica se o elemento existe na página.
  if (!diasGrid) return;

  // Verifica se o usuário está autenticado e recupera os dados da sessão.
  const s = await requireLogin();

  // Interrompe a execução caso não exista uma sessão válida.
  if (!s) return;

  // Preenche a saudação de boas-vindas do usuário.
  preencherGreeting();

  // Recupera o CRM do médico selecionado e armazenado no navegador.
  const crm = localStorage.getItem(K.medicoSel);

  // Verifica se existe um médico selecionado.
  if (!crm) {
    // Informa que nenhum médico foi selecionado.
    alert("Médico não selecionado.");

    // Redireciona o usuário para a página de busca de especialistas.
    window.location.href = "buscar_especialista.html";

    // Encerra a execução.
    return;
  }

  // Declara a variável que armazenará os dados do médico.
  let medico;

  // Tenta buscar os dados do médico na API utilizando o CRM.
  try {
    medico = await apiFetch(`/med/${encodeURIComponent(crm)}`);
  } catch {
    // Informa que o médico não foi encontrado ou que ocorreu um erro na requisição.
    alert("Médico não encontrado.");

    // Redireciona o usuário para a página de busca de especialistas.
    window.location.href = "buscar_especialista.html";

    // Encerra a execução.
    return;
  }

  // Exibe o nome do médico no resumo do agendamento.
  // Caso o nome não esteja disponível, utiliza o CRM como identificação.
  $("resumo-nome").textContent = medico.funcionario?.nome || medico.crm;

  // Exibe a especialidade do médico utilizando o rótulo correspondente, quando disponível.
  $("resumo-especialidade").textContent = ESP_LABEL[medico.especialidade] || medico.especialidade;

  // Exibe o preço da consulta no formato monetário definido pelo sistema.
  $("resumo-valor").textContent = fmtPreco(medico.preco_consulta);

  // Recupera a data e o horário atuais.
  const hoje = new Date();

  // Inicializa uma lista para armazenar os próximos sete dias disponíveis para seleção.
  const dias = [];

  // Gera os sete dias a partir da data atual.
  for (let i = 0; i < 7; i++) {
    // Cria uma data considerando o ano, mês e dia atual, acrescentando os dias do intervalo.
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);

    // Define os nomes abreviados dos dias da semana.
    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Define o rótulo do dia:
    // "Hoje" para o primeiro dia, "Amanhã" para o segundo e o nome da semana para os demais.
    const lbl = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : nomes[d.getDay()];

    // Adiciona os dados do dia à lista.
    dias.push({
      // Gera um identificador da data no formato utilizado pelo sistema.
      id: gerarIdData(d.getFullYear(), d.getMonth() + 1, d.getDate()),

      // Armazena o nome que será exibido para o dia.
      labelSemana: lbl,

      // Formata a data no padrão dia/mês.
      labelData: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  // Inicializa as variáveis que armazenam o dia e o horário selecionados.
  let diaSel = null, horSel = null;

  // Define os horários disponíveis para agendamento.
  const todosHorarios = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00",
                         "14:00","14:30","15:00","15:30","16:00"];

  // Recupera o elemento HTML onde serão exibidos os horários.
  const horariosContainer = $("horarios-container");

  // Define a função responsável por exibir os dias disponíveis.
  const renderDias = () => {
    // Limpa o conteúdo anterior da grade de dias.
    diasGrid.innerHTML = "";

    // Percorre os dias gerados para criar os elementos de seleção.
    dias.forEach(dia => {
      // Cria um novo elemento HTML para representar o dia.
      const div = document.createElement("div");

      // Define a classe CSS do dia.
      // Adiciona a classe "selected" quando ele estiver selecionado.
      div.className = "dia-item" + (diaSel === dia.id ? " selected" : "");

      // Exibe o nome da semana e a data no elemento.
      div.innerHTML = `<p class="dia-semana">${dia.labelSemana}</p><p class="dia-data">${dia.labelData}</p>`;

      // Configura o clique para selecionar o dia escolhido.
      div.onclick = () => {
        // Armazena a data selecionada.
        diaSel = dia.id;

        // Limpa o horário selecionado anteriormente.
        horSel = null;

        // Atualiza a exibição dos dias.
        renderDias();

        // Atualiza os horários disponíveis para o novo dia selecionado.
        renderHorarios();

        // Atualiza o resumo e o estado do botão de avançar.
        atualizar();
      };

      // Adiciona o dia à grade de seleção.
      diasGrid.appendChild(div);
    });
  };

  // Define a função responsável por exibir os horários disponíveis.
  const renderHorarios = () => {
    // Limpa os horários exibidos anteriormente.
    horariosContainer.innerHTML = "";

    // Verifica se o usuário ainda não selecionou um dia.
    if (!diaSel) {
      // Exibe uma mensagem solicitando a seleção de um dia.
      horariosContainer.innerHTML =
        "<p style='color: var(--text-muted); padding: 20px 0;'>Selecione um dia.</p>";

      // Encerra a função enquanto nenhum dia estiver selecionado.
      return;
    }

    // Cria uma grade para organizar os botões de horários.
    const grid = document.createElement("div");

    // Define a classe CSS responsável pela aparência da grade.
    grid.className = "horarios-grid";

    // Recupera a data e o horário atuais para validar os horários.
    const agora = new Date();

    // Gera um identificador para a data de hoje.
    const hojeStr = gerarIdData(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());

    // Formata o horário atual no padrão HH:mm.
    const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;

    // Percorre todos os horários definidos para criar os botões de seleção.
    todosHorarios.forEach(h => {
      // Verifica se o horário já passou.
      // Essa validação é aplicada quando o dia selecionado é hoje.
      const passou = (diaSel === hojeStr && h <= horaAtual);

      // Cria um botão para representar o horário.
      const btn = document.createElement("button");

      // Define as classes CSS do botão.
      // Adiciona "disabled" para horários passados e "selected" para o horário escolhido.
      btn.className = "btn-horario"
        + (passou ? " disabled" : "")
        + (horSel === h ? " selected" : "");

      // Exibe o horário no botão.
      btn.textContent = h;

      // Desabilita o botão quando o horário já passou.
      btn.disabled = passou;

      // Configura o clique para selecionar o horário.
      btn.onclick = () => {
        // Impede a seleção caso o horário já tenha passado.
        if (passou) return;

        // Armazena o horário selecionado.
        horSel = h;

        // Atualiza a exibição dos botões de horários.
        renderHorarios();

        // Atualiza o resumo e o estado do botão de avançar.
        atualizar();
      };

      // Adiciona o botão à grade de horários.
      grid.appendChild(btn);
    });

    // Adiciona a grade de horários ao elemento da página.
    horariosContainer.appendChild(grid);
  };

  // Recupera o botão utilizado para avançar para a próxima etapa do agendamento.
  const btnAvancar = $("btn-avancar");

  // Define a função responsável por atualizar o resumo da seleção.
  const atualizar = () => {
    // Verifica se o paciente selecionou um dia e um horário.
    if (diaSel && horSel) {
      // Recupera os dados do dia selecionado.
      const d = dias.find(x => x.id === diaSel);

      // Exibe o dia, a data e o horário escolhidos no resumo.
      $("resumo-horario").textContent = `${d.labelSemana}, ${d.labelData} às ${horSel}`;

      // Habilita o botão para avançar no agendamento.
      btnAvancar.disabled = false;
    } else {
      // Informa que nenhum horário foi selecionado.
      $("resumo-horario").textContent = "Nenhum";

      // Mantém o botão desabilitado enquanto faltar uma seleção.
      btnAvancar.disabled = true;
    }
  };

  // Configura a ação executada quando o paciente clicar em avançar.
  btnAvancar.onclick = () => {
    // Impede o avanço caso o dia ou o horário não tenham sido selecionados.
    if (!diaSel || !horSel) return;

    // Armazena temporariamente os dados do agendamento no navegador.
    localStorage.setItem(K.agendTemp, JSON.stringify({
      // Armazena o CRM do médico selecionado.
      crm: medico.crm,

      // Armazena o nome do médico ou seu CRM caso o nome não esteja disponível.
      medicoNome: medico.funcionario?.nome || medico.crm,

      // Armazena a especialidade do médico.
      especialidade: medico.especialidade,

      // Armazena o preço da consulta.
      preco: medico.preco_consulta,

      // Converte a data e o horário selecionados para o formato ISO.
      data_hora: dataParaISO(diaSel, horSel),
    }));

    // Redireciona o paciente para a segunda etapa do agendamento.
    window.location.href = "agendar_etapa2.html";
  };

  // Exibe os dias disponíveis para seleção.
  renderDias();

  // Exibe os horários correspondentes ao estado atual da seleção.
  renderHorarios();

  // Atualiza o resumo inicial e mantém o botão de avançar desabilitado.
  atualizar();
})();