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

    // Forzamos isLoading a false después de 5 segundos para evitar bloqueos
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    // De lo contrario, usamos el estado real de Convex
    return {
        isAuthenticated: auth.isAuthenticated,
        isLoading: (hasConvexUrl && !timedOut) ? auth.isLoading : false,
        isGuest: false
    };
}
