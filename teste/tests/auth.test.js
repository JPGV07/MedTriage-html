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

describe('MedTriage - Testes de Integração Completos', () => {
  let dom;
  let document;
  let window;
  let mainJs;

  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  // HTML Simulado com TODOS os elementos que o main.js usa
  const htmlBase = `
    <body>
      <!-- Login -->
      <button id="btn-paciente"></button>
      <button id="btn-profissional"></button>
      <label id="label-id"></label>
      <input id="input-id" />
      <div class="first-time-box"></div>
      <form id="login-form">
        <input type="password" id="senha" />
        <button type="submit">Entrar</button>
      </form>

      <!-- Cadastro -->
      <form id="cadastro-form">
        <input id="nome-cadastro" />
        <input id="input-cadastro-id" />
        <input type="password" id="nova-senha" />
        <input type="password" id="repetir-senha" />
        <input type="email" id="email-cadastro" />
        <button type="submit">Criar</button>
      </form>

      <!-- Dashboard -->
      <h1 id="welcome-title"></h1>
      <span id="user-greeting"></span>
      <h3 id="info-nome"></h3>
      <span id="info-cpf"></span>
      <span id="info-email"></span>
      <button id="btn-logout"></button>

      <!-- Olho da senha -->
      <div class="input-wrapper">
        <input type="password" id="senha-teste-olho" />
        <button class="toggle-password"></button>
      </div>
    </body>
  `;

  const setupDOM = () => {
    dom = new JSDOM(htmlBase, { url: "http://localhost" });
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
    setupDOM();
  });

  // ==========================================
  // TESTES DA INTERFACE (UI)
  // ==========================================
  describe('Interface e Alternância de Perfis', () => {

    test('Deve alternar para profissional: aplicar tema, mudar label e esconder a caixa branca', () => {
      const btnProfissional = document.getElementById('btn-profissional');
      btnProfissional.dispatchEvent(new window.Event('click', { bubbles: true }));

      expect(document.body.classList.contains('theme-professional')).toBe(true);
      expect(document.getElementById('label-id').textContent).toBe('Matrícula');
      expect(document.querySelector('.first-time-box').style.display).toBe('none');
    });

    test('Deve voltar para paciente: remover tema, voltar label e mostrar a caixa branca', () => {
      // Vai para profissional
      document.getElementById('btn-profissional').dispatchEvent(new window.Event('click', { bubbles: true }));
      
      // Volta para paciente
      document.getElementById('btn-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));

      expect(document.body.classList.contains('theme-professional')).toBe(false);
      expect(document.getElementById('label-id').textContent).toBe('CPF');
      expect(document.querySelector('.first-time-box').style.display).toBe('block');
    });

    test('Deve aplicar máscara de CPF no modo paciente e remover letras no modo profissional', () => {
      const inputId = document.getElementById('input-id');

      // Modo Paciente
      document.getElementById('btn-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));
      inputId.value = "12345678901";
      inputId.dispatchEvent(new window.Event('input', { bubbles: true }));
      expect(inputId.value).toBe("123.456.789-01");

      // Modo Profissional
      document.getElementById('btn-profissional').dispatchEvent(new window.Event('click', { bubbles: true }));
      inputId.value = "ABC123";
      inputId.dispatchEvent(new window.Event('input', { bubbles: true }));
      expect(inputId.value).toBe("123");
    });

    test('Deve mostrar e ocultar a senha ao clicar no olho', () => {
      const btnOlho = document.querySelector('.toggle-password');
      const inputSenha = document.getElementById('senha-teste-olho');

      btnOlho.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(inputSenha.type).toBe('text');

      btnOlho.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(inputSenha.type).toBe('password');
    });
  });

  // ==========================================
  // TESTES DE CADASTRO
  // ==========================================
  describe('Validações do Cadastro', () => {

    test('Deve bloquear cadastro se o nome estiver vazio', async () => {
      document.getElementById('nome-cadastro').value = "";
      document.getElementById('input-cadastro-id').value = "123.456.789-00";
      document.getElementById('nova-senha').value = "senha123";
      document.getElementById('repetir-senha').value = "senha123";

      document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(global.alert).toHaveBeenCalledWith("Erro: Insira seu nome completo.");
    });

    test('Deve bloquear cadastro se as senhas não coincidirem', async () => {
      document.getElementById('nome-cadastro').value = "Maria da Silva";
      document.getElementById('input-cadastro-id').value = "123.456.789-00";
      document.getElementById('nova-senha').value = "senha123";
      document.getElementById('repetir-senha').value = "senha321";

      document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(global.alert).toHaveBeenCalledWith("Erro: As senhas não coincidem!");
    });

    test('Deve bloquear cadastro se o e-mail for inválido', async () => {
      document.getElementById('nome-cadastro').value = "Maria";
      document.getElementById('input-cadastro-id').value = "123.456.789-00";
      document.getElementById('nova-senha').value = "senha123";
      document.getElementById('repetir-senha').value = "senha123";
      document.getElementById('email-cadastro').value = "email_invalido";

      document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(global.alert).toHaveBeenCalledWith("Erro: Insira um e-mail válido.");
    });

    test('Deve salvar novo paciente com nome, e-mail, senha criptografada e redirecionar para o dashboard', async () => {
      document.getElementById('nome-cadastro').value = "Maria da Silva";
      document.getElementById('input-cadastro-id').value = "123.456.789-00";
      document.getElementById('nova-senha').value = "senha123";
      document.getElementById('repetir-senha').value = "senha123";
      document.getElementById('email-cadastro').value = "maria@teste.com";

      document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      const pacientes = JSON.parse(localStorage.getItem('@medtriage/pacientes'));
      expect(pacientes.length).toBe(1);
      expect(pacientes[0].nome).toBe("Maria da Silva");
      expect(pacientes[0].email).toBe("maria@teste.com");
      expect(pacientes[0].senhaHash).not.toBe("senha123");
      expect(pacientes[0].senhaHash.length).toBe(64);

      // Verifica login automático
      const sessao = JSON.parse(localStorage.getItem('@medtriage/sessao'));
      expect(sessao.id).toBe("123.456.789-00");
      expect(window.location.href).toBe("paciente_dashboard.html");
    });

    test('Deve bloquear cadastro com CPF duplicado', async () => {
      localStorage.setItem('@medtriage/pacientes', JSON.stringify([{ id: "123.456.789-00", nome: "Maria", senhaHash: "abc" }]));
      
      document.getElementById('nome-cadastro').value = "Outro Nome";
      document.getElementById('input-cadastro-id').value = "123.456.789-00";
      document.getElementById('nova-senha').value = "senha123";
      document.getElementById('repetir-senha').value = "senha123";

      document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(global.alert).toHaveBeenCalledWith("Erro: Este CPF já possui cadastro.");
    });
  });

  // ==========================================
  // TESTES DE LOGIN
  // ==========================================
  describe('Fluxo de Login e Segurança', () => {

    const criarPacienteMock = async () => {
      const hash = nodeCrypto.createHash('sha256').update("senha123").digest('hex');
      localStorage.setItem('@medtriage/pacientes', JSON.stringify([
        { id: "123.456.789-00", nome: "Maria da Silva", senhaHash: hash, email: "maria@teste.com" }
      ]));
    };

    test('Deve logar com credenciais corretas e redirecionar para o dashboard', async () => {
      await criarPacienteMock();
      
      document.getElementById('input-id').value = "123.456.789-00";
      document.getElementById('senha').value = "senha123";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(localStorage.getItem('@medtriage/sessao')).not.toBeNull();
      expect(window.location.href).toBe("paciente_dashboard.html");
    });

    test('Deve incrementar tentativas ao errar a senha', async () => {
      await criarPacienteMock();
      
      document.getElementById('input-id').value = "123.456.789-00";
      document.getElementById('senha').value = "senhaerrada";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(localStorage.getItem('@medtriage/tentativas')).toBe("1");
      expect(global.alert).toHaveBeenCalledWith("Erro: Credenciais inválidas. Você tem 4 tentativas restantes.");
    });

    test('Deve bloquear após 5 tentativas erradas', async () => {
      await criarPacienteMock();
      localStorage.setItem('@medtriage/tentativas', "5");
      
      document.getElementById('input-id').value = "123.456.789-00";
      document.getElementById('senha').value = "senha123";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Acesso bloqueado")
      );
    });

    test('Deve zerar tentativas após login bem-sucedido', async () => {
      await criarPacienteMock();
      localStorage.setItem('@medtriage/tentativas', "3");
      
      document.getElementById('input-id').value = "123.456.789-00";
      document.getElementById('senha').value = "senha123";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(localStorage.getItem('@medtriage/tentativas')).toBe("0");
    });
  });

  // ==========================================
  // TESTES DO DASHBOARD
  // ==========================================
  describe('Dashboard do Paciente', () => {

    test('Deve preencher as informações do paciente ao carregar', () => {
      localStorage.setItem('@medtriage/sessao', JSON.stringify({
        id: "123.456.789-00",
        nome: "Maria da Silva",
        email: "maria@teste.com"
      }));

      // Recria o DOM para simular o carregamento do dashboard
      setupDOM();

      expect(document.getElementById('welcome-title').textContent).toBe("Olá, Maria da Silva");
      expect(document.getElementById('user-greeting').textContent).toBe("Olá, Maria da Silva");
      expect(document.getElementById('info-nome').textContent).toBe("Maria da Silva");
      expect(document.getElementById('info-cpf').textContent).toBe("123.456.789-00");
      expect(document.getElementById('info-email').textContent).toBe("maria@teste.com");
    });

    test('Deve redirecionar para login se não houver sessão ativa', () => {
      // Sem sessão no localStorage
      setupDOM();
      
      expect(global.alert).toHaveBeenCalledWith("Acesso negado. Faça login primeiro.");
      expect(window.location.replace).toHaveBeenCalledWith("index.html");
    });

    test('Deve limpar sessão e tentativas ao clicar em Sair e redirecionar', () => {
      localStorage.setItem('@medtriage/sessao', JSON.stringify({ id: "123", nome: "Maria" }));
      localStorage.setItem('@medtriage/tentativas', "2");
      
      setupDOM();
      
      const btnLogout = document.getElementById('btn-logout');
      btnLogout.dispatchEvent(new window.Event('click', { bubbles: true }));

      expect(localStorage.getItem('@medtriage/sessao')).toBeNull();
      expect(localStorage.getItem('@medtriage/tentativas')).toBeNull();
      expect(window.location.replace).toHaveBeenCalledWith("index.html");
    });
  });
});