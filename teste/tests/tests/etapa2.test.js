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

describe('Agendamento - Etapa 2 (Dados da Consulta)', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const htmlEtapa2 = `
    <body>
      <span id="user-greeting"></span>
      <span id="resumo-nome"></span>
      <span id="resumo-especialidade"></span>
      <span id="resumo-tipo"></span>
      <span id="resumo-horario"></span>
      <span id="resumo-valor"></span>
      
      <form id="form-etapa2">
        <div class="tipo-consulta-grid">
          <label class="radio-card selected">
            <input type="radio" name="para-quem" value="Para mim" checked>
          </label>
          <label class="radio-card">
            <input type="radio" name="para-quem" value="Para outra pessoa">
          </label>
        </div>
        
        <select id="etapa2-convenio">
          <option value="Sem plano de saúde">Sem plano</option>
          <option value="Unimed">Unimed</option>
        </select>
        
        <div class="tipo-consulta-grid">
          <label class="radio-card selected">
            <input type="radio" name="primeira-vez" value="Sim" checked>
          </label>
          <label class="radio-card">
            <input type="radio" name="primeira-vez" value="Não">
          </label>
        </div>
        
        <input type="text" id="etapa2-motivo" />
      </form>
      
      <button id="btn-avancar-etapa2">Avançar</button>
      <button id="btn-logout"></button>
    </body>
  `;

  const setupDOM = () => {
    dom = new JSDOM(htmlEtapa2, { url: "http://localhost" });
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

  const criarAgendamentoTemp = () => {
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente Teste" }));
    localStorage.setItem('@medtriage/agendamento-temp', JSON.stringify({
      medicoMatricula: "MED1001",
      medicoNome: "Dr. Carlos Silva",
      especialidade: "Oftalmologista",
      valor: "R$ 250,00",
      data: "2024-05-15",
      horario: "14:00",
      tipo: "Presencial"
    }));
  };

  test('Deve preencher o resumo lateral com os dados da Etapa 1', async () => {
    // Arrange
    criarAgendamentoTemp();

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('resumo-nome').textContent).toBe("Dr. Carlos Silva");
    expect(document.getElementById('resumo-especialidade').textContent).toBe("Oftalmologista");
    expect(document.getElementById('resumo-tipo').textContent).toBe("Presencial");
    expect(document.getElementById('resumo-valor').textContent).toBe("R$ 250,00");
    expect(document.getElementById('resumo-horario').textContent).toContain("14:00");
  });

  test('Deve redirecionar para a busca se nao houver agendamento em andamento', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    // Sem @medtriage/agendamento-temp

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(global.alert).toHaveBeenCalledWith("Nenhum agendamento em andamento. Volte para a busca.");
    expect(window.location.replace).toHaveBeenCalledWith("buscar_especialista.html");
  });

  test('Deve salvar os dados da Etapa 2 no localStorage ao clicar em Avancar', async () => {
    // Arrange
    criarAgendamentoTemp();
    setupDOM();
    await new Promise(process.nextTick);

    // Preenche os campos
    const radioOutra = document.querySelector('input[name="para-quem"][value="Para outra pessoa"]');
    radioOutra.checked = true;
    
    const radioNao = document.querySelector('input[name="primeira-vez"][value="Não"]');
    radioNao.checked = true;

    document.getElementById('etapa2-convenio').value = "Unimed";
    document.getElementById('etapa2-motivo').value = "Dor de cabeça constante";

    // Act
    document.getElementById('btn-avancar-etapa2').dispatchEvent(new window.Event('click', { bubbles: true }));

    // Assert
    const agendamentoCompleto = JSON.parse(localStorage.getItem('@medtriage/agendamento-temp'));
    expect(agendamentoCompleto.paraQuem).toBe("Para outra pessoa");
    expect(agendamentoCompleto.primeiraVez).toBe("Não");
    expect(agendamentoCompleto.convenio).toBe("Unimed");
    expect(agendamentoCompleto.motivo).toBe("Dor de cabeça constante");
    
    // Deve manter os dados da Etapa 1
    expect(agendamentoCompleto.medicoNome).toBe("Dr. Carlos Silva");
    expect(agendamentoCompleto.horario).toBe("14:00");
    
    // Deve redirecionar para a Etapa 3
    expect(window.location.href).toBe("agendar_etapa3.html");
  });

  test('Deve permitir avancar mesmo sem preencher o motivo (opcional)', async () => {
    // Arrange
    criarAgendamentoTemp();
    setupDOM();
    await new Promise(process.nextTick);

    // Motivo fica vazio
    document.getElementById('etapa2-motivo').value = "";

    // Act
    document.getElementById('btn-avancar-etapa2').dispatchEvent(new window.Event('click', { bubbles: true }));

    // Assert
    const agendamentoCompleto = JSON.parse(localStorage.getItem('@medtriage/agendamento-temp'));
    expect(agendamentoCompleto.motivo).toBe("");
    expect(window.location.href).toBe("agendar_etapa3.html");
  });
});