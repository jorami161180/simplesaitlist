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

    // Forzamos isLoading a false después de 5 segundos para evitar bloqueos
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Si somos invitados, forzamos el estado de autenticado para las rutas protegidas
    if (isGuest) {
        return { isAuthenticated: true, isLoading: false, isGuest: true };
    }

    // De lo contrario, usamos el estado real de Convex
    return {
        isAuthenticated: auth.isAuthenticated,
        isLoading: (hasConvexUrl && !timedOut) ? auth.isLoading : false,
        isGuest: false
    };
}

// Hook seguro para acciones de autenticación que no crashean si falta el contexto
export function useSafeAuth() {
    try {
        const { signIn, signOut } = useAuthActions();
        return { signIn, signOut };
    } catch (e) {
        console.warn("Auth context not found, using dummy auth actions");
        return {
            signIn: () => Promise.reject("Convex not configured"),
            signOut: () => Promise.resolve()
        };
    }
}
