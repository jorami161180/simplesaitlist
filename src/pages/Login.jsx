import { useState } from 'react'
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from '../lib/hooks'
import { Navigate } from 'react-router-dom'
import { Zap, User, Loader2, AlertCircle, Mail } from 'lucide-react'

function LoginWithAuth() {
    const { isAuthenticated } = useConvexAuth()
    const { signIn } = useAuthActions()
    const allowGuest = import.meta.env.VITE_ENABLE_GUEST === 'true'

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [step, setStep] = useState("signIn")
    const [resendTimer, setResendTimer] = useState(0)

    const handleEmailLogin = async (e) => {
        if (e) e.preventDefault()
        if (!email) return
        setLoading(true)
        setError(null)
        try {
            await signIn("resend", { email })
            setStep("verify")
            setResendTimer(30)
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (err) {
            console.error("Error signing in:", err)
            setError("Error al enviar el email. Verifica tu configuración de Resend.")
        } finally {
            setLoading(false)
        }
    }

    const handleGuestLogin = async () => {
        if (!allowGuest) {
            setError('El modo invitado está desactivado en este entorno.')
            return
        }
        setLoading(true)
        setError(null)
        try {
            // Simulate a small delay for premium feel
            await new Promise(r => setTimeout(r, 600));
            localStorage.setItem('simplewaitlist_guest', 'true');
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Error activando modo invitado:", err)
            setError(`Error local: ${err.message || "Desconocido"}`)
        } finally {
            setLoading(false)
        }
    }

    return <LoginUI
        email={email}
        setEmail={setEmail}
        onEmailLogin={handleEmailLogin}
        onGuestLogin={handleGuestLogin}
        allowGuest={allowGuest}
        error={error}
        loading={loading}
        step={step}
        setStep={setStep}
        resendTimer={resendTimer}
    />
}

function LoginNoAuth() {
    const alertUser = () => alert("Convex no está configurado. Ejecuta 'npx convex dev' primero.")
    return <LoginUI onEmailLogin={alertUser} onGuestLogin={alertUser} allowGuest={false} />
}

function LoginUI({ email, setEmail, onEmailLogin, onGuestLogin, allowGuest, error, loading, step, setStep, resendTimer }) {
    if (step === "verify") {
        return (
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <div className="w-full max-w-sm animate-fade-in text-center">
                    <div className="w-20 h-20 glass rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                        <div className="absolute inset-0 bg-[#3b82f6]/20 rounded-full blur-2xl animate-pulse" />
                        <Mail className="w-10 h-10 text-[#3b82f6] relative z-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Revisa tu bandeja</h2>
                    <p className="text-sm text-gray-400 mb-10 leading-relaxed px-4">
                        Hemos enviado un enlace mágico a <br />
                        <span className="text-white font-semibold">{email}</span>. <br />
                        Haz clic en el enlace para entrar.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => onEmailLogin()}
                            disabled={resendTimer > 0 || loading}
                            className="w-full h-14 flex items-center justify-center gap-2 glass hover:bg-white/5 text-white rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            {resendTimer > 0
                                ? `Reenviar en ${resendTimer}s`
                                : loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reenviar enlace'}
                        </button>

                        <button
                            onClick={() => setStep("signIn")}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← Usar otro email
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/5 relative group">
                        <div className="absolute inset-0 bg-[#3b82f6]/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <Zap className="w-8 h-8 text-[#3b82f6] relative z-10 fill-[#3b82f6]/20" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-sm text-gray-400">
                        Gestiona tus listas de espera con el poder de la IA.
                    </p>
                </div>

                <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 mb-6 animate-fade-in">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={onEmailLogin} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 ml-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/20 transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#3b82f6]/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar con Enlace Mágico'}
                        </button>
                    </form>

                    <div className="relative py-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="bg-[#0f0f0f] px-4 text-gray-600">O continúa con</span>
                        </div>
                    </div>

                    {allowGuest && (
                        <button
                            onClick={onGuestLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 glass hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white h-14 rounded-2xl text-sm font-semibold transition-all group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <>
                                    <User className="w-5 h-5 group-hover:text-[#3b82f6] transition-colors" />
                                    Modo Invitado (Local)
                                </>
                            )}
                        </button>
                    )}
                </div>

                <p className="text-center mt-8 text-xs text-gray-500">
                    Protegido por SimpleWaitlist Cloud
                </p>
            </div>
        </div>
    )
}

export default function Login() {
    if (!import.meta.env.VITE_CONVEX_URL) {
        return <LoginNoAuth />
    }
    return <LoginWithAuth />
}
