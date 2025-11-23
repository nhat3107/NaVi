import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient();
const isDevelopment = import.meta.env.DEV;

createRoot(document.getElementById('root')).render(
  isDevelopment ? (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  ) : (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
);
