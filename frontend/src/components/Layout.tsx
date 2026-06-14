/**
 * @file Layout.tsx
 * @description Componente de layout estrutural da aplicação.
 *              Envolve as páginas com a barra lateral comum (Sidebar), define a área do conteúdo
 *              principal (Outlet) e monta o gerenciador de notificações flutuantes (Toaster).
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação do layout global da aplicação.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NewTaskModal } from './NewTaskModal';
import { Toaster } from 'sonner';

export const Layout: React.FC = () => {
  // Controle de estado para abertura/fechamento do modal de nova atividade
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-950 text-gray-100">
      {/* Exibição e gerenciador de notificações (Toast) com tema escuro */}
      <Toaster theme="dark" position="top-right" richColors />

      {/* Barra lateral fixa (Sidebar), recebe a função para abrir o modal de atividades */}
      <Sidebar onOpenNewTask={() => setIsModalOpen(true)} />

      {/* Conteúdo dinâmico da rota atual carregado à direita da Sidebar */}
      <main className="ml-64 flex-grow p-8 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Modal para preenchimento de formulário de nova tarefa */}
      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
