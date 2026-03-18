import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from '../lib/hooks'
import { Zap, LogOut, LayoutDashboard, CreditCard, ChevronRight } from 'lucide-react'

function LayoutWithAuth() {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const { signOut } = useAuthActions()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <LayoutUI
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            onSignOut={handleSignOut}
        />
    )
}

function LayoutNoAuth() {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const navigate = useNavigate()

    const handleSignOut = () => {
        navigate('/')
    }

    return (
        <LayoutUI
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            onSignOut={handleSignOut}
        />
    )
}

function LayoutUI({ isAuthenticated, isLoading, onSignOut }) {
    const location = useLocation()
    const isPublicWaitlist = location.pathname.startsWith('/w/')

    if (isPublicWaitlist) {
        return <Outlet />
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-[#3b82f6]/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all shadow-lg shadow-[#3b82f6]/20 ring-1 ring-white/10">
                            <Zap className="w-5 h-5 text-white fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold text-white tracking-tight">SimpleWaitlist</span>
                            <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-[0.2em] -mt-1">
                                Powered by IA
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2 sm:gap-6">
                        {!isLoading && (
                            <>
                                <Link
                                    to="/pricing"
                                    className={`text-sm font-bold transition-colors px-4 py-2 rounded-xl border border-transparent ${location.pathname === '/pricing'
                                        ? 'text-white bg-white/5 border-white/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Precios
                                </Link>

                                {isAuthenticated ? (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/dashboard"
                                            className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl border border-transparent ${location.pathname === '/dashboard'
                                                ? 'text-white bg-white/5 border-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 font-bold'
                                                }`}
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="hidden sm:inline">Dashboard</span>
                                        </Link>
                                        <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
                                        <button
                                            onClick={onSignOut}
                                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-400 transition-all px-4 py-2 rounded-xl hover:bg-red-400/5 group"
                                        >
                                            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                            <span className="hidden sm:inline">Salir</span>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2.5 rounded-2xl transition-all font-extrabold text-sm shadow-xl shadow-[#3b82f6]/20 hover:scale-105"
                                        >
                                            Empezar
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 mt-20 relative overflow-hidden bg-[#050505]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-[#3b82f6] rounded-full blur-[100px] opacity-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10 mb-10">
                        <div className="flex flex-col items-center sm:items-start gap-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#3b82f6]" />
                                <span className="text-xl font-extrabold text-white tracking-tight">SimpleWaitlist</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium max-w-xs text-center sm:text-left">
                                La forma más rápida y elegante de validar tu próximo gran proyecto.
                            </p>
                        </div>

                        <div className="flex gap-10">
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-[0.2em] mb-2">Producto</h4>
                                <Link to="/pricing" className="text-sm text-gray-500 hover:text-white transition-colors">Precios</Link>
                                <Link to="/login" className="text-sm text-gray-500 hover:text-white transition-colors">Conectarse</Link>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-[0.2em] mb-2">Legal</h4>
                                <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacidad</a>
                                <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Términos</a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                            © 2026 SimpleWaitlist. Lanzando con estilo.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-widest">Systems Operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default function Layout() {
    if (!import.meta.env.VITE_CONVEX_URL) {
        return <LayoutNoAuth />
    }
    return <LayoutWithAuth />
}
