import { Link } from 'react-router-dom'
import { useConvexAuth } from '../lib/hooks'
import { ArrowRight, Zap, Clock, Mail, Sparkles, Palette, Download } from 'lucide-react'

export default function Landing() {
    const { isAuthenticated } = useConvexAuth()

    const features = [
        {
            icon: Clock,
            title: 'Listo en 2 minutos',
            description: 'Describe tu producto y obtén una página de espera profesional al instante.',
        },
        {
            icon: Sparkles,
            title: 'Copy generado con IA',
            description: 'La IA crea el texto perfecto para tu página. Ajusta el tono con un clic.',
        },
        {
            icon: Mail,
            title: 'Recopila emails',
            description: 'Los visitantes dejan su email. Tú los gestionas desde tu dashboard.',
        },
        {
            icon: Palette,
            title: 'Personalizable',
            description: 'Elige colores, sube tu logo y refina el copy hasta que sea perfecto.',
        },
        {
            icon: Zap,
            title: 'Sin configuración',
            description: 'Sin dominio, sin base de datos, sin formularios. Solo crea y comparte.',
        },
        {
            icon: Download,
            title: 'Exporta tus datos',
            description: 'Descarga todos tus suscriptores en CSV cuando quieras.',
        },
    ]

    return (
        <div className="relative min-h-screen">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/10 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-center">
                <div className="animate-fade-in">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-full px-4 py-2 mb-10">
                        <Sparkles className="w-4 h-4" />
                        Potenciado con IA de última generación
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
                        De idea a lista de espera{' '}
                        <span className="bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">
                            en segundos
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        No pierdas tiempo con configuraciones complejas. Describe tu producto, la IA hace el copy y tú obtienes una página profesional lista para validar tu mercado.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/login'}
                            className="group relative inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#3b82f6]/20"
                        >
                            Empezar ahora — Es gratis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="text-base text-gray-400 hover:text-white transition-colors py-2"
                        >
                            Ver planes y detalles
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={feature.title}
                            className="glass-card p-8 rounded-[2rem] animate-slide-up"
                            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
                        >
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#3b82f6]/30 transition-colors">
                                <feature.icon className="w-6 h-6 text-[#3b82f6]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-32">
                <div className="glass p-12 sm:p-20 rounded-[3rem] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/5 rounded-full blur-[80px] -ml-32 -mb-32" />

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight relative z-10">
                        Deja de planear y empieza a validar
                    </h2>
                    <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
                        Únete a los creadores que están validando sus ideas en tiempo récord con SimpleWaitlist.
                    </p>
                    <Link
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        className="group relative z-10 inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] shadow-2xl"
                    >
                        Crear mi primera página
                        <Zap className="w-5 h-5 fill-current" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
