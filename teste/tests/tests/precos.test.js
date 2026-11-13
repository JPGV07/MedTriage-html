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

describe('Sincronizacao de Precos (Presencial e Teleconsulta)', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const setupDOM = (html) => {
    dom = new JSDOM(html, { url: "http://localhost" });
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

  test('Deve salvar os dois precos (presencial e teleconsulta) ao editar o perfil', async () => {
    const medicoAntigo = {
      id: "MED1001", nome: "Dr. Carlos Silva", senhaHash: "abc", crm: "CRM-PB 12345",
      especialidade: "Oftalmologista", cidade: "João Pessoa", rua: "Av. Epitácio Pessoa, 1000",
      preco: "R$ 250,00", precoTeleconsulta: "R$ 180,00"
    };
    localStorage.setItem('@medtriage/sessao', JSON.stringify(medicoAntigo));
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoAntigo]));

    setupDOM(`
      <body>
        <span id="user-greeting"></span>
        <form id="form-perfil-medico">
          <input id="perfil-nome" />
          <input id="perfil-matricula" readonly />
          <input id="perfil-crm" readonly />
          <input id="perfil-especialidade" readonly />
          <input id="perfil-cidade" />
          <input id="perfil-rua" />
          <input id="perfil-preco" />
          <input id="perfil-preco-tele" />
          <button type="submit">Salvar</button>
        </form>
        <button id="btn-logout"></button>
      </body>
    `);
    await new Promise(process.nextTick);

    document.getElementById('perfil-preco').value = "R$ 300,00";
    document.getElementById('perfil-preco-tele').value = "R$ 200,00";
    document.getElementById('form-perfil-medico').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    const banco = JSON.parse(localStorage.getItem('@medtriage/profissionais'));
    expect(banco[0].preco).toBe("R$ 300,00");
    expect(banco[0].precoTeleconsulta).toBe("R$ 200,00");
  });

  test('Deve mostrar o menor preco na busca (teleconsulta mais barata)', async () => {
    const medico = {
      id: "MED1001", nome: "Dr. Carlos Silva", senhaHash: "abc", crm: "CRM-PB 12345",
      especialidade: "Oftalmologista", cidade: "João Pessoa", rua: "Av. Epitácio Pessoa, 1000",
      preco: "R$ 250,00", precoTeleconsulta: "R$ 180,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medico]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));

    setupDOM(`
      <body>
        <span id="user-greeting"></span>
        <select id="filtro-especialidade"><option value="Todas">Todas</option></select>
        <select id="filtro-cidade"><option value="João Pessoa">João Pessoa</option></select>
        <button id="btn-buscar"></button>
        <h2 id="titulo-resultados"></h2>
        <div id="lista-medicos"></div>
        <button id="btn-logout"></button>
      </body>
    `);
    await new Promise(process.nextTick);

    // "A partir de" deve mostrar R$ 180,00 (teleconsulta é mais barata)
    const texto = document.getElementById('lista-medicos').textContent;
    expect(texto).toContain("A partir de R$ 180,00");
  });

  test('Deve mostrar os dois precos no perfil publico do medico', async () => {
    const medico = {
      id: "MED1001", nome: "Dr. Carlos Silva", senhaHash: "abc", crm: "CRM-PB 12345",
      especialidade: "Oftalmologista", cidade: "João Pessoa", rua: "Av. Epitácio Pessoa, 1000",
      preco: "R$ 250,00", precoTeleconsulta: "R$ 180,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medico]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    setupDOM(`
      <body>
        <span id="user-greeting"></span>
        <div id="perfil-publico-container">
          <h1 id="pub-nome"></h1>
          <span id="pub-especialidade"></span>
          <span id="pub-crm"></span>
          <span id="pub-rating"></span>
          <span id="pub-avaliacoes"></span>
          <p id="pub-bio"></p>
          <p id="pub-preco"></p>
          <p id="pub-preco-tele"></p>
          <p id="pub-endereco"></p>
        </div>
        <button id="btn-logout"></button>
      </body>
    `);
    await new Promise(process.nextTick);

    expect(document.getElementById('pub-preco').textContent).toBe("R$ 250,00");
    expect(document.getElementById('pub-preco-tele').textContent).toBe("R$ 180,00");
  });

  test('Deve atualizar o valor no resumo ao trocar entre presencial e teleconsulta', async () => {
    const medico = {
      id: "MED1001", nome: "Dr. Carlos Silva", senhaHash: "abc", crm: "CRM-PB 12345",
      especialidade: "Oftalmologista", cidade: "João Pessoa", rua: "Av. Epitácio Pessoa, 1000",
      preco: "R$ 250,00", precoTeleconsulta: "R$ 180,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medico]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    setupDOM(`
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
          <label class="radio-card selected">
            <input type="radio" name="tipo-consulta" value="Presencial" checked>
          </label>
          <label class="radio-card">
            <input type="radio" name="tipo-consulta" value="Teleconsulta">
          </label>
        </div>
        <button id="btn-logout"></button>
      </body>
    `);
    await new Promise(process.nextTick);

    // Valor inicial é o presencial
    expect(document.getElementById('resumo-valor').textContent).toBe("R$ 250,00");

    // Troca para teleconsulta
    const radioTele = document.querySelector('input[value="Teleconsulta"]');
    radioTele.checked = true;
    radioTele.dispatchEvent(new window.Event('change', { bubbles: true }));

    // Valor deve mudar para o preço da teleconsulta
    expect(document.getElementById('resumo-valor').textContent).toBe("R$ 180,00");
  });
});