import { useState } from 'react'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, PenLine, Sparkles, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { generateSlug, ACCENT_COLORS } from '../lib/utils'

export default function CreateWaitlist() {
    const [mode, setMode] = useState(null) // 'prd' or 'manual'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // PRD mode state
    const [prdText, setPrdText] = useState('')
    const [prdResult, setPrdResult] = useState(null)

    // Manual mode state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState(ACCENT_COLORS[0].value)

    const createWaitlist = useMutation(api.waitlists.create)
    const extractFromPRD = useAction(api.ai.extractFromPRD)
    const generateCopy = useAction(api.ai.generateCopy)
    const navigate = useNavigate()

    const handlePRDExtract = async () => {
        if (!prdText.trim()) return
        setLoading(true)
        setError('')
        try {
            const result = await extractFromPRD({ prdText: prdText.trim() })
            setPrdResult(result)
        } catch (err) {
            setError('Error al analizar el PRD. Inténtalo de nuevo.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePRDCreate = async () => {
        if (!prdResult) return
        setLoading(true)
        setError('')
        try {
            const id = await createWaitlist({
                name: prdResult.name,
                description: prdResult.description || '',
                slug: prdResult.slug,
                color: ACCENT_COLORS[0].value,
                headline: prdResult.headline,
                subtitle: prdResult.subtitle,
            })
            navigate(`/waitlist/${id}/edit`)
        } catch (err) {
            setError(err.message || 'Error al crear la waitlist.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleManualCreate = async () => {
        if (!name.trim() || !description.trim()) return
        setLoading(true)
        setError('')
        try {
            // Generate copy with AI
            const copy = await generateCopy({
                name: name.trim(),
                description: description.trim(),
            })

            const id = await createWaitlist({
                name: name.trim(),
                description: description.trim(),
                slug: generateSlug(name.trim()),
                color,
                headline: copy.headline,
                subtitle: copy.subtitle,
            })
            navigate(`/waitlist/${id}/edit`)
        } catch (err) {
            setError(err.message || 'Error al crear la waitlist.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="mb-12 animate-fade-in text-center sm:text-left">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a mis proyectos
                </Link>
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                    <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                        <Sparkles className="w-6 h-6 text-[#3b82f6]" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Nueva Waitlist</h1>
                </div>
                <p className="text-base text-gray-400">
                    Elige el método que prefieras. Nuestra IA se encarga de todo el copy persuasivo.
                </p>
            </div>

            {/* Mode selection */}
            {!mode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
                    <button
                        onClick={() => setMode('prd')}
                        className="group glass-card p-8 rounded-[2.5rem] text-left transition-all"
                    >
                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#3b82f6]/10 group-hover:border-[#3b82f6]/30 transition-all">
                            <FileText className="w-7 h-7 text-[#3b82f6]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Analizar PRD</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Copia tu documento de requisitos y deja que la IA extraiga el nombre, slug y cree el copy perfecto.
                        </p>
                    </button>

                    <button
                        onClick={() => setMode('manual')}
                        className="group glass-card p-8 rounded-[2.5rem] text-left transition-all"
                    >
                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#8b5cf6]/10 group-hover:border-[#8b5cf6]/30 transition-all">
                            <PenLine className="w-7 h-7 text-[#8b5cf6]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Creación Manual</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Escribe una breve descripción y nosotros generaremos el headline y subtítulo ideal para tu audiencia.
                        </p>
                    </button>
                </div>
            )}

            {/* PRD Mode */}
            {mode === 'prd' && !prdResult && (
                <div className="animate-fade-in glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <button
                        onClick={() => setMode(null)}
                        className="text-sm text-gray-500 hover:text-white transition-colors mb-8"
                    >
                        ← Cambiar método
                    </button>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Tu documento de producto
                            </label>
                            <textarea
                                value={prdText}
                                onChange={(e) => setPrdText(e.target.value)}
                                rows={10}
                                placeholder="Describe las funcionalidades, objetivos y público de tu idea..."
                                className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50 transition-colors resize-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handlePRDExtract}
                            disabled={loading || !prdText.trim()}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white rounded-2xl text-base font-bold transition-all shadow-lg shadow-[#3b82f6]/20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                            {loading ? 'Analizando con IA...' : 'Extraer copy con IA'}
                        </button>
                    </div>
                </div>
            )}

            {/* PRD Result preview */}
            {mode === 'prd' && prdResult && (
                <div className="animate-fade-in glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <button
                        onClick={() => setPrdResult(null)}
                        className="text-sm text-gray-500 hover:text-white transition-colors mb-8"
                    >
                        ← Editar documento original
                    </button>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-4 py-2 rounded-full w-fit mb-4">
                            <Sparkles className="w-4 h-4" />
                            PROUESTA GENERADA — REVISA LOS DETALLES
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['name', 'slug'].map((field) => (
                                <div key={field}>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                        {field === 'name' ? 'Nombre' : 'Slug'}
                                    </label>
                                    <input
                                        value={prdResult[field] || ''}
                                        onChange={(e) => setPrdResult({ ...prdResult, [field]: e.target.value })}
                                        className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
                                    />
                                </div>
                            ))}
                        </div>

                        {['headline', 'subtitle'].map((field) => (
                            <div key={field}>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    {field === 'headline' ? 'Headline' : 'Subtítulo'}
                                </label>
                                <textarea
                                    value={prdResult[field] || ''}
                                    onChange={(e) => setPrdResult({ ...prdResult, [field]: e.target.value })}
                                    rows={field === 'headline' ? 2 : 3}
                                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50 transition-colors resize-none"
                                />
                            </div>
                        ))}

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <button
                            onClick={handlePRDCreate}
                            disabled={loading}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white rounded-2xl text-base font-bold transition-all shadow-lg shadow-[#3b82f6]/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            {loading ? 'Configurando...' : 'Crear y Continuar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Manual Mode */}
            {mode === 'manual' && (
                <div className="animate-fade-in glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <button
                        onClick={() => setMode(null)}
                        className="text-sm text-gray-500 hover:text-white transition-colors mb-8"
                    >
                        ← Cambiar método
                    </button>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Nombre del proyecto
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: NutriTrack AI"
                                className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                ¿Qué estás construyendo?
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Describe tu proyecto brevemente. La IA usará esto para generar el copy."
                                className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50 resize-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
                                Color de identidad
                            </label>
                            <div className="flex flex-wrap gap-4 px-2">
                                {ACCENT_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setColor(c.value)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${color === c.value
                                            ? 'border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                            : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <button
                            onClick={handleManualCreate}
                            disabled={loading || !name.trim() || !description.trim()}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white rounded-2xl text-base font-bold transition-all shadow-lg shadow-[#3b82f6]/20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                            {loading ? 'Generando propuesta...' : 'Crear con Copy de IA'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
