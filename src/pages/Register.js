import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/login.css";
import { FaSearch, FaSpinner } from "react-icons/fa";

axios.defaults.withCredentials = true;

function Register({ goToLogin }) {
  const [ein, setEin] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [supervisorFetching, setSupervisorFetching] = useState(false);
  const [supervisorFetched, setSupervisorFetched] = useState(false);
  const [supervisorFetchError, setSupervisorFetchError] = useState("");
  const [regFetchError, setRegFetchError] = useState("");

  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  const [form, setForm] = useState({
    ein:"",
    fullName: "",
    position: "",
    grade: "",
    supervisorEin: "",
    supervisorName: "",
    //mat: false,
    //mea: false,
    systemAccess:"3"
  });

  const [errors, setErrors] = useState({});

  const isBranchHead = form.position?.toLowerCase() === "branch head";

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijklmnopqrstuvwxyz";
    let cap = "";
    for (let i = 0; i < 6; i++) cap += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptcha(cap);
  };

  useEffect(() => { generateCaptcha(); }, []);

  const fetchEmployee = async () => {
    if (!ein.trim()) { setFetchError("EIN is required."); return; }
    setFetching(true);
    setFetchError("");
    setFetched(false);
    // Reset auto-filled fields on new fetch 
    setForm(f => ({ ...f, fullName: "", position: "", grade: "",ein:""}));
    try {
      const response = await axios.get(`http://localhost:8080/api/fetchHRMSDetails/${ein.trim()}?type=user`);
      const data = response.data;
      if (!data?.FULL_NAME_TITLE || !data?.POSITION || !data?.GRADE || !data?.EIN)  {
        setFetchError("Failed to load Data From HRMS");
        setFetched(false);
      } else {
        setForm(f => ({
          ...f,
          fullName: data.FULL_NAME_TITLE,
          position: data.POSITION,
          grade: data.GRADE,
          ein:data.EIN
        }));
        setFetched(true);
      }
    } catch (e) {
      // setForm(f => ({ ...f, fullName: "Demo Employee", position: "Officer", grade: "JMGS-I" }));
      setFetchError("Failed to load Data")
      setFetched(false);
    } finally {
      setFetching(false);
    }
  };

  const fetchSupervisor = async () => {
    const supervisorEin = form.supervisorEin.trim();
    const employeeEin = ein.trim();
  
    if (!supervisorEin) { 
      setSupervisorFetchError("Supervisor EIN is required.");
      return; 
    } else if (supervisorEin === employeeEin) {
      setSupervisorFetchError("Supervisor EIN cannot be the same as Employee EIN.");
      setSupervisorFetched(false);
      return; 
    }
    setSupervisorFetchError("");
    setSupervisorFetched(false);
    // Reset auto-filled fields on new fetch
    setForm(f => ({ ...f, supervisorName: "" }));
    try {
      const response = await axios.get(
        `http://localhost:8080/api/fetchHRMSDetails/${form.supervisorEin.trim()}?type=supervisor`
      );
    
      const data = response.data;
    
      // Handle backend status codes
      if (response.status === 200) {
        if (!data?.FULL_NAME_TITLE) {
          setSupervisorFetchError("Failed to load data from HRMS");
          setSupervisorFetched(false);
        } else {
          setForm(f => ({ ...f, supervisorName: data.FULL_NAME_TITLE || "" }));
          setSupervisorFetched(true);
          setSupervisorFetchError(""); // clear any previous error
        }
      } else {
        setSupervisorFetchError(data.message || "Unexpected response from server");
        setSupervisorFetched(false);
      }
    
    } catch (e) {
      if (e.response) {
        // Backend returned an error (e.g. 404, 409)
        const errorData = e.response.data;
        setSupervisorFetchError(errorData.message || "Supervisor not found or not registered");
      } else {
        // Network or unexpected error
        setSupervisorFetchError("Failed to connect to server");
      }
      setSupervisorFetched(false);
    
    } finally {
      setSupervisorFetching(false);
    }
  }
  
  const validate = () => {
    const e = {};
    if (!ein.trim())           e.ein = "EIN is required.";
    else if (!fetched)         e.ein = "Please fetch employee data first.";
    if (!isBranchHead && !form.supervisorEin.trim()) e.supervisorEin = "Supervisor EIN is required.";
    if (!isBranchHead && !supervisorFetched) e.supervisorEin = "Please fetch supervisor data first.";
    if (form.systemAccess==="3") e.access = "Select at least one application.";
    if (!userCaptcha)          e.captcha = "Captcha is required.";
    else if (userCaptcha !== captcha) e.captcha = "Invalid Captcha. Please try again.";
    return e;
  };

  //Registration API Calling
  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { 
      setErrors(e); 
      if (e.captcha) { 
        generateCaptcha(); 
        setUserCaptcha(""); 
      }
      return; 
    }
    try {
      console.log("form: " + JSON.stringify(form, null, 2));
      const response = await axios.post("http://localhost:8080/api/registerUser", form);
    
      // Check backend status code
      if (response.status === 200) {
        alert( "The user has been registered successfully, and the request has been forwarded to the Head for approval.");
        console.log("response:", response.data);
        setErrors({});
        goToLogin();
      } else {
        setFetchError(response.data.message || "Unexpected response from server");
      }
    
    } catch (err) {
      if (err.response) {
        // Handle known backend errors
        const errorData = err.response.data;
        if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            setRegFetchError(errorData.errors.join(", "));
            setErrors({}); 
          } else {
            setRegFetchError(errorData.errors.message || JSON.stringify(errorData.errors));
            setErrors({}); 
          }
        } else if (errorData.message) {
          setRegFetchError(errorData.message);
         // generateCaptcha(); 
         setErrors({});
        } else {
          setRegFetchError("Unknown error occurred");
          setErrors({});
        }
      } else {
        // Network or unexpected error
        setRegFetchError("Request failed: " + err.message);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* IMAGE — left, behind form */}
        <div className="auth-image-side">
          <div className="auth-image-overlay">
            <h3>Merchant Tool</h3>
          </div>
        </div>

        {/* FORM — right, overlaps image */}
        <div className="auth-form-side">
          {/* <div className="auth-logo">
            <div className="auth-logo-icon">M</div>
            <span className="auth-logo-name">MAT</span>
          </div> */}

          <h3 className="auth-heading">Create account</h3>

          {/* EIN + Fetch */}
          <div className="auth-field">
            <label>Employee Identification Number (EIN)<span className="required">*</span></label>
            <div className={`ein-row ${errors.ein ? "ein-error" : fetched ? "ein-success" : ""}`}>
              <input type="text"  placeholder="Enter your EIN" value={ein}
                onChange={e => { setEin(e.target.value); setFetched(false); setErrors(err => ({...err, ein: ""})); }}
                onKeyDown={e => e.key === "Enter" && fetchEmployee()}
              />
              <button className="fetch-btn" onClick={fetchEmployee} disabled={fetching} title="Fetch employee details">
                {fetching ? <FaSpinner className="spin" /> : <FaSearch />}
                <span>{fetching ? "Fetching..." : "Fetch"}</span>
              </button>
            </div>
            {fetchError && <p className="field-error">{fetchError}</p>}
            {errors.ein && <p className="field-error">{errors.ein}</p>}
            {fetched && !errors.ein && <p className="field-success">✓ Data fetched successfully</p>}
          </div>

          {/* Auto-filled fields */}
          <div className="auth-row">
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="name" value={form.fullName} readOnly className="readonly-input" />
            </div>
            
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label>Position</label>
              <input type="text" placeholder="position" value={form.position} readOnly className="readonly-input" />
            </div>
            <div className="auth-field">
              <label>Grade</label>
              <input type="text" placeholder="grade" value={form.grade} readOnly className="readonly-input" />
            </div>
          </div>

          {/* Supervisor EIN — hidden for Branch Head */}
          {!isBranchHead && (
            <>
              <div className="auth-field">
                <label>Supervisor's EIN <span className="required">*</span></label>
                <div className={`ein-row ${errors.supervisorEin ? "ein-error" : supervisorFetched ? "ein-success" : ""}`}>
                  <input type="text"  placeholder="Enter your supervisor's EIN" value={form.supervisorEin}
                    onChange={e => { setForm(f => ({...f, supervisorEin: e.target.value})); setSupervisorFetched(false); setErrors(err => ({...err, supervisorEin: ""})); }}
                    onKeyDown={e => e.key === "Enter" && fetchSupervisor()}
                  />
                  <button className="fetch-btn" onClick={fetchSupervisor} disabled={supervisorFetching} title="Fetch supervisor details">
                    {supervisorFetching ? <FaSpinner className="spin" /> : <FaSearch />}
                    <span>{supervisorFetching ? "Fetching..." : "Fetch"}</span>
                  </button>
                </div>
                {supervisorFetchError && <p className="field-error">{supervisorFetchError}</p>}
                {errors.supervisorEin && <p className="field-error">{errors.supervisorEin}</p>}
                {supervisorFetched && !errors.supervisorEin && <p className="field-success">✓ Supervisor data fetched successfully</p>}
              </div>

              <div className="auth-field">
                <label>Supervisor Name</label>
                <input type="text" placeholder="Supervisor name" value={form.supervisorName} readOnly className="readonly-input" />
              </div>
            </>
          )}


          <div className="auth-field">
            <label>Application Access <span className="required">*</span></label>
            <div className={`app-access-group ${errors.access ? "access-error" : ""}`}>

              {/* MAT */}
              <label className={`app-access-card ${form.systemAccess === 0 ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="systemAccess"   // same name for both options
                  value="0"
                  checked={form.systemAccess === 0}
                  onChange={() => {
                    setForm(prev => ({ ...prev, systemAccess: 0 }));
                    if (errors.access) {
                      setErrors(prev => ({ ...prev, access: "" })); // clear error on change
                    }
                  }}
                />
                <span className="app-check" />
                <span className="app-name">MAT</span>
                <span className="app-desc">Merchant Acquiring Tool</span>
              </label>

              {/* MEA */}
              <label className={`app-access-card ${form.systemAccess === 1 ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="systemAccess"
                  value="1"
                  checked={form.systemAccess === 1}
                  onChange={() => {
                    setForm(prev => ({ ...prev, systemAccess: 1 }));
                    if (errors.access) {
                      setErrors(prev => ({ ...prev, access: "" }));
                    }
                  }}
                />
                <span className="app-check" />
                <span className="app-name">MEA</span>
                <span className="app-desc">Merchant Enablement App</span>
              </label>
            </div>
            {errors.access && <p className="field-error">{errors.access}</p>}
          </div>



          <div className="auth-field">
            <label>Captcha <span className="required">*</span></label>
            <div className="captcha-row">
              <div className="captcha-display">{captcha}</div>
              <button className="captcha-refresh" onClick={generateCaptcha} title="Refresh">↻</button>
            </div>
            <input
              type="text"
              placeholder="Enter captcha above"
              value={userCaptcha}
              onChange={e => setUserCaptcha(e.target.value)}
              className={errors.captcha ? "input-error" : ""}
            />
            {errors.captcha && <p className="field-error">{errors.captcha}</p>}
          </div>

          <button className="auth-btn" onClick={handleRegister}>SIGN UP</button>
          {regFetchError && <p className="field-error">{regFetchError}</p>}

          <p className="auth-switch">
            Already have an account?{" "}
            <span onClick={goToLogin}>Sign in</span>
          </p>

          <p className="auth-footer">Authorized access only · IDBI Bank</p>
        </div>

      </div>
    </div>
  );
}

export default Register;
