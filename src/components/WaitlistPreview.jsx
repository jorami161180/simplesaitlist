import { Mail } from 'lucide-react'

/**
 * Live preview component that replicates the public waitlist page.
 * Used in the EditWaitlist page to show real-time changes.
 */
export default function WaitlistPreview({ name, headline, subtitle, color, logoUrl }) {
    const accentColor = color || '#3b82f6'

    return (
        <div className="bg-[#0a0a0a] min-h-[500px] flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full blur-[100px] opacity-10 pointer-events-none"
                style={{ backgroundColor: accentColor }}
            />

            <div className="w-full max-w-sm text-center relative z-10">
                {/* Logo */}
                {logoUrl && (
                    <div className="mb-6 flex justify-center">
                        <img
                            src={logoUrl}
                            alt={name || 'Logo'}
                            className="w-16 h-16 rounded-full object-cover border-2"
                            style={{ borderColor: `${accentColor}30` }}
                        />
                    </div>
                )}

                {/* Project name */}
                <p className="text-[10px] font-medium uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                    {name || 'Tu Proyecto'}
                </p>

                {/* Headline */}
                <h2 className="text-xl font-extrabold text-[#f5f5f5] leading-tight mb-3">
                    {headline || 'Tu headline aparecerá aquí'}
                </h2>

                {/* Subtitle */}
                <p className="text-sm text-[#a3a3a3] leading-relaxed mb-8 max-w-xs mx-auto">
                    {subtitle || 'Tu subtítulo aparecerá aquí'}
                </p>

                {/* Fake form */}
                <div className="space-y-2.5">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a3a3a3]/50" />
                        <div
                            className="w-full bg-[#141414] border rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#a3a3a3]/40 text-left"
                            style={{ borderColor: '#262626' }}
                        >
                            tu@email.com
                        </div>
                    </div>
                    <div
                        className="w-full py-2.5 rounded-lg text-xs font-semibold text-white text-center"
                        style={{ backgroundColor: accentColor }}
                    >
                        Unirme a la lista de espera
                    </div>
                </div>

                <p className="text-[8px] text-[#a3a3a3]/30 mt-6">
                    Hecho con SimpleWaitlist
                </p>
            </div>
        </div>
    )
}
