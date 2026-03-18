import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Link } from 'react-router-dom'
import { Plus, Rocket, Users, Copy, Check, LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { getPublicUrl, copyToClipboard } from '../lib/utils'

function WaitlistCard({ waitlist }) {
    const [copied, setCopied] = useState(false)
    const publicUrl = getPublicUrl(waitlist.slug)

    const handleCopy = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const success = await copyToClipboard(publicUrl)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Link
            to={`/waitlist/${waitlist._id}`}
            className="group glass-card p-6 rounded-[2rem] block relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#3b82f6]/10 transition-colors" />

            <div className="flex items-start gap-5 mb-6 relative z-10">
                {waitlist.logoUrl ? (
                    <img
                        src={waitlist.logoUrl}
                        alt={waitlist.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0 shadow-lg"
                    />
                ) : (
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-lg border border-white/5"
                        style={{ backgroundColor: waitlist.color }}
                    >
                        {waitlist.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-[#3b82f6] transition-colors tracking-tight">
                        {waitlist.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                {waitlist.subscriberCount} {waitlist.subscriberCount === 1 ? 'suscriptor' : 'suscriptores'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-4 py-3 border border-white/5 relative z-10 group/url overflow-hidden">
                <span className="text-xs text-gray-500 truncate flex-1 font-medium">{publicUrl}</span>
                <button
                    onClick={handleCopy}
                    className="flex-shrink-0 text-gray-500 hover:text-[#3b82f6] transition-colors p-1"
                    title="Copiar link"
                >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
        </Link>
    )
}

export default function Dashboard() {
    const waitlists = useQuery(api.waitlists.list)

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 animate-fade-in">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                            <LayoutGrid className="w-5 h-5 text-[#3b82f6]" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Mis Proyectos</h1>
                    </div>
                    <p className="text-gray-400 text-base">Gestiona el crecimiento de tus listas de espera</p>
                </div>
                <Link
                    to="/create"
                    className="inline-flex items-center gap-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-3.5 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#3b82f6]/20"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Waitlist
                </Link>
            </div>

            {/* Loading */}
            {waitlists === undefined && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass rounded-[2rem] p-8 animate-pulse border border-white/5">
                            <div className="flex items-start gap-5 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-white/5" />
                                <div className="flex-1 space-y-3 pt-2">
                                    <div className="h-5 bg-white/5 rounded-full w-3/4" />
                                    <div className="h-4 bg-white/5 rounded-full w-1/2" />
                                </div>
                            </div>
                            <div className="h-12 bg-black/40 rounded-xl border border-white/5" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {waitlists && waitlists.length === 0 && (
                <div className="text-center py-24 animate-fade-in glass rounded-[3rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#3b82f6]/5 rounded-full blur-[100px] -mt-32" />

                    <div className="w-20 h-20 glass border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10">
                        <Rocket className="w-10 h-10 text-[#3b82f6] fill-[#3b82f6]/10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight relative z-10">Tu dashboard está listo</h2>
                    <p className="text-gray-400 mb-10 max-w-md mx-auto leading-relaxed relative z-10">
                        Describe tu próxima gran idea y deja que la IA se encargue de crear una landing page irresistible.
                    </p>
                    <Link
                        to="/create"
                        className="inline-flex items-center gap-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] shadow-xl shadow-[#3b82f6]/20 relative z-10"
                    >
                        <Plus className="w-5 h-5" />
                        Crear mi primera lista
                    </Link>
                </div>
            )}

            {/* Grid */}
            {waitlists && waitlists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {waitlists.map((w) => (
                        <WaitlistCard key={w._id} waitlist={w} />
                    ))}
                </div>
            )}
        </div>
    )
}
