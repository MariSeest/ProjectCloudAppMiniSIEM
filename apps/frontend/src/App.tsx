import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import Alerts from './pages/Alerts'
import RiskPredictor from './pages/RiskPredictor'
import { AlertDetail } from './pages/AlertDetail'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import CorrelationWorkspace from './pages/CorrelationWorkspace'
import AuditLog from './pages/AuditLog'
import AcnReports from './pages/AcnReports'
import UserManagement from './pages/UserManagement'
import CVEs from './pages/CVEs'
import { FalxdrEndpoints } from './pages/FalxdrEndpoints'
import { FalxdrEndpointDetail } from './pages/FalxdrEndpointDetail'
import AssetDiscovery from './pages/AssetDiscovery'
import IdentityManagement from './pages/IdentityManagement'
import ArchivedTickets from './pages/ArchivedTickets'
import CyberNews from './pages/CyberNews'

function PR({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PR><Dashboard /></PR>} />
                <Route path="/events" element={<PR><Events /></PR>} />
                <Route path="/events/:id" element={<PR><EventDetail /></PR>} />
                <Route path="/alerts" element={<PR><Alerts /></PR>} />
                <Route path="/alerts/:id" element={<PR><AlertDetail /></PR>} />
                <Route path="/incidents" element={<PR><Incidents /></PR>} />
                <Route path="/incidents/:id" element={<PR><IncidentDetail /></PR>} />
                <Route path="/correlate" element={<PR><CorrelationWorkspace /></PR>} />
                <Route path="/cves" element={<PR><CVEs /></PR>} />
                <Route path="/falxdr" element={<PR><FalxdrEndpoints /></PR>} />
                <Route path="/falxdr/:id" element={<PR><FalxdrEndpointDetail /></PR>} />
                <Route path="/discovery" element={<PR><AssetDiscovery /></PR>} />
                <Route path="/identity" element={<PR><IdentityManagement /></PR>} />
                <Route path="/news" element={<PR><CyberNews /></PR>} />
                <Route path="/risk" element={<PR><RiskPredictor /></PR>} />
                <Route path="/acn" element={<PR><AcnReports /></PR>} />
                <Route path="/audit" element={<PR><AuditLog /></PR>} />
                <Route path="/users" element={<PR><UserManagement /></PR>} />
                <Route path="/tickets/archived" element={<PR><ArchivedTickets /></PR>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    )
}