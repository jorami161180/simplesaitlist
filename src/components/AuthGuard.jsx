import { useConvexAuth } from '../lib/hooks'
import { Outlet, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function AuthGuard() {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
