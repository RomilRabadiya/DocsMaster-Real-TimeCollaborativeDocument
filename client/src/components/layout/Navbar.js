import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Buttons";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #1e3a8a, #2563eb)", // blue gradient
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left Logo/Brand */}
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "700",
          letterSpacing: "0.5px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        📒 DocsMaster
      </h1>

      {/* Right Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Button
          text="🗂️ Shared"

          /*Get shared document*/
          onClick={() => navigate("/shared")}
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "500",
          }}
        />
        <Button
          text="🏠 Dashboard"
          /*Go to Dashboard*/
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "500",
          }}
        />
        <Button
          text="🚪 Logout"
          /*Logout Function Define in Pages(Dashboard docsboard*/
          onClick={onLogout}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "500",
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;