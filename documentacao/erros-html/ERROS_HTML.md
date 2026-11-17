# Problemas Encontrados nos Arquivos HTML

> **Atenção:** Nenhum código foi alterado ainda. Aqui estão os erros simples de HTML (links que não levam para lugar nenhum, tags sobrando e botões sem classe).

---

## 1. Tag `</style>` solta no topo da página
- **Onde está:** [medico_consultas.html](file:///C:/Users/1362519135/MedTriage-html/medico_consultas.html#L10) (Linha 10)
- **Qual é o problema:** Tem um `</style>` fechando sozinho sem ter um `<style>` abrindo antes.

---

## 2. Links do menu que não funcionam (`href="#"`)

Em várias páginas, alguns botões do menu lá em cima estão com `href="#"` (quando clica, não muda de página):

### A) No menu do Paciente: "Histórico de laudos" está com `href="#"` (deveria ser `laudos.html`)
- [meus_dados.html](file:///C:/Users/1362519135/MedTriage-html/meus_dados.html#L24) (Linha 24)
- [buscar_especialista.html](file:///C:/Users/1362519135/MedTriage-html/buscar_especialista.html#L24) (Linha 24)
- [perfil_medico.html](file:///C:/Users/1362519135/MedTriage-html/perfil_medico.html#L23) (Linha 23)
- [agendar_etapa1.html](file:///C:/Users/1362519135/MedTriage-html/agendar_etapa1.html#L24) (Linha 24)
- [agendar_etapa2.html](file:///C:/Users/1362519135/MedTriage-html/agendar_etapa2.html#L24) (Linha 24)
- [agendar_etapa3.html](file:///C:/Users/1362519135/MedTriage-html/agendar_etapa3.html#L24) (Linha 24)
- [detalhes_consulta.html](file:///C:/Users/1362519135/MedTriage-html/detalhes_consulta.html#L23) (Linha 23)
- [reagendar_consulta.html](file:///C:/Users/1362519135/MedTriage-html/reagendar_consulta.html#L23) (Linha 23)
- [cancelar_consulta.html](file:///C:/Users/1362519135/MedTriage-html/cancelar_consulta.html#L23) (Linha 23)

### B) No menu do Médico: "Ver consultas" e "Histórico de atendimentos" estão com `href="#"`
- [atendimento.html](file:///C:/Users/1362519135/MedTriage-html/atendimento.html#L22-L23) (Linhas 22 e 23 — deveriam ir para `medico_consultas.html` e `medico_historico_atendimentos.html`)
- [medico_historico.html](file:///C:/Users/1362519135/MedTriage-html/medico_historico.html#L22-L23) (Linhas 22 e 23 — deveriam ir para `medico_consultas.html` e `medico_historico_atendimentos.html`)

---

## 3. Botão "Sair" (`#btn-logout`) está sem a classe `btn`
- **Qual é o problema:**
  - Para um botão ficar com cantos arredondados e mãozinha do mouse (`cursor: pointer`), ele precisa ter `class="btn btn-outline"`.
  - Só o [medico_dashboard.html](file:///C:/Users/1362519135/MedTriage-html/medico_dashboard.html#L101) está certo. Em todas as outras **16 telas** abaixo, escreveram apenas `class="btn-outline"` (faltou o `btn`):
    - [paciente_dashboard.html](file:///C:/Users/1362519135/MedTriage-html/paciente_dashboard.html#L27) (Linha 27)
    - [meus_dados.html](file:///C:/Users/1362519135/MedTriage-html/meus_dados.html#L29) (Linha 29)
    - [buscar_especialista.html](file:///C:/Users/1362519135/MedTriage-html/buscar_especialista.html#L29) (Linha 29)
    - [perfil_medico.html](file:///C:/Users/1362519135/MedTriage-html/perfil_medico.html#L27) (Linha 27)
    - [agendar_etapa1.html](file:///C:/Users/1362519135/MedTriage-html/agendar_etapa1.html#L29) (Linha 29)
    - [agendar_etapa2.html](file:///C:/Users/1362519135/MedTriage-html/agendar_etapa2.html#L29) (Linha 29)
    - [agendar_etapa3.html](file:///C:/Users/1362519135/MedTriage-html/agendar_etapa3.html#L29) (Linha 29)
    - [detalhes_consulta.html](file:///C:/Users/1362519135/MedTriage-html/detalhes_consulta.html#L27) (Linha 27)
    - [reagendar_consulta.html](file:///C:/Users/1362519135/MedTriage-html/reagendar_consulta.html#L27) (Linha 27)
    - [cancelar_consulta.html](file:///C:/Users/1362519135/MedTriage-html/cancelar_consulta.html#L27) (Linha 27)
    - [laudos.html](file:///C:/Users/1362519135/MedTriage-html/laudos.html#L27) (Linha 27)
    - [atendimento.html](file:///C:/Users/1362519135/MedTriage-html/atendimento.html#L28) (Linha 28)
    - [medico_consultas.html](file:///C:/Users/1362519135/MedTriage-html/medico_consultas.html#L36) (Linha 36)
    - [medico_historico.html](file:///C:/Users/1362519135/MedTriage-html/medico_historico.html#L28) (Linha 28)
    - [medico_historico_atendimentos.html](file:///C:/Users/1362519135/MedTriage-html/medico_historico_atendimentos.html#L54) (Linha 54)
    - [medico_perfil.html](file:///C:/Users/1362519135/MedTriage-html/medico_perfil.html#L28) (Linha 28)

---

## 4. Texto `[TELEFONE]` esquecido na tela de Login
- **Onde está:** [index.html](file:///C:/Users/1362519135/MedTriage-html/index.html#L92-L94) (Linhas 92 a 94)
- **Qual é o problema:** No rodapé do login ainda está escrito `Precisa de ajuda? Ligue [TELEFONE]`.
