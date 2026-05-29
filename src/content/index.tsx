import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from '@/app/App';
import { QueryProvider } from '@/app/QueryProvider';
import '@/styles/app.css';
import '@/styles/excalidraw-page.css';

const HOST_ID = 'nimue-host';

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  document.body.appendChild(host);

  createRoot(host).render(
    <StrictMode>
      <QueryProvider>
        <App variant="panel" />
      </QueryProvider>
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
