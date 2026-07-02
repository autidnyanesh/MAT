import React from "react";

function DeleteUser() {
  return (
    <div className="card">
      <h2>Delete User</h2>

      <input placeholder="Select User" />

      <button style={{ background: "red" }}>Delete</button>
    </div>
  );
}

export default DeleteUser;