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

describe('Tela de Agendamento com Sucesso', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const htmlSucesso = `
    <body>
      <span id="sucesso-data"></span>
      <span id="sucesso-medico"></span>
      <span id="sucesso-local"></span>
      <span id="sucesso-valor"></span>
      <span id="detalhe-email"></span>
      <span id="detalhe-whatsapp"></span>
      
      <div class="sucesso-opcoes">
        <label class="radio-card selected">
          <input type="radio" name="metodo-confirmacao" value="email" checked>
        </label>
        <label class="radio-card">
          <input type="radio" name="metodo-confirmacao" value="whatsapp">
        </label>
      </div>
      
      <button id="btn-ok">OK</button>
    </body>
  `;

  const setupDOM = () => {
    dom = new JSDOM(htmlSucesso, { url: "http://localhost" });
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

  const criarConsultaConfirmada = () => {
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ 
      id: "123.456.789-00", 
      nome: "Maria da Silva",
      email: "maria@teste.com",
      telefone: "(83) 99999-9999"
    }));

    localStorage.setItem('@medtriage/consultas', JSON.stringify([{
      id: Date.now(),
      pacienteId: "123.456.789-00",
      pacienteNome: "Maria da Silva",
      medicoMatricula: "MED1001",
      medicoNome: "Dr. Carlos Silva",
      especialidade: "Oftalmologista",
      tipo: "Presencial",
      dataFormatada: "15/05/2024",
      horario: "14:00",
      endereco: "Av. Epitácio Pessoa, 1000, João Pessoa",
      valor: "R$ 250,00",
      status: "Aguardando"
    }]));
  };

  test('Deve preencher os dados da ultima consulta confirmada na tela', async () => {
    // Arrange
    criarConsultaConfirmada();

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('sucesso-data').textContent).toBe("15/05/2024 às 14:00");
    expect(document.getElementById('sucesso-medico').textContent).toBe("Dr. Carlos Silva • Oftalmologista");
    expect(document.getElementById('sucesso-local').textContent).toBe("Av. Epitácio Pessoa, 1000, João Pessoa");
    expect(document.getElementById('sucesso-valor').textContent).toBe("R$ 250,00");
  });

  test('Deve mostrar "Teleconsulta (online)" quando for teleconsulta', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Maria", email: "m@t.com" }));
    localStorage.setItem('@medtriage/consultas', JSON.stringify([{
      dataFormatada: "15/05/2024",
      horario: "14:00",
      medicoNome: "Dr. Carlos Silva",
      especialidade: "Oftalmologista",
      tipo: "Teleconsulta",
      endereco: "Online",
      valor: "R$ 180,00"
    }]));

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('sucesso-local').textContent).toBe("Teleconsulta (online)");
  });

  test('Deve preencher o email do paciente na opcao de confirmacao', async () => {
    // Arrange
    criarConsultaConfirmada();

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('detalhe-email').textContent).toBe("maria@teste.com");
  });

  test('Deve preencher o telefone do paciente na opcao de confirmacao', async () => {
    // Arrange
    criarConsultaConfirmada();

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('detalhe-whatsapp').textContent).toBe("(83) 99999-9999");
  });

  test('Deve salvar o metodo de confirmacao escolhido ao clicar em OK', async () => {
    // Arrange
    criarConsultaConfirmada();
    setupDOM();
    await new Promise(process.nextTick);

    // Muda para WhatsApp
    const radioWhatsApp = document.querySelector('input[value="whatsapp"]');
    radioWhatsApp.checked = true;

    // Act
    document.getElementById('btn-ok').dispatchEvent(new window.Event('click', { bubbles: true }));

    // Assert
    const consultas = JSON.parse(localStorage.getItem('@medtriage/consultas'));
    expect(consultas[0].metodoConfirmacao).toBe("whatsapp");
    expect(window.location.href).toBe("paciente_dashboard.html");
  });

  test('Deve redirecionar para o painel se nao houver consulta confirmada', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Maria" }));
    // Sem consultas salvas

    // Act
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    expect(global.alert).toHaveBeenCalledWith("Nenhuma consulta encontrada. Volte para o painel.");
    expect(window.location.replace).toHaveBeenCalledWith("paciente_dashboard.html");
  });

  test('Deve destacar o card de e-mail por padrao', async () => {
    // Arrange
    criarConsultaConfirmada();
    setupDOM();
    await new Promise(process.nextTick);

    // Assert
    const cardEmail = document.querySelector('.radio-card');
    expect(cardEmail.classList.contains('selected')).toBe(true);
    expect(cardEmail.querySelector('input').checked).toBe(true);
  });
});