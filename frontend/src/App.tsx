/**
 * @file App.tsx
 * @description Ponto de entrada das rotas da aplicação frontend.
 *              Configura o roteamento de páginas com react-router-dom, associando
 *              o Layout global às sub-rotas (/dashboard, /quadro) e lidando com redirects.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Criação do roteamento da aplicação com redirecionamento padrão.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Redireciona a rota raiz "/" para a visualização principal do Kanban "/quadro" */}
          <Route index element={<Navigate to="/quadro" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quadro" element={<Kanban />} />

          {/* Captura qualquer rota inválida ou inexistente e redireciona de volta ao quadro */}
          <Route path="*" element={<Navigate to="/quadro" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
