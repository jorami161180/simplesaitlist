import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useWaitlists() {
    return useQuery(api.waitlists.list)
}

export function useWaitlist(id) {
    return useQuery(api.waitlists.get, id ? { id } : 'skip')
}

export function useWaitlistStats(waitlistId) {
    return useQuery(api.subscribers.stats, waitlistId ? { waitlistId } : 'skip')
}
