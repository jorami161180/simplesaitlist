import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateWaitlist from './pages/CreateWaitlist'
import WaitlistDetail from './pages/WaitlistDetail'
import EditWaitlist from './pages/EditWaitlist'
import PublicWaitlist from './pages/PublicWaitlist'
import Debug from './pages/Debug'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout><Landing /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/debug" element={<Layout><Debug /></Layout>} />
            <Route path="/dashboard" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
            <Route path="/create" element={<AuthGuard><Layout><CreateWaitlist /></Layout></AuthGuard>} />
            <Route path="/waitlist/:id" element={<AuthGuard><Layout><WaitlistDetail /></Layout></AuthGuard>} />
            <Route path="/waitlist/:id/edit" element={<AuthGuard><Layout><EditWaitlist /></Layout></AuthGuard>} />
            <Route path="/w/:slug" element={<PublicWaitlist />} />
        </Routes>
    )
}
