import React, { useEffect, useState } from "react";
import axios from "axios";

const SharedDocuments = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchShared = async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/documents/shared", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(data);
    };
    fetchShared();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Shared With Me</h2>
      {documents.length === 0 ? (
        <p>No shared documents yet</p>
      ) : (
        documents.map((document) => (
          <div key={document._id} className="border p-4 mb-3 rounded-md bg-white">
            <h3 className="font-bold">{document.title}</h3>
            <p className="text-sm">{document.content.substring(0, 100)}...</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SharedDocuments;