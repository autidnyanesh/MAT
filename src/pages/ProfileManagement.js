import React, { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaUserPlus, FaUserSlash, FaUserCheck, FaSpinner, FaSearch } from "react-icons/fa";

function ProfileManagement() {

  const [activeTab, setActiveTab] = useState("profile");
  const [ein, setEin] = useState("");
  const [fetchingEin, setFetchingEin] = useState(false);

  const [userData, setUserData] = useState(null);

  const [fetchError, setFetchError] = useState("");

  const [profileData] = useState({
    userInfo: {
      ein: "123456",
      name: "Dnyanesh Auti",
      role: "DCO",
      sol: "1234",
      adminRights: true,
      lastLogin: "11-Jun-2026 09:15 AM",
      status: "ACTIVE"
    }
  });

  const [users] = useState([
    {
      ein: "100001",
      name: "ABC User",
      role: "DCO",
      sol: "1234",
      status: "ACTIVE"
    },
    {
      ein: "100002",
      name: "XYZ User",
      role: "DCO",
      sol: "1234",
      status: "INACTIVE"
    },
    {
      ein: "100003",
      name: "PQR User",
      role: "BOA",
      sol: "5678",
      status: "ACTIVE"
    },
    {
      ein: "100004",
      name: "Test User",
      role: "DBD",
      sol: "7890",
      status: "ACTIVE"
    },
    {
      ein: "100005",
      name: "Demo User",
      role: "DCO",
      sol: "1234",
      status: "ACTIVE"
    }
  ]);


  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const recordsPerPage = 5;

  const canManageUsers =
    profileData.userInfo.role === "DCO" &&
    profileData.userInfo.adminRights;

  const filteredUsers = useMemo(() => {

    return users.filter(user => {

      const searchMatch =
        user.ein.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase());

      const roleMatch =
        roleFilter === "" ||
        user.role === roleFilter;

      return searchMatch && roleMatch;
    });

  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(
    filteredUsers.length / recordsPerPage
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // axios.get("/api/profile-management")
  //    .then(res => {
  //        setProfileData(res.data);
  //        setUsers(res.data.users);
  //    });

  const fetchUserDetails = async () => {

    if (!ein.trim()) {

      setFetchError("Please enter EIN");
      return;

    }

    try {

      setFetchingEin(true);
      setFetchError("");

      // API

      /*
      const response = await axios.get(
          `/api/user/${ein}`
      );

      setUserData(response.data);
      */

      // Sample Data

      setTimeout(() => {

        setUserData({
          ein: ein,
          name: "Dnyanesh Auti",
          role: "DCO",
          sol: "1234",
          status: "ACTIVE",
          email: "test@sbi.co.in"
        });

        setShowUserPopup(true);

        setFetchingEin(false);

      }, 1000);

    } catch {
      setFetchError(
        "User not found"
      );
      setFetchingEin(false);
    }
  };
  return (
    <div className="container-fluid p-2">
      <nav aria-label="breadcrumb" className="mb-1">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active">
            Profile Management
          </li>
        </ol>
      </nav>
      <hr style={{ marginTop: "2px" }} />
      <div className="card shadow-sm border-0 mb-1">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-3">
              <label className="form-label">
                EIN
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "8px"
                }}
              >

                <input
                  type="text"
                  className="form-control"
                  value={ein}
                  onChange={(e) =>
                    setEin(e.target.value)
                  }
                />

                <button
                  className="btn btn-outline-primary"
                  onClick={fetchUserDetails}
                  disabled={fetchingEin}
                >

                  {fetchingEin ? (
                    <FaSpinner className="spin" />
                  ) : (
                    <FaSearch />
                  )}

                </button>

              </div>

              {fetchError && (

                <div className="text-danger small mt-1">
                  {fetchError}
                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white fw-semibold">
          User List
        </div>

        <div className="table-responsive p-3">
          <table
            className="table table-bordered table-hover table-sm mb-0"
            style={{ fontSize: "14px" }}
          >
            <thead className="table-light">
              <tr>
                <th>EIN</th>
                <th>Name</th>
                <th>Role</th>
                <th>SOL</th>
                <th>Status</th>
                <th width="120">
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {paginatedUsers.map(user => (

                <tr key={user.ein}>

                  <td>{user.ein}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.sol}</td>

                  <td>

                    <span
                      className={`badge ${user.status === "ACTIVE"
                        ? "bg-success"
                        : "bg-danger"
                        }`}
                    >
                      {user.status}
                    </span>

                  </td>

                  <td>

                    <div className="d-flex gap-1">

                      <button
                        className="btn btn-outline-primary btn-sm"
                        title="Modify"
                      >
                        <FaEdit />
                      </button>

                      {user.status === "ACTIVE" ? (

                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Deactivate"
                        >
                          <FaUserSlash />
                        </button>

                      ) : (

                        <button
                          className="btn btn-outline-success btn-sm"
                          title="Activate"
                        >
                          <FaUserCheck />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <nav className="mt-3">

        <ul className="pagination pagination-sm justify-content-end">

          <li
            className={`page-item ${currentPage === 1 ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
            >
              Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, index) => (

            <li
              key={index}
              className={`page-item ${currentPage === index + 1
                ? "active"
                : ""
                }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </button>
            </li>

          ))}

          <li
            className={`page-item ${currentPage === totalPages
              ? "disabled"
              : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
            >
              Next
            </button>
          </li>

        </ul>

      </nav>

      {showUserPopup && userData && (

        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  User Details
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setShowUserPopup(false)
                  }
                />

              </div>

              <div className="modal-body">

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>EIN</th>
                      <td>{userData.ein}</td>
                    </tr>

                    <tr>
                      <th>Name</th>
                      <td>{userData.name}</td>
                    </tr>

                    <tr>
                      <th>Email</th>
                      <td>{userData.email}</td>
                    </tr>

                    <tr>
                      <th>Role</th>
                      <td>{userData.role}</td>
                    </tr>

                    <tr>
                      <th>SOL</th>
                      <td>{userData.sol}</td>
                    </tr>

                  </tbody>

                </table>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-success"
                >
                  <FaUserPlus className="me-2" />
                  Add User
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowUserPopup(false)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ProfileManagement;