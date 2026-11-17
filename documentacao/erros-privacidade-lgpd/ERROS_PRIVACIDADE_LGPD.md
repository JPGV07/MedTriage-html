# Cuidados com Dados Sensíveis de Pacientes (LGPD e Segurança)

> **Atenção:** Nenhum código foi alterado ainda. Esta lista mostra onde os dados de saúde dos pacientes precisam de proteção extra e onde nossas futuras **Skills** vão ajudar.

---

## 1. Senhas dos médicos escritas abertamente no código
- **Onde está:** [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L15-L24) (Linhas 15 a 24)
- **Qual é o risco:**
  - Na lista `dbMedicos`, a senha `"senha123"` está visível para qualquer pessoa que abrir o arquivo `main.js` no navegador.

---

## 2. Dados de saúde e CPF salvos abertos no navegador (`localStorage`)
- **Onde está:**
  - Doenças (HIV, diabetes, hipertensão, deficiências): [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L798-L812) (Linhas 798 a 812)
  - Laudos médicos completos: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1405-L1412) (Linhas 1405 a 1412)
  - Sessão do usuário logado: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L321) (Linha 321)
- **Qual é o risco:**
  - Enquanto o projeto ainda não está ligado ao Back-end real, tudo fica salvo em texto aberto no `localStorage`. Mesmo na sessão ativa (`@medtriage/sessao`), o código guarda o `senhaHash` e a lista de doenças junto.

---

## 3. Textos de laudos e nomes inseridos direto com `innerHTML`
- **Onde está:**
  - Lista de consultas do paciente: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L576-L583)
  - Tabela de busca de pacientes pelo médico: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L935-L940)
  - Tela de laudos do paciente: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1440-L1446)
  - Histórico médico: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1480-L1484) e [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1593-L1597)
- **Qual é o risco:**
  - Se o médico escrever um sinal de menor `<` no laudo (por exemplo: `"Glicemia < 100"`), o navegador acha que é uma tag HTML e pode cortar o resto do laudo na tela (além de permitir injeção de script malicioso).

---

## 4. Qualquer pessoa consegue trocar a senha sabendo só o CPF ou Matrícula
- **Onde está:** [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L500-L520) (Linhas 500 a 520) e [recuperar_senha.html](file:///C:/Users/1362519135/MedTriage-html/recuperar_senha.html)
- **Qual é o risco:**
  - Na tela "Esqueci minha senha", basta digitar o CPF de alguém ou a matrícula `MED1001` e já escolher a nova senha direto, sem código de confirmação por e-mail.
