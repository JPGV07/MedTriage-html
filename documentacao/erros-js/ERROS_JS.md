# Problemas Encontrados no JavaScript

> **Atenção:** Nenhum código foi alterado ainda. Aqui estão os pontos de lógica e repetição no JavaScript para a equipe revisar.

---

## 1. Código de máscara de CPF repetido duas vezes na mesma tela
- **Onde está:**
  - No final do HTML: [medico_dashboard.html](file:///C:/Users/1362519135/MedTriage-html/medico_dashboard.html#L309-L350) (Linhas 309 a 350)
  - Dentro do JS principal: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L953-L985) (Linhas 953 a 985)
- **Qual é o problema:**
  - O script colocado no final do `medico_dashboard.html` faz exatamente a mesma máscara de CPF e o mesmo botão de limpar que já estão dentro do `js/main.js`. Isso faz o navegador rodar a mesma função duas vezes a cada tecla digitada.

---

## 2. Nome de classe trocado no contador de consultas do médico
- **Onde está:**
  - Script no final do HTML: [medico_consultas.html](file:///C:/Users/1362519135/MedTriage-html/medico_consultas.html#L167-L170) (Linhas 167 a 170)
  - Onde o card é criado no JS: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1515) (Linha 1515)
- **Qual é o problema:**
  - O contador em `medico_consultas.html` procura por `.consulta-item-card`, mas o `main.js` cria os cards com o nome `.consulta-medico-card`.

---

## 3. Dá para agendar consulta em horário que já passou hoje
- **Onde está:**
  - Agendar consulta: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1097-L1142) (Linhas 1097 a 1142)
  - Reagendar consulta: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L645-L690) (Linhas 645 a 690)
- **Qual é o problema:**
  - Quando o paciente escolhe o dia **"Hoje"**, o sistema libera horários como `08:00` ou `09:00` mesmo se já forem `18:00` da noite (esse é o item 1 pedido no [README.md](file:///C:/Users/1362519135/MedTriage-html/README.md#L5-L7)).

---

## 4. Histórico do paciente busca pelo Nome em vez do CPF
- **Onde está:**
  - [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L915-L921) (Linhas 915 a 921)
  - [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1467) (Linha 1467)
- **Qual é o problema:**
  - Para mostrar o histórico de consultas de um paciente, o código compara o **nome** (`c.pacienteNome === info.nome`) em vez do **CPF** (`c.pacienteId === info.cpf`). Se duas pessoas tiverem o mesmo nome ou se o paciente corrigir o nome em "Meus Dados", o histórico mistura ou some.
