import React from "react";

//UserDetailsCard component to display user information
const UserDetailsCard = ({ user }) => {
  if (!user) return null;

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #ddd",
      }}
    >
      <h2 style={{ margin: "0 0 10px 0" }}>👤 User Details</h2>
      <p>
        <b>Name:</b> {user.name}
      </p>
      <p>
        <b>Email:</b> {user.email}
      </p>
    </div>
  );
};

export default UserDetailsCard;