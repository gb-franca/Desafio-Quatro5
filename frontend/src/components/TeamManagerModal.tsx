/**
 * @file TeamManagerModal.tsx
 * @description Modal de gerenciamento da equipe de desenvolvimento.
 *              Permite adicionar novos membros (calculando suas iniciais automaticamente)
 *              e remover membros da equipe com confirmação de segurança.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Implementação do CRUD simples de usuários/equipe.
 */

import React, { useState, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { toast } from 'sonner';
import { X, Plus, UserPlus, Trash2, Users } from 'lucide-react';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREDEFINED_ROLES = [
  'Tech Lead',
  'Designer UI/UX',
  'Dev Backend',
  'Dev Frontend',
  'QA Engineer',
  'Product Owner',
  'DevOps Engineer',
  'Copywriter',
  'Marketing Specialist'
];

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({ isOpen, onClose }) => {
  const { users, addUser, removeUser } = useTaskStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Função auxiliar para obter as iniciais a partir do nome (ex: "Ricardo Silva" -> "RS")
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Trata a submissão do formulário de adição de membro de equipe
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error('Por favor, preencha o nome e o cargo do membro.');
      return;
    }

    const initials = getInitials(name);
    setIsAdding(true);

    try {
      await addUser({
        name: name.trim(),
        role: role.trim(),
        initials,
      });
      toast.success('Membro adicionado à equipe com sucesso!');
      setName('');
      setRole('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar membro à equipe.';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  // Trata a remoção de um membro de equipe
  const handleRemoveMember = async (userId: string, userName: string) => {
    if (window.confirm(`Deseja realmente remover ${userName} da equipe? As tarefas atribuídas a ele ficarão sem responsável.`)) {
      try {
        await removeUser(userId);
        toast.success(`${userName} foi removido(a) da equipe.`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao remover membro.';
        toast.error(message);
      }
    }
  };

  // Fecha o modal ao clicar fora da área dele
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
        className="bg-zinc-900 border border-brand-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-yellow" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Gerenciar Equipe</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-grow">
          {/* Formulário de Adição */}
          <form onSubmit={handleAddMember} className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-yellow" /> Adicionar Novo Membro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Ricardo Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-brand-yellow/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cargo</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow/50 transition-colors cursor-pointer w-full"
                >
                  <option value="" className="text-zinc-500 bg-zinc-900">Selecione um cargo...</option>
                  {PREDEFINED_ROLES.map((r) => (
                    <option key={r} value={r} className="text-white bg-zinc-900">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 bg-brand-yellow hover:bg-amber-600 disabled:opacity-50 text-zinc-950 font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAdding ? 'Adicionando...' : 'Adicionar'}</span>
              </button>
            </div>
          </form>

          {/* Lista de Membros */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Membros da Equipe ({users.length})
            </h3>

            <div className="border border-zinc-850 rounded-xl divide-y divide-zinc-850 overflow-hidden bg-zinc-950/20 max-h-[300px] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center py-8 text-xs text-zinc-650 font-semibold uppercase">Nenhum membro na equipe</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3.5 hover:bg-zinc-850/20 transition-colors">
                     <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center font-bold text-xs text-brand-yellow">
                        {user.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">{user.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(user.id, user.name)}
                      className="text-zinc-600 hover:text-red-400 hover:bg-red-950/20 p-1.5 rounded-lg transition-all cursor-pointer"
                      title={`Remover ${user.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
