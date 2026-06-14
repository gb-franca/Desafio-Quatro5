/**
 * @file NewTaskModal.tsx
 * @description Modal com formulário para criação de novas tarefas.
 *              Utiliza react-hook-form integrado com zod para validação dos dados
 *              (título mínimo, área, responsável selecionado e data de vencimento).
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação do formulário de criação de atividades com validação Zod.
 */

import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTaskStore } from '../store/useTaskStore';
import { toast } from 'sonner';
import { X, Plus, Calendar, User, Tag, FileText } from 'lucide-react';

// Esquema de Validação Zod para garantir consistência dos dados inseridos no form
const taskSchema = z.object({
  title: z.string().min(3, { message: 'O título deve conter pelo menos 3 letras' }),
  area: z.string().min(1, { message: 'A área da atividade é obrigatória' }),
  assigneeId: z.string().min(1, { message: 'Selecione um responsável' }),
  dueDate: z.string().min(1, { message: 'A data de vencimento é obrigatória' }),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void; // Callback para fechar o modal
}

// Lista estática de áreas possíveis para categorização da tarefa
const AREAS = ['DESIGN', 'FRONTEND', 'BACKEND', 'QA', 'MARKETING', 'LANÇAMENTO'];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { users, createTask } = useTaskStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // Inicializa o formulário com o hook resolver do zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      area: '',
      assigneeId: '',
      dueDate: '',
    },
  });

  if (!isOpen) return null;

  // Envia a requisição de criação de tarefa para o servidor
  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask({
        title: data.title,
        area: data.area,
        dueDate: new Date(data.dueDate).toISOString(),
        assigneeId: data.assigneeId,
      });
      toast.success('Atividade criada com sucesso!');
      reset();    // Limpa o formulário após a criação
      onClose();  // Fecha o modal
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar atividade.';
      toast.error(message);
    }
  };

  // Fecha o modal ao clicar na área escura (backdrop) fora da caixa do modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <div
        ref={modalRef}
        className="bg-zinc-900 border border-brand-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-yellow" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Nova Atividade</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Título
            </label>
            <input
              type="text"
              placeholder="Ex: Refatorar tela de login"
              {...register('title')}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-yellow/50 transition-colors"
            />
            {errors.title && (
              <span className="text-[10px] text-red-400 font-semibold">{errors.title.message}</span>
            )}
          </div>

          {/* Área */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Área
            </label>
            <select
              {...register('area')}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow/50 transition-colors cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-950 text-zinc-500">Selecione uma área</option>
              {AREAS.map((area) => (
                <option key={area} value={area} className="bg-zinc-950 text-zinc-100">
                  {area}
                </option>
              ))}
            </select>
            {errors.area && (
              <span className="text-[10px] text-red-400 font-semibold">{errors.area.message}</span>
            )}
          </div>

          {/* Responsável */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Responsável
            </label>
            <select
              {...register('assigneeId')}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow/50 transition-colors cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-950 text-zinc-500">Selecione o responsável</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} className="bg-zinc-950 text-zinc-100">
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {errors.assigneeId && (
              <span className="text-[10px] text-red-400 font-semibold">{errors.assigneeId.message}</span>
            )}
          </div>

          {/* Data de Vencimento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Data de Vencimento
            </label>
            <input
              type="date"
              {...register('dueDate')}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow/50 transition-colors cursor-pointer"
            />
            {errors.dueDate && (
              <span className="text-[10px] text-red-400 font-semibold">{errors.dueDate.message}</span>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand-yellow hover:bg-amber-600 disabled:opacity-50 text-xs font-bold text-zinc-950 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Criando...' : 'Salvar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
