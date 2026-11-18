// Importa a função auxiliar para selecionar elementos da página.
import { $ } from "../core/utils.js";

// Importa as chaves utilizadas para acessar os dados armazenados localmente.
import { K } from "../core/config.js";

// Importa as funções responsáveis pela autenticação e pelas requisições à API.
import { requireLogin, apiFetch } from "../core/auth.js";

// Importa a função que preenche a saudação do usuário na página.
import { preencherGreeting } from "../core/ui.js";

// Importa a inicialização dos recursos comuns das páginas.
import { initCommon } from "../core/init.js";

// Inicializa os recursos compartilhados do sistema.
initCommon();

// Executa o carregamento e o funcionamento da página de edição dos dados do paciente.
(async () => {
  // Verifica se o formulário de edição dos dados existe na página.
  if (!$("form-meus-dados")) return;

  // Verifica se o usuário está autenticado.
  const s = await requireLogin();
  if (!s) return;

  // Preenche a saudação com as informações do usuário.
  preencherGreeting();

  // Recupera o ID do paciente armazenado localmente.
  const pid = Number(localStorage.getItem(K.pacienteId));

  // Se não houver um ID válido, retorna ao painel do paciente.
  if (!pid) { window.location.replace("paciente_dashboard.html"); return; }

  // Declara a variável que armazenará os dados do paciente.
  let p;

  try {
    // Busca os dados do paciente na API utilizando o ID do usuário autenticado.
    p = await apiFetch(`/pac/usuario/${encodeURIComponent(s.id)}`);
  }
  catch {
    // Caso ocorra um erro, retorna ao painel do paciente.
    window.location.replace("paciente_dashboard.html");
    return;
  }

  // Preenche o campo de nome com os dados cadastrados.
  $("dados-nome").value = p.nome || "";

  // Preenche o campo de CPF com o identificador do usuário autenticado.
  $("dados-cpf").value = s.id || "";

  // Preenche o campo de nascimento, caso ele exista na página.
  if ($("dados-nascimento")) $("dados-nascimento").value = p.dataNascimento || "";

  // Preenche o campo de peso, caso ele exista na página.
  if ($("dados-peso")) $("dados-peso").value = p.peso || "";

  // Preenche o campo de altura, caso ele exista na página.
  if ($("dados-altura")) $("dados-altura").value = p.altura || "";

  // Recupera o e-mail salvo localmente para o paciente.
  if ($("dados-email")) $("dados-email").value =
    localStorage.getItem("@medtriage/email-" + s.id) || "";

  // Recupera o telefone salvo localmente para o paciente.
  if ($("dados-telefone")) $("dados-telefone").value =
    localStorage.getItem("@medtriage/tel-" + s.id) || "";

  // Recupera o campo de telefone para configurar sua formatação.
  const tel = $("dados-telefone");

  // Verifica se o campo de telefone existe antes de adicionar o evento.
  if (tel) tel.addEventListener("input", (e) => {
    // Remove caracteres que não sejam números e limita o telefone a 11 dígitos.
    let v = e.target.value.replace(/\D/g, "").substring(0, 11);

    // Formata números com mais de seis dígitos no padrão (DD) 99999-9999.
    if (v.length > 6) v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");

    // Formata números com mais de dois dígitos no padrão (DD) 99999.
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");

    // Adiciona o parêntese inicial quando o usuário começa a digitar.
    else if (v.length > 0) v = v.replace(/^(\d*)/, "($1");

    // Atualiza o campo com o telefone formatado.
    e.target.value = v;
  });

  // Adiciona o evento responsável por salvar as alterações do formulário.
  $("form-meus-dados").addEventListener("submit", async (e) => {
    // Impede que o formulário seja enviado pelo comportamento padrão do navegador.
    e.preventDefault();

    // Recupera o nome informado e remove espaços desnecessários.
    const nome = $("dados-nome").value.trim();

    // Recupera a data de nascimento ou utiliza null caso não esteja preenchida.
    const nasc = $("dados-nascimento")?.value || null;

    // Recupera o peso informado pelo paciente.
    const peso = $("dados-peso")?.value;

    // Recupera a altura informada pelo paciente.
    const altura = $("dados-altura")?.value;

    try {
      // Envia as alterações dos dados pessoais do paciente para a API.
      await apiFetch(`/pac/${pid}`, {
        // Define o método HTTP utilizado para atualizar os dados.
        method: "PUT",

        // Converte os dados atualizados para JSON.
        body: JSON.stringify({
          usuario: s.id,
          nome,
          data_Nascimento: nasc,
          peso: peso ? parseFloat(peso) : null,
          altura: altura ? parseFloat(altura) : null,
        }),
      });

      // Recupera o e-mail informado e remove espaços desnecessários.
      const em = $("dados-email")?.value.trim();

      // Recupera o telefone informado e remove espaços desnecessários.
      const tl = $("dados-telefone")?.value.trim();

      // Salva o e-mail no armazenamento local, caso tenha sido preenchido.
      if (em) localStorage.setItem("@medtriage/email-" + s.id, em);

      // Salva o telefone no armazenamento local, caso tenha sido preenchido.
      if (tl) localStorage.setItem("@medtriage/tel-" + s.id, tl);

      // Informa que os dados foram salvos com sucesso.
      alert("Dados salvos!");

      // Retorna o usuário ao painel do paciente.
      window.location.href = "paciente_dashboard.html";
    } catch (err) {
      // Exibe a mensagem de erro caso não seja possível salvar os dados.
      alert(err.message);
    }
  });
})();