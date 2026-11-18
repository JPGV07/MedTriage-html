# MedTriage-HTML — Correções e Melhorias do Sistema de Triagem

Implementar as seguintes correções e melhorias no projeto MedTriage:

**1. Correção do agendamento**
- Ajustar o sistema de agendamentos para impedir a seleção de datas e horários que já passaram.
- Permitir somente agendamentos em datas e horários futuros.

**2. Validação dos agendamentos**
- Implementar validações para garantir que as datas e os horários selecionados sejam válidos.
- Garantir que o agendamento seja realizado corretamente, impedindo informações incorretas ou incompletas.

**3. Integração com o Back-end**
- Substituir as simulações existentes no Front-end por requisições reais à API do Back-end.
- Garantir a comunicação correta entre o Front-end e o Back-end.

**4. Persistência dos dados**
- Garantir que os agendamentos sejam registrados no banco de dados real.
- Permitir que os agendamentos cadastrados sejam consultados e atualizados corretamente.

**5. Referência do repositório**
- Utilizar como referência a página de Enums do repositório do Kevin (Up Kevin).

**6. Remoção da teleconsulta**
- Remover todas as funcionalidades, opções, referências e telas relacionadas à teleconsulta do sistema.

**7. Alterações nas condições de saúde**
- Remover a tela e o cadastro separado de condições de saúde.
- Manter o campo de condição de saúde somente na tela de agendamento.
- Esse campo deverá ser opcional.
- Salvar as informações localmente (*localStorage*).

**8. Implementação do CAPTCHA**
- Adicionar a funcionalidade de CAPTCHA ao sistema, para verificar se o acesso está sendo realizado por uma pessoa e aumentar a segurança.

**9. Funcionalidade de e-mail**
- Implementar o funcionamento real da funcionalidade de e-mail.
- Garantir que o sistema consiga enviar e-mails corretamente, utilizando uma integração adequada com o Back-end.
