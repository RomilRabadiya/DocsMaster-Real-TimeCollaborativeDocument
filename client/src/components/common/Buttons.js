import React from "react";

function Button({ text, type = "button", onClick, style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: "10px 20px",
        margin: "5px 0",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        ...style, // allow custom inline styles
      }}
    >
      {text}
    </button>
  );
}

export default Button;