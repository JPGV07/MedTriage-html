  // ... (testes anteriores se mantêm)

    test('Deve avisar se o CPF não existir e NÃO contar como tentativa', async () => {
      // Não criamos nenhum usuário no banco
      document.getElementById('input-id').value = "000.000.000-00";
      document.getElementById('senha').value = "qualquer_senha";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      // Deve avisar que não encontrou
      expect(global.alert).toHaveBeenCalledWith("Erro: CPF não encontrado(a). Verifique os dados ou crie uma conta.");
      
      // A tentativa NÃO deve ter sido contada
      expect(localStorage.getItem('@medtriage/tentativas')).toBeNull();
    });

    test('Deve contar tentativa apenas se o CPF existir e a senha estiver errada', async () => {
      // Cria um usuário válido no banco
      const hash = nodeCrypto.createHash('sha256').update("senha123").digest('hex');
      localStorage.setItem('@medtriage/pacientes', JSON.stringify([
        { id: "123.456.789-00", nome: "Maria da Silva", senhaHash: hash }
      ]));

      document.getElementById('input-id').value = "123.456.789-00";
      document.getElementById('senha').value = "senha_errada";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      // Deve avisar senha incorreta
      expect(global.alert).toHaveBeenCalledWith("Erro: Senha incorreta. Você tem 4 tentativas restantes.");
      
      // A tentativa DEVE ter sido contada
      expect(localStorage.getItem('@medtriage/tentativas')).toBe("1");
    });

    test('Não deve permitir login se o CPF não existir, mesmo com bloqueio desativado', async () => {
      // Zera tentativas
      localStorage.setItem('@medtriage/tentativas', "0");
      
      document.getElementById('input-id').value = "111.111.111-11";
      document.getElementById('senha').value = "senha123";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      expect(global.alert).toHaveBeenCalledWith("Erro: CPF não encontrado(a). Verifique os dados ou crie uma conta.");
      expect(window.location.href).not.toBe("paciente_dashboard.html");
    });
        test('Deve sugerir troca de senha se tentar logar bloqueado', async () => {
      // Simula usuário bloqueado
      localStorage.setItem('@medtriage/tentativas', "5");
      global.confirm = jest.fn().mockReturnValue(true); // Simula usuário clicando em "OK"
      
      document.getElementById('input-id').value = "123.456.789-00";
      document.getElementById('senha').value = "qualquer";

      document.getElementById('login-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      // Verifica se o confirm foi chamado e redirecionou
      expect(global.confirm).toHaveBeenCalled();
      expect(window.location.href).toBe("recuperar_senha.html");
    });

    test('Deve permitir redefinir a senha na tela de recuperação', async () => {
      // Cria um paciente
      const hashAntigo = nodeCrypto.createHash('sha256').update("senha_antiga").digest('hex');
      localStorage.setItem('@medtriage/pacientes', JSON.stringify([{ id: "123.456.789-00", senhaHash: hashAntigo }]));
      localStorage.setItem('@medtriage/reset-perfil', "paciente"); // Simula que veio do login de paciente

      // Recria o DOM para carregar a tela de recuperação (simulação)
      setupDOM(); 
      // Nota: Como o JSDOM não recarrega a página real, precisamos injetar o form de recuperação manualmente para o teste
      document.body.innerHTML += `
        <form id="recuperar-form">
          <input id="input-recuperar-id" />
          <input id="nova-senha-recuperar" />
          <input id="repetir-senha-recuperar" />
          <button type="submit"></button>
        </form>
        <label id="label-recuperar-id"></label>
      `;
      
      // Re-executa o script para pegar os novos elementos
      const script = document.createElement("script");
      script.textContent = mainJs;
      document.body.appendChild(script);
      document.dispatchEvent(new window.Event('DOMContentLoaded'));

      // Preenche o formulário
      document.getElementById('input-recuperar-id').value = "123.456.789-00";
      document.getElementById('nova-senha-recuperar').value = "senha_nova";
      document.getElementById('repetir-senha-recuperar').value = "senha_nova";

      document.getElementById('recuperar-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(process.nextTick);

      // Verifica se o hash foi atualizado no banco
      const pacientesAtualizados = JSON.parse(localStorage.getItem('@medtriage/pacientes'));
      const hashNovo = nodeCrypto.createHash('sha256').update("senha_nova").digest('hex');
      
      expect(pacientesAtualizados[0].senhaHash).toBe(hashNovo);
      expect(localStorage.getItem('@medtriage/tentativas')).toBe("0");
    });