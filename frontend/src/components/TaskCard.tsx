/**
 * @file TaskCard.tsx
 * @description Componente visual para exibição individual de uma tarefa.
 *              Funciona como um item arrastável (Draggable) dentro do Kanban.
 *              Exibe informações como título, área, data de vencimento (com destaque para atrasos)
 *              e avatar do responsável, permitindo também a exclusão rápida.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação inicial do card de tarefas, suporte ao drag-and-drop e exclusão.
 */

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../store/useTaskStore';
import { useTaskStore } from '../store/useTaskStore';
import { Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface TaskCardProps {
  task: Task;
  index: number; // Índice do card dentro da coluna (necessário para o DnD ordenar)
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const { deleteTask } = useTaskStore();
  const dueDateObj = parseISO(task.dueDate);
  const today = startOfDay(new Date());
  
  // Verifica se a tarefa está atrasada (data de vencimento é anterior a hoje e não está concluída)
  const isOverdue = isBefore(dueDateObj, today) && task.status !== 'DONE';

  // Formata a data de vencimento para exibição curta (ex: 14 de jun.)
  const formattedDate = dueDateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  // Trata a solicitação de exclusão da tarefa
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede o clique de propagar para eventos de arrasto do card
    if (window.confirm('Deseja realmente excluir esta atividade?')) {
      try {
        await deleteTask(task.id);
        toast.success('Atividade excluída com sucesso!');
      } catch {
        toast.error('Não foi possível excluir a atividade.');
      }
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-zinc-900 border border-brand-border rounded-lg p-4 shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[140px] group ${
            snapshot.isDragging
              ? 'border-brand-yellow ring-2 ring-brand-yellow/20 shadow-md scale-[1.02]'
              : 'hover:border-zinc-700 hover:bg-zinc-800/80'
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
                {task.area}
              </span>
              
              <div className="flex items-center gap-1.5">
                {isOverdue && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    ATRASADO
                  </span>
                )}
                
                {/* Botão de excluir, visível sob hover do card */}
                <button
                  onClick={handleDelete}
                  className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800 p-1 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="Excluir atividade"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2 mb-4 leading-snug">
              {task.title}
            </h4>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-auto">
            {/* Tag de Data de Vencimento com coloração semântica dependendo do status */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium ${
              isOverdue
                ? 'text-red-400 border-red-950/50 bg-red-950/20'
                : task.status === 'DONE'
                  ? 'text-emerald-400 border-emerald-950/50 bg-emerald-950/20'
                  : 'text-zinc-400 border-zinc-800 bg-zinc-950/50'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            {/* Avatar do Responsável */}
            {task.assignee ? (
              <div
                title={`${task.assignee.name} (${task.assignee.role})`}
                className="w-7 h-7 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center font-bold text-[11px] text-brand-yellow cursor-default transition-colors group-hover:bg-brand-yellow/20"
              >
                {task.assignee.initials}
              </div>
            ) : (
              <div
                title="Sem responsável"
                className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-bold text-[11px] text-zinc-500 cursor-default"
              >
                --
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
