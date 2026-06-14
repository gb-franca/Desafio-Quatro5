/**
 * @file prisma.ts
 * @description Configuração e exportação da instância do cliente Prisma.
 *              Utiliza o adaptador better-sqlite3 para conexão de alto desempenho com o banco SQLite.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Inicialização da conexão utilizando adapter SQLite.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Define o caminho absoluto para o arquivo de banco de dados SQLite
const dbPath = path.resolve(__dirname, '../dev.db');

// Instancia o adaptador para sqlite3 otimizado
const adapter = new PrismaBetterSqlite3({ url: dbPath });

// Exporta o cliente Prisma configurado com o adaptador para uso global no backend
export const prisma = new PrismaClient({ adapter });
