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

describe('Agendamento - Etapa 3 (Revisao e Confirmacao)', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const htmlEtapa3 = `
    <body>
      <span id="user-greeting"></span>
      <span id="revisao-paciente"></span>
      <span id="revisao-servico"></span>
      <span id="revisao-medico"></span>
      <span id="revisao-crm"></span>
      <span id="revisao-tipo"></span>
      <span id="revisao-horario"></span>
      <span id="revisao-endereco"></span>
      <span id="revisao-convenio"></span>
      <span id="revisao-para-quem"></span>
      <span id="revisao-valor"></span>
      <div id="revisao-motivo-container">
        <span id="revisao-motivo"></span>
      </div>
      <button id="btn-confirmar">Confirmar</button>
      <button id="btn-logout"></button>
    </body>
  `;

  const setupDOM = () => {
    dom = new JSDOM(htmlEtapa3, { url: "http://localhost" });
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

  const criarAgendamentoCompleto = (motivo = "Dor de cabeça") => {
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123.456.789-00", nome: "Maria da Silva" }));
    localStorage.setItem('@medtriage/agendamento-temp', JSON.stringify({
      medicoMatricula: "MED1001",
      medicoNome: "Dr. Carlos Silva",
      especialidade: "Oftalmologista",
      valor: "R$ 250,00",
      data: "2024-05-15",
      horario: "14:00",
      tipo: "Presencial",
      paraQuem: "Para mim",
      primeiraVez: "Sim",
      convenio: "Unimed",
      motivo: motivo
    }));
  };

  test('Deve preencher todos os campos de revisao com os dados do agendamento', async () => {
    criarAgendamentoCompleto();
    setupDOM();
    await new Promise(process.nextTick);

    expect(document.getElementById('revisao-paciente').textContent).toBe("Maria da Silva");
    expect(document.getElementById('revisao-medico').textContent).toBe("Dr. Carlos Silva");
    expect(document.getElementById('revisao-tipo').textContent).toBe("Presencial");
    expect(document.getElementById('revisao-convenio').textContent).toBe("Unimed");
    expect(document.getElementById('revisao-para-quem').textContent).toBe("Para mim");
    expect(document.getElementById('revisao-valor').textContent).toBe("R$ 250,00");
    expect(document.getElementById('revisao-horario').textContent).toContain("15/05/2024");
    expect(document.getElementById('revisao-horario').textContent).toContain("14:00");
  });

  test('Deve esconder o campo motivo se estiver vazio', async () => {
    criarAgendamentoCompleto("");
    setupDOM();
    await new Promise(process.nextTick);

    expect(document.getElementById('revisao-motivo-container').style.display).toBe("none");
  });

  test('Deve mostrar o campo motivo se estiver preenchido', async () => {
    criarAgendamentoCompleto("Dor de cabeça forte");
    setupDOM();
    await new Promise(process.nextTick);

    expect(document.getElementById('revisao-motivo-container').style.display).not.toBe("none");
    expect(document.getElementById('revisao-motivo').textContent).toBe("Dor de cabeça forte");
  });

  test('Deve salvar a consulta definitiva em @medtriage/consultas ao confirmar', async () => {
    criarAgendamentoCompleto();
    setupDOM();
    await new Promise(process.nextTick);

    document.getElementById('btn-confirmar').dispatchEvent(new window.Event('click', { bubbles: true }));

    const consultas = JSON.parse(localStorage.getItem('@medtriage/consultas'));
    expect(consultas.length).toBe(1);
    expect(consultas[0].pacienteId).toBe("123.456.789-00");
    expect(consultas[0].medicoNome).toBe("Dr. Carlos Silva");
    expect(consultas[0].horario).toBe("14:00");
    expect(consultas[0].status).toBe("Aguardando");
    expect(localStorage.getItem('@medtriage/agendamento-temp')).toBeNull();
    expect(window.location.href).toBe("agendamento_sucesso.html");
  });

  test('Deve adicionar uma nova consulta a lista existente', async () => {
    const consultaAntiga = { id: 111, medicoNome: "Dr. Antigo", pacienteId: "123" };
    localStorage.setItem('@medtriage/consultas', JSON.stringify([consultaAntiga]));
    criarAgendamentoCompleto();

    setupDOM();
    await new Promise(process.nextTick);
    document.getElementById('btn-confirmar').dispatchEvent(new window.Event('click', { bubbles: true }));

    const consultas = JSON.parse(localStorage.getItem('@medtriage/consultas'));
    expect(consultas.length).toBe(2);
    expect(consultas[0].medicoNome).toBe("Dr. Antigo");
    expect(consultas[1].medicoNome).toBe("Dr. Carlos Silva");
  });

  test('Deve redirecionar para a busca se nao houver agendamento em andamento', async () => {
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    setupDOM();
    await new Promise(process.nextTick);

    expect(global.alert).toHaveBeenCalledWith("Nenhum agendamento em andamento. Volte para a busca.");
    expect(window.location.replace).toHaveBeenCalledWith("buscar_especialista.html");
  });
});