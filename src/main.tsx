import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { StoreProvider } from './store/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary label="app">
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
