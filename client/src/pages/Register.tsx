import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { register } from "../api/user";
import { getApiError } from "../api/error";
import { useNavigate } from "react-router";

function Register() {
    const navigate = useNavigate();
    const { error, setError, setUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
            const user = await register({ username, password, email });
            setUser(user);
            navigate("/");
        } catch (err) {
            setError(getApiError(err, "Signup failed"));
        }
    };

    return (
        <>
            {error && <h1>{error}</h1>}
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
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
                <button type="submit">Register</button>
            </form>
        </>
    );
}

export default Register;
