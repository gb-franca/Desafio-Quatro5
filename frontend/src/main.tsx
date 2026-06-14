/**
 * @file main.tsx
 * @description Ponto de partida do React (Client-side rendering).
 *              Carrega as folhas de estilos do Tailwind CSS, renderiza o App component sob o StrictMode
 *              e anexa o nó DOM ao elemento #root do index.html.
 * @version 1.0.0
 * @date 2026-06-14
 * @history
 *  - 1.0.0 (2026-06-14): Inicialização padrão do renderizador React 18+.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Busca a div #root no index.html e renderiza a aplicação
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
