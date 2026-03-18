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

export default function App() {
    return (
        <Routes>
            {/* Public waitlist page — no layout wrapper */}
            <Route path="/w/:slug" element={<PublicWaitlist />} />

            {/* App pages with layout */}
            <Route element={<Layout />}>
                {/* Public pages */}
                <Route path="/" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />

                {/* Protected pages */}
                <Route element={<AuthGuard />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create" element={<CreateWaitlist />} />
                    <Route path="/waitlist/:id" element={<WaitlistDetail />} />
                    <Route path="/waitlist/:id/edit" element={<EditWaitlist />} />
                </Route>
            </Route>
        </Routes>
    )
}
