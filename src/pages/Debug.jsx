import { Link } from 'react-router-dom'

export default function DebugPage() {
    return (
        <div style={{ padding: '50px', color: 'white', background: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#3b82f6' }}>Página de Diagnóstico</h1>
            <p>Si estás viendo esto, el enrutamiento (React Router) funciona correctamente.</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Volver al Inicio</Link>
                <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Ir a Login</Link>
            </div>
            <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #444', borderRadius: '10px' }}>
                <h3>Estado del Entorno (Vite):</h3>
                <pre style={{ background: '#000', padding: '10px' }}>
                    {JSON.stringify({
                        VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL ? 'DEFINIDA' : 'NO DEFINIDA',
                        VITE_ENABLE_GUEST: import.meta.env.VITE_ENABLE_GUEST ? 'DEFINIDA' : 'NO DEFINIDA',
                        BASE_URL: import.meta.env.BASE_URL,
                        MODE: import.meta.env.MODE
                    }, null, 2)}
                </pre>
            </div>
        </div>
    )
}
