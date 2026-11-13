
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Inicia o site Brenda Heredia Beauty
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registra o aplicativo instalável (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('Aplicativo Brenda Heredia registrado!')
      })
      .catch((erro) => {
        console.error('Erro ao registrar aplicativo:', erro)
      })
  })
}
