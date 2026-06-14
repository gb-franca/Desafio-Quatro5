/**
 * @file Sidebar.tsx
 * @description Barra lateral de navegação fixa.
 *              Contém os links de navegação principais (Dashboard e Quadro Kanban),
 *              o botão para abertura do modal de cadastro de novas atividades e créditos.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação da barra lateral de navegação e atalhos de rotas.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Kanban, Layers, Plus } from 'lucide-react';

interface SidebarProps {
  onOpenNewTask: () => void; // Função de callback disparada ao clicar no botão "Nova Atividade"
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewTask }) => {
  return (
    <aside className="w-64 h-screen bg-brand-columnBg border-r border-brand-border flex flex-col fixed left-0 top-0 text-gray-300">
      {/* Cabeçalho da Marca (Logo & Nome) */}
      <div className="p-6 border-b border-brand-border flex items-center gap-3">
        <div className="bg-brand-yellow/10 p-2 rounded-lg border border-brand-yellow/20">
          <Layers className="w-5 h-5 text-brand-yellow" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">TaskFlow</span>
      </div>

      {/* Botão de Ação rápida para criar novas tarefas */}
      <div className="px-4 py-4 border-b border-brand-border/40">
        <button
          onClick={onOpenNewTask}
          className="w-full flex items-center justify-center gap-2 bg-brand-yellow hover:bg-amber-600 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Links de navegação utilizando NavLink do react-router-dom para estilização dinâmica ativa */}
      <nav className="flex-grow p-4 space-y-1.5">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-brand-yellow/10 text-brand-yellow border-l-4 border-brand-yellow pl-3'
                : 'hover:bg-brand-cardBg hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/quadro"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-brand-yellow/10 text-brand-yellow border-l-4 border-brand-yellow pl-3'
                : 'hover:bg-brand-cardBg hover:text-white'
            }`
          }
        >
          <Kanban className="w-5 h-5" />
          <span>Quadro</span>
        </NavLink>
      </nav>

      {/* Créditos de Equipe no rodapé */}
      <div className="p-4 border-t border-brand-border text-center text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
        Equipe do Ricardo
      </div>
    </aside>
  );
};
