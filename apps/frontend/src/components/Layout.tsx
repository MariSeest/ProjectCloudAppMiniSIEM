import TopBar from "./TopBar";
import SideNav from "./SideNav";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    return (
        <div className="app-shell">
            <TopBar />

            {/* se non loggato, niente sidenav e layout a due colonne */}
            {user ? (
                <div className="main">
                    <SideNav />
                    <div className="content">{children}</div>
                </div>
            ) : (
                <div className="content">{children}</div>
            )}
        </div>
    );
}
