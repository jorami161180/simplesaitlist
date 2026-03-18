import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function Root() {
    if (!convex) {
        return (
            <BrowserRouter>
                <App />
            </BrowserRouter>
        )
    }

    return (
        <ConvexAuthProvider client={convex}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ConvexAuthProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
)
