import { useEffect, useRef, useCallback } from "react";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity
const WARNING_MS = 14 * 60 * 1000; // show warning 1 minute before logout (at the 14-minute mark)

/**
 * Automatically logs out the user after TIMEOUT_MS of inactivity.
 * Resets the timer on any mouse/keyboard/touch activity.
 *
 * @param {Function} onLogout  - called when session expires
 * @param {Function} onWarning - called 1 minute before expiry (optional)
 */
const useSessionTimeout = (onLogout, onWarning) => {
  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();

    if (onWarning) {
      warningTimer.current = setTimeout(onWarning, WARNING_MS);
    }

    logoutTimer.current = setTimeout(() => {
      onLogout();
    }, TIMEOUT_MS);
  }, [clearTimers, onLogout, onWarning]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

    events.forEach((e) => window.addEventListener(e, resetTimers));
    resetTimers();

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, resetTimers));
    };
  }, [resetTimers, clearTimers]);
};

export default useSessionTimeout;