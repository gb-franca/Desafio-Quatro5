/**
 * @file seed.ts
 * @description Script de semente (seeding) para popular a base de dados SQLite com dados fictícios.
 *              Limpa as tabelas existentes e insere exatamente 10 usuários (membros da equipe)
 *              e 14 tarefas distribuídas para demonstrar perfeitamente as dores do Ricardo.
 * @version 1.1.0
 * @date 2026-06-14
 */

import { prisma } from '../src/prisma';
import 'dotenv/config';

async function main() {
    // Limpeza prévia do banco para evitar duplicidade ou conflitos
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    console.log('🌱 Semeando dados fictícios para 10 membros da equipe...');

    // 1. Criação de exatamente 10 membros da equipe (Conforme escopo do Ricardo)
    const ricardo = await prisma.user.create({
        data: { name: 'Ricardo Silva', role: 'Tech Lead', initials: 'RS' },
    });
    const ana = await prisma.user.create({
        data: { name: 'Ana Bragança', role: 'Designer UI/UX', initials: 'AB' },
    });
    const joao = await prisma.user.create({
        data: { name: 'João Duarte', role: 'Dev Backend', initials: 'JD' },
    });
    const lucas = await prisma.user.create({
        data: { name: 'Lucas Santos', role: 'Dev Frontend', initials: 'LS' },
    });
    const mariana = await prisma.user.create({
        data: { name: 'Mariana Lima', role: 'Dev Frontend', initials: 'ML' },
    });
    const carlos = await prisma.user.create({
        data: { name: 'Carlos Souza', role: 'QA Engineer', initials: 'CS' },
    });
    const beatriz = await prisma.user.create({
        data: { name: 'Beatriz Costa', role: 'Product Owner', initials: 'BC' },
    });
    const thiago = await prisma.user.create({
        data: { name: 'Thiago Alves', role: 'DevOps Engineer', initials: 'TA' },
    });
    const juliana = await prisma.user.create({
        data: { name: 'Juliana Rocha', role: 'Copywriter', initials: 'JR' },
    });
    const gabriel = await prisma.user.create({
        data: { name: 'Gabriel Ferreira', role: 'Marketing Specialist', initials: 'GF' },
    });

    // Configuração de datas de vencimento relativas para teste
    const today = new Date();
    
    const threeDaysAgo = new Date(today); threeDaysAgo.setDate(today.getDate() - 3);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    const inTwoWeeks = new Date(today); inTwoWeeks.setDate(today.getDate() + 14);

    // 2. Criação de tarefas distribuídas
    // Algumas pessoas estarão afogadas (Lucas Santos com 3 em DOING, João com 3 em DOING)
    // Algumas estarão ociosas (Juliana, Beatriz, Thiago com 0 em DOING)
    // Algumas tarefas estarão atrasadas para alertar o Ricardo antes de estourar mais
    await prisma.task.createMany({
        data: [
            // --- BACKLOG ---
            { title: 'Refatorar módulo de autenticação JWT', area: 'BACKEND', status: 'BACKLOG', dueDate: nextWeek, assigneeId: joao.id },
            { title: 'Desenhar novas telas do fluxo de checkout', area: 'DESIGN', status: 'BACKLOG', dueDate: inTwoWeeks, assigneeId: ana.id },
            { title: 'Planejamento de SEO para o novo blog', area: 'MARKETING', status: 'BACKLOG', dueDate: nextWeek, assigneeId: gabriel.id },
            { title: 'Escrever posts para lançamento em redes sociais', area: 'MARKETING', status: 'BACKLOG', dueDate: tomorrow, assigneeId: juliana.id },

            // --- DOING (Em Andamento) ---
            // Lucas Santos - Afogado (3 em DOING)
            { title: 'Corrigir bug de renderização no carrinho', area: 'FRONTEND', status: 'DOING', dueDate: yesterday, assigneeId: lucas.id }, // ATRASADA
            { title: 'Integrar API de pagamento com Stripe', area: 'FRONTEND', status: 'DOING', dueDate: tomorrow, assigneeId: lucas.id },  // RISCO
            { title: 'Otimizar performance de imagens da Home', area: 'FRONTEND', status: 'DOING', dueDate: nextWeek, assigneeId: lucas.id },

            // João Duarte - Afogado (3 em DOING)
            { title: 'Criar consultas otimizadas para relatório de vendas', area: 'BACKEND', status: 'DOING', dueDate: threeDaysAgo, assigneeId: joao.id }, // ATRASADA
            { title: 'Webhooks de atualização de pagamento', area: 'BACKEND', status: 'DOING', dueDate: today, assigneeId: joao.id }, // RISCO
            { title: 'Modelagem de dados do histórico de pedidos', area: 'BACKEND', status: 'DOING', dueDate: nextWeek, assigneeId: joao.id },

            // Outros em andamento
            { title: 'Revisar escopo técnico com time comercial', area: 'MARKETING', status: 'DOING', dueDate: nextWeek, assigneeId: ricardo.id },
            { title: 'Campanha de tráfego pago no Google Ads', area: 'MARKETING', status: 'DOING', dueDate: tomorrow, assigneeId: gabriel.id }, // RISCO

            // --- REVIEW (Revisão) ---
            { title: 'Testes de integração ponta a ponta na API', area: 'QA', status: 'REVIEW', dueDate: yesterday, assigneeId: carlos.id }, // ATRASADA
            { title: 'Validar copy da landing page principal', area: 'MARKETING', status: 'REVIEW', dueDate: tomorrow, assigneeId: beatriz.id },

            // --- DONE (Concluído) ---
            { title: 'Definir paleta de cores e guia de estilos', area: 'DESIGN', status: 'DONE', dueDate: twoDaysAgo, assigneeId: ana.id },
            { title: 'Configurar servidor VPS na AWS Lighthouse', area: 'BACKEND', status: 'DONE', dueDate: yesterday, assigneeId: thiago.id },
        ],
    });

    console.log('✅ Banco de dados populado com 10 membros e 14 tarefas distribuídas!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
