import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// URL por defecto para evitar que el cliente de Convex explote si falta la variable
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://dummy.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

// Debug: Captura errores globales y los muestra en pantalla (solo para diagnóstico)
window.onerror = function(msg, url, line, col, error) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:10px;font-family:monospace;font-size:12px;';
    div.innerText = 'ERROR: ' + msg + '\nAt: ' + url + ':' + line + ':' + col;
    document.body.appendChild(div);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConvexAuthProvider client={convex}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ConvexAuthProvider>
    </React.StrictMode>,
)
