import { useState } from 'react'
import { useConvexAuth as useConvexAuthOriginal } from 'convex/react'

const hasConvex = !!import.meta.env.VITE_CONVEX_URL;
const allowGuest = import.meta.env.VITE_ENABLE_GUEST === 'true';

/**
 * Hook seguro: intenta usar Convex si está disponible, si no, devuelve un estado neutral.
 */
export function useConvexAuth() {
    let convexAuth = { isAuthenticated: false, isLoading: false };
    
    // Solo intentamos usar el hook de Convex si tenemos la URL
    // y estamos dentro del proveedor (que manejamos en main.jsx)
    try {
        if (hasConvex) {
            convexAuth = useConvexAuthOriginal();
        }
    } catch (e) {
        // Fallback silencioso si el proveedor no está listo
    }

    // Estado de invitado (independiente de Convex)
    const isGuestActive = allowGuest && typeof window !== 'undefined' && localStorage.getItem('simplewaitlist_guest') === 'true';

    if (isGuestActive) {
        return { isAuthenticated: true, isLoading: false, isGuest: true };
    }

    return { 
        isAuthenticated: convexAuth.isAuthenticated, 
        isLoading: convexAuth.isLoading, 
        isGuest: false 
    };
}
