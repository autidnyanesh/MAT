import React from "react";

function ActivateUser() {
  return (
    <div className="card">
      <h2>Activate User</h2>

      <input placeholder="Select User" />

      <button style={{ background: "green" }}>Activate</button>
    </div>
  );
}

export default ActivateUser;