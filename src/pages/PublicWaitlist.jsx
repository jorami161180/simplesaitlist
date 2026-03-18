import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useParams } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react'

function PublicWaitlistWithAuth() {
    const { slug } = useParams()
    const waitlist = useQuery(api.waitlists.getBySlug, { slug: slug || '' })
    const subscribe = useMutation(api.subscribers.subscribe)

    const [email, setEmail] = useState('')
    const [website, setWebsite] = useState('')
    const [startedAt] = useState(() => Date.now())
    const [status, setStatus] = useState('idle') // idle | loading | success | duplicate | error
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email.trim() || !waitlist) return

        setStatus('loading')
        setErrorMsg('')

        try {
            await subscribe({
                waitlistId: waitlist._id,
                email: email.trim(),
                hp: website,
                elapsedMs: Date.now() - startedAt,
            })
            setStatus('success')
            setEmail('')
        } catch (err) {
            if (err.message?.includes('already registered')) {
                setStatus('duplicate')
            } else {
                setStatus('error')
                setErrorMsg('Algo salió mal. Inténtalo de nuevo.')
            }
        }
    }

    // Loading
    if (waitlist === undefined) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
            </div>
        )
    }

    // Not found
    if (!waitlist) {
        return <PublicWaitlistNotFound />
    }

    return (
        <PublicWaitlistUI
            waitlist={waitlist}
            email={email}
            setEmail={setEmail}
            website={website}
            setWebsite={setWebsite}
            status={status}
            setStatus={setStatus}
            errorMsg={errorMsg}
            handleSubmit={handleSubmit}
        />
    )
}

function PublicWaitlistNoAuth() {
    return <PublicWaitlistNotFound message="Convex no está configurado. La página pública requiere una conexión a la base de datos." />
}

function PublicWaitlistNotFound({ message = "Esta lista de espera no existe o fue eliminada." }) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
            <div className="glass p-12 rounded-[2.5rem] max-w-md w-full text-center border border-white/5 shadow-2xl">
                <h1 className="text-2xl font-extrabold text-white mb-4 tracking-tight">Página no encontrada</h1>
                <p className="text-gray-400 mb-8">{message}</p>
                <div className="w-16 h-1 bg-[#3b82f6] mx-auto rounded-full opacity-50" />
            </div>
        </div>
    )
}

function PublicWaitlistUI({ waitlist, email, setEmail, website, setWebsite, status, setStatus, errorMsg, handleSubmit }) {
    const accentColor = waitlist.color || '#3b82f6'

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans">
            {/* Ambient background */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-all duration-1000"
                style={{ backgroundColor: accentColor }}
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-2xl text-center relative z-10 animate-fade-in">
                {/* Logo */}
                {waitlist.logoUrl && (
                    <div className="mb-12 flex justify-center">
                        <div className="relative group">
                            <div
                                className="absolute inset-0 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
                                style={{ backgroundColor: accentColor }}
                            />
                            <img
                                src={waitlist.logoUrl}
                                alt={waitlist.name}
                                className="w-24 h-24 rounded-[2rem] object-cover border border-white/10 shadow-2xl relative z-10"
                            />
                        </div>
                    </div>
                )}

                {!waitlist.logoUrl && (
                    <div className="mb-8 flex justify-center">
                        <div
                            className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl border border-white/5"
                            style={{ backgroundColor: accentColor }}
                        >
                            {waitlist.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}

                {/* Project name */}
                <span
                    className="inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 glass border border-white/5"
                    style={{ color: accentColor }}
                >
                    {waitlist.name}
                </span>

                {/* Headline */}
                <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                    {waitlist.headline}
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-12 max-w-xl mx-auto font-medium">
                    {waitlist.subtitle}
                </p>

                {/* Form */}
                <div className="max-w-md mx-auto">
                    {status === 'success' ? (
                        <div className="animate-fade-in glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">¡Ya estás dentro!</h2>
                            <p className="text-gray-400 font-medium">Te avisaremos en cuanto estemos listos. ¡Gracias por el apoyo!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="hidden" aria-hidden="true">
                                <label htmlFor="company">Company</label>
                                <input
                                    id="company"
                                    name="company"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-500 transition-colors group-focus-within:text-white" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (status !== 'idle' && status !== 'loading') setStatus('idle')
                                    }}
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 rounded-[1.25rem] pl-14 pr-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
                                    style={{
                                        borderColor: status === 'duplicate' || status === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full flex items-center justify-center gap-3 py-4.5 rounded-[1.25rem] text-sm font-extrabold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-2xl group relative overflow-hidden"
                                style={{
                                    backgroundColor: accentColor,
                                    boxShadow: `0 8px 30px ${accentColor}40`,
                                }}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {status === 'loading' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Unirme a la lista de espera
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {status === 'duplicate' && (
                                <div className="flex items-center justify-center gap-2 text-sm text-amber-400 font-bold animate-fade-in mt-4 bg-amber-400/5 py-3 rounded-xl border border-amber-400/10">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Este email ya está registrado.</span>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex items-center justify-center gap-2 text-sm text-red-400 font-bold animate-fade-in mt-4 bg-red-400/5 py-3 rounded-xl border border-red-400/10">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <div className="mt-20 flex flex-col items-center gap-4 opacity-40">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        Potenciado por <span className="text-white">SimpleWaitlist</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function PublicWaitlist() {
    if (!import.meta.env.VITE_CONVEX_URL) {
        return <PublicWaitlistNoAuth />
    }
    return <PublicWaitlistWithAuth />
}
