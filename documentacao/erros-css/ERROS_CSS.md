# Problemas Encontrados no CSS

> **Atenção:** Nenhum código foi alterado ainda. Esta lista serve para a equipe saber exatamente o que precisa de ajuste no visual e onde encontrar cada item.

---

## 1. O arquivo `termos-medtriage.css` está "esquecido"
- **Onde está:** [css/termos-medtriage.css](file:///C:/Users/1362519135/MedTriage-html/css/termos-medtriage.css)
- **Qual é o problema:**
  - Esse arquivo CSS está pronto na pasta `css/`, mas nenhuma tela `.html` chama ele.
  - Em vez de usar esse arquivo, o JavaScript ([js/termos-medtriage.js](file:///C:/Users/1362519135/MedTriage-html/js/termos-medtriage.js#L310-L465), linhas 310 a 465) cria outro estilo por cima com a cor azul fixa (`#005A8D`).
  - **Resultado:** Na tela de cadastro do médico ([cadastro_medico.html](file:///C:/Users/1362519135/MedTriage-html/cadastro_medico.html)), que é toda verde, a janela dos Termos de Uso aparece azul.

---

## 2. Cards da tela "Ver consultas" do médico estão sem CSS
- **Onde está:**
  - Tela: [medico_consultas.html](file:///C:/Users/1362519135/MedTriage-html/medico_consultas.html#L10) (linha 10)
  - Onde o card é criado: [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L1515-L1532) (linhas 1515 a 1532)
- **Qual é o problema:**
  - O JavaScript cria os cards das consultas usando as classes `.consulta-medico-card`, `.consulta-medico-info`, `.consulta-medico-actions` e `.badge`, mas **essas classes não existem no CSS**.
  - Na linha 10 do `medico_consultas.html` sobrou um `</style>` perdido — sinal de que o CSS dessa tela ficava ali dentro e acabou sendo apagado sem querer.

---

## 3. Caixa de "Valores" no Perfil do Médico está com nome diferente do CSS
- **Onde está:**
  - Tela: [perfil_medico.html](file:///C:/Users/1362519135/MedTriage-html/perfil_medico.html#L71-L80) (linhas 71 a 80)
  - CSS dessa tela: [css/pages/perfil-medico.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/perfil-medico.css#L107-L156)
- **Qual é o problema:**
  - No HTML foi escrito `valores-grid`, `valor-box`, `valor-label` e `valor-preco`.
  - Mas no CSS foi escrito com outros nomes (`servicos-lista`, `servico-item`, `preco-destaque-box`). Por isso, os preços aparecem sem caixinha e sem formatação.

---

## 4. Link "Ver histórico" na tabela do médico está sem estilo
- **Onde está:** [js/main.js](file:///C:/Users/1362519135/MedTriage-html/js/main.js#L939) (linha 939)
- **Qual é o problema:**
  - Na busca de pacientes do médico, o link "Ver histórico" usa a classe `action-link`, mas essa classe não foi criada no CSS.

---

## 5. Estilo repetido direto dentro de 2 arquivos HTML
- **Onde está:**
  - [medico_dashboard.html](file:///C:/Users/1362519135/MedTriage-html/medico_dashboard.html#L12-L40) (linhas 12 a 40)
  - [medico_historico_atendimentos.html](file:///C:/Users/1362519135/MedTriage-html/medico_historico_atendimentos.html#L9-L33) (linhas 9 a 33)
- **Qual é o problema:**
  - Esses dois HTMLs têm uma tag `<style>` lá no topo fazendo a mesma coisa (ajustar o ícone da lupa dentro do campo de busca). Esse código pode ir para a pasta `css/` para não ficar espalhado.
