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