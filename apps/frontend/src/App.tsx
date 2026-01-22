import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/events" element={<Events />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/incidents" element={<Incidents />} />
            </Routes>
        </Layout>
    );
}
