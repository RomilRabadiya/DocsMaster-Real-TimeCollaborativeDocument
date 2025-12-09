import React, { useState } from "react";
import { loginUser } from "../api/authApis";
import InputField from "../components/common/InputFields";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginUser({ email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            alert("Login successful!");
            navigate("/dashboard");
        }
        catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <InputField type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <br />
                <InputField type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <br />
                <button type="submit">Login</button>
                <button type="button" onClick={() => navigate('/register')}>Register</button>
            </form>
        </div>
    );
}

export default Login;