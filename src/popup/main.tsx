import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from '@/app/App';
import { QueryProvider } from '@/app/QueryProvider';
import '@/styles/app.css';
import '@/styles/popup.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App variant="popup" />
    </QueryProvider>
  </StrictMode>
);
