/**
 * @file Kanban.tsx
 * @description Página que renderiza o Quadro Kanban de atividades.
 *              Sincroniza os dados iniciais do servidor e lida com estados de erro e loading.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação da visualização do quadro Kanban com tratamento de estados.
 */

import React, { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { KanbanBoard } from '../components/KanbanBoard';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Kanban: React.FC = () => {
  const { fetchTasks, fetchUsers, isLoading, error } = useTaskStore();

  // Efeito de montagem da página: efetua a busca inicial por tarefas e equipe na API
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  // Função para forçar a atualização manual dos dados do quadro
  const handleRefresh = () => {
    fetchTasks();
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Quadro de Atividades</h1>
          <p className="text-xs text-zinc-500 mt-1">Arraste e solte as tarefas para alterar o status em tempo real.</p>
        </div>
        {/* Botão para recarregar o quadro */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-columnBg hover:bg-brand-cardHover text-xs font-semibold text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Caixa de alerta em caso de erros de conexão com a API */}
      {error && (
        <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/50 rounded-xl p-4 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Exibe o indicador de carregamento (Spinner) ou renderiza o quadro Kanban propriamente dito */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-yellow" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Carregando quadro...</p>
        </div>
      ) : (
        <KanbanBoard />
      )}
    </div>
  );
};

export default Kanban;
