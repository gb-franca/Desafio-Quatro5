/**
 * @file KanbanBoard.tsx
 * @description Componente do quadro Kanban interativo de tarefas.
 *              Utiliza a biblioteca @hello-pangea/dnd para possibilitar drag-and-drop de tarefas
 *              entre as colunas de status (Backlog, Em Andamento, Revisão, Concluído).
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Criação do quadro Kanban com persistência otimista via Zustand.
 */

import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/useTaskStore';
import { TaskCard } from './TaskCard';
import { ClipboardList } from 'lucide-react';

// Definição estática das colunas do Kanban com estilos visuais e bordas coloridas correspondentes
const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', borderColor: 'border-t-gray-500', countColor: 'bg-zinc-800 text-zinc-400' },
  { id: 'DOING', title: 'Em Andamento', borderColor: 'border-t-amber-500', countColor: 'bg-amber-950/40 text-brand-yellow' },
  { id: 'REVIEW', title: 'Revisão', borderColor: 'border-t-blue-500', countColor: 'bg-blue-950/40 text-blue-400' },
  { id: 'DONE', title: 'Concluído', borderColor: 'border-t-emerald-500', countColor: 'bg-emerald-950/40 text-emerald-400' },
];

export const KanbanBoard: React.FC = () => {
  const { tasks, moveTask } = useTaskStore();

  // Executado quando um card de tarefa é solto (drag end)
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se soltar fora de qualquer coluna, ou soltar no mesmo lugar
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Dispara a movimentação da atividade para o novo status
    moveTask(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          // Filtra tarefas específicas para a coluna correspondente
          const columnTasks = tasks.filter((task) => task.status === col.id);

          return (
            <div
              key={col.id}
              className={`bg-brand-columnBg border border-brand-border border-t-4 ${col.borderColor} rounded-xl p-4 shadow-md flex flex-col min-h-[500px] max-h-[750px]`}
            >
              {/* Cabeçalho da Coluna */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border/40">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-400" />
                  <h3 className="font-semibold text-xs text-gray-200 uppercase tracking-wider">{col.title}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.countColor}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Área Droppable (Onde tarefas podem ser soltas) */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-3 overflow-y-auto pr-1 flex-grow rounded-lg transition-colors p-1 ${
                      snapshot.isDraggingOver ? 'bg-zinc-900/40' : ''
                    }`}
                  >
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-brand-border/40 rounded-lg h-full">
                        <p className="text-xs text-gray-500">Nenhuma tarefa</p>
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
