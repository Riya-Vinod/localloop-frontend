import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const ErrorFallback = ({ error }) => (
  <div style={{ color: 'red', padding: '20px', background: '#ffebee', fontFamily: 'monospace' }}>
    <h2>Runtime Error</h2>
    <pre>{error.message}</pre>
    <pre>{error.stack}</pre>
  </div>
);

window.addEventListener('error', (e) => {
  document.getElementById('root').innerHTML = `
    <div style="color: red; padding: 20px; background: #ffebee; font-family: monospace;">
      <h2>Runtime Error</h2>
      <pre>${e.error?.message || e.message}</pre>
      <pre>${e.error?.stack || ''}</pre>
    </div>
  `;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
