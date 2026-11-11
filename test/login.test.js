  test('Deve bloquear letras e formatar o CPF corretamente (AAA)', () => {
    // 🟢 ARRANGE (Organizar): Criamos o input no DOM simulado
    const dom = new JSDOM(`<input type="text" id="cpf" />`);
    const { document } = dom.window;
    const inputCpf = document.getElementById('cpf');

    // Simulamos a lógica de máscara e bloqueio que fizemos no main.js
    inputCpf.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    // 🔵 ACT (Agir): Simulamos o usuário digitando letras e números
    inputCpf.value = "123abc456def789";
    
    // Dispara o evento 'input' manualmente (como se o usuário tivesse digitado)
    const event = new dom.window.Event('input', { bubbles: true });
    inputCpf.dispatchEvent(event);

    // 🔴 ASSERT (Verificar): Esperamos que sobre apenas números formatados
    // O esperado é "123.456.789-0" (pois o CPF tem 11 dígitos, e cortamos o 9 extra)
    expect(inputCpf.value).toBe("123.456.789-0");
    
    // Verifica se NÃO tem letras no resultado
    expect(inputCpf.value).not.toMatch(/[a-zA-Z]/);
  });