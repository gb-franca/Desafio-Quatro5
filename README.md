# TaskFlow 🚀 - Gestão de Atividades de um Time (Desafio Quatro5)

O **TaskFlow** é uma ferramenta de gestão visual e métricas de desempenho desenhada sob medida para o Ricardo, dono de uma empresa com um time de 10 pessoas. O sistema substitui o controle informal (planilhas, papel, WhatsApp) por um fluxo centralizado de trabalho, alertas automáticos contra sobrecarga de colaboradores e indicadores de prazos e eficiência prontos para a tomada de decisões na reunião de segunda-feira.

---

## 📂 Estrutura do Projeto

O projeto é estruturado de forma limpa e modular em duas partes principais (Frontend e Backend), utilizando **TypeScript** de ponta a ponta:

```text
desafio-quatro5/
├── README.md               # Documentação principal do projeto
├── backend/                # Servidor API REST e Banco de Dados (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Definição do banco SQLite
│   │   └── seed.ts         # Script de carga inicial de teste (10 membros, 14 tarefas)
│   ├── src/
│   │   ├── prisma.ts       # Inicialização do Prisma Client
│   │   └── server.ts       # Endpoints HTTP da API REST (Express)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/               # Interface de usuário SPA (Vite + React + Zustand)
    ├── src/
    │   ├── components/     # Componentes reutilizáveis de interface (Kanban, Dashboard, Modais)
    │   ├── pages/          # Páginas principais (Dashboard e Quadro Kanban)
    │   ├── store/          # Zustand store com tipagem estrita para gerenciamento de estado
    │   ├── App.tsx         # Configuração de rotas (React Router v7)
    │   ├── index.css       # Estilização global e customizações
    │   └── main.tsx        # Ponto de entrada React
    ├── package.json
    └── tailwind.config.js
```

---

## 🛠️ Como Rodar o Projeto (Passo a Passo)

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [npm](https://www.npmjs.com/)

---

### 1. Configurando o Backend (Servidor e Banco de Dados)

1. Abra um terminal na pasta do projeto e navegue para o backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute as migrações e popule o banco SQLite com a semente de dados de exemplo (isso criará automaticamente a equipe de 10 membros e as 14 tarefas distribuídas):
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O backend rodará na porta **3333** (http://localhost:3333).*

---

### 2. Configurando o Frontend (Interface)

1. Abra um segundo terminal e navegue para a subpasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor do frontend:
   ```bash
   npm run dev
   ```
   *O frontend rodará na porta padrão do Vite (geralmente em http://localhost:5173).*
4. Abra o endereço no navegador. O sistema exibirá o quadro Kanban e o Dashboard preenchidos com os dados da equipe fictícia do Ricardo.

---

## 🌐 Deploy em Produção (Vercel & Cloud)

A aplicação foi estruturada de forma desacoplada para permitir deploys fáceis na nuvem:

1.  **Frontend (Vercel):**
    *   Defina a pasta raiz como `frontend`.
    *   Configure a variável de ambiente **`VITE_API_URL`** apontando para a URL pública do seu backend (ex: `https://meu-backend.onrender.com`).
2.  **Backend (Render / Railway):**
    *   Hospede a API em plataformas que aceitam bancos de dados SQLite persistentes (adicionando um Volume de Disco).
    *   *Alternativa Serverless (Vercel):* Para rodar o backend na Vercel, altere o provedor do banco de dados no Prisma (`schema.prisma`) para `"postgresql"`, crie um banco Postgres gratuito (como no [Neon.tech](https://neon.tech/)) e configure a variável `DATABASE_URL`.

---

## 🧠 Metodologia Adotada e Justificativa

Em vez de criar uma metodologia de gestão do zero, combinamos princípios do **Kanban (Gestão Visual)** com o **WIP Limit (Limite de Trabalho em Andamento)** e **Métricas de Ciclo de Entrega (Lean/Agile)**.

*   **Centralização com Kanban:** O trabalho do Ricardo vivia espalhado. O quadro Kanban segmentado em 4 status (`Backlog`, `Em Andamento`, `Revisão` e `Concluído`) fornece uma fonte única da verdade sobre o status de cada tarefa.
*   **Balanceamento e WIP:** Para resolver o problema de sobrecarga/ociosidade, a interface calcula e exibe em tempo real o indicador de alocação de cada colaborador, recomendando quem está disponível e sinalizando gargalos antes que gerem insatisfação na equipe.
*   **Decisões baseadas em Dados:** Substituímos o achismo nas reuniões de segunda-feira por um dashboard unificado focado em métricas históricas de entrega (ciclo médio de dias e taxa de pontualidade da última semana).

---

## 📊 Justificativa dos Indicadores (KPIs) e Decisões Práticas

Nenhum indicador na tela é apenas informativo; cada um deles impulsiona uma decisão direta para o Ricardo:

### 1. Carga de Trabalho por Membro (Tarefas em Execução)
*   **Justificativa:** Quantidade de tarefas ativas no status `Em Andamento` atribuídas a cada profissional.
*   **Decisão que gera:** Ricardo vê quem está com status **"Gargalos"** (3+ tarefas simultâneas, em vermelho) e decide **bloquear a atribuição de novas tarefas** a essa pessoa, enquanto reatribui demandas pendentes para os profissionais sinalizados como **"Disponíveis"** (0 tarefas, em verde), balanceando o fluxo de forma justa.

### 2. Termômetro de Prazos (Atrasadas, Em Risco, No Prazo)
*   **Justificativa:** Proporção percentual e contagem de tarefas pendentes que estão atrasadas, vencem hoje/amanhã (em risco) ou têm prazo confortável (no prazo).
*   **Decisão que gera:** Ao notar que o percentual de tarefas **"Em Risco"** aumentou, Ricardo decide focar o esforço do time apenas nesses itens no dia para **evitar quebras de contrato** com os clientes finais.

### 3. Ciclo Médio de Entrega (Lead Time da Semana)
*   **Justificativa:** O tempo médio (em dias) que as tarefas concluídas nos últimos 7 dias levaram desde a data de criação até a entrega final.
*   **Decisão que gera:** Se o ciclo médio atual do time é de 4 dias, Ricardo toma a decisão de **não aceitar prazos de entrega comerciais com menos de 4 dias** junto aos clientes, garantindo prazos factíveis e preservando a qualidade.

### 4. Taxa de Pontualidade na Semana (%)
*   **Justificativa:** Percentual de tarefas concluídas nos últimos 7 dias que foram finalizadas dentro ou antes da data limite de entrega original.
*   **Decisão que gera:** Na reunião de segunda-feira, se a pontualidade semanal estiver abaixo de 80%, Ricardo decide **dedicar a reunião a revisar estimativas de complexidade** ou resolver bloqueios técnicos de infraestrutura que estão atrasando o time.

---

## ✂️ Cortes de Escopo & Próximos Passos (Mais Tempo)

### O que foi cortado para caber no prazo de 48h:
1.  **Autenticação JWT e Permissões:** O sistema funciona como um painel administrativo direto e público.
2.  **Múltiplos Times:** O escopo foca exclusivamente na realidade de uma PME com um time de 10 pessoas.
3.  **Logs de Histórico e Auditoria:** Não gravamos qual usuário mudou a coluna do card ou quem editou os prazos.

### O que faríamos com mais tempo:
1.  **Alertas Ativos via Slack/WhatsApp/E-mail:** Disparo de notificações automatizadas de urgência para o Ricardo e para o responsável 24 horas antes do vencimento do prazo.
2.  **Quadro de OKRs integrado:** Conectar as tarefas do Kanban a objetivos macro anuais da PME do Ricardo.
3.  **Sprints Semanais com Gráfico de Velocity:** Organizar tarefas por ciclos semanais (sprints) para dar um norte ainda mais preciso à reunião de segunda-feira.
