// Importa o JSDOM para simular o navegador
const { JSDOM } = require('jsdom');

describe('Tela de Login - Interações', () => {
  
  test('Deve alternar o tipo do input de senha ao clicar no botão (AAA)', () => {
    // 🟢 ARRANGE (Organizar): Criamos um mini HTML para o teste
    const dom = new JSDOM(`
      <input type="password" id="senha" />
      <button id="toggle-senha"></button>
    `);
    const { document } = dom.window;
    const inputSenha = document.getElementById('senha');
    const btnToggle = document.getElementById('toggle-senha');

    // Simulamos a lógica do clique (a mesma que está no main.js)
    btnToggle.addEventListener('click', () => {
      inputSenha.type = inputSenha.type === 'password' ? 'text' : 'password';
    });

    // Verificamos o estado inicial
    expect(inputSenha.type).toBe('password');

    // 🔵 ACT (Agir): Simulamos o clique do usuário
    btnToggle.click();

    // 🔴 ASSERT (Verificar): A senha deve estar visível agora
    expect(inputSenha.type).toBe('text');

    // Ação 2: Clicar novamente
    btnToggle.click();

    // Verificação 2: A senha deve voltar a ficar oculta
    expect(inputSenha.type).toBe('password');
  });
  test('Deve trocar a aba ativa ao clicar em Sou profissional (AAA)', () => {
    // 🟢 ARRANGE (Organizar): Montamos os botões
    const dom = new JSDOM(`
      <button class="tab-btn active" id="btn-paciente">Sou paciente</button>
      <button class="tab-btn" id="btn-profissional">Sou profissional</button>
    `);
    const { document } = dom.window;
    const btnPaciente = document.getElementById('btn-paciente');
    const btnProfissional = document.getElementById('btn-profissional');

    // Simulamos a lógica do clique (igual ao main.js)
    btnProfissional.addEventListener('click', () => {
      btnPaciente.classList.remove('active');
      btnProfissional.classList.add('active');
    });

    // Verificamos o estado inicial
    expect(btnPaciente.classList.contains('active')).toBe(true);
    expect(btnProfissional.classList.contains('active')).toBe(false);

    // 🔵 ACT (Agir): Simulamos o clique no botão de profissional
    btnProfissional.click();

    // 🔴 ASSERT (Verificar): As classes devem ter trocado
    expect(btnPaciente.classList.contains('active')).toBe(false); // Perdeu o azul
    expect(btnProfissional.classList.contains('active')).toBe(true); // Ganhou o azul
  });
  const { JSDOM } = require('jsdom');
// Importa as funções do main.js para testar isoladamente
const { formatarCPF, validarLogin } = require('../js/main.js');

describe('Tela de Login - Interações e Validações', () => {

  // ... (Mantenha os 2 testes anteriores aqui: do olho e das abas) ...

  // 🧪 NOVO TESTE 3: Máscara de CPF
  test('Deve formatar o CPF corretamente enquanto o usuário digita (AAA)', () => {
    // 🟢 ARRANGE: Dados de entrada simulados
    const cpfDigitado = "12345678900";
    const cpfComLetras = "123abc45678900"; // Simulando usuário tentando burlar

    // 🔵 ACT: Chama a função de formatação
    const resultado1 = formatarCPF(cpfDigitado);
    const resultado2 = formatarCPF(cpfComLetras);

    // 🔴 ASSERT: Verifica se o resultado tem a máscara correta
    expect(resultado1).toBe("123.456.789-00");
    expect(resultado2).toBe("123.456.789-00"); // Letras devem sumir
  });

  // 🧪 NOVO TESTE 4: Validação de campos vazios
  test('Não deve permitir login com campos vazios (AAA)', () => {
    // 🟢 ARRANGE: Simulamos o usuário clicando em Entrar sem digitar nada
    const cpfVazio = "";
    const senhaVazia = "";

    // 🔵 ACT: Chama a função de validação
    const resultado = validarLogin(cpfVazio, senhaVazia);

    // 🔴 ASSERT: Verifica se retornou erro
    expect(resultado.valido).toBe(false);
    expect(resultado.mensagem).toBe("Por favor, preencha todos os campos.");
  });

  // 🧪 NOVO TESTE 5: Login com sucesso
  test('Deve permitir login quando campos estão preenchidos (AAA)', () => {
    // 🟢 ARRANGE
    const cpfValido = "123.456.789-00";
    const senhaValida = "minhasenha123";

    // 🔵 ACT
    const resultado = validarLogin(cpfValido, senhaValida);

    // 🔴 ASSERT
    expect(resultado.valido).toBe(true);
    expect(resultado.mensagem).toBe("Login realizado com sucesso!");
  });

});
});