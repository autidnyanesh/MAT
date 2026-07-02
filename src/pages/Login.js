import React, { useState, useEffect, useCallback } from "react";
import "../styles/login.css";
import api, { setAccessToken } from "../api/axiosConfig";
import { sanitizeInput } from "../utils/sanitize";
import { aesEncrypt } from "../utils/aesUtil";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [error, setError] = useState("");
  const [pError, setPError] = useState("");
  const [uError, setUError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijklmnopqrstuvwxyz";
    let cap = "";
    for (let i = 0; i < 6; i++)
      cap += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptcha(cap);
    setUserCaptcha("");
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  // Unlock account once lockout period expires
  useEffect(() => {
    if (!lockedUntil) return;
    const remaining = lockedUntil - Date.now();
    if (remaining <= 0) {
      setLockedUntil(null);
      setAttempts(0);
      setError("");
      generateCaptcha();
      return;
    }
    const timer = setTimeout(() => {
      setLockedUntil(null);
      setAttempts(0);
      setError("");
      generateCaptcha();
    }, remaining);
    return () => clearTimeout(timer);
  }, [lockedUntil, generateCaptcha]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const remainingLockSecs = isLocked
    ? Math.ceil((lockedUntil - Date.now()) / 1000)
    : 0;

  const recordFailedAttempt = (currentAttempts) => {
    const next = currentAttempts + 1;
    setAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_MS);
      setError("Too many failed attempts. Account locked for 5 minutes.");
    } else {
      setError(
        `Invalid credentials. ${MAX_ATTEMPTS - next} attempt(s) remaining.`
      );
    }
    generateCaptcha();
  };

  const handleLogin = async () => {
    if (isLocked) return;

    const cleanUsername = sanitizeInput(username);
    const cleanCaptcha = sanitizeInput(userCaptcha);

    if (!cleanUsername) {
      setUError("Please enter User ID");
      return;
    }
    setUError("");

    if (!password) {
      setPError("Please enter Password");
      return;
    }
    setPError("");

    if (cleanCaptcha !== captcha) {
      setError("Invalid captcha. Please try again.");
      generateCaptcha();
      return;
    }
    setError("");

    // ── DUMMY LOGIN (remove before production) ─────────────────
    const DUMMY_USERS = [
      { username: "BU001", password: "pass123", role: "BU", displayName: "BU User", email: "bu@sbi.co.in", sol: "1001", solName: "Mumbai Main", regionName: "West", zoneName: "Zone A" },
      { username: "SOM001", password: "pass123", role: "SOM", displayName: "SOM User", email: "som@sbi.co.in", sol: "1002", solName: "Delhi Main", regionName: "North", zoneName: "Zone B" },
      { username: "BH001", password: "pass123", role: "BH", displayName: "BH User", email: "bh@sbi.co.in", sol: "1003", solName: "Chennai Main", regionName: "South", zoneName: "Zone C" },
      { username: "RH001", password: "pass123", role: "RH", displayName: "RH User", email: "rh@sbi.co.in", sol: "1004", solName: "Kolkata Main", regionName: "East", zoneName: "Zone D" },
      { username: "DCO001", password: "pass123", role: "DCO", displayName: "DCO User", email: "dco@sbi.co.in", sol: "1005", solName: "Pune Main", regionName: "West", zoneName: "Zone A" },
      { username: "AGM001", password: "pass123", role: "AGM", displayName: "AGM User", email: "agm@sbi.co.in", sol: "1006", solName: "Hyderabad", regionName: "South", zoneName: "Zone C" },
      { username: "DGM001", password: "pass123", role: "DGM", displayName: "DGM User", email: "dgm@sbi.co.in", sol: "1007", solName: "Ahmedabad", regionName: "West", zoneName: "Zone A" },
    ];

    const matched = DUMMY_USERS.find(
      (u) => u.username === cleanUsername && u.password === password
    );

    if (matched) {
      setAttempts(0);
      // DUMMY: simulate access token storage
      setAccessToken("dummy-access-token-" + matched.role);
      onLogin({
        username: matched.username,
        displayName: matched.displayName,
        email: matched.email,
        role: matched.role,
        sol: matched.sol,
        solName: matched.solName,
        regionName: matched.regionName,
        zoneName: matched.zoneName,
      });
      return;
    }

    recordFailedAttempt(attempts);
    // ── END DUMMY LOGIN ──────────────────────────────────────────

    // ── REAL API LOGIN (uncomment when backend is ready) ─────────
    // setLoading(true);
    // try {
    //   const encrypted = aesEncrypt(password); // uses MATSECRETKEY2026 internally
    //
    //   const response = await api.post("/api/login", {
    //     username: cleanUsername,
    //     password: encrypted.ciphertext,  // Base64 AES-128-CBC encrypted password
    //     salt:     encrypted.salt,        // Hex — backend: decrypt(salt, iv, passphrase, ciphertext)
    //     iv:       encrypted.iv,          // Hex
    //   });
    //
    //   if (response.status === 200 && response.data) {
    //     setAttempts(0);
    //     setAccessToken(response.data.accessToken);  // store in memory only
    //     onLogin({ ...response.data, username: response.data.username || cleanUsername });
    //   } else {
    //     recordFailedAttempt(attempts);
    //   }
    // } catch {
    //   recordFailedAttempt(attempts);
    // } finally {
    //   setLoading(false);
    // }
    // ── END REAL API LOGIN ────────────────────────────────────────
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* RIGHT — Image panel */}
        <div className="auth-image-side">
          <div className="auth-image-overlay">
            <h3>Merchant Tool</h3>
          </div>
        </div>

        {/* LEFT — Form */}
        <div className="auth-form-side">
          <h3 className="auth-heading">Welcome back</h3>
          <p className="auth-sub">Sign in to your account to continue</p>

          <div className="auth-field">
            <label>User ID</label>
            <input
              type="text"
              placeholder="Enter your User ID"
              value={username}
              maxLength={20}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKey}
              disabled={!!isLocked}
            />
          </div>
          {uError && <p className="auth-error">{uError}</p>}

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              maxLength={50}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
              disabled={!!isLocked}
            />
          </div>
          {pError && <p className="auth-error">{pError}</p>}

          <div className="auth-field">
            <label>Captcha</label>
            <div className="captcha-row">
              <div className="captcha-display">{captcha}</div>
              <button
                type="button"
                className="captcha-refresh"
                onClick={generateCaptcha}
                title="Refresh captcha"
                disabled={!!isLocked}
              >
                ↻
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter captcha above"
              value={userCaptcha}
              maxLength={10}
              autoComplete="off"
              onChange={(e) => setUserCaptcha(e.target.value)}
              onKeyDown={handleKey}
              disabled={!!isLocked}
            />
          </div>

          {error && (
            <p className="auth-error">
              {isLocked
                ? `Account locked. Try again in ${remainingLockSecs}s.`
                : error}
            </p>
          )}

          <button
            className="auth-btn"
            onClick={handleLogin}
            disabled={!!isLocked || loading}
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>

          {/* REMOVE before production */}
          <div
            style={{
              marginTop: "14px",
              padding: "10px 12px",
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#7c5e00",
              lineHeight: "1.7"
            }}
          >
            <strong>🧪 Test Accounts</strong> (password: <code>pass123</code>)<br />
            BU001 · SOM001 · BH001 · RH001 · DCO001 · AGM001 · DGM001
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
