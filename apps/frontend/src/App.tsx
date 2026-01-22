import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Profile from "./pages/Profile";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import CVEs from "./pages/CVEs";

export default function App() {
    return (
        <Layout>
            <Routes>
                {/* public */}
                <Route path="/login" element={<Login />} />

                {/* protected */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/events"
                    element={
                        <ProtectedRoute>
                            <Events />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <Alerts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/incidents"
                    element={
                        <ProtectedRoute>
                            <Incidents />
                        </ProtectedRoute>
                    }
                />

                {/* ✅ CVEs */}
                <Route
                    path="/cves"
                    element={
                        <ProtectedRoute>
                            <CVEs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}
