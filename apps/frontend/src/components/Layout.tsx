import Nav from "./Nav";

type LayoutProps = {
    children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    return (
        <div style={{ fontFamily: "system-ui, Arial", color: "#111", minHeight: "100vh" }}>
            <Nav />
            <main style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>{children}</main>
        </div>
    );
}
