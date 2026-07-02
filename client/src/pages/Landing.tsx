import { useNavigate } from "react-router";

function Landing() {
    const navigate = useNavigate();

    return (
        <>
            <h1>Landing Page</h1>
            <p> About app</p>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
        </>
    );
}

export default Landing;
