import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPS, useApplication } from "../../context/ApplicationContext";
import { APP_BRAND } from "../../config/menuConfig";
import { useAuth } from "../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import useSessionTimeout from "../../hooks/useSessionTimeout";
import AlertModal from "../../components/modals/AlertModal";
import "../../styles/login.css";

function AppSelect() {
  const navigate = useNavigate();
  const { logout, refreshSession } = useAuth();
  const { allowedApps, selectApp, appSelected } = useApplication();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const onIdleWarning = useCallback(() => setShowTimeoutWarning(true), []);
  const onIdleLogout = useCallback(() => {
    setShowTimeoutWarning(false);
    logout();
  }, [logout]);

  const resetIdleTimers = useSessionTimeout(onIdleLogout, onIdleWarning, {
    warningOpen: showTimeoutWarning,
  });

  const staySignedIn = async () => {
    setShowTimeoutWarning(false);
    resetIdleTimers();
    try {
      await refreshSession();
    } catch {
      logout();
    }
  };

  const canMat = allowedApps.includes(APPS.MAT);
  const canMea = allowedApps.includes(APPS.MEA);

  useEffect(() => {
    if (allowedApps.length === 1) {
      selectApp(allowedApps[0]);
    }
  }, [allowedApps, selectApp]);

  useEffect(() => {
    if (appSelected) {
      navigate("/home", { replace: true });
    }
  }, [appSelected, navigate]);

  if (appSelected || allowedApps.length === 1) {
    return null;
  }

  const pick = (app) => {
    if (!allowedApps.includes(app)) return;
    selectApp(app);
    navigate("/home", { replace: true });
  };

  const onPaneKey = (app) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(app);
    }
  };

  return (
    <div className="auth-page app-select-page">
      <AlertModal
        show={showTimeoutWarning}
        type="warning"
        title="Your session is about to expire"
        message="You've been inactive for a while. Click OK to stay signed in."
        onClose={staySignedIn}
      />

      <div className="app-select-shell">
        <div className="app-select-frame">
          <div className="app-select-heading">
            <p className="app-select-kicker">IDBI Bank</p>
            <h1>Choose your workspace</h1>
            <p className="app-select-lede">Select where you want to continue. You can switch later from the navbar.</p>
          </div>

          <div className="app-select-card" role="group" aria-label="Select MAT or MEA">
            <button
              type="button"
              className={`app-select-pane app-select-mat ${canMat ? "" : "is-disabled"}`}
              onClick={() => pick(APPS.MAT)}
              onKeyDown={onPaneKey(APPS.MAT)}
              disabled={!canMat}
              aria-label={`${APP_BRAND.MAT.short} — ${APP_BRAND.MAT.full}`}
            >
              <span className="app-select-accent" aria-hidden="true" />
              <span className="app-select-mark">{APP_BRAND.MAT.short}</span>
              <span className="app-select-code">{APP_BRAND.MAT.short}</span>
              <span className="app-select-name">{APP_BRAND.MAT.full}</span>
              <span className="app-select-desc">
                Terminal onboarding, branch requests, and acquiring workflows.
              </span>
              {canMat ? (
                <span className="app-select-cta">Continue</span>
              ) : (
                <span className="app-select-note">Not available for your role</span>
              )}
            </button>

            <div className="app-select-split" aria-hidden="true">
              <span>or</span>
            </div>

            <button
              type="button"
              className={`app-select-pane app-select-mea ${canMea ? "" : "is-disabled"}`}
              onClick={() => pick(APPS.MEA)}
              onKeyDown={onPaneKey(APPS.MEA)}
              disabled={!canMea}
              aria-label={`${APP_BRAND.MEA.short} — ${APP_BRAND.MEA.full}`}
            >
              <span className="app-select-accent" aria-hidden="true" />
              <span className="app-select-mark">{APP_BRAND.MEA.short}</span>
              <span className="app-select-code">{APP_BRAND.MEA.short}</span>
              <span className="app-select-name">{APP_BRAND.MEA.full}</span>
              <span className="app-select-desc">
                Merchant enablement, onboarding support, and field operations.
              </span>
              {canMea ? (
                <span className="app-select-cta">Continue</span>
              ) : (
                <span className="app-select-note">Not available for your role</span>
              )}
            </button>
          </div>
        </div>

        <button type="button" className="app-select-logout" onClick={logout}>
          <FaSignOutAlt aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default AppSelect;
