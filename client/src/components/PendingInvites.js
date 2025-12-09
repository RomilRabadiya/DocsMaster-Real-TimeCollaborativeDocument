import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingInvites = () => {
  const [invites, setInvites] = useState([]);

  const fetchInvites = async () => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get("/api/share/invites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setInvites(data);
  };

  const handleAction = async (documentId, action) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `/api/share/${action}`,
      { documentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchInvites();
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
      {invites.length === 0 ? (
        <p>No pending invites</p>
      ) : (
        invites.map((invite) => (
          <div
            key={invite._id}
            className="border p-4 mb-3 rounded-md bg-gray-50 flex justify-between"
          >
            <div>
              <p className="font-bold">{invite.title}</p>
              <p className="text-sm">
                Shared by: {invite.user?.email || "Unknown"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(invite._id, "accept")}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleAction(invite._id, "reject")}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PendingInvites;