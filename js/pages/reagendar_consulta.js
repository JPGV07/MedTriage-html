// Importa funções auxiliares para selecionar elementos, formatar datas e preços,
// gerar identificadores de datas e converter datas e horários para o formato ISO.
import { $, fmtDataHora, fmtPreco, gerarIdData, dataParaISO } from "../core/utils.js";

// Importa as configurações e os rótulos das especialidades médicas.
import { K, ESP_LABEL } from "../core/config.js";

// Importa as funções responsáveis pela autenticação e pelas requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário na página.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa o carregamento e o funcionamento da página de reagendamento.
(async () => {
  // Verifica se o elemento principal da seleção de dias existe na página.
  if (!$("dias-grid")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Preenche a saudação com as informações do usuário.
  preencherGreeting();

  // Recupera o ID da consulta que será reagendada no armazenamento local.
  const id = Number(localStorage.getItem(K.consultaReag));

  // Se não houver um ID válido, retorna ao painel do paciente.
  if (!id) { window.location.replace("paciente_dashboard.html"); return; }

  // Declara a variável que armazenará os dados da consulta atual.
  let c;

  try {
    // Busca os dados da consulta na API pelo ID armazenado.
    c = await apiFetch(`/consulta/${id}`);
  }
  catch {
    // Informa que a consulta não foi encontrada.
    alert("Consulta não encontrada.");

    // Retorna ao painel do paciente.
    window.location.replace("paciente_dashboard.html");
    return;
  }

  // Exibe o nome do médico responsável pela consulta.
  $("resumo-nome").textContent = c.medico.funcionario.nome;

  // Exibe a especialidade médica utilizando o rótulo configurado.
  $("resumo-especialidade").textContent = ESP_LABEL[c.especialidade] || c.especialidade;

  // Exibe a data e o horário atuais da consulta.
  $("resumo-atual").textContent = fmtDataHora(c.dia_hora);

  // Exibe o preço da consulta formatado.
  $("resumo-valor").textContent = fmtPreco(c.medico.preco_consulta);

  // Converte a data atual da consulta para um objeto Date.
  const dataAtual = new Date(c.dia_hora);

  // Recupera a data de hoje e ajusta o horário para o início do dia.
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  // Define o primeiro dia disponível como o dia seguinte à consulta atual.
  const diaSeguinte = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() + 1);

  // Caso o dia seguinte à consulta já tenha passado, utiliza a data de hoje.
  const inicio = diaSeguinte < hoje ? hoje : diaSeguinte;

  // Cria a lista que armazenará os próximos sete dias disponíveis.
  const dias = [];

  // Percorre os próximos sete dias a partir da data inicial.
  for (let i = 0; i < 7; i++) {
    // Cria um objeto Date para o dia correspondente.
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);

    // Define os nomes abreviados dos dias da semana.
    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Calcula a diferença entre o dia selecionado e a data de hoje.
    const diff = Math.round((d - hoje) / (1000 * 60 * 60 * 24));

    // Define o texto exibido para o dia: Hoje, Amanhã ou o nome da semana.
    const lbl = diff === 0 ? "Hoje" : diff === 1 ? "Amanhã" : nomes[d.getDay()];

    // Adiciona as informações do dia à lista de datas disponíveis.
    dias.push({
      // Gera um identificador para a data no formato utilizado pelo sistema.
      id: gerarIdData(d.getFullYear(), d.getMonth() + 1, d.getDate()),

      // Armazena o nome ou a identificação do dia da semana.
      labelSemana: lbl,

      // Formata a data para exibição no formato dia/mês.
      labelData: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  // Inicializa as variáveis que armazenam o dia e o horário selecionados.
  let diaSel = null, horSel = null;

  // Recupera o elemento onde os dias disponíveis serão exibidos.
  const diasGrid = $("dias-grid");

  // Define os horários disponíveis para o reagendamento.
  const todosHorarios = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00",
                         "14:00","14:30","15:00","15:30","16:00"];

  // Recupera o elemento onde os horários serão exibidos.
  const horarios = $("horarios-container");

  // Função responsável por renderizar os dias disponíveis na página.
  const renderDias = () => {
    // Limpa o conteúdo anterior da área de seleção de dias.
    diasGrid.innerHTML = "";

    // Percorre todos os dias disponíveis para criar seus elementos.
    dias.forEach(dia => {
      // Cria um elemento HTML para representar o dia.
      const el = document.createElement("div");

      // Define a classe do elemento e destaca o dia selecionado.
      el.className = "dia-item" + (diaSel === dia.id ? " selected" : "");

      // Insere o nome do dia da semana e a data no elemento.
      el.innerHTML = `<p class="dia-semana">${dia.labelSemana}</p><p class="dia-data">${dia.labelData}</p>`;

      // Define a ação executada quando o usuário seleciona um dia.
      el.onclick = () => {
        // Atualiza o dia selecionado.
        diaSel = dia.id;

        // Limpa o horário selecionado anteriormente.
        horSel = null;

        // Atualiza a exibição dos dias e dos horários.
        renderDias(); renderHorarios(); atualizar();
      };

      // Adiciona o elemento do dia à área de seleção.
      diasGrid.appendChild(el);
    });
  };

  // Função responsável por renderizar os horários disponíveis.
  const renderHorarios = () => {
    // Limpa os horários exibidos anteriormente.
    horarios.innerHTML = "";

    // Verifica se o usuário já selecionou um dia.
    if (!diaSel) {
      // Solicita que o usuário selecione um dia antes de escolher o horário.
      horarios.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>Selecione um dia.</p>";
      return;
    }

    // Cria um elemento para organizar os horários em uma grade.
    const grid = document.createElement("div");

    // Define a classe responsável pela organização visual dos horários.
    grid.className = "horarios-grid";

    // Recupera a data e o horário atuais.
    const agora = new Date();

    // Gera um identificador para a data de hoje.
    const hojeStr = gerarIdData(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());

    // Formata o horário atual para comparar com os horários disponíveis.
    const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;

    // Percorre todos os horários cadastrados.
    todosHorarios.forEach(h => {
      // Verifica se o horário já passou quando o dia selecionado é hoje.
      const passou = (diaSel === hojeStr && h <= horaAtual);

      // Cria um botão para representar o horário.
      const btn = document.createElement("button");

      // Define as classes do botão conforme a disponibilidade e a seleção.
      btn.className = "btn-horario"
        + (passou ? " disabled" : "")
        + (horSel === h ? " selected" : "");

      // Exibe o horário no botão.
      btn.textContent = h;

      // Desativa o botão caso o horário já tenha passado.
      btn.disabled = passou;

      // Define a ação executada quando o usuário seleciona um horário.
      btn.onclick = () => {
        // Impede a seleção de horários que já passaram.
        if (passou) return;

        // Atualiza o horário selecionado.
        horSel = h;

        // Atualiza a exibição dos horários e o resumo do reagendamento.
        renderHorarios(); atualizar();
      };

      // Adiciona o botão à grade de horários.
      grid.appendChild(btn);
    });

    // Adiciona a grade de horários à página.
    horarios.appendChild(grid);
  };

  // Recupera o botão responsável por confirmar o reagendamento.
  const btn = $("btn-confirmar-reagendamento");

  // Função responsável por atualizar o resumo e o estado do botão.
  const atualizar = () => {
    // Verifica se o usuário selecionou um dia e um horário.
    if (diaSel && horSel) {
      // Recupera os dados do dia selecionado.
      const d = dias.find(x => x.id === diaSel);

      // Exibe a nova data e o horário escolhidos pelo usuário.
      $("resumo-nova-data").textContent = `${d.labelSemana}, ${d.labelData} às ${horSel}`;

      // Habilita o botão de confirmação.
      btn.disabled = false;
    } else {
      // Informa que ainda não existe uma nova data selecionada.
      $("resumo-nova-data").textContent = "Nenhuma";

      // Mantém o botão de confirmação desativado.
      btn.disabled = true;
    }
  };

  // Define a ação executada quando o usuário confirma o reagendamento.
  btn.onclick = async () => {
    // Converte o dia e o horário selecionados para o formato ISO.
    const nova = dataParaISO(diaSel, horSel);

    try {
      // Envia a solicitação de reagendamento para a API.
      await apiFetch(`/consulta/${id}/reagendar`, {
        // Define o método HTTP utilizado na requisição.
        method: "PUT",

        // Envia a nova data e horário no corpo da requisição.
        body: JSON.stringify({ data_hora: nova }),
      });

      // Informa que o reagendamento foi realizado com sucesso.
      alert("Consulta reagendada!");

      // Remove do armazenamento local o ID da consulta em reagendamento.
      localStorage.removeItem(K.consultaReag);

      // Retorna o usuário ao painel do paciente.
      window.location.href = "paciente_dashboard.html";
    } catch (err) {
      // Exibe a mensagem de erro caso o reagendamento não seja concluído.
      alert(err.message);
    }
  };

  // Renderiza os dias disponíveis na página.
  renderDias();

  // Renderiza os horários disponíveis para seleção.
  renderHorarios();

  // Atualiza o resumo inicial e mantém o botão desativado até uma seleção válida.
  atualizar();
})();