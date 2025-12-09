import React, { useState } from "react";
import { registerUser } from "../api/authApis";
import InputField from "../components/common/InputFields";
import Button from "../components/common/Buttons";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser({ name, email, password });
            if (response) {
                alert("User registered successfully!");
                // Clear the form
                setName("");
                setEmail("");
                setPassword("");
                // Use setTimeout to ensure the alert is shown before navigation
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            }
        }
        catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <InputField
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                />
                <br />

                <InputField
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <br />

                <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <br />

                <Button text="Register" type="submit" />
            </form>
        </div>
    );
}

export default Register;