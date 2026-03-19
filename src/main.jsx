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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConvexAuthProvider client={convex}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ConvexAuthProvider>
    </React.StrictMode>,
)
