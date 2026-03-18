import { usePaginatedQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useParams, Link } from 'react-router-dom'
import { Copy, Check, ExternalLink, Pencil, Users, CalendarDays, TrendingUp, Download, Loader2, ArrowLeft, Share2 } from 'lucide-react'
import { useState } from 'react'
import { getPublicUrl, copyToClipboard, formatDateTime, downloadTextFile } from '../lib/utils'
import { useWaitlist, useWaitlistStats } from '../lib/queries'

function StatCard({ icon: Icon, label, value, color = '#3b82f6' }) {
    return (
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-12 -mt-12 opacity-10" style={{ backgroundColor: color }} />
            <div className="flex items-center gap-4 mb-4 relative z-10">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5"
                    style={{ backgroundColor: `${color}10` }}
                >
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-3xl font-extrabold text-white relative z-10">{value ?? '—'}</p>
        </div>
    )
}

export default function WaitlistDetail() {
    const { id } = useParams()
    const waitlist = useWaitlist(id)
    const stats = useWaitlistStats(id)
    const { results: subscribers, status, loadMore } = usePaginatedQuery(
        api.subscribers.listByWaitlist,
        { waitlistId: id },
        { initialNumItems: 50 }
    )
    const exportCsv = useAction(api.subscribers.exportCsv)

    const [copied, setCopied] = useState(false)
    const [exporting, setExporting] = useState(false)

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

    const publicUrl = getPublicUrl(waitlist.slug)
    const total = stats?.total
    const today = stats?.today
    const thisWeek = stats?.thisWeek

    const handleCopy = async () => {
        const success = await copyToClipboard(publicUrl)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleExport = async () => {
        if (!waitlist) return
        setExporting(true)
        try {
            const result = await exportCsv({ waitlistId: waitlist._id, maxRows: 10000 })
            downloadTextFile(result.csv, `${waitlist.slug}-subscribers.csv`, 'text/csv;charset=utf-8')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 animate-fade-in">
            {/* Back */}
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Panel de control
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    {waitlist.logoUrl ? (
                        <img
                            src={waitlist.logoUrl}
                            alt={waitlist.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-white/10 flex-shrink-0 shadow-2xl"
                        />
                    ) : (
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-2xl shadow-2xl border border-white/5"
                            style={{ backgroundColor: waitlist.color }}
                        >
                            {waitlist.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-3xl font-extrabold text-white truncate tracking-tight mb-2">{waitlist.name}</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors glass px-3 py-1.5 rounded-full border border-white/5"
                            >
                                <span className="truncate max-w-[140px] sm:max-w-[300px]">{publicUrl}</span>
                                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link
                        to={`/waitlist/${id}/edit`}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                        Personalizar
                    </Link>
                    <a
                        href={`/w/${waitlist.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[#3b82f6]/20"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Ver Página
                    </a>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard icon={Users} label="Total suscriptores" value={total} />
                <StatCard icon={CalendarDays} label="Nuevos hoy" value={today} color="#22c55e" />
                <StatCard icon={TrendingUp} label="Crecimiento semanal" value={thisWeek} color="#f59e0b" />
            </div>

            {/* Subscribers Table */}
            <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Lista de Emails</h2>
                    </div>
                    {subscribers && subscribers.length > 0 && (
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors glass px-4 py-2 rounded-xl border border-white/5 disabled:opacity-60"
                        >
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {exporting ? 'Exportando...' : 'Exportar CSV'}
                        </button>
                    )}
                </div>

                {status === 'LoadingFirstPage' ? (
                    <div className="px-8 py-12 flex justify-center">
                        <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" />
                    </div>
                ) : subscribers.length === 0 ? (
                    <div className="px-8 py-20 text-center">
                        <div className="w-16 h-16 glass border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Share2 className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Sin suscriptores aún</h3>
                        <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
                            ¡Es hora de compartir tu proyecto con el mundo! Copia el link y empieza a crecer.
                        </p>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? 'Link Copiado' : 'Copiar Link Público'}
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-left">
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                        Usuario / Email
                                    </th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                        Fecha de Registro
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {subscribers.map((sub) => (
                                    <tr key={sub._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5 text-sm font-medium text-gray-200">{sub.email}</td>
                                        <td className="px-8 py-5 text-sm text-gray-500">{formatDateTime(sub.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {status === 'CanLoadMore' && (
                            <div className="px-8 py-6 flex justify-center">
                                <button
                                    onClick={() => loadMore(50)}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors glass px-4 py-2 rounded-xl border border-white/5"
                                >
                                    Cargar más
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
