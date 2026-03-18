import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, Sparkles, RefreshCw, Upload, X, Image as ImageIcon, Palette, Type, Layout as LayoutIcon } from 'lucide-react'
import { ACCENT_COLORS, generateSlug, processImage } from '../lib/utils'
import WaitlistPreview from '../components/WaitlistPreview'

export default function EditWaitlist() {
    const { id } = useParams()
    const waitlist = useQuery(api.waitlists.get, { id })
    const updateWaitlist = useMutation(api.waitlists.update)
    const generateUploadUrl = useMutation(api.waitlists.generateUploadUrl)
    const uploadLogo = useMutation(api.waitlists.uploadLogo)
    const removeLogoMutation = useMutation(api.waitlists.removeLogo)
    const generateWithTone = useAction(api.ai.generateWithTone)
    const refineCopy = useAction(api.ai.refineCopy)
    const generateCopy = useAction(api.ai.generateCopy)

    // General fields
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [slug, setSlug] = useState('')
    const [color, setColor] = useState('')
    const [logoUrl, setLogoUrl] = useState(null)

    // Copy fields
    const [headline, setHeadline] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [refineInput, setRefineInput] = useState('')

    // UI state
    const [savingGeneral, setSavingGeneral] = useState(false)
    const [savingCopy, setSavingCopy] = useState(false)
    const [generatingCopy, setGeneratingCopy] = useState(false)
    const [refining, setRefining] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [generalSaved, setGeneralSaved] = useState(false)
    const [copySaved, setCopySaved] = useState(false)
    const [error, setError] = useState('')
    const [activeTone, setActiveTone] = useState(null)

    // Initialize from loaded data
    useEffect(() => {
        if (waitlist) {
            setName(waitlist.name)
            setDescription(waitlist.description)
            setSlug(waitlist.slug)
            setColor(waitlist.color)
            setHeadline(waitlist.headline)
            setSubtitle(waitlist.subtitle)
            setLogoUrl(waitlist.logoUrl || null)
        }
    }, [waitlist])

    const handleSaveGeneral = async () => {
        setSavingGeneral(true)
        setError('')
        try {
            await updateWaitlist({ id, name, description, slug, color })
            setGeneralSaved(true)
            setTimeout(() => setGeneralSaved(false), 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSavingGeneral(false)
        }
    }

    const handleSaveCopy = async () => {
        setSavingCopy(true)
        setError('')
        try {
            await updateWaitlist({ id, headline, subtitle })
            setCopySaved(true)
            setTimeout(() => setCopySaved(false), 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSavingCopy(false)
        }
    }

    const handleRegenerate = async () => {
        setGeneratingCopy(true)
        setError('')
        try {
            const result = await generateCopy({ name, description })
            setHeadline(result.headline)
            setSubtitle(result.subtitle)
            setActiveTone(null)
        } catch (err) {
            setError('Error al regenerar el copy.')
        } finally {
            setGeneratingCopy(false)
        }
    }

    const handleTone = async (tone) => {
        setActiveTone(tone)
        setGeneratingCopy(true)
        setError('')
        try {
            const result = await generateWithTone({ name, description, tone })
            setHeadline(result.headline)
            setSubtitle(result.subtitle)
        } catch (err) {
            setError('Error al generar variación de tono.')
        } finally {
            setGeneratingCopy(false)
        }
    }

    const handleRefine = async () => {
        if (!refineInput.trim()) return
        setRefining(true)
        setError('')
        try {
            const result = await refineCopy({
                name,
                description,
                currentHeadline: headline,
                currentSubtitle: subtitle,
                instruction: refineInput.trim(),
            })
            setHeadline(result.headline)
            setSubtitle(result.subtitle)
            setRefineInput('')
        } catch (err) {
            setError('Error al refinar el copy.')
        } finally {
            setRefining(false)
        }
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
            const processedBlob = await processImage(file)
            const uploadUrl = await generateUploadUrl()
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'image/webp' },
                body: processedBlob,
            })
            const { storageId } = await response.json()
            await uploadLogo({ id, storageId })
            // Preview the uploaded image
            setLogoUrl(URL.createObjectURL(processedBlob))
        } catch (err) {
            setError('Error al subir el logo.')
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveLogo = async () => {
        try {
            await removeLogoMutation({ id })
            setLogoUrl(null)
        } catch (err) {
            setError('Error al eliminar el logo.')
        }
    }

    const handleDrop = useCallback(async (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (!file || !file.type.startsWith('image/')) return
        const fakeEvent = { target: { files: [file] } }
        handleLogoUpload(fakeEvent)
    }, [id])

    const tones = [
        { key: 'profesional', label: 'Profesional' },
        { key: 'casual', label: 'Casual' },
        { key: 'urgente', label: 'Urgente' },
        { key: 'amigable', label: 'Amigable' },
    ]

    if (waitlist === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" />
            </div>
        )
    }

    if (!waitlist) {
        return (
            <div className="text-center py-20 px-4">
                <div className="glass p-8 rounded-3xl max-w-sm mx-auto">
                    <p className="text-gray-400 mb-4">Waitlist no encontrada o eliminada</p>
                    <Link to="/dashboard" className="text-[#3b82f6] text-sm font-bold hover:underline">
                        Volver al dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <Link
                    to={`/waitlist/${id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al panel
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                        <Palette className="w-6 h-6 text-[#3b82f6]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Personaliza tu Página</h1>
                        <p className="text-sm text-gray-400 font-medium">Edita el copy, logo y colores de tu lista de espera.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 mb-8 flex items-center gap-3 text-sm text-red-400">
                    <X className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column — settings */}
                <div className="w-full lg:w-[45%] space-y-8">
                    {/* General Section */}
                    <div className="glass-card p-8 rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-8">
                            <LayoutIcon className="w-5 h-5 text-gray-400" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Diseño y General</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Nombre del proyecto</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 focus:border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Descripción para la IA</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="La IA usa esto para generar el copy perfecto..."
                                    className="w-full bg-white/[0.03] border border-white/5 focus:border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 resize-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Slug (URL)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs">/w/</span>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Color de acento</label>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {ACCENT_COLORS.map((c) => (
                                            <button
                                                key={c.value}
                                                onClick={() => setColor(c.value)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 ${color === c.value
                                                    ? 'border-white scale-110 shadow-lg'
                                                    : 'border-white/5 hover:border-white/20'
                                                    }`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Logo del proyecto</label>
                                {logoUrl ? (
                                    <div className="flex items-center gap-5 glass p-4 rounded-2xl">
                                        <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-xl" />
                                        <div>
                                            <p className="text-xs text-white font-bold mb-2">Logo Cargado</p>
                                            <button
                                                onClick={handleRemoveLogo}
                                                className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Eliminar Logo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className="group block border-2 border-dashed border-white/5 hover:border-[#3b82f6]/40 rounded-[2rem] p-8 text-center cursor-pointer hover:bg-[#3b82f6]/5 transition-all"
                                    >
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin mx-auto" />
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <ImageIcon className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <p className="text-xs font-bold text-white mb-1">Cargar nuevo logo</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Arrastra aquí o haz clic (JPG, PNG, WebP)</p>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>

                            <button
                                onClick={handleSaveGeneral}
                                disabled={savingGeneral}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 px-6 py-4 rounded-2xl text-sm font-extrabold transition-all shadow-xl"
                            >
                                {savingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {generalSaved ? '¡Configuración Guardada!' : 'Guardar Configuración'}
                            </button>
                        </div>
                    </div>

                    {/* Copy Section */}
                    <div className="glass-card p-8 rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-8">
                            <Type className="w-5 h-5 text-gray-400" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Textos y Copy AI</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Headline (Título)</label>
                                <textarea
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    rows={2}
                                    className="w-full bg-white/[0.03] border border-white/5 focus:border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 resize-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Subtítulo</label>
                                <textarea
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white/[0.03] border border-white/5 focus:border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 resize-none transition-all"
                                />
                            </div>

                            {/* Tone chips */}
                            <div>
                                <div className="flex items-center justify-between mb-3 ml-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Tono de voz</label>
                                    <span className="text-[10px] items-center gap-1 font-bold text-[#3b82f6] flex">
                                        <Sparkles className="w-3 h-3" />
                                        Generar con IA
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tones.map((t) => (
                                        <button
                                            key={t.key}
                                            onClick={() => handleTone(t.key)}
                                            disabled={generatingCopy}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeTone === t.key
                                                ? 'bg-[#3b82f6] border-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={generatingCopy}
                                        className="inline-flex items-center gap-1.5 bg-white/5 border border-white/5 hover:border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                    >
                                        {generatingCopy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                        Sorpréndeme
                                    </button>
                                </div>
                            </div>

                            {/* Refine */}
                            <div className="glass p-5 rounded-3xl border border-white/5">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Refinar con instrucciones</label>
                                <div className="flex gap-2">
                                    <input
                                        value={refineInput}
                                        onChange={(e) => setRefineInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                        placeholder="Ej: Hazlo más divertido..."
                                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/40 transition-all"
                                    />
                                    <button
                                        onClick={handleRefine}
                                        disabled={refining || !refineInput.trim()}
                                        className="flex-shrink-0 inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] border border-[#3b82f6]/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        Refinar
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveCopy}
                                disabled={savingCopy}
                                className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white px-6 py-4 rounded-2xl text-sm font-extrabold transition-all shadow-xl shadow-[#3b82f6]/20"
                            >
                                {savingCopy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {copySaved ? '¡Textos Guardados!' : 'Guardar Textos'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right column — Preview */}
                <div className="w-full lg:w-[55%] lg:sticky lg:top-24 lg:self-start">
                    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-10 bg-white/[0.04] border-b border-white/10 flex items-center px-6 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/30" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/30" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400/30" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-auto">Vista Previa en Vivo</span>
                        </div>
                        <div className="mt-10">
                            <WaitlistPreview
                                name={name}
                                headline={headline}
                                subtitle={subtitle}
                                color={color}
                                logoUrl={logoUrl}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3 justify-center text-gray-500 text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Los cambios se reflejan instantáneamente en la preview
                    </div>
                </div>
            </div>
        </div>
    )
}
