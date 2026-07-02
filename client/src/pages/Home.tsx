import { useAuth } from "../context/AuthContext";
import Landing from "./Landing";

function Home() {
    const { user, loading, error, logout } = useAuth();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Landing />;

    return (
        <>
            <h1>Home</h1>
            {user.provider === "spotify" ? (
                <h2>Spotify: {user.username ?? user.id}</h2>
            ) : (
                <h2>Apple: {user.username ?? user.id}</h2>
            )}
            {error && <h1>{error}</h1>}
            <button onClick={logout}>Logout</button>
        </>
    );
}

export default Home;
