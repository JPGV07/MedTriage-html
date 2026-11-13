const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const nodeCrypto = require('crypto');

Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm, data) => {
        return nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest();
      }
    }
  }
});

describe('Agendamento - Etapa 1 (Dia e Horario)', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const htmlAgendamento = `
    <body>
      <span id="user-greeting"></span>
      <div id="dias-grid"></div>
      <div id="horarios-container"></div>
      <span id="resumo-nome"></span>
      <span id="resumo-especialidade"></span>
      <span id="resumo-valor"></span>
      <span id="resumo-horario"></span>
      <button id="btn-avancar" disabled></button>
      <div class="tipo-consulta-grid">
        <label class="radio-card selected" id="card-presencial">
          <input type="radio" name="tipo-consulta" value="Presencial" checked>
          <span class="radio-card-titulo">Consulta no local</span>
        </label>
        <label class="radio-card" id="card-teleconsulta">
          <input type="radio" name="tipo-consulta" value="Teleconsulta">
          <span class="radio-card-titulo">Teleconsulta</span>
        </label>
      </div>
      <button id="btn-logout"></button>
    </body>
  `;

  const setupDOM = () => {
    dom = new JSDOM(htmlAgendamento, { url: "http://localhost" });
    document = dom.window.document;
    window = dom.window;
    global.localStorage = window.localStorage;
    global.alert = jest.fn();
    delete window.location;
    window.location = { href: "", replace: jest.fn() };
    global.window = window;

    const script = document.createElement("script");
    script.textContent = mainJs;
    document.body.appendChild(script);
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Deve preencher o resumo lateral com os dados do medico selecionado', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente Teste" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");
    // O medico sera encontrado no dbMedicos estatico

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('resumo-nome').textContent).toBe("Dr. Carlos Silva");
    expect(document.getElementById('resumo-especialidade').textContent).toBe("Oftalmologista");
    expect(document.getElementById('resumo-valor').textContent).toBe("R$ 250,00");
  });

  test('Deve renderizar os 4 dias disponiveis', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    const dias = document.querySelectorAll('.dia-item');
    expect(dias.length).toBe(4);
    expect(dias[0].textContent).toContain("Hoje");
  });

  test('Deve mostrar a mensagem para selecionar um dia quando nenhum estiver selecionado', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('horarios-container').textContent).toContain("Selecione um dia para ver os horários disponíveis.");
  });

  test('Deve desbloquear o botao Avancar apenas quando dia e horario forem selecionados', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert inicial: botao desabilitado
    const btnAvancar = document.getElementById('btn-avancar');
    expect(btnAvancar.disabled).toBe(true);

    // Seleciona o primeiro dia
    const primeiroDia = document.querySelector('.dia-item');
    primeiroDia.dispatchEvent(new window.Event('click', { bubbles: true }));

    // Seleciona um horario disponivel (08:00 nao esta na lista de ocupados)
    const botoesHorario = document.querySelectorAll('.btn-horario');
    const horarioDisponivel = Array.from(botoesHorario).find(btn => !btn.classList.contains('disabled'));
    
    if (horarioDisponivel) {
      horarioDisponivel.dispatchEvent(new window.Event('click', { bubbles: true }));
    }

    // Assert final: botao habilitado
    expect(btnAvancar.disabled).toBe(false);
    expect(document.getElementById('resumo-horario').textContent).not.toBe("Nenhum");
  });

  test('Deve salvar a escolha no localStorage ao clicar em Avancar', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Seleciona dia e horario
    const primeiroDia = document.querySelector('.dia-item');
    primeiroDia.dispatchEvent(new window.Event('click', { bubbles: true }));

    const botoesHorario = document.querySelectorAll('.btn-horario');
    const horarioDisponivel = Array.from(botoesHorario).find(btn => !btn.classList.contains('disabled'));
    if (horarioDisponivel) {
      horarioDisponivel.dispatchEvent(new window.Event('click', { bubbles: true }));
    }

    // Clica em Avancar
    document.getElementById('btn-avancar').dispatchEvent(new window.Event('click', { bubbles: true }));

    // Assert
    const agendamentoTemp = JSON.parse(localStorage.getItem('@medtriage/agendamento-temp'));
    expect(agendamentoTemp).not.toBeNull();
    expect(agendamentoTemp.medicoMatricula).toBe("MED1001");
    expect(agendamentoTemp.horario).not.toBeNull();
    expect(window.location.href).toBe("agendar_etapa2.html");
  });
});