import { useConvexAuth as useConvexAuthOriginal } from 'convex/react'

const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
const allowGuest = import.meta.env.VITE_ENABLE_GUEST === 'true';

/**
 * Hook seguro: siempre invoca useConvexAuthOriginal para respetar las Rules of Hooks.
 * Solo usa el resultado si Convex está configurado.
 */
export function useConvexAuth() {
    // IMPORTANT: must always be called first — React Rules of Hooks
    const auth = useConvexAuthOriginal();

    // Check if we are in guest mode (stored in localStorage)
    const isGuest = allowGuest && typeof window !== 'undefined' && localStorage.getItem('simplewaitlist_guest') === 'true';

    if (!hasConvex) {
        return { isAuthenticated: false, isLoading: false, isGuest: false };
    }

    // If we are in guest mode, force authenticated state
    if (isGuest) {
        return { isAuthenticated: true, isLoading: false, isGuest: true };
    }

    return { ...auth, isGuest: false };
}
