import React, { useState } from "react";
import axios from "axios";

const ShareByEmail = ({ documentId }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "/api/share/share",
        { documentId, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sharing document");
    }
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow-md">
      <h2 className="font-semibold mb-2">Share Document by Email</h2>
      <input
        type="email"
        placeholder="Enter email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-2 py-1 w-full mb-2"
      />
      <button
        onClick={handleShare}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Share
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
};

export default ShareByEmail;
