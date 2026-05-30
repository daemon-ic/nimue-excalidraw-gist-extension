import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { PopupInfo } from '@/popup/PopupInfo';
import '@/styles/popup.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopupInfo />
  </StrictMode>
);
