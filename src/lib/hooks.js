import { useConvexAuth as useConvexAuthOriginal } from 'convex/react'

const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
const allowGuest = import.meta.env.VITE_ENABLE_GUEST === 'true';

/**
 * Hook seguro: solo llama a Convex si la URL está configurada.
 */
export function useConvexAuth() {
    // Check if we are in guest mode (stored in localStorage)
    const isGuest = allowGuest && typeof window !== 'undefined' && localStorage.getItem('simplewaitlist_guest') === 'true';

    if (!hasConvex) {
        return { isAuthenticated: false, isLoading: false, isGuest: false };
    }

    // Wrap the original hook
    const auth = useConvexAuthOriginal();

    // If we are in guest mode, we force authenticated state
    if (isGuest) {
        return { isAuthenticated: true, isLoading: false, isGuest: true };
    }

    return { ...auth, isGuest: false };
}
