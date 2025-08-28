import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import useEcomStore from './store/ecom-store';
import App from './App.jsx'

useEcomStore.persist.rehydrate?.();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
