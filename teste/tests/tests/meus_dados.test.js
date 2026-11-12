const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const nodeCrypto = require('crypto');

// Mock do Web Crypto
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm, data) => {
        return nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest();
      }
    }
  }
});

describe('Meus Dados - Prontuário do Paciente', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const setupDOM = (htmlContent) => {
    dom = new JSDOM(htmlContent, { url: "http://localhost" });
    document = dom.window.document;
    window = dom.window;
    global.localStorage = window.localStorage;
    global.alert = jest.fn();
    
    // Simula o redirecionamento
    delete window.location;
    window.location = { href: "", replace: jest.fn() };
    global.window = window;

    const script = document.createElement("script");
    script.textContent = mainJs;
    document.body.appendChild(script);
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  };

  const htmlMeusDados = `
    <body>
      <span id="user-greeting"></span>
      <form id="form-meus-dados">
        <input id="dados-nome" />
        <input id="dados-cpf" readonly />
        <input id="dados-email" />
        <input id="dados-nascimento" />
        <select id="dados-sexo">
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>
        <select id="dados-genero"></select>
        <input id="dados-peso" />
        <input id="dados-altura" />
        
        <input type="checkbox" class="check-doenca" value="Diabetes" />
        <input type="checkbox" class="check-doenca" value="Hipertensão (Pressão Alta)" />
        
        <input type="checkbox" class="check-deficiencia" value="Visual" />
        <input type="checkbox" class="check-deficiencia" value="Auditiva" />
        <button type="submit">Salvar</button>
      </form>
    </body>
  `;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Deve carregar os dados existentes no formulário ao abrir a tela', () => {
    // 🟢 ARRANGE: Paciente logado com dados parciais
    const pacienteMock = {
      id: "123.456.789-00",
      nome: "Maria da Silva",
      email: "maria@teste.com",
      senhaHash: "abc",
      peso: "65",
      doencas: ["Diabetes"]
    };
    localStorage.setItem("@medtriage/sessao", JSON.stringify(pacienteMock));

    // 🔵 ACT: Abre a tela
    setupDOM(htmlMeusDados);

    // 🔴 ASSERT: Verifica se os campos foram preenchidos
    expect(document.getElementById('dados-nome').value).toBe("Maria da Silva");
    expect(document.getElementById('dados-cpf').value).toBe("123.456.789-00");
    expect(document.getElementById('dados-email').value).toBe("maria@teste.com");
    expect(document.getElementById('dados-peso').value).toBe("65");
    
    // Verifica se a checkbox de Diabetes foi marcada
    const checkDiabetes = document.querySelector('.check-doenca[value="Diabetes"]');
    expect(checkDiabetes.checked).toBe(true);
  });

  test('Deve salvar as novas informações no banco e na sessão (Persistência)', () => {
    // 🟢 ARRANGE: Paciente logado com dados vazios
    const pacienteMock = {
      id: "123.456.789-00", nome: "Maria", senhaHash: "abc", doencas: [], deficiencias: []
    };
    localStorage.setItem("@medtriage/sessao", JSON.stringify(pacienteMock));
    localStorage.setItem("@medtriage/pacientes", JSON.stringify([pacienteMock]));

    setupDOM(htmlMeusDados);

    // 🔵 ACT: Preenche o formulário e clica em Salvar
    document.getElementById('dados-nascimento').value = "1990-05-15";
    document.getElementById('dados-sexo').value = "Feminino";
    document.getElementById('dados-peso').value = "70";
    
    const checkDeficiencia = document.querySelector('.check-deficiencia[value="Visual"]');
    checkDeficiencia.checked = true;

    document.getElementById('form-meus-dados').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    // 🔴 ASSERT: Verifica se os dados foram salvos no LocalStorage
    const bancoAtualizado = JSON.parse(localStorage.getItem('@medtriage/pacientes'));
    expect(bancoAtualizado[0].nascimento).toBe("1990-05-15");
    expect(bancoAtualizado[0].sexo).toBe("Feminino");
    expect(bancoAtualizado[0].peso).toBe("70");
    expect(bancoAtualizado[0].deficiencias).toContain("Visual");

    // Verifica se a sessão também foi atualizada e redirecionou
    const sessaoAtualizada = JSON.parse(localStorage.getItem('@medtriage/sessao'));
    expect(sessaoAtualizada.peso).toBe("70");
    expect(window.location.href).toBe("paciente_dashboard.html");
  });
});