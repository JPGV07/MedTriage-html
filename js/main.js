// Utilitário de segurança (Hash SHA-256)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  
  let perfilAtivo = "paciente"; 

  // Lógica do olho da senha
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const wrapper = e.currentTarget.closest('.input-wrapper');
      const input = wrapper.querySelector('input');
      
      if (input.type === "password") {
        input.type = "text";
        e.currentTarget.style.opacity = "1";
      } else {
        input.type = "password";
        e.currentTarget.style.opacity = "0.6";
      }
    });
  });

  // Lógica da tela de login
  const btnPaciente = document.getElementById("btn-paciente");
  const btnProfissional = document.getElementById("btn-profissional");
  const labelId = document.getElementById("label-id");
  const inputId = document.getElementById("input-id");
  const firstTimeBox = document.querySelector(".first-time-box");

  if (btnPaciente && btnProfissional) {
    
    // Aba Paciente
    btnPaciente.addEventListener("click", () => {
      perfilAtivo = "paciente";
      document.body.classList.remove("theme-professional");
      btnPaciente.classList.add("active");
      btnProfissional.classList.remove("active");
      
      labelId.textContent = "CPF";
      inputId.placeholder = "000.000.000-00";
      inputId.value = ""; 
      
      if (firstTimeBox) firstTimeBox.style.display = "block"; 
    });

    // Aba Profissional
    btnProfissional.addEventListener("click", () => {
      perfilAtivo = "profissional";
      document.body.classList.add("theme-professional");
      btnProfissional.classList.add("active");
      btnPaciente.classList.remove("active");
      
      labelId.textContent = "Matrícula";
      inputId.placeholder = "Digite sua matrícula";
      inputId.value = "";
      
      if (firstTimeBox) firstTimeBox.style.display = "none"; 
    });

    // Máscara de CPF / Matrícula
    inputId.addEventListener("input", function (e) {
      if (perfilAtivo === "profissional") {
        e.target.value = e.target.value.replace(/[^0-9]/g, ""); 
        return;
      }
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    // Submissão do Login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const idDigitado = inputId.value.trim();
      const senhaDigitada = document.getElementById("senha").value;
      
      const storageKey = perfilAtivo === "paciente" ? "@medtriage/pacientes" : "@medtriage/profissionais";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];
      const senhaHash = await hashPassword(senhaDigitada);

      const user = usuariosSalvos.find(u => u.id === idDigitado && u.senhaHash === senhaHash);

      if (user) {
        alert(`Bem-vindo(a)! Login realizado como ${perfilAtivo}.`);
      } else {
        alert(`Erro: Credenciais inválidas. Certifique-se de que está na aba correta (${perfilAtivo}).`);
      }
    });
  }

  // Lógica da tela de cadastro (Apenas Paciente)
  const formCadastro = document.getElementById("cadastro-form");
  
  if (formCadastro) {
    const inputCadastroId = document.getElementById("input-cadastro-id");
    
    inputCadastroId.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "").substring(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = valor;
    });

    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const idValue = inputCadastroId.value.trim();
      const senha = document.getElementById("nova-senha").value;
      const repetir = document.getElementById("repetir-senha").value;
      const email = document.getElementById("email-cadastro").value.trim();

      if (senha !== repetir) return alert("Erro: As senhas não coincidem!");
      if (senha.length < 6) return alert("Erro: A senha precisa ter pelo menos 6 caracteres.");
      if (idValue.length < 14) return alert("Erro: CPF incompleto.");
      
      if (email !== "") {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) return alert("Erro: Insira um e-mail válido.");
      }

      const storageKey = "@medtriage/pacientes";
      const usuariosSalvos = JSON.parse(localStorage.getItem(storageKey)) || [];

      if (usuariosSalvos.some(user => user.id === idValue)) {
        return alert("Erro: Este CPF já possui cadastro.");
      }

      const senhaHash = await hashPassword(senha);
      const novoUsuario = { id: idValue, senhaHash: senhaHash, email: email };
      
      usuariosSalvos.push(novoUsuario);
      localStorage.setItem(storageKey, JSON.stringify(usuariosSalvos));

      alert("Conta criada com sucesso! Você já pode fazer login.");
      window.location.href = "index.html"; 
    });
  }
});