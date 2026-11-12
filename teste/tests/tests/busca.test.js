const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const nodeCrypto = require('crypto');

// Mock do Web Crypto para o JSDOM
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm, data) => {
        return nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest();
      }
    }
  }
});

describe('Busca de Especialistas e Banco de Médicos', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const htmlBusca = `
    <body>
      <span id="user-greeting"></span>
      <select id="filtro-especialidade">
        <option value="Todas">Todas as especialidades</option>
        <option value="Oftalmologista">Oftalmologista</option>
        <option value="Cardiologista">Cardiologista</option>
        <option value="Dermatologista">Dermatologista</option>
        <option value="Clínico geral">Clínico geral</option>
      </select>
      <select id="filtro-cidade">
        <option value="João Pessoa">João Pessoa</option>
        <option value="Campina Grande">Campina Grande</option>
      </select>
      <button id="btn-buscar">Buscar</button>
      <h2 id="titulo-resultados"></h2>
      <div id="lista-medicos"></div>
      <button id="btn-logout"></button>
    </body>
  `;

  const setupDOM = async () => {
    dom = new JSDOM(htmlBusca, { url: "http://localhost" });
    document = dom.window.document;
    window = dom.window;
    global.localStorage = window.localStorage;
    global.alert = jest.fn();
    
    delete window.location;
    window.location = { href: "", replace: jest.fn() };
    global.window = window;

    // Simula uma sessão de paciente para acessar a tela
    localStorage.setItem("@medtriage/sessao", JSON.stringify({ id: "123", nome: "Paciente Teste" }));

    const script = document.createElement("script");
    script.textContent = mainJs;
    document.body.appendChild(script);
    
    // Dispara o DOMContentLoaded e espera o async (seeding e hash) terminar
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
    await new Promise(process.nextTick);
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Deve semear o banco de profissionais com os 8 médicos se estiver vazio', async () => {
    // Arrange
    await setupDOM();

    // Assert
    const profissionais = JSON.parse(localStorage.getItem('@medtriage/profissionais'));
    expect(profissionais.length).toBe(8);
    
    // Verifica se um dos médicos foi salvo corretamente
    const medico = profissionais.find(m => m.id === "MED1001");
    expect(medico).toBeDefined();
    expect(medico.nome).toBe("Dr. Carlos Silva");
    expect(medico.crm).toBe("CRM-PB 12345");
  });

  test('Deve renderizar os médicos de João Pessoa por padrão ao abrir a tela', async () => {
    // Arrange
    await setupDOM();

    // Assert
    const cards = document.querySelectorAll('.doctor-card');
    // Como são 4 especialidades, deve ter 4 médicos em João Pessoa
    expect(cards.length).toBe(4);
    
    const textoLista = document.getElementById('lista-medicos').textContent;
    expect(textoLista).toContain("Dr. Carlos Silva");
    expect(textoLista).not.toContain("Dra. Beatriz Nogueira"); // Esta é de Campina Grande
  });

  test('Deve filtrar corretamente por especialidade e cidade ao clicar em Buscar', async () => {
    // Arrange
    await setupDOM();
    
    const filtroEsp = document.getElementById('filtro-especialidade');
    const filtroCid = document.getElementById('filtro-cidade');
    const btnBuscar = document.getElementById('btn-buscar');

    // Act
    filtroEsp.value = "Oftalmologista";
    filtroCid.value = "Campina Grande";
    btnBuscar.dispatchEvent(new window.Event('click', { bubbles: true }));

    // Assert
    const cards = document.querySelectorAll('.doctor-card');
    expect(cards.length).toBe(1);
    
    const textoLista = document.getElementById('lista-medicos').textContent;
    expect(textoLista).toContain("Dra. Beatriz Nogueira");
    expect(textoLista).toContain("CRM-PB 12346");
    expect(textoLista).toContain("Rua Maciel Pinheiro, 150");
  });

  test('Deve exibir a mensagem de vazio quando nenhum médico for encontrado', async () => {
    // Arrange
    await setupDOM();
    
    // Forçamos uma combinação que não existe no banco (ex: Cardiologista em uma cidade fictícia ou alteramos o mock)
    // Para testar o fluxo do código, vamos alterar o valor do select para algo que não bate com nenhum médico.
    const filtroCid = document.getElementById('filtro-cidade');
    filtroCid.innerHTML = `<option value="Recife">Recife</option>`;
    filtroCid.value = "Recife";
    
    // Act
    document.getElementById('btn-buscar').dispatchEvent(new window.Event('click', { bubbles: true }));

    // Assert
    const textoLista = document.getElementById('lista-medicos').textContent;
    expect(textoLista).toContain("Nenhum médico encontrado com esses filtros.");
  });
});