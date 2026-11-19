(function () {
  const TERMOS_CONFIG = {
    paciente: {
      versao: '1.0.0-PAC',
      titulo: 'Termos de Uso e Política de Privacidade — Paciente (MedTriage)',
      conteudo: `
        <h4>1. Objeto e Aceitação</h4>
        <p>Bem-vindo ao MedTriage. Estes Termos de Uso regulam o acesso e a utilização da plataforma de agendamento presencial e triagem clínica por pacientes.</p>
        <h4>2. Coleta e Tratamento de Dados (LGPD)</h4>
        <p>Seus dados pessoais (Nome, CPF e e-mail opcional) e informações opcionais de condição de saúde informadas durante o agendamento são tratados exclusivamente para identificação clínica, agendamento de consultas presenciais e comunicação assistencial, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        <h4>3. Agendamentos Presenciais e Cancelamentos</h4>
        <p>Os agendamentos realizados na plataforma destinam-se exclusivamente a atendimentos presenciais. Cancelamentos e reagendamentos devem respeitar a antecedência mínima estipulada pela unidade.</p>
        <h4>4. Responsabilidades do Usuário</h4>
        <p>O paciente compromete-se a fornecer informações verídicas e manter suas credenciais de acesso em sigilo.</p>
        <p><strong>Fim do documento — Versão 1.0.0-PAC.</strong></p>
      `
    },
    medico: {
      versao: '1.0.0-MED',
      titulo: 'Termos de Uso e Responsabilidade Profissional — Médico (MedTriage)',
      conteudo: `
        <h4>1. Credenciamento Profissional</h4>
        <p>O cadastro médico no MedTriage destina-se exclusivamente a profissionais regularmente inscritos no Conselho Regional de Medicina (CRM) ativo e vinculados institucionalmente.</p>
        <h4>2. Sigilo Médico e Segurança da Informação</h4>
        <p>O profissional compromete-se a zelar pelo sigilo absoluto das informações clínicas e condições de saúde compartilhadas pelos pacientes no fluxo de agendamento presencial, observando o Código de Ética Médica e a LGPD.</p>
        <h4>3. Agenda Presencial e Disponibilidade</h4>
        <p>O médico é responsável por manter sua agenda atualizada e cumprir os horários disponibilizados para atendimento presencial na plataforma.</p>
        <h4>4. Auditoria e Rastreabilidade</h4>
        <p>Todas as ações realizadas no sistema são registradas com data, hora e identificador profissional para fins de segurança e auditoria.</p>
        <p><strong>Fim do documento — Versão 1.0.0-MED.</strong></p>
      `
    }
  };

  let aceiteState = {
    aceito: false,
    versao: null,
    aceitoEm: null,
    tipo: 'paciente'
  };

  function initTermos() {
    const container = document.getElementById('termos-container');
    if (!container || container.dataset.initialized === 'true') return;
    container.dataset.initialized = 'true';

    const tipo = container.dataset.tipoTermos || (window.location.pathname.includes('medico') ? 'medico' : 'paciente');
    const config = TERMOS_CONFIG[tipo] || TERMOS_CONFIG.paciente;
    aceiteState.tipo = tipo;
    aceiteState.versao = config.versao;

    container.innerHTML = `
      <div class="termos-box">
        <label class="termos-checkbox-label" for="aceiteTermosCheckbox">
          <input type="checkbox" id="aceiteTermosCheckbox" required />
          <span>Li e concordo com os <button type="button" id="btnAbrirModalTermos" class="btn-link-termos">Termos de Uso (${config.versao})</button></span>
        </label>
      </div>
      <div id="modalTermos" class="termos-modal" aria-hidden="true">
        <div class="termos-modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTermosTitulo">
          <div class="termos-modal-header">
            <h3 id="modalTermosTitulo">${config.titulo}</h3>
            <button type="button" id="btnFecharModalTermos" class="termos-close" aria-label="Fechar">&times;</button>
          </div>
          <div id="termosScrollArea" class="termos-modal-body">
            ${config.conteudo}
          </div>
          <div class="termos-modal-footer">
            <span id="termosScrollHint" class="termos-scroll-hint">Role até o final do texto para habilitar o aceite.</span>
            <button type="button" id="btnConfirmarTermos" class="btn btn-primary" disabled>Li e Aceito os Termos</button>
          </div>
        </div>
      </div>
    `;

    const checkbox = document.getElementById('aceiteTermosCheckbox');
    const modal = document.getElementById('modalTermos');
    const btnAbrir = document.getElementById('btnAbrirModalTermos');
    const btnFechar = document.getElementById('btnFecharModalTermos');
    const scrollArea = document.getElementById('termosScrollArea');
    const btnConfirmar = document.getElementById('btnConfirmarTermos');
    const scrollHint = document.getElementById('termosScrollHint');

    let leuAteOFim = false;

    function abrirModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (scrollArea.scrollHeight <= scrollArea.clientHeight + 10) {
        leuAteOFim = true;
        btnConfirmar.disabled = false;
        scrollHint.textContent = 'Leitura concluída.';
      }
    }

    function fecharModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    scrollArea.addEventListener('scroll', () => {
      const chegouNoFim = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 12;
      if (chegouNoFim && !leuAteOFim) {
        leuAteOFim = true;
        btnConfirmar.disabled = false;
        scrollHint.textContent = 'Leitura concluída. Você já pode confirmar o aceite.';
      }
    });

    btnAbrir.addEventListener('click', abrirModal);
    btnFechar.addEventListener('click', fecharModal);

    checkbox.addEventListener('click', (e) => {
      if (!leuAteOFim && checkbox.checked) {
        e.preventDefault();
        abrirModal();
      } else if (checkbox.checked) {
        aceiteState.aceito = true;
        aceiteState.aceitoEm = new Date().toISOString().slice(0, 19);
      } else {
        aceiteState.aceito = false;
        aceiteState.aceitoEm = null;
      }
    });

    btnConfirmar.addEventListener('click', () => {
      if (!leuAteOFim) return;
      checkbox.checked = true;
      aceiteState.aceito = true;
      aceiteState.aceitoEm = new Date().toISOString().slice(0, 19);
      fecharModal();
    });
  }

  document.addEventListener('DOMContentLoaded', initTermos);

  window.MedTriageTermos = {
    getDadosAceite: () => ({
      termosAceitos: Boolean(aceiteState.aceito && document.getElementById('aceiteTermosCheckbox')?.checked),
      termosVersao: aceiteState.versao,
      termosAceitoEm: aceiteState.aceitoEm
    })
  };
})();
