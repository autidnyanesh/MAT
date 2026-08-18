import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/login.css";
import api, { setAccessToken } from "../../api/axiosConfig";
import { sanitizeInput } from "../../utils/sanitize";
import { aesEncrypt } from "../../utils/aesUtil";
import { FaEye, FaEyeSlash, FaSyncAlt, FaLock } from "react-icons/fa";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

// Set REACT_APP_USE_MOCK_LOGIN=false once the backend /api/login and
// /api/auth/captcha endpoints are ready. Defaults to mock mode (true) so
// local frontend dev keeps working without a running backend.
const USE_MOCK_LOGIN = process.env.REACT_APP_USE_MOCK_LOGIN === "true";

/** Shared initial captcha fetch — avoids double GET under React StrictMode. */
let initialCaptchaPromise = null;

const DUMMY_USERS = [
  { username: "BU001", password: "pass123", role: "BU", displayName: "BU User", email: "bu@sbi.co.in", sol: "1001", solName: "Mumbai Main", regionName: "West", zoneName: "Zone A" },
  { username: "SOM001", password: "pass123", role: "SOM", displayName: "SOM User", email: "som@sbi.co.in", sol: "1002", solName: "Delhi Main", regionName: "North", zoneName: "Zone B" },
  { username: "BH001", password: "pass123", role: "BH", displayName: "BH User", email: "bh@sbi.co.in", sol: "1003", solName: "Chennai Main", regionName: "South", zoneName: "Zone C" },
  { username: "RH001", password: "pass123", role: "RH", displayName: "RH User", email: "rh@sbi.co.in", sol: "1004", solName: "Kolkata Main", regionName: "East", zoneName: "Zone D" },
  { username: "DCO001", password: "pass123", role: "DCO", isAdmin: true, ein: "100001", displayName: "ABC Admin", email: "dco@sbi.co.in", sol: "1001", solName: "Pune Main", regionName: "West", zoneName: "Zone A" },
  { username: "DCO002", password: "pass123", role: "DCO", isAdmin: true, ein: "100002", displayName: "XYZ Admin", email: "dco2@sbi.co.in", sol: "1002", solName: "Pune Main", regionName: "West", zoneName: "Zone A" },
  { username: "DCO003", password: "pass123", role: "DCO", isAdmin: false, ein: "100003", displayName: "DCO User", email: "dco3@sbi.co.in", sol: "1005", solName: "Pune Main", regionName: "West", zoneName: "Zone A" },
  { username: "DCOC001", password: "pass123", role: "DCOC", displayName: "DCO Checker", email: "dcoc@sbi.co.in", sol: "1005", solName: "Pune Main", regionName: "West", zoneName: "Zone A" },
  { username: "AGM001", password: "pass123", role: "AGM", displayName: "AGM User", email: "agm@sbi.co.in", sol: "1006", solName: "Hyderabad", regionName: "South", zoneName: "Zone C" },
  { username: "DGM001", password: "pass123", role: "DGM", displayName: "DGM User", email: "dgm@sbi.co.in", sol: "1007", solName: "Ahmedabad", regionName: "West", zoneName: "Zone A" },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Captcha state ──────────────────────────────────────────────────────
  // MOCK MODE: `captchaAnswer` holds the plain-text answer generated and
  //            checked entirely client-side. This is only ever safe for
  //            local dev — the answer necessarily lives in state/DOM, so
  //            it's readable via dev tools. Never treat this as a real
  //            bot defense.
  // REAL MODE: `captchaId` is an opaque token from the backend; the answer
  //            never comes to the client at all. `captchaImage` is a
  //            base64 image the backend renders server-side. The typed
  //            answer is sent to the backend for validation as part of
  //            /api/login — the frontend never checks it itself.
  const [captchaAnswer, setCaptchaAnswer] = useState("");   // mock only
  const [captchaId, setCaptchaId] = useState(null);         // real only
  const [captchaImage, setCaptchaImage] = useState(null);   // real only
  const [captchaLoadError, setCaptchaLoadError] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  const [error, setError] = useState("");
  const [pError, setPError] = useState("");
  const [uError, setUError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("MAT"); // Default MAT

  // ── Get a fresh captcha ──────────────────────────────────────────────────
  // force=false reuses in-flight request (React StrictMode); button uses force=true
  const refreshCaptcha = useCallback(async (force = true) => {
    setUserCaptcha("");
    setCaptchaLoadError("");

    if (USE_MOCK_LOGIN) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijklmnopqrstuvwxyz";
      let cap = "";
      for (let i = 0; i < 6; i++) cap += chars.charAt(Math.floor(Math.random() * chars.length));
      setCaptchaAnswer(cap);
      return;
    }

    try {
      if (force) initialCaptchaPromise = null;
      if (!initialCaptchaPromise) {
        initialCaptchaPromise = api.get("/api/auth/captcha").then((res) => res.data);
      }
      const data = await initialCaptchaPromise;
      setCaptchaId(data?.captchaId || null);
      setCaptchaImage(data?.imageBase64 || null);
    } catch {
      initialCaptchaPromise = null;
      setCaptchaId(null);
      setCaptchaImage(null);
      setCaptchaLoadError("Unable to load captcha. Click refresh to retry.");
    }
  }, []);

  useEffect(() => {
    refreshCaptcha(false);
  }, [refreshCaptcha]);

  // Unlock account once lockout period expires
  useEffect(() => {
    if (!lockedUntil) return;
    const remaining = lockedUntil - Date.now();
    if (remaining <= 0) {
      setLockedUntil(null);
      setAttempts(0);
      setError("");
      refreshCaptcha(true);
      return;
    }
    const timer = setTimeout(() => {
      setLockedUntil(null);
      setAttempts(0);
      setError("");
      refreshCaptcha(true);
    }, remaining);
    return () => clearTimeout(timer);
  }, [lockedUntil, refreshCaptcha]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const remainingLockSecs = isLocked
    ? Math.ceil((lockedUntil - Date.now()) / 1000)
    : 0;

  const recordFailedAttempt = (currentAttempts, message) => {
    const next = currentAttempts + 1;
    setAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_MS);
      setError("Too many failed attempts. Account locked for 5 minutes.");
    } else {
      setError(message || `Invalid credentials. ${MAX_ATTEMPTS - next} attempt(s) remaining.`);
    }
    refreshCaptcha(true);
  };

  const handleLogin = async () => {
    if (isLocked) return;

    const cleanUsername = sanitizeInput(username);
    const cleanCaptcha = sanitizeInput(userCaptcha);

    if (!cleanUsername) { setUError("Please enter your Username (EIN)"); return; }
    setUError("");

    if (!password) { setPError("Please enter Password"); return; }
    setPError("");

    if (!cleanCaptcha) {
      setError("Please enter the captcha");
      return;
    }
    setError("");

    if (USE_MOCK_LOGIN) {
      // Mock mode validates the captcha locally, since there's no backend
      // to check it against.
      if (cleanCaptcha !== captchaAnswer) {
        setError("Invalid captcha. Please try again.");
        refreshCaptcha();
        return;
      }

      const matched = DUMMY_USERS.find(
        (u) => u.username === cleanUsername && u.password === password
      );

      if (matched) {
        setAttempts(0);
        setAccessToken("dummy-access-token-" + matched.role);
        onLogin({
          username: matched.username,
          ein: matched.ein || matched.username,
          displayName: matched.displayName,
          email: matched.email,
          role: matched.role,
          isAdmin: Boolean(matched.isAdmin),
          sol: matched.sol,
          solName: matched.solName,
          regionName: matched.regionName,
          zoneName: matched.zoneName,
          // Login Type on the form decides which app GUI loads first.
          // Mock users can toggle both apps without logging out again.
          activeApp: loginType === "MEA" ? "MEA" : "MAT",
          allowedApps: matched.allowedApps || ["MAT", "MEA"],
        });
      } else {
        recordFailedAttempt(attempts);
      }
      return;
    }

    // Real backend login. Captcha is validated server-side against
    // captchaId — the frontend never sees or checks the expected answer.
    // Password is AES-encrypted client-side to match the backend's
    // expected payload shape — see utils/aesUtil.js for why this is
    // defense-in-depth on top of HTTPS, not a replacement for it.
    setLoading(true);
    try {
      const encrypted = aesEncrypt(password);

      const response = await api.post("/api/login", {
        username: cleanUsername,
        password: encrypted.ciphertext,
        salt: encrypted.salt,
        iv: encrypted.iv,
        captchaId,
        captchaInput: cleanCaptcha,
        application: loginType === "MEA" ? "MEA" : "MAT",
      });

      if (response.status === 200 && response.data?.accessToken) {
        setAttempts(0);
        const { accessToken, ...profile } = response.data;
        setAccessToken(accessToken); // memory only — never put in React state
        const activeApp =
          profile.activeApp ||
          profile.application ||
          (loginType === "MEA" ? "MEA" : "MAT");
        onLogin({
          ...profile,
          username: profile.username || cleanUsername,
          activeApp: activeApp === "MEA" ? "MEA" : "MAT",
          allowedApps: profile.allowedApps || ["MAT", "MEA"],
        });
        return;
      }

      recordFailedAttempt(attempts);
    } catch (err) {
      // Backend is expected to return a specific code for a bad captcha
      // vs bad credentials — adjust this mapping to match your API once
      // it's live. Deliberately generic message otherwise, so a failed
      // login doesn't reveal which part (captcha vs credentials) was wrong.
      const code = err.response?.data?.errorCode;
      if (code === "ACCOUNT_LOCKED") {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError("Too many failed attempts. Account locked for 5 minutes.");
        refreshCaptcha();
      } else if (code === "INVALID_CAPTCHA") {
        recordFailedAttempt(attempts, "Invalid captcha. Please try again.");
      } else {
        recordFailedAttempt(attempts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-card shadow-lg">

        {/* LEFT — signature graphic panel (hidden on small screens) */}
        <div className="auth-graphic-panel d-none d-md-flex flex-column justify-content-between">
          <svg className="auth-graphic-svg" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <line className="edge" x1="200" y1="230" x2="80" y2="90" />
            <line className="edge" x1="200" y1="230" x2="320" y2="80" />
            <line className="edge" x1="200" y1="230" x2="60" y2="300" />
            <line className="edge" x1="200" y1="230" x2="330" y2="330" />
            <line className="edge" x1="200" y1="230" x2="150" y2="400" />
            <line className="edge" x1="200" y1="230" x2="270" y2="410" />
            <path className="pulse" d="M60,300 L200,230" />
            <circle className="node" cx="80" cy="90" r="5" />
            <circle className="node" cx="320" cy="80" r="5" />
            <circle className="node" cx="60" cy="300" r="5" />
            <circle className="node" cx="330" cy="330" r="5" />
            <circle className="node" cx="150" cy="400" r="5" />
            <circle className="node" cx="270" cy="410" r="5" />
            <circle className="node hub" cx="200" cy="230" r="9" />
          </svg>

          <div className="d-flex align-items-center gap-2 position-relative">
            <span className="brand-word">Merchant Terminal</span><br />
          </div>

          <div className="graphic-caption position-relative mb-0">
            <div className="auth-sub-lg">IDBI Bank</div>
            Every branch request routes through maker-checker review before it takes effect.
          </div>
        </div>

        <div className="auth-form-panel">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub mb-3">Sign in to your account to continue</p>

          <div className="mb-3">
            <label className="form-label">Login Type</label>

            <div className="d-flex gap-3">

              {/* MAT */}
              <div
                className={`card ${loginType === "MAT"
                  ? "border-primary bg-primary-subtle shadow-sm"
                  : ""
                  }`}
                style={{
                  cursor: "pointer",
                  width: "95px",
                  height: "40px",
                  transition: "0.2s"
                }}
                onClick={() => setLoginType("MAT")}
              >
                <div className="card-body py-2 text-center">
                  <div>MAT</div>
                </div>
              </div>

              <div
                className={`card ${loginType === "MEA"
                  ? "border-primary bg-primary-subtle shadow-sm"
                  : ""
                  }`}
                style={{
                  cursor: "pointer",
                  width: "95px",
                  height: "40px",
                  transition: "0.2s"
                }}
                onClick={() => setLoginType("MEA")}
              >
                <div className="card-body py-2 text-center">
                  <div>MEA</div>
                </div>
              </div>

            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="username" className="form-label">Username (EIN)</label>
            <input
              id="username"
              type="text"
              className="form-control auth-input"
              placeholder="Enter your Username (EIN)"
              value={username}
              maxLength={20}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKey}
              disabled={!!isLocked}
            />
            {uError && <div className="text-danger small mt-1">{uError}</div>}
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group gap-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control auth-input"
                placeholder="Enter your password"
                value={password}
                maxLength={50}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
                disabled={!!isLocked}
              />
              <button
                type="button"
                className="btn btn-outline-secondary auth-pw-toggle"
                onClick={() => setShowPassword((p) => !p)}
                disabled={!!isLocked}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {pError && <div className="text-danger small mt-1">{pError}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label">Captcha</label>
            <div className="d-flex gap-2 mb-2">
              <div className="auth-captcha-display flex-grow-1">
                {USE_MOCK_LOGIN ? (
                  captchaAnswer
                ) : captchaImage ? (
                  <img
                    // src={`data:image/png;base64,${captchaImage}`}
                    src={captchaImage}
                    alt="Captcha"
                    className="auth-captcha-image"
                  />
                ) : (
                  <span className="text-muted small">{captchaLoadError || "Loading…"}</span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary auth-captcha-refresh"
                onClick={refreshCaptcha}
                title="Refresh captcha"
                aria-label="Refresh captcha"
                disabled={!!isLocked}
              >
                <FaSyncAlt />
              </button>
            </div>
            <input
              type="text"
              className="form-control auth-input"
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
            <div className="alert alert-danger py-2 small mb-3">
              {isLocked ? `Account locked. Try again in ${remainingLockSecs}s.` : error}
            </div>
          )}

          <button
            className="btn auth-btn-signin w-100"
            onClick={handleLogin}
            disabled={!!isLocked || loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="auth-secured">
            <FaLock size={11} className="me-1" />
            Secured session
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;