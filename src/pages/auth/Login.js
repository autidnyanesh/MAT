import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/login.css";
import api, { setAccessToken } from "../../api/axiosConfig";
import { sanitizeInput } from "../../utils/sanitize";
import { aesEncrypt } from "../../utils/aesUtil";
import { FaEye, FaEyeSlash, FaSyncAlt, FaLock } from "react-icons/fa";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [captchaId, setCaptchaId] = useState(null);
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaLoadError, setCaptchaLoadError] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  const [error, setError] = useState("");
  const [pError, setPError] = useState("");
  const [uError, setUError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = useCallback(async () => {
    setUserCaptcha("");
    setCaptchaLoadError("");
    setCaptchaImage(null);
    setCaptchaId(null);

    try {
      const res = await api.get("/api/auth/captcha");
      const data = res.data || {};
      const id = data.captchaId || null;
      let image = data.imageBase64 || null;
      if (image && !String(image).startsWith("data:")) {
        image = `data:image/png;base64,${image}`;
      }
      if (!id || !image) {
        setCaptchaLoadError("Unable to load captcha. Click refresh to retry.");
        return;
      }
      setCaptchaId(id);
      setCaptchaImage(image);
    } catch {
      setCaptchaLoadError("Unable to load captcha. Click refresh to retry.");
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleLogin = async () => {
    const cleanUsername = sanitizeInput(username);
    const cleanCaptcha = sanitizeInput(userCaptcha);

    if (!cleanUsername) {
      setUError("Please enter your Username (EIN)");
      return;
    }
    setUError("");

    if (!password) {
      setPError("Please enter Password");
      return;
    }
    setPError("");

    if (!cleanCaptcha) {
      setError("Please enter the captcha");
      return;
    }
    setError("");

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
        application: "MAT",
      });

      if (response.status === 200 && response.data?.accessToken) {
        const profile = response.data;
        setAccessToken(profile.accessToken);
        onLogin({
          ...profile,
          username: profile.username || cleanUsername,
          allowedApps: profile.allowedApps || ["MAT", "MEA"],
        });
        return;
      }

      setError("Invalid credentials. Please try again.");
      refreshCaptcha();
    } catch (err) {
      const code = err.response?.data?.errorCode;
      const message = err.response?.data?.message;
      if (code === "INVALID_CAPTCHA") {
        setError("Invalid captcha. Please try again.");
      } else if (code === "ACCOUNT_LOCKED") {
        setError(message || "Account locked. Try again later.");
      } else if (code === "ALREADY_LOGGED_IN") {
        setError(message || "User already logged in on another system.");
      } else {
        setError(message || "Invalid credentials. Please try again.");
      }
      refreshCaptcha();
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
            <span className="brand-word">Merchant Terminal</span>
          </div>

          <div className="graphic-caption position-relative mb-0">
            <div className="auth-sub-lg">IDBI Bank</div>
            Every branch request routes through maker-checker review before it takes effect.
          </div>
        </div>

        <div className="auth-form-panel">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub mb-3">Sign in to your account to continue</p>

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
              />
              <button
                type="button"
                className="btn btn-outline-secondary auth-pw-toggle"
                onClick={() => setShowPassword((p) => !p)}
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
                {captchaImage ? (
                  <img src={captchaImage} alt="Captcha" className="auth-captcha-image" />
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
            />
          </div>

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <button
            className="btn auth-btn-signin w-100"
            onClick={handleLogin}
            disabled={loading}
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
