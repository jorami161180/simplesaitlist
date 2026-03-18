import { Link } from 'react-router-dom'
import { useConvexAuth } from '../lib/hooks'
import { Check, ArrowRight, Sparkles, Zap } from 'lucide-react'

export default function Pricing() {
    const { isAuthenticated } = useConvexAuth()

    const features = [
        'Waitlists ilimitadas',
        'Suscriptores ilimitados',
        'Generación de copy con IA',
        'Logo personalizado por waitlist',
        'Exportar emails a CSV',
        'Página pública con link único',
        'Dashboard de gestión',
        'Estadísticas en tiempo real',
    ]

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#3b82f6] rounded-full blur-[160px] opacity-10 pointer-events-none" />

            <div className="text-center mb-20 animate-fade-in relative z-10">
                <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6 glass border border-white/5 text-[#3b82f6]">
                    Planes y Precios
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight">
                    Un plan simple. <br /><span className="text-gradient">Todo incluido.</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Sin planes gratuitos limitados. Sin sorpresas. Todo lo que necesitas para validar tus ideas y crecer tu audiencia.
                </p>
            </div>

            <div className="max-w-lg mx-auto animate-slide-up relative z-10">
                <div className="glass-card rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

                    <div className="bg-[#0a0a0a]/40 backdrop-blur-xl rounded-[2.8rem] p-10 sm:p-12 border border-white/5 h-full relative z-10">
                        {/* Plan header */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-[#3b82f6]" />
                            </div>
                            <div>
                                <span className="text-xs font-extrabold text-[#3b82f6] uppercase tracking-[0.2em]">
                                    Plan Pro
                                </span>
                                <h3 className="text-xl font-extrabold text-white">Full Access</h3>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-6xl font-extrabold text-white leading-tight">$10</span>
                            <span className="text-gray-500 text-lg font-bold">/mes</span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium mb-10">
                            Cancela en cualquier momento. Sin permanencia.
                        </p>

                        <div className="w-full h-px bg-white/[0.05] mb-10" />

                        {/* Features */}
                        <ul className="grid grid-cols-1 gap-5 mb-12">
                            {features.map((feature) => (
                                <li key={feature} className="flex items-center gap-4 text-sm font-bold text-gray-200">
                                    <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5">
                                        <Check className="w-3.5 h-3.5 text-[#3b82f6]" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/login'}
                            className="w-full flex items-center justify-center gap-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-5 rounded-[1.5rem] text-base font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#3b82f6]/30 group"
                        >
                            Comenzar ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <p className="mt-6 text-center text-[10px] text-gray-500 font-extrabold uppercase tracking-widest flex items-center justify-center gap-2">
                            <Zap className="w-3 h-3 text-[#3b82f6]" />
                            Activación instantánea
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Únete a más de <span className="text-white">500+ creadores</span> escalando sus proyectos
                </p>
            </div>
        </div>
    )
}
