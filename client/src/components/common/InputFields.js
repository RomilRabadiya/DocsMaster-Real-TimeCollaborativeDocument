import React from "react";

function InputField({ type, value, onChange, placeholder, required, className, style }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={className}
      style={{ margin: "5px", padding: "8px", ...style }}
    />
  );
}

export default InputField;