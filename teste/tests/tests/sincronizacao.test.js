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

describe('Sincronizacao de Dados do Medico', () => {
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
    delete window.location;
    window.location = { href: "", replace: jest.fn() };
    global.window = window;

    const script = document.createElement("script");
    script.textContent = mainJs;
    document.body.appendChild(script);
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  };

  const htmlPerfilMedico = `
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

  const htmlBusca = `
    <body>
      <span id="user-greeting"></span>
      <select id="filtro-especialidade">
        <option value="Todas">Todas</option>
        <option value="Oftalmologista">Oftalmologista</option>
      </select>
      <select id="filtro-cidade">
        <option value="João Pessoa">João Pessoa</option>
      </select>
      <button id="btn-buscar">Buscar</button>
      <h2 id="titulo-resultados"></h2>
      <div id="lista-medicos"></div>
      <button id="btn-logout"></button>
    </body>
  `;

  const htmlPerfilPublico = `
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
        <p id="pub-endereco"></p>
      </div>
      <button id="btn-logout"></button>
    </body>
  `;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Deve salvar as alteracoes do medico no localStorage ao submeter o perfil', async () => {
    // Arrange: Simula o medico logado com dados antigos
    const medicoAntigo = { 
      id: "MED1001", 
      nome: "Dr. Carlos Silva", 
      senhaHash: "abc", 
      crm: "CRM-PB 12345", 
      especialidade: "Oftalmologista", 
      cidade: "João Pessoa", 
      rua: "Av. Epitácio Pessoa, 1000", 
      preco: "R$ 250,00" 
    };
    localStorage.setItem('@medtriage/sessao', JSON.stringify(medicoAntigo));
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoAntigo]));

    setupDOM(htmlPerfilMedico);
    await new Promise(process.nextTick);

    // Act: Simula o medico alterando os dados
    document.getElementById('perfil-nome').value = "Dr. Carlos Silva Junior";
    document.getElementById('perfil-cidade').value = "Recife";
    document.getElementById('perfil-rua').value = "Av. Boa Viagem, 500";
    document.getElementById('perfil-preco').value = "R$ 999,00";
    
    document.getElementById('form-perfil-medico').dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true })
    );

    // Assert: Verifica se os dados foram salvos
    const sessaoAtualizada = JSON.parse(localStorage.getItem('@medtriage/sessao'));
    const bancoAtualizado = JSON.parse(localStorage.getItem('@medtriage/profissionais'));

    expect(sessaoAtualizada.nome).toBe("Dr. Carlos Silva Junior");
    expect(sessaoAtualizada.cidade).toBe("Recife");
    expect(sessaoAtualizada.preco).toBe("R$ 999,00");
    
    expect(bancoAtualizado[0].nome).toBe("Dr. Carlos Silva Junior");
    expect(bancoAtualizado[0].preco).toBe("R$ 999,00");
  });

  test('Deve mostrar o preco atualizado na busca apos o medico alterar', async () => {
    // Arrange: Simula que o medico ja alterou seu preco no banco
    const medicoAtualizado = { 
      id: "MED1001", 
      nome: "Dr. Carlos Silva", 
      senhaHash: "abc", 
      crm: "CRM-PB 12345", 
      especialidade: "Oftalmologista", 
      cidade: "João Pessoa", 
      rua: "Av. Epitácio Pessoa, 1000", 
      preco: "R$ 999,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoAtualizado]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));

    // Act: Abre a tela de busca
    setupDOM(htmlBusca);
    await new Promise(process.nextTick);

    // Assert: O card deve mostrar o preco novo, nao o estatico R$ 250,00
    const textoCards = document.getElementById('lista-medicos').textContent;
    expect(textoCards).toContain("R$ 999,00");
    expect(textoCards).not.toContain("R$ 250,00");
  });

  test('Deve mostrar o nome e endereco atualizados na busca apos o medico alterar', async () => {
    // Arrange
    const medicoAtualizado = { 
      id: "MED1001", 
      nome: "Dr. Carlos Silva Junior", 
      senhaHash: "abc", 
      crm: "CRM-PB 12345", 
      especialidade: "Oftalmologista", 
      cidade: "Recife", 
      rua: "Av. Boa Viagem, 500", 
      preco: "R$ 250,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoAtualizado]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));

    // Act
    setupDOM(htmlBusca);
    await new Promise(process.nextTick);

    // Assert
    const textoCards = document.getElementById('lista-medicos').textContent;
    expect(textoCards).toContain("Dr. Carlos Silva Junior");
    expect(textoCards).toContain("Av. Boa Viagem, 500, Recife");
  });

  test('Deve mostrar o preco atualizado no perfil publico apos o medico alterar', async () => {
    // Arrange
    const medicoAtualizado = { 
      id: "MED1001", 
      nome: "Dr. Carlos Silva", 
      senhaHash: "abc", 
      crm: "CRM-PB 12345", 
      especialidade: "Oftalmologista", 
      cidade: "João Pessoa", 
      rua: "Av. Epitácio Pessoa, 1000", 
      preco: "R$ 999,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoAtualizado]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    // Act
    setupDOM(htmlPerfilPublico);
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('pub-preco').textContent).toBe("R$ 999,00");
    expect(document.getElementById('pub-nome').textContent).toBe("Dr. Carlos Silva");
  });

  test('Deve mostrar todos os dados atualizados no perfil publico', async () => {
    // Arrange
    const medicoAtualizado = { 
      id: "MED1001", 
      nome: "Dr. Carlos Silva Junior", 
      senhaHash: "abc", 
      crm: "CRM-PB 12345", 
      especialidade: "Oftalmologista", 
      cidade: "Recife", 
      rua: "Av. Boa Viagem, 500", 
      preco: "R$ 999,00"
    };
    localStorage.setItem('@medtriage/profissionais', JSON.stringify([medicoAtualizado]));
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED1001");

    // Act
    setupDOM(htmlPerfilPublico);
    await new Promise(process.nextTick);

    // Assert
    expect(document.getElementById('pub-nome').textContent).toBe("Dr. Carlos Silva Junior");
    expect(document.getElementById('pub-endereco').textContent).toBe("Av. Boa Viagem, 500, Recife");
    expect(document.getElementById('pub-preco').textContent).toBe("R$ 999,00");
  });

  test('Deve manter os dados estaticos se o medico nao alterou nada', async () => {
    // Arrange: Semeia o banco com os dados originais (vindos do dbMedicos)
    // Simulando o comportamento da primeira vez que o sistema roda
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));

    // Act: Abre a busca sem ter nenhuma alteracao previa
    setupDOM(htmlBusca);
    await new Promise(process.nextTick);

    // Assert: Deve mostrar os dados originais do dbMedicos
    const textoCards = document.getElementById('lista-medicos').textContent;
    expect(textoCards).toContain("Dr. Carlos Silva");
    expect(textoCards).toContain("R$ 250,00");
  });

  test('Deve redirecionar se o medico selecionado nao existir', async () => {
    // Arrange
    localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Paciente" }));
    localStorage.setItem('@medtriage/medico-selecionado', "MED9999");

    // Act
    setupDOM(htmlPerfilPublico);
    await new Promise(process.nextTick);

    // Assert
    expect(global.alert).toHaveBeenCalledWith("Nenhum médico selecionado. Volte para a busca.");
    expect(window.location.replace).toHaveBeenCalledWith("buscar_especialista.html");
  });
});