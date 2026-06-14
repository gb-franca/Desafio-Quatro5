/**
 * @file Dashboard.tsx
 * @description Página de visualização do Dashboard.
 *              Dispara o carregamento inicial dos dados de tarefas e usuários da equipe
 *              e renderiza os indicadores chave de desempenho (KPIs) de prazos e trabalho.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação da página do Dashboard com sincronização da API.
 */

import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Dashboard as DashboardKPIs } from '../components/Dashboard';
import { RefreshCw, Users } from 'lucide-react';
import { TeamManagerModal } from '../components/TeamManagerModal';

const Dashboard: React.FC = () => {
  const { fetchTasks, fetchUsers, isLoading } = useTaskStore();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Efeito de montagem da tela para buscar tarefas e usuários nas APIs correspondentes
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  // Função para atualização manual de dados sob demanda
  const handleRefresh = () => {
    fetchTasks();
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard de Métricas</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Acompanhe a carga de trabalho e o status de entrega da equipe.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botão para gerenciar os membros da equipe */}
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-columnBg hover:bg-brand-cardHover text-xs font-semibold text-brand-yellow transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gerenciar Equipe</span>
          </button>

          {/* Botão de atualização manual com animação de giro (spin) durante o carregamento */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-columnBg hover:bg-brand-cardHover text-xs font-semibold text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Renderiza o componente interno do Dashboard com os gráficos */}
      <DashboardKPIs />

      {/* Modal para gerenciar a equipe (adicionar e remover membros) */}
      <TeamManagerModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
