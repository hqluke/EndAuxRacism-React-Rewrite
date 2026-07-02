import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { spotifyLogin, appleLogin } from "../api/user";
import { getApiError } from "../api/error";
import { useNavigate } from "react-router";

function Login() {
    const navigate = useNavigate();
    const { error, setError, setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmitApple = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
            const user = await appleLogin({ email, password });
            setUser(user);
            navigate("/");
        } catch (err) {
            setError(getApiError(err, "Login failed"));
        }
    };

    return (
        <>
            {error && <h1>{error}</h1>}
            <h1>Login</h1>
            <form onSubmit={handleSubmitApple}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <h4> Or login with Spotify</h4>
            <button onClick={spotifyLogin}>Login with Spotify</button>
        </>
    );
}

export default Login;
