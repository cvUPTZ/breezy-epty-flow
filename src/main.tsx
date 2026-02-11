import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'regenerator-runtime/runtime';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { VoiceCollaborationProvider } from './context/VoiceCollaborationContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <VoiceCollaborationProvider>
          <App />
        </VoiceCollaborationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);