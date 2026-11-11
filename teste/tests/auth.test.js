const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const nodeCrypto = require('crypto');

// 1. MOCK DO WEB CRYPTO (JSDOM não tem nativo)
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm, data) => {
        return nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest();
      }
    }
  }
});

describe('MedTriage - Testes de Integração (Fluxo Completo)', () => {
  let dom;
  let document;
  let window;
  let mainJs;

  // Carrega o arquivo main.js real do projeto
  beforeAll(() => {
    mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  });

  // Antes de cada teste, montamos o HTML e o JS no JSDOM
  beforeEach(() => {
    // HTML básico que contém todos os IDs usados no seu main.js
    const html = `
      <body>
        <!-- Elementos do Login -->
        <button id="btn-paciente"></button>
        <button id="btn-profissional"></button>
        <label id="label-id"></label>
        <input id="input-id" />
        <div class="first-time-box"></div>
        <form id="login-form">
          <input type="password" id="senha" />
          <button type="submit">Entrar</button>
        </form>

        <!-- Elementos do Cadastro -->
        <button id="btn-cad-paciente"></button>
        <button id="btn-cad-profissional"></button>
        <h1 id="titulo-cadastro"></h1>
        <p id="subtitulo-cadastro"></p>
        <label id="label-cadastro-id"></label>
        <input id="input-cadastro-id" />
        <div id="grupo-email"></div>
        <form id="cadastro-form">
          <input type="password" id="nova-senha" />
          <input type="password" id="repetir-senha" />
          <input type="email" id="email-cadastro" />
          <button id="btn-submit-cadastro" type="submit"></button>
        </form>

        <!-- Botões do Olho (classe genérica) -->
        <div class="input-wrapper">
          <input type="password" id="senha-teste-olho" />
          <button class="toggle-password"></button>
        </div>
      </body>
    `;

    dom = new JSDOM(html, { url: "http://localhost" });
    document = dom.window.document;
    window = dom.window;

    global.localStorage = window.localStorage;
    global.alert = jest.fn();
    
    // Impede que o JSDOM dê erro ao tentar mudar de página
    delete window.location;
    window.location = { href: "" };

    // Executa o nosso main.js dentro desse ambiente simulado
    const script = document.createElement("script");
    script.textContent = mainJs;
    document.body.appendChild(script);

    // Dispara o evento DOMContentLoaded para o código começar a rodar
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  });

  // ==========================================
  // TESTES 1: UI / INTERFACE
  // ==========================================
  
  test('Deve alternar entre Paciente e Profissional no Login e esconder a caixa branca', () => {
    // 🟢 ARRANGE (Já feito no beforeEach)
    const btnProfissional = document.getElementById('btn-profissional');
    
    // 🔵 ACT
    btnProfissional.dispatchEvent(new window.Event('click', { bubbles: true }));
    
    // 🔴 ASSERT
    expect(document.body.classList.contains('theme-professional')).toBe(true);
    expect(document.getElementById('label-id').textContent).toBe('Matrícula');
    expect(document.querySelector('.first-time-box').style.display).toBe('none');
  });

  test('Deve alternar entre Profissional e Paciente no Cadastro e mostrar o campo E-mail', () => {
    // 🟢 ARRANGE
    const btnCadProf = document.getElementById('btn-cad-profissional');
    const btnCadPac = document.getElementById('btn-cad-paciente');
    
    // 🔵 ACT 1
    btnCadProf.dispatchEvent(new window.Event('click', { bubbles: true }));
    // 🔴 ASSERT 1
    expect(document.body.classList.contains('theme-professional')).toBe(true);
    expect(document.getElementById('grupo-email').style.display).toBe('none');
    
    // 🔵 ACT 2
    btnCadPac.dispatchEvent(new window.Event('click', { bubbles: true }));
    // 🔴 ASSERT 2
    expect(document.body.classList.contains('theme-professional')).toBe(false);
    expect(document.getElementById('grupo-email').style.display).toBe('flex');
  });

  test('Deve aplicar máscara no CPF (Paciente) e remover máscara na Matrícula (Profissional)', () => {
    // 🟢 ARRANGE
    const inputId = document.getElementById('input-id');
    const btnPaciente = document.getElementById('btn-paciente');
    const btnProfissional = document.getElementById('btn-profissional');
    
    // 🔵 ACT 1: Testar CPF
    btnPaciente.dispatchEvent(new window.Event('click', { bubbles: true }));
    inputId.value = "12345678901";
    inputId.dispatchEvent(new window.Event('input', { bubbles: true }));
    
    // 🔴 ASSERT 1
    expect(inputId.value).toBe("123.456.789-01");

    // 🔵 ACT 2: Testar Matrícula
    btnProfissional.dispatchEvent(new window.Event('click', { bubbles: true }));
    inputId.value = "ABC123";
    inputId.dispatchEvent(new window.Event('input', { bubbles: true }));
    
    // 🔴 ASSERT 2
    expect(inputId.value).toBe("123"); // Remove as letras
  });

  test('Deve mostrar e ocultar a senha ao clicar no olho', () => {
    // 🟢 ARRANGE
    const btnOlho = document.querySelector('.toggle-password');
    const inputSenha = document.getElementById('senha-teste-olho');
    
    // 🔵 ACT 1
    btnOlho.dispatchEvent(new window.Event('click', { bubbles: true }));
    // 🔴 ASSERT 1
    expect(inputSenha.type).toBe('text');
    
    // 🔵 ACT 2
    btnOlho.dispatchEvent(new window.Event('click', { bubbles: true }));
    // 🔴 ASSERT 2
    expect(inputSenha.type).toBe('password');
  });

  // ==========================================
  // TESTES 2: REGRAS DE NEGÓCIO (CADASTRO)
  // ==========================================

  test('Deve bloquear cadastro se as senhas não coincidirem', () => {
    // 🟢 ARRANGE
    document.getElementById('btn-cad-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));
    document.getElementById('input-cadastro-id').value = "123.456.789-00";
    document.getElementById('nova-senha').value = "senha123";
    document.getElementById('repetir-senha').value = "senha321";
    
    // 🔵 ACT
    document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    
    // 🔴 ASSERT
    expect(global.alert).toHaveBeenCalledWith("Erro: As senhas não coincidem!");
  });

  test('Deve bloquear cadastro se o e-mail for inválido', () => {
    document.getElementById('btn-cad-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));
    document.getElementById('input-cadastro-id').value = "123.456.789-00";
    document.getElementById('nova-senha').value = "senha123";
    document.getElementById('repetir-senha').value = "senha123";
    document.getElementById('email-cadastro').value = "email-invalido";
    
    document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    
    expect(global.alert).toHaveBeenCalledWith("Erro: Insira um e-mail válido.");
  });

  test('Deve salvar Paciente com sucesso separando no LocalStorage e criptografando a senha', async () => {
    // 🟢 ARRANGE
    document.getElementById('btn-cad-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));
    document.getElementById('input-cadastro-id').value = "123.456.789-00";
    document.getElementById('nova-senha').value = "senha123";
    document.getElementById('repetir-senha').value = "senha123";
    
    // 🔵 ACT
    document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    
    // Aguarda a promise do hash resolver (setTimeout para o event loop)
    await new Promise(process.nextTick);

    // 🔴 ASSERT
    const pacientes = JSON.parse(global.localStorage.getItem('@medtriage/pacientes'));
    const profissionais = global.localStorage.getItem('@medtriage/profissionais');
    
    expect(pacientes.length).toBe(1);
    expect(pacientes[0].id).toBe("123.456.789-00");
    expect(pacientes[0].senhaHash).not.toBe("senha123"); // Senha não pode ser texto puro
    expect(pacientes[0].senhaHash.length).toBe(64); // Tamanho do hash SHA-256
    expect(profissionais).toBeNull(); // Não deve salvar no banco de profissionais
  });

  test('Deve salvar Profissional com sucesso no LocalStorage correto', async () => {
    // 🟢 ARRANGE
    document.getElementById('btn-cad-profissional').dispatchEvent(new window.Event('click', { bubbles: true }));
    document.getElementById('input-cadastro-id').value = "MED-123";
    document.getElementById('nova-senha').value = "senha123";
    document.getElementById('repetir-senha').value = "senha123";
    
    // 🔵 ACT
    document.getElementById('cadastro-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(process.nextTick);

    // 🔴 ASSERT
    const profissionais = JSON.parse(global.localStorage.getItem('@medtriage/profissionais'));
    const pacientes = global.localStorage.getItem('@medtriage/pacientes');
    
    expect(profissionais.length).toBe(1);
    expect(profissionais[0].id).toBe("MED-123");
    expect(pacientes).toBeNull();
  });

  // ==========================================
  // TESTES 3: REGRAS DE NEGÓCIO (LOGIN)
  // ==========================================

  test('Deve autenticar Paciente com credenciais corretas', async () => {
    // 🟢 ARRANGE
    // Criamos um hash fake para a senha "senha123"
    const senhaHashMock = nodeCrypto.createHash('sha256').update("senha123").digest('hex');
    global.localStorage.setItem('@medtriage/pacientes', JSON.stringify([{ id: "123.456.789-00", senhaHash: senhaHashMock }]));
    
    document.getElementById('btn-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));
    document.getElementById('input-id').value = "123.456.789-00";
    document.getElementById('senha').value = "senha123";

    // 🔵 ACT
    document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(process.nextTick);

    // 🔴 ASSERT
    expect(global.alert).toHaveBeenCalledWith("Bem-vindo(a)! Login realizado como paciente.");
  });

  test('Deve bloquear login com senha incorreta', async () => {
    // 🟢 ARRANGE
    const senhaHashMock = nodeCrypto.createHash('sha256').update("senha123").digest('hex');
    global.localStorage.setItem('@medtriage/pacientes', JSON.stringify([{ id: "123.456.789-00", senhaHash: senhaHashMock }]));
    
    document.getElementById('btn-paciente').dispatchEvent(new window.Event('click', { bubbles: true }));
    document.getElementById('input-id').value = "123.456.789-00";
    document.getElementById('senha').value = "senha_errada";

    // 🔵 ACT
    document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(process.nextTick);

    // 🔴 ASSERT
    expect(global.alert).toHaveBeenCalledWith("Erro: Credenciais inválidas. Certifique-se de que está na aba correta (paciente).");
  });

});