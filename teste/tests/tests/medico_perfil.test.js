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

describe('Perfil do Médico - Edição de Dados', () => {
  let dom, document, window, mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  const htmlPerfil = `
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
        <button type="submit">Salvar</button>
      </form>
      <button id="btn-logout"></button>
    </body>
  `;

  const setupDOM = () => {
    dom = new JSDOM(htmlPerfil, { url: "http://localhost" });
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

  test('Deve carregar os dados do médico logado na tela de perfil', () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({
      id: "MED1001", nome: "Dr. Carlos Silva", crm: "CRM-PB 12345", 
      especialidade: "Oftalmologista", cidade: "João Pessoa", 
      rua: "Av. Epitácio Pessoa, 1000", preco: "R$ 250,00"
    }));

    // Act
    setupDOM();

    // Assert
    expect(document.getElementById('perfil-nome').value).toBe("Dr. Carlos Silva");
    expect(document.getElementById('perfil-matricula').value).toBe("MED1001");
    expect(document.getElementById('perfil-cidade').value).toBe("João Pessoa");
    expect(document.getElementById('perfil-rua').value).toBe("Av. Epitácio Pessoa, 1000");
    expect(document.getElementById('perfil-preco').value).toBe("R$ 250,00");
  });

  test('Deve salvar as alterações no banco e na sessão', () => {
    // Arrange
    const medicoOriginal = { id: "MED1001", nome: "Dr. Carlos Silva", senhaHash: "abc" };
    localStorage.setItem('@medtriage/sessao', JSON.stringify(medicoOriginal));
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoOriginal]));

    setupDOM();

    // Act
    document.getElementById('perfil-nome').value = "Dr. Carlos Silva Junior";
    document.getElementById('perfil-cidade').value = "Recife";
    document.getElementById('perfil-rua').value = "Av. Boa Viagem, 500";
    document.getElementById('perfil-preco').value = "R$ 300,00";
    
    document.getElementById('form-perfil-medico').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    // Assert
    // Verifica se a sessão foi atualizada
    const sessaoAtualizada = JSON.parse(localStorage.getItem('@medtriage/sessao'));
    expect(sessaoAtualizada.nome).toBe("Dr. Carlos Silva Junior");
    expect(sessaoAtualizada.cidade).toBe("Recife");
    
    // Verifica se o banco de dados de profissionais foi atualizado
    const bancoAtualizado = JSON.parse(localStorage.getItem('@medtriage/profissionais'));
    expect(bancoAtualizado[0].nome).toBe("Dr. Carlos Silva Junior");
    expect(bancoAtualizado[0].preco).toBe("R$ 300,00");

    // Verifica se redirecionou
    expect(window.location.href).toBe("medico_dashboard.html");
  });

  test('Deve negar acesso se não for um médico logado', () => {
    // Arrange (Sessão vazia)
    setupDOM();

    // Assert
    expect(global.alert).toHaveBeenCalledWith("Acesso negado. Faça login como profissional.");
    expect(window.location.replace).toHaveBeenCalledWith("index.html");
  });
});