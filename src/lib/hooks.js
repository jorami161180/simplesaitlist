import { useState, useEffect } from 'react'
import { useConvexAuth as useConvexAuthOriginal } from 'convex/react'

const hasConvexUrl = !!import.meta.env.VITE_CONVEX_URL;
const allowGuest = import.meta.env.VITE_ENABLE_GUEST === 'true';

/**
 * Hook seguro para autenticación.
 */
export function useConvexAuth() {
    // Siempre llamamos al hook original para cumplir las Rules of Hooks.
    // Si no hay provider, esto podría fallar, pero main.jsx ahora siempre pone uno.
    const auth = useConvexAuthOriginal();

    // Estado local para el invitado (persistencia simple)
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        if (allowGuest && typeof window !== 'undefined') {
            const guestStatus = localStorage.getItem('simplewaitlist_guest') === 'true';
            setIsGuest(guestStatus);
        }
    }, []);

    // Si somos invitados, forzamos el estado de autenticado para las rutas protegidas
    if (isGuest) {
        return { isAuthenticated: true, isLoading: false, isGuest: true };
    }

    // De lo contrario, usamos el estado real de Convex
    // Pero si no hay URL configurada, forzamos isLoading: false para que la UI no se bloquee
    return {
        isAuthenticated: auth.isAuthenticated,
        isLoading: hasConvexUrl ? auth.isLoading : false,
        isGuest: false
    };
}
