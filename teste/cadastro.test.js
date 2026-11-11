const { JSDOM } = require('jsdom');

describe('Validação Completa do Formulário de Cadastro', () => {
  let dom;
  let document;
  let form;
  let novaSenha;
  let repetirSenha;
  let emailCadastro;

  // 🟢 ARRANGE (Organizar) - Roda antes de cada teste
  beforeEach(() => {
    // Simulamos o HTML da tela de cadastro no JSDOM
    dom = new JSDOM(`
      <form id="cadastro-form">
        <input type="password" id="nova-senha" value="">
        <input type="password" id="repetir-senha" value="">
        <input type="text" id="email-cadastro" value="">
        <button type="submit">Criar</button>
      </form>
    `);
    
    document = dom.window.document;
    form = document.getElementById('cadastro-form');
    novaSenha = document.getElementById('nova-senha');
    repetirSenha = document.getElementById('repetir-senha');
    emailCadastro = document.getElementById('email-cadastro');

    // "Espiona" o alerta do navegador para vermos se ele foi chamado
    global.alert = jest.fn();

    // Colamos aqui a mesma lógica do nosso main.js para testá-la
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (novaSenha.value !== repetirSenha.value) {
        alert("Erro: As senhas não coincidem!");
        return;
      }
      if (novaSenha.value.length < 6) {
        alert("Erro: A senha precisa ter pelo menos 6 caracteres.");
        return;
      }
      if (emailCadastro.value.trim() !== "") {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(emailCadastro.value.trim())) {
          alert("Erro: Por favor, insira um e-mail válido (ex: nome@dominio.com).");
          emailCadastro.style.borderColor = "#EF4444"; 
          return;
        } else {
          emailCadastro.style.borderColor = "var(--border-color)";
        }
      }
      alert("Conta criada com sucesso! (Simulação)");
    });
  });

  // 🔵 ACT (Agir) e 🔴 ASSERT (Verificar) - Testes Individuais

  test('Deve bloquear o cadastro se as senhas não coincidirem', () => {
    // Arrange (Já feito no beforeEach, só preenchemos os valores)
    novaSenha.value = "senha123";
    repetirSenha.value = "senha321";

    // Act (Dispara o submit)
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    // Assert
    expect(global.alert).toHaveBeenCalledWith("Erro: As senhas não coincidem!");
  });

  test('Deve bloquear o cadastro se a senha tiver menos de 6 caracteres', () => {
    novaSenha.value = "123";
    repetirSenha.value = "123";

    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    expect(global.alert).toHaveBeenCalledWith("Erro: A senha precisa ter pelo menos 6 caracteres.");
  });

  test('Deve bloquear o cadastro e pintar a borda se o e-mail for inválido', () => {
    novaSenha.value = "senha123";
    repetirSenha.value = "senha123";
    emailCadastro.value = "email-invalido-sem-arroba";

    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    // Verifica o alerta
    expect(global.alert).toHaveBeenCalledWith("Erro: Por favor, insira um e-mail válido (ex: nome@dominio.com).");
    // Verifica se a borda ficou vermelha (JSDOM converte o HEX #EF4444 para RGB)
    expect(emailCadastro.style.borderColor).toBe("rgb(239, 68, 68)"); 
  });

  test('Deve permitir o cadastro se o e-mail for válido e as senhas estiverem certas', () => {
    novaSenha.value = "senha123";
    repetirSenha.value = "senha123";
    emailCadastro.value = "paciente@exemplo.com";

    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    expect(global.alert).toHaveBeenCalledWith("Conta criada com sucesso! (Simulação)");
    // A borda não deve estar vermelha
    expect(emailCadastro.style.borderColor).not.toBe("rgb(239, 68, 68)");
  });

  test('Deve permitir o cadastro se o e-mail estiver em branco (opcional)', () => {
    novaSenha.value = "senha123";
    repetirSenha.value = "senha123";
    emailCadastro.value = ""; // Vazio

    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    expect(global.alert).toHaveBeenCalledWith("Conta criada com sucesso! (Simulação)");
  });
});