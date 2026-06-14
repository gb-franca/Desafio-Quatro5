/**
 * @file useTaskStore.ts
 * @description Gerenciamento de estado global com Zustand para tarefas e membros da equipe.
 *              Realiza chamadas HTTP com Axios para persistência de dados e atualizações otimistas.
 * @version 1.1.1
 * @date 2026-06-14
 */

import { create } from 'zustand';
import axios from 'axios';

// Define a URL base da API a partir de variáveis de ambiente do Vite ou fallback local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

// Interface representando um usuário/membro de equipe no frontend
export interface User {
  id: string;
  name: string;
  role: string;
  initials: string;
  createdAt: string;
}

// Interface representando uma tarefa/atividade do Kanban no frontend
export interface Task {
  id: string;
  title: string;
  area: string;
  status: string; // "BACKLOG" | "DOING" | "REVIEW" | "DONE"
  dueDate: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
}

// Definição da estrutura e ações expostas pelo Store do Zustand
interface TaskStore {
  tasks: Task[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  moveTask: (taskId: string, newStatus: string) => Promise<void>;
  createTask: (data: { title: string; area: string; dueDate: string; assigneeId: string | null }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addUser: (data: { name: string; role: string; initials: string }) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  users: [],
  isLoading: false,
  error: null,

  // Busca todas as tarefas da API
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<Task[]>(`${API_BASE_URL}/tasks`);
      set({ tasks: response.data, isLoading: false });
    } catch (err: unknown) {
      let message = 'Erro ao buscar tarefas do servidor';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, isLoading: false });
    }
  },

  // Busca todos os usuários/membros de equipe da API
  fetchUsers: async () => {
    try {
      const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
      set({ users: response.data });
    } catch (err: unknown) {
      let message = 'Erro ao buscar usuários do servidor';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message });
    }
  },

  // Altera o status da tarefa com Atualização Otimista para melhor fluidez visual
  moveTask: async (taskId: string, newStatus: string) => {
    const previousTasks = get().tasks;

    // Atualização Otimista (aplica no estado local antes do retorno da requisição)
    set({
      tasks: previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    });

    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        status: newStatus,
      });
    } catch (err: unknown) {
      let message = 'Falha ao sincronizar alteração com o servidor. Revertendo.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      // Reverte ao estado anterior em caso de falha na rede ou na API
      set({
        tasks: previousTasks,
        error: message,
      });
    }
  },

  // Cria uma nova tarefa e insere na lista local do Zustand
  createTask: async (data) => {
    try {
      const response = await axios.post<Task>(`${API_BASE_URL}/tasks`, data);
      set((state) => ({
        tasks: [...state.tasks, response.data],
      }));
    } catch (err: unknown) {
      let errMsg = 'Erro ao criar a tarefa no servidor';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      throw new Error(errMsg, { cause: err });
    }
  },

  // Exclui uma tarefa com Atualização Otimista
  deleteTask: async (taskId: string) => {
    const previousTasks = get().tasks;

    // Atualização Otimista
    set({
      tasks: previousTasks.filter((task) => task.id !== taskId),
    });

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    } catch (err: unknown) {
      let errMsg = 'Falha ao excluir a tarefa no servidor. Revertendo.';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      // Reverte se a chamada à API falhar
      set({
        tasks: previousTasks,
        error: errMsg,
      });
      throw err;
    }
  },

  // Cadastra um novo membro de equipe
  addUser: async (data) => {
    try {
      const response = await axios.post<User>(`${API_BASE_URL}/users`, data);
      set((state) => ({
        users: [...state.users, response.data],
      }));
    } catch (err: unknown) {
      let errMsg = 'Erro ao adicionar o membro da equipe';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      throw new Error(errMsg, { cause: err });
    }
  },

  // Remove um usuário da equipe e sincroniza tarefas desassociadas
  removeUser: async (userId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));
      // Sincroniza as tarefas locais pois o responsável foi desassociado delas no banco
      await get().fetchTasks();
    } catch (err: unknown) {
      let errMsg = 'Erro ao excluir o membro da equipe';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      throw new Error(errMsg, { cause: err });
    }
  },
}));
