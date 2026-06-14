/**
 * @file Dashboard.tsx
 * @description Componente de visualização de métricas e KPIs da equipe avançado.
 *              Apresenta indicadores de desempenho específicos para reuniões de segunda-feira,
 *              alertas de sobrecarga/ociosidade e aviso antecipado de estouro de prazos.
 * @version 1.1.0
 * @date 2026-06-14
 */

import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  ShieldAlert, 
  Award, 
  CalendarClock, 
  UserCheck, 
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks, users } = useTaskStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // 1. Carga de Trabalho (tarefas em DOING por usuário, incluindo os que possuem 0)
  const workloadData = users.map((user) => {
    const doingTasksCount = tasks.filter(
      (task) => task.assigneeId === user.id && task.status === 'DOING'
    ).length;
    const totalAssignedCount = tasks.filter(
      (task) => task.assigneeId === user.id && task.status !== 'DONE'
    ).length;
    const overdueTasksCount = tasks.filter((task) => {
      if (task.assigneeId !== user.id) return false;
      if (task.status === 'DONE') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    }).length;

    return {
      id: user.id,
      name: user.name,
      initials: user.initials,
      role: user.role,
      doingCount: doingTasksCount,
      totalAssigned: totalAssignedCount,
      overdueCount: overdueTasksCount,
    };
  });

  // Agrupa os dados de carga de trabalho por cargo/setor
  const groupedWorkload = React.useMemo(() => {
    const groups: { [key: string]: typeof workloadData } = {};
    workloadData.forEach((user) => {
      const sector = user.role.trim() || 'Sem Setor';
      if (!groups[sector]) {
        groups[sector] = [];
      }
      groups[sector].push(user);
    });
    return groups;
  }, [workloadData]);

  // Filtra membros sobrecarregados (>= 3 em execução) e ociosos (0 em execução)
  const overloadedUsers = workloadData.filter((u) => u.doingCount >= 3);
  const idleUsers = workloadData.filter((u) => u.doingCount === 0);

  // 2. Termômetro de Prazos (No Prazo, Em Risco, Atrasadas) - Desconsiderando 'DONE'
  const activeTasks = tasks.filter((task) => task.status !== 'DONE');
  const totalActive = activeTasks.length;

  let overdueCount = 0;
  let atRiskCount = 0;
  let onTimeCount = 0;

  activeTasks.forEach((task) => {
    const dueDate = new Date(task.dueDate);
    if (dueDate < today) {
      overdueCount++;
    } else if (dueDate >= today && dueDate <= tomorrow) {
      atRiskCount++;
    } else {
      onTimeCount++;
    }
  });

  const overduePercent = totalActive ? Math.round((overdueCount / totalActive) * 100) : 0;
  const atRiskPercent = totalActive ? Math.round((atRiskCount / totalActive) * 100) : 0;
  const onTimePercent = totalActive ? Math.round((onTimeCount / totalActive) * 100) : 0;

  // 3. Métricas da Reunião de Segunda-Feira (Últimos 7 dias)
  const completedLast7Days = tasks.filter((task) => {
    if (task.status !== 'DONE') return false;
    const completedDate = new Date(task.updatedAt);
    return completedDate >= sevenDaysAgo;
  });

  let totalCompletionTimeMs = 0;
  let onTimeDeliveries = 0;

  completedLast7Days.forEach((task) => {
    const created = new Date(task.createdAt);
    const completed = new Date(task.updatedAt);
    const due = new Date(task.dueDate);
    
    if (!isNaN(created.getTime()) && !isNaN(completed.getTime())) {
      totalCompletionTimeMs += (completed.getTime() - created.getTime());
    }
    
    if (!isNaN(due.getTime()) && !isNaN(completed.getTime())) {
      const completedStart = new Date(completed);
      completedStart.setHours(0, 0, 0, 0);
      const dueStart = new Date(due);
      dueStart.setHours(0, 0, 0, 0);
      
      if (completedStart <= dueStart) {
        onTimeDeliveries++;
      }
    }
  });

  const avgCompletionDays = completedLast7Days.length
    ? (totalCompletionTimeMs / (1000 * 60 * 60 * 24 * completedLast7Days.length)).toFixed(1)
    : '0.0';

  const punctualityRate = completedLast7Days.length
    ? Math.round((onTimeDeliveries / completedLast7Days.length) * 100)
    : 100;

  // 4. Central de Alertas Críticos e Prazos Próximos (vencidos, hoje, amanhã)
  const criticalAlerts = tasks
    .filter((task) => task.status !== 'DONE')
    .map((task) => {
      const dueDate = new Date(task.dueDate);
      const dueDateStart = new Date(dueDate);
      dueDateStart.setHours(0, 0, 0, 0);
      
      const diffTime = dueDateStart.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      let alertType: 'overdue' | 'today' | 'tomorrow' | 'normal' = 'normal';
      let message = '';
      
      if (diffDays < 0) {
        alertType = 'overdue';
        message = `Atrasada há ${Math.abs(diffDays)} dia(s)`;
      } else if (diffDays === 0) {
        alertType = 'today';
        message = 'Vence HOJE!';
      } else if (diffDays === 1) {
        alertType = 'tomorrow';
        message = 'Vence AMANHÃ!';
      }
      
      return {
        ...task,
        alertType,
        message,
        diffDays,
        dueDate,
      };
    })
    .filter((task) => task.alertType !== 'normal')
    .sort((a, b) => a.diffDays - b.diffDays); // Mais atrasadas primeiro

  return (
    <div className="space-y-6">
      {/* 1. Grade Superior de Indicadores (Foco em Reuniões de Segunda-feira) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Pendente */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex items-center gap-5">
          <div className="bg-zinc-800 p-3.5 rounded-lg border border-zinc-700/50">
            <CalendarClock className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Atividades Ativas</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalActive}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Pendentes no fluxo</p>
          </div>
        </div>

        {/* Entregas da Semana */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex items-center gap-5">
          <div className="bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-900/30">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Entregas (7 dias)</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{completedLast7Days.length}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Concluídas com sucesso</p>
          </div>
        </div>

        {/* Tempo Médio de Conclusão */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex items-center gap-5">
          <div className="bg-amber-950/20 p-3.5 rounded-lg border border-amber-900/30">
            <TrendingUp className="w-6 h-6 text-brand-yellow" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ciclo Médio de Entrega</p>
            <h3 className="text-2xl font-extrabold text-brand-yellow mt-1">{avgCompletionDays} <span className="text-sm font-semibold text-zinc-400">dias</span></h3>
            <p className="text-xs text-zinc-400 mt-0.5">De criação a concluído</p>
          </div>
        </div>

        {/* Taxa de Pontualidade */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex items-center gap-5">
          <div className="bg-blue-950/20 p-3.5 rounded-lg border border-blue-900/30">
            <UserCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pontualidade na Semana</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">{punctualityRate}%</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Entregas dentro do prazo</p>
          </div>
        </div>
      </div>

      {/* 2. Conteúdo Principal em Grade de 3 Colunas Alinhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Coluna 1: Carga de Trabalho da Equipe */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex flex-col h-[580px]">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5.5 h-5.5 text-brand-yellow" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Carga de Trabalho</h2>
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Membros e status de execução</p>

          {workloadData.length === 0 ? (
            <p className="text-zinc-500 text-sm font-semibold py-10 text-center uppercase tracking-wider">
              Nenhum membro cadastrado.
            </p>
          ) : (
            <div className="flex-grow overflow-y-auto pr-1 space-y-4">
              {Object.entries(groupedWorkload).map(([sector, members]) => (
                <div key={sector} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-brand-border/40 pb-1 mb-2">
                    <span className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
                      {sector}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/30 uppercase tracking-wider">
                      {members.length} {members.length === 1 ? 'membro' : 'membros'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {members.map((user) => {
                      let progressColor = 'bg-emerald-500';

                      if (user.doingCount === 0) {
                        progressColor = 'bg-zinc-800';
                      } else if (user.doingCount === 2) {
                        progressColor = 'bg-brand-yellow';
                      } else if (user.doingCount >= 3) {
                        progressColor = 'bg-red-500';
                      }

                      const percentage = user.doingCount === 0 ? 0 : Math.min((user.doingCount / 4) * 100, 100);

                      return (
                        <div key={user.id} className="flex flex-col gap-2 p-3 rounded-lg bg-brand-cardBg/40 border border-brand-border/30 hover:border-brand-border transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center font-bold text-xs text-brand-yellow border border-brand-border shrink-0">
                                {user.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-200 truncate">{user.name}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 shrink-0 justify-end max-w-[55%]">
                              {user.overdueCount > 0 && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border bg-red-950/40 text-red-400 border-red-900/30 uppercase tracking-wider whitespace-nowrap animate-pulse">
                                  {user.overdueCount} atrasada{user.overdueCount > 1 ? 's' : ''}
                                </span>
                              )}
                              
                              {user.doingCount > 0 ? (
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap ${
                                  user.doingCount >= 3 
                                    ? 'bg-red-950/40 text-red-400 border-red-900/30' 
                                    : user.doingCount === 2 
                                      ? 'bg-amber-950/40 text-brand-yellow border-amber-900/30' 
                                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                                }`}>
                                  {user.doingCount} em andamento
                                </span>
                              ) : (
                                user.overdueCount === 0 && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border bg-zinc-850 text-zinc-400 border-zinc-700/30 uppercase tracking-wider whitespace-nowrap">
                                    {user.totalAssigned > 0 ? 'Sem andamento' : 'Disponível'}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progressColor} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna 2: Termômetro de Prazos & Balanceamento */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex flex-col h-[580px]">
          {/* Termômetro de Prazos */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5.5 h-5.5 text-brand-yellow" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Termômetro de Prazos</h2>
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Pontualidade das tarefas ativas</p>

            {totalActive === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">Nenhuma atividade ativa.</p>
            ) : (
              <div className="space-y-4">
                {/* Stacked Segmented Progress Bar */}
                <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden flex border border-brand-border/40">
                  {overduePercent > 0 && (
                    <div 
                      className="bg-red-500 h-full transition-all duration-500" 
                      style={{ width: `${overduePercent}%` }}
                      title={`Atrasadas: ${overduePercent}%`}
                    />
                  )}
                  {atRiskPercent > 0 && (
                    <div 
                      className="bg-brand-yellow h-full transition-all duration-500" 
                      style={{ width: `${atRiskPercent}%` }}
                      title={`Em Risco: ${atRiskPercent}%`}
                    />
                  )}
                  {onTimePercent > 0 && (
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${onTimePercent}%` }}
                      title={`No Prazo: ${onTimePercent}%`}
                    />
                  )}
                </div>

                {/* Legend Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-zinc-950/40 border border-brand-border/60 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-red-400 block uppercase">Atrasadas</span>
                    <span className="text-base font-bold text-white block mt-0.5">{overdueCount}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{overduePercent}%</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-brand-border/60 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-brand-yellow block uppercase">Em Risco</span>
                    <span className="text-base font-bold text-white block mt-0.5">{atRiskCount}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{atRiskPercent}%</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-brand-border/60 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">No Prazo</span>
                    <span className="text-base font-bold text-white block mt-0.5">{onTimeCount}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{onTimePercent}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-brand-border/40 my-4"></div>

          {/* Balanceamento de Carga */}
          <div className="flex-grow flex flex-col justify-between min-h-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5.5 h-5.5 text-brand-yellow" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Distribuição</h2>
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recomendações de Alocação</p>

              <div className="space-y-4 overflow-y-auto max-h-[200px] pr-1">
                {/* Membros Sobrecarregados */}
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-950/30 text-red-400 border border-red-900/20 uppercase tracking-wider inline-block mb-1.5">
                    Gargalos (3+ tarefas)
                  </span>
                  {overloadedUsers.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic pl-1">Sem membros sobrecarregados.</p>
                  ) : (
                    <div className="space-y-1.5 pl-1">
                      {overloadedUsers.map((u) => (
                        <p key={u.id} className="text-xs text-zinc-350 leading-tight">
                          <strong className="text-white">{u.name}</strong> tem <span className="text-red-400 font-bold">{u.doingCount} itens</span>.
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Membros Ociosos */}
                <div className="pt-2 border-t border-brand-border/20">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-900/20 uppercase tracking-wider inline-block mb-1.5">
                    Disponíveis (0 tarefas)
                  </span>
                  {idleUsers.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic pl-1">Sem membros disponíveis.</p>
                  ) : (
                    <div className="space-y-1.5 pl-1">
                      {idleUsers.map((u) => (
                        <p key={u.id} className="text-xs text-zinc-350 leading-tight">
                          <strong className="text-white">{u.name}</strong> está com <span className="text-emerald-400 font-bold">0 tarefas</span>.
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 3: Central de Alertas Críticos */}
        <div className="bg-brand-columnBg border border-brand-border rounded-xl p-6 shadow-lg flex flex-col h-[580px]">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5.5 h-5.5 text-red-500" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Alertas Críticos</h2>
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Prazos vencidos ou próximos</p>

          <div className="flex-grow overflow-y-auto pr-1 space-y-3">
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="bg-emerald-950/20 p-4 rounded-full border border-emerald-900/30 mb-3">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-sm text-emerald-400 font-bold uppercase tracking-wide">Tudo sob controle!</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Sem prazos críticos ou atrasados</p>
              </div>
            ) : (
              criticalAlerts.map((task) => {
                const badgeColor = 
                  task.alertType === 'overdue' 
                    ? 'bg-red-950/40 text-red-400 border-red-900/40' 
                    : task.alertType === 'today'
                      ? 'bg-amber-950/40 text-brand-yellow border-amber-900/40'
                      : 'bg-blue-950/40 text-blue-400 border-blue-900/40';

                return (
                  <div key={task.id} className="p-3.5 rounded-lg bg-brand-cardBg/40 border border-brand-border/30 hover:border-brand-border/80 transition-colors flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-tight">{task.title}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${badgeColor}`}>
                        {task.message}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-brand-border/20 text-xs text-zinc-500 font-medium">
                      <span className="uppercase tracking-wider font-bold text-zinc-400">{task.area}</span>
                      <span>Resp: <strong className="text-zinc-300">{task.assignee?.name || 'Sem resp.'}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
