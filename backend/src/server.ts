/**
 * @file server.ts
 * @description Servidor de API REST desenvolvido em Express.js.
 *              Provê endpoints HTTP para gerenciar o quadro de tarefas e a equipe de desenvolvimento.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação inicial dos endpoints (GET, POST, PATCH, DELETE) para tarefas e usuários.
 */

import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

const app = express();

// Configurações Globais de Middleware
app.use(cors());          // Habilita CORS para permitir conexões do frontend (ex: localhost:5173)
app.use(express.json());  // Permite o parser de requisições com corpo formatado em JSON

/**
 * GET /tasks
 * @description Lista todas as tarefas cadastradas, incluindo os dados completos do responsável associado,
 *              ordenadas de forma ascendente pela data limite de entrega (dueDate).
 */
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                assignee: true, // Inclui relacionamento com a tabela User
            },
            orderBy: {
                dueDate: 'asc', // Ordena das tarefas mais urgentes às mais distantes
            }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
});

/**
 * GET /users
 * @description Lista todos os usuários cadastrados (membros da equipe), ordenados alfabeticamente pelo nome.
 */
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                name: 'asc', // Ordenação alfabética
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

/**
 * POST /users
 * @description Cadastra um novo membro da equipe na base de dados.
 * @body { name: string, role: string, initials: string }
 */
app.post('/users', async (req, res) => {
    try {
        const { name, role, initials } = req.body;
        // Validação básica de campos obrigatórios
        if (!name || !role || !initials) {
            res.status(400).json({ error: 'Campos obrigatórios ausentes: name, role ou initials.' });
            return;
        }
        const user = await prisma.user.create({
            data: { name, role, initials },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar o usuário' });
    }
});

/**
 * DELETE /users/:id
 * @description Exclui um usuário da equipe. Antes de excluí-lo, desassocia o usuário 
 *              de todas as tarefas que estavam sob sua responsabilidade (atribui nulo).
 */
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Desassocia o usuário de qualquer tarefa ativa para evitar quebras de chave estrangeira
        await prisma.task.updateMany({
            where: { assigneeId: id },
            data: { assigneeId: null },
        });

        // Efetua a exclusão do registro do usuário
        await prisma.user.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir o usuário' });
    }
});

/**
 * POST /tasks
 * @description Cria uma nova atividade no quadro Kanban.
 * @body { title: string, area: string, dueDate: string, assigneeId: string | null }
 */
app.post('/tasks', async (req, res) => {
    try {
        const { title, area, dueDate, assigneeId } = req.body;

        // Validação básica dos parâmetros essenciais da tarefa
        if (!title || !area || !dueDate) {
            res.status(400).json({ error: 'Campos obrigatórios ausentes: title, area ou dueDate.' });
            return;
        }

        const task = await prisma.task.create({
            data: {
                title,
                area,
                dueDate: new Date(dueDate),
                assigneeId: assigneeId || null,
            },
            include: {
                assignee: true, // Retorna a tarefa com o respectivo responsável populado
            },
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar atividade' });
    }
});

/**
 * PATCH /tasks/:id/status
 * @description Atualiza a coluna/status de uma tarefa (fluxo Kanban).
 * @body { status: string } ex: "BACKLOG", "DOING", "REVIEW", "DONE"
 */
app.patch('/tasks/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: 'Campo obrigatório ausente: status.' });
            return;
        }

        const task = await prisma.task.update({
            where: { id },
            data: { status },
            include: {
                assignee: true,
            },
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o status da atividade' });
    }
});

/**
 * DELETE /tasks/:id
 * @description Exclui uma tarefa permanentemente.
 */
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir a atividade' });
    }
});

// Inicialização da escuta do servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
