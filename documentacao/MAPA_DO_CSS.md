# Guia Rápido do CSS — Onde mexer em cada tela?

## Como funciona agora? (Resumo em 3 pontos)

1. Antes, todo o visual do site ficava misturado num arquivo gigante (`css/style.css` com mais de 2.000 linhas).
2. Agora dividimos esse arquivo em **4 pastinhas** dentro de `css/`, sem mudar **nenhuma** linha de código.
3. **Não precisa mudar nada nos arquivos `.html`!** O [css/style.css](file:///C:/Users/1362519135/MedTriage-html/css/style.css) continua existindo e puxa todos os outros automaticamente.

---

## 1. "Quero mexer numa tela específica, qual CSS eu abro?"

Procure a tela `.html` abaixo e abra o arquivo CSS correspondente na pasta `css/pages/`:

### Telas de Login e Cadastro
- **Telas:** `index.html`, `cadastro.html`, `cadastro_medico.html`, `recuperar_senha.html`
- **Onde mexer:** [css/pages/auth.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/auth.css)

### Telas do Paciente
- **Painel inicial (`paciente_dashboard.html`):** [css/pages/paciente-dashboard.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/paciente-dashboard.css)
- **Meus Dados (`meus_dados.html`):** [css/pages/meus-dados.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/meus-dados.css)
- **Buscar Especialista (`buscar_especialista.html`):** [css/pages/busca-especialistas.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/busca-especialistas.css)
- **Perfil do Médico (`perfil_medico.html`):** [css/pages/perfil-medico.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/perfil-medico.css)

### Telas de Agendar, Reagendar e Cancelar Consulta
- **Telas:** `agendar_etapa1.html`, `agendar_etapa2.html`, `agendar_etapa3.html`, `agendamento_sucesso.html`, `detalhes_consulta.html`, `reagendar_consulta.html`, `cancelar_consulta.html`
- **Onde mexer:** [css/pages/agendamento.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/agendamento.css)

### Telas do Médico e Laudos
- **Painel do Médico, Consultas e Perfil (`medico_dashboard.html`, `medico_consultas.html`, `medico_perfil.html`):** [css/pages/medico-dashboard.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/medico-dashboard.css)
- **Atendimento, Laudos e Histórico (`atendimento.html`, `laudos.html`, `medico_historico.html`, `medico_historico_atendimentos.html`):** [css/pages/atendimento-laudos.css](file:///C:/Users/1362519135/MedTriage-html/css/pages/atendimento-laudos.css)

---

## 2. "Quero mexer em algo que aparece no site todo"

### Cores do site e Tema Verde do Médico (`css/base/`)
- **Mudar cores principais ou tema do médico:** [css/base/variables.css](file:///C:/Users/1362519135/MedTriage-html/css/base/variables.css)
- **Fonte padrão e margens zeradas do navegador:** [css/base/reset.css](file:///C:/Users/1362519135/MedTriage-html/css/base/reset.css)

### Peças repetidas em várias telas (`css/components/`)
- **Botões azuis/verdes, botão de borda e botão vermelho:** [css/components/buttons.css](file:///C:/Users/1362519135/MedTriage-html/css/components/buttons.css)
- **Barra do topo (Logo, Menu e botão Sair):** [css/components/header.css](file:///C:/Users/1362519135/MedTriage-html/css/components/header.css)
- **Bolinhas das etapas 1, 2 e 3 do agendamento:** [css/components/stepper.css](file:///C:/Users/1362519135/MedTriage-html/css/components/stepper.css)

### Ajustes para Celular e Tablet (`css/responsive/`)
- **Quando a tela fica pequena no celular/tablet:** [css/responsive/media-queries.css](file:///C:/Users/1362519135/MedTriage-html/css/responsive/media-queries.css)

---

## 3. Desenho das Pastas

```text
css/
├── style.css                     <-- Arquivo principal (só puxa os outros abaixo)
│
├── base/                         <-- Cores e configurações gerais
│   ├── variables.css             (Cores azul/verde e fontes)
│   └── reset.css                 (Zera margens do navegador)
│
├── components/                   <-- Peças usadas em várias páginas
│   ├── buttons.css               (Todos os botões .btn)
│   ├── header.css                (Menu do topo)
│   └── stepper.css               (Passos 1 -> 2 -> 3 do agendamento)
│
├── pages/                        <-- Visual de cada tela
│   ├── auth.css                  (Login, Cadastro e Senha)
│   ├── paciente-dashboard.css    (Início do Paciente)
│   ├── meus-dados.css            (Meus Dados)
│   ├── busca-especialistas.css   (Busca de Médicos)
│   ├── perfil-medico.css         (Perfil Público do Médico)
│   ├── agendamento.css           (Agendar, Detalhes, Reagendar e Cancelar)
│   ├── atendimento-laudos.css    (Tela de Atendimento, Laudos e Histórico)
│   └── medico-dashboard.css      (Painel do Médico, Filtros e Tabela)
│
└── responsive/                   <-- Adaptação para celular e tablet
    └── media-queries.css
```

---

## 4. Onde estão anotados os erros que encontramos?

Separamos uma subpasta para cada tipo de problema encontrado no projeto (para corrigirmos depois):

1. **Problemas no CSS:** [erros-css/ERROS_CSS.md](file:///C:/Users/1362519135/MedTriage-html/documentacao/erros-css/ERROS_CSS.md)
2. **Problemas nos HTMLs (links quebrados, etc.):** [erros-html/ERROS_HTML.md](file:///C:/Users/1362519135/MedTriage-html/documentacao/erros-html/ERROS_HTML.md)
3. **Problemas no JavaScript:** [erros-js/ERROS_JS.md](file:///C:/Users/1362519135/MedTriage-html/documentacao/erros-js/ERROS_JS.md)
4. **Cuidados com Dados de Pacientes (LGPD):** [erros-privacidade-lgpd/ERROS_PRIVACIDADE_LGPD.md](file:///C:/Users/1362519135/MedTriage-html/documentacao/erros-privacidade-lgpd/ERROS_PRIVACIDADE_LGPD.md)
